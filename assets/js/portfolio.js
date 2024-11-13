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