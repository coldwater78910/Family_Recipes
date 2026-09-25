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
    btn.className = 'btn btn-inline';
    btn.type = 'button';
    btn.textContent = 'Download PDF';
    btn.style.marginLeft = '12px';
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
      const doc = `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title>${styles}<style>body{padding:20px}</style></head><body>${contentEl.outerHTML}</body></html>`;
      const w = window.open('', '_blank');
      w.document.open();
      w.document.write(doc);
      w.document.close();
      setTimeout(()=>{ try{ w.focus(); w.print(); }catch(e){} }, 500);
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
