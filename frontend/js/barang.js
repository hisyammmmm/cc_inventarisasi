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

// ✅ FIX: Load Barang Data dengan error handling yang lebih baik
export async function loadBarang() {
  if (!checkAuth()) return;
  
  const tbody = document.querySelector('#barangTable tbody');
  if (!tbody) {
    console.error('Element #barangTable tbody tidak ditemukan');
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/barang`);
    const data = await response.json();
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
        <td>${barang.id || '-'}</td>
        <td>${barang.kode_barang || '-'}</td>
        <td>${barang.nama_barang || '-'}</td>
        <td>${barang.kategori || '-'}</td>
        <td>${barang.jumlah || 0}</td>
        <td>${barang.satuan || '-'}</td>
        <td>${getStatusBadge(barang.kondisi || 'baik')}</td>
        <td>${barang.lokasi || '-'}</td>
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

// Fungsi hapus barang dengan error handling
async function hapusBarang(id) {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const response = await fetch(`${BASE_URL}/barang/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: user.username || 'unknown' })
    });
    
    const data = await response.json();
    if (response.ok && data.success) {
      alert('Barang berhasil dihapus!');
      loadBarang();
    } else {
      alert(data.message || 'Gagal menghapus barang');
    }
  } catch (error) {
    console.error('Error hapus barang:', error);
    alert('Terjadi kesalahan saat menghapus barang');
  }
}

// Modal Edit Barang dengan validasi element
async function showEditModal(id) {
  const modal = document.getElementById('editModal');
  if (!modal) {
    console.error('Modal edit tidak ditemukan');
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/barang/${id}`);
    const data = await response.json();
    
    if (!data || !data.success) {
      alert('Gagal mengambil data barang');
      return;
    }
    
    const barang = data.data || data;
    
    // Validasi dan isi form modal
    const fields = [
      'edit_id', 'edit_kode_barang', 'edit_nama_barang', 'edit_kategori',
      'edit_jumlah', 'edit_satuan', 'edit_kondisi', 'edit_lokasi', 'edit_keterangan'
    ];
    
    let allFieldsFound = true;
    fields.forEach(fieldId => {
      const element = document.getElementById(fieldId);
      if (!element) {
        console.error(`Element ${fieldId} tidak ditemukan`);
        allFieldsFound = false;
      }
    });
    
    if (!allFieldsFound) {
      alert('Form edit tidak lengkap');
      return;
    }
    
    // Isi form modal
    document.getElementById('edit_id').value = barang.id || '';
    document.getElementById('edit_kode_barang').value = barang.kode_barang || '';
    document.getElementById('edit_nama_barang').value = barang.nama_barang || '';
    document.getElementById('edit_kategori').value = barang.kategori || '';
    document.getElementById('edit_jumlah').value = barang.jumlah || '';
    document.getElementById('edit_satuan').value = barang.satuan || '';
    document.getElementById('edit_kondisi').value = barang.kondisi || '';
    document.getElementById('edit_lokasi').value = barang.lokasi || '';
    document.getElementById('edit_keterangan').value = barang.keterangan || '';
    
    modal.style.display = 'block';
    
  } catch (error) {
    console.error('Error show edit modal:', error);
    alert('Terjadi kesalahan saat mengambil data barang');
  }
}

// Fungsi fetch dan render log ke tabel dengan error handling
async function fetchLogTable() {
  const logTable = document.getElementById('logTable');
  if (!logTable) {
    console.error('Element logTable tidak ditemukan');
    return;
  }
  
  const tbody = logTable.querySelector('tbody');
  if (!tbody) {
    console.error('tbody dalam logTable tidak ditemukan');
    return;
  }
  
  tbody.innerHTML = '<tr><td colspan="12">Memuat log...</td></tr>';
  
  try {
    const res = await fetch(`${BASE_URL}/barang/log`);
    const data = await res.json();
    
    if (data.logs && data.logs.length > 0) {
      tbody.innerHTML = data.logs.map((log, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${log.lastModifiedAt ? new Date(log.lastModifiedAt).toLocaleString() : '-'}</td>
          <td>${log.lastAction || '-'}</td>
          <td>${log.nama_barang || '-'}</td>
          <td>${log.kode_barang || '-'}</td>
          <td>${log.kategori || '-'}</td>
          <td>${log.jumlah || '-'}</td>
          <td>${log.satuan || '-'}</td>
          <td>${log.kondisi || '-'}</td>
          <td>${log.lokasi || '-'}</td>
          <td>${log.keterangan || '-'}</td>
          <td>${log.lastModifiedBy || '-'}</td>
        </tr>
      `).join('');
    } else {
      tbody.innerHTML = '<tr><td colspan="12">Belum ada aktivitas log.</td></tr>';
    }
  } catch (err) {
    console.error('Error fetch log:', err);
    tbody.innerHTML = '<tr><td colspan="12">Gagal memuat log.</td></tr>';
  }
}

// Initialize dengan DOMContentLoaded untuk memastikan DOM sudah siap
export function initBarangPage() {
  // Tunggu sampai DOM loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupBarangPage);
  } else {
    setupBarangPage();
  }
}

function setupBarangPage() {
  // Check authentication first
  if (!checkAuth()) return;
  
  // Setup logout button dengan validasi
  const logoutBtn = document.querySelector('.logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  } else {
    console.warn('Logout button tidak ditemukan');
  }
  
  // Setup modal close events dengan validasi
  const closeEditModal = document.getElementById('closeEditModal');
  if (closeEditModal) {
    closeEditModal.onclick = function() {
      const modal = document.getElementById('editModal');
      if (modal) modal.style.display = 'none';
    };
  }
  
  // Setup window click untuk close modal
  window.onclick = function(event) {
    const modal = document.getElementById('editModal');
    if (modal && event.target === modal) {
      modal.style.display = 'none';
    }
  };
  
  // Setup edit form dengan validasi
  const editForm = document.getElementById('editBarangForm');
  if (editForm) {
    editForm.onsubmit = async function(e) {
      e.preventDefault();
      
      const id = document.getElementById('edit_id')?.value;
      if (!id) {
        alert('ID barang tidak valid');
        return;
      }
      
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const formData = {
          kode_barang: document.getElementById('edit_kode_barang')?.value || '',
          nama_barang: document.getElementById('edit_nama_barang')?.value || '',
          kategori: document.getElementById('edit_kategori')?.value || '',
          jumlah: parseInt(document.getElementById('edit_jumlah')?.value || '0'),
          satuan: document.getElementById('edit_satuan')?.value || '',
          kondisi: document.getElementById('edit_kondisi')?.value || '',
          lokasi: document.getElementById('edit_lokasi')?.value || '',
          keterangan: document.getElementById('edit_keterangan')?.value || '',
          username: user.username || 'unknown'
        };
        
        const response = await fetch(`${BASE_URL}/barang/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        if (response.ok && data.success) {
          alert('Barang berhasil diupdate!');
          const modal = document.getElementById('editModal');
          if (modal) modal.style.display = 'none';
          loadBarang();
        } else {
          alert(data.message || 'Gagal update barang');
        }
      } catch (error) {
        console.error('Error update barang:', error);
        alert('Terjadi kesalahan saat update barang');
      }
    };
  }
  
  // Setup log button dengan validasi
  const btnShowLog = document.getElementById('btn-show-log');
  const btnClearLog = document.getElementById('btn-clear-log');
  const logTableWrapper = document.getElementById('logTableWrapper');
  const barangTableWrapper = document.querySelector('.table-wrapper');
  
  if (btnShowLog && logTableWrapper && barangTableWrapper) {
    btnShowLog.addEventListener('click', function() {
      if (logTableWrapper.style.display === 'none') {
        fetchLogTable();
        logTableWrapper.style.display = 'block';
        barangTableWrapper.style.display = 'none';
        btnShowLog.textContent = 'Kembali ke Data Barang';
        if (btnClearLog) btnClearLog.style.display = 'inline-block';
      } else {
        logTableWrapper.style.display = 'none';
        barangTableWrapper.style.display = 'block';
        btnShowLog.textContent = '📄 Lihat Log Barang';
        if (btnClearLog) btnClearLog.style.display = 'none';
      }
    });
  } else {
    console.warn('Beberapa element untuk log tidak ditemukan');
  }
  
  // Sembunyikan tombol clear log saat load awal
  if (btnClearLog) btnClearLog.style.display = 'none';
  
  // Fungsi clear log barang
  if (btnClearLog) {
    btnClearLog.onclick = async function() {
      if (confirm('Yakin ingin menghapus semua log barang?')) {
        try {
          const res = await fetch(`${BASE_URL}/barang/log`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
          });
          const data = await res.json();
          if (res.ok && data.success) {
            alert('Log barang berhasil dihapus!');
            fetchLogTable();
          } else {
            alert(data.message || 'Gagal menghapus log barang');
          }
        } catch (err) {
          alert('Terjadi kesalahan saat menghapus log barang');
        }
      }
    };
  }
  
  // Setup tombol Export CSV
  const btnExportCsv = document.getElementById('btn-export-csv');
  if (btnExportCsv) {
    btnExportCsv.onclick = async function() {
      try {
        const res = await fetch(`${BASE_URL}/barang/export/csv`);
        if (!res.ok) throw new Error('Gagal export CSV');
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'data-barang.csv';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } catch (err) {
        alert('Gagal export CSV');
      }
    };
  }
  
  // Load barang data on page load
  loadBarang();
  
  document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user'));
    // Sembunyikan tombol log dan export jika bukan admin
    if (!user || user.username !== 'admin') {
      const btnShowLog = document.getElementById('btn-show-log');
      const btnClearLog = document.getElementById('btn-clear-log');
      const btnExportCsv = document.getElementById('btn-export-csv');
      if (btnShowLog) btnShowLog.style.display = 'none';
      if (btnClearLog) btnClearLog.style.display = 'none';
      if (btnExportCsv) btnExportCsv.style.display = 'none';
    }
  });
}