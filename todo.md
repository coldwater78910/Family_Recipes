# Recipe Website — Todo

Last updated: 11 November 2025

This file lists design tasks, feature work, infra items and the current status. I've reorganized and cleaned the list so the top sections contain active work / next steps and the bottom records completed items and notes.

## Active work (high priority)

- [ ] Verify and run tests (tests/filter_tests.js and related utilities)
- [ ] Consolidate remaining pages to canonical data (migrate any inline RECIPES arrays to `recipes-data.js`)
  - [ ] Update `recipe.html` to read from `recipes-data.js` and render by title
  - [ ] Migrate `Cook Family Recipes.html` grid generation to `FILTER.mountRecipesFromData`
- [ ] Extract testable utilities
  - [ ] Move/adapt `parseMinutes`, `levenshtein`, `fuzzyMatch` so Node tests can import them
- [ ] Finish URL-sync and accessibility sweep
  - [ ] Ensure controls read/write URL state and Back/Forward works
  - [ ] Quick accessibility sweep for filter controls, focus states and keyboard navigation

## Infra & ops (convenience / security)

- [ ] Add `.env` support to `run-server.sh` and the Desktop alias (store SITE_USER/SITE_PASS and PORT)
- [ ] Optionally auto-start ngrok from the Desktop alias after server launch (double-click to publish)
- [ ] Create an Automator.app wrapper for a macOS app double-click (optional)
- [ ] Fix `~/.zprofile` Homebrew path warning to avoid login errors

## Completed (snapshot)

- Design & UI
  - Darken background for readability ✅
  - Footer/background consistency ✅
  - Brand/title clickability and header fixes ✅
  - Card/background contrast and visual tweaks ✅
  - Heading font adjustments (Dancing Script) ✅

- Filtering & search
  - Cooking-time ranges, difficulty and dietary filters ✅
  - Sorting (alphabetical, time, difficulty) ✅
  - Tag chips, fuzzy search, pagination (partial) ✅

- Recipes & data
  - `recipes.html`, `search.html`, `Cook Family Recipes.html` wired to `recipes-data.js` where possible ✅
  - `recipes-slug-map.js` support added; `FILTER.buildCard` consults `window.SLUG_MAP` ✅

- OCR import & local server
  - `generate_from_screenshot.py` — OCR -> `recipes.json` + static HTML ✅
  - `upload.html` + `js/upload.js` — browser upload UI ✅
  - `server.py` — Flask endpoint that runs the generator ✅
  - Optional HTTP Basic Auth implemented (`SITE_USER`/`SITE_PASS`) ✅
  - `run-server.sh` — venv creation, deps install, server launch ✅
  - `Start-Recipes-Server.command` — Desktop alias to run the helper ✅
  - `requirements.txt` and `README_OCR.md` (with ngrok guidance) ✅
  - ngrok tunnel tested and working (public HTTPS → local server) ✅

## Recent changes

- `recipes.html` now builds cards from `recipes-data.js` via `FILTER.mountRecipesFromData` ✅
- `search.html` now uses `recipes-data.js` + `FILTER.renderList` ✅
- `recipe.html` updated to read `recipes-data.js` (where applicable) ✅
- Tests updated to use `js/filter-utils.js` for shared utilities (in-progress) ✅

## Notes

- Several legacy pages still contain inline recipe arrays; those should be consolidated to `recipes-data.js` when convenient.
- The server and ngrok setup are intentionally minimal and for local/private use only; do not expose the helper publicly without additional locking.

## Next actions (pick one)

1. I can migrate the homepage fully to `FILTER.mountRecipesFromData` (quick).
2. I can convert `recipe.html` to use the canonical `recipes-data.js` renderer (recommended next step).
3. I can adapt `tests/filter_tests.js` so it imports shared utilities from `js/filter-render.js` (requires a tiny test wrapper).
4. I can implement `.env` support and update the Desktop alias to auto-start server + ngrok for one-click publishing.

Reply with which action you'd like next (number or description) and I'll implement it.
cd ~/Desktop/"Recipes HTML"