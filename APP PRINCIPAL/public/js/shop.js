let currentUser = null;
let cartItemCount = 0;

// Check authentication
async function checkAuth() {
    try {
        const response = await fetch('/api/perfumes', {
            credentials: 'include',
        });
        
        if (!response.ok) {
            window.location.href = '/login.html';
            return false;
        }
        return true;
    } catch (error) {
        console.error('Error checking auth:', error);
        window.location.href = '/login.html';
        return false;
    }
}

// Load perfumes
async function loadPerfumes() {
    const perfumeList = document.getElementById('perfume-list');
    
    try {
        const response = await fetch('/api/perfumes', {
            credentials: 'include',
        });
        
        if (!response.ok) {
            throw new Error('Error al cargar perfumes');
        }
        
        const perfumes = await response.json();
        
        perfumeList.innerHTML = '';
        
        perfumes.forEach(perfume => {
            const card = createPerfumeCard(perfume);
            perfumeList.appendChild(card);
        });
        
    } catch (error) {
        console.error('Error:', error);
        perfumeList.innerHTML = '<p class="error">Error al cargar los perfumes</p>';
    }
}

// Create perfume card
function createPerfumeCard(perfume) {
    const card = document.createElement('div');
    card.className = 'perfume-card';
    
    card.innerHTML = `
        <img src="${perfume.imageUrl}" alt="${perfume.name}" class="perfume-image" 
             onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22240%22 height=%22240%22%3E%3Crect fill=%22%23F3E8FF%22 width=%22240%22 height=%22240%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-family=%22Arial%22 font-size=%2220%22 fill=%22%238B5CF6%22%3E${perfume.brand}%3C/text%3E%3C/svg%3E'">
        <div class="perfume-brand">${perfume.brand}</div>
        <h3 class="perfume-name">${perfume.name}</h3>
        <p class="perfume-description">${perfume.description}</p>
        <div class="perfume-footer">
            <span class="perfume-price">$${perfume.price.toFixed(2)}</span>
            <button class="btn-add-cart" onclick="addToCart(${perfume.id})">
                Agregar
            </button>
        </div>
    `;
    
    return card;
}

// Add to cart
async function addToCart(perfumeId) {
    try {
        const response = await fetch('/api/cart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ perfumeId, quantity: 1 }),
        });
        
        if (response.ok) {
            showToast('Producto agregado al carrito');
            updateCartCount();
        } else {
            showToast('Error al agregar al carrito');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Error de conexión');
    }
}

// Update cart count
async function updateCartCount() {
    try {
        const response = await fetch('/api/cart', {
            credentials: 'include',
        });
        
        if (response.ok) {
            const items = await response.json();
            cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);
            document.getElementById('cart-count').textContent = cartItemCount;
        }
    } catch (error) {
        console.error('Error updating cart count:', error);
    }
}

// Show toast notification
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Logout
document.getElementById('logout-button').addEventListener('click', async () => {
    try {
        await fetch('/api/logout', {
            method: 'POST',
            credentials: 'include',
        });
        window.location.href = '/login.html';
    } catch (error) {
        console.error('Error:', error);
    }
});

// Initialize
async function init() {
    const isAuthenticated = await checkAuth();
    if (isAuthenticated) {
        await loadPerfumes();
        await updateCartCount();
    }
}

init();
