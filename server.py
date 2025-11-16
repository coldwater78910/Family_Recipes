#!/usr/bin/env python3
"""
Minimal Flask server to accept screenshot uploads and run the OCR generator.

Usage:
  pip install flask
  python3 server.py

Then open http://localhost:5000/upload

The server will save the uploaded image to a temp file, run
`generate_from_screenshot.py` on it and return JSON with the generated
filename (and the script stdout for debugging).
"""
import os
import subprocess
import tempfile
import base64
from pathlib import Path
from flask import Flask, request, jsonify, send_from_directory, abort, Response
import urllib.parse

ROOT = Path(__file__).resolve().parent
# Use a human-friendly folder name for uploads
UPLOAD_DIR = ROOT / 'Recipe Uploads'
UPLOAD_DIR.mkdir(exist_ok=True)

app = Flask(__name__, static_folder=str(ROOT), static_url_path='')


@app.route('/upload', methods=['GET'])
def upload_page():
    # Optionally enforce basic auth (if SITE_USER/SITE_PASS env vars are set)
    if not _check_basic_auth():
        return _basic_auth_challenge()
    # serve the upload.html static page
    return send_from_directory(str(ROOT), 'upload.html')


@app.route('/upload', methods=['POST'])
def handle_upload():
    if 'image' not in request.files:
        return jsonify(success=False, error='no file uploaded'), 400
    if not _check_basic_auth():
        return _basic_auth_challenge()
    file = request.files['image']
    if file.filename == '':
        return jsonify(success=False, error='empty filename'), 400

    # Save to a temp file under uploads
    fd, tmp_path = tempfile.mkstemp(prefix='screenshot-', suffix='.' + file.filename.split('.')[-1], dir=str(UPLOAD_DIR))
    os.close(fd)
    file.save(tmp_path)

    # Run the existing generator script on the saved image
    script = ROOT / 'generate_from_screenshot.py'
    if not script.exists():
        return jsonify(success=False, error='generator script not found'), 500

    try:
        # Run with python3 and capture output
        proc = subprocess.run(['python3', str(script), tmp_path], capture_output=True, text=True, timeout=120)
        stdout = proc.stdout
        stderr = proc.stderr

        # Try to find "Generated: path" in stdout
        generated = None
        for line in stdout.splitlines():
            if line.strip().startswith('Generated:'):
                parts = line.split(':', 1)
                if len(parts) > 1:
                    generated = parts[1].strip()
                    break

        # If generated is absolute path, derive filename and URL
        filename = None
        url = None
        if generated:
            generated_path = Path(generated)
            filename = generated_path.name
            url = '/' + filename

        return jsonify(success=True, filename=filename, url=url, stdout=stdout, stderr=stderr)
    except subprocess.TimeoutExpired:
        return jsonify(success=False, error='processing timed out'), 500
    except Exception as e:
        return jsonify(success=False, error=str(e)), 500


@app.route('/<path:filename>')
def serve_files(filename):
    # Serve generated recipe pages and other static assets
    # protect static files as well when auth is enabled
    if not _check_basic_auth():
        return _basic_auth_challenge()

    # URL paths may be percent-encoded (spaces -> %20). Decode before resolving.
    safe_name = urllib.parse.unquote(filename)
    file_path = (ROOT / safe_name).resolve()
    # Prevent directory traversal: ensure resolved path is inside ROOT
    try:
        root_resolved = ROOT.resolve()
    except Exception:
        root_resolved = ROOT
    if not str(file_path).startswith(str(root_resolved)):
        return abort(404)
    if file_path.exists():
        # send the decoded filename
        return send_from_directory(str(ROOT), safe_name)
    abort(404)


@app.route('/')
def index():
    # Serve a sensible default for root requests. Prefer 'Cook Family Recipes.html',
    # then 'recipes.html', then 'upload.html'. Enforce auth if enabled.
    if not _check_basic_auth():
        return _basic_auth_challenge()

    for candidate in ("Cook Family Recipes.html", "recipes.html", "upload.html"):
        path = ROOT / candidate
        if path.exists():
            return send_from_directory(str(ROOT), candidate)
    return abort(404)


def _basic_auth_challenge():
    return Response('Authorization required', 401, {'WWW-Authenticate': 'Basic realm="Restricted"'})


def _check_basic_auth():
    """Return True if auth not required or if provided credentials match env vars.

    Set SITE_USER and SITE_PASS environment variables to require auth.
    """
    user = os.environ.get('SITE_USER')
    pw = os.environ.get('SITE_PASS')
    if not user or not pw:
        return True

    auth = request.headers.get('Authorization')
    if not auth or not auth.startswith('Basic '):
        return False
    try:
        b64 = auth.split(' ', 1)[1]
        decoded = base64.b64decode(b64).decode('utf-8')
        u, p = decoded.split(':', 1)
    except Exception:
        return False
    return u == user and p == pw


if __name__ == '__main__':
    # Allow overriding host/port via environment variables to avoid conflicts
    host = os.environ.get('HOST', '127.0.0.1')
    port = int(os.environ.get('PORT', '5000'))
    app.run(host=host, port=port, debug=True)
