document.addEventListener("DOMContentLoaded", function () {
    gsap.registerPlugin(ScrollTrigger);
    const video = document.getElementById("myVideo");

    // Sblocca il video su iOS tramite un'interazione utente
    document.addEventListener("touchstart", function() {
      video.play().then(() => {
        video.pause();
        console.log("Video sbloccato per iOS");
      }).catch((error) => {
        console.error("Errore nello sblocco del video:", error);
      });
    }, { once: true });

    // Animazione del testo "Scroll Down"
    gsap.to(".scroll-text", {
      opacity: 1,
      duration: 1,
      ease: "power2.inOut",
      repeat: -1,
      yoyo: true
    });

    // Animazione del video quando diventa visibile
    video.addEventListener("loadedmetadata", function () {
      let duration = video.duration;

      gsap.to(".video-wrapper", {
        opacity: 1,
        duration: 1,
        scrollTrigger: {
          trigger: ".video-wrapper",
          start: "top bottom-=100",
          toggleActions: "play none none none"
        }
      });

      gsap.to(".video-container", {
        scale: 1, // Manteniamo scale 1 per non zoomare il video
        duration: 1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".video-wrapper",
          start: "top center",
          toggleActions: "play none none none"
        }
      });

      gsap.to(video, {
        currentTime: duration,
        ease: "none",
        scrollTrigger: {
          trigger: ".video-wrapper",
          start: "top top",
          end: "bottom top",
          scrub: true,
          pin: true,
        }
      });
    });
  });