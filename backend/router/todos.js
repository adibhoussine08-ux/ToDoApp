const express = require('express');
const router = express.Router();
const controller = require('../controller/todos');

// GET    /todos        → Récupérer toutes les tâches
router.get('/todos', controller.getAllTodos);

// GET    /todos/:id    → Récupérer une tâche par id
router.get('/todos/:id', controller.getTodoById);

// POST   /todos        → Créer une tâche
router.post('/todos', controller.createTodo);

// PUT    /todos/:id    → Modifier une tâche
router.put('/todos/:id', controller.updateTodo);

// DELETE /todos/:id    → Supprimer une tâche
router.delete('/todos/:id', controller.deleteTodo);

module.exports = router;