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

    // Tambahkan di function setupEventListeners()
    // Category filter buttons
    const categoryButtons = document.querySelectorAll('.category-btn');
    categoryButtons.forEach(btn => {
    btn.addEventListener('click', handleCategoryFilter);
});
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

// Tambahkan functions baru di akhir file

/**
 * Handle category filter changes
 */
function handleCategoryFilter(event) {
    const category = event.target.dataset.category;
    
    // Update active category button
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Clear other filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Render tasks filtered by category
    renderTaskList('category', category);
}

/**
 * Update renderTaskList function untuk support category filtering
 */
function renderTaskList(filterType = 'all', filterValue = null) {
    const taskListContainer = document.getElementById('taskList');
    if (!taskListContainer) return;
    
    let tasks = taskService.getAllTasks();
    
    // Apply filters
    switch (filterType) {
        case 'pending':
            tasks = tasks.filter(task => !task.completed);
            break;
        case 'completed':
            tasks = tasks.filter(task => task.completed);
            break;
        case 'high':
            tasks = tasks.filter(task => task.priority === 'high');
            break;
        case 'medium':
            tasks = tasks.filter(task => task.priority === 'medium');
            break;
        case 'low':
            tasks = tasks.filter(task => task.priority === 'low');
            break;
        case 'category':
            tasks = tasks.filter(task => task.category === filterValue);
            break;
    }
    
    // Sort tasks by creation date (newest first)
    tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    if (tasks.length === 0) {
        const filterText = filterType === 'category' ? 
            `in ${filterValue} category` : 
            `with ${filterType} filter`;
            
        taskListContainer.innerHTML = `
            <div class="empty-state">
                <p>No tasks found ${filterText}</p>
                <small>Create your first task using the form above</small>
            </div>
        `;
        return;
    }
    
    const taskHTML = tasks.map(task => createTaskHTML(task)).join('');
    taskListContainer.innerHTML = taskHTML;
}

/**
 * Update createTaskHTML function untuk include category display
 */
function createTaskHTML(task) {
    const priorityClass = `priority-${task.priority}`;
    const completedClass = task.completed ? 'completed' : '';
    const categoryClass = `category-${task.category}`;
    const createdDate = new Date(task.createdAt).toLocaleDateString();
    
    // Get category display name
    const categoryDisplayNames = {
        'work': 'Work',
        'personal': 'Personal',
        'study': 'Study',
        'health': 'Health',
        'finance': 'Finance',
        'shopping': 'Shopping',
        'other': 'Other'
    };
    
    const categoryDisplay = categoryDisplayNames[task.category] || task.category;
    
    return `
        <div class="task-item ${priorityClass} ${completedClass}" data-task-id="${task.id}">
            <div class="task-content">
                <div class="task-header">
                    <h3 class="task-title">${escapeHtml(task.title)}</h3>
                    <div class="task-badges">
                        <span class="task-priority">${task.priority}</span>
                        <span class="task-category ${categoryClass}">${categoryDisplay}</span>
                    </div>
                </div>
                ${task.description ? `<p class="task-description">${escapeHtml(task.description)}</p>` : ''}
                <div class="task-meta">
                    <small>Created: ${createdDate}</small>
                    ${task.completed ? `<small>Completed: ${new Date(task.updatedAt).toLocaleDateString()}</small>` : ''}
                </div>
            </div>
            <div class="task-actions">
                <button class="btn btn-toggle" onclick="handleTaskToggle('${task.id}')" title="${task.completed ? 'Mark incomplete' : 'Mark complete'}">
                    ${task.completed ? '↶' : '✓'}
                </button>
                <button class="btn btn-delete" onclick="handleTaskDelete('${task.id}')" title="Delete task">
                    🗑️
                </button>
            </div>
        </div>
    `;
}

/**
 * Render category statistics
 */
function renderCategoryStats() {
    const statsContainer = document.getElementById('categoryStats');
    if (!statsContainer) return;
    
    const tasks = taskService.getAllTasks();
    const categoryStats = {};
    
    // Initialize categories
    const categories = ['work', 'personal', 'study', 'health', 'finance', 'shopping', 'other'];
    categories.forEach(cat => {
        categoryStats[cat] = { total: 0, completed: 0 };
    });
    
    // Count tasks by category
    tasks.forEach(task => {
        if (categoryStats[task.category]) {
            categoryStats[task.category].total++;
            if (task.completed) {
                categoryStats[task.category].completed++;
            }
        }
    });
    
    // Render stats
    const statsHTML = Object.entries(categoryStats)
        .filter(([category, stats]) => stats.total > 0)
        .map(([category, stats]) => {
            const displayNames = {
                'work': 'Work',
                'personal': 'Personal', 
                'study': 'Study',
                'health': 'Health',
                'finance': 'Finance',
                'shopping': 'Shopping',
                'other': 'Other'
            };
            
            return `
                <div class="category-stat-item">
                    <h4>${displayNames[category]}</h4>
                    <div class="stat-number">${stats.total}</div>
                    <small>${stats.completed} completed</small>
                </div>
            `;
        }).join('');
    
    if (statsHTML) {
        statsContainer.innerHTML = `
            <h3>Tasks by Category</h3>
            <div class="category-stats">${statsHTML}</div>
        `;
    }
}

// Update initializeApp function untuk include category stats
function initializeApp() {
    console.log('🚀 Initializing Task Management System...');
    
    // Initialize storage manager
    storageManager = new StorageManager('taskApp');
    
    // Initialize task service
    taskService = new TaskService(storageManager);
    
    // Set up event listeners
    setupEventListeners();
    
    // Listen for task service events
    taskService.addListener(handleTaskServiceEvent);
    
    // Render initial UI
    renderTaskList();
    renderTaskStats();
    renderCategoryStats(); // NEW: Render category stats
    
    console.log('✅ Application initialized successfully!');
    console.log(`📊 Loaded ${taskService.getAllTasks().length} existing tasks`);
}