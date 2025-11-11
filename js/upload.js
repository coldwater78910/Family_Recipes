document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('upload-form');
  const status = document.getElementById('status');
  const result = document.getElementById('result');

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    status.textContent = 'Uploading and processing...';
    result.innerHTML = '';

    const input = document.getElementById('image');
    if (!input.files || !input.files.length) {
      status.textContent = 'Please choose an image file.';
      return;
    }

    const file = input.files[0];
    const fd = new FormData();
    fd.append('image', file, file.name);

    try {
      const res = await fetch('/upload', {
        method: 'POST',
        body: fd
      });
      if (!res.ok) throw new Error('Server returned ' + res.status);
      const data = await res.json();
      if (data.success) {
        status.textContent = 'Recipe generated successfully.';
        const link = document.createElement('a');
        link.href = data.url || data.filename || ('/' + (data.slug || ''));
        link.textContent = data.filename || data.url || data.slug || 'Open recipe';
        link.target = '_blank';
        result.appendChild(link);
        if (data.stdout) {
          const pre = document.createElement('pre');
          pre.style.marginTop = '12px';
          pre.textContent = data.stdout;
          result.appendChild(pre);
        }
      } else {
        status.textContent = 'Processing failed: ' + (data.error || 'unknown error');
      }
    } catch (err) {
      status.textContent = 'Upload failed: ' + err.message;
    }
  });
});
