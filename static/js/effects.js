document.addEventListener('DOMContentLoaded', function() {
    // Product hover sound effects
    initHoverSounds();
    
    // Initialize Web Audio API for hover effects
    initWebAudio();
    
    // CRT flicker effect
    initCrtFlicker();
});

// Hover sound effects for product cards
function initHoverSounds() {
    const productCards = document.querySelectorAll('.product-card');
    const hoverSound = document.getElementById('hover-sound');
    
    productCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            if (hoverSound) {
                hoverSound.volume = 0.05;
                hoverSound.currentTime = 0;
                hoverSound.play().catch(e => {
                    // Silent error - browsers may block autoplay
                });
            }
            
            // If Web Audio is available, trigger hum sound
            if (window.audioContext) {
                playHumSound();
            }
        });
        
        card.addEventListener('mouseleave', function() {
            // Stop hum sound if Web Audio is available
            if (window.audioContext && window.humOscillator) {
                stopHumSound();
            }
        });
    });
}

// Initialize Web Audio API
function initWebAudio() {
    try {
        // Create audio context
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        window.audioContext = new AudioContext();
        
        // Pre-create gain node
        window.mainGain = window.audioContext.createGain();
        window.mainGain.gain.value = 0.03; // Very low volume
        window.mainGain.connect(window.audioContext.destination);
    } catch (e) {
        console.log('Web Audio API not supported in this browser');
    }
}

// Play low hum sound on hover
function playHumSound() {
    if (!window.audioContext) return;
    
    try {
        // Create oscillator for low hum
        const oscillator = window.audioContext.createOscillator();
        window.humOscillator = oscillator;
        
        // Set up oscillator
        oscillator.type = 'sine';
        oscillator.frequency.value = 50 + Math.random() * 20; // Low frequency
        
        // Add slight distortion
        const distortion = window.audioContext.createWaveShaper();
        distortion.curve = makeDistortionCurve(50);
        
        // Connect nodes
        oscillator.connect(distortion);
        distortion.connect(window.mainGain);
        
        // Start oscillator
        oscillator.start();
        
        // Gentle fade in
        window.mainGain.gain.setValueAtTime(0, window.audioContext.currentTime);
        window.mainGain.gain.linearRampToValueAtTime(0.03, window.audioContext.currentTime + 0.1);
    } catch (e) {
        console.log('Error playing hum sound:', e);
    }
}

// Stop hum sound
function stopHumSound() {
    if (!window.audioContext || !window.humOscillator) return;
    
    try {
        // Gentle fade out
        window.mainGain.gain.linearRampToValueAtTime(0, window.audioContext.currentTime + 0.2);
        
        // Stop oscillator after fade
        setTimeout(() => {
            if (window.humOscillator) {
                window.humOscillator.stop();
                window.humOscillator.disconnect();
                window.humOscillator = null;
            }
        }, 200);
    } catch (e) {
        console.log('Error stopping hum sound:', e);
    }
}

// Create distortion curve for audio
function makeDistortionCurve(amount) {
    const samples = 44100;
    const curve = new Float32Array(samples);
    const deg = Math.PI / 180;
    
    for (let i = 0; i < samples; ++i) {
        const x = i * 2 / samples - 1;
        curve[i] = (3 + amount) * x * 20 * deg / (Math.PI + amount * Math.abs(x));
    }
    
    return curve;
}

// CRT monitor flicker effect
function initCrtFlicker() {
    const overlay = document.querySelector('.crt-overlay');
    
    if (overlay) {
        // Random flicker interval
        setInterval(() => {
            if (Math.random() > 0.97) { // Rare flicker
                overlay.style.opacity = (Math.random() * 0.3 + 0.7).toFixed(2);
                
                setTimeout(() => {
                    overlay.style.opacity = 1;
                }, 100);
            }
        }, 500);
    }
}