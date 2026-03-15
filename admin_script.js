document.addEventListener('DOMContentLoaded', () => {
    // Check Auth Status on Load
    checkAuthStatus();

    // Event Listeners
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
    
    // Modal Listeners
    document.getElementById('add-project-btn').addEventListener('click', () => openModal());
    document.getElementById('close-modal').addEventListener('click', closeModal);
    document.getElementById('cancel-modal').addEventListener('click', closeModal);
    document.getElementById('project-form').addEventListener('submit', handleSaveProject);
});

// Utility to get CSRF token from cookies
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// --- Authentication --- //

async function checkAuthStatus() {
    try {
        const response = await fetch('/api/auth/check/');
        const data = await response.json();
        
        if (data.isAuthenticated) {
            showDashboard(data.username);
        } else {
            showAuthScreen();
        }
    } catch (error) {
        showAuthScreen();
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const usernameInput = document.getElementById('username').value;
    const passwordInput = document.getElementById('password').value;
    const errorMsg = document.getElementById('auth-error');
    
    try {
        const response = await fetch('/api/auth/login/', {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({ username: usernameInput, password: passwordInput })
        });
        
        if (response.ok) {
            const data = await response.json();
            showDashboard(data.username);
        } else {
            errorMsg.textContent = 'Invalid username or password';
        }
    } catch (err) {
        errorMsg.textContent = 'Connection error. Please try again.';
    }
}

async function handleLogout() {
    await fetch('/api/auth/logout/', { 
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'X-CSRFToken': getCookie('csrftoken') }
    });
    showAuthScreen();
}

function showDashboard(username) {
    document.getElementById('auth-screen').classList.add('hidden');
    document.getElementById('dashboard-screen').classList.remove('hidden');
    document.getElementById('user-display').textContent = username;
    fetchDashboardProjects();
}

function showAuthScreen() {
    document.getElementById('dashboard-screen').classList.add('hidden');
    document.getElementById('auth-screen').classList.remove('hidden');
    document.getElementById('login-form').reset();
    document.getElementById('auth-error').textContent = '';
}

// --- CRUD Operations --- //

let projectsCache = [];

async function fetchDashboardProjects() {
    const tbody = document.getElementById('projects-tbody');
    const loader = document.getElementById('loader');
    
    tbody.innerHTML = '';
    loader.classList.remove('hidden');
    
    try {
        const response = await fetch('/api/projects/');
        const projects = await response.json();
        projectsCache = projects;
        
        loader.classList.add('hidden');
        
        if(projects.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center">No projects found. Add your first one!</td></tr>';
            return;
        }

        projects.forEach(p => {
            const date = new Date(p.created_at).toLocaleDateString();
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><img src="${p.image}" alt="proj" onerror="this.src='https://via.placeholder.com/50'"></td>
                <td><strong>${p.title}</strong><br><small style="color:var(--text-muted)">${p.url || 'No URL'}</small></td>
                <td>${p.technologies}</td>
                <td>${date}</td>
                <td>
                    <div class="action-btns">
                        <button class="btn-edit" onclick="editProject(${p.id})"><i class='bx bx-edit'></i></button>
                        <button class="btn-delete" onclick="deleteProject(${p.id})"><i class='bx bx-trash'></i></button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
        
    } catch (err) {
        loader.textContent = 'Error loading projects.';
    }
}

async function handleSaveProject(e) {
    e.preventDefault();
    
    const id = document.getElementById('project-id').value;
    const formData = new FormData();
    formData.append('title', document.getElementById('p-title').value);
    formData.append('description', document.getElementById('p-desc').value);
    formData.append('url', document.getElementById('p-url').value);
    formData.append('technologies', document.getElementById('p-tech').value);
    
    const imageFile = document.getElementById('p-image').files[0];
    if (imageFile) {
        formData.append('image', imageFile);
    }
    
    const url = id ? `/api/projects/${id}/` : '/api/projects/';
    const method = id ? 'PATCH' : 'POST';
    
    try {
        const response = await fetch(url, {
            method: method,
            credentials: 'same-origin',
            headers: { 'X-CSRFToken': getCookie('csrftoken') },
            body: formData
        });
        
        if (response.ok) {
            closeModal();
            fetchDashboardProjects();
        } else {
            alert('Failed to save project. Please check if you uploaded an image (required for new ones).');
        }
    } catch (err) {
        alert('Server error saving project.');
    }
}

async function deleteProject(id) {
    if(!confirm("Are you sure you want to delete this project?")) return;
    
    try {
        const response = await fetch(`/api/projects/${id}/`, {
            method: 'DELETE',
            credentials: 'same-origin',
            headers: { 'X-CSRFToken': getCookie('csrftoken') }
        });
        
        if(response.ok) {
            fetchDashboardProjects();
        } else {
            const errText = await response.text();
            alert("Failed to delete project. Server response: " + errText);
            console.error("Delete Error:", errText);
        }
    } catch(err) {
        alert("Server error deleting project.");
    }
}

// --- Modal Utilities --- //

function openModal(project = null) {
    const modal = document.getElementById('project-modal');
    modal.classList.remove('hidden');
    
    if (project) {
        document.getElementById('modal-title').textContent = 'Edit Project';
        document.getElementById('project-id').value = project.id;
        document.getElementById('p-title').value = project.title;
        document.getElementById('p-desc').value = project.description;
        document.getElementById('p-url').value = project.url || '';
        document.getElementById('p-tech').value = project.technologies;
        document.getElementById('current-image-preview').innerHTML = `<img src="${project.image}" style="width:100px; margin-top:10px; border-radius:5px;">`;
    } else {
        document.getElementById('modal-title').textContent = 'Add Project';
        document.getElementById('project-form').reset();
        document.getElementById('project-id').value = '';
        document.getElementById('current-image-preview').innerHTML = '';
    }
}

function closeModal() {
    document.getElementById('project-modal').classList.add('hidden');
}

window.editProject = function(id) {
    const project = projectsCache.find(p => p.id === id);
    if(project) openModal(project);
};

window.deleteProject = deleteProject;
