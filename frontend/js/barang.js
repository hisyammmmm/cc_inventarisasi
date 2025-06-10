import { BASE_URL, checkAuth, logout } from './utils.js';

// Status Badge Helper
function getStatusBadge(kondisi) {
  const status = kondisi.toLowerCase();
  let className = 'status-badge ';
  
  if (status.includes('baik')) {
    className += 'status-baik';
  } else if (status.includes('rusak')) {
    className += 'status-rusak';
  } else if (status.includes('hilang')) {
    className += 'status-hilang';
  } else {
    className += 'status-baik';
  }
  
  return `<span class="${className}">${kondisi}</span>`;
}

// ✅ FIX: Load Barang Data tanpa token
export async function loadBarang() {
  if (!checkAuth()) return;
  
  try {
    // ✅ Request tanpa Authorization header
    const response = await fetch(`${BASE_URL}/`);
    
    const data = await response.json();
    const tbody = document.querySelector('#barangTable tbody');
    tbody.innerHTML = '';
    
    const barangList = Array.isArray(data) ? data : [];
    
    if (barangList.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="9" class="empty-state">
            <div class="empty-state-icon">📦</div>
            <div class="empty-state-text">Tidak ada data barang</div>
            <div class="empty-state-subtext">Data barang akan muncul di sini setelah ditambahkan</div>
          </td>
        </tr>
      `;
      return;
    }
    
    barangList.forEach(barang => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${barang.id}</td>
        <td>${barang.kode_barang}</td>
        <td>${barang.nama_barang}</td>
        <td>${barang.kategori}</td>
        <td>${barang.jumlah}</td>
        <td>${barang.satuan}</td>
        <td>${getStatusBadge(barang.kondisi)}</td>
        <td>${barang.lokasi}</td>
        <td>${barang.keterangan || '-'}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (error) {
    console.error('Error loading barang:', error);
    const tbody = document.querySelector('#barangTable tbody');
    tbody.innerHTML = `
      <tr>
        <td colspan="9" class="empty-state">
          <div class="empty-state-icon">⚠️</div>
          <div class="empty-state-text">Gagal memuat data</div>
          <div class="empty-state-subtext">Terjadi kesalahan saat mengambil data barang</div>
        </td>
      </tr>
    `;
  }
}

// Initialize Barang Page
export function initBarangPage() {
  // Check authentication first
  if (!checkAuth()) return;
  
  // Setup logout button
  document.querySelector('.logout-btn').addEventListener('click', logout);
  
  // Load barang data on page load
  loadBarang();
}