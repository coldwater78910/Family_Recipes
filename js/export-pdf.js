// Inject a Download PDF button for static recipe pages.
(function(){
  function getTitle(){
    const el = document.querySelector('.page-title');
    if(el) return el.textContent.trim();
    // fallback: use document title without site suffix
    return document.title.replace(' • Cook Family Recipes','').trim();
  }

  const title = getTitle();
  if(!title) return;

  function makeButton(){
    const btn = document.createElement('button');
    btn.className = 'btn btn-inline print-button';
    btn.type = 'button';
    btn.title = 'Print recipe';
    btn.setAttribute('aria-label', 'Print recipe');
    btn.style.marginLeft = '12px';
    btn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 9V4h10v5"/><path d="M5 12h14a2 2 0 0 1 2 2v4H3v-4a2 2 0 0 1 2-2z"/><path d="M7 17h10v3H7z"/><path d="M7 8h10"/></svg>';
    btn.addEventListener('click', function(){
      const contentEl = document.querySelector('.recipe-content') || document.body;
      const cleanHtml = `
        <!doctype html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>${title}</title>
          <style>
            :root{ color-scheme: light; }
            html, body { margin: 0; padding: 0; background: #fff; color: #111; }
            body{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; padding: 24px; line-height: 1.5; }
            *{ box-sizing: border-box; }
            h1,h2,h3,h4,h5,h6{ margin: 0 0 12px; color: #111; }
            p, li{ color: #111; }
            .recipe-info, .tags, .meta, .recipe-details, nav, header, .back-link, .print-button, .brand, .logo, footer { display: none !important; }
            .recipe-content { display: block; }
            .content ol, .content ul { padding-left: 1.25rem; }
            img{ max-width: 100%; height: auto; display: block; margin: 0 0 16px; }
            .tag{ display: inline-block; padding: 4px 8px; border-radius: 999px; background: #f1f1f1; margin: 0 6px 8px 0; }
            @page { margin: 0.55in; size: auto; }
            @media print { html, body { background: #fff !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
          </style>
        </head>
        <body>${contentEl.outerHTML}</body>
        </html>
      `;

      const blob = new Blob([cleanHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const w = window.open(url, '_blank', 'noopener,noreferrer,toolbar=0,location=0,status=0,menubar=0,scrollbars=0,resizable=0,width=900,height=1100');
      if(!w){ URL.revokeObjectURL(url); alert('Please allow pop-ups to print this recipe.'); return; }

      setTimeout(() => {
        try {
          w.focus();
          w.document.title = title;
          w.print();
        } catch (e) {}
        setTimeout(() => URL.revokeObjectURL(url), 1500);
      }, 300);
    });
    return btn;
  }

  const back = document.querySelector('.back-link');
  const btn = makeButton();
  if(back && back.parentNode) back.parentNode.insertBefore(btn, back.nextSibling);
  else {
    const header = document.querySelector('.recipe-header') || document.querySelector('header');
    if(header) header.appendChild(btn);
  }
})();
