OCR-based recipe importer
=========================

What this does
---------------
This repository includes `generate_from_screenshot.py` — a utility that:

- Uses OCR (pytesseract) to extract text from a screenshot of a recipe.
- Heuristically parses title, ingredients and steps.
- Appends the parsed recipe to `recipes.json`.
- Regenerates `recipes-slug-map.js` to include the new recipe.
- Writes a static HTML page (slugified title -> `your-slug.html`) based on the
  existing `recipe.html` template so the recipe appears in the site.

Dependencies
------------
- macOS: install tesseract binary (Homebrew):

  ```bash
  brew install tesseract
  ```

- Python packages:

  ```bash
  pip install pillow pytesseract
  ```

How to run
----------

1. Put a screenshot (jpg/png) somewhere in the project or pass full path.
2. Run:

```bash
python3 generate_from_screenshot.py path/to/screenshot.jpg
```

Optional: pass `--slug my-slug` to force a filename.

Notes & limitations
-------------------
- OCR accuracy varies; clean, high-resolution screenshots work best.
- The parser is heuristic: it looks for headings like "Ingredients" and
  "Steps". If the screenshot is a photo of text without headings, the
  script will try to heuristically separate ingredients (by detecting
  measurement words) and steps.
- After running, check the generated HTML and `recipes.json` for correctness
  and adjust manually if needed.

Want automation? I can:
- Add an npm / make script to run this.
- Add image pre-processing (resize, binarize) to improve OCR results.

Running as a local web service
-----------------------------
If you'd rather upload screenshots from the browser, there's a tiny Flask server
included: `server.py`. It serves an upload page at `/upload`, accepts image
uploads, runs `generate_from_screenshot.py` on the uploaded image, and returns
the generated filename.

Quick start:

```bash
# Install Flask (and the other deps)
pip install flask pillow pytesseract

# Ensure tesseract binary is installed on macOS:
brew install tesseract

# Run the local server
python3 server.py

# Visit in your browser:
http://127.0.0.1:5000/upload
```

Security note: this server is intentionally minimal for local use only. Do not
expose it to the public internet without adding authentication and input
validation.
