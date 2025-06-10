// Configuration
export const BASE_URL = "http://localhost:8080";

// Utility Functions
export function checkAuth() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = './login.html';
    return false;
  }
  return token;
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = './login.html';
}

export function showMessage(elementId, message, type = 'error') {
  const element = document.getElementById(elementId);
  element.textContent = message;
  element.className = `message ${type}`;
}

export function clearMessage(elementId) {
  const element = document.getElementById(elementId);
  element.textContent = '';
  element.className = 'message';
}

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }
  
  const config = {
    headers: { ...defaultHeaders, ...options.headers },
    ...options
  };
  
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
}