// On importe le module 'fs' pour lire et écrire des fichiers
const fs = require('fs');

// On importe 'path' pour gérer les chemins de fichiers
const path = require('path');

// On construit le chemin vers le fichier data.json
const dataPath = path.join(__dirname, '../data.json');


// -----------------------------
// FONCTIONS UTILITAIRES
// -----------------------------

// Fonction pour lire les données dans data.json
const readData = () => {
  // On lit le fichier en texte
  const raw = fs.readFileSync(dataPath, 'utf-8');

  // On transforme le texte JSON en objet JavaScript
  return JSON.parse(raw);
};

// Fonction pour écrire des données dans data.json
const writeData = (data) => {
  // On réécrit le fichier avec les nouvelles données
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');
};
// CONTROLLERS DES ROUTE

// GET /todos — récupérer toutes les tâches
const getAllTodos = (req, res) => {
  try {
    // On lit les données
    const data = readData();

    // On renvoie la liste des tâches
    res.status(200).json({
      message: 'Tâches récupérées avec succès',
      todos: data.todos
    });
  } catch (error) {
    // Si erreur serveur
    res.status(500).json({ message: 'Erreur serveur lors de la lecture des tâches' });
  }
};


// GET /todos/:id — récupérer une tâche par son id
const getTodoById = (req, res) => {
  try {
    // On récupère l'id dans l'URL et on le convertit en nombre
    const id = parseInt(req.params.id);

    // On lit les données
    const data = readData();

    // On cherche la tâche qui a cet id
    const todo = data.todos.find(t => t.id === id);

    // Si aucune tâche trouvée
    if (!todo) {
      return res.status(404).json({ message: 'Tâche introuvable' });
    }

    // Sinon on renvoie la tâche
    res.status(200).json({
      message: 'Tâche trouvée',
      todo
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};


// POST /todos — créer une nouvelle tâche
const createTodo = (req, res) => {
  try {
    // On récupère le titre envoyé dans le body
    const { title } = req.body;

    // Vérification : le titre ne doit pas être vide
    if (!title || title.trim() === '') {
      return res.status(400).json({ message: 'Le titre de la tâche est requis' });
    }

    // On lit les données actuelles
    const data = readData();

    // On génère un nouvel id unique
    const newId = data.todos.length > 0
      ? Math.max(...data.todos.map(t => t.id)) + 1
      : 1;

    // On crée la nouvelle tâche
    const newTodo = {
      id: newId,
      title: title.trim(),
      completed: false
    };

    // On ajoute la tâche dans la liste
    data.todos.push(newTodo);

    // On sauvegarde dans le fichier
    writeData(data);

    // On renvoie la réponse
    res.status(201).json({
      message: 'Tâche créée avec succès',
      todo: newTodo
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur lors de la création de la tâche' });
  }
};


// PUT /todos/:id — modifier une tâche
const updateTodo = (req, res) => {
  try {
    // On récupère l'id dans l'URL
    const id = parseInt(req.params.id);

    // On récupère les champs envoyés dans le body
    const { title, completed } = req.body;

    // On lit les données
    const data = readData();

    // On cherche l'index de la tâche
    const index = data.todos.findIndex(t => t.id === id);

    // Si la tâche n'existe pas
    if (index === -1) {
      return res.status(404).json({ message: 'Tâche introuvable' });
    }

    // Si un titre est envoyé, on le met à jour
    if (title !== undefined) {
      if (title.trim() === '') {
        return res.status(400).json({ message: 'Le titre ne peut pas être vide' });
      }
      data.todos[index].title = title.trim();
    }

    // Si completed est envoyé, on le met à jour
    if (completed !== undefined) {
      data.todos[index].completed = Boolean(completed);
    }

    // On sauvegarde les modifications
    writeData(data);

    // On renvoie la tâche mise à jour
    res.status(200).json({
      message: 'Tâche mise à jour avec succès',
      todo: data.todos[index]
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur lors de la mise à jour' });
  }
};


// DELETE /todos/:id — supprimer une tâche
const deleteTodo = (req, res) => {
  try {
    // On récupère l'id
    const id = parseInt(req.params.id);

    // On lit les données
    const data = readData();

    // On cherche l'index de la tâche
    const index = data.todos.findIndex(t => t.id === id);

    // Si pas trouvée
    if (index === -1) {
      return res.status(404).json({ message: 'Tâche introuvable' });
    }

    // On supprime la tâche
    const deleted = data.todos.splice(index, 1)[0];

    // On sauvegarde
    writeData(data);

    // On renvoie la tâche supprimée
    res.status(200).json({
      message: 'Tâche supprimée avec succès',
      todo: deleted
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur lors de la suppression' });
  }
};


// On exporte toutes les fonctions pour pouvoir les utiliser dans les routes
module.exports = {
  getAllTodos,
  getTodoById,
  createTodo,
  updateTodo,
  deleteTodo
};
