// Check if user is authenticated
function checkAuth() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    
    if (!token || !user) {
        // Redirect to login if not authenticated
        window.location.href = '/auth/login';
        return false;
    }
    
    return { token, user };
}

// Add token to API requests
function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/auth/login';
}

// Check user role
function hasRole(requiredRole) {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    return user && user.role === requiredRole;
}

// Export functions for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { checkAuth, getAuthHeaders, logout, hasRole };
}