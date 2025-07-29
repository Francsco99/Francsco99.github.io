const soundIcon = document.getElementById('sound-icon');
const audio = document.getElementById('audio');
const img = document.getElementById('profilePic')

// Gestione del click sull'icona del suono
soundIcon.addEventListener('click', function() {
   // Aggiungi la classe per l'animazione
   soundIcon.classList.add('sound-active');

   // Riproduci o metti in pausa il suono
   if (audio.paused) {
       audio.play();
   } else {
       audio.pause();
   }

   // Rimuovi la classe dopo l'animazione
   setTimeout(() => {
       soundIcon.classList.remove('sound-active');
   }, 1000);  // 1000ms per far durare l'animazione

   //img.src = "https://www.ajalab.it/fspezzano/images/pingu_round_hello.png";
});