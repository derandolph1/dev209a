const API_URL = 'http://localhost:3000'; // Node API URL
let isLoginMode = true;

// --- DOM Elements ---
const authSection = document.getElementById('auth-section');
const mainSection = document.getElementById('main-section');
const todoList = document.getElementById('todo-list');
const authForm = document.getElementById('auth-form');
const todoForm = document.getElementById('todo-form');

// --- Initialization ---
window.onload = () => {
    if (getCookie('authToken')) {
        showDashboard();
    }
};

// --- Authentication Logic ---
function toggleAuthMode() {
    isLoginMode = !isLoginMode;
    document.getElementById('auth-title').innerText = isLoginMode ? 'Login' : 'Register';
    document.getElementById('auth-submit').innerText = isLoginMode ? 'Login' : 'Register';
    document.getElementById('auth-toggle').innerHTML = isLoginMode 
        ? "Don't have an account? <span onclick='toggleAuthMode()'>Register here</span>"
        : "Already have an account? <span onclick='toggleAuthMode()'>Login here</span>";
}

authForm.onsubmit = async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const endpoint = isLoginMode ? '/login' : '/register';

    try {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();

        if (res.ok) {
            if (isLoginMode) {
                document.cookie = `authToken=${data.token}; path=/; max-age=86400`; // 24h
                showDashboard();
            } else {
                alert('Registration successful! Please login.');
                toggleAuthMode();
            }
        } else {
            alert(data.message || 'Authentication failed');
        }
    } catch (err) {
        console.error('Error:', err);
    }
};

function logout() {
    document.cookie = "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    mainSection.classList.add('hidden');
    authSection.classList.remove('hidden');
    todoList.innerHTML = '';
}

// --- Todo Logic ---
async function fetchTodos() {
    const res = await fetch(`${API_URL}/todos`, {
        headers: { 'Authorization': `Bearer ${getCookie('authToken')}` }
    });
    const todos = await res.json();
    renderTodos(todos);
}

function renderTodos(todos) {
    todoList.innerHTML = todos.map(todo => `
        <li class="${todo.completed ? 'completed' : ''}">
            <strong>${todo.title}</strong>
            <p>${todo.description || ''}</p>
            <div class="actions">
                <button onclick="toggleComplete('${todo.id}', ${todo.completed})">
                    ${todo.completed ? 'Undo' : 'Complete'}
                </button>
                <button onclick="editTodoTrigger('${todo.id}', '${todo.title}', '${todo.description}')">Edit</button>
                <button style="background:red" onclick="deleteTodo('${todo.id}')">Delete</button>
            </div>
        </li>
    `).join('');
}

todoForm.onsubmit = async (e) => {
    e.preventDefault();
    const id = document.getElementById('todo-id').value;
    const title = document.getElementById('todo-title').value;
    const description = document.getElementById('todo-desc').value;
    
    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_URL}/todos/${id}` : `${API_URL}/todos`;

    await fetch(url, {
        method,
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getCookie('authToken')}`
        },
        body: JSON.stringify({ title, description })
    });

    resetTodoForm();
    fetchTodos();
};

async function deleteTodo(id) {
    await fetch(`${API_URL}/todos/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getCookie('authToken')}` }
    });
    fetchTodos();
}

async function toggleComplete(id, currentStatus) {
    await fetch(`${API_URL}/todos/${id}`, {
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getCookie('authToken')}`
        },
        body: JSON.stringify({ completed: !currentStatus })
    });
    fetchTodos();
}

// --- Helpers ---
function showDashboard() {
    authSection.classList.add('hidden');
    mainSection.classList.remove('hidden');
    fetchTodos();
}

function editTodoTrigger(id, title, desc) {
    document.getElementById('todo-id').value = id;
    document.getElementById('todo-title').value = title;
    document.getElementById('todo-desc').value = desc;
    document.getElementById('todo-submit').innerText = 'Update Task';
    document.getElementById('cancel-edit').classList.remove('hidden');
}

function resetTodoForm() {
    todoForm.reset();
    document.getElementById('todo-id').value = '';
    document.getElementById('todo-submit').innerText = 'Add Task';
    document.getElementById('cancel-edit').classList.add('hidden');
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}