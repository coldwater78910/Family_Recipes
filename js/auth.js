// Lightweight client-side password gate
// Uses SubtleCrypto SHA-256 hashing and compares to window.SITE_PASSWORD_HASH
// If SITE_PASSWORD_HASH is empty the gate is disabled.

(function(){
  'use strict';
  let _prevBodyVisibility = null;
  let _prevDocOverflow = null;
  async function sha256Hex(str){
    const enc = new TextEncoder();
    const data = enc.encode(str);
    const hash = await crypto.subtle.digest('SHA-256', data);
    const bytes = new Uint8Array(hash);
    return Array.from(bytes).map(b=>b.toString(16).padStart(2,'0')).join('');
  }

  function createOverlay(){
    const ov = document.createElement('div');
    ov.id = 'site-auth-overlay';
    // Use a fully opaque overlay so the page behind cannot be seen.
    Object.assign(ov.style,{
      position:'fixed',inset:'0',zIndex:2147483647,display:'flex',alignItems:'center',justifyContent:'center',background:'#ffffff',color:'#111'
    });

    const card = document.createElement('div');
    Object.assign(card.style,{background:'#fff',padding:'22px',borderRadius:'12px',maxWidth:'420px',width:'90%',boxShadow:'0 10px 40px rgba(0,0,0,0.3)',color:'#111'});
    card.innerHTML = `
      <h2 style="margin:0 0 12px 0;font-size:20px">Enter site password</h2>
      <p style="margin:0 0 12px 0;color:#333">This site is private. Enter the password to continue.</p>
      <input id="site-auth-input" type="password" placeholder="Password" style="width:100%;padding:10px 12px;border-radius:8px;border:1px solid #ddd;margin-bottom:12px;">
      <div style="display:flex;gap:8px;justify-content:flex-end">
        <button id="site-auth-btn" style="background:#e76f51;color:#fff;border:none;padding:8px 12px;border-radius:8px;font-weight:700">Enter</button>
      </div>
      <div id="site-auth-error" style="color:#b00;margin-top:10px;display:none"></div>
    `;
    ov.appendChild(card);
    return ov;
  }

  async function initAuth(){
    try{
      const hash = (window.SITE_PASSWORD_HASH||'').trim();
      if(!hash){
        // gate disabled
        return;
      }

      if(sessionStorage.getItem('site_authed') === '1') return;

      const ov = createOverlay();
      // Hide page content while overlay is active so users cannot see underlying content.
      try{
        _prevBodyVisibility = document.body.style.visibility || '';
        _prevDocOverflow = document.documentElement.style.overflow || '';
        // hide the body (overlay will be appended to the documentElement so it stays visible)
        document.body.style.visibility = 'hidden';
        document.documentElement.style.overflow = 'hidden';
      } catch(e) {
        console.warn('Could not modify document visibility/overflow', e);
      }
      // Append to the root element so it's not hidden when body.visibility is set to hidden
      document.documentElement.appendChild(ov);

      const input = document.getElementById('site-auth-input');
      const btn = document.getElementById('site-auth-btn');
      const err = document.getElementById('site-auth-error');

      async function attempt(){
        const val = input.value || '';
        const h = await sha256Hex(val);
        if(h === hash){
          sessionStorage.setItem('site_authed','1');
          // restore document state
          try{
            ov.remove();
            if(_prevBodyVisibility !== null) document.body.style.visibility = _prevBodyVisibility;
            if(_prevDocOverflow !== null) document.documentElement.style.overflow = _prevDocOverflow;
          }catch(e){ /* ignore restore errors */ }
        } else {
          err.textContent = 'Incorrect password'; err.style.display = '';
        }
      }

      btn.addEventListener('click', attempt);
      input.addEventListener('keydown', e=>{ if(e.key === 'Enter') attempt(); });
      input.focus();
    }catch(e){
      // if crypto API missing, allow access (fail open) and log
      console.error('auth init failed', e);
      // Attempt to restore any visibility changes we made
      try{
        if(_prevBodyVisibility !== null) document.body.style.visibility = _prevBodyVisibility;
        if(_prevDocOverflow !== null) document.documentElement.style.overflow = _prevDocOverflow;
      }catch(_){ }
    }
  }

  if(document.readyState === 'complete' || document.readyState === 'interactive'){
    initAuth();
  } else {
    document.addEventListener('DOMContentLoaded', initAuth);
  }
})();
