const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// --- CONFIGURATION DES CHEMINS ---
const dbPath = path.join(__dirname, '../database/portfolio.db');
const publicDir = path.join(__dirname, '../public');
const assetsDir = path.join(__dirname, '../assets');
const frontendSrcDir = path.join(__dirname, '../frontend_src');

// --- CONNEXION BDD ---
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) { console.error("❌ Erreur de connexion BDD", err.message); return; }
});

// --- FONCTION PRINCIPALE ---
// DANS scripts/build.js
const buildSite = () => {
    console.log("🚀 Lancement du build...");
    
    fs.rmSync(publicDir, { recursive: true, force: true });
    fs.mkdirSync(publicDir, { recursive: true });

    db.all("SELECT * FROM creations ORDER BY created_at DESC", [], (err, creations) => {
        if (err) { console.error("❌ Erreur récupération créations", err.message); return; }
        
        generatePages(creations);

        console.log("   - Copie des assets...");
        fs.cpSync(assetsDir, path.join(publicDir, 'assets'), { recursive: true });
        
        console.log("   - Copie des fichiers frontend...");
        fs.cpSync(frontendSrcDir, publicDir, { recursive: true });
        
        generateSitemap(); // Nous allons créer cette fonction juste après
        
        console.log("✅ Build terminé ! Le dossier /public est prêt.");
        db.close();
    });
};

// --- FONCTIONS UTILITAIRES ---
const generatePages = (creations) => {
    const fusionCreations = creations.filter(c => c.category === 'fusion360');
    const blenderCreations = creations.filter(c => c.category === 'blender');
    const iaCreations = creations.filter(c => c.category === 'ia');
    const recentCreations = creations.slice(0, 4);

    const homeHtml = `${generateHtmlHeader('Accueil', 'index.html')}<h1>Nouveau et débutant dans le monde de la 3D et de l'IA</h1><p>Je m'entraîne sur Blender, Fusion 360 et crée des visuels avec divers outils d'intelligence artificielle. Découvrez mes projets ci-dessous.</p><h2>Dernières créations</h2><div class="gallery-grid" id="gallery-container">${recentCreations.map(c => generateCreationCard(c, true)).join('\n')}</div>${generateHtmlFooter()}`;
    fs.writeFileSync(path.join(publicDir, 'index.html'), homeHtml);

    const fusionHtml = `${generateHtmlHeader('Fusion 360', 'fusion360.html')}<h1>Galerie Technique - Fusion 360</h1><div class="gallery-grid" id="gallery-container">${fusionCreations.map(c => generateCreationCard(c, false)).join('\n')}</div>${generateHtmlFooter()}`;
    fs.writeFileSync(path.join(publicDir, 'fusion360.html'), fusionHtml);
    
    const blenderHtml = `${generateHtmlHeader('Blender', 'blender.html')}<h1>Galerie Artistique - Blender</h1><div class="gallery-grid" id="gallery-container">${blenderCreations.map(c => generateCreationCard(c, true)).join('\n')}</div>${generateHtmlFooter()}`;
    fs.writeFileSync(path.join(publicDir, 'blender.html'), blenderHtml);

    const iaHtml = `${generateHtmlHeader('IA', 'ia.html')}<h1>Galerie IA</h1><div class="gallery-grid" id="gallery-container">${iaCreations.map(c => generateCreationCard(c, true)).join('\n')}</div>${generateHtmlFooter()}`;
    fs.writeFileSync(path.join(publicDir, 'ia.html'), iaHtml);

    const contactHtml = `${generateHtmlHeader('Contact', 'contact.html')}<h1>Contactez-moi</h1><p>Une question, une proposition de projet ou simplement envie de discuter ? N'hésitez pas à utiliser le formulaire ci-dessous.</p><form action="https://formspree.io/f/xgvllgdw" method="POST" class="contact-form"><div class="form-group"><label for="name">Nom</label><input type="text" name="name" id="name" required></div><div class="form-group"><label for="email">Email</label><input type="email" name="email" id="email" required></div><div class="form-group"><label for="subject">Sujet</label><input type="text" name="subject" id="subject" required></div><div class="form-group"><label for="message">Message</label><textarea name="message" id="message" rows="6" required></textarea></div><button type="submit" class="btn-primary">Envoyer</button></form>${generateHtmlFooter()}`;
    fs.writeFileSync(path.join(publicDir, 'contact.html'), contactHtml);
};

const generateCreationCard = (creation, isGalleryItem) => {
    const safeFilePath = creation.file_path.substring(1);
    let thumbnail = `<div class="stl-placeholder">Modèle 3D STL</div>`;
    if (creation.file_type === 'image') {
        thumbnail = `<img src="${safeFilePath}" alt="${creation.title}" loading="lazy">`;
    } else if (creation.file_type === 'video') {
        thumbnail = `<video muted loop><source src="${safeFilePath}" type="video/mp4"></video>`;
    }

    if (isGalleryItem && (creation.file_type === 'image' || creation.file_type === 'video')) {
        return `<a class="card gallery-item" href="${safeFilePath}" data-sub-html="<h4>${creation.title}</h4><p>${creation.description}</p>"><div class="card-thumbnail">${thumbnail}</div><div class="card-content"><h3>${creation.title}</h3></div></a>`;
    }
    if (creation.file_type === 'stl') {
        return `<div class="card stl-card" data-file-path="${safeFilePath}"><div class="card-thumbnail">${thumbnail}</div><div class="card-content"><h3>${creation.title}</h3><p>${creation.description}</p></div></div>`;
    }
    return `<div class="card"><div class="card-thumbnail">${thumbnail}</div><div class="card-content"><h3>${creation.title}</h3><p>${creation.description}</p></div></div>`;
};
// DANS scripts/build.js
const generateHtmlHeader = (pageTitle, currentPage) => {
    // À PERSONNALISER
    const siteName = "Portfolio 3D & IA de Votre Nom";
    const siteDescription = "Découvrez mes créations 3D avec Blender et Fusion 360, et mes projets visuels générés par Intelligence Artificielle.";
    const siteKeywords = "portfolio, 3d, blender, fusion 360, ia, intelligence artificielle, artiste 3d";
    const authorName = "Votre Nom"; // Mettez votre nom ici

    const navLinks = [
        { href: 'index.html', text: 'Accueil' }, { href: 'fusion360.html', text: 'Fusion 360' },
        { href: 'blender.html', text: 'Blender' }, { href: 'ia.html', text: 'IA' }, { href: 'contact.html', text: 'Contact' }
    ];
    const navHtml = navLinks.map(link => `<a href="${link.href}" class="${currentPage === link.href ? 'active' : ''}">${link.text}</a>`).join('\n');
    
    // Données structurées pour Google (JSON-LD)
    const structuredData = `
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Person",
      "name": "${authorName}",
      "url": "https://DGE83.github.io",
      "description": "${siteDescription}"
    }
    </script>`;

    return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${pageTitle} - ${siteName}</title>
    <meta name="description" content="${siteDescription}">
    <meta name="keywords" content="${siteKeywords}">
    <meta name="author" content="${authorName}">
    <meta property="og:title" content="${pageTitle} - ${siteName}">
    <meta property="og:description" content="${siteDescription}">
    <meta property="og:type" content="website">

    ${structuredData}

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=Open+Sans:wght@400;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/lightgallery.css">
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <header class="main-header">
        <div class="logo">${authorName}</div>
        <nav class="main-nav">${navHtml}</nav>
    </header>
    <main class="container">`;
};


const generateHtmlFooter = () => `</main><script src="js/lightgallery.min.js"></script><script src="plugins/lg-thumbnail.min.js"></script><script src="plugins/lg-zoom.min.js"></script><script src="js/three/three.min.js"></script><script src="js/three/STLLoader.js"></script><script src="js/three/OrbitControls.js"></script><script src="js/viewer3d.js"></script><script>
        const galleryContainer = document.getElementById('gallery-container');
        if (galleryContainer) {
            lightGallery(galleryContainer, { plugins: [lgZoom, lgThumbnail], selector: '.gallery-item', download: false });
        }
    </script></body></html>`;

// --- LANCEMENT DU SCRIPT ---
// CETTE LIGNE EST ESSENTIELLE ! C'est la clé de contact qui exécute tout.
buildSite();

// DANS scripts/build.js
const generateSitemap = () => {
    console.log("   - Génération du sitemap.xml...");
    // À PERSONNALISER
    const siteUrl = "https://VOTRE_NOM_UTILISATEUR.github.io"; 

    const pages = ['index.html', 'fusion360.html', 'blender.html', 'ia.html', 'contact.html'];
    const today = new Date().toISOString().split('T')[0];

    const sitemapContent = `
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${pages.map(page => `
    <url>
        <loc>${siteUrl}/${page}</loc>
        <lastmod>${today}</lastmod>
        <priority>${page === 'index.html' ? '1.0' : '0.8'}</priority>
    </url>`).join('')}
</urlset>`;
    
    fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapContent.trim());
};