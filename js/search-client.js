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
        const qterm = (qv||'').toString().trim().toLowerCase();
        const all = (window.RECIPES || []).slice();

        if(!resultsEl){
            console.warn('doSearchAndRender: no results element available');
            return;
        }

        // Read common filter controls (homepage may provide these)
        const timeFilter = document.getElementById('timeFilter');
        const difficultyFilter = document.getElementById('difficultyFilter');
        const tagFilter = document.getElementById('tagFilter');
        const sortSelect = document.getElementById('sortSelect');
        const tagMode = document.getElementById('tagMode');

        const selectedTime = (timeFilter && timeFilter.value) ? timeFilter.value : 'any';
        const selectedDifficulty = (difficultyFilter && difficultyFilter.value) ? difficultyFilter.value : 'any';
        const rawTag = (tagFilter && tagFilter.value) ? tagFilter.value : '';
        const tagList = rawTag.split(',').map(s=>s.trim().toLowerCase()).filter(Boolean);

        // Matching function uses FILTER helpers when available
        function matchesRecipe(r){
            const title = (r.title||'');
            const tags = (r.tags||'').toString();
            // text match
            if(qterm){
                const titleOk = title.toLowerCase().includes(qterm) || (window.FILTER && FILTER.fuzzyMatch(title, qterm));
                const tagsOk = tags.toLowerCase().includes(qterm) || (window.FILTER && FILTER.fuzzyMatch(tags, qterm));
                if(!(titleOk || tagsOk)) return false;
            }

            // time filter
            if(selectedTime === 'over60'){
                const mt = (window.FILTER && typeof FILTER.parseMinutes === 'function') ? FILTER.parseMinutes(r.time) : (parseInt(String(r.time||'').replace(/[^0-9]/g,''),10) || null);
                if(mt === null || mt <= 60) return false;
            } else if(selectedTime !== 'any'){
                const mt = (window.FILTER && typeof FILTER.parseMinutes === 'function') ? FILTER.parseMinutes(r.time) : (parseInt(String(r.time||'').replace(/[^0-9]/g,''),10) || null);
                if(mt === null || mt > Number(selectedTime)) return false;
            }

            // difficulty
            if(selectedDifficulty && selectedDifficulty !== 'any'){
                if(((r.difficulty||'')||'').toLowerCase() !== String(selectedDifficulty).toLowerCase()) return false;
            }

            // tag list
            if(tagList.length){
                const rtags = (window.FILTER && typeof FILTER.normalizeTags === 'function') ? FILTER.normalizeTags(r.tags) : (r.tags||'').toString().split(',').map(s=>s.trim().toLowerCase()).filter(Boolean);
                if(tagMode && tagMode.value === 'all'){
                    const allOk = tagList.every(t => rtags.includes(t));
                    if(!allOk) return false;
                } else {
                    const anyOk = tagList.some(t => rtags.includes(t));
                    if(!anyOk) return false;
                }
            }

            return true;
        }

        let list = all.filter(matchesRecipe);

        // Sorting
        const sortVal = (sortSelect && sortSelect.value) ? sortSelect.value : 'none';
        if(sortVal === 'alpha'){
            list.sort((a,b)=> (a.title||'').localeCompare((b.title||'')));
        } else if(sortVal === 'time'){
            const p = (v)=> (window.FILTER && typeof FILTER.parseMinutes === 'function') ? (FILTER.parseMinutes(v) || 0) : (parseInt(String(v||'').replace(/[^0-9]/g,''),10) || 0);
            list.sort((a,b)=> p(a.time) - p(b.time));
        } else if(sortVal === 'difficulty'){
            const rank = s=>{ const m = (s||'').toLowerCase(); if(m==='easy') return 1; if(m==='vegetarian') return 2; if(m==='medium') return 3; if(m==='hard') return 4; return 5; };
            list.sort((a,b)=> rank(a.difficulty) - rank(b.difficulty));
        }

        // If we're rendering into the homepage #recipes container, use pagination
        if(resultsEl.id === 'recipes'){
            _sc_currentList = list;
            _sc_visible = _sc_pageSize;
            _sc_renderVisible(resultsEl);
            _sc_updateLoadMoreVisibility();
        } else {
            if(window.FILTER) FILTER.renderList(resultsEl, list);
            else renderFallback(list, resultsEl);
        }
    }

    // expose for initial rendering from inline script
    window.doSearchAndRender = doSearchAndRender;
    console.info('search-client: loaded and doSearchAndRender available');

    // Client state for homepage pagination and shared helpers
    let _sc_currentList = [];
    let _sc_visible = 4;
    const _sc_pageSize = 4;

    function _sc_renderVisible(resultsEl){
        if(!resultsEl) return;
        const list = Array.isArray(_sc_currentList) ? _sc_currentList : [];
        resultsEl.innerHTML = '';
        if(!list.length){
            resultsEl.innerHTML = '<p style="color:var(--muted)">No results found.</p>';
            return;
        }
        const slice = list.slice(0, _sc_visible);
        if(window.FILTER && typeof FILTER.buildCard === 'function'){
            slice.forEach(r=> resultsEl.appendChild(FILTER.buildCard(r)));
        } else {
            slice.forEach(r=> resultsEl.insertAdjacentHTML('beforeend', `\
                <a class="card" href="recipe.html?title=${encodeURIComponent(r.title)}">\
                    <div class="thumb" style="background-image:url('${r.img}')" role="img" aria-label="${r.title}"></div>\
                    <div class="card-body">\
                        <div style="font-weight:700">${r.title}</div>\
                        <div class="meta"><span>${r.time}</span><span>${r.difficulty}</span></div>\
                        <div style="color:var(--muted);font-size:14px">${r.desc}</div>\
                    </div>\
                </a>\
            `));
        }
    }

    function _sc_updateLoadMoreVisibility(){
        const loadMoreBtn = document.getElementById('loadMore');
        if(!loadMoreBtn) return;
        if(_sc_currentList.length > _sc_visible) loadMoreBtn.style.display = '';
        else loadMoreBtn.style.display = 'none';
    }

    function searchClientLoadMore(){
        _sc_visible += _sc_pageSize;
        const resultsEl = ensureResultsContainer();
        if(resultsEl && resultsEl.id === 'recipes'){
            _sc_renderVisible(resultsEl);
            _sc_updateLoadMoreVisibility();
        }
    }

    function initHomepageSearchClient(){
        // generate tag chips
        try{
            const tagsRow = document.getElementById('tagsRow');
            if(tagsRow){
                const set = new Set();
                (window.RECIPES || []).forEach(r=> String(r.tags||'').split(',').map(t=>t.trim()).forEach(t=>{ if(t) set.add(t.toLowerCase()); }));
                const tags = Array.from(set).sort();
                tagsRow.innerHTML = '';
                tags.forEach(t=>{
                    const s = document.createElement('button');
                    s.type = 'button'; s.className = 'tag'; s.textContent = t;
                    s.addEventListener('click', ()=>{
                        const tagFilter = document.getElementById('tagFilter');
                        const cur = (tagFilter && tagFilter.value) ? tagFilter.value.split(',').map(x=>x.trim().toLowerCase()).filter(Boolean) : [];
                        const idx = cur.indexOf(t);
                        if(idx === -1) cur.push(t); else cur.splice(idx,1);
                        if(tagFilter) tagFilter.value = cur.join(',');
                        doSearchAndRender(document.getElementById('q') ? document.getElementById('q').value : '');
                    });
                    tagsRow.appendChild(s);
                });
            }
        }catch(e){ console.warn('search-client: initHomepage tag generation failed', e); }

        // wire Load more
        const loadMoreBtn = document.getElementById('loadMore');
        if(loadMoreBtn){
            loadMoreBtn.addEventListener('click', function(){ searchClientLoadMore(); });
        }

        // initial render
        const q = (new URLSearchParams(location.search)).get('q') || '';
        doSearchAndRender(q);
        // If the render didn't produce any visible cards in the homepage container,
        // fall back to mounting the canonical RECIPES so the featured area isn't empty.
        try{
            const resultsEl = ensureResultsContainer();
            setTimeout(()=>{
                try{
                    if(resultsEl && resultsEl.id === 'recipes' && resultsEl.children.length === 0){
                        if(window.FILTER && typeof FILTER.mountRecipesFromData === 'function'){
                            console.info('search-client: fallback mounting RECIPES into #recipes');
                            FILTER.mountRecipesFromData(resultsEl, window.RECIPES || []);
                        } else if(window.RECIPES && window.RECIPES.length){
                            console.info('search-client: fallback rendering RECIPES into #recipes (no FILTER)');
                            resultsEl.innerHTML = '';
                            (window.RECIPES || []).forEach(r=> resultsEl.insertAdjacentHTML('beforeend', `\
                                <a class="card" href="recipe.html?title=${encodeURIComponent(r.title)}">\
                                    <div class="thumb" style="background-image:url('${r.img}')" role="img" aria-label="${r.title}"></div>\
                                    <div class="card-body">\
                                        <div style="font-weight:700">${r.title}</div>\
                                        <div class="meta"><span>${r.time}</span><span>${r.difficulty}</span></div>\
                                        <div style="color:var(--muted);font-size:14px">${r.desc}</div>\
                                    </div>\
                                </a>\
                            `));
                        }
                    }
                }catch(e){ console.warn('search-client: fallback mount error', e); }
            }, 30);
        }catch(e){ /* ignore */ }
    }

    // expose helpers
    window.searchClientLoadMore = searchClientLoadMore;
    window.initHomepageSearchClient = initHomepageSearchClient;

    // wire up form behaviour
    const form = document.querySelector('form.search');
    const input = document.getElementById('q');

    // If we're on the homepage (it has a #recipes container), prefer to be
    // non-invasive: the homepage has its own filtering handlers. In that
    // case we expose doSearchAndRender but avoid re-wiring submit/input so
    // we don't conflict with the inline behaviour.
    const isHomepage = !!document.getElementById('recipes');
    if(isHomepage){
        console.info('search-client: homepage detected — attaching safe capture-phase handlers to run doSearchAndRender');
        // Attach a capture-phase submit handler so we reliably intercept form
        // submits (including Enter) and avoid navigation to search.html.
        if(form){
            form.addEventListener('submit', function(e){
                try{
                    e.preventDefault();
                    e.stopPropagation();
                    const qv = (input && input.value) ? input.value : '';
                    doSearchAndRender(qv);
                }catch(err){ console.warn('search-client: homepage submit handler error', err); }
            }, {capture:true});
        }
        // intercept Enter key on the input as well
        if(input){
            input.addEventListener('keydown', function(e){
                if(e.key === 'Enter'){
                    try{ e.preventDefault(); e.stopPropagation(); const qv = input.value || ''; doSearchAndRender(qv); }catch(err){ console.warn('search-client: homepage input handler error', err); }
                }
            }, {capture:true});
        }
    }

    if(form && !isHomepage){
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
                // Only attach live input filtering on non-homepage pages to avoid
                // interfering with the homepage's inline handlers.
                if(!isHomepage){
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
    }
})();
