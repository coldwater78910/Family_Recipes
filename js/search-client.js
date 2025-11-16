(function(){
    // Client-side search helper. Exposes doSearchAndRender on window and
    // wires form submit + popstate handling so the search UI works without
    // full page reloads (better mobile experience).

    // Ensure a results container exists for the renderer to mount into.
    function ensureResultsContainer(){
        // If this script is used on the homepage, prefer the existing recipes
        // container so search results replace the featured list in-place.
        if(document.getElementById('recipes')) return document.getElementById('recipes');
        let resultsEl = document.getElementById('results');
        if(resultsEl) return resultsEl;
        try{
            const container = document.querySelector('.container') || document.body;
            const form = document.querySelector('form.search');
            resultsEl = document.createElement('div');
            resultsEl.id = 'results';
            resultsEl.className = 'grid';
            resultsEl.setAttribute('aria-live', 'polite');
            if(form && form.parentNode){
                form.parentNode.insertBefore(resultsEl, form.nextSibling);
            } else {
                container.appendChild(resultsEl);
            }
            console.info('search-client: created #results container');
        } catch (err){
            console.warn('search-client: failed to create results container', err);
        }
        return document.getElementById('results');
    }

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
        const resultsEl = ensureResultsContainer();
        const qterm = (qv||'').trim().toLowerCase();
        const list = qterm ? (window.RECIPES || []).filter(r=> (r.title||'').toLowerCase().includes(qterm) || (r.tags||'').toLowerCase().includes(qterm)) : (window.RECIPES || []);
        if(!resultsEl){
            console.warn('doSearchAndRender: no results element available');
            return;
        }
        if(window.FILTER) FILTER.renderList(resultsEl, list);
        else renderFallback(list, resultsEl);
    }

    // expose for initial rendering from inline script
    window.doSearchAndRender = doSearchAndRender;
    console.info('search-client: loaded and doSearchAndRender available');

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
        
            // Also perform live filtering as the user types (debounced) to improve mobile UX
            function debounce(fn, wait){
                let t;
                return function(...args){
                    clearTimeout(t);
                    t = setTimeout(()=> fn.apply(this, args), wait);
                };
            }
        
            if(input){
                const live = debounce(function(){
                    const qv = input.value || '';
                    const params = new URLSearchParams(location.search);
                    if(qv.trim()) params.set('q', qv.trim()); else params.delete('q');
                    const newUrl = location.pathname + (params.toString() ? ('?' + params.toString()) : '');
                    history.replaceState({}, '', newUrl);
                    doSearchAndRender(qv);
                }, 220);
                input.addEventListener('input', live);
            }
    }
})();
