const fs = require('fs');
const path = require('path');

// Chemin vers le fichier de données
const dataPath = path.join(__dirname, '../data.json');

// Utilitaire : lire les données
const readData = () => {
  const raw = fs.readFileSync(dataPath, 'utf-8');
  return JSON.parse(raw);
};

// Utilitaire : écrire les données
const writeData = (data) => {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');
};

// GET /todos — Récupérer toutes les tâches
const getAllTodos = (req, res) => {
  try {
    const data = readData();
    res.status(200).json({
      message: 'Tâches récupérées avec succès',
      todos: data.todos
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur lors de la lecture des tâches' });
  }
};

// GET /todos/:id — Récupérer une tâche par son id
const getTodoById = (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = readData();
    const todo = data.todos.find(t => t.id === id);

    if (!todo) {
      return res.status(404).json({ message: 'Tâche introuvable' });
    }

    res.status(200).json({
      message: 'Tâche trouvée',
      todo
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// POST /todos — Créer une nouvelle tâche
const createTodo = (req, res) => {
  try {
    const { title } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({ message: 'Le titre de la tâche est requis' });
    }

    const data = readData();

    // Générer un nouvel id unique
    const newId = data.todos.length > 0
      ? Math.max(...data.todos.map(t => t.id)) + 1
      : 1;

    const newTodo = {
      id: newId,
      title: title.trim(),
      completed: false
    };

    data.todos.push(newTodo);
    writeData(data);

    res.status(201).json({
      message: 'Tâche créée avec succès',
      todo: newTodo
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur lors de la création de la tâche' });
  }
};

// PUT /todos/:id — Modifier une tâche
const updateTodo = (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { title, completed } = req.body;

    const data = readData();
    const index = data.todos.findIndex(t => t.id === id);

    if (index === -1) {
      return res.status(404).json({ message: 'Tâche introuvable' });
    }

    // Mise à jour des champs fournis
    if (title !== undefined) {
      if (title.trim() === '') {
        return res.status(400).json({ message: 'Le titre ne peut pas être vide' });
      }
      data.todos[index].title = title.trim();
    }

    if (completed !== undefined) {
      data.todos[index].completed = Boolean(completed);
    }

    writeData(data);

    res.status(200).json({
      message: 'Tâche mise à jour avec succès',
      todo: data.todos[index]
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur lors de la mise à jour' });
  }
};

// DELETE /todos/:id — Supprimer une tâche
const deleteTodo = (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = readData();
    const index = data.todos.findIndex(t => t.id === id);

    if (index === -1) {
      return res.status(404).json({ message: 'Tâche introuvable' });
    }

    const deleted = data.todos.splice(index, 1)[0];
    writeData(data);

    res.status(200).json({
      message: 'Tâche supprimée avec succès',
      todo: deleted
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur lors de la suppression' });
  }
};

module.exports = {
  getAllTodos,
  getTodoById,
  createTodo,
  updateTodo,
  deleteTodo
};