/* MBCC Finternet Ops — Stage 7 Hard-Gating (static-site friendly)
   NOTE: Real "hard gating" requires an edge/auth layer (Cloudflare Access, Firebase Hosting, etc).
   This script provides role-based route guards + token storage + optional JWT validation (best-effort).
*/
(function(){
  const CFG_KEY = "mbcc_auth_cfg_v1";
  const TOK_KEY = "mbcc_access_token_v1";
  const ID_KEY  = "mbcc_identity_v1";

  const defaultCfg = {
    provider: "manual", // "manual" | "cloudflare" | "firebase"
    jwt: { iss: "", aud: "", jwks: "" },
    roleClaim: "mbcc_role",
    roles: ["Public","Associate","Operator","Partner","Admin"],
    protect: [
      { path: "/training/partner-dashboard.html", minRole: "Associate" },
      { path: "/training/partner-onboarding.html", minRole: "Associate" },
      { path: "/training/toolkit.html", minRole: "Associate" },
      { path: "/training/agents/", minRole: "Associate" },
      { path: "/training/licensing/", minRole: "Associate" },
      { path: "/training/enterprise-proof/", minRole: "Associate" },
      { path: "/training/agents/install/", minRole: "Operator" }
    ],
    loginPath: "/training/login.html",
    deniedPath: "/training/access-denied.html"
  };

  function getCfg(){
    try{ return Object.assign({}, defaultCfg, JSON.parse(localStorage.getItem(CFG_KEY)||"{}")); }
    catch(e){ return defaultCfg; }
  }
  function setCfg(cfg){ localStorage.setItem(CFG_KEY, JSON.stringify(cfg||defaultCfg)); }

  function base64urlDecode(str){
    str = str.replace(/-/g,'+').replace(/_/g,'/');
    while(str.length % 4) str += '=';
    try{
      return decodeURIComponent(atob(str).split('').map(c => '%'+('00'+c.charCodeAt(0).toString(16)).slice(-2)).join(''));
    }catch(e){
      return atob(str);
    }
  }
  function parseJwt(token){
    const parts = (token||"").split('.');
    if(parts.length !== 3) return null;
    try{
      return { header: JSON.parse(base64urlDecode(parts[0])),
               payload: JSON.parse(base64urlDecode(parts[1])),
               signature: parts[2] };
    }catch(e){ return null; }
  }
  function nowSec(){ return Math.floor(Date.now()/1000); }
  function roleIndex(cfg, role){ const i = cfg.roles.indexOf(role); return i>=0?i:0; }
  function getRoleFromToken(cfg, token){
    const jwt = parseJwt(token); if(!jwt) return null;
    return jwt.payload && jwt.payload[cfg.roleClaim] ? String(jwt.payload[cfg.roleClaim]) : null;
  }
  function tokenLooksValid(cfg, token){
    if(!token) return { ok:false, reason:"Missing token" };
    const jwt = parseJwt(token);
    if(!jwt) return { ok:true, reason:"Opaque token accepted (manual mode)" };
    if(jwt.payload.exp && nowSec() > Number(jwt.payload.exp)) return { ok:false, reason:"Token expired" };
    if(cfg.jwt.iss && jwt.payload.iss && cfg.jwt.iss !== jwt.payload.iss) return { ok:false, reason:"Issuer mismatch" };
    if(cfg.jwt.aud && jwt.payload.aud){
      const aud = jwt.payload.aud;
      const ok = Array.isArray(aud) ? aud.includes(cfg.jwt.aud) : String(aud)===String(cfg.jwt.aud);
      if(!ok) return { ok:false, reason:"Audience mismatch" };
    }
    return { ok:true, reason:"JWT validated (exp/iss/aud best-effort)" };
  }
  function saveToken(token){
    localStorage.setItem(TOK_KEY, token || "");
    const cfg = getCfg();
    const jwt = parseJwt(token);
    const role = jwt ? (jwt.payload && jwt.payload[cfg.roleClaim]) : null;
    const who = jwt ? (jwt.payload.email || jwt.payload.sub || "") : "";
    localStorage.setItem(ID_KEY, JSON.stringify({ role: role||"Associate", who: who||"" }));
  }
  function clearToken(){ localStorage.removeItem(TOK_KEY); localStorage.removeItem(ID_KEY); }
  function getToken(){ return localStorage.getItem(TOK_KEY) || ""; }
  function getIdentity(){ try{ return JSON.parse(localStorage.getItem(ID_KEY)||"{}"); }catch(e){ return {}; } }

  function matchProtection(cfg, path){
    const p = path || location.pathname;
    const pp = p.startsWith("/") ? p : ("/"+p);
    for(const rule of cfg.protect){ if(pp.startsWith(rule.path)) return rule; }
    return null;
  }

  function ensureAccess(){
    const cfg = getCfg();
    const rule = matchProtection(cfg, location.pathname);
    if(!rule) return;
    const token = getToken();
    const val = tokenLooksValid(cfg, token);
    if(!val.ok){
      const next = encodeURIComponent(location.pathname + location.search + location.hash);
      location.href = cfg.loginPath + "?next=" + next;
      return;
    }
    const role = getRoleFromToken(cfg, token) || (getIdentity().role) || "Associate";
    if(roleIndex(cfg, role) < roleIndex(cfg, rule.minRole)){
      const next = encodeURIComponent(location.pathname);
      location.href = cfg.deniedPath + "?need=" + encodeURIComponent(rule.minRole) + "&have=" + encodeURIComponent(role) + "&next=" + next;
      return;
    }
  }

  window.MBCCAuth = { getCfg, setCfg, saveToken, clearToken, getToken, getIdentity, tokenLooksValid, ensureAccess };
})();