import React, { useState, useEffect } from 'react';
import AuthForm from './components/AuthForm';
import TodoList from './components/TodoList';
import TodoForm from './components/TodoForm';
import { getCookie, setCookie, deleteCookie } from './utils/cookies';

const API_URL = 'http://localhost:3000/api';

function App() {
  const [token, setToken] = useState(getCookie('authToken'));
  const [todos, setTodos] = useState([]);
  const [editingTodo, setEditingTodo] = useState(null);

  // Fetch todos whenever the token changes
  useEffect(() => {
    if (token) {
      fetchTodos();
    }
  }, [token]);

  const fetchTodos = async () => {
    const res = await fetch(`${API_URL}/todos`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    setTodos(data);
  };

  const handleLogout = () => {
    deleteCookie('authToken');
    setToken(null);
    setTodos([]);
  };

  if (!token) {
    return <AuthForm setToken={(t) => { setCookie('authToken', t); setToken(t); }} API_URL={API_URL} />;
  }

  return (
    <div className="app-container">
      <header>
        <h1>My Tasks</h1>
        <button onClick={handleLogout}>Logout</button>
      </header>

      <TodoForm 
        fetchTodos={fetchTodos} 
        editingTodo={editingTodo} 
        clearEdit={() => setEditingTodo(null)}
        token={token}
        API_URL={API_URL}
      />

      <TodoList 
        todos={todos} 
        fetchTodos={fetchTodos} 
        setEditingTodo={setEditingTodo}
        token={token}
        API_URL={API_URL}
      />
    </div>
  );
}

export default App;