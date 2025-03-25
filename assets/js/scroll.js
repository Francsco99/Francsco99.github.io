// Registra ScrollTrigger in GSAP
gsap.registerPlugin(ScrollTrigger);

const video = document.getElementById("video");

// Assicurati che i metadata del video siano caricati (necessario per ottenere la durata)
video.addEventListener('loadedmetadata', () => {
  // Su iOS, prova a far partire il video per "sbloccarlo"
  let playPromise = video.play();
  if (playPromise !== undefined) {
    playPromise.then(() => {
      video.pause();
      // Ora imposta ScrollTrigger per controllare il currentTime
      gsap.to(video, {
        currentTime: video.duration,
        ease: "none",
        scrollTrigger: {
          trigger: ".video-section",
          start: "top top",
          end: "bottom top",
          scrub: true,
          pin: true,
          // markers: true, // opzionale per il debugging
        }
      });
    }).catch(error => {
      console.log("Errore durante il play iniziale del video:", error);
    });
  }
});

document.addEventListener("DOMContentLoaded", function() {
  const overlay = document.getElementById("overlay");

  // Aggiungi animazione bounce in loop per il testo
  gsap.to("#overlay p", {
    opacity: 0,
    duration: 0.8,
    ease: "power1.inOut",
    repeat: -1,   // Loop infinito
    yoyo: true    // Effetto fade in e fade out
  });

  overlay.addEventListener("click", function() {
    gsap.to(overlay, {
      duration: 2,
      opacity: 0,
      ease: "power2.out",
      onComplete: function() {
        overlay.style.display = "none";
      }
    });
  });
});