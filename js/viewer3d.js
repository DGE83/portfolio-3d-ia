document.addEventListener('DOMContentLoaded', function() {
    // On sélectionne toutes les cartes qui contiennent un fichier STL
    const stlCards = document.querySelectorAll('.stl-card');

    // S'il n'y a aucune carte STL sur la page, on ne fait rien
    if (stlCards.length === 0) {
        return;
    }

    // --- Variables globales pour la scène 3D ---
    let camera, scene, renderer, controls, mesh;
    let modal, viewerContainer;

    // --- Création de la modale ---
    function createModal() {
        modal = document.createElement('div');
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
        viewerContainer = modal.querySelector('#viewer-container');

        // Événements de la modale
        modal.querySelector('.close-button').addEventListener('click', closeModal);
        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                closeModal();
            }
        });
        modal.querySelector('#reset-view').addEventListener('click', resetView);
        modal.querySelector('#fullscreen-btn').addEventListener('click', toggleFullscreen);
    }

    function openModal(filePath) {
        modal.style.display = 'flex';
        // On initialise la scène seulement si elle n'a jamais été créée
        if (!renderer) {
            init3DScene();
        }

// Ajout d'un petit délai pour s'assurer que la modale a pris sa taille avant de charger le modèle
    setTimeout(() => {
        if (renderer) { // Vérifier que le renderer existe après init3DScene
            renderer.setSize(viewerContainer.clientWidth, viewerContainer.clientHeight);
            camera.aspect = viewerContainer.clientWidth / viewerContainer.clientHeight;
            camera.updateProjectionMatrix();
        }
        loadSTL(filePath);
    }, 50); // Petit délai de 50ms
        
        loadSTL(filePath);
    }
    
    function closeModal() {
        modal.style.display = 'none';
    }

    // --- Scène Three.js ---
    function init3DScene() {
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x121212);
        camera = new THREE.PerspectiveCamera(75, viewerContainer.clientWidth / viewerContainer.clientHeight, 0.1, 1000);
        
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(viewerContainer.clientWidth, viewerContainer.clientHeight);
        viewerContainer.appendChild(renderer.domElement);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(100, 100, 100);
        scene.add(directionalLight);

        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        resetView(); // Positionne la caméra initialement

        const gridHelper = new THREE.GridHelper(200, 20);
        scene.add(gridHelper);
        const axesHelper = new THREE.AxesHelper(20);
        scene.add(axesHelper);

        animate();
    }
    
    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }

    function loadSTL(filePath) {
        if (mesh) {
            scene.remove(mesh);
        }
        const loader = new THREE.STLLoader();
        loader.load(filePath, function (geometry) {
            const material = new THREE.MeshStandardMaterial({ color: 0x0066CC, flatShading: false });
            mesh = new THREE.Mesh(geometry, material);
            geometry.center();
            scene.add(mesh);
            resetView();
        });
    }

    // --- Fonctions de contrôle ---
    function resetView(){
        if(controls){
           controls.reset();
           camera.position.set(50, 50, 50);
           controls.target.set(0, 0, 0);
        }
    }

    function toggleFullscreen(){
        if (!document.fullscreenElement) {
            viewerContainer.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }
    
    // Redimensionnement
    window.addEventListener('resize', () => {
        if (renderer) {
            camera.aspect = viewerContainer.clientWidth / viewerContainer.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(viewerContainer.clientWidth, viewerContainer.clientHeight);
        }
    });

    // --- Point d'entrée ---
    createModal(); // Crée la modale (elle est cachée)
    stlCards.forEach(card => {
        card.addEventListener('click', () => {
            const filePath = card.dataset.filePath;
            openModal(filePath);
        });
    });
});