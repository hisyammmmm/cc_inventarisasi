import { BASE_URL, checkAuth, logout, getCurrentUser, showMessage, clearMessage } from './utils.js';

// Generate auto kode barang
function generateKodeBarang(kategori) {
  const prefixes = {
    'Elektronik': 'ELK',
    'Furniture': 'FUR',
    'ATK': 'ATK',
    'Alat Kebersihan': 'AKB'
  };
  
  const prefix = prefixes[kategori] || 'BRG';
  const timestamp = Date.now().toString().slice(-6);
  return `${prefix}-${timestamp}`;
}

// ✅ FIX: Handle form submission dengan user ID
async function handleTambahBarang(formData) {
  if (!checkAuth()) return;

  // ✅ Ambil user data dari localStorage
  const currentUser = getCurrentUser();
  if (!currentUser || !currentUser.id) {
    showMessage('tambahMsg', 'User data tidak ditemukan, silakan login ulang');
    setTimeout(() => {
      window.location.href = './login.html';
    }, 2000);
    return;
  }

  // ✅ Tambahkan user ID ke form data
  const dataToSend = {
    ...formData,
    created_by: currentUser.id
  };

  try {
    // ✅ Request tanpa Authorization header
    const response = await fetch(`${BASE_URL}/barang`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    const data = await response.json();
    console.log('Tambah barang response:', data); // Debug log

    if (response.ok && data.success) {
      showMessage('tambahMsg', 'Barang berhasil ditambahkan!', 'success');
      
      // Reset form
      document.getElementById('tambahBarangForm').reset();
      
      // Auto redirect after success
      setTimeout(() => {
        window.location.href = './barang.html';
      }, 1500);
    } else {
      showMessage('tambahMsg', data.message || 'Gagal menambahkan barang');
    }
  } catch (error) {
    console.error('Error:', error);
    showMessage('tambahMsg', 'Terjadi kesalahan saat menambahkan barang');
  }
}

// Auto generate kode barang when kategori changes
function setupAutoKode() {
  const kategoriSelect = document.getElementById('kategori');
  const kodeInput = document.getElementById('kode_barang');
  
  kategoriSelect.addEventListener('change', function() {
    if (this.value && !kodeInput.value) {
      kodeInput.value = generateKodeBarang(this.value);
    }
  });
}

// Initialize form validation
function setupFormValidation() {
  const form = document.getElementById('tambahBarangForm');
  const inputs = form.querySelectorAll('input[required], select[required]');
  
  inputs.forEach(input => {
    input.addEventListener('blur', function() {
      if (this.value.trim() === '') {
        this.style.borderColor = '#dc3545';
      } else {
        this.style.borderColor = '#28a745';
      }
    });
    
    input.addEventListener('input', function() {
      if (this.style.borderColor === '#dc3545' && this.value.trim() !== '') {
        this.style.borderColor = '#e1e5e9';
      }
    });
  });
}

// Display current user info
function displayUserInfo() {
  const currentUser = getCurrentUser();
  if (currentUser) {
    console.log('Current user:', currentUser); // Debug log
    // Bisa ditambahkan display username di header jika mau
  }
}

// Initialize Tambah Barang Page
export function initTambahBarangPage() {
  // Check authentication
  if (!checkAuth()) return;
  
  // Display user info
  displayUserInfo();
  
  // Setup logout button
  document.querySelector('.logout-btn').addEventListener('click', logout);
  
  // Setup auto kode generation
  setupAutoKode();
  
  // Setup form validation
  setupFormValidation();
  
  // Handle form submission
  document.getElementById('tambahBarangForm').onsubmit = async function(e) {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('user'));
    const formData = {
      kode_barang: document.getElementById('kode_barang').value,
      nama_barang: document.getElementById('nama_barang').value,
      kategori: document.getElementById('kategori').value,
      jumlah: parseInt(document.getElementById('jumlah').value),
      satuan: document.getElementById('satuan').value,
      kondisi: document.getElementById('kondisi').value,
      lokasi: document.getElementById('lokasi').value,
      keterangan: document.getElementById('keterangan').value,
      created_by: user ? user.id : null, // untuk kolom created_by (integer)
      username: user ? user.username : 'unknown' // untuk log
    };
    try {
      const response = await fetch(`${BASE_URL}/barang`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (response.ok && data.success) {
        alert('Barang berhasil ditambahkan!');
        window.location.href = './barang.html';
      } else {
        alert(data.message || 'Gagal menambah barang');
      }
    } catch (error) {
      alert('Terjadi kesalahan saat menambah barang');
    }
  };
}