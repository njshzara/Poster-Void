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
    const checkoutBtn = document.getElementById('checkout-btn');
    
    // Initialize cart
    updateCartUI();
    
    // Toggle cart sidebar
    if (cartToggle) {
        cartToggle.addEventListener('click', function() {
            cartSidebar.classList.add('active');
            // Add body overlay
            addBodyOverlay();
        });
    }
    
    // Close cart sidebar
    if (closeCart) {
        closeCart.addEventListener('click', function() {
            cartSidebar.classList.remove('active');
            removeBodyOverlay();
        });
    }
    
    // Close cart when clicking outside
    document.addEventListener('click', function(e) {
        if (cartSidebar && cartSidebar.classList.contains('active') && 
            !cartSidebar.contains(e.target) && 
            e.target !== cartToggle &&
            e.target.className === 'body-overlay') {
            cartSidebar.classList.remove('active');
            removeBodyOverlay();
        }
    });
    
    // Add to cart buttons
    buyButtons.forEach(button => {
        button.addEventListener('click', function() {
            const posterId = parseInt(this.dataset.id);
            
            // Add loading animation to button
            this.classList.add('loading');
            this.innerHTML = '<span class="spinner"></span>';
            
            // Simulate network delay for realism
            setTimeout(() => {
                addToCart(posterId);
                // Reset button
                this.classList.remove('loading');
                this.innerHTML = 'BUY';
            }, 700);
        });
    });
    
    // Clear cart button
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', function() {
            // Add confirmation for clearing cart
            if (confirm('Are you sure you want to clear your void collection?')) {
                clearCart();
            }
        });
    }
    
    // Checkout button
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            // Check if cart is empty
            if (document.querySelectorAll('.cart-item').length === 0) {
                alert('Your void is empty. Add some posters first!');
                return;
            }
            
            // Proceed to checkout
            simulateCheckout();
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
                
                // Animate cart icon
                animateCartIcon();
                
                // Show added modal
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
    
    // Function to animate cart icon
    function animateCartIcon() {
        const cartIcon = document.getElementById('cart-toggle');
        cartIcon.classList.add('cart-pulse');
        setTimeout(() => {
            cartIcon.classList.remove('cart-pulse');
        }, 700);
    }
    
    // Function to remove item from cart
    function removeFromCart(itemId) {
        const item = document.querySelector(`.cart-item[data-id="${itemId}"]`);
        if (item) {
            // Add removal animation
            item.classList.add('removing');
        }
        
        // Delay the actual removal to allow animation to complete
        setTimeout(() => {
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
        }, 300);
    }
    
    // Function to clear entire cart
    function clearCart() {
        // Add clearing animation to all items
        const items = document.querySelectorAll('.cart-item');
        items.forEach(item => {
            item.classList.add('removing');
        });
        
        // Delay the actual clearing to allow animation to complete
        setTimeout(() => {
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
        }, 300);
    }
    
    // Update cart UI with current cart data
    function updateCartUI() {
        fetch('/cart')
        .then(response => response.json())
        .then(cart => {
            // Update cart count with animation
            const oldCount = parseInt(cartCount.textContent);
            const newCount = cart.length;
            
            if (oldCount !== newCount) {
                cartCount.classList.add('count-change');
                setTimeout(() => {
                    cartCount.textContent = newCount;
                    cartCount.classList.remove('count-change');
                }, 300);
            } else {
                cartCount.textContent = newCount;
            }
            
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
                cartItemElement.dataset.id = item.id;
                cartItemElement.innerHTML = `
                    <img src="${item.image}" alt="${item.title}" class="cart-item-image">
                    <div class="cart-item-details">
                        <h3 class="cart-item-title">${item.title}</h3>
                        <p class="cart-item-artist">by ${item.artist}</p>
                        <p class="cart-item-price">$${item.price.toFixed(2)}</p>
                        <div class="cart-item-quantity">
                            <button class="quantity-btn minus" disabled>-</button>
                            <span class="quantity">1</span>
                            <button class="quantity-btn plus" disabled>+</button>
                        </div>
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
            
            // Update total price with animation
            const oldTotal = parseFloat(cartTotal.textContent.replace('$', ''));
            const newTotal = total;
            
            if (oldTotal !== newTotal) {
                cartTotal.classList.add('total-change');
                setTimeout(() => {
                    cartTotal.textContent = `$${newTotal.toFixed(2)}`;
                    cartTotal.classList.remove('total-change');
                }, 300);
            } else {
                cartTotal.textContent = `$${newTotal.toFixed(2)}`;
            }
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
    
    // Function to add body overlay
    function addBodyOverlay() {
        if (!document.querySelector('.body-overlay')) {
            const overlay = document.createElement('div');
            overlay.className = 'body-overlay';
            document.body.appendChild(overlay);
            
            // Fade in overlay
            setTimeout(() => {
                overlay.style.opacity = '1';
            }, 10);
        }
    }
    
    // Function to remove body overlay
    function removeBodyOverlay() {
        const overlay = document.querySelector('.body-overlay');
        if (overlay) {
            // Fade out overlay
            overlay.style.opacity = '0';
            
            // Remove from DOM after transition
            setTimeout(() => {
                document.body.removeChild(overlay);
            }, 300);
        }
    }
    
    // Function to simulate checkout process
    function simulateCheckout() {
        // Close cart sidebar
        cartSidebar.classList.remove('active');
        
        // Create checkout overlay
        const checkoutOverlay = document.createElement('div');
        checkoutOverlay.className = 'checkout-overlay';
        
        // Create checkout content
        checkoutOverlay.innerHTML = `
            <div class="checkout-container">
                <div class="checkout-header">
                    <h2>COMPLETE YOUR VOID ACQUISITION</h2>
                    <button class="close-checkout">×</button>
                </div>
                
                <div class="checkout-progress">
                    <div class="progress-step active" data-step="1">
                        <span class="step-number">1</span>
                        <span class="step-name">Information</span>
                    </div>
                    <div class="progress-bar"></div>
                    <div class="progress-step" data-step="2">
                        <span class="step-number">2</span>
                        <span class="step-name">Shipping</span>
                    </div>
                    <div class="progress-bar"></div>
                    <div class="progress-step" data-step="3">
                        <span class="step-number">3</span>
                        <span class="step-name">Payment</span>
                    </div>
                </div>
                
                <div class="checkout-steps">
                    <!-- Step 1: Information -->
                    <div class="checkout-step active" data-step="1">
                        <h3>YOUR INFORMATION</h3>
                        <form id="info-form" class="checkout-form">
                            <div class="form-group">
                                <label for="name">Full Name</label>
                                <input type="text" id="name" placeholder="Enter your name" required>
                            </div>
                            <div class="form-group">
                                <label for="email">Email</label>
                                <input type="email" id="email" placeholder="Enter your email" required>
                            </div>
                            <div class="form-group">
                                <label for="phone">Phone</label>
                                <input type="tel" id="phone" placeholder="Enter your phone number">
                            </div>
                            <button type="submit" class="next-step-btn">CONTINUE TO SHIPPING</button>
                        </form>
                    </div>
                    
                    <!-- Step 2: Shipping -->
                    <div class="checkout-step" data-step="2">
                        <h3>SHIPPING DETAILS</h3>
                        <form id="shipping-form" class="checkout-form">
                            <div class="form-group">
                                <label for="address">Address</label>
                                <input type="text" id="address" placeholder="Enter your address" required>
                            </div>
                            <div class="form-group">
                                <label for="city">City</label>
                                <input type="text" id="city" placeholder="Enter your city" required>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="state">State/Province</label>
                                    <input type="text" id="state" placeholder="State/Province" required>
                                </div>
                                <div class="form-group">
                                    <label for="zip">Zip/Postal Code</label>
                                    <input type="text" id="zip" placeholder="Zip code" required>
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="country">Country</label>
                                <select id="country" required>
                                    <option value="" disabled selected>Select your country</option>
                                    <option value="US">United States</option>
                                    <option value="CA">Canada</option>
                                    <option value="UK">United Kingdom</option>
                                    <option value="AU">Australia</option>
                                    <option value="DE">Germany</option>
                                    <option value="JP">Japan</option>
                                </select>
                            </div>
                            <div class="form-buttons">
                                <button type="button" class="prev-step-btn">BACK</button>
                                <button type="submit" class="next-step-btn">CONTINUE TO PAYMENT</button>
                            </div>
                        </form>
                    </div>
                    
                    <!-- Step 3: Payment -->
                    <div class="checkout-step" data-step="3">
                        <h3>PAYMENT METHOD</h3>
                        <form id="payment-form" class="checkout-form">
                            <div class="payment-methods">
                                <div class="payment-method selected">
                                    <div class="payment-radio">
                                        <input type="radio" id="credit-card" name="payment" checked>
                                        <label for="credit-card">Credit Card</label>
                                    </div>
                                    <div class="card-icons">
                                        <span class="card-icon">💳</span>
                                    </div>
                                </div>
                                <div class="payment-method">
                                    <div class="payment-radio">
                                        <input type="radio" id="paypal" name="payment">
                                        <label for="paypal">PayPal</label>
                                    </div>
                                    <div class="card-icons">
                                        <span class="card-icon">🅿️</span>
                                    </div>
                                </div>
                                <div class="payment-method">
                                    <div class="payment-radio">
                                        <input type="radio" id="crypto" name="payment">
                                        <label for="crypto">Crypto</label>
                                    </div>
                                    <div class="card-icons">
                                        <span class="card-icon">₿</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="credit-card-details">
                                <div class="form-group">
                                    <label for="card-number">Card Number</label>
                                    <input type="text" id="card-number" placeholder="XXXX XXXX XXXX XXXX" required>
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="expiry">Expiry Date</label>
                                        <input type="text" id="expiry" placeholder="MM/YY" required>
                                    </div>
                                    <div class="form-group">
                                        <label for="cvv">CVV</label>
                                        <input type="text" id="cvv" placeholder="XXX" required>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="order-summary">
                                <h4>ORDER SUMMARY</h4>
                                <div class="summary-row">
                                    <span>Subtotal:</span>
                                    <span class="summary-price" id="summary-subtotal">$0.00</span>
                                </div>
                                <div class="summary-row">
                                    <span>Shipping:</span>
                                    <span class="summary-price">$9.99</span>
                                </div>
                                <div class="summary-row">
                                    <span>Tax:</span>
                                    <span class="summary-price" id="summary-tax">$0.00</span>
                                </div>
                                <div class="summary-row total">
                                    <span>Total:</span>
                                    <span class="summary-price" id="summary-total">$0.00</span>
                                </div>
                            </div>
                            
                            <div class="form-buttons">
                                <button type="button" class="prev-step-btn">BACK</button>
                                <button type="submit" class="complete-order-btn">COMPLETE ORDER</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        // Add checkout overlay to the body
        document.body.appendChild(checkoutOverlay);
        
        // Prevent body scrolling
        document.body.classList.add('no-scroll');
        
        // Fade in checkout overlay
        setTimeout(() => {
            checkoutOverlay.classList.add('active');
        }, 10);
        
        // Close checkout button
        const closeCheckoutBtn = checkoutOverlay.querySelector('.close-checkout');
        closeCheckoutBtn.addEventListener('click', function() {
            closeCheckout();
        });
        
        // Update order summary
        updateOrderSummary();
        
        // Handle form submissions and navigation
        setupCheckoutNavigation();
    }
    
    // Function to close checkout
    function closeCheckout() {
        const checkoutOverlay = document.querySelector('.checkout-overlay');
        if (checkoutOverlay) {
            // Fade out checkout
            checkoutOverlay.classList.remove('active');
            
            // Remove from DOM after transition and restore body scrolling
            setTimeout(() => {
                document.body.removeChild(checkoutOverlay);
                document.body.classList.remove('no-scroll');
            }, 300);
        }
    }
    
    // Function to update order summary in checkout
    function updateOrderSummary() {
        fetch('/cart')
        .then(response => response.json())
        .then(cart => {
            const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
            const tax = subtotal * 0.08; // 8% tax rate
            const total = subtotal + tax + 9.99; // Adding shipping
            
            const subtotalEl = document.getElementById('summary-subtotal');
            const taxEl = document.getElementById('summary-tax');
            const totalEl = document.getElementById('summary-total');
            
            if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
            if (taxEl) taxEl.textContent = `$${tax.toFixed(2)}`;
            if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
        });
    }
    
    // Setup checkout form navigation
    function setupCheckoutNavigation() {
        // Form submissions
        const infoForm = document.getElementById('info-form');
        const shippingForm = document.getElementById('shipping-form');
        const paymentForm = document.getElementById('payment-form');
        
        // Info form submission
        if (infoForm) {
            infoForm.addEventListener('submit', function(e) {
                e.preventDefault();
                goToStep(2);
            });
        }
        
        // Shipping form submission
        if (shippingForm) {
            shippingForm.addEventListener('submit', function(e) {
                e.preventDefault();
                goToStep(3);
            });
        }
        
        // Payment form submission
        if (paymentForm) {
            paymentForm.addEventListener('submit', function(e) {
                e.preventDefault();
                processOrder();
            });
        }
        
        // Back buttons
        const prevButtons = document.querySelectorAll('.prev-step-btn');
        prevButtons.forEach(button => {
            button.addEventListener('click', function() {
                const currentStep = parseInt(this.closest('.checkout-step').dataset.step);
                goToStep(currentStep - 1);
            });
        });
        
        // Payment method selection
        const paymentMethods = document.querySelectorAll('.payment-method');
        paymentMethods.forEach(method => {
            method.addEventListener('click', function() {
                // Unselect all methods
                paymentMethods.forEach(m => m.classList.remove('selected'));
                
                // Select clicked method
                this.classList.add('selected');
                
                // Check the radio button
                const radio = this.querySelector('input[type="radio"]');
                if (radio) radio.checked = true;
            });
        });
    }
    
    // Function to navigate between checkout steps
    function goToStep(step) {
        // Update progress indicators
        const progressSteps = document.querySelectorAll('.progress-step');
        progressSteps.forEach(stepEl => {
            const stepNum = parseInt(stepEl.dataset.step);
            if (stepNum < step) {
                stepEl.classList.add('completed');
                stepEl.classList.remove('active');
            } else if (stepNum === step) {
                stepEl.classList.add('active');
                stepEl.classList.remove('completed');
            } else {
                stepEl.classList.remove('active', 'completed');
            }
        });
        
        // Show/hide step content
        const stepContents = document.querySelectorAll('.checkout-step');
        stepContents.forEach(content => {
            const contentStep = parseInt(content.dataset.step);
            if (contentStep === step) {
                content.classList.add('active');
            } else {
                content.classList.remove('active');
            }
        });
    }
    
    // Function to process the order
    function processOrder() {
        // Get checkout overlay
        const checkoutOverlay = document.querySelector('.checkout-overlay');
        if (!checkoutOverlay) return;
        
        // Show loading state
        const completeBtn = document.querySelector('.complete-order-btn');
        if (completeBtn) {
            completeBtn.disabled = true;
            completeBtn.innerHTML = '<span class="spinner"></span> PROCESSING...';
        }
        
        // Simulate processing delay
        setTimeout(() => {
            // Replace checkout content with success message
            const checkoutContainer = checkoutOverlay.querySelector('.checkout-container');
            if (checkoutContainer) {
                checkoutContainer.innerHTML = `
                    <div class="order-success">
                        <div class="success-icon">✓</div>
                        <h2>ORDER COMPLETE</h2>
                        <p>Your void acquisitions are being prepared for interdimensional transit.</p>
                        <p class="order-number">Order #VD-${Math.floor(100000 + Math.random() * 900000)}</p>
                        <p>A confirmation has been sent to your digital communication channel.</p>
                        <button class="continue-shopping-btn">RETURN TO THE VOID</button>
                    </div>
                `;
                
                // Add event listener to continue shopping button
                const continueBtn = checkoutContainer.querySelector('.continue-shopping-btn');
                if (continueBtn) {
                    continueBtn.addEventListener('click', function() {
                        // Close checkout
                        closeCheckout();
                        
                        // Clear cart
                        clearCart();
                    });
                }
            }
        }, 2000);
    }
});