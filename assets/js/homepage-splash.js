// assets/js/homepage-splash.js
(function mobileSplashFS() {
  const splash = document.getElementById("mobileSplash");
  const fsEl = document.getElementById("mobileSplashFS");
  const target = document.getElementById("navLogoName");

  if (!splash || !fsEl || !target) return;

  // Solo mobile
  const isMobile = window.matchMedia("(max-width: 768px)").matches;
  if (!isMobile) {
    splash.remove();
    return;
  }

  // Non ripetere se ricarichi/torni indietro
  const KEY = "fs_splash_done";
  if (sessionStorage.getItem(KEY) === "1") {
    splash.remove();
    return;
  }

  // Aspetta che layout/font siano pronti
  const ready = async () => {
    try {
      if (document.fonts && document.fonts.ready) await document.fonts.ready;
    } catch (_) {}
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  };

  const run = async () => {
    await ready();

    // Rettangoli attuali
    const from = fsEl.getBoundingClientRect();
    const to = target.getBoundingClientRect();

    // Vogliamo finire "in corrispondenza" del logo: usa l'angolo sinistro del testo logo.
    // Aggiusta il padding per farlo sembrare attaccato al logo:
    const padX = 0;   // puoi mettere 2-6 se vuoi micro-offset
    const padY = 0;

    const dx = (to.left + padX) - from.left;
    const dy = (to.top + padY) - from.top;

    // Opzionale: riduci dimensione mentre va al logo (simulato con scale)
    // Calcolo scale approssimato confrontando altezza del logo-name
    const scale = Math.max(0.35, Math.min(0.6, to.height / from.height));

    // Blocca scroll durante splash
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Piccola pausa per “lettura” iniziale
    await new Promise((r) => setTimeout(r, 250));

    splash.classList.add("is-animating");

    // Trigger trasformazione
    fsEl.style.transform = `translate3d(${dx}px, ${dy}px, 0) scale(${scale})`;

    // Fine animazione
    const total = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 950;
    await new Promise((r) => setTimeout(r, total));

    splash.classList.add("is-done");
    await new Promise((r) => setTimeout(r, 260));

    // Cleanup
    document.body.style.overflow = prevOverflow;
    sessionStorage.setItem(KEY, "1");
    splash.remove();
  };

  // Se resize/orientamento cambia subito, evita glitch: ricalcola riavviando solo se splash ancora presente
  let resizeTimer = null;
  window.addEventListener("resize", () => {
    if (!document.getElementById("mobileSplash")) return;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => location.reload(), 150);
  });

  run();
})();
