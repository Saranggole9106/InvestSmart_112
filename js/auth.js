// Authentication JavaScript for InvestSmart
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }
//Checks if user is logged in and redirects pages accordingly.

    init() {
        // Check if user is already logged in
        const savedUser = localStorage.getItem('investsmart_user');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            // Redirect to main app if already logged in
            if (window.location.pathname.includes('login.html')) {
                window.location.href = 'index.html';
            }
        } else {
            // Redirect to login page if not logged in and trying to access protected pages
            if (!window.location.pathname.includes('login.html')) {
                window.location.href = 'login.html';
            }
        }
    }

    // Show toast notification
    showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        toastContainer.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 4000);
    }

    // Validate email format
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Validate password strength
    validatePassword(password) {
        return password.length >= 6;
    }

    // Handle user registration
    handleSignup(formData) {
        const { name, email, password, confirmPassword } = formData;

        // Validation
        if (!name.trim()) {
            this.showToast('Please enter your full name', 'error');
            return false;
        }

        if (!this.validateEmail(email)) {
            this.showToast('Please enter a valid email address', 'error');
            return false;
        }

        if (!this.validatePassword(password)) {
            this.showToast('Password must be at least 6 characters long', 'error');
            return false;
        }

        if (password !== confirmPassword) {
            this.showToast('Passwords do not match', 'error');
            return false;
        }

        // Check if user already exists
        const existingUsers = JSON.parse(localStorage.getItem('investsmart_users') || '[]');
        if (existingUsers.find(user => user.email === email)) {
            this.showToast('An account with this email already exists', 'error');
            return false;
        }

        // Create new user
        const newUser = {
            id: Date.now().toString(),
            name: name.trim(),
            email: email.toLowerCase(),
            password: btoa(password), // Simple encoding (not secure for production)
            createdAt: new Date().toISOString(),
            portfolio: {
                totalValue: 10000,
                totalInvested: 8000,
                totalPnL: 2000,
                totalPnLPercent: 25,
                holdings: [
                    { symbol: 'AAPL', shares: 10, avgPrice: 150, currentPrice: 180, value: 1800, pnl: 300 },
                    { symbol: 'MSFT', shares: 5, avgPrice: 200, currentPrice: 250, value: 1250, pnl: 250 },
                    { symbol: 'GOOGL', shares: 2, avgPrice: 1200, currentPrice: 1400, value: 2800, pnl: 400 },
                    { symbol: 'TSLA', shares: 3, avgPrice: 600, currentPrice: 700, value: 2100, pnl: 300 }
                ]
            },
            preferences: {
                theme: 'light',
                currency: 'USD',
                notifications: true
            }
        };

        // Save user to storage
        existingUsers.push(newUser);
        localStorage.setItem('investsmart_users', JSON.stringify(existingUsers));

        this.showToast('Account created successfully! Please log in.', 'success');
        
        // Switch to login tab
        setTimeout(() => {
            showTab('login');
            document.getElementById('login-email').value = email;
        }, 1500);

        return true;
    }

    // Handle user login
    handleLogin(formData) {
        const { email, password, rememberMe } = formData;

        if (!this.validateEmail(email)) {
            this.showToast('Please enter a valid email address', 'error');
            return false;
        }

        if (!password) {
            this.showToast('Please enter your password', 'error');
            return false;
        }

        // Find user in storage
        const existingUsers = JSON.parse(localStorage.getItem('investsmart_users') || '[]');
        const user = existingUsers.find(u => 
            u.email === email.toLowerCase() && 
            atob(u.password) === password
        );

        if (!user) {
            this.showToast('Invalid email or password', 'error');
            return false;
        }

        // Set current user
        this.currentUser = user;
        
        // Save login state
        if (rememberMe) {
            localStorage.setItem('investsmart_user', JSON.stringify(user));
        } else {
            sessionStorage.setItem('investsmart_user', JSON.stringify(user));
        }

        this.showToast(`Welcome back, ${user.name}!`, 'success');

        // Redirect to main app
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);

        return true;
    }

    // Handle Google authentication (mock implementation)
    handleGoogleAuth(isSignup = false) {
        // Mock Google user data
        const mockGoogleUser = {
            id: 'google_' + Date.now().toString(),
            name: 'Google User',
            email: 'user@gmail.com',
            password: btoa('google_auth'),
            createdAt: new Date().toISOString(),
            provider: 'google',
            portfolio: {
                totalValue: 0,
                totalInvested: 0,
                totalPnL: 0,
                totalPnLPercent: 0,
                holdings: []
            },
            preferences: {
                theme: 'light',
                currency: 'USD',
                notifications: true
            }
        };

        if (isSignup) {
            // Check if Google user already exists
            const existingUsers = JSON.parse(localStorage.getItem('investsmart_users') || '[]');
            if (!existingUsers.find(user => user.email === mockGoogleUser.email)) {
                existingUsers.push(mockGoogleUser);
                localStorage.setItem('investsmart_users', JSON.stringify(existingUsers));
            }
        }

        this.currentUser = mockGoogleUser;
        localStorage.setItem('investsmart_user', JSON.stringify(mockGoogleUser));

        this.showToast(`${isSignup ? 'Account created' : 'Logged in'} with Google!`, 'success');

        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    }

    // Logout user
    logout() {
        this.currentUser = null;
        localStorage.removeItem('investsmart_user');
        sessionStorage.removeItem('investsmart_user');
        window.location.href = 'login.html';
    }

    // Get current user
    getCurrentUser() {
        if (!this.currentUser) {
            const savedUser = localStorage.getItem('investsmart_user') || 
                            sessionStorage.getItem('investsmart_user');
            if (savedUser) {
                this.currentUser = JSON.parse(savedUser);
            }
        }
        return this.currentUser;
    }

    // Update user data
    updateUser(userData) {
        if (!this.currentUser) return false;

        // Update current user
        this.currentUser = { ...this.currentUser, ...userData };

        // Update in storage
        const existingUsers = JSON.parse(localStorage.getItem('investsmart_users') || '[]');
        const userIndex = existingUsers.findIndex(u => u.id === this.currentUser.id);
        
        if (userIndex !== -1) {
            existingUsers[userIndex] = this.currentUser;
            localStorage.setItem('investsmart_users', JSON.stringify(existingUsers));
        }

        // Update session storage
        localStorage.setItem('investsmart_user', JSON.stringify(this.currentUser));

        return true;
    }
}

// Initialize auth manager
const authManager = new AuthManager();

// Tab switching functionality
function showTab(tabName, event) {
    // Hide all forms
    document.querySelectorAll('.auth-form').forEach(form => {
        form.classList.remove('active');
    });
    
    // Remove active class from all tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected form and activate tab
    document.getElementById(`${tabName}-form`).classList.add('active');
    if (event && event.target) {
        event.target.classList.add('active');
    }
}

// Handle login form submission
function handleLogin(event) {
    event.preventDefault();
    
    const formData = {
        email: document.getElementById('login-email').value,
        password: document.getElementById('login-password').value,
        rememberMe: document.getElementById('remember-me').checked
    };
    
    authManager.handleLogin(formData);
}

// Handle signup form submission
function handleSignup(event) {
    event.preventDefault();
    
    const formData = {
        name: document.getElementById('signup-name').value,
        email: document.getElementById('signup-email').value,
        password: document.getElementById('signup-password').value,
        confirmPassword: document.getElementById('signup-confirm').value
    };
    
    authManager.handleSignup(formData);
}

// Handle Google login
function handleGoogleLogin() {
    authManager.handleGoogleAuth(false);
}

// Handle Google signup
function handleGoogleSignup() {
    authManager.handleGoogleAuth(true);
}

// Check authentication on page load
document.addEventListener('DOMContentLoaded', () => {
    // Add form validation
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('blur', validateInput);
        input.addEventListener('input', clearValidation);
    });
});

// Input validation
function validateInput(event) {
    const input = event.target;
    const value = input.value.trim();
    
    // Remove existing validation classes
    input.classList.remove('valid', 'invalid');
    
    if (input.type === 'email' && value) {
        if (authManager.validateEmail(value)) {
            input.classList.add('valid');
        } else {
            input.classList.add('invalid');
        }
    }
    
    if (input.type === 'password' && value) {
        if (authManager.validatePassword(value)) {
            input.classList.add('valid');
        } else {
            input.classList.add('invalid');
        }
    }
    
    // Confirm password validation
    if (input.id === 'signup-confirm' && value) {
        const password = document.getElementById('signup-password').value;
        if (value === password) {
            input.classList.add('valid');
        } else {
            input.classList.add('invalid');
        }
    }
}

// Clear validation on input
function clearValidation(event) {
    event.target.classList.remove('valid', 'invalid');
}

// Export auth manager for use in other files
window.authManager = authManager;

