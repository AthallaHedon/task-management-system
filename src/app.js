/**
 * Main Application - Day 2 MVC Implementation
 * Mengelola alur aplikasi: Auth, Inisialisasi, dan Navigasi UI.
 */

// State aplikasi global menggunakan pola objek tunggal
let app = {
    storage: null,
    userRepository: null,
    taskRepository: null,
    userController: null,
    taskController: null,
    taskView: null,
    currentUser: null
};

/**
 * Fungsi utama untuk menjalankan aplikasi saat halaman dimuat
 */
function initializeApp() {
    console.log('🚀 Initializing Day 2 Task Management System...');
    
    try {
        // 1. Inisialisasi Storage (Sesuaikan nama Class dengan StorageManager.js Anda)
        if (typeof StorageManager !== 'undefined') {
            app.storage = new StorageManager('taskAppDay2', '2.0');
        } else if (typeof EnhancedStorageManager !== 'undefined') {
            app.storage = new EnhancedStorageManager('taskAppDay2', '2.0');
        } else {
            throw new Error("Storage Manager tidak ditemukan. Cek file src/utils/StorageManager.js");
        }
        
        // 2. Inisialisasi Repositories (Data Layer)
        app.userRepository = new UserRepository(app.storage);
        app.taskRepository = new TaskRepository(app.storage);
        
        // 3. Inisialisasi Controllers (Logic Layer)
        app.userController = new UserController(app.userRepository);
        app.taskController = new TaskController(app.taskRepository, app.userRepository);
        
        // 4. Inisialisasi View (UI Layer)
        if (typeof TaskView !== 'undefined') {
            app.taskView = new TaskView(app.taskController, app.userController);
        } else {
            console.warn("TaskView tidak ditemukan. UI Task mungkin tidak akan muncul.");
        }
        
        // 5. Pasang Event Listeners untuk Auth
        setupAuthEventListeners();
        
        // 6. Buat user demo otomatis (demo & john)
        createDemoUserIfNeeded();
        
        // 7. Tampilkan halaman login awal
        showLoginSection();
        
        console.log('✅ Day 2 Application initialized successfully!');
        
    } catch (error) {
        console.error('❌ Initialization failed:', error);
        alert('Gagal memuat aplikasi: ' + error.message);
    }
}

/**
 * Memasang event listener pada elemen-elemen UI statis
 */
function setupAuthEventListeners() {
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const usernameInput = document.getElementById('usernameInput');
    const registerForm = document.getElementById('registerForm');

    if (loginBtn) loginBtn.addEventListener('click', handleLogin);
    if (registerBtn) registerBtn.addEventListener('click', showRegisterModal);
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
    
    if (usernameInput) {
        usernameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleLogin();
        });
    }
    
    if (registerForm) registerForm.addEventListener('submit', handleRegister);

    // Modal Controls
    document.getElementById('closeRegisterModal')?.addEventListener('click', hideRegisterModal);
    document.getElementById('cancelRegister')?.addEventListener('click', hideRegisterModal);

    // Quick Action Buttons
    document.getElementById('showOverdueBtn')?.addEventListener('click', showOverdueTasks);
    document.getElementById('showDueSoonBtn')?.addEventListener('click', showDueSoonTasks);
    document.getElementById('exportDataBtn')?.addEventListener('click', exportAppData);
    document.getElementById('refreshTasks')?.addEventListener('click', () => app.taskView?.refresh());
}

/**
 * LOGIKA AUTHENTICATION
 */
function handleLogin() {
    const input = document.getElementById('usernameInput');
    const username = input.value.trim();
    
    if (!username) {
        showMessage('Silahkan masukkan username', 'error');
        return;
    }
    
    const response = app.userController.login(username);
    
    if (response.success) {
        app.currentUser = response.data;
        app.taskController.setCurrentUser(app.currentUser.id);
        
        showMainContent();
        loadUserListForAssign();
        app.taskView?.refresh(); // Render list task user tersebut
        
        showMessage(response.message, 'success');
    } else {
        showMessage(response.error, 'error');
    }
}

function handleLogout() {
    app.userController.logout();
    app.currentUser = null;
    hideMainContent();
    showLoginSection();
    showMessage('Berhasil logout', 'info');
}

function handleRegister(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const userData = {
        username: formData.get('username')?.trim(),
        email: formData.get('email')?.trim(),
        fullName: formData.get('fullName')?.trim()
    };
    
    const response = app.userController.register(userData);
    if (response.success) {
        hideRegisterModal();
        showMessage(response.message, 'success');
        document.getElementById('usernameInput').value = userData.username;
    } else {
        showMessage(response.error, 'error');
    }
}

/**
 * NAVIGASI UI (Tampil/Sembunyi Bagian)
 */
function showLoginSection() {
    toggleElement('loginSection', true, 'flex');
    toggleElement('userInfo', false);
    toggleElement('mainContent', false);
    document.getElementById('usernameInput')?.focus();
}

function showMainContent() {
    toggleElement('loginSection', false);
    toggleElement('userInfo', true, 'flex');
    toggleElement('mainContent', true, 'block');
    
    const welcome = document.getElementById('welcomeMessage');
    if (welcome && app.currentUser) {
        welcome.textContent = `Selamat datang, ${app.currentUser.fullName || app.currentUser.username}!`;
    }
}

function hideMainContent() {
    toggleElement('mainContent', false);
}

function toggleElement(id, isShow, displayType = 'block') {
    const el = document.getElementById(id);
    if (el) el.style.display = isShow ? displayType : 'none';
}

function showRegisterModal() { toggleElement('registerModal', true, 'flex'); }
function hideRegisterModal() { 
    toggleElement('registerModal', false);
    document.getElementById('registerForm')?.reset();
}

/**
 * UTILITIES & DATA
 */
function loadUserListForAssign() {
    const response = app.userController.getAllUsers();
    const select = document.getElementById('taskAssignee');
    
    if (response.success && select) {
        select.innerHTML = '<option value="self">Diri Sendiri</option>';
        response.data.forEach(user => {
            if (user.id !== app.currentUser.id) {
                const opt = document.createElement('option');
                opt.value = user.id;
                opt.textContent = user.fullName || user.username;
                select.appendChild(opt);
            }
        });
    }
}

function createDemoUserIfNeeded() {
    const users = app.userRepository.findAll();
    if (users.length === 0) {
        app.userRepository.create({ username: 'demo', email: 'demo@example.com', fullName: 'Demo User' });
        app.userRepository.create({ username: 'john', email: 'john@example.com', fullName: 'John Doe' });
    }
}

function showMessage(msg, type = 'info') {
    if (app.taskView) {
        app.taskView.showMessage(msg, type);
    } else {
        alert(`${type.toUpperCase()}: ${msg}`);
    }
}

function exportAppData() {
    const data = app.storage.exportData();
    if (data) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        showMessage('Data berhasil diekspor', 'success');
    }
}

function showOverdueTasks() {
    const res = app.taskController.getOverdueTasks();
    if (res.success) showMessage(`Ada ${res.count} tugas terlambat!`, 'warning');
}

function showDueSoonTasks() {
    const res = app.taskController.getTasksDueSoon(3);
    if (res.success) showMessage(`Ada ${res.count} tugas mendekati tenggat (3 hari)`, 'info');
}

// Jalankan aplikasi saat DOM siap
document.addEventListener('DOMContentLoaded', initializeApp);