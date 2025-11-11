#!/usr/bin/env bash
set -euo pipefail

# prune_removed_recipes.sh
# Remove specific recipe pages from disk and git, commit and push using deploy.sh
# Usage: ./prune_removed_recipes.sh [--push]

cd "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

FILES=(classic-pancakes.html avocado-toast.html one-pot-lemon-chicken.html)

# Confirm files exist
for f in "${FILES[@]}"; do
  if [ -f "$f" ]; then
    echo "Found $f"
  else
    echo "Warning: $f not found"
  fi
done

read -p "Proceed to remove the listed files from disk and git? [y/N] " yn
case "$yn" in
  [Yy]* ) ;;
  * ) echo "Aborting."; exit 0 ;;
esac

# Remove files (force in case of local modifications)
for f in "${FILES[@]}"; do
  if [ -f "$f" ]; then
    git rm -f "$f" || true
    rm -f "$f" || true
    echo "Removed $f"
  else
    echo "Skipped $f (not present)"
  fi
done

# Commit
git add -A
if git diff --cached --quiet; then
  echo "No changes staged for commit. Nothing to do."
  exit 0
fi

git commit -m "Remove legacy recipe pages: Classic Pancakes, Avocado Toast, One-pot Lemon Chicken"

# Push using deploy.sh for consistency
if [ "$#" -ge 1 ] && [ "$1" = "--push" ]; then
  if [ -x ./deploy.sh ]; then
    ./deploy.sh "Remove legacy recipe pages"
  else
    git push
  fi
else
  echo "Committed locally. Run './prune_removed_recipes.sh --push' or './deploy.sh' to push." 
fi
