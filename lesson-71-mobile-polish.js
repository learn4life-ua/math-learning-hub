const previousUpdateUI71Mobile = updateUI;

updateUI = function () {
  previousUpdateUI71Mobile();

  const r = regular();

  // Апофема MN та ON мають сенс у цій моделі лише для правильної піраміди.
  const regularOnlyIds = ['apothem', 'radius'];
  regularOnlyIds.forEach(id => {
    const control = $(id);
    const label = control?.closest('label');
    if (label) label.hidden = !r;

    document.querySelectorAll(`[data-mirror="${id}"]`).forEach(mirror => {
      const mirrorLabel = mirror.closest('label');
      if (mirrorLabel) mirrorLabel.hidden = !r;
    });
  });

  const apothemStatCard = C.statL?.parentElement;
  if (apothemStatCard) apothemStatCard.hidden = !r;

  const stats = $('stats');
  if (stats) stats.classList.toggle('without-apothem', !r);
};

// На телефоні при кожному відкритті панелі повертаємося на початок.
const previousOpenPanel71Mobile = openPanel;
openPanel = function (m) {
  previousOpenPanel71Mobile(m);
  requestAnimationFrame(() => {
    if (mobilePanel) mobilePanel.scrollTop = 0;
  });
};

function setMobileCamera71() {
  if (!camera || !controls || !matchMedia('(max-width:1023px)').matches) return;
  camera.position.set(8.6, 7.1, 10.2);
  controls.target.set(0, h / 2, 0);
  controls.update();
}

document.addEventListener('DOMContentLoaded', () => {
  // Позначаємо базові регулятори, щоб на мобільному ставити їх вище
  // додаткового блока керування положенням вершини.
  const sideControl = C.ra?.parentElement;
  const heightControl = C.rh?.parentElement;
  const basicControls = sideControl?.parentElement;

  if (sideControl) sideControl.id = 'baseSideControl71';
  if (heightControl) heightControl.id = 'heightControl71';
  if (basicControls) basicControls.classList.add('mobile-basic-controls-71');

  // Після основної ініціалізації наближаємо модель на телефоні.
  requestAnimationFrame(() => {
    setMobileCamera71();
    resize();
  });

  const resetBtn = $('reset');
  if (resetBtn) {
    resetBtn.onclick = () => {
      if (matchMedia('(max-width:1023px)').matches) {
        setMobileCamera71();
      } else {
        camera.position.set(11, 9, 13);
        controls.target.set(0, h / 2, 0);
        controls.update();
      }
    };
  }
});
