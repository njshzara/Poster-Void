from PIL import Image, ImageDraw
import random
import math

def generate_abstract_image(width=400, height=500, style="noise"):
    """
    Generate an abstract black and white image
    
    Parameters:
        width (int): Image width
        height (int): Image height
        style (str): "noise", "geometric", "glitch", or "lines"
    
    Returns:
        PIL.Image: Generated image
    """
    image = Image.new('RGB', (width, height), color='black')
    draw = ImageDraw.Draw(image)
    
    if style == "noise":
        # Static noise pattern
        for x in range(width):
            for y in range(height):
                # Random brightness
                brightness = random.randint(0, 255)
                draw.point((x, y), fill=(brightness, brightness, brightness))
    
    elif style == "geometric":
        # Geometric shapes
        num_shapes = random.randint(10, 30)
        
        for _ in range(num_shapes):
            shape_type = random.choice(['rect', 'circle', 'line', 'poly'])
            brightness = random.randint(100, 255)
            fill_color = (brightness, brightness, brightness)
            
            x1 = random.randint(0, width)
            y1 = random.randint(0, height)
            
            if shape_type == 'rect':
                x2 = random.randint(0, width)
                y2 = random.randint(0, height)
                draw.rectangle([x1, y1, x2, y2], outline=fill_color, width=random.randint(1, 5))
            
            elif shape_type == 'circle':
                radius = random.randint(10, 100)
                draw.ellipse([x1-radius, y1-radius, x1+radius, y1+radius], 
                            outline=fill_color, width=random.randint(1, 5))
            
            elif shape_type == 'line':
                x2 = random.randint(0, width)
                y2 = random.randint(0, height)
                draw.line([x1, y1, x2, y2], fill=fill_color, width=random.randint(1, 10))
            
            elif shape_type == 'poly':
                points = []
                for _ in range(random.randint(3, 7)):
                    points.append((random.randint(0, width), random.randint(0, height)))
                draw.polygon(points, outline=fill_color, width=random.randint(1, 5))
    
    elif style == "glitch":
        # Glitchy blocks
        block_height = random.randint(5, 30)
        
        for y in range(0, height, block_height):
            offset = random.randint(-50, 50)
            block_width = width + abs(offset)
            
            brightness = random.randint(0, 255)
            color = (brightness, brightness, brightness)
            
            for i in range(block_height):
                if y + i < height:
                    draw.line([(max(0, offset), y + i), (min(width, block_width + offset), y + i)], 
                              fill=color, width=1)
        
        # Add some random noise artifacts
        for _ in range(100):
            x = random.randint(0, width-10)
            y = random.randint(0, height-10)
            w = random.randint(5, 50)
            h = random.randint(2, 10)
            brightness = random.randint(0, 255)
            draw.rectangle([x, y, x+w, y+h], fill=(brightness, brightness, brightness))
    
    elif style == "lines":
        # Abstract lines
        num_lines = random.randint(20, 100)
        
        for _ in range(num_lines):
            brightness = random.randint(100, 255)
            color = (brightness, brightness, brightness)
            
            x1 = random.randint(0, width)
            y1 = random.randint(0, height)
            
            length = random.randint(20, 200)
            angle = random.uniform(0, 2 * math.pi)
            
            x2 = x1 + length * math.cos(angle)
            y2 = y1 + length * math.sin(angle)
            
            draw.line([x1, y1, x2, y2], fill=color, width=random.randint(1, 8))
    
    # Add some grain/texture overlay to all styles
    for _ in range(5000):
        x = random.randint(0, width-1)
        y = random.randint(0, height-1)
        brightness = random.randint(0, 255)
        draw.point((x, y), fill=(brightness, brightness, brightness))
    
    return image