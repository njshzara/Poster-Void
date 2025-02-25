document.addEventListener('DOMContentLoaded', function() {
    // Cart elements
    const cartToggle = document.getElementById('cart-toggle');
    const cartSidebar = document.getElementById('cart-sidebar');
    const closeCart = document.getElementById('close-cart');
    const cartItems = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const cartTotal = document.getElementById('cart-total-amount');
    const buyButtons = document.querySelectorAll('.buy-btn');
    const clearCartBtn = document.getElementById('clear-cart-btn');
    const shareTwitterBtn = document.getElementById('share-twitter-btn');
    
    // Initialize cart
    updateCartUI();
    
    // Toggle cart sidebar
    if (cartToggle) {
        cartToggle.addEventListener('click', function() {
            cartSidebar.classList.add('active');
        });
    }
    
    // Close cart sidebar
    if (closeCart) {
        closeCart.addEventListener('click', function() {
            cartSidebar.classList.remove('active');
        });
    }
    
    // Close cart when clicking outside
    document.addEventListener('click', function(e) {
        if (cartSidebar && cartSidebar.classList.contains('active') && 
            !cartSidebar.contains(e.target) && 
            e.target !== cartToggle) {
            cartSidebar.classList.remove('active');
        }
    });
    
    // Add to cart buttons
    buyButtons.forEach(button => {
        button.addEventListener('click', function() {
            const posterId = parseInt(this.dataset.id);
            addToCart(posterId);
        });
    });
    
    // Clear cart button
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', function() {
            clearCart();
        });
    }
    
    // Share on Twitter button
    if (shareTwitterBtn) {
        shareTwitterBtn.addEventListener('click', function() {
            shareCartOnTwitter();
        });
    }
    
    // Function to add item to cart
    function addToCart(posterId) {
        fetch('/add_to_cart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: posterId }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateCartUI();
                openModal('added-modal');
                
                // Play glitch sound
                const hoverSound = document.getElementById('hover-sound');
                if (hoverSound) {
                    hoverSound.currentTime = 0;
                    hoverSound.play();
                }
            }
        })
        .catch(error => {
            console.error('Error adding to cart:', error);
        });
    }
    
    // Function to remove item from cart
    function removeFromCart(itemId) {
        fetch('/remove_from_cart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: itemId }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateCartUI();
            }
        })
        .catch(error => {
            console.error('Error removing from cart:', error);
        });
    }
    
    // Function to clear entire cart
    function clearCart() {
        fetch('/clear_cart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateCartUI();
            }
        })
        .catch(error => {
            console.error('Error clearing cart:', error);
        });
    }
    
    // Update cart UI with current cart data
    function updateCartUI() {
        fetch('/cart')
        .then(response => response.json())
        .then(cart => {
            // Update cart count
            cartCount.textContent = cart.length;
            
            // Update cart items
            cartItems.innerHTML = '';
            
            if (cart.length === 0) {
                cartItems.innerHTML = '<p class="empty-cart">Your void is empty...</p>';
                cartTotal.textContent = '$0.00';
                return;
            }
            
            let total = 0;
            
            cart.forEach(item => {
                total += item.price;
                
                const cartItemElement = document.createElement('div');
                cartItemElement.className = 'cart-item';
                cartItemElement.innerHTML = `
                    <img src="${item.image}" alt="${item.title}" class="cart-item-image">
                    <div class="cart-item-details">
                        <h3 class="cart-item-title">${item.title}</h3>
                        <p class="cart-item-artist">by ${item.artist}</p>
                        <p class="cart-item-price">$${item.price.toFixed(2)}</p>
                        <button class="cart-item-remove" data-id="${item.id}">Remove</button>
                    </div>
                `;
                
                cartItems.appendChild(cartItemElement);
                
                // Add remove button event listener
                const removeBtn = cartItemElement.querySelector('.cart-item-remove');
                if (removeBtn) {
                    removeBtn.addEventListener('click', function() {
                        removeFromCart(this.dataset.id);
                    });
                }
            });
            
            // Update total price
            cartTotal.textContent = `$${total.toFixed(2)}`;
        })
        .catch(error => {
            console.error('Error fetching cart:', error);
        });
    }
    
    // Share cart on Twitter
    function shareCartOnTwitter() {
        fetch('/cart')
        .then(response => response.json())
        .then(cart => {
            if (cart.length === 0) {
                alert('Add something to your void before sharing!');
                return;
            }
            
            // Calculate total
            const total = cart.reduce((sum, item) => sum + item.price, 0).toFixed(2);
            const itemCount = cart.length;
            
            // Create share text
            const shareText = `Just filled my void with ${itemCount} poster${itemCount !== 1 ? 's' : ''} for $${total} at Poster Void! #PosterVoid #DigitalArt`;
            
            // Encode share text for URL
            const encodedText = encodeURIComponent(shareText);
            
            // Open Twitter share intent in new window
            window.open(`https://twitter.com/intent/tweet?text=${encodedText}`, '_blank');
        })
        .catch(error => {
            console.error('Error preparing share:', error);
        });
    }
});