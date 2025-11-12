const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    loginError.textContent = '';
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
            credentials: 'include',
        });
        
        const data = await response.json();
        
        if (response.ok) {
            window.location.href = '/shop.html';
        } else {
            loginError.textContent = data.message || 'Error al iniciar sesión';
        }
    } catch (error) {
        loginError.textContent = 'Error de conexión. Por favor, intenta de nuevo.';
        console.error('Error:', error);
    }
});
