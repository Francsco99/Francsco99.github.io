// Funzione per cambiare l'immagine grande
function changePhoto(photoSrc) {
  const largePhoto = document.getElementById("largePhoto");
  largePhoto.style.opacity = 0; // Inizia la dissolvenza
  setTimeout(() => {
      largePhoto.src = photoSrc;
      largePhoto.style.opacity = 1; // Ripristina l'opacità
  }, 300); // Durata della dissolvenza deve coincidere con la durata della transizione
}