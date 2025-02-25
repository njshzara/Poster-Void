from flask import Flask, render_template, jsonify, request, session, redirect, url_for
import base64
import json
import os
import random
from io import BytesIO
from utils.image_gen import generate_abstract_image

app = Flask(__name__)
app.secret_key = os.urandom(24)  # For session management

# Sample poster data
POSTERS = [
    {
        "id": 1,
        "title": "Eclipse Pulse",
        "artist": "Zara Vox",
        "description": "A stark vision of cosmic decay",
        "price": 34.99,
        "tags": ["abstract", "cosmic"]
    },
    {
        "id": 2,
        "title": "Monolith Descent",
        "artist": "Nyx Blade",
        "description": "Geometric patterns falling into the void",
        "price": 29.99,
        "tags": ["geometric", "dark"]
    },
    {
        "id": 3,
        "title": "Static Dreams",
        "artist": "Vex Cipher",
        "description": "Noise patterns revealing hidden consciousness",
        "price": 39.99,
        "tags": ["noise", "dreams"]
    },
    {
        "id": 4,
        "title": "Binary Ghost",
        "artist": "Zara Vox",
        "description": "Digital specter haunting analog spaces",
        "price": 32.99,
        "tags": ["digital", "haunting"]
    },
    {
        "id": 5,
        "title": "Distortion Field",
        "artist": "Echo Null",
        "description": "Reality bends at the edges of perception",
        "price": 36.99,
        "tags": ["abstract", "reality"]
    },
    {
        "id": 6,
        "title": "Glitch Horizon",
        "artist": "Nyx Blade",
        "description": "The boundary where systems break down",
        "price": 33.99,
        "tags": ["glitch", "horizon"]
    },
    {
        "id": 7,
        "title": "Void Circuit",
        "artist": "Vex Cipher",
        "description": "Pathways through the emptiness",
        "price": 31.99,
        "tags": ["circuit", "void"]
    },
    {
        "id": 8,
        "title": "Fractal Echoes",
        "artist": "Echo Null",
        "description": "Patterns repeating into infinity",
        "price": 42.99,
        "tags": ["fractal", "infinity"]
    },
    {
        "id": 9,
        "title": "Quantum Decay",
        "artist": "Zara Vox",
        "description": "Particles dissolving into probability",
        "price": 38.99,
        "tags": ["quantum", "science"]
    },
    {
        "id": 10,
        "title": "Noise Cascade",
        "artist": "Vex Cipher",
        "description": "A waterfall of static consciousness",
        "price": 37.99,
        "tags": ["noise", "cascade"]
    }
]

# Generate base64 images for each poster once at startup
for poster in POSTERS:
    image_data = generate_abstract_image(
        width=400, 
        height=500, 
        style=random.choice(["noise", "geometric", "glitch", "lines"])
    )
    buffered = BytesIO()
    image_data.save(buffered, format="PNG")
    poster["image"] = f"data:image/png;base64,{base64.b64encode(buffered.getvalue()).decode('utf-8')}"

# Routes
@app.route('/')
def index():
    """Render the homepage with all posters"""
    return render_template('index.html', posters=POSTERS)

@app.route('/cart')
def view_cart():
    """View the current cart contents"""
    cart = session.get('cart', [])
    return jsonify(cart)

@app.route('/add_to_cart', methods=['POST'])
def add_to_cart():
    """Add an item to the cart"""
    data = request.json
    poster_id = data.get('id')
    
    # For custom generated posters
    if poster_id == 'custom':
        custom_poster = {
            'id': f"custom_{random.randint(1000, 9999)}",
            'title': "Custom Void Creation",
            'artist': "You",
            'description': "A unique digital artifact from the void",
            'price': 49.99,
            'image': data.get('image')
        }
        
        if 'cart' not in session:
            session['cart'] = []
        
        session['cart'].append(custom_poster)
        session.modified = True
        return jsonify({'success': True, 'cart': session['cart']})
    
    # For regular posters
    poster = next((p for p in POSTERS if p['id'] == poster_id), None)
    
    if poster:
        if 'cart' not in session:
            session['cart'] = []
        
        cart_item = {
            'id': poster['id'],
            'title': poster['title'],
            'artist': poster['artist'],
            'price': poster['price'],
            'image': poster['image']
        }
        
        session['cart'].append(cart_item)
        session.modified = True
        
        return jsonify({'success': True, 'cart': session['cart']})
    
    return jsonify({'success': False, 'error': 'Poster not found'})

@app.route('/remove_from_cart', methods=['POST'])
def remove_from_cart():
    """Remove an item from the cart"""
    data = request.json
    item_id = data.get('id')
    
    if 'cart' in session:
        session['cart'] = [item for item in session['cart'] if str(item['id']) != str(item_id)]
        session.modified = True
        
    return jsonify({'success': True, 'cart': session.get('cart', [])})

@app.route('/clear_cart', methods=['POST'])
def clear_cart():
    """Clear the entire cart"""
    if 'cart' in session:
        session.pop('cart')
    
    return jsonify({'success': True})

@app.route('/generate_poster', methods=['POST'])
def generate_poster():
    """Generate a new random poster image"""
    style = request.json.get('style', random.choice(["noise", "geometric", "glitch", "lines"]))
    
    image_data = generate_abstract_image(
        width=400, 
        height=500, 
        style=style
    )
    
    buffered = BytesIO()
    image_data.save(buffered, format="PNG")
    img_str = f"data:image/png;base64,{base64.b64encode(buffered.getvalue()).decode('utf-8')}"
    
    return jsonify({
        'image': img_str
    })

@app.route('/search', methods=['GET'])
def search():
    """Search for posters by title or artist"""
    query = request.args.get('q', '').lower()
    
    if not query:
        return jsonify(POSTERS)
    
    results = [
        poster for poster in POSTERS 
        if query in poster['title'].lower() or query in poster['artist'].lower()
    ]
    
    return jsonify(results)

if __name__ == '__main__':
    app.run(debug=True)