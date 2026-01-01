// Auth JavaScript functionality - FIXED VERSION
document.addEventListener('DOMContentLoaded', function() {
    console.log('Auth page loaded');
    
    // Login form handling
    const loginForm = document.getElementById('loginForm');
    const loginBtn = document.getElementById('loginBtn');
    const loginText = document.getElementById('loginText');
    const loginSpinner = document.getElementById('loginSpinner');
    const messageContainer = document.getElementById('messageContainer');
    
    // ✅ REMOVED: Automatic redirect check (this was causing the infinite loop)
    
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            // Show loading state
            loginText.textContent = 'Logging in...';
            loginSpinner.classList.remove('d-none');
            loginBtn.disabled = true;
            
            try {
                // ✅ CHANGE: Use regular form submission instead of fetch API
                // Since your server expects form data, not JSON
                
                // Create a hidden form and submit it the old-fashioned way
                const form = document.createElement('form');
                form.method = 'POST';
                form.action = '/auth/login';
                
                const usernameField = document.createElement('input');
                usernameField.type = 'hidden';
                usernameField.name = 'username';
                usernameField.value = username;
                
                const passwordField = document.createElement('input');
                passwordField.type = 'hidden';
                passwordField.name = 'password';
                passwordField.value = password;
                
                form.appendChild(usernameField);
                form.appendChild(passwordField);
                document.body.appendChild(form);
                
                form.submit();
                
            } catch (error) {
                console.error('Login error:', error);
                showMessage('danger', 'Network error. Please try again.');
                resetLoginButton();
            }
        });
    }
    
    function showMessage(type, text) {
        if (messageContainer) {
            messageContainer.innerHTML = `
                <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                    ${text}
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            `;
        }
    }
    
    function resetLoginButton() {
        if (loginText) loginText.textContent = 'Login';
        if (loginSpinner) loginSpinner.classList.add('d-none');
        if (loginBtn) loginBtn.disabled = false;
    }
});