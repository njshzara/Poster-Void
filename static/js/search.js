document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('search-input');
    const productGrid = document.getElementById('product-grid');
    let typingTimer;
    
    if (searchInput && productGrid) {
        // Typewriter effect cursor
        const cursor = document.querySelector('.search-cursor');
        
        // Focus/blur events for cursor visibility
        searchInput.addEventListener('focus', function() {
            if (cursor) cursor.style.display = 'block';
        });
        
        searchInput.addEventListener('blur', function() {
            if (cursor) cursor.style.display = 'none';
        });
        
        // Input event for search with typewriter effect
        searchInput.addEventListener('input', function() {
            clearTimeout(typingTimer);
            
            // Typewriter sound effect
            makeTypewriterSound();
            
            // Debounce search to avoid too many requests
            typingTimer = setTimeout(function() {
                const query = searchInput.value.trim();
                
                // Don't search if the query is "ARTWARP" (Easter egg)
                if (query.toUpperCase() === 'ARTWARP') {
                    return;
                }
                
                performSearch(query);
            }, 500);
        });
    }
    
    // Perform search request
    function performSearch(query) {
        fetch(`/search?q=${encodeURIComponent(query)}`)
            .then(response => response.json())
            .then(results => {
                updateProductGrid(results);
            })
            .catch(error => {
                console.error('Error searching:', error);
            });
    }
    
    // Update product grid with search results
    function updateProductGrid(posters) {
        // Clear existing grid
        productGrid.innerHTML = '';
        
        if (posters.length === 0) {
            const noResults = document.createElement('div');
            noResults.className = 'no-results';
            noResults.textContent = 'No posters found in the void...';
            productGrid.appendChild(noResults);
            return;
        }
        
        // Add each poster to the grid
        posters.forEach(poster => {
            const posterCard = document.createElement('article');
            posterCard.className = 'product-card';
            posterCard.dataset.id = poster.id;
            
            posterCard.innerHTML = `
                <div class="product-image-container">
                    <img src="${poster.image}" alt="${poster.title}" class="product-image">
                </div>
                <div class="product-info">
                    <h2 class="product-title">${poster.title}</h2>
                    <p class="product-artist">by ${poster.artist}</p>
                    <p class="product-description">${poster.description}</p>
                    <div class="product-footer">
                        <span class="product-price">$${poster.price.toFixed(2)}</span>
                        <button class="buy-btn" data-id="${poster.id}">BUY</button>
                    </div>
                </div>
            `;
            
            productGrid.appendChild(posterCard);
            
            // Re-add event listener to buy button
            const buyBtn = posterCard.querySelector('.buy-btn');
            buyBtn.addEventListener('click', function() {
                fetch('/add_to_cart', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ id: parseInt(this.dataset.id) }),
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        // Update cart UI
                        const cartCount = document.getElementById('cart-count');
                        if (cartCount) {
                            cartCount.textContent = data.cart.length;
                        }
                        
                        // Show added modal
                        openModal('added-modal');
                    }
                })
                .catch(error => {
                    console.error('Error adding to cart:', error);
                });
            });
            
            // Re-add tilt effect
            posterCard.addEventListener('mousemove', function(e) {
                const rect = this.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const tiltX = (y - centerY) / 20;
                const tiltY = (centerX - x) / 20;
                
                this.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateZ(10px)`;
            });
            
            posterCard.addEventListener('mouseleave', function() {
                this.style.transform = '';
                setTimeout(() => {
                    this.style.transform = 'translateY(0) scale(1)';
                }, 100);
            });
        });
    }
    
    // Create typewriter sound effect
    function makeTypewriterSound() {
        const hoverSound = document.getElementById('hover-sound');
        if (hoverSound) {
            hoverSound.volume = 0.1;
            hoverSound.currentTime = 0;
            hoverSound.play().catch(e => {
                // Silent error - browsers may block autoplay
            });
        }
    }
});