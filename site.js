/* =========================
FILE: site.js
Shared helpers (year stamp + safe mailto builder)
Include on pages: <script src="site.js" defer></script>
========================= */
(function(){
  // Auto year
  const yr = document.getElementById("yr");
  if(yr) yr.textContent = new Date().getFullYear();

  // Utility: build a mailto link safely
  window.MBCC_mailto = function(to, subject, body){
    const t = encodeURIComponent(to || "");
    const s = encodeURIComponent(subject || "");
    const b = encodeURIComponent(body || "");
    return `mailto:${t}?subject=${s}&body=${b}`;
  };
})();