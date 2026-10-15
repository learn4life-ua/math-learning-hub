const previousUpdateUI71Mobile = updateUI;

updateUI = function () {
  previousUpdateUI71Mobile();

  const r = regular();

  // Апофема MN та ON мають сенс у цій моделі лише для правильної піраміди.
  // Не залишаємо на екрані неактивні елементи, особливо на телефоні.
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

  // Картку «Апофема l» у статистиці також показуємо лише для правильної піраміди.
  const apothemStatCard = C.statL?.parentElement;
  if (apothemStatCard) apothemStatCard.hidden = !r;

  const stats = $('stats');
  if (stats) stats.classList.toggle('without-apothem', !r);
};

// На телефоні при кожному відкритті панелі повертаємося на початок.
// Інакше після прокручування іншої вкладки верхні кнопки та повзунки
// могли залишатися вище видимої області й здаватися зниклими.
const previousOpenPanel71Mobile = openPanel;
openPanel = function (m) {
  previousOpenPanel71Mobile(m);
  requestAnimationFrame(() => {
    if (mobilePanel) mobilePanel.scrollTop = 0;
  });
};

document.addEventListener('DOMContentLoaded', () => {
  // Позначаємо базові регулятори, щоб на мобільному ставити їх вище
  // додаткового блока керування положенням вершини.
  const sideControl = C.ra?.parentElement;
  const heightControl = C.rh?.parentElement;
  const basicControls = sideControl?.parentElement;

  if (sideControl) sideControl.id = 'baseSideControl71';
  if (heightControl) heightControl.id = 'heightControl71';
  if (basicControls) basicControls.classList.add('mobile-basic-controls-71');
});
