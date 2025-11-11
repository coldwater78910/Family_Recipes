#!/usr/bin/env bash
set -euo pipefail

# deploy.sh — simple auto-deploy helper for this repo
# Usage:
#   ./deploy.sh "Optional commit message"
# It will: ensure we're in a git repo, stage all changes, commit (timestamped default),
# and push to origin. If no origin exists and `gh` is available it will try to create the repo.

cd "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "[deploy.sh] Running from $(pwd)"

# Initialize git repo if missing
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "[deploy.sh] No git repository found. Initializing..."
  git init
fi

# Ensure a remote named 'origin' exists; if not try to create via gh
if ! git remote get-url origin >/dev/null 2>&1; then
  echo "[deploy.sh] No 'origin' remote found."
  if command -v gh >/dev/null 2>&1; then
    echo "[deploy.sh] Attempting to create repository on GitHub using 'gh'..."
    # try to create under authenticated account; will fail if repo exists or permissions missing
    gh repo create --private --source=. --remote=origin --push --confirm || {
      echo "[deploy.sh] gh failed to create a repo. Please add a remote manually and re-run."
      exit 1
    }
    echo "[deploy.sh] Repository created and pushed via gh. Done."
    exit 0
  else
    echo "[deploy.sh] gh CLI not available. Add a remote and re-run, e.g."
    echo "  git remote add origin git@github.com:<user>/<repo>.git"
    exit 1
  fi
fi

# Stage all changes
echo "[deploy.sh] Staging changes..."
git add -A

# Prepare commit message
if [ "$#" -ge 1 ]; then
  MSG="$*"
else
  MSG="Auto deploy: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
fi

# Detect if there are changes to commit
if git diff --cached --quiet && git diff --quiet; then
  echo "[deploy.sh] No changes to commit. Pushing current branch..."
  git push || { echo "[deploy.sh] Push failed; check remote and authentication."; exit 1; }
  echo "[deploy.sh] Push complete (no new commit)."
  exit 0
fi

echo "[deploy.sh] Creating commit..."
git commit -m "$MSG" || { echo "[deploy.sh] Commit failed (nothing to commit?)."; exit 1; }

# Ensure upstream is set and push
BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "[deploy.sh] Current branch: $BRANCH"
if ! git rev-parse --abbrev-ref --symbolic-full-name @{u} >/dev/null 2>&1; then
  echo "[deploy.sh] No upstream for $BRANCH — pushing and setting upstream to origin/$BRANCH"
  git push -u origin "$BRANCH" || { echo "[deploy.sh] Push failed."; exit 1; }
else
  git push || { echo "[deploy.sh] Push failed."; exit 1; }
fi

echo "[deploy.sh] Deploy complete."
