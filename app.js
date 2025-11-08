// Data storage (using localStorage for persistence)
let credentials = [];
let users = [];
let currentUser = null;
let providers = [];
let locations = [];
let payers = [];
let enrollments = [];

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadUsers();
    checkAuth();
    loadCredentials();
    loadProviders();
    loadLocations();
    loadPayers();
    loadEnrollments();
});

// === Authentication Functions ===

function loadUsers() {
    const stored = localStorage.getItem('users');
    if (stored) {
        users = JSON.parse(stored);
    } else {
        // Create demo users
        users = [
            {
                id: 'user-001',
                name: 'Jane Issuer',
                email: 'issuer@demo.com',
                password: 'demo123',
                role: 'issuer',
                organization: 'Tech Academy'
            },
            {
                id: 'user-002',
                name: 'John Recipient',
                email: 'recipient@demo.com',
                password: 'demo123',
                role: 'recipient',
                organization: ''
            }
        ];
        saveUsers();
    }
}

function saveUsers() {
    localStorage.setItem('users', JSON.stringify(users));
}

function checkAuth() {
    const stored = localStorage.getItem('currentUser');
    if (stored) {
        currentUser = JSON.parse(stored);
        showMainApp();
    } else {
        showAuthScreen();
    }
}

function showAuthScreen() {
    document.getElementById('auth-screen').style.display = 'flex';
    document.getElementById('main-app').style.display = 'none';
}

function showMainApp() {
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('main-app').style.display = 'block';
    updateUserInterface();
    renderCredentials();
}

function switchAuthForm(formType) {
    event.preventDefault();
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (formType === 'register') {
        loginForm.classList.remove('active');
        registerForm.classList.add('active');
    } else {
        registerForm.classList.remove('active');
        loginForm.classList.add('active');
    }
}

function login(event) {
    event.preventDefault();

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        showMainApp();
    } else {
        alert('Invalid email or password. Try:\nIssuer: issuer@demo.com / demo123\nRecipient: recipient@demo.com / demo123');
    }
}

function register(event) {
    event.preventDefault();

    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const organization = document.getElementById('reg-organization').value;
    const role = document.getElementById('reg-role').value;

    // Check if email already exists
    if (users.find(u => u.email === email)) {
        alert('An account with this email already exists.');
        return;
    }

    const newUser = {
        id: `user-${Date.now()}`,
        name,
        email,
        password,
        role,
        organization
    };

    users.push(newUser);
    saveUsers();

    currentUser = newUser;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    showMainApp();
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    showAuthScreen();

    // Reset nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector('.nav-btn').classList.add('active');
}

function updateUserInterface() {
    // Update user info in navbar
    document.getElementById('user-name').textContent = currentUser.name;
    const roleBadge = document.getElementById('user-role-badge');
    roleBadge.textContent = currentUser.role;
    roleBadge.className = `user-role ${currentUser.role}`;

    // Show/hide issuer-only features
    const issuerElements = document.querySelectorAll('.issuer-only');
    issuerElements.forEach(el => {
        el.style.display = currentUser.role === 'issuer' ? 'block' : 'none';
    });

    // Update dashboard header based on role
    const dashboardHeader = document.querySelector('#dashboard-view .view-header h1');
    if (currentUser.role === 'issuer') {
        dashboardHeader.textContent = 'Issued Credentials';
    } else {
        dashboardHeader.textContent = 'My Credentials';
    }
}

// === Credential Management ===

function loadCredentials() {
    const stored = localStorage.getItem('credentials');
    if (stored) {
        credentials = JSON.parse(stored);
    } else {
        // Add some sample data
        credentials = [
            {
                id: 'CRED-2024-001',
                name: 'Advanced JavaScript Certification',
                type: 'Certification',
                recipient: 'John Smith',
                recipientEmail: 'john@example.com',
                issuer: 'Tech Academy',
                issuerId: 'user-001',
                issueDate: '2024-01-15',
                expiryDate: '2026-01-15',
                status: 'Active'
            },
            {
                id: 'CRED-2024-002',
                name: 'Project Management Professional',
                type: 'License',
                recipient: 'Sarah Johnson',
                recipientEmail: 'sarah@example.com',
                issuer: 'Tech Academy',
                issuerId: 'user-001',
                issueDate: '2023-06-20',
                expiryDate: '2024-06-20',
                status: 'Expired'
            },
            {
                id: 'CRED-2024-003',
                name: 'Cybersecurity Specialist Badge',
                type: 'Badge',
                recipient: 'Michael Chen',
                recipientEmail: 'michael@example.com',
                issuer: 'CyberSec Global',
                issuerId: 'user-003',
                issueDate: '2024-09-10',
                expiryDate: '',
                status: 'Active'
            }
        ];
        saveCredentials();
    }
}

// Save credentials to localStorage
function saveCredentials() {
    localStorage.setItem('credentials', JSON.stringify(credentials));
}

// Generate unique credential ID
function generateCredentialId() {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 9000) + 1000;
    return `CRED-${year}-${random}`;
}

// Render all credentials (filtered by role)
function renderCredentials() {
    const container = document.getElementById('credentials-list');

    if (!currentUser) return;

    // Filter credentials based on role
    let filteredCreds = credentials;
    if (currentUser.role === 'issuer') {
        // Show credentials issued by this user
        filteredCreds = credentials.filter(c => c.issuerId === currentUser.id);
    } else {
        // Show credentials received by this user
        filteredCreds = credentials.filter(c => c.recipientEmail === currentUser.email);
    }

    if (filteredCreds.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h2>No credentials found</h2>
                <p>${currentUser.role === 'issuer' ? 'Click "Add Credential" to issue your first credential.' : 'You have not received any credentials yet.'}</p>
            </div>
        `;
        return;
    }

    container.innerHTML = filteredCreds.map(cred => `
        <div class="credential-card">
            <div class="credential-header">
                <span class="credential-id">${cred.id}</span>
                <span class="credential-status status-${cred.status.toLowerCase()}">${cred.status}</span>
            </div>
            <div class="credential-name">${cred.name}</div>
            <span class="credential-type">${cred.type}</span>
            <div class="credential-details">
                <div class="credential-detail">
                    <span class="detail-label">Recipient:</span>
                    <span class="detail-value">${cred.recipient}</span>
                </div>
                <div class="credential-detail">
                    <span class="detail-label">Issuer:</span>
                    <span class="detail-value">${cred.issuer}</span>
                </div>
                <div class="credential-detail">
                    <span class="detail-label">Issued:</span>
                    <span class="detail-value">${formatDate(cred.issueDate)}</span>
                </div>
                ${cred.expiryDate ? `
                <div class="credential-detail">
                    <span class="detail-label">Expires:</span>
                    <span class="detail-value">${formatDate(cred.expiryDate)}</span>
                </div>
                ` : ''}
            </div>
            ${currentUser.role === 'issuer' ? `
            <div class="credential-actions">
                <button class="btn btn-primary btn-small" onclick="editCredential('${cred.id}')">Edit</button>
                <button class="btn btn-danger btn-small" onclick="deleteCredential('${cred.id}')">Delete</button>
            </div>
            ` : ''}
        </div>
    `).join('');
}

// Render recipients (for issuers only)
function renderRecipients() {
    const container = document.getElementById('recipients-list');

    if (!currentUser || currentUser.role !== 'issuer') {
        container.innerHTML = '<p>Access denied</p>';
        return;
    }

    // Get unique recipients from credentials issued by this user
    const recipientMap = new Map();
    credentials
        .filter(c => c.issuerId === currentUser.id)
        .forEach(cred => {
            const key = cred.recipientEmail;
            if (!recipientMap.has(key)) {
                recipientMap.set(key, {
                    name: cred.recipient,
                    email: cred.recipientEmail,
                    credentials: []
                });
            }
            recipientMap.get(key).credentials.push(cred);
        });

    const recipients = Array.from(recipientMap.values());

    if (recipients.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h2>No recipients yet</h2>
                <p>Issue credentials to see recipients here.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = recipients.map(recipient => {
        const activeCount = recipient.credentials.filter(c => c.status === 'Active').length;
        const totalCount = recipient.credentials.length;

        return `
            <div class="recipient-card">
                <div class="recipient-name">${recipient.name}</div>
                <div class="recipient-email">${recipient.email}</div>
                <div class="recipient-stats">
                    <div class="stat">
                        <div class="stat-value">${totalCount}</div>
                        <div class="stat-label">Total</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value">${activeCount}</div>
                        <div class="stat-label">Active</div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Format date for display
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// Show/hide views
function showView(viewName) {
    // Update nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    // Update views
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    document.getElementById(`${viewName}-view`).classList.add('active');

    // Render content for specific views
    if (viewName === 'providers') {
        renderProviders();
    } else if (viewName === 'locations') {
        renderLocations();
    } else if (viewName === 'payers') {
        renderPayers();
    } else if (viewName === 'enrollments') {
        renderEnrollments();
    }
}

// Modal functions
function showAddModal() {
    document.getElementById('modal-title').textContent = 'Add Credential';
    document.getElementById('credential-form').reset();
    document.getElementById('edit-id').value = '';

    // Hide issuer field for issuers (auto-filled from their organization)
    const issuerField = document.getElementById('issuer-field');
    if (currentUser && currentUser.role === 'issuer') {
        issuerField.style.display = 'none';
        document.getElementById('cred-issuer').removeAttribute('required');
    } else {
        issuerField.style.display = 'block';
        document.getElementById('cred-issuer').setAttribute('required', '');
    }

    document.getElementById('credential-modal').classList.add('active');
}

function closeModal() {
    document.getElementById('credential-modal').classList.remove('active');
}

// Save credential (add or edit)
function saveCredential(event) {
    event.preventDefault();

    const id = document.getElementById('edit-id').value;
    const recipientName = document.getElementById('cred-recipient').value;

    // For issuer role, automatically use their organization as issuer
    const issuerValue = currentUser.role === 'issuer'
        ? (currentUser.organization || currentUser.name)
        : document.getElementById('cred-issuer').value;

    const credentialData = {
        id: id || generateCredentialId(),
        name: document.getElementById('cred-name').value,
        type: document.getElementById('cred-type').value,
        recipient: recipientName,
        recipientEmail: document.getElementById('cred-recipient-email').value,
        issuer: issuerValue,
        issuerId: currentUser.role === 'issuer' ? currentUser.id : (id ? credentials.find(c => c.id === id)?.issuerId : 'unknown'),
        issueDate: document.getElementById('cred-issue-date').value,
        expiryDate: document.getElementById('cred-expiry-date').value,
        status: document.getElementById('cred-status').value
    };

    if (id) {
        // Edit existing credential
        const index = credentials.findIndex(c => c.id === id);
        if (index !== -1) {
            credentials[index] = credentialData;
        }
    } else {
        // Add new credential
        credentials.push(credentialData);
    }

    saveCredentials();
    renderCredentials();
    closeModal();
}

// Edit credential
function editCredential(id) {
    const credential = credentials.find(c => c.id === id);
    if (!credential) return;

    document.getElementById('modal-title').textContent = 'Edit Credential';
    document.getElementById('edit-id').value = credential.id;
    document.getElementById('cred-name').value = credential.name;
    document.getElementById('cred-type').value = credential.type;
    document.getElementById('cred-recipient').value = credential.recipient;
    document.getElementById('cred-recipient-email').value = credential.recipientEmail || '';
    document.getElementById('cred-issuer').value = credential.issuer;
    document.getElementById('cred-issue-date').value = credential.issueDate;
    document.getElementById('cred-expiry-date').value = credential.expiryDate;
    document.getElementById('cred-status').value = credential.status;

    // Hide issuer field for issuers
    const issuerField = document.getElementById('issuer-field');
    if (currentUser && currentUser.role === 'issuer') {
        issuerField.style.display = 'none';
        document.getElementById('cred-issuer').removeAttribute('required');
    } else {
        issuerField.style.display = 'block';
        document.getElementById('cred-issuer').setAttribute('required', '');
    }

    document.getElementById('credential-modal').classList.add('active');
}

// Delete credential
function deleteCredential(id) {
    if (confirm('Are you sure you want to delete this credential?')) {
        credentials = credentials.filter(c => c.id !== id);
        saveCredentials();
        renderCredentials();
    }
}

// Verify credential
function verifyCredential() {
    const credId = document.getElementById('credential-id').value.trim();
    const resultContainer = document.getElementById('verification-result');

    if (!credId) {
        resultContainer.innerHTML = `
            <div class="verify-card invalid">
                <div class="verify-header">
                    <div class="verify-icon invalid">⚠️</div>
                    <div class="verify-title invalid">Invalid Input</div>
                </div>
                <p>Please enter a credential ID to verify.</p>
            </div>
        `;
        return;
    }

    const credential = credentials.find(c => c.id === credId);

    if (!credential) {
        resultContainer.innerHTML = `
            <div class="verify-card invalid">
                <div class="verify-header">
                    <div class="verify-icon invalid">❌</div>
                    <div class="verify-title invalid">Credential Not Found</div>
                </div>
                <p>No credential found with ID: <strong>${credId}</strong></p>
                <p style="margin-top: 1rem; color: #7f8c8d;">This credential may not exist or has been revoked.</p>
            </div>
        `;
        return;
    }

    const isValid = credential.status === 'Active';

    resultContainer.innerHTML = `
        <div class="verify-card ${isValid ? 'valid' : 'invalid'}">
            <div class="verify-header">
                <div class="verify-icon ${isValid ? 'valid' : 'invalid'}">${isValid ? '✓' : '❌'}</div>
                <div class="verify-title ${isValid ? 'valid' : 'invalid'}">
                    ${isValid ? 'Valid Credential' : 'Invalid Credential'}
                </div>
            </div>
            ${!isValid ? `<p style="color: #e74c3c; margin-bottom: 1rem;">This credential is ${credential.status.toLowerCase()}.</p>` : ''}
            <div class="verify-details">
                <div class="verify-detail">
                    <span class="verify-label">Credential ID:</span>
                    <span class="verify-value">${credential.id}</span>
                </div>
                <div class="verify-detail">
                    <span class="verify-label">Name:</span>
                    <span class="verify-value">${credential.name}</span>
                </div>
                <div class="verify-detail">
                    <span class="verify-label">Type:</span>
                    <span class="verify-value">${credential.type}</span>
                </div>
                <div class="verify-detail">
                    <span class="verify-label">Recipient:</span>
                    <span class="verify-value">${credential.recipient}</span>
                </div>
                <div class="verify-detail">
                    <span class="verify-label">Issuing Organization:</span>
                    <span class="verify-value">${credential.issuer}</span>
                </div>
                <div class="verify-detail">
                    <span class="verify-label">Issue Date:</span>
                    <span class="verify-value">${formatDate(credential.issueDate)}</span>
                </div>
                ${credential.expiryDate ? `
                <div class="verify-detail">
                    <span class="verify-label">Expiry Date:</span>
                    <span class="verify-value">${formatDate(credential.expiryDate)}</span>
                </div>
                ` : ''}
                <div class="verify-detail">
                    <span class="verify-label">Status:</span>
                    <span class="verify-value" style="color: ${isValid ? '#27ae60' : '#e74c3c'};">${credential.status}</span>
                </div>
            </div>
        </div>
    `;
}

// === Provider Management ===

function loadProviders() {
    const stored = localStorage.getItem('providers');
    if (stored) {
        providers = JSON.parse(stored);
    } else {
        providers = [
            {
                id: 'PROV-001',
                name: 'Dr. Sarah Johnson',
                npi: '1234567890',
                specialty: 'Cardiology',
                license: 'CA-12345',
                state: 'CA',
                email: 'sarah.johnson@hospital.com',
                phone: '(555) 123-4567',
                locationId: 'LOC-001',
                status: 'Active'
            },
            {
                id: 'PROV-002',
                name: 'Dr. Michael Chen',
                npi: '9876543210',
                specialty: 'Pediatrics',
                license: 'NY-67890',
                state: 'NY',
                email: 'michael.chen@clinic.com',
                phone: '(555) 987-6543',
                locationId: 'LOC-002',
                status: 'Active'
            }
        ];
        saveProviders();
    }
}

function saveProviders() {
    localStorage.setItem('providers', JSON.stringify(providers));
}

function renderProviders() {
    const container = document.getElementById('providers-list');

    if (providers.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h2>No providers found</h2>
                <p>Click "Add Provider" to add your first provider.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = providers.map(provider => {
        const location = locations.find(l => l.id === provider.locationId);

        return `
        <div class="provider-card">
            <div class="card-header">
                <span class="card-id">${provider.id}</span>
                <span class="credential-status status-${provider.status.toLowerCase()}">${provider.status}</span>
            </div>
            <div class="card-title">${provider.name}</div>
            <span class="card-subtitle">${provider.specialty}</span>
            <div class="card-details">
                <div class="card-detail">
                    <span class="detail-label">NPI:</span>
                    <span class="detail-value">${provider.npi}</span>
                </div>
                <div class="card-detail">
                    <span class="detail-label">License:</span>
                    <span class="detail-value">${provider.license} (${provider.state})</span>
                </div>
                ${location ? `
                <div class="card-detail">
                    <span class="detail-label">Location:</span>
                    <span class="detail-value">${location.name}</span>
                </div>
                <div class="card-detail">
                    <span class="detail-label">Address:</span>
                    <span class="detail-value">${location.city}, ${location.state}</span>
                </div>
                ` : ''}
                <div class="card-detail">
                    <span class="detail-label">Email:</span>
                    <span class="detail-value">${provider.email}</span>
                </div>
                <div class="card-detail">
                    <span class="detail-label">Phone:</span>
                    <span class="detail-value">${provider.phone}</span>
                </div>
            </div>
            <div class="card-actions">
                <button class="btn btn-primary btn-small" onclick="editProvider('${provider.id}')">Edit</button>
                <button class="btn btn-danger btn-small" onclick="deleteProvider('${provider.id}')">Delete</button>
            </div>
        </div>
        `;
    }).join('');
}

function populateProviderLocationDropdown() {
    const locationSelect = document.getElementById('provider-location');
    locationSelect.innerHTML = '<option value="">Select Location</option>' +
        locations.map(l => `<option value="${l.id}">${l.name} - ${l.city}, ${l.state}</option>`).join('');
}

function showProviderModal() {
    document.getElementById('provider-modal-title').textContent = 'Add Provider';
    document.getElementById('provider-form').reset();
    document.getElementById('provider-edit-id').value = '';
    populateProviderLocationDropdown();
    document.getElementById('provider-modal').classList.add('active');
}

function closeProviderModal() {
    document.getElementById('provider-modal').classList.remove('active');
}

function saveProvider(event) {
    event.preventDefault();

    const id = document.getElementById('provider-edit-id').value;
    const providerData = {
        id: id || `PROV-${String(providers.length + 1).padStart(3, '0')}`,
        name: document.getElementById('provider-name').value,
        npi: document.getElementById('provider-npi').value,
        specialty: document.getElementById('provider-specialty').value,
        license: document.getElementById('provider-license').value,
        state: document.getElementById('provider-state').value,
        email: document.getElementById('provider-email').value,
        phone: document.getElementById('provider-phone').value,
        locationId: document.getElementById('provider-location').value,
        status: document.getElementById('provider-status').value
    };

    if (id) {
        const index = providers.findIndex(p => p.id === id);
        if (index !== -1) {
            providers[index] = providerData;
        }
    } else {
        providers.push(providerData);
    }

    saveProviders();
    renderProviders();
    closeProviderModal();
}

function editProvider(id) {
    const provider = providers.find(p => p.id === id);
    if (!provider) return;

    document.getElementById('provider-modal-title').textContent = 'Edit Provider';
    document.getElementById('provider-edit-id').value = provider.id;
    document.getElementById('provider-name').value = provider.name;
    document.getElementById('provider-npi').value = provider.npi;
    document.getElementById('provider-specialty').value = provider.specialty;
    document.getElementById('provider-license').value = provider.license;
    document.getElementById('provider-state').value = provider.state;
    document.getElementById('provider-email').value = provider.email;
    document.getElementById('provider-phone').value = provider.phone;
    populateProviderLocationDropdown();
    document.getElementById('provider-location').value = provider.locationId || '';
    document.getElementById('provider-status').value = provider.status;

    document.getElementById('provider-modal').classList.add('active');
}

function deleteProvider(id) {
    if (confirm('Are you sure you want to delete this provider?')) {
        providers = providers.filter(p => p.id !== id);
        saveProviders();
        renderProviders();
    }
}

// === Location Management ===

function loadLocations() {
    const stored = localStorage.getItem('locations');
    if (stored) {
        locations = JSON.parse(stored);
    } else {
        locations = [
            {
                id: 'LOC-001',
                name: 'Memorial Hospital - Main Campus',
                type: 'Hospital',
                address: '123 Medical Center Drive',
                city: 'Los Angeles',
                state: 'CA',
                zip: '90001',
                phone: '(310) 555-1234',
                status: 'Active'
            },
            {
                id: 'LOC-002',
                name: 'Downtown Medical Clinic',
                type: 'Clinic',
                address: '456 Health Street',
                city: 'New York',
                state: 'NY',
                zip: '10001',
                phone: '(212) 555-5678',
                status: 'Active'
            }
        ];
        saveLocations();
    }
}

function saveLocations() {
    localStorage.setItem('locations', JSON.stringify(locations));
}

function renderLocations() {
    const container = document.getElementById('locations-list');

    if (locations.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h2>No locations found</h2>
                <p>Click "Add Location" to add your first location.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = locations.map(location => `
        <div class="location-card">
            <div class="card-header">
                <span class="card-id">${location.id}</span>
                <span class="credential-status status-${location.status.toLowerCase().replace(' ', '-')}">${location.status}</span>
            </div>
            <div class="card-title">${location.name}</div>
            <span class="card-subtitle">${location.type}</span>
            <div class="card-details">
                <div class="card-detail">
                    <span class="detail-label">Address:</span>
                    <span class="detail-value">${location.address}</span>
                </div>
                <div class="card-detail">
                    <span class="detail-label">City/State:</span>
                    <span class="detail-value">${location.city}, ${location.state} ${location.zip}</span>
                </div>
                <div class="card-detail">
                    <span class="detail-label">Phone:</span>
                    <span class="detail-value">${location.phone}</span>
                </div>
            </div>
            <div class="card-actions">
                <button class="btn btn-primary btn-small" onclick="editLocation('${location.id}')">Edit</button>
                <button class="btn btn-danger btn-small" onclick="deleteLocation('${location.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

function showLocationModal() {
    document.getElementById('location-modal-title').textContent = 'Add Location';
    document.getElementById('location-form').reset();
    document.getElementById('location-edit-id').value = '';
    document.getElementById('location-modal').classList.add('active');
}

function closeLocationModal() {
    document.getElementById('location-modal').classList.remove('active');
}

function saveLocation(event) {
    event.preventDefault();

    const id = document.getElementById('location-edit-id').value;
    const locationData = {
        id: id || `LOC-${String(locations.length + 1).padStart(3, '0')}`,
        name: document.getElementById('location-name').value,
        type: document.getElementById('location-type').value,
        address: document.getElementById('location-address').value,
        city: document.getElementById('location-city').value,
        state: document.getElementById('location-state').value,
        zip: document.getElementById('location-zip').value,
        phone: document.getElementById('location-phone').value,
        status: document.getElementById('location-status').value
    };

    if (id) {
        const index = locations.findIndex(l => l.id === id);
        if (index !== -1) {
            locations[index] = locationData;
        }
    } else {
        locations.push(locationData);
    }

    saveLocations();
    renderLocations();
    closeLocationModal();
}

function editLocation(id) {
    const location = locations.find(l => l.id === id);
    if (!location) return;

    document.getElementById('location-modal-title').textContent = 'Edit Location';
    document.getElementById('location-edit-id').value = location.id;
    document.getElementById('location-name').value = location.name;
    document.getElementById('location-type').value = location.type;
    document.getElementById('location-address').value = location.address;
    document.getElementById('location-city').value = location.city;
    document.getElementById('location-state').value = location.state;
    document.getElementById('location-zip').value = location.zip;
    document.getElementById('location-phone').value = location.phone;
    document.getElementById('location-status').value = location.status;

    document.getElementById('location-modal').classList.add('active');
}

function deleteLocation(id) {
    if (confirm('Are you sure you want to delete this location?')) {
        locations = locations.filter(l => l.id !== id);
        saveLocations();
        renderLocations();
    }
}

// === Payer Management ===

function loadPayers() {
    const stored = localStorage.getItem('payers');
    if (stored) {
        payers = JSON.parse(stored);
    } else {
        payers = [
            {
                id: 'PAY-001',
                name: 'Blue Cross Blue Shield',
                type: 'Commercial',
                payerId: '12345',
                contact: 'Jane Smith',
                phone: '(800) 555-1234',
                email: 'provider.relations@bcbs.com',
                status: 'Active'
            },
            {
                id: 'PAY-002',
                name: 'Medicare',
                type: 'Medicare',
                payerId: '00001',
                contact: 'Medicare Services',
                phone: '(800) 633-4227',
                email: 'provider@medicare.gov',
                status: 'Active'
            }
        ];
        savePayers();
    }
}

function savePayers() {
    localStorage.setItem('payers', JSON.stringify(payers));
}

function renderPayers() {
    const container = document.getElementById('payers-list');

    if (payers.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h2>No payers found</h2>
                <p>Click "Add Payer" to add your first payer.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = payers.map(payer => `
        <div class="payer-card">
            <div class="card-header">
                <span class="card-id">${payer.id}</span>
                <span class="credential-status status-${payer.status.toLowerCase()}">${payer.status}</span>
            </div>
            <div class="card-title">${payer.name}</div>
            <span class="card-subtitle">${payer.type}</span>
            <div class="card-details">
                <div class="card-detail">
                    <span class="detail-label">Payer ID:</span>
                    <span class="detail-value">${payer.payerId}</span>
                </div>
                <div class="card-detail">
                    <span class="detail-label">Contact:</span>
                    <span class="detail-value">${payer.contact}</span>
                </div>
                <div class="card-detail">
                    <span class="detail-label">Phone:</span>
                    <span class="detail-value">${payer.phone}</span>
                </div>
                <div class="card-detail">
                    <span class="detail-label">Email:</span>
                    <span class="detail-value">${payer.email}</span>
                </div>
            </div>
            <div class="card-actions">
                <button class="btn btn-primary btn-small" onclick="editPayer('${payer.id}')">Edit</button>
                <button class="btn btn-danger btn-small" onclick="deletePayer('${payer.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

function showPayerModal() {
    document.getElementById('payer-modal-title').textContent = 'Add Payer';
    document.getElementById('payer-form').reset();
    document.getElementById('payer-edit-id').value = '';
    document.getElementById('payer-modal').classList.add('active');
}

function closePayerModal() {
    document.getElementById('payer-modal').classList.remove('active');
}

function savePayer(event) {
    event.preventDefault();

    const id = document.getElementById('payer-edit-id').value;
    const payerData = {
        id: id || `PAY-${String(payers.length + 1).padStart(3, '0')}`,
        name: document.getElementById('payer-name').value,
        type: document.getElementById('payer-type').value,
        payerId: document.getElementById('payer-id').value,
        contact: document.getElementById('payer-contact').value,
        phone: document.getElementById('payer-phone').value,
        email: document.getElementById('payer-email').value,
        status: document.getElementById('payer-status').value
    };

    if (id) {
        const index = payers.findIndex(p => p.id === id);
        if (index !== -1) {
            payers[index] = payerData;
        }
    } else {
        payers.push(payerData);
    }

    savePayers();
    renderPayers();
    closePayerModal();
}

function editPayer(id) {
    const payer = payers.find(p => p.id === id);
    if (!payer) return;

    document.getElementById('payer-modal-title').textContent = 'Edit Payer';
    document.getElementById('payer-edit-id').value = payer.id;
    document.getElementById('payer-name').value = payer.name;
    document.getElementById('payer-type').value = payer.type;
    document.getElementById('payer-id').value = payer.payerId;
    document.getElementById('payer-contact').value = payer.contact;
    document.getElementById('payer-phone').value = payer.phone;
    document.getElementById('payer-email').value = payer.email;
    document.getElementById('payer-status').value = payer.status;

    document.getElementById('payer-modal').classList.add('active');
}

function deletePayer(id) {
    if (confirm('Are you sure you want to delete this payer?')) {
        payers = payers.filter(p => p.id !== id);
        savePayers();
        renderPayers();
    }
}

// === Enrollment Management ===

function loadEnrollments() {
    const stored = localStorage.getItem('enrollments');
    if (stored) {
        enrollments = JSON.parse(stored);
    } else {
        enrollments = [
            {
                id: 'ENR-001',
                providerId: 'PROV-001',
                payerId: 'PAY-001',
                applicationDate: '2024-01-15',
                effectiveDate: '2024-02-01',
                status: 'Approved',
                notes: 'Initial enrollment approved'
            },
            {
                id: 'ENR-002',
                providerId: 'PROV-002',
                payerId: 'PAY-002',
                applicationDate: '2024-03-10',
                effectiveDate: '',
                status: 'Pending',
                notes: 'Waiting for background check'
            }
        ];
        saveEnrollments();
    }
}

function saveEnrollments() {
    localStorage.setItem('enrollments', JSON.stringify(enrollments));
}

function renderEnrollments() {
    const container = document.getElementById('enrollments-list');

    if (enrollments.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h2>No enrollments found</h2>
                <p>Click "Add Enrollment" to add your first enrollment.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = enrollments.map(enrollment => {
        const provider = providers.find(p => p.id === enrollment.providerId);
        const payer = payers.find(p => p.id === enrollment.payerId);

        return `
            <div class="enrollment-card">
                <div class="card-header">
                    <span class="card-id">${enrollment.id}</span>
                    <span class="credential-status status-${enrollment.status.toLowerCase().replace(' ', '-')}">${enrollment.status}</span>
                </div>
                <div class="card-title">${provider ? provider.name : 'Unknown Provider'}</div>
                <span class="card-subtitle">${payer ? payer.name : 'Unknown Payer'}</span>
                <div class="card-details">
                    <div class="card-detail">
                        <span class="detail-label">Application Date:</span>
                        <span class="detail-value">${formatDate(enrollment.applicationDate)}</span>
                    </div>
                    ${enrollment.effectiveDate ? `
                    <div class="card-detail">
                        <span class="detail-label">Effective Date:</span>
                        <span class="detail-value">${formatDate(enrollment.effectiveDate)}</span>
                    </div>
                    ` : ''}
                    ${enrollment.notes ? `
                    <div class="card-detail">
                        <span class="detail-label">Notes:</span>
                        <span class="detail-value">${enrollment.notes}</span>
                    </div>
                    ` : ''}
                </div>
                <div class="card-actions">
                    <button class="btn btn-primary btn-small" onclick="editEnrollment('${enrollment.id}')">Edit</button>
                    <button class="btn btn-danger btn-small" onclick="deleteEnrollment('${enrollment.id}')">Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

function populateEnrollmentDropdowns() {
    const providerSelect = document.getElementById('enrollment-provider');
    const payerSelect = document.getElementById('enrollment-payer');

    providerSelect.innerHTML = '<option value="">Select Provider</option>' +
        providers.map(p => `<option value="${p.id}">${p.name} - ${p.specialty}</option>`).join('');

    payerSelect.innerHTML = '<option value="">Select Payer</option>' +
        payers.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
}

function showEnrollmentModal() {
    document.getElementById('enrollment-modal-title').textContent = 'Add Enrollment';
    document.getElementById('enrollment-form').reset();
    document.getElementById('enrollment-edit-id').value = '';
    populateEnrollmentDropdowns();
    document.getElementById('enrollment-modal').classList.add('active');
}

function closeEnrollmentModal() {
    document.getElementById('enrollment-modal').classList.remove('active');
}

function saveEnrollment(event) {
    event.preventDefault();

    const id = document.getElementById('enrollment-edit-id').value;
    const enrollmentData = {
        id: id || `ENR-${String(enrollments.length + 1).padStart(3, '0')}`,
        providerId: document.getElementById('enrollment-provider').value,
        payerId: document.getElementById('enrollment-payer').value,
        applicationDate: document.getElementById('enrollment-application-date').value,
        effectiveDate: document.getElementById('enrollment-effective-date').value,
        status: document.getElementById('enrollment-status').value,
        notes: document.getElementById('enrollment-notes').value
    };

    if (id) {
        const index = enrollments.findIndex(e => e.id === id);
        if (index !== -1) {
            enrollments[index] = enrollmentData;
        }
    } else {
        enrollments.push(enrollmentData);
    }

    saveEnrollments();
    renderEnrollments();
    closeEnrollmentModal();
}

function editEnrollment(id) {
    const enrollment = enrollments.find(e => e.id === id);
    if (!enrollment) return;

    document.getElementById('enrollment-modal-title').textContent = 'Edit Enrollment';
    document.getElementById('enrollment-edit-id').value = enrollment.id;
    populateEnrollmentDropdowns();
    document.getElementById('enrollment-provider').value = enrollment.providerId;
    document.getElementById('enrollment-payer').value = enrollment.payerId;
    document.getElementById('enrollment-application-date').value = enrollment.applicationDate;
    document.getElementById('enrollment-effective-date').value = enrollment.effectiveDate;
    document.getElementById('enrollment-status').value = enrollment.status;
    document.getElementById('enrollment-notes').value = enrollment.notes;

    document.getElementById('enrollment-modal').classList.add('active');
}

function deleteEnrollment(id) {
    if (confirm('Are you sure you want to delete this enrollment?')) {
        enrollments = enrollments.filter(e => e.id !== id);
        saveEnrollments();
        renderEnrollments();
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modals = ['credential-modal', 'provider-modal', 'location-modal', 'payer-modal', 'enrollment-modal'];
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (event.target === modal) {
            modal.classList.remove('active');
        }
    });
}
