
/* MBCC Certificate System (local verification demo)
   Storage: localStorage["mbcc_cert_registry_v1"] = { <id>: {name,track,issuedAt,program,score} } */
(function(){
  const REG_KEY = "mbcc_cert_registry_v1";

  function loadRegistry(){
    try{
      const raw = localStorage.getItem(REG_KEY);
      return raw ? JSON.parse(raw) : {};
    }catch(e){ return {}; }
  }
  function saveRegistry(reg){
    try{ localStorage.setItem(REG_KEY, JSON.stringify(reg)); }catch(e){}
  }
  function normTrack(t){
    t = String(t||"").toLowerCase().trim();
    if(t === "salespartner") return "sales";
    if(t === "sales/partner") return "sales";
    return t;
  }
  function prettyTrack(t){
    t = normTrack(t);
    if(t==="operator") return "Operator";
    if(t==="consultant") return "Consultant";
    if(t==="sales") return "Sales/Partner";
    return "—";
  }
  function makeId(){
    // MBCC-FOPS-YYYY-XXXXXXXX (non-guessable)
    const year = new Date().getFullYear();
    const rand = crypto.getRandomValues(new Uint8Array(8));
    const hex = Array.from(rand).map(b=>b.toString(16).padStart(2,"0")).join("").toUpperCase();
    return `MBCC-FOPS-${year}-${hex}`;
  }

  function issueCertificate({name, track, score}){
    const id = makeId();
    const issuedAt = new Date().toISOString();
    const reg = loadRegistry();
    reg[id] = {
      id,
      name: String(name||"").trim(),
      track: normTrack(track),
      score: (score==null || score==="") ? null : Number(score),
      issuedAt,
      program: "MBCC FinternetOps™ Enterprise Training Program",
      version: "v1-local"
    };
    saveRegistry(reg);
    return reg[id];
  }

  function getCert(id){
    const reg = loadRegistry();
    return reg[id] || null;
  }

  function qs(name){
    return new URLSearchParams(location.search).get(name);
  }

  window.MBCC_CERT = { loadRegistry, saveRegistry, issueCertificate, getCert, prettyTrack, qs };
})();
