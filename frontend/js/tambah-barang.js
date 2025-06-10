import { BASE_URL, checkAuth, logout, showMessage, clearMessage } from './utils.js';

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

// Handle form submission
async function handleTambahBarang(formData) {
  const token = checkAuth();
  if (!token) return;

  try {
    const response = await fetch(`${BASE_URL}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(formData)
    });

    const data = await response.json();

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

// Initialize Tambah Barang Page
export function initTambahBarangPage() {
  // Check authentication
  checkAuth();
  
  // Setup logout button
  document.querySelector('.logout-btn').addEventListener('click', logout);
  
  // Setup auto kode generation
  setupAutoKode();
  
  // Setup form validation
  setupFormValidation();
  
  // Handle form submission
  document.getElementById('tambahBarangForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    clearMessage('tambahMsg');
    
    // Get form data
    const formData = {
      kode_barang: document.getElementById('kode_barang').value.trim(),
      nama_barang: document.getElementById('nama_barang').value.trim(),
      kategori: document.getElementById('kategori').value,
      jumlah: parseInt(document.getElementById('jumlah').value),
      satuan: document.getElementById('satuan').value.trim(),
      kondisi: document.getElementById('kondisi').value,
      lokasi: document.getElementById('lokasi').value.trim(),
      keterangan: document.getElementById('keterangan').value.trim() || null
    };
    
    // Basic validation
    if (!formData.kode_barang || !formData.nama_barang || !formData.kategori || 
        !formData.jumlah || !formData.satuan || !formData.kondisi || !formData.lokasi) {
      showMessage('tambahMsg', 'Mohon lengkapi semua field yang wajib diisi');
      return;
    }
    
    if (formData.jumlah < 1) {
      showMessage('tambahMsg', 'Jumlah barang harus lebih dari 0');
      return;
    }
    
    // Submit form
    await handleTambahBarang(formData);
  });
}