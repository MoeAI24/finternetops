
/* MBCC FinternetOps Training Portal (v2) - funnel + progress (localStorage) */
(function(){
  const KEY = "mbcc_training_v2";

  const defaultState = {
    track: "",
    startedAt: "",
    modules: { m1:false, m2:false, m3:false, m4:false, m5:false, m6:false, m7:false, m8:false },
    quizzes: { m1:false, m2:false, m3:false, m4:false, m5:false, m6:false, m7:false, m8:false },
    capstone: false,
    examScore: null,
    certified: false
  };

  function load(){
    try{
      const raw = localStorage.getItem(KEY);
      if(!raw) return {...defaultState};
      const parsed = JSON.parse(raw);
      return {...defaultState, ...parsed,
        modules: {...defaultState.modules, ...(parsed.modules||{})},
        quizzes: {...defaultState.quizzes, ...(parsed.quizzes||{})}
      };
    }catch(e){
      return {...defaultState};
    }
  }

  function save(state){
    try{ localStorage.setItem(KEY, JSON.stringify(state)); }catch(e){}
  }

  function qs(name){
    const p = new URLSearchParams(location.search);
    return p.get(name);
  }

  function setTrack(track){
    const s = load();
    s.track = track;
    if(!s.startedAt) s.startedAt = new Date().toISOString();
    save(s);
    return s;
  }

  function markModule(mid, done){
    const s = load();
    if(s.modules && (mid in s.modules)) s.modules[mid] = !!done;
    save(s);
    return s;
  }

  function markQuiz(mid, done){
    const s = load();
    if(s.quizzes && (mid in s.quizzes)) s.quizzes[mid] = !!done;
    save(s);
    return s;
  }

  function setCapstone(done){
    const s = load();
    s.capstone = !!done;
    save(s);
    return s;
  }

  function setExam(score){
    const s = load();
    s.examScore = score;
    s.certified = (score >= 80) && allDone(s);
    save(s);
    return s;
  }

  function allDone(s){
    const modsOk = Object.values(s.modules).every(Boolean);
    const quizOk = Object.values(s.quizzes).every(Boolean);
    return modsOk && quizOk && s.capstone;
  }

  function percentComplete(s){
    // 8 modules + 8 quizzes + capstone + exam (optional gating)
    const total = 17;
    let done = 0;
    done += Object.values(s.modules).filter(Boolean).length;
    done += Object.values(s.quizzes).filter(Boolean).length;
    if(s.capstone) done += 1;
    return Math.round((done/total)*100);
  }

  function prettyTrack(t){
    if(t === "operator") return "Operator";
    if(t === "consultant") return "Consultant";
    if(t === "sales") return "Sales/Partner";
    return "—";
  }

  // Expose minimal API
  window.MBCC = {
    load, save, qs,
    setTrack, markModule, markQuiz, setCapstone, setExam,
    allDone, percentComplete, prettyTrack
  };

  // Auto-bind track from querystring if present
  const t = (qs("track")||"").toLowerCase().trim();
  if(t && ["operator","consultant","sales"].includes(t)){
    setTrack(t);
  }

  // Auto render progress widgets if present
  document.addEventListener("DOMContentLoaded", function(){
    const s = load();
    const pct = percentComplete(s);

    const pctEl = document.querySelector("[data-progress-percent]");
    if(pctEl) pctEl.textContent = pct + "%";

    const bar = document.querySelector("[data-progress-bar]");
    if(bar) bar.style.width = pct + "%";

    const trackEl = document.querySelector("[data-track-name]");
    if(trackEl) trackEl.textContent = prettyTrack(s.track);

    const gateEls = document.querySelectorAll("[data-requires-track]");
    gateEls.forEach(el=>{
      if(!s.track){
        el.classList.add("locked");
        el.setAttribute("aria-disabled", "true");
      }
    });

    // Module status chips
    document.querySelectorAll("[data-module-id]").forEach(el=>{
      const id = el.getAttribute("data-module-id");
      const type = el.getAttribute("data-module-type") || "module";
      const done = type === "quiz" ? !!s.quizzes[id] : !!s.modules[id];
      el.textContent = done ? "Done" : "Not started";
      el.classList.toggle("done", done);
    });

    // Certification lock state
    document.querySelectorAll("[data-cert-lock]").forEach(el=>{
      const ready = allDone(s);
      el.textContent = ready ? "Unlocked" : "Locked (finish modules + quizzes + capstone)";
      el.classList.toggle("done", ready);
    });
  });
})();
