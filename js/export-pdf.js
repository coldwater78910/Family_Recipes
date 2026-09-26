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
    btn.addEventListener('click', async function(){
      const url = '/export_pdf?title=' + encodeURIComponent(title);
      // Probe the endpoint: some hosts are static (GitHub Pages) and won't have the server-side route.
      try{
        // Try a HEAD request first. Some static hosts will 200 HTML instead.
        const res = await fetch(url, { method: 'HEAD', mode: 'cors' });
        const ct = res.headers.get('content-type') || '';
        if(res.ok && ct.includes('pdf')){
          window.open(url, '_blank');
          return;
        }
      }catch(e){
        // network error or CORS — fall back to client-side print
      }

      // Fallback: open printable window from current page content
      const contentEl = document.querySelector('.recipe-content') || document.body;
      const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(l=>`<link rel="stylesheet" href="${l.href}">`).join('\n');
      const doc = `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title>${styles}<style>body{padding:20px;background:#fff;color:#111} .print-button{display:none} button{display:inline-block;margin-bottom:12px;padding:8px 12px;border:none;border-radius:8px;background:#e76f51;color:#fff;font-weight:700;cursor:pointer}</style></head><body><button type="button" onclick="window.print()">Print / Save as PDF</button>${contentEl.outerHTML}</body></html>`;
      const blob = new Blob([doc], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const w = window.open(url, '_blank', 'noopener,noreferrer');
      if(!w){ URL.revokeObjectURL(url); alert('Please allow pop-ups to print this recipe.'); return; }
      setTimeout(()=>{ try{ w.focus(); w.print(); }catch(e){} setTimeout(()=>URL.revokeObjectURL(url), 1500); }, 500);
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
