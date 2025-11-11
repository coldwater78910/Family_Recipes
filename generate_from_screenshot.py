#!/usr/bin/env python3
"""
generate_from_screenshot.py

Scan a screenshot image containing a recipe with OCR and generate a new
recipe HTML page, append the recipe to `recipes.json`, and regenerate
`recipes-slug-map.js` so the site can find the page.

This script uses pytesseract + Pillow for OCR. It does simple heuristic
parsing: first non-empty line is title, then it looks for headings like
"Ingredients" and "Steps" / "Directions" to split sections.

Usage:
  python3 generate_from_screenshot.py path/to/screenshot.jpg

Important: install Tesseract (brew install tesseract) and Python deps:
  pip install pillow pytesseract

"""
import argparse
import json
import os
import re
import shutil
import sys
from pathlib import Path

try:
    from PIL import Image
    import pytesseract
except Exception as e:
    print("Missing dependency: please install Pillow and pytesseract (pip install pillow pytesseract)")
    raise

ROOT = Path(__file__).resolve().parent
RECIPES_JSON = ROOT / 'recipes.json'
SLUG_MAP_JS = ROOT / 'recipes-slug-map.js'
RECIPE_TEMPLATE = ROOT / 'recipe.html'


def slugify(s):
    s = s.lower()
    s = re.sub(r"[^a-z0-9]+", '-', s)
    s = s.strip('-')
    return s or 'recipe'


def ocr_image(path):
    img = Image.open(path)
    text = pytesseract.image_to_string(img)
    return text


def parse_recipe_from_text(text):
    # Normalize line endings and split
    lines = [l.strip() for l in text.splitlines()]
    lines = [l for l in lines if l]
    if not lines:
        return None

    # Title: first non-empty line
    title = lines[0]

    # Join remaining lines to find sections
    body = '\n'.join(lines[1:])

    # Look for headings
    sections = re.split(r'(?mi)^\s*(ingredients|directions|steps|method|instructions)\s*[:\-]*\s*$', body)
    # re.split with capture will produce list like [pre, heading1, content1, heading2, content2, ...]
    content = {'ingredients': [], 'steps': []}

    if len(sections) >= 3:
        # iterate pairs
        pre = sections[0]
        for i in range(1, len(sections), 2):
            heading = sections[i].strip().lower()
            sect_text = sections[i+1].strip()
            lines = [l.strip('-•* \t') for l in sect_text.splitlines() if l.strip()]
            if heading.startswith('ingredient'):
                content['ingredients'].extend(lines)
            else:
                # treat as steps/directions
                # if lines are numbered, keep them, else split by sentence heuristics
                content['steps'].extend(lines)
    else:
        # Fallback: try to find numbered lines as steps
        all_lines = [l.strip('-•* \t') for l in body.splitlines() if l.strip()]
        ing_idx = None
        for i, l in enumerate(all_lines):
            if re.search(r'ingredient', l, re.I):
                ing_idx = i
                break
        if ing_idx is not None:
            content['ingredients'] = all_lines[ing_idx+1:]
        else:
            # Heuristic: lines containing measurements (cup, tsp, tbsp, g, oz) -> ingredients
            ing = [l for l in all_lines if re.search(r'\b(cup|tbsp|tsp|gram|g|oz|ml|slice|cups|tablespoon|teaspoon)\b', l, re.I)]
            if ing:
                content['ingredients'] = ing
                content['steps'] = [l for l in all_lines if l not in ing]
            else:
                # Put everything into steps as a last resort
                content['steps'] = all_lines

    return {
        'title': title,
        'ingredients': content['ingredients'],
        'steps': content['steps'],
        'desc': '',
        'img': '',
        'tags': [],
        'time': '',
        'difficulty': ''
    }


def load_recipes():
    if not RECIPES_JSON.exists():
        return []
    with open(RECIPES_JSON, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return data


def save_recipes(data):
    with open(RECIPES_JSON, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def regenerate_slug_map(recipes):
    # Build mapping title -> slugified filename
    mapping = {}
    for r in recipes:
        title = r.get('title')
        if not title:
            continue
        slug = slugify(title)
        mapping[title] = f"{slug}.html"

    # Write file content similar to existing format
    content = [
        "// Auto-generated slug map to handle recipe pages that do not follow the",
        "// slugify(title) convention. This file was populated automatically from",
        "// `recipes.json` so every recipe title is mapped to the corresponding",
        "// HTML file. If you add or rename recipe pages, regenerate this file.",
        "//",
        "// Format: \"Recipe Title\": \"file-name.html\""
    ]
    content.append('window.SLUG_MAP = window.SLUG_MAP || {')
    for k, v in mapping.items():
        # escape quotes in key
        safe_k = k.replace('"', '\\"')
        content.append(f'    "{safe_k}": "{v}",')
    content.append('};')
    content.append('\n// Keep backwards compatibility if other scripts reassign window.SLUG_MAP')
    content.append('if (typeof window !== "undefined") window.SLUG_MAP = window.SLUG_MAP;')

    with open(SLUG_MAP_JS, 'w', encoding='utf-8') as f:
        f.write('\n'.join(content) + '\n')


def render_static_html(recipe, filename):
    # Read recipe.html template and replace the dynamic section with pre-rendered HTML
    with open(RECIPE_TEMPLATE, 'r', encoding='utf-8') as f:
        tpl = f.read()

    # Build the inner HTML used in recipe.html's JS
    tags_html = ''.join([f'<span class="tag">{t}</span>' for t in (recipe.get('tags') or [])])
    steps_html = ''
    if recipe.get('steps'):
        steps_html = '<h3>Steps</h3><ol>' + ''.join([f'<li>{s}</li>' for s in recipe['steps']]) + '</ol>'

    main_html = f"""
                <div class="recipe-thumb" style="background-image:url('{recipe.get('img','')}')" aria-label="{recipe.get('title')}"></div>
                <h1 style="margin-top:12px">{recipe.get('title')}</h1>
                <div class="meta"><span>{recipe.get('time')}</span><span>{recipe.get('difficulty')}</span></div>
                <div class="tags">{tags_html}</div>
                <div class="content">
                    <p>{recipe.get('desc','')}</p>
                    {steps_html}
                </div>
    """

    # Replace the placeholder <!-- Filled by JS --> with main_html
    if '<!-- Filled by JS -->' in tpl:
        new_html = tpl.replace('<!-- Filled by JS -->', main_html)
    else:
        # fallback: put main_html inside <div id="main"> if present
        new_html = re.sub(r'(<div id="main">)(.*?)(</div>)', r'\1' + main_html + r'\3', tpl, flags=re.S)

    with open(filename, 'w', encoding='utf-8') as f:
        f.write(new_html)


def ensure_tesseract_available():
    if shutil.which('tesseract') is None:
        print('Error: tesseract binary not found. On macOS install via: brew install tesseract')
        return False
    return True


def main():
    parser = argparse.ArgumentParser(description='Generate recipe HTML from a screenshot (OCR)')
    parser.add_argument('image', help='Path to screenshot image')
    parser.add_argument('--slug', help='Optional slug for filename (defaults to slugified title)')
    args = parser.parse_args()

    if not ensure_tesseract_available():
        sys.exit(1)

    img_path = Path(args.image)
    if not img_path.exists():
        print('Image not found:', img_path)
        sys.exit(1)

    text = ocr_image(img_path)
    recipe = parse_recipe_from_text(text)
    if not recipe:
        print('Failed to parse any recipe text from image')
        sys.exit(1)

    # Allow user-provided slug override
    slug = args.slug or slugify(recipe['title'])
    filename = ROOT / f"{slug}.html"

    # If file exists, warn and append suffix
    i = 1
    base_slug = slug
    while filename.exists():
        slug = f"{base_slug}-{i}"
        filename = ROOT / f"{slug}.html"
        i += 1

    # Append to recipes.json
    recipes = load_recipes()
    recipes.append({
        'title': recipe['title'],
        'tags': recipe.get('tags', []),
        'time': recipe.get('time', ''),
        'difficulty': recipe.get('difficulty', ''),
        'img': recipe.get('img', ''),
        'desc': recipe.get('desc', ''),
        'ingredients': recipe.get('ingredients', []),
        'steps': recipe.get('steps', [])
    })
    save_recipes(recipes)

    # Regenerate slug map for all recipes
    regenerate_slug_map(recipes)

    # Create static HTML page
    render_static_html(recipe, filename)

    print('Generated:', filename)
    print('Appended recipe to', RECIPES_JSON)
    print('Updated slug map:', SLUG_MAP_JS)


if __name__ == '__main__':
    main()
