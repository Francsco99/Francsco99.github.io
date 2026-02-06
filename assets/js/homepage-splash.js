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

    // Spingi più vicino all'angolo (valori negativi = più su/sinistra)
    const padX = -12; // prova -8 / -12 / -16
    const padY = -10; // prova -6 / -10 / -14

    const dx = to.left + padX - from.left;
    const dy = to.top + padY - from.top;

    // Opzionale: riduci dimensione mentre va al logo (simulato con scale)
    const scale = Math.max(0.35, Math.min(0.6, to.height / from.height));

    // Blocca scroll durante splash (più robusto su mobile)
    const prevOverflow = document.body.style.overflow;
    const preventScroll = (e) => e.preventDefault();

    document.body.style.overflow = "hidden";
    document.addEventListener("touchmove", preventScroll, { passive: false });
    document.addEventListener("wheel", preventScroll, { passive: false });

    // Piccola pausa per “lettura” iniziale
    await new Promise((r) => setTimeout(r, 250));

    splash.classList.add("is-animating");

    // Trigger trasformazione
    fsEl.style.transform = `translate3d(${dx}px, ${dy}px, 0) scale(${scale})`;

    // Fine animazione (deve matchare il CSS: 1800ms)
    const total = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 1550;
    await new Promise((r) => setTimeout(r, total));

    splash.classList.add("is-done");
    await new Promise((r) => setTimeout(r, 260));

    // Cleanup
    document.body.style.overflow = prevOverflow;
    document.removeEventListener("touchmove", preventScroll);
    document.removeEventListener("wheel", preventScroll);
    splash.remove();
  };

  // Evita glitch: ricarica SOLO se cambia la larghezza (lo scroll su mobile può generare resize in altezza)
  let resizeTimer = null;
  const startW = window.innerWidth;

  window.addEventListener("resize", () => {
    if (!document.getElementById("mobileSplash")) return;

    // Ignora resize causati dallo scroll (cambia altezza, non larghezza)
    if (Math.abs(window.innerWidth - startW) < 10) return;

    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => location.reload(), 150);
  });

  run();
})();
