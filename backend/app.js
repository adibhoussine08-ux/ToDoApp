const express = require('express');
const cors = require('cors');

const app = express();
const port = 3000;

// ──────────────────────────────────────────────
// Middlewares
// ──────────────────────────────────────────────

// Autoriser les requêtes cross-origin (depuis le frontend)
app.use(cors({ origin: '*' }));

// Parser le body des requêtes en JSON
app.use(express.json());

// ──────────────────────────────────────────────
// Routes
// ──────────────────────────────────────────────
const todosRoutes = require('./router/todos');
app.use(todosRoutes);

// Route par défaut
app.get('/', (req, res) => {
  res.status(200).json({ message: 'API Todo App — Serveur en ligne ✅' });
});

// Gestion des routes inexistantes (404)
app.use((req, res) => {
  res.status(404).json({ message: 'Route introuvable' });
});

// ──────────────────────────────────────────────
// Démarrage du serveur
// ──────────────────────────────────────────────
app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:8080`);
});