import React, { useState, useEffect } from 'react';

const TodoForm = ({ fetchTodos, editingTodo, clearEdit, token, API_URL }) => {
  const [todo, setTodo] = useState({ title: '', description: '' });

  // Sync form with editingTodo when "Edit" is clicked in the list
  useEffect(() => {
    if (editingTodo) {
      setTodo({ title: editingTodo.title, description: editingTodo.description });
    } else {
      setTodo({ title: '', description: '' });
    }
  }, [editingTodo]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const method = editingTodo ? 'PUT' : 'POST';
    const url = editingTodo 
      ? `${API_URL}/todos/${editingTodo.id}` 
      : `${API_URL}/todos`;

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(todo)
    });

    if (res.ok) {
      fetchTodos(); // Refresh the list
      handleCancel(); // Clear the form
    }
  };

  const handleCancel = () => {
    setTodo({ title: '', description: '' });
    clearEdit();
  };

  return (
    <form className="todo-form" onSubmit={handleSubmit}>
      <h3>{editingTodo ? 'Edit Task' : 'New Task'}</h3>
      <input
        type="text"
        placeholder="What needs to be done?"
        value={todo.title}
        onChange={(e) => setTodo({ ...todo, title: e.target.value })}
        required
      />
      <textarea
        placeholder="Add details..."
        value={todo.description}
        onChange={(e) => setTodo({ ...todo, description: e.target.value })}
      />
      <div className="form-actions">
        <button type="submit" className="primary-btn">
          {editingTodo ? 'Update Task' : 'Add Task'}
        </button>
        {editingTodo && (
          <button type="button" className="secondary-btn" onClick={handleCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default TodoForm;