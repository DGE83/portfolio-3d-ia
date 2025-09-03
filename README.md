# Portfolio 3D & IA

Ce projet est un site portfolio complet pour présenter des créations 3D (Blender, Fusion 360) et des visuels générés par IA. Il inclut un panneau d'administration local pour gérer le contenu et un script de build pour générer un site statique, optimisé pour un déploiement sur GitHub Pages.

## ✨ Fonctionnalités

-   **Galeries multiples** : Trois sections distinctes pour Fusion 360, Blender et IA.
-   **Visionneuse 3D interactive** pour les fichiers `.stl` (basée sur Three.js).
-   **Visionneuse multimédia** pour les images et vidéos avec zoom et diaporama (basée sur lightgallery.js).
-   **Panneau d'administration local** : Interface simple pour ajouter, modifier et supprimer des créations (avec Node.js/Express).
-   **Base de données locale** : Utilise SQLite pour une gestion simple des données.
-   **Génération de site statique** : Un script (`npm run build`) génère le site final optimisé dans le dossier `/public`.
-   **Déploiement simple** : Le dossier `/public` est prêt à être déployé sur GitHub Pages.

## 🛠️ Installation

1.  Assurez-vous d'avoir [Node.js](https://nodejs.org/) installé.
2.  Clonez ou téléchargez ce projet.
3.  Ouvrez un terminal à la racine du projet et installez les dépendances :
    ```bash
    npm install
    ```
4.  Initialisez la base de données (à faire une seule fois) :
    ```bash
    npm run db:init
    ```

## 🚀 Utilisation

Pour lancer le serveur d'administration local :
1.  Exécutez le script `start_portfolio.bat`.
2.  Cela lancera le serveur et ouvrira automatiquement le panneau d'administration dans votre navigateur à l'adresse `http://localhost:3000/admin`.
3.  Utilisez l'interface pour ajouter/supprimer vos créations.

Chaque modification dans le panneau d'administration déclenche automatiquement un "build" : le script met à jour le site statique dans le dossier `/public`.

## 🌐 Déploiement sur GitHub Pages

1.  Créez un nouveau dépôt sur GitHub.
2.  Assurez-vous que le contenu du dossier `/public` est à la racine de la branche que vous souhaitez publier (généralement `main`).
3.  Dans les paramètres de votre dépôt GitHub, allez dans la section "Pages" et configurez le déploiement pour servir depuis la branche que vous avez choisie.