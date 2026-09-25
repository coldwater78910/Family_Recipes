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
    btn.addEventListener('click', function(){
      const url = '/export_pdf?title=' + encodeURIComponent(title);
      window.open(url, '_blank');
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
