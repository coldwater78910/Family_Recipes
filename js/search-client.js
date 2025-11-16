(function(){
    // Client-side search helper. Exposes doSearchAndRender on window and
    // wires form submit + popstate handling so the search UI works without
    // full page reloads (better mobile experience).

    function renderFallback(list, resultsEl){
        resultsEl.innerHTML = list.map(r=> `
            <a class="card" href="recipe.html?title=${encodeURIComponent(r.title)}">
                <div class="thumb" style="background-image:url('${r.img}')" role="img" aria-label="${r.title}"></div>
                <div class="card-body">
                    <div style="font-weight:700">${r.title}</div>
                    <div class="meta"><span>${r.time}</span><span>${r.difficulty}</span></div>
                    <div style="color:var(--muted);font-size:14px">${r.desc}</div>
                </div>
            </a>
        `).join('');
    }

    function doSearchAndRender(qv){
        const resultsEl = document.getElementById('results');
        const qterm = (qv||'').trim().toLowerCase();
        const list = qterm ? (window.RECIPES || []).filter(r=> (r.title||'').toLowerCase().includes(qterm) || (r.tags||'').toLowerCase().includes(qterm)) : (window.RECIPES || []);
        if(window.FILTER) FILTER.renderList(resultsEl, list);
        else renderFallback(list, resultsEl);
    }

    // expose for initial rendering from inline script
    window.doSearchAndRender = doSearchAndRender;

    // wire up form behaviour
    const form = document.querySelector('form.search');
    const input = document.getElementById('q');

    if(form){
        form.addEventListener('submit', function(e){
            e.preventDefault();
            const qv = input.value || '';
            // update URL without reload
            const params = new URLSearchParams(location.search);
            if(qv.trim()) params.set('q', qv.trim()); else params.delete('q');
            const newUrl = location.pathname + (params.toString() ? ('?' + params.toString()) : '');
            history.pushState({}, '', newUrl);
            doSearchAndRender(qv);
        });

        // handle back/forward
        window.addEventListener('popstate', function(){
            const params = new URLSearchParams(location.search);
            const qv = params.get('q') || '';
            if(input) input.value = qv;
            doSearchAndRender(qv);
        });
    }
})();
