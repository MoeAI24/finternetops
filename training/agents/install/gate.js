(() => {
  const KEY = "mbcc_finternet_partner_ack_v1";
  const REQUIRED = "OPERATOR";
  const qs = new URLSearchParams(location.search);
  const override = (qs.get("pass") || "").trim();

  function showGate() {
    const app = document.getElementById("gate");
    const ok = document.getElementById("gate-ok");
    const pass = document.getElementById("gate-pass");
    const msg = document.getElementById("gate-msg");
    const tier = document.getElementById("gate-tier");
    tier.textContent = REQUIRED;

    ok.onclick = () => {
      const v = ((pass && pass.value) || "").trim() || override;
      if (!v || v.length < 6) {
        msg.textContent = "Enter your partner access phrase (from MBCC onboarding).";
        msg.style.display = "block";
        return;
      }
      localStorage.setItem(KEY, "true");
      localStorage.setItem("mbcc_finternet_partner_pass_v1", v);
      if (app) app.style.display = "none";
      document.documentElement.classList.remove("locked");
    };
  }

  const ack = localStorage.getItem(KEY) === "true";
  if (!ack) {
    document.documentElement.classList.add("locked");
    showGate();
  } else {
    const app = document.getElementById("gate");
    if (app) app.style.display = "none";
  }
})();