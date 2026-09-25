Deploying the PDF export server

This repo contains a small Flask server (`server.py`) that exposes `/export_pdf`.
To make the PDF export available without your local machine, deploy the server to a cloud host.

Recommended options

1) Render (quick, auto-deploy from GitHub)
- Create a new "Web Service" on Render and connect your GitHub repo.
- Use the provided Dockerfile (recommended) or set the build command to `pip install -r requirements.txt` and start command `python3 server.py`.
- Set the service to listen on port 5000. Render will provide a public URL like `https://your-service.onrender.com`.
- On your static site (GitHub Pages), update the download URL to point to `https://your-service.onrender.com/export_pdf?title=...` or keep the existing client script — it will probe the endpoint and use it when available.

2) Google Cloud Run (container)
- Build the Docker image (see Dockerfile) and push to Google Container Registry or Artifact Registry.
- Deploy to Cloud Run and allow unauthenticated invocations. Note the service URL and use it as above.

3) Railway / Fly.io / Heroku / DigitalOcean App Platform
- All support deploying this Dockerfile or a Python environment. Follow their docs for container or repo deployments.

Notes
- The server `/export_pdf` supports CORS (the Flask app sets CORS) so cross-origin requests from GitHub Pages work.
- For best PDF fidelity, ensure `wkhtmltopdf` is available in the container (Dockerfile includes a deb package). WeasyPrint is installed as a fallback via `requirements.txt` but may need additional system fonts.
- Protect the server if you want private access: set `SITE_USER` and `SITE_PASS` environment variables, or use Render/Cloud Run auth features.

Quick local test

```bash
pip install -r requirements.txt
python3 server.py
# Open in browser:
http://localhost:5000/export_pdf?title=Malva%20Pudding
```
