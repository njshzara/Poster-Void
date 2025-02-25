// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('PosterVoid initialized');
    
    // Initialize modal functionality
    initModals();
    
    // Initialize event listeners for product cards
    initProductCards();
    
    // Initialize ARTWARP easter egg
    initArtwarpMode();
});

// Modal functionality
function initModals() {
    const modals = document.querySelectorAll('.modal');
    const modalClosers = document.querySelectorAll('.close-modal');
    const checkoutBtn = document.getElementById('checkout-btn');
    const viewCartBtn = document.getElementById('view-cart-btn');
    
    // Show checkout modal
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            openModal('checkout-modal');
        });
    }
    
    // View cart from added modal
    if (viewCartBtn) {
        viewCartBtn.addEventListener('click', function() {
            closeAllModals();
            document.getElementById('cart-sidebar').classList.add('active');
        });
    }
    
    // Close modal buttons
    modalClosers.forEach(closer => {
        closer.addEventListener('click', function() {
            closeAllModals();
        });
    });
    
    // Close modals when clicking outside
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeAllModals();
            }
        });
    });
}

// Open a specific modal by ID
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
    }
}

// Close all modals
function closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.style.display = 'none';
    });
}

// Product card interactions
function initProductCards() {
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        // Apply tilt effect on mousemove
        card.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const tiltX = (y - centerY) / 20;
            const tiltY = (centerX - x) / 20;
            
            this.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateZ(10px)`;
        });
        
        // Reset tilt effect on mouseleave
        card.addEventListener('mouseleave', function() {
            this.style.transform = '';
            setTimeout(() => {
                this.style.transform = 'translateY(0) scale(1)';
            }, 100);
        });
    });
}

// ARTWARP psychedelic mode easter egg
function initArtwarpMode() {
    const searchInput = document.getElementById('search-input');
    let artwarpTyped = '';
    
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            artwarpTyped = e.target.value.toUpperCase();
            
            // Check if user typed the secret code
            if (artwarpTyped === 'ARTWARP') {
                document.body.classList.toggle('psychedelic-mode');
                
                // Play glitch sound
                const hoverSound = document.getElementById('hover-sound');
                if (hoverSound) {
                    hoverSound.currentTime = 0;
                    hoverSound.play();
                }
                
                // Clear the search input after a brief delay
                setTimeout(() => {
                    searchInput.value = '';
                    artwarpTyped = '';
                }, 500);
            }
        });
    }
}