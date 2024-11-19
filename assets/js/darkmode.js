// Funzione per abilitare Dark Mode
function enableDarkMode() {
  document.documentElement.setAttribute('data-theme', 'dark');
  localStorage.setItem('theme', 'dark'); // Salva preferenza
  document.getElementById('darkmode-icon').style.display = 'none';
  document.getElementById('lightmode-icon').style.display = 'block';
}

// Funzione per disabilitare Dark Mode
function disableDarkMode() {
  document.documentElement.setAttribute('data-theme', 'light');
  localStorage.setItem('theme', 'light'); // Salva preferenza
  document.getElementById('darkmode-icon').style.display = 'block';
  document.getElementById('lightmode-icon').style.display = 'none';
}

// Funzione per applicare tema preferito
function applyPreferredTheme() {
  const userPreference = localStorage.getItem('theme'); // Verifica tema salvato
  const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches; // Verifica tema di sistema

  if (userPreference) {
      // Se esiste un tema salvato dall'utente
      if (userPreference === 'dark') {
          enableDarkMode();
      } else {
          disableDarkMode();
      }
  } else {
      // Usa la preferenza di sistema se non c'è una preferenza salvata
      if (systemPreference) {
          enableDarkMode();
      } else {
          disableDarkMode();
      }
  }
}

// Evento per rilevare i cambiamenti di preferenze di sistema
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
  if (event.matches) {
      enableDarkMode();
  } else {
      disableDarkMode();
  }
});

// Gestisci il clic sui pulsanti
document.getElementById('darkmode-icon').addEventListener('click', enableDarkMode);
document.getElementById('lightmode-icon').addEventListener('click', disableDarkMode);

// Applica il tema corretto al caricamento della pagina
applyPreferredTheme();
