// ===== State Management =====
let currentTab = 'users';
let editingId = null;

// ===== DOM Elements =====
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
const dataForm = document.getElementById('dataForm');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toast-message');

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    setupEventListeners();
});

// ===== Event Listeners =====
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const tab = item.dataset.tab;
            switchTab(tab);
        });
    });

    // Add button
    document.getElementById('addBtn').addEventListener('click', () => {
        openModal();
    });

    // Close modal
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('cancelBtn').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Form submit
    dataForm.addEventListener('submit', handleSubmit);
}

// ===== Tab Navigation =====
function switchTab(tab) {
    currentTab = tab;

    // Update nav active state
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.tab === tab);
    });

    // Update content sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(`${tab}-section`).classList.add('active');

    // Update page title
    document.querySelector('.page-title').textContent = tab === 'users' ? 'Users Management' : 'Fasum Management';

    loadData();
}

// ===== Load Data =====
async function loadData() {
    const tableBody = document.getElementById(`${currentTab}-table-body`);
    const countBadge = document.getElementById(`${currentTab}-count`);

    tableBody.innerHTML = '<tr><td colspan="6"><div class="loading"><div class="spinner"></div></div></td></tr>';

    try {
        const endpoint = currentTab === 'users' ? '/api/users' : '/api/fasum';
        const response = await fetch(endpoint);
        const data = await response.json();

        if (data.error) throw new Error(data.error);

        countBadge.textContent = data.length;

        if (data.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6">
                        <div class="empty-state">
                            <div class="empty-state-icon">📭</div>
                            <p>Belum ada data. Klik "Tambah Data" untuk menambahkan.</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = data.map(item => createTableRow(item)).join('');
    } catch (error) {
        showToast('Gagal memuat data: ' + error.message, true);
        tableBody.innerHTML = `
            <tr>
                <td colspan="6">
                    <div class="empty-state">
                        <div class="empty-state-icon">❌</div>
                        <p>Terjadi kesalahan saat memuat data.</p>
                    </div>
                </td>
            </tr>
        `;
    }
}

// ===== Create Table Row =====
function createTableRow(item) {
    if (currentTab === 'users') {
        return `
            <tr>
                <td>${item.id}</td>
                <td>${escapeHtml(item.nama)}</td>
                <td>••••••••</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-icon btn-edit" onclick="editItem(${item.id})">✏️</button>
                        <button class="btn btn-icon btn-delete" onclick="deleteItem(${item.id})">🗑️</button>
                    </div>
                </td>
            </tr>
        `;
    } else {
        return `
            <tr>
                <td>${item.id}</td>
                <td>${escapeHtml(item.nama)}</td>
                <td>${escapeHtml(item.lokasi)}</td>
                <td>${item.longitude}</td>
                <td>${item.latitude}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-icon btn-edit" onclick="editItem(${item.id})">✏️</button>
                        <button class="btn btn-icon btn-delete" onclick="deleteItem(${item.id})">🗑️</button>
                    </div>
                </td>
            </tr>
        `;
    }
}

// ===== Modal Functions =====
function openModal(item = null) {
    editingId = item ? item.id : null;
    modalTitle.textContent = item ? 'Edit Data' : 'Tambah Data';

    if (currentTab === 'users') {
        modalBody.innerHTML = `
            <div class="form-group">
                <label for="nama">Nama</label>
                <input type="text" id="nama" name="nama" placeholder="Masukkan nama" value="${item?.nama || ''}" required>
            </div>
            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" name="password" placeholder="Masukkan password" value="${item?.password || ''}" required>
            </div>
        `;
    } else {
        modalBody.innerHTML = `
            <div class="form-group">
                <label for="nama">Nama</label>
                <input type="text" id="nama" name="nama" placeholder="Masukkan nama fasum" value="${item?.nama || ''}" required>
            </div>
            <div class="form-group">
                <label for="lokasi">Lokasi</label>
                <input type="text" id="lokasi" name="lokasi" placeholder="Masukkan lokasi" value="${item?.lokasi || ''}" required>
            </div>
            <div class="form-group">
                <label for="longitude">Longitude</label>
                <input type="text" id="longitude" name="longitude" placeholder="Contoh: 106.845599" value="${item?.longitude || ''}" required>
            </div>
            <div class="form-group">
                <label for="latitude">Latitude</label>
                <input type="text" id="latitude" name="latitude" placeholder="Contoh: -6.208763" value="${item?.latitude || ''}" required>
            </div>
        `;
    }

    modal.classList.add('active');
}

function closeModal() {
    modal.classList.remove('active');
    editingId = null;
    dataForm.reset();
}

// ===== Form Submit =====
async function handleSubmit(e) {
    e.preventDefault();

    const formData = new FormData(dataForm);
    const data = Object.fromEntries(formData);

    const endpoint = currentTab === 'users' ? '/api/users' : '/api/fasum';
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `${endpoint}/${editingId}` : endpoint;

    try {
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.error) throw new Error(result.error);

        showToast(editingId ? 'Data berhasil diperbarui!' : 'Data berhasil ditambahkan!');
        closeModal();
        loadData();
    } catch (error) {
        showToast('Gagal menyimpan data: ' + error.message, true);
    }
}

// ===== Edit Item =====
async function editItem(id) {
    try {
        const endpoint = currentTab === 'users' ? '/api/users' : '/api/fasum';
        const response = await fetch(`${endpoint}/${id}`);
        const item = await response.json();

        if (item.error) throw new Error(item.error);

        openModal(item);
    } catch (error) {
        showToast('Gagal memuat data: ' + error.message, true);
    }
}

// ===== Delete Item =====
async function deleteItem(id) {
    if (!confirm('Apakah Anda yakin ingin menghapus data ini?')) return;

    try {
        const endpoint = currentTab === 'users' ? '/api/users' : '/api/fasum';
        const response = await fetch(`${endpoint}/${id}`, { method: 'DELETE' });
        const result = await response.json();

        if (result.error) throw new Error(result.error);

        showToast('Data berhasil dihapus!');
        loadData();
    } catch (error) {
        showToast('Gagal menghapus data: ' + error.message, true);
    }
}

// ===== Toast Notification =====
function showToast(message, isError = false) {
    toastMessage.textContent = message;
    toast.classList.toggle('error', isError);
    toast.classList.add('active');

    setTimeout(() => {
        toast.classList.remove('active');
    }, 3000);
}

// ===== Utility Functions =====
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
