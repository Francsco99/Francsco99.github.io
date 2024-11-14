function toggleMenu() {
  const menu = document.querySelector(".menu-links");
  const hamburgerIcon = document.querySelector(".hamburger-icon");
  const closeIcon = document.querySelector(".close-icon");

  // Aggiungi o rimuovi la classe 'open' per aprire o chiudere il menu
  menu.classList.toggle("open");
  hamburgerIcon.classList.toggle("open");
  closeIcon.classList.toggle("open");
}

AOS.init();