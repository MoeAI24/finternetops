(function(){
  const STORAGE_KEY = "mbcc_finternet_training_v1";
  const toastEl = () => document.getElementById("toast");

  function loadState(){
    try{ return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); }
    catch(e){ return {}; }
  }
  function saveState(s){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    updateProgressUI();
  }

  function setComplete(moduleId, value=true){
    const s = loadState();
    s.completed = s.completed || {};
    s.completed[moduleId] = !!value;
    saveState(s);
    notify(value ? "Module marked complete." : "Module marked incomplete.");
  }

  function isComplete(moduleId){
    const s = loadState();
    return !!(s.completed && s.completed[moduleId]);
  }

  function scoreQuiz(quizId, answers){
    const s = loadState();
    s.quizzes = s.quizzes || {};
    s.quizzes[quizId] = answers;
    saveState(s);
  }

  function getQuiz(quizId){
    const s = loadState();
    return (s.quizzes && s.quizzes[quizId]) || null;
  }

  function notify(msg){
    const t = toastEl();
    if(!t) return;
    t.textContent = msg;
    t.style.display = "block";
    clearTimeout(window.__mbcc_toast_timer);
    window.__mbcc_toast_timer = setTimeout(()=>{ t.style.display="none"; }, 2200);
  }

  function updateProgressUI(){
    const progEls = document.querySelectorAll("[data-progress-bar]");
    const countEls = document.querySelectorAll("[data-progress-count]");
    const moduleEls = document.querySelectorAll("[data-module-id]");

    const modules = Array.from(moduleEls).map(el => el.getAttribute("data-module-id"));
    const uniqueModules = Array.from(new Set(modules)).filter(Boolean);

    const done = uniqueModules.filter(id => isComplete(id)).length;
    const total = uniqueModules.length || 1;
    const pct = Math.round((done/total)*100);

    progEls.forEach(el => el.style.width = pct + "%");
    countEls.forEach(el => el.textContent = `${done}/${total} complete (${pct}%)`);
  }

  function wireCompleteButton(){
    const btn = document.querySelector("[data-complete-btn]");
    const id = btn ? btn.getAttribute("data-complete-btn") : null;
    if(!btn || !id) return;
    const refresh = ()=>{
      const done = isComplete(id);
      btn.textContent = done ? "Mark incomplete" : "Mark complete";
      btn.classList.toggle("secondary", done);
    };
    btn.addEventListener("click", ()=>{
      const done = isComplete(id);
      setComplete(id, !done);
      refresh();
    });
    refresh();
  }

  function wireSearch(){
    const input = document.querySelector("[data-search]");
    if(!input) return;
    const items = Array.from(document.querySelectorAll("[data-search-item]"));
    const normalize = (s)=> (s||"").toLowerCase();
    input.addEventListener("input", ()=>{
      const q = normalize(input.value);
      items.forEach(el=>{
        const hay = normalize(el.getAttribute("data-search-item"));
        el.style.display = hay.includes(q) ? "" : "none";
      });
    });
  }

  function wireQuiz(){
    const quiz = document.querySelector("[data-quiz]");
    if(!quiz) return;

    const quizId = quiz.getAttribute("data-quiz");
    const saved = getQuiz(quizId);
    if(saved){
      // restore
      Object.entries(saved).forEach(([name,val])=>{
        const sel = quiz.querySelector(`input[name="${CSS.escape(name)}"][value="${CSS.escape(val)}"]`);
        if(sel) sel.checked = true;
      });
    }

    const submit = quiz.querySelector("[data-quiz-submit]");
    const out = quiz.querySelector("[data-quiz-result]");
    if(!submit || !out) return;

    submit.addEventListener("click", ()=>{
      const key = quiz.getAttribute("data-quiz-key"); // JSON string array of {name, correct, rationale}
      let keyArr = [];
      try{ keyArr = JSON.parse(key); }catch(e){ keyArr = []; }

      const answers = {};
      keyArr.forEach(k=>{
        const chosen = quiz.querySelector(`input[name="${CSS.escape(k.name)}"]:checked`);
        if(chosen) answers[k.name] = chosen.value;
      });

      let score = 0;
      const feedback = keyArr.map(k=>{
        const got = answers[k.name];
        const ok = got === k.correct;
        if(ok) score++;
        const label = ok ? "Correct" : "Incorrect";
        const gotTxt = got ? `Your answer: ${got}` : "Your answer: (none)";
        return `<div style="margin-top:8px"><strong>${label}</strong> — ${gotTxt}<br><span style="color:rgba(247,243,233,.82)">${k.rationale}</span></div>`;
      });

      scoreQuiz(quizId, answers);
      const pct = Math.round((score / (keyArr.length||1))*100);
      out.innerHTML = `<strong>Score:</strong> ${score}/${keyArr.length} (${pct}%)` + feedback.join("");
      out.classList.add("result");

      // Optional: auto-mark module complete if passing
      const pass = parseInt(quiz.getAttribute("data-pass") || "80", 10);
      const moduleId = quiz.getAttribute("data-module");
      if(moduleId && pct >= pass){
        setComplete(moduleId, true);
        notify("Quiz passed. Module completed.");
      }else if(moduleId){
        notify("Quiz saved. Pass to complete module.");
      }
    });
  }

  function wireActiveNav(){
    const path = location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll("[data-nav]").forEach(a=>{
      if(a.getAttribute("href") === path) a.classList.add("active");
    });
  }

  document.addEventListener("DOMContentLoaded", ()=>{
    wireActiveNav();
    wireCompleteButton();
    wireSearch();
    wireQuiz();
    updateProgressUI();
  });

  window.MBCCTraining = { setComplete, isComplete, notify };
})();
