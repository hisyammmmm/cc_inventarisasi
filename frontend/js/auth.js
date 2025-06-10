// ===== FRONTEND (auth.js) - FIXED VERSION =====
import { BASE_URL, showMessage, clearMessage } from './utils.js';

// Login Function - FIXED
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
      // ✅ FIX: Backend mengirim data.user, bukan data.data.user
      // Jika ada token, simpan token (atau skip jika tidak ada JWT)
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      
      // ✅ FIX: Simpan user data dari data.user, bukan data.data.user
      localStorage.setItem('user', JSON.stringify(data.user));
      
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

// ===== BACKEND (UserController.js) - ALTERNATIVE CONSISTENT VERSION =====

// Option 1: Keep current backend structure, frontend sudah disesuaikan di atas

// Option 2: Change backend to match frontend expectations
const loginUserConsistent = async (req, res) => {
  try {
    console.log('Login attempt:', req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const user = await User.findOne({ where: { email } });
    console.log('User found:', user ? 'Yes' : 'No');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Password valid:', isPasswordValid);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Update lastLogin (optional)
    try {
      if (user.lastLogin !== undefined) {
        await user.update({ lastLogin: new Date() });
      }
    } catch (updateError) {
      console.log('Warning: Could not update lastLogin:', updateError.message);
    }

    console.log('Sending successful response...');
    
    // ✅ Structure yang konsisten dengan frontend expectations
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        // token: generateJWT(user.id), // Uncomment jika pakai JWT
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role || 'user'
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error during login',
      error: error.message,
    });
  }
};