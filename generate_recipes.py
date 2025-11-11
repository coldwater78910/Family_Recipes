#!/usr/bin/env python3
"""
Simple generator: read recipes.json and create a static HTML page per recipe.
Run with: python3 generate_recipes.py

This is intentionally small and dependency-free so you can regenerate pages locally.
"""
import json
from pathlib import Path

HERE = Path(__file__).parent
DATA = HERE / 'recipes.json'
OUT = HERE

SCRIPT = '''
    document.getElementById('year').textContent = new Date().getFullYear();
    
    // Recipe scaling functionality
    function parseAmount(str) {
      if (!str) return 0;
      const parts = str.trim().split(' ');
      let total = 0;
      
      parts.forEach(part => {
        if (part.includes('/')) {
          const [num, denom] = part.split('/');
          if (!isNaN(num) && !isNaN(denom) && denom !== '0') {
            total += Number(num) / Number(denom);
          }
        } else {
          const num = Number(part);
          if (!isNaN(num)) {
            total += num;
          }
        }
      });
      
      return total;
    }

    function formatAmount(value) {
      if (value === 0) return '0';
      
      // Convert to the nearest fraction (1/4, 1/3, 1/2, 2/3, 3/4)
      const whole = Math.floor(value);
      const decimal = value - whole;
      
      // Common fractions mapping
      const fractions = {
        0.25: '1/4',
        0.33: '1/3',
        0.5: '1/2',
        0.67: '2/3',
        0.75: '3/4'
      };
      
      // Find the closest fraction
      let closestFraction = '';
      let minDiff = 1;
      
      for (const [frac, str] of Object.entries(fractions)) {
        const diff = Math.abs(decimal - Number(frac));
        if (diff < minDiff) {
          minDiff = diff;
          closestFraction = str;
        }
      }
      
      // If the decimal part is very small, ignore it
      if (minDiff > 0.15) {
        return whole || '0';
      }
      
      return whole ? `${whole} ${closestFraction}` : closestFraction;
      
      // Convert decimal to fraction
      let fraction = '';
      if (decimal > 0) {
        if (Math.abs(decimal - 0.25) < 0.01) fraction = '1/4';
        else if (Math.abs(decimal - 0.5) < 0.01) fraction = '1/2';
        else if (Math.abs(decimal - 0.75) < 0.01) fraction = '3/4';
        else fraction = decimal.toFixed(2);
      }
      
      // Combine whole number and fraction
      if (whole === 0) return fraction;
      if (fraction) return `${whole} ${fraction}`;
      return whole.toString();
    }

    function updateIngredients(newServings) {
      const list = document.querySelector('.ingredients-list');
      const originalServings = parseInt(list.dataset.originalServings);
      const scale = newServings / originalServings;
      
      // Get all ingredients and update quantities
      const items = list.querySelectorAll('li');
      items.forEach(item => {
        // Store original text if not already stored
        if (!item.dataset.original) {
          item.dataset.original = item.textContent;
        }
        
        const text = item.dataset.original;
        // Match leading numbers and fractions, handling various formats
        const match = text.match(/^([0-9]+(?:\\s+[0-9]+\\/[0-9]+)?|[0-9]+\\/[0-9]+)\\s/);
        
        if (match) {
          const originalAmount = match[0].trim();
          const originalValue = parseAmount(originalAmount);
          const scaledValue = originalValue * scale;
          const formattedValue = formatAmount(scaledValue);
          
          // Replace only the leading amount in the text
          item.textContent = text.replace(originalAmount, formattedValue);
        }
      });
    }

    // Set up event listeners for servings controls
    const servingsInput = document.getElementById('servings');
    const adjustButtons = document.querySelectorAll('.adjust-servings');

    if (servingsInput) {
      // Handle direct input changes
      servingsInput.addEventListener('input', (e) => {
        let newValue = parseInt(e.target.value);
        if (!newValue || newValue < 1) newValue = 1;
        if (newValue > 24) newValue = 24;
        e.target.value = newValue;
        updateIngredients(newValue);
      });

      // Handle increment/decrement buttons
      adjustButtons.forEach(button => {
        button.addEventListener('click', () => {
          const adjustment = parseInt(button.dataset.adjust);
          let newValue = parseInt(servingsInput.value) + adjustment;
          
          if (newValue < 1) newValue = 1;
          if (newValue > 24) newValue = 24;
          servingsInput.value = newValue;
          updateIngredients(newValue);
        });
      });
    }
'''

TPL = '''<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>{title} • Cook Family Recipes</title>
  <link rel="stylesheet" href="styles.css">
  <link rel="icon" href="Icon.PNG" type="image/png">
  <link rel="apple-touch-icon" href="Icon.PNG">
</head>
<body>
  <div class="container">
    <div class="recipe-header">
      <header>
        <div class="brand">
          <img src="Icon.PNG" class="logo" alt="Cook Family Recipes logo">
          <div>
            <div class="brand-title">Cook Family Recipes</div>
            <div class="brand-sub">{title}</div>
          </div>
        </div>
        <nav aria-label="Main navigation">
          <a href="Cook Family Recipes.html">Home</a>
          <a href="recipes.html">Recipes</a>
          <a href="categories.html">Categories</a>
          <a href="about.html">About</a>
        </nav>
      </header>
    </div>

    <a class="back-link" href="recipes.html">← Back to recipes</a>

    <div class="recipe-content">
      <div class="recipe-thumb" style="background-image:url('{img}');" aria-label="{title}"></div>
      <h1 class="page-title">{title}</h1>
      <div class="recipe-info">
        <div class="meta">
          <div class="time-info">
            <span><i class="icon-clock"></i>Prep: {prepTime}</span>
            <span><i class="icon-cook"></i>Cook: {cookTime}</span>
            <span><i class="icon-total"></i>Total: {totalTime}</span>
          </div>
          <div class="recipe-details">
            <span><i class="icon-difficulty"></i>{difficulty}</span>
            <span><i class="icon-cuisine"></i>{cuisine}</span>
          </div>
        </div>
        <div class="tags">{tags_html}</div>
        <div class="nutrition-info">
          <h4>Nutrition (per serving)</h4>
          <div class="nutrition-grid">
            <div><span>Calories</span><strong>{calories}</strong></div>
            <div><span>Protein</span><strong>{protein}</strong></div>
            <div><span>Carbs</span><strong>{carbs}</strong></div>
            <div><span>Fat</span><strong>{fat}</strong></div>
            <div><span>Fiber</span><strong>{fiber}</strong></div>
          </div>
        </div>
      </div>
      <div class="content">
        <p>{desc}</p>
        <div class="servings-control">
          <label for="servings">Servings:</label>
          <button type="button" class="adjust-servings" data-adjust="-1">−</button>
          <input type="number" id="servings" value="{servings}" min="1" max="24" data-original="{servings}">
          <button type="button" class="adjust-servings" data-adjust="1">+</button>
        </div>
        <h3>Ingredients</h3>
        <ul class="ingredients-list" data-original-servings="{servings}">{ingredients_html}</ul>
        <h3>Steps</h3>
        <ol>{steps_html}</ol>
      </div>
    </div>

    <footer>© <span id="year"></span> Cook Family Recipes</footer>
  </div>
  <script>
{script}
  </script>
</body>
</html>'''

def slug(title: str) -> str:
    return ''.join(c.lower() if c.isalnum() else '-' for c in title).strip('-') + '.html'

def make_tags(tags):
    return ''.join(f'<span class="tag">{t}</span>' for t in tags)

def make_steps(steps):
    return ''.join(f'<li>{s}</li>' for s in steps)

def make_ingredients(ingredients):
    return ''.join(f'<li>{i}</li>' for i in ingredients)

def main():
    data = json.loads(DATA.read_text())
    for r in data:
        fname = OUT / slug(r['title'])
        # Get nutrition info
        nutrition = r.get('nutrition', {})
        
        content = TPL.format(
            title=r['title'],
            img=r.get('img',''),
            prepTime=r.get('prepTime', 'N/A'),
            cookTime=r.get('cookTime', 'N/A'),
            totalTime=r.get('totalTime', 'N/A'),
            difficulty=r.get('difficulty',''),
            cuisine=r.get('cuisine', 'Various'),
            servings=r.get('servings', 4),
            tags_html=make_tags(r.get('tags',[])),
            desc=r.get('desc',''),
            ingredients_html=make_ingredients(r.get('ingredients',[])),
            steps_html=make_steps(r.get('steps',[])),
            # Nutrition info
            calories=nutrition.get('calories', 'N/A'),
            protein=nutrition.get('protein', 'N/A'),
            carbs=nutrition.get('carbohydrates', 'N/A'),
            fat=nutrition.get('fat', 'N/A'),
            fiber=nutrition.get('fiber', 'N/A'),
            script=SCRIPT
        )
        fname.write_text(content, encoding='utf-8')
        print('Wrote', fname)

if __name__ == '__main__':
    main()