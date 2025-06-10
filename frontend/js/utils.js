// Configuration
export const BASE_URL = "http://localhost:8080";

// ✅ FIX: checkAuth tanpa token
export function checkAuth() {
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  const user = localStorage.getItem('user');
  
  if (!isLoggedIn || !user) {
    window.location.href = './login.html';
    return false;
  }
  return true;
}

// ✅ FIX: getCurrentUser untuk mendapatkan user data
export function getCurrentUser() {
  const userData = localStorage.getItem('user');
  return userData ? JSON.parse(userData) : null;
}

export function logout() {
  localStorage.removeItem('isLoggedIn');
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

// ✅ FIX: API request tanpa token
export async function apiRequest(endpoint, options = {}) {
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };
  
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