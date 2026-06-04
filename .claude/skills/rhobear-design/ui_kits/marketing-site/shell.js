/* RHOBEAR shared shell behavior — local-first, no dependencies. */
(function () {
  var dropdowns = Array.prototype.slice.call(
    document.querySelectorAll('.nav-dropdown')
  );
  if (!dropdowns.length) return;

  function closeAll(except) {
    dropdowns.forEach(function (dd) {
      if (dd !== except) dd.classList.remove('open');
    });
  }

  dropdowns.forEach(function (dd) {
    var tab = dd.querySelector('.nav-tab[aria-haspopup]');
    if (!tab) return;
    // A tab with nested pages opens its panel on click instead of navigating.
    tab.addEventListener('click', function (e) {
      e.preventDefault();
      var isOpen = dd.classList.contains('open');
      closeAll(dd);
      dd.classList.toggle('open', !isOpen);
    });
  });

  // Click outside closes any open dropdown.
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.nav-dropdown')) closeAll(null);
  });

  // Escape closes any open dropdown.
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' || e.key === 'Esc') closeAll(null);
  });
})();
