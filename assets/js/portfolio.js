var $grid = $('.grid').imagesLoaded( function() {
  $grid.isotope({
    itemSelector: '.grid-item',
    masonry: {
      columnWidth: 5,
      gutter: 5
    }
  });
});

// Filtraggio
$('.button').on('click', function () {
var filterValue = $(this).attr('data-filter');
$grid.isotope({ filter: filterValue });
$('.button').removeClass('active');
$(this).addClass('active');

// Cambia il lightbox group in base al filtro
if (filterValue === '*') {
    // Seleziona tutte le immagini e imposta 'all' come gruppo Lightbox
    $('a[data-lightbox]').attr('data-lightbox', 'all');
} else {
    // Filtra e imposta il gruppo Lightbox basato sulla classe
    $('a[data-lightbox]').each(function () {
    var itemClasses = $(this).parent().attr('class');
    if (itemClasses.includes(filterValue.slice(1))) {
        $(this).attr('data-lightbox', filterValue.slice(1)); // Assegna il gruppo corretto
    } else {
        $(this).attr('data-lightbox', ''); // Rimuovi il gruppo dalle altre immagini
    }
    });
}
});

// Inizializza Lightbox
lightbox.option({
'resizeDuration': 200,
'wrapAround': true,
'alwaysShowNavOnTouchDevices': true
});

function updateBadgeCounts() {
  // Seleziona tutti gli elementi nella griglia
  const gridItems = document.querySelectorAll('.grid > div'); // Supponiamo che ogni div dentro .grid rappresenti un elemento

  // Itera su ogni pulsante con badge
  document.querySelectorAll('.button-container .button').forEach(button => {
     const filterClass = button.getAttribute('data-filter'); // Ottieni l'anno dalla classe, rimuovendo il "."
     let count;
      
     // Conta gli elementi in base al filtro
     if (filterClass === '*') {
      console.log(filterClass);
        // Conteggio totale per 'Show All' (tutti gli elementi nella grid)
        count = gridItems.length;
     } else {
        // Conteggio per elementi con l'anno specificato
        count = Array.from(gridItems).filter(item => item.classList.contains(filterClass.substring(1))).length;
     }

     // Trova il badge nel pulsante e aggiorna il numero
     const badge = button.querySelector('.badge');
     badge.textContent = count > 0 ? count : ''; // Se non ci sono elementi, lascia il badge vuoto
     
     // Aggiungi la classe 'disabled' se count è 0, altrimenti rimuovila
    if (count === 0) {
      button.classList.add('disabled');
    } else {
        button.classList.remove('disabled');
    }
    });
}

// Esegui la funzione per aggiornare i badge all'avvio della pagina
updateBadgeCounts();