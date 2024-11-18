document.addEventListener('DOMContentLoaded', () => {
  const darkModeIcon = document.getElementById('darkmode-icon');
  const lightModeIcon = document.getElementById('lightmode-icon');
  const root = document.documentElement;

  // Funzione per attivare il tema scuro
  function enableDarkMode() {
    root.setAttribute('data-theme', 'dark');
    darkModeIcon.style.display = 'none';
    lightModeIcon.style.display = 'block';
    saveThemePreference('dark');
  }

  // Funzione per attivare il tema chiaro
  function enableLightMode() {
    root.setAttribute('data-theme', 'light');
    darkModeIcon.style.display = 'block';
    lightModeIcon.style.display = 'none';
    saveThemePreference('light');
  }

  // Salva il tema selezionato nel localStorage
  function saveThemePreference(theme) {
    localStorage.setItem('theme', theme);
  }

  // Recupera il tema salvato dal localStorage
  function applySavedTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      enableDarkMode();
    } else {
      enableLightMode();
    }
  }

  // Applica il tema salvato al caricamento della pagina
  applySavedTheme();

  // Event listener per il click sulle icone
  darkModeIcon.addEventListener('click', enableDarkMode);
  lightModeIcon.addEventListener('click', enableLightMode);
});
