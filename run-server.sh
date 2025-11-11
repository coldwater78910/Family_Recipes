#!/usr/bin/env bash
set -euo pipefail
# run-server.sh — helper to create venv, install deps and start the Flask server

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

if [ ! -d ".venv" ]; then
  echo "Creating virtual environment in .venv..."
  python3 -m venv .venv
fi

# shellcheck source=/dev/null
source .venv/bin/activate

echo "Upgrading pip and installing dependencies (flask pillow pytesseract)..."
python3 -m pip install --upgrade pip setuptools wheel
pip install flask pillow pytesseract

echo "Starting Flask server (server.py)..."
python3 server.py
