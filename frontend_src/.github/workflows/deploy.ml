name: Deploy to GitHub Pages

# Déclenchement du workflow à chaque push sur la branche 'main'
on:
  push:
    branches:
      - main

# Permissions pour permettre le déploiement
permissions:
  contents: read
  pages: write
  id-token: write

# Tâches à exécuter
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout 🛎️
        uses: actions/checkout@v4

      - name: Setup Node.js ⚙️
        uses: actions/setup-node@v4
        with:
          node-version: '18' # Utilise Node.js version 18
          cache: 'npm'

      - name: Install Dependencies 📦
        run: npm install

      - name: Build Project 🏗️
        run: npm run build

      - name: Setup Pages 🛠️
        uses: actions/configure-pages@v5
      
      - name: Upload artifact ⬆️
        uses: actions/upload-pages-artifact@v3
        with:
          path: './public'
          
      - name: Deploy to GitHub Pages 🚀
        id: deployment
        uses: actions/deploy-pages@v4