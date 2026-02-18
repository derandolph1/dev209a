import React from 'react';

function TodoList({ todos, fetchTodos, setEditingTodo, token, API_URL }) {
  
  const deleteTask = async (id) => {
    await fetch(`${API_URL}/todos/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchTodos();
  };

  const toggleStatus = async (todo) => {
    await fetch(`${API_URL}/todos/${todo.id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({ completed: !todo.completed })
    });
    fetchTodos();
  };

  return (
    <ul>
      {todos.map(todo => (
        <li key={todo.id} className={todo.completed ? 'completed' : ''}>
          <div>
            <strong>{todo.title}</strong>
            <p>{todo.description}</p>
          </div>
          <div className="actions">
            <button onClick={() => toggleStatus(todo)}>
              {todo.completed ? 'Undo' : 'Complete'}
            </button>
            <button onClick={() => setEditingTodo(todo)}>Edit</button>
            <button onClick={() => deleteTask(todo.id)} className="delete-btn">Delete</button>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default TodoList;