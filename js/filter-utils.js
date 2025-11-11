(function(root){
    const utils = {};

    utils.parseMinutes = function(value){
        if(!value) return null;
        const n = parseInt(String(value).trim().replace(/[^0-9]/g,''), 10);
        return Number.isFinite(n) ? n : null;
    };

    utils.levenshtein = function(a, b){
        if(a === b) return 0;
        a = String(a || ''); b = String(b || '');
        if(a.length === 0) return b.length;
        if(b.length === 0) return a.length;
        const matrix = [];
        for(let i=0;i<=b.length;i++){ matrix[i]=[i]; }
        for(let j=0;j<=a.length;j++){ matrix[0][j]=j; }
        for(let i=1;i<=b.length;i++){
            for(let j=1;j<=a.length;j++){
                if(b.charAt(i-1) === a.charAt(j-1)) matrix[i][j] = matrix[i-1][j-1];
                else matrix[i][j] = Math.min(matrix[i-1][j-1]+1, matrix[i][j-1]+1, matrix[i-1][j]+1);
            }
        }
        return matrix[b.length][a.length];
    };

    utils.fuzzyMatch = function(text, term){
        if(!text || !term) return false;
        const a = String(text).toLowerCase();
        const b = String(term).toLowerCase();
        if(b.length < 3) return a.includes(b);
        if(a.includes(b)) return true;
        const distance = utils.levenshtein(a, b);
        const maxAllowed = Math.max(1, Math.floor(Math.max(a.length, b.length) * 0.35));
        return distance <= maxAllowed;
    };

    // expose for browser as FILTER_UTILS and support CommonJS in Node
    if(typeof module !== 'undefined' && module.exports){
        module.exports = utils;
    }
    if(typeof root !== 'undefined'){
        root.FILTER_UTILS = utils;
    }
})(typeof window !== 'undefined' ? window : global);
