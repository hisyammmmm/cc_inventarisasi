import { BASE_URL, showMessage, clearMessage } from './utils.js';

// Login Function
export async function handleLogin(email, password) {
  try {
    const response = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (data.success) {
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      window.location.href = './barang.html';
    } else {
      showMessage('loginMsg', data.message || 'Login gagal');
    }
  } catch (error) {
    showMessage('loginMsg', 'Terjadi kesalahan saat login');
  }
}

// Register Function
export async function handleRegister(username, email, password) {
  try {
    const response = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });
    
    const data = await response.json();
    
    if (data.success) {
      showMessage('registerMsg', 'Registrasi berhasil, silakan login.', 'success');
      setTimeout(() => window.location.href = './login.html', 1500);
    } else {
      showMessage('registerMsg', data.message || 'Registrasi gagal');
    }
  } catch (error) {
    showMessage('registerMsg', 'Terjadi kesalahan saat registrasi');
  }
}

// Initialize Login Form
export function initLoginForm() {
  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    clearMessage('loginMsg');
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    await handleLogin(email, password);
  });
}

// Initialize Register Form
export function initRegisterForm() {
  document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    clearMessage('registerMsg');
    
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    await handleRegister(username, email, password);
  });
}