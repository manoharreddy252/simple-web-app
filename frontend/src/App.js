import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://simple-web-app-backend.onrender.com/api'
  : 'http://localhost:5000/api';

function App() {
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [newUser, setNewUser] = useState({ name: '', email: '' });
  const [newTask, setNewTask] = useState('');

  useEffect(() => {
    fetchUsers();
    fetchTasks();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/users`);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${API_URL}/tasks`);
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const addUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/users`, newUser);
      setNewUser({ name: '', email: '' });
      fetchUsers();
    } catch (error) {
      console.error('Error adding user:', error);
    }
  };

  const deleteUser = async (id) => {
    try {
      await axios.delete(`${API_URL}/users/${id}`);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const addTask = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/tasks`, { title: newTask });
      setNewTask('');
      fetchTasks();
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const toggleTask = async (id) => {
    try {
      await axios.put(`${API_URL}/tasks/${id}`);
      fetchTasks();
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`${API_URL}/tasks/${id}`);
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🚀 Simple Web App</h1>
        <p>React Frontend + Node.js Backend</p>
      </header>

      <div className="container">
        <div className="section">
          <h2>👥 Users</h2>
          <form onSubmit={addUser} className="form">
            <input
              type="text"
              placeholder="Name"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              required
            />
            <button type="submit">Add User</button>
          </form>
          
          <div className="list">
            {users.map(user => (
              <div key={user.id} className="item">
                <div>
                  <strong>{user.name}</strong>
                  <br />
                  <span>{user.email}</span>
                </div>
                <button onClick={() => deleteUser(user.id)} className="delete-btn">
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="section">
          <h2>✅ Tasks</h2>
          <form onSubmit={addTask} className="form">
            <input
              type="text"
              placeholder="Task title"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              required
            />
            <button type="submit">Add Task</button>
          </form>
          
          <div className="list">
            {tasks.map(task => (
              <div key={task.id} className={`item ${task.completed ? 'completed' : ''}`}>
                <div onClick={() => toggleTask(task.id)} style={{ cursor: 'pointer' }}>
                  <span>{task.completed ? '✅' : '⏳'}</span>
                  <span style={{ textDecoration: task.completed ? 'line-through' : 'none' }}>
                    {task.title}
                  </span>
                </div>
                <button onClick={() => deleteTask(task.id)} className="delete-btn">
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;