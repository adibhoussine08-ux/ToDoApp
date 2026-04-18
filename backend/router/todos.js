const express = require('express');
const router = express.Router();
const controller = require('../controller/todos');

//Récupérer toutes les tâches
router.get('/todos', controller.getAllTodos);

//Récupérer une tâche par id
router.get('/todos/:id', controller.getTodoById);

//Créer une tâche
router.post('/todos', controller.createTodo);

//Modifier une tâche
router.put('/todos/:id', controller.updateTodo);

// Supprimer une tâche
router.delete('/todos/:id', controller.deleteTodo);

module.exports = router;