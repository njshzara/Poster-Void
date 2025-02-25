document.addEventListener('DOMContentLoaded', function() {
    const forgeCanvas = document.getElementById('forge-canvas');
    const generateBtn = document.getElementById('generate-poster-btn');
    const buyGeneratedBtn = document.getElementById('buy-generated-btn');
    const styleButtons = document.querySelectorAll('.style-btn');
    
    let currentStyle = 'noise';
    let currentPosterImage = null;
    
    // Initialize canvas
    if (forgeCanvas && generateBtn) {
        // Set active style button
        styleButtons.forEach(btn => {
            if (btn.dataset.style === currentStyle) {
                btn.classList.add('active');
            }
            
            btn.addEventListener('click', function() {
                // Update current style
                currentStyle = this.dataset.style;
                
                // Update active button
                styleButtons.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                // Generate new poster with selected style
                generatePoster();
            });
        });
        
        // Generate initial poster
        generatePoster();
        
        // Generate button click
        generateBtn.addEventListener('click', function() {
            generatePoster();
        });
        
        // Buy generated poster
        if (buyGeneratedBtn) {
            buyGeneratedBtn.addEventListener('click', function() {
                if (currentPosterImage) {
                    addCustomPosterToCart();
                }
            });
        }
    }
    
    // Generate a new random poster
    function generatePoster() {
        fetch('/generate_poster', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ style: currentStyle }),
        })
        .then(response => response.json())
        .then(data => {
            // Store the generated image
            currentPosterImage = data.image;
            
            // Display on canvas
            const ctx = forgeCanvas.getContext('2d');
            const img = new Image();
            
            img.onload = function() {
                ctx.clearRect(0, 0, forgeCanvas.width, forgeCanvas.height);
                ctx.drawImage(img, 0, 0, forgeCanvas.width, forgeCanvas.height);
                
                // Add some glitch effects on the canvas
                addCanvasGlitchEffects(ctx, forgeCanvas.width, forgeCanvas.height);
            };
            
            img.src = data.image;
            
            // Play glitch sound
            const hoverSound = document.getElementById('hover-sound');
            if (hoverSound) {
                hoverSound.currentTime = 0;
                hoverSound.play().catch(e => {
                    // Silent error - browsers may block autoplay
                });
            }
        })
        .catch(error => {
            console.error('Error generating poster:', error);
        });
    }
    
    // Add some glitch effects to the canvas
    function addCanvasGlitchEffects(ctx, width, height) {
        // Add random scanlines
        for (let i = 0; i < 10; i++) {
            const y = Math.floor(Math.random() * height);
            const h = Math.floor(Math.random() * 3) + 1;
            
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.fillRect(0, y, width, h);
        }
        
        // Add random glitch blocks
        for (let i = 0; i < 5; i++) {
            const x = Math.floor(Math.random() * width);
            const y = Math.floor(Math.random() * height);
            const w = Math.floor(Math.random() * 30) + 10;
            const h = Math.floor(Math.random() * 5) + 2;
            
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fillRect(x, y, w, h);
        }
    }
    
    // Add custom generated poster to cart
    function addCustomPosterToCart() {
        fetch('/add_to_cart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: 'custom',
                image: currentPosterImage
            }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Update cart count
                const cartCount = document.getElementById('cart-count');
                if (cartCount) {
                    cartCount.textContent = data.cart.length;
                }
                
                // Show success modal
                openModal('added-modal');
                
                // Generate a new poster
                generatePoster();
            }
        })
        .catch(error => {
            console.error('Error adding custom poster to cart:', error);
        });
    }
});