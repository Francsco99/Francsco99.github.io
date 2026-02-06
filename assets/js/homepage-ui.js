// assets/js/homepage-ui.js (slower typing)

(function initTooltips() {
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map((el) => new bootstrap.Tooltip(el));
})();

(function heroTyping() {
  const target = document.getElementById("typeTarget");
  if (!target) return;

  const phrases = ["automation", "infrastructure", "woodworking", "analog photography"];

  // Slowed down a bit
  const typingSpeed = 75;      // was 55
  const deletingSpeed = 50;    // was 35
  const holdAfterType = 1300;  // was 1100
  const holdAfterDelete = 350; // was 250

  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  function tick() {
    const current = phrases[phraseIndex];

    if (!isDeleting) {
      charIndex++;
      target.textContent = current.slice(0, charIndex);

      if (charIndex === current.length) {
        isDeleting = true;
        setTimeout(tick, holdAfterType);
        return;
      }
      setTimeout(tick, typingSpeed);
      return;
    }

    charIndex--;
    target.textContent = current.slice(0, charIndex);

    if (charIndex === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      setTimeout(tick, holdAfterDelete);
      return;
    }
    setTimeout(tick, deletingSpeed);
  }

  tick();
})();
