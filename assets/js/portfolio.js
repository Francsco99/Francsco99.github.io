// assets/js/portfolio.js

// --------------------
// Isotope init (stabile: percent + sizer)
// --------------------
var $grid = $(".grid").imagesLoaded(function () {
  $grid.isotope({
    itemSelector: ".grid-item",
    percentPosition: true,
    masonry: {
      columnWidth: ".grid-sizer",
      gutter: ".gutter-sizer",
    },
  });
});

// ricalcolo robusto su load/resize/orientamento
$(window).on("load resize orientationchange", function () {
  if ($grid && $grid.data("isotope")) {
    $grid.isotope("layout");
  }
});

// --------------------
// Helpers (mobile UX)
// --------------------
function getButtonLabel($btn) {
  // prende solo il testo del bottone senza il badge
  return $.trim($btn.clone().children().remove().end().text());
}

function setSelectedLabel(labelText) {
  $("#yearFilterSelectedLabel").text(labelText);

  // su mobile chiude il collapse dopo selezione
  var isMobile = window.matchMedia("(max-width: 576px)").matches;
  if (isMobile) {
    var el = document.getElementById("yearFiltersMobileCollapse");
    if (!el) return;

    var instance = bootstrap.Collapse.getInstance(el);
    if (!instance) instance = new bootstrap.Collapse(el, { toggle: false });
    instance.hide();
  }
}

function syncActiveState(filterValue) {
  // sincronizza ACTIVE tra set desktop e set mobile
  $('.button-container .button[data-filter="' + filterValue + '"]').each(function () {
    var $btn = $(this);
    $btn.closest(".button-container").find(".button").removeClass("active");
    $btn.addClass("active");
  });
}

function updateFancyboxGroups(filterValue) {
  if (filterValue === "*") {
    $("a[data-fancybox]").attr("data-fancybox", "all");
    return;
  }

  $("a[data-fancybox]").each(function () {
    var itemClasses = $(this).parent().attr("class") || "";
    if (itemClasses.includes(filterValue.slice(1))) {
      $(this).attr("data-fancybox", filterValue.slice(1));
    } else {
      $(this).attr("data-fancybox", "");
    }
  });
}

// --------------------
// Filtraggio (delegato: funziona sia per desktop che per mobile)
// --------------------
$(document).on("click", ".button-container .button", function (e) {
  e.preventDefault();

  var $btn = $(this);
  var filterValue = $btn.attr("data-filter");

  $grid.isotope({ filter: filterValue });
  syncActiveState(filterValue);

  // label mobile (se presente)
  var labelText = getButtonLabel($btn);
  setSelectedLabel(labelText);

  updateFancyboxGroups(filterValue);

  // aiuta dopo i filtri
  $grid.isotope("layout");
});

// --------------------
// Badge counts (esclude grid-sizer e gutter-sizer)
// --------------------
function updateBadgeCounts() {
  const gridItems = document.querySelectorAll(".grid .grid-item");

  document.querySelectorAll(".button-container .button").forEach((button) => {
    const filterClass = button.getAttribute("data-filter");
    let count;

    if (filterClass === "*") {
      count = gridItems.length;
    } else {
      const cls = filterClass.substring(1);
      count = Array.from(gridItems).filter((item) => item.classList.contains(cls)).length;
    }

    const badge = button.querySelector(".badge");
    if (badge) badge.textContent = count > 0 ? count : "";

    if (count === 0) button.classList.add("disabled");
    else button.classList.remove("disabled");
  });
}

updateBadgeCounts();

// --------------------
// Init mobile label
// --------------------
(function initSelectedLabel() {
  var $active =
    $("#yearFiltersMobileButtons .button.active").length
      ? $("#yearFiltersMobileButtons .button.active")
      : $(".button-container .button.active").first();

  if ($active.length) setSelectedLabel(getButtonLabel($active));
})();

// --------------------
// AOS + Fancybox
// --------------------
AOS.init();

Fancybox.bind("[data-fancybox]", {});
