// src/lib/api.js
const API_BASE_URL = 'https://task-manager-backend-wqxa.vercel.app';

async function fetchWithAuth(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    'auth-token': token || '',
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error('API request failed');
  }

  return response.json();
}

export const api = {
  login: (email, password) =>
    fetchWithAuth('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  signup: (name, email, password) =>
    fetchWithAuth('/auth/createuser', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),

  getUser: () => fetchWithAuth('/auth/getuser', { method: 'POST' }),

  getTasks: () => fetchWithAuth('/tasks/fetchalltask'),

  addTask: (task) =>
    fetchWithAuth('/tasks/addtask', {
      method: 'POST',
      body: JSON.stringify(task),
    }),

  updateTask: (taskId, task) =>
    fetchWithAuth(`/tasks/updatetask/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(task),
    }),

  deleteTask: (taskId) =>
    fetchWithAuth(`/tasks/deletetask/${taskId}`, {
      method: 'DELETE',
    }),
};