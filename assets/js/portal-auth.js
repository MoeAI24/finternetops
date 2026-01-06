/**
 * Enterprise Proof Portal (static demo)
 * - Stores a short-lived session token in localStorage
 * - Dashboard checks for token; redirects if missing
 * NOTE: Replace with real auth later (Firebase/Auth0/Cloud IAP/etc.)
 */
(function(){
  const SESSION_KEY = "mbcc_enterprise_proof_session_v1";
  const EXP_KEY = "mbcc_enterprise_proof_exp_v1";

  function now(){ return Date.now(); }
  function setSession(ttlMinutes){
    const ttl = (ttlMinutes || 60) * 60 * 1000;
    localStorage.setItem(SESSION_KEY, crypto.randomUUID());
    localStorage.setItem(EXP_KEY, String(now() + ttl));
  }
  function clearSession(){
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(EXP_KEY);
  }
  function hasSession(){
    const token = localStorage.getItem(SESSION_KEY);
    const exp = parseInt(localStorage.getItem(EXP_KEY) || "0", 10);
    return !!token && exp > now();
  }

  window.MBCCPortalAuth = { hasSession, setSession, clearSession };

  const loginForm = document.querySelector("[data-portal-login-form]");
  if(loginForm){
    const toast = document.querySelector("[data-portal-toast]");
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = loginForm.querySelector("input[name=email]")?.value?.trim();
      const pass = loginForm.querySelector("input[name=password]")?.value?.trim();
      if(!email || !pass){
        if(toast){ toast.textContent = "Please enter email and password."; toast.classList.add("show"); }
        return;
      }
      setSession(120);
      const next = new URLSearchParams(window.location.search).get("next") || "dashboard.html";
      window.location.href = next;
    });
  }

  const gate = document.querySelector("[data-portal-requires-auth]");
  if(gate){
    if(!hasSession()){
      const here = window.location.pathname.split("/").pop() || "dashboard.html";
      window.location.href = `login.html?next=${encodeURIComponent(here)}`;
      return;
    }
    const logout = document.querySelector("[data-portal-logout]");
    if(logout){
      logout.addEventListener("click", (e)=>{
        e.preventDefault();
        clearSession();
        window.location.href = "login.html";
      });
    }
  }
})();
