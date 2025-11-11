(function(){
    // Minimal shared rendering + filter utilities for the static site
    const FILTER = {};

    FILTER.parseMinutes = function(value){
        if(typeof window !== 'undefined' && window.FILTER_UTILS && typeof window.FILTER_UTILS.parseMinutes === 'function'){
            return window.FILTER_UTILS.parseMinutes(value);
        }
        if(!value) return null;
        const n = parseInt(String(value).trim().replace(/[^0-9]/g,''), 10);
        return Number.isFinite(n) ? n : null;
    };

    // Levenshtein distance
    FILTER.levenshtein = function(a, b){
        if(typeof window !== 'undefined' && window.FILTER_UTILS && typeof window.FILTER_UTILS.levenshtein === 'function'){
            return window.FILTER_UTILS.levenshtein(a, b);
        }
        if(a === b) return 0;
        a = String(a || ''); b = String(b || '');
        if(a.length === 0) return b.length;
        if(b.length === 0) return a.length;
        const matrix = [];
        for(let i=0;i<=b.length;i++) matrix[i] = [i];
        for(let j=0;j<=a.length;j++) matrix[0][j] = j;
        for(let i=1;i<=b.length;i++){
            for(let j=1;j<=a.length;j++){
                if(b.charAt(i-1) === a.charAt(j-1)) matrix[i][j] = matrix[i-1][j-1];
                else matrix[i][j] = Math.min(matrix[i-1][j-1]+1, matrix[i][j-1]+1, matrix[i-1][j]+1);
            }
        }
        return matrix[b.length][a.length];
    };

    FILTER.fuzzyMatch = function(text, term){
        if(typeof window !== 'undefined' && window.FILTER_UTILS && typeof window.FILTER_UTILS.fuzzyMatch === 'function'){
            return window.FILTER_UTILS.fuzzyMatch(text, term);
        }
        if(!text || !term) return false;
        const a = String(text).toLowerCase();
        const b = String(term).toLowerCase();
        if(b.length < 3) return a.includes(b);
        if(a.includes(b)) return true;
        const distance = FILTER.levenshtein(a, b);
        const maxAllowed = Math.max(1, Math.floor(Math.max(a.length, b.length) * 0.35));
        return distance <= maxAllowed;
    };

    FILTER.normalizeTags = function(raw){
        if(!raw) return [];
        return String(raw).split(',').map(s=>s.trim().toLowerCase()).filter(Boolean);
    };

    function slugify(title){
        return String(title).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'') + '.html';
    }

    // Build a card element from a recipe object
    FILTER.buildCard = function(recipe){
        const a = document.createElement('a');
        a.className = 'card';
        // allow an explicit slug map to override the default slugify behavior
        const mapped = (typeof window !== 'undefined' && window.SLUG_MAP && window.SLUG_MAP[recipe.title]) ? window.SLUG_MAP[recipe.title] : null;
        const slug = mapped || slugify(recipe.title);
        a.href = slug;
        a.dataset.title = recipe.title || '';
        a.dataset.tags = (recipe.tags || '').toString();
        a.dataset.time = recipe.time || '';
        a.dataset.difficulty = recipe.difficulty || '';
        a.innerHTML = `
            <div class="thumb" style="background-image:url('${recipe.img}');" role="img" aria-label="${recipe.title}"></div>
            <div class="card-body">
                <div class="card-title">${recipe.title}</div>
                <div class="meta"><span>${recipe.time}</span><span>${recipe.difficulty}</span></div>
                <div class="small-muted">${recipe.desc || ''}</div>
            </div>
        `;
        return a;
    };

    // Mount recipes into a container (clears first)
    FILTER.mountRecipesFromData = function(containerSelectorOrEl, recipes){
        const container = (typeof containerSelectorOrEl === 'string') ? document.querySelector(containerSelectorOrEl) : containerSelectorOrEl;
        if(!container) return [];
        container.innerHTML = '';
        const cards = [];
        (recipes || []).forEach(r => {
            const c = FILTER.buildCard(r);
            container.appendChild(c);
            cards.push(c);
        });
        return cards;
    };

    // Render helper for pages that already have card elements: reorder/append matched cards
    FILTER.renderMatchedCards = function(recipesContainer, matchedCards, visible){
        const container = (typeof recipesContainer === 'string') ? document.querySelector(recipesContainer) : recipesContainer;
        if(!container) return;
        container.innerHTML = '';
        matchedCards.slice(0, visible).forEach(c=> container.appendChild(c));
    };

    // Matching against a card element (reads data-* attributes)
    FILTER.matchesCard = function(card, term, maxMinutes, difficulty, tagList, selectedTime, tagMode){
        const t = (term||'').trim().toLowerCase();
        if(t){
            const title = (card.dataset.title||'');
            const tags = (card.dataset.tags||'');
            const titleOk = title.toLowerCase().includes(t) || FILTER.fuzzyMatch(title, t);
            const tagsOk = tags.toLowerCase().includes(t) || FILTER.fuzzyMatch(tags, t);
            if(!(titleOk || tagsOk)) return false;
        }

        if(selectedTime === 'over60'){
            const cardTime = FILTER.parseMinutes(card.dataset.time);
            if(cardTime === null || cardTime <= 60) return false;
        } else if(maxMinutes !== null){
            const cardTime = FILTER.parseMinutes(card.dataset.time);
            if(cardTime === null || cardTime > Number(maxMinutes)) return false;
        }

        if(difficulty && difficulty !== 'any'){
            const cardDiff = (card.dataset.difficulty||'').toLowerCase();
            if(cardDiff !== String(difficulty).toLowerCase()) return false;
        }

        if(Array.isArray(tagList) && tagList.length){
            const cardTags = FILTER.normalizeTags(card.dataset.tags);
            const mode = (tagMode && tagMode.value) ? tagMode.value : 'any';
            if(mode === 'all'){
                const allMatch = tagList.every(tag => cardTags.includes(tag));
                if(!allMatch) return false;
            } else {
                const anyMatch = tagList.some(tag => cardTags.includes(tag));
                if(!anyMatch) return false;
            }
        }

        return true;
    };

    // Small helper to render a recipe list into a container (used by search.html)
    FILTER.renderList = function(containerOrEl, list){
        const el = (typeof containerOrEl === 'string') ? document.querySelector(containerOrEl) : containerOrEl;
        if(!el) return;
        el.innerHTML = '';
        if(!list || !list.length){
            el.innerHTML = '<p style="color:var(--muted)">No results found.</p>';
            return;
        }
        list.forEach(r=> el.appendChild(FILTER.buildCard(r)));
    };

    // expose
    window.FILTER = FILTER;
})();
