// Ce script gère la visionneuse 3D pour les fichiers STL

// On encapsule tout dans une fonction pour éviter de polluer l'espace global
function setupSTLViewer() {
    // On sélectionne toutes les cartes qui contiennent un fichier STL
    const stlCards = document.querySelectorAll('.stl-card');

    // S'il n'y a aucune carte STL sur la page, on ne fait rien
    if (stlCards.length === 0) {
        return;
    }

    // --- Variables globales pour la scène 3D ---
    let camera, scene, renderer, controls, mesh;

    // --- Création de la modale (pop-up) qui contiendra la visionneuse ---
    const modal = document.createElement('div');
    modal.id = 'stl-viewer-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-button">&times;</span>
            <div id="viewer-container"></div>
            <div class="controls-panel">
                <button id="reset-view">Vue Initiale</button>
                <button id="fullscreen-btn">Plein Écran</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    const closeButton = modal.querySelector('.close-button');
    const viewerContainer = modal.querySelector('#viewer-container');
    const resetButton = modal.querySelector('#reset-view');
    const fullscreenButton = modal.querySelector('#fullscreen-btn');

    // --- Initialisation de la scène Three.js ---
    function init3DScene() {
        // Scène
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x121212); // Fond sombre

        // Caméra
        camera = new THREE.PerspectiveCamera(75, viewerContainer.clientWidth / viewerContainer.clientHeight, 0.1, 1000);
        camera.position.set(50, 50, 50);

        // Renderer
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(viewerContainer.clientWidth, viewerContainer.clientHeight);
        viewerContainer.appendChild(renderer.domElement);

        // Lumières
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(100, 100, 100);
        scene.add(directionalLight);

        // Contrôles
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;

        // Grille et Axes
        const gridHelper = new THREE.GridHelper(100, 10);
        scene.add(gridHelper);
        const axesHelper = new THREE.AxesHelper(10);
        scene.add(axesHelper);

        // Boucle d'animation
        function animate() {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        }
        animate();
    }

    // --- Chargement d'un modèle STL ---
    function loadSTL(filePath) {
        // Si un modèle précédent existe, on le retire de la scène
        if (mesh) {
            scene.remove(mesh);
        }

        const loader = new THREE.STLLoader();
        loader.load(filePath, function (geometry) {
            const material = new THREE.MeshStandardMaterial({ color: 0x0066CC, flatShading: true });
            mesh = new THREE.Mesh(geometry, material);

            // Centrer la géométrie
            geometry.center();

            scene.add(mesh);
        });
    }

    // --- Gestion des événements ---
    stlCards.forEach(card => {
        card.addEventListener('click', () => {
            const filePath = card.dataset.filePath;
            modal.style.display = 'flex';
            if (!renderer) { // On initialise la scène seulement la première fois
                init3DScene();
            }
            loadSTL(filePath);
        });
    });

    closeButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    resetButton.addEventListener('click', () => {
        controls.reset();
        camera.position.set(50, 50, 50);
    });
    
    fullscreenButton.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            viewerContainer.requestFullscreen().catch(err => {
                alert(`Erreur en passant en plein écran: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    });

    // Redimensionner le canvas si la fenêtre change de taille
    window.addEventListener('resize', () => {
        if (renderer) {
            camera.aspect = viewerContainer.clientWidth / viewerContainer.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(viewerContainer.clientWidth, viewerContainer.clientHeight);
        }
    });
}

// On attend que le DOM soit chargé pour exécuter le script
document.addEventListener('DOMContentLoaded', setupSTLViewer);