document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('creation-form');
    const creationsList = document.getElementById('creations-list');

    // --- Fonction pour afficher les créations ---
    const fetchCreations = async () => {
        try {
            const response = await fetch('/api/creations');
            if (!response.ok) throw new Error('Erreur réseau');
            const data = await response.json();
            
            creationsList.innerHTML = ''; // Vide la liste avant de la remplir
            
            if (data.creations.length === 0) {
                creationsList.innerHTML = '<p>Aucune création pour le moment.</p>';
            } else {
                data.creations.forEach(creation => {
                    const item = document.createElement('div');
                    item.className = 'creation-item';
                    item.innerHTML = `
                        <div class="creation-item-info">
                            <strong>${creation.title}</strong>
                            <span>${creation.category}</span>
                        </div>
                        <button class="btn-delete" data-id="${creation.id}">Supprimer</button>
                    `;
                    creationsList.appendChild(item);
                });
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des créations:", error);
            creationsList.innerHTML = '<p>Impossible de charger les créations.</p>';
        }
    };

    // --- Gestion de la soumission du formulaire ---
    form.addEventListener('submit', async (e) => {
        e.preventDefault(); // Empêche le rechargement de la page

        // FormData est spécial pour gérer les formulaires avec des fichiers
        const formData = new FormData(form);

        try {
            const response = await fetch('/api/creations', {
                method: 'POST',
                body: formData // Pas besoin de 'Content-Type', le navigateur le fait pour nous avec FormData
            });

            if (response.ok) {
                form.reset(); // Vide le formulaire
                fetchCreations(); // Met à jour la liste
                alert('Création ajoutée avec succès !');
            } else {
                const errorData = await response.json();
                alert(`Erreur: ${errorData.error || 'Une erreur est survenue.'}`);
            }
        } catch (error) {
            console.error("Erreur lors de l'ajout:", error);
            alert('Une erreur de connexion est survenue.');
        }
    });

    // --- Gestion de la suppression ---
    creationsList.addEventListener('click', async (e) => {
        if (e.target.classList.contains('btn-delete')) {
            const id = e.target.dataset.id;
            if (confirm(`Voulez-vous vraiment supprimer la création n°${id} ?`)) {
                try {
                    const response = await fetch(`/api/creations/${id}`, {
                        method: 'DELETE'
                    });

                    if (response.ok) {
                        fetchCreations(); // Met à jour la liste
                        alert('Création supprimée.');
                    } else {
                         alert('Erreur lors de la suppression.');
                    }
                } catch (error) {
                     console.error("Erreur de suppression:", error);
                     alert('Une erreur de connexion est survenue.');
                }
            }
        }
    });

    // --- Premier chargement des créations ---
    fetchCreations();
});