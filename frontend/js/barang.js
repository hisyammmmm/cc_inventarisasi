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
    // Request ke endpoint yang benar: /barang
    const response = await fetch(`${BASE_URL}/barang`);
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
        <td>
          <button class="aksi-btn btn-edit" data-id="${barang.id}">Edit</button>
          <button class="aksi-btn btn-delete" data-id="${barang.id}">Hapus</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // Event listener tombol edit
    tbody.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', async function() {
        const id = this.getAttribute('data-id');
        await showEditModal(id);
      });
    });
    // Event listener tombol hapus
    tbody.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', async function() {
        const id = this.getAttribute('data-id');
        if (confirm('Yakin ingin menghapus barang ini?')) {
          await hapusBarang(id);
        }
      });
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

// Fungsi hapus barang
async function hapusBarang(id) {
  try {
    const response = await fetch(`${BASE_URL}/barang/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await response.json();
    if (response.ok && data.success) {
      alert('Barang berhasil dihapus!');
      loadBarang();
    } else {
      alert(data.message || 'Gagal menghapus barang');
    }
  } catch (error) {
    alert('Terjadi kesalahan saat menghapus barang');
  }
}

// Modal Edit Barang
async function showEditModal(id) {
  try {
    const response = await fetch(`${BASE_URL}/barang/${id}`);
    const data = await response.json();
    if (!data || !data.success) {
      alert('Gagal mengambil data barang');
      return;
    }
    const barang = data.data || data; // fallback jika backend langsung kirim data
    // Isi form modal
    document.getElementById('edit_id').value = barang.id;
    document.getElementById('edit_kode_barang').value = barang.kode_barang;
    document.getElementById('edit_nama_barang').value = barang.nama_barang;
    document.getElementById('edit_kategori').value = barang.kategori;
    document.getElementById('edit_jumlah').value = barang.jumlah;
    document.getElementById('edit_satuan').value = barang.satuan;
    document.getElementById('edit_kondisi').value = barang.kondisi;
    document.getElementById('edit_lokasi').value = barang.lokasi;
    document.getElementById('edit_keterangan').value = barang.keterangan || '';
    document.getElementById('editModal').style.display = 'block';
  } catch (error) {
    alert('Terjadi kesalahan saat mengambil data barang');
  }
}

// Event close modal
if (document.getElementById('closeEditModal')) {
  document.getElementById('closeEditModal').onclick = function() {
    document.getElementById('editModal').style.display = 'none';
  };
}
window.onclick = function(event) {
  const modal = document.getElementById('editModal');
  if (event.target === modal) {
    modal.style.display = 'none';
  }
};

// Submit edit barang
if (document.getElementById('editBarangForm')) {
  document.getElementById('editBarangForm').onsubmit = async function(e) {
    e.preventDefault();
    const id = document.getElementById('edit_id').value;
    const formData = {
      kode_barang: document.getElementById('edit_kode_barang').value,
      nama_barang: document.getElementById('edit_nama_barang').value,
      kategori: document.getElementById('edit_kategori').value,
      jumlah: parseInt(document.getElementById('edit_jumlah').value),
      satuan: document.getElementById('edit_satuan').value,
      kondisi: document.getElementById('edit_kondisi').value,
      lokasi: document.getElementById('edit_lokasi').value,
      keterangan: document.getElementById('edit_keterangan').value
    };
    try {
      const response = await fetch(`${BASE_URL}/barang/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (response.ok && data.success) {
        alert('Barang berhasil diupdate!');
        document.getElementById('editModal').style.display = 'none';
        loadBarang();
      } else {
        alert(data.message || 'Gagal update barang');
      }
    } catch (error) {
      alert('Terjadi kesalahan saat update barang');
    }
  };
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