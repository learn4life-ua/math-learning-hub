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
