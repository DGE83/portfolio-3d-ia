// Importe le module sqlite3. Le mode VERBOSE est utile pour obtenir des logs détaillés.
const sqlite3 = require('sqlite3').verbose();

// Chemin vers le fichier de la base de données.
const dbPath = './database/portfolio.db';

// Crée une nouvelle instance de la base de données.
// Le fichier portfolio.db sera créé s'il n'existe pas.
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Erreur lors de la connexion à la base de données :", err.message);
  } else {
    console.log("Connecté à la base de données SQLite 'portfolio.db'.");
  }
});

// serialize() garantit que les commandes s'exécutent séquentiellement.
db.serialize(() => {
  // Commande SQL pour créer la table 'creations'.
  // IF NOT EXISTS empêche une erreur si la table existe déjà.
  const sql = `
  CREATE TABLE IF NOT EXISTS creations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK(category IN ('fusion360', 'blender', 'ia')),
    file_path TEXT NOT NULL,
    file_type TEXT NOT NULL CHECK(file_type IN ('stl', 'image', 'video')),
    metadata TEXT, -- Champ flexible pour des données supplémentaires (ex: outil IA)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  `;

  // Exécute la commande de création de table.
  db.run(sql, (err) => {
    if (err) {
      console.error("Erreur lors de la création de la table :", err.message);
    } else {
      console.log("Table 'creations' créée ou déjà existante avec succès.");
    }
  });
});

// Ferme la connexion à la base de données une fois les opérations terminées.
db.close((err) => {
  if (err) {
    console.error("Erreur lors de la fermeture de la base de données :", err.message);
  } else {
    console.log("Connexion à la base de données fermée.");
  }
});