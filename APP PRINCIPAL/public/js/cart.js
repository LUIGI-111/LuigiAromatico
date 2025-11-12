let cartItems = [];

// Check authentication
async function checkAuth() {
    try {
        const response = await fetch('/api/cart', {
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

// Load cart items
async function loadCart() {
    const cartContent = document.getElementById('cart-content');
    const cartEmpty = document.getElementById('cart-empty');
    const cartSummary = document.getElementById('cart-summary');
    
    try {
        const response = await fetch('/api/cart', {
            credentials: 'include',
        });
        
        if (!response.ok) {
            throw new Error('Error al cargar el carrito');
        }
        
        cartItems = await response.json();
        
        if (cartItems.length === 0) {
            cartContent.style.display = 'none';
            cartEmpty.style.display = 'block';
            cartSummary.style.display = 'none';
        } else {
            cartContent.style.display = 'flex';
            cartEmpty.style.display = 'none';
            cartSummary.style.display = 'block';
            
            renderCartItems();
            updateSummary();
        }
        
    } catch (error) {
        console.error('Error:', error);
        cartContent.innerHTML = '<p class="error">Error al cargar el carrito</p>';
    }
}

// Render cart items
function renderCartItems() {
    const cartContent = document.getElementById('cart-content');
    cartContent.innerHTML = '';
    
    cartItems.forEach(item => {
        const cartItemElement = createCartItem(item);
        cartContent.appendChild(cartItemElement);
    });
}

// Create cart item element
function createCartItem(item) {
    const div = document.createElement('div');
    div.className = 'cart-item';
    
    const perfume = item.Perfume;
    const itemTotal = (perfume.price * item.quantity).toFixed(2);
    
    div.innerHTML = `
        <img src="${perfume.imageUrl}" alt="${perfume.name}" class="cart-item-image"
             onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect fill=%22%23F3E8FF%22 width=%22100%22 height=%22100%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-family=%22Arial%22 font-size=%2212%22 fill=%22%238B5CF6%22%3E${perfume.brand}%3C/text%3E%3C/svg%3E'">
        <div class="cart-item-details">
            <div class="cart-item-brand">${perfume.brand}</div>
            <h3 class="cart-item-name">${perfume.name}</h3>
            <p class="cart-item-price">$${perfume.price.toFixed(2)} c/u</p>
            <p class="cart-item-quantity">Cantidad: ${item.quantity}</p>
        </div>
        <div class="cart-item-actions">
            <div class="cart-item-total">$${itemTotal}</div>
            <button class="btn-remove" onclick="removeFromCart(${item.id})">
                Eliminar
            </button>
        </div>
    `;
    
    return div;
}

// Update summary
function updateSummary() {
    const subtotal = cartItems.reduce((sum, item) => {
        return sum + (item.Perfume.price * item.quantity);
    }, 0);
    
    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('total').textContent = `$${subtotal.toFixed(2)}`;
}

// Remove from cart
async function removeFromCart(itemId) {
    try {
        const response = await fetch(`/api/cart/${itemId}`, {
            method: 'DELETE',
            credentials: 'include',
        });
        
        if (response.ok) {
            showToast('Producto eliminado del carrito');
            await loadCart();
        } else {
            showToast('Error al eliminar el producto');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Error de conexión');
    }
}

// Checkout
document.getElementById('checkout-button').addEventListener('click', async () => {
    if (cartItems.length === 0) return;
    
    const confirmCheckout = confirm('¿Deseas finalizar tu compra?');
    if (!confirmCheckout) return;
    
    try {
        const response = await fetch('/api/checkout', {
            method: 'POST',
            credentials: 'include',
        });
        
        if (response.ok) {
            showToast('¡Pedido realizado con éxito!');
            setTimeout(() => {
                window.location.href = '/shop.html';
            }, 2000);
        } else {
            showToast('Error al procesar el pedido');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Error de conexión');
    }
});

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

// Show toast notification
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Initialize
async function init() {
    const isAuthenticated = await checkAuth();
    if (isAuthenticated) {
        await loadCart();
    }
}

init();
