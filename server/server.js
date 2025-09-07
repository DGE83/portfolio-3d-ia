const express = require('express');
const path = require('path');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const { exec } = require('child_process'); // <--- 1. ON IMPORTE LE MODULE NÉCESSAIRE

// --- CONFIGURATION ---
const app = express();
const PORT = 3000;
const db = new sqlite3.Database(path.join(__dirname, '../database/portfolio.db'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers statiques
app.use('/admin', express.static(path.join(__dirname, '../admin')));
app.use('/assets', express.static(path.join(__dirname, '../assets')));

// --- CONFIGURATION DE MULTER ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const category = req.body.category;
        const dest = path.join(__dirname, `../assets/${category}/`);
        cb(null, dest);
    },
    filename: function (req, file, cb) {
        const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        
        // Nettoyage et "sanétisation" du nom de fichier original
        const sanitizedFilename = file.originalname
            .toLowerCase() // 1. Tout mettre en minuscules
            .replace(/\s+/g, '-') // 2. Remplacer les espaces par des tirets
            .replace(/[éèêë]/g, 'e') // Remplacer les caractères accentués (exemple)
            .replace(/[^a-z0-9-.]/g, ''); // 3. Supprimer tous les caractères non autorisés (sauf lettres, chiffres, tirets et points)
        
        cb(null, uniquePrefix + '-' + sanitizedFilename);
        
        }
});
const upload = multer({ storage: storage });


// --- 2. FONCTION POUR LANCER LE BUILD AUTOMATIQUE ---
const triggerBuild = () => {
    console.log('⚙️  Changement détecté, lancement du build automatique...');
    exec('npm run build', (error, stdout, stderr) => {
        if (error) {
            console.error(`❌ Erreur lors du build: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`❌ Erreur (stderr) lors du build: ${stderr}`);
            return;
        }
        console.log(`✅ Build automatique terminé avec succès !`);
        console.log(stdout);
    });
};


// --- ROUTES DE L'API ---

// [GET] Récupérer toutes les créations
app.get('/api/creations', (req, res) => {
    db.all("SELECT * FROM creations ORDER BY created_at DESC", [], (err, rows) => {
        if (err) { res.status(500).json({ error: err.message }); return; }
        res.json({ creations: rows });
    });
});

// [POST] Ajouter une nouvelle création
app.post('/api/creations', upload.single('file'), (req, res) => {
    // ... (code existant, pas de changement ici)
    const { title, description, category, metadata } = req.body;
    const file = req.file;
    if (!title || !description || !category || !file) {
        return res.status(400).json({ error: "Tous les champs sont requis." });
    }
    const filePath = `assets/${category}/${file.filename}`;
    const fileExtension = path.extname(file.originalname).toLowerCase();
    let fileType;
    if (['.jpg', '.jpeg', '.png', '.gif'].includes(fileExtension)) fileType = 'image';
    else if (['.mp4', '.webm'].includes(fileExtension)) fileType = 'video';
    else if (fileExtension === '.stl') fileType = 'stl';
    else return res.status(400).json({ error: "Type de fichier non supporté." });

    const sql = `INSERT INTO creations (title, description, category, file_path, file_type, metadata) VALUES (?, ?, ?, ?, ?, ?)`;
    const params = [title, description, category, filePath, fileType, metadata];

    db.run(sql, params, function(err) {
        if (err) { res.status(500).json({ error: err.message }); return; }
        res.json({ message: "Création ajoutée avec succès !", id: this.lastID });
        triggerBuild(); // <--- 3. ON LANCE LE BUILD APRÈS L'AJOUT
    });
});

// [DELETE] Supprimer une création
app.delete('/api/creations/:id', (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM creations WHERE id = ?`, id, function(err) {
        if (err) { res.status(500).json({ error: err.message }); return; }
        if (this.changes > 0) {
            res.json({ message: `Création ${id} supprimée.` });
            triggerBuild(); // <--- 3. ON LANCE LE BUILD APRÈS LA SUPPRESSION
        } else {
            res.status(404).json({ message: "Création non trouvée." });
        }
    });
});

// --- ROUTES DE PAGE ---
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '../admin/index.html'));
});
app.get('/', (req, res) => { res.redirect('/admin'); });

// --- DÉMARRAGE DU SERVEUR ---
app.listen(PORT, () => {
    console.log(`🚀 Serveur d'administration démarré !`);
    console.log(`   Accès local : http://localhost:${PORT}/admin`);
});