const API_URL = 'http://localhost:3000';

// ──────────────────────────────────────────────
// Sélection des éléments DOM
// ──────────────────────────────────────────────
const todoList      = document.getElementById('todo-list');
const inputTitle    = document.getElementById('input-title');
const btnAdd        = document.getElementById('btn-add');
const errorMsg      = document.getElementById('error-msg');
const statsTotal    = document.getElementById('stats-total');
const statsDone     = document.getElementById('stats-done');
const statsLeft     = document.getElementById('stats-left');

// ──────────────────────────────────────────────
// Affichage des erreurs / succès
// ──────────────────────────────────────────────
function showError(msg) {
  errorMsg.textContent = msg;
  errorMsg.classList.add('visible');
  setTimeout(() => errorMsg.classList.remove('visible'), 3500);
}

// ──────────────────────────────────────────────
// Mise à jour des statistiques
// ──────────────────────────────────────────────
function updateStats(todos) {
  const total = todos.length;
  const done  = todos.filter(t => t.completed).length;
  statsTotal.textContent = total;
  statsDone.textContent  = done;
  statsLeft.textContent  = total - done;
}

// ──────────────────────────────────────────────
// Rendu d'une tâche dans le DOM
// ──────────────────────────────────────────────
function renderTodo(todo) {
  const li = document.createElement('li');
  li.className = `todo-item${todo.completed ? ' completed' : ''}`;
  li.dataset.id = todo.id;

  li.innerHTML = `
    <label class="todo-check">
      <input type="checkbox" ${todo.completed ? 'checked' : ''} />
      <span class="checkmark"></span>
    </label>
    <span class="todo-title">${escapeHtml(todo.title)}</span>
    <div class="todo-actions">
      <button class="btn-edit" title="Modifier">✏️</button>
      <button class="btn-delete" title="Supprimer">🗑️</button>
    </div>
  `;

  // Checkbox → toggle completed
  li.querySelector('input[type="checkbox"]').addEventListener('change', (e) => {
    toggleTodo(todo.id, e.target.checked);
  });

  // Bouton modifier
  li.querySelector('.btn-edit').addEventListener('click', () => {
    openEditMode(li, todo);
  });

  // Bouton supprimer
  li.querySelector('.btn-delete').addEventListener('click', () => {
    deleteTodo(todo.id, li);
  });

  todoList.appendChild(li);
}

// Sécuriser le HTML (éviter l'injection XSS)
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ──────────────────────────────────────────────
// GET — Charger toutes les tâches
// ──────────────────────────────────────────────
function getAllTodos() {
  todoList.innerHTML = '<li class="loading">Chargement...</li>';

  fetch(`${API_URL}/todos`)
    .then(res => {
      if (!res.ok) throw new Error(`Erreur serveur : ${res.status}`);
      return res.json();
    })
    .then(data => {
      todoList.innerHTML = '';
      if (data.todos.length === 0) {
        todoList.innerHTML = '<li class="empty">Aucune tâche pour le moment 🎉</li>';
      } else {
        data.todos.forEach(todo => renderTodo(todo));
      }
      updateStats(data.todos);
    })
    .catch(err => {
      todoList.innerHTML = '';
      showError('Impossible de récupérer les tâches. Le serveur est-il démarré ?');
      console.error(err);
    });
}

// ──────────────────────────────────────────────
// POST — Créer une tâche
// ──────────────────────────────────────────────
function createTodo() {
  const title = inputTitle.value.trim();

  if (!title) {
    showError('Le titre ne peut pas être vide.');
    inputTitle.focus();
    return;
  }

  fetch(`${API_URL}/todos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title })
  })
    .then(res => {
      if (!res.ok) return res.json().then(d => { throw new Error(d.message); });
      return res.json();
    })
    .then(() => {
      inputTitle.value = '';
      getAllTodos();
    })
    .catch(err => {
      showError(err.message || 'Erreur lors de la création.');
      console.error(err);
    });
}

// ──────────────────────────────────────────────
// PUT — Basculer l'état completed d'une tâche
// ──────────────────────────────────────────────
function toggleTodo(id, completed) {
  fetch(`${API_URL}/todos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completed })
  })
    .then(res => {
      if (!res.ok) return res.json().then(d => { throw new Error(d.message); });
      return res.json();
    })
    .then(() => getAllTodos())
    .catch(err => {
      showError(err.message || 'Erreur lors de la mise à jour.');
      console.error(err);
    });
}

// ──────────────────────────────────────────────
// PUT — Mode édition inline d'une tâche
// ──────────────────────────────────────────────
function openEditMode(li, todo) {
  const titleSpan = li.querySelector('.todo-title');
  const oldTitle  = todo.title;

  // Remplacer le span par un input
  const input = document.createElement('input');
  input.type      = 'text';
  input.value     = oldTitle;
  input.className = 'edit-input';
  titleSpan.replaceWith(input);
  input.focus();

  // Remplacer le bouton edit par un bouton save
  const btnEdit = li.querySelector('.btn-edit');
  btnEdit.textContent = '💾';
  btnEdit.title = 'Enregistrer';

  const save = () => {
    const newTitle = input.value.trim();
    if (!newTitle) {
      showError('Le titre ne peut pas être vide.');
      input.focus();
      return;
    }
    fetch(`${API_URL}/todos/${todo.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle })
    })
      .then(res => {
        if (!res.ok) return res.json().then(d => { throw new Error(d.message); });
        return res.json();
      })
      .then(() => getAllTodos())
      .catch(err => {
        showError(err.message || 'Erreur lors de la modification.');
        console.error(err);
      });
  };

  btnEdit.onclick = save;
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') save();
    if (e.key === 'Escape') getAllTodos(); // annuler
  });
}

function deleteTodo(id, li) {
  // Animation de sortie
  li.classList.add('removing');

  setTimeout(() => {
    fetch(`${API_URL}/todos/${id}`, { method: 'DELETE' })
      .then(res => {
        if (!res.ok) return res.json().then(d => { throw new Error(d.message); });
        return res.json();
      })
      .then(() => getAllTodos())
      .catch(err => {
        showError(err.message || 'Erreur lors de la suppression.');
        console.error(err);
        getAllTodos();
      });
  }, 300);
}

btnAdd.addEventListener('click', createTodo);

inputTitle.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') createTodo();
});
getAllTodos();