// Prendi l'elemento dell'icona e l'elemento audio
const soundIcon = document.getElementById('sound-icon');
const audio = document.getElementById('audio');

// Gestione del clic sull'icona
soundIcon.addEventListener('click', () => {
   if (audio.paused) {
       audio.play(); // Riproduce il suono
   } else {
       audio.pause(); // Pausa il suono
   }
});