document.addEventListener('DOMContentLoaded', () => {
    // Elementi per i controlli delle forze
    const sliderIcon = document.getElementById('slider-icon');
    const forceControl = document.querySelector('.force-control');
    const closeSlider = document.getElementById('close-slider');
    const canvas = document.getElementById('graph-canvas');
    
    const chargeSlider = document.getElementById('charge');
    const attractSlider = document.getElementById('attract');
    
    const chargeValue = document.getElementById('charge-value');
    const attractValue = document.getElementById('attract-value');

    const simulationOffIcon = document.getElementById("force-off");
    const simulationOnIcon = document.getElementById("force-on");

    // Attiva simulazione
    simulationOffIcon.addEventListener("click", () => {
        simulationOffIcon.style.display = "none";
        simulationOnIcon.style.display = "inline";
        sliderIcon.style.display = "inline";
    });

    // Disattiva simulazione
    simulationOnIcon.addEventListener("click", () => {
        simulationOnIcon.style.display = "none";
        simulationOffIcon.style.display = "inline";
        sliderIcon.style.display = "none";
    });

    // Mostra/nascondi controllo delle forze
    sliderIcon.addEventListener('click', () => {
        if (forceControl.style.display === 'none' || forceControl.style.display === '') {
            forceControl.style.display = 'flex';
        } else {
            forceControl.style.display = 'none';
        }
    });

    // Chiudi il controllo delle forze
    closeSlider.addEventListener('click', () => {
        forceControl.style.display = 'none';
    });

    // Aggiorna il valore di carica
    chargeSlider.addEventListener('input', () => {
        chargeValue.textContent = chargeSlider.value;
    });

    // Aggiorna il valore di attrazione
    attractSlider.addEventListener('input', () => {
        attractValue.textContent = attractSlider.value;
    });

    // Chiudi il controllo delle forze se si clicca fuori
    canvas.addEventListener('click', (event) => {
        if (!forceControl.contains(event.target) && event.target !== sliderIcon) {
            forceControl.style.display = 'none';
        }
    });

    // Elementi per le opzioni di download
    const jsonDownloadButton = document.getElementById('json-download');
    const downloadOptionsPopup = document.getElementById('download-options-popup');
    const closeDownloadOptionsButton = document.getElementById('close-download-options');

    // Mostra le opzioni di download
    jsonDownloadButton.addEventListener('click', () => {
        downloadOptionsPopup.style.display = 'flex';
    });

    // Chiudi le opzioni di download
    closeDownloadOptionsButton.addEventListener('click', () => {
        downloadOptionsPopup.style.display = 'none';
    });

    // Elementi per il popup delle informazioni
    var popup = document.getElementById("info-popup");
    var closePopup = document.getElementById('close-info-popup');
    var helpIcon = document.getElementById("help-icon");

    // Mostra il popup all'apertura della pagina
    popup.style.display = "flex";

    // Chiudi il popup quando si clicca sulla 'x'
    closePopup.onclick = function() {
        popup.style.display = "none";
    };

    // Chiudi il popup quando si clicca al di fuori del popup
    window.onclick = function(event) {
        if (event.target == popup) {
            popup.style.display = "none";
        }
    };

    // Mostra il popup quando si clicca sull'icona di aiuto
    helpIcon.onclick = function() {
        popup.style.display = "flex";
    };

    // Chiudi il popup anche quando si preme il tasto ESC
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            popup.style.display = 'none';
        }
    });

    // Funzione per chiudere tutti i popup quando si clicca fuori
    window.addEventListener('click', (event) => {
        if (!popup.contains(event.target) && event.target !== helpIcon) {
            popup.style.display = 'none';
        }
        if (!downloadOptionsPopup.contains(event.target) && event.target !== jsonDownloadButton) {
            downloadOptionsPopup.style.display = 'none';
        }
        if (!forceControl.contains(event.target) && event.target !== sliderIcon) {
            forceControl.style.display = 'none';
        }
    });
});
