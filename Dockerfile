FROM python:3.11-slim

# Install wkhtmltopdf dependencies and wkhtmltopdf
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       wget ca-certificates gnupg2 xz-utils fontconfig libxrender1 libxext6 libssl1.1 libx11-6 \
    && rm -rf /var/lib/apt/lists/*

# Download prebuilt static wkhtmltopdf (uses patched Qt) — change version as needed
RUN wget -q https://github.com/wkhtmltopdf/packaging/releases/download/0.12.6-1/wkhtmltox_0.12.6-1.buster_amd64.deb \
    && apt-get update \
    && apt-get install -y --no-install-recommends ./wkhtmltox_0.12.6-1.buster_amd64.deb \
    && rm -f wkhtmltox_0.12.6-1.buster_amd64.deb

# Create app dir
WORKDIR /app

COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . /app

ENV PORT=5000
EXPOSE 5000

CMD ["python3", "server.py"]
