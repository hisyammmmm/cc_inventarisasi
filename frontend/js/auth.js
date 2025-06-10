// ===== FRONTEND (auth.js) - FIXED VERSION WITHOUT TOKEN =====
import { BASE_URL, showMessage, clearMessage } from './utils.js';

// Login Function - FIXED untuk non-JWT
export async function handleLogin(email, password) {
  try {
    console.log('Attempting login...'); // Debug log
    
    const response = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    console.log('Login response:', data); // Debug log
    
    if (data.success) {
      // ✅ FIX: Simpan user data langsung dari data.user (sesuai backend response)
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('isLoggedIn', 'true'); // Flag login tanpa token
      
      showMessage('loginMsg', 'Login berhasil! Mengalihkan...', 'success');
      setTimeout(() => {
        window.location.href = './barang.html';
      }, 1000);
    } else {
      showMessage('loginMsg', data.message || 'Login gagal');
    }
  } catch (error) {
    console.error('Login error:', error); // Debug log
    showMessage('loginMsg', 'Terjadi kesalahan saat login');
  }
}

// Register Function - FIXED
export async function handleRegister(username, email, password) {
  try {
    console.log('Attempting register...'); // Debug log
    
    const response = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });
    
    const data = await response.json();
    console.log('Register response:', data); // Debug log
    
    if (data.success) {
      showMessage('registerMsg', 'Registrasi berhasil, silakan login.', 'success');
      setTimeout(() => window.location.href = './login.html', 1500);
    } else {
      showMessage('registerMsg', data.message || 'Registrasi gagal');
    }
  } catch (error) {
    console.error('Register error:', error); // Debug log
    showMessage('registerMsg', 'Terjadi kesalahan saat registrasi');
  }
}

// Initialize Login Form
export function initLoginForm() {
  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    clearMessage('loginMsg');
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    
    if (!email || !password) {
      showMessage('loginMsg', 'Email dan password harus diisi');
      return;
    }
    
    await handleLogin(email, password);
  });
}

// Initialize Register Form
export function initRegisterForm() {
  document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    clearMessage('registerMsg');
    
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    
    if (!username || !email || !password) {
      showMessage('registerMsg', 'Semua field harus diisi');
      return;
    }
    
    await handleRegister(username, email, password);
  });
}