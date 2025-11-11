#!/usr/bin/env bash
set -euo pipefail

# add_and_publish_recipe.sh
# Usage: ./add_and_publish_recipe.sh path/to/image.jpg [--slug my-slug] [--no-regenerate] [--no-push]
#
# Runs the OCR generator, updates recipes-data.js from recipes.json, optionally regenerates
# all static recipe pages, and commits + pushes via deploy.sh (unless --no-push supplied).

cd "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ "$#" -lt 1 ]; then
  echo "Usage: $0 path/to/image.jpg [--slug my-slug] [--no-regenerate] [--no-push]"
  exit 1
fi

IMAGE="$1"
shift || true
SLUG=""
REGENERATE_PAGES=1
PUSH=1

while [ "$#" -gt 0 ]; do
  case "$1" in
    --slug) SLUG="$2"; shift 2;;
    --no-regenerate) REGENERATE_PAGES=0; shift;;
    --no-push) PUSH=0; shift;;
    *) echo "Unknown arg: $1"; exit 1;;
  esac
done

# Activate venv if present
if [ -f ".venv/bin/activate" ]; then
  # shellcheck disable=SC1091
  source .venv/bin/activate
fi

if [ ! -f "$IMAGE" ]; then
  echo "Image not found: $IMAGE"
  exit 1
fi

CMD=(python3 generate_from_screenshot.py "$IMAGE")
if [ -n "$SLUG" ]; then
  CMD+=(--slug "$SLUG")
fi

echo "Running OCR generator..."
"${CMD[@]}"

echo "Syncing recipes.json -> recipes-data.js..."
python3 - <<'PY'
import json
from pathlib import Path
ROOT=Path('.').resolve()
data=json.load(open(ROOT/'recipes.json','r',encoding='utf-8'))
out=ROOT/'recipes-data.js'
with open(out,'w',encoding='utf-8') as f:
    f.write('/* Auto-generated from recipes.json */\n')
    f.write('const RECIPES = ')
    json.dump(data, f, indent=2, ensure_ascii=False)
    f.write(';\n\nif(typeof window !== "undefined") window.RECIPES = RECIPES;\n')
print('Wrote', out)
PY

if [ "$REGENERATE_PAGES" -eq 1 ]; then
  echo "Regenerating static recipe pages for all recipes..."
  python3 generate_recipes.py
fi

# Get last recipe title for commit message
TITLE=$(python3 - <<'PY'
import json
data=json.load(open('recipes.json','r',encoding='utf-8'))
if data:
    print(data[-1].get('title','(new recipe)'))
else:
    print('(no recipe)')
PY
)

echo "Staging and committing changes..."
git add -A
git commit -m "Add recipe: ${TITLE} (generated)" || echo "Nothing to commit"

if [ "$PUSH" -eq 1 ]; then
  if [ -x ./deploy.sh ]; then
    ./deploy.sh "Add recipe: ${TITLE} (generated)"
  else
    git push
  fi
else
  echo "Skipping push (--no-push). Commit created locally." 
fi

echo "Done. Recipe added: ${TITLE}"
