/**
 * Six Layers of Reality — app.js
 * - Ambient canvas background
 * - Drawer nav
 * - Layer rail scroll
 * - Remember last open layer in localStorage
 * - Join button wiring
 */
const JOIN_URL = "https://moecommunitycloud.com/"; // replace with your membership/join link if different

// Drawer
const drawer = document.getElementById("drawer");
const menuBtn = document.getElementById("menuBtn");
const closeDrawer = document.getElementById("closeDrawer");
function openDrawer(){
  drawer.classList.add("open");
  drawer.setAttribute("aria-hidden","false");
}
function closeDrawerFn(){
  drawer.classList.remove("open");
  drawer.setAttribute("aria-hidden","true");
}
menuBtn?.addEventListener("click", openDrawer);
closeDrawer?.addEventListener("click", closeDrawerFn);
drawer?.querySelectorAll("a").forEach(a => a.addEventListener("click", closeDrawerFn));

// Join button wiring
const joinBtn = document.getElementById("joinBtn");
if (joinBtn) joinBtn.href = JOIN_URL;

// Layer rail buttons (hero)
document.querySelectorAll(".layer-chip").forEach(btn => {
  btn.addEventListener("click", () => {
    const id = btn.getAttribute("data-jump");
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({behavior:"smooth", block:"start"});
    // Open the details
    if (el.tagName.toLowerCase() === "details") el.open = true;
  });
});

// Persist accordion state
const key = "sixLayers:lastOpen";
const details = Array.from(document.querySelectorAll(".layer"));
const restoreId = localStorage.getItem(key);
if (restoreId) {
  const toOpen = document.getElementById(restoreId);
  if (toOpen && toOpen.tagName.toLowerCase()==="details") {
    details.forEach(d => d.open = false);
    toOpen.open = true;
  }
}
details.forEach(d => {
  d.addEventListener("toggle", () => {
    if (d.open) localStorage.setItem(key, d.id);
  });
});

// Ambient canvas background (lightweight, no libraries)
const canvas = document.getElementById("bg");
const ctx = canvas?.getContext("2d", { alpha: true });

let W=0, H=0, DPR=1;
function resize(){
  DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  W = Math.floor(window.innerWidth);
  H = Math.floor(window.innerHeight);
  canvas.width = W * DPR;
  canvas.height = H * DPR;
  canvas.style.width = W+"px";
  canvas.style.height = H+"px";
  ctx.setTransform(DPR,0,0,DPR,0,0);
}
window.addEventListener("resize", resize, {passive:true});
resize();

// Particles that drift like "spirit dust"
const N = Math.round(Math.min(130, Math.max(70, (W*H)/22000)));
const particles = [];
function rand(min,max){ return Math.random()*(max-min)+min; }
for (let i=0;i<N;i++){
  particles.push({
    x: rand(0,W),
    y: rand(0,H),
    r: rand(0.7, 2.4),
    vx: rand(-0.14, 0.14),
    vy: rand(-0.10, 0.10),
    a: rand(0.08, 0.22)
  });
}

function draw(){
  if (!ctx) return;

  ctx.clearRect(0,0,W,H);

  // soft gradient wash
  const g = ctx.createRadialGradient(W*0.25, H*0.15, 30, W*0.25, H*0.15, Math.max(W,H));
  g.addColorStop(0, "rgba(166,107,255,0.14)");
  g.addColorStop(0.45, "rgba(52,215,255,0.06)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0,0,W,H);

  // particles
  for (const p of particles){
    p.x += p.vx;
    p.y += p.vy;

    if (p.x < -10) p.x = W + 10;
    if (p.x > W + 10) p.x = -10;
    if (p.y < -10) p.y = H + 10;
    if (p.y > H + 10) p.y = -10;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
    ctx.fillStyle = `rgba(255,255,255,${p.a})`;
    ctx.fill();
  }

  // subtle "threads" (connection feel)
  ctx.globalAlpha = 0.22;
  ctx.strokeStyle = "rgba(255,207,106,0.22)";
  ctx.lineWidth = 1;
  for (let i=0;i<particles.length;i++){
    const a = particles[i];
    const b = particles[(i+Math.floor(rand(2,6))) % particles.length];
    const dx = a.x-b.x, dy=a.y-b.y;
    const dist = Math.sqrt(dx*dx+dy*dy);
    if (dist < 160){
      ctx.beginPath();
      ctx.moveTo(a.x,a.y);
      ctx.lineTo(b.x,b.y);
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;

  requestAnimationFrame(draw);
}
draw();
