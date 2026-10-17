// Коректне визначення видимих і невидимих ребер у режимі «Зображення на площині».
// Ребро є видимим, якщо воно належить хоча б одній грані, повернутій до спостерігача.
(() => {
  const VIEW_TO_EYE_69 = new THREE.Vector3(-0.52, 0.24, 1).normalize();
  let scheduled69 = false;

  function visibleSideFaces69(G) {
    const center = new THREE.Vector3();
    G.bottom.forEach(p => center.add(p));
    center.multiplyScalar(1 / G.bottom.length);

    const result = [];
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      const baseEdge = G.bottom[j].clone().sub(G.bottom[i]);
      const lateralEdge = G.top[i].clone().sub(G.bottom[i]);
      const normal = baseEdge.clone().cross(lateralEdge);

      // Вибираємо саме зовнішню нормаль бічної грані.
      const midpoint = G.bottom[i].clone().add(G.bottom[j]).multiplyScalar(0.5);
      const outward = midpoint.sub(center);
      outward.y = 0;
      if (normal.dot(outward) < 0) normal.negate();

      result.push(normal.lengthSq() > 1e-12 && normal.normalize().dot(VIEW_TO_EYE_69) > 1e-6);
    }
    return result;
  }

  function applyCorrectVisibility69() {
    scheduled69 = false;
    const svg = document.getElementById('planeSvg69');
    if (!svg || typeof geometry !== 'function' || typeof n !== 'number') return;

    const lines = Array.from(svg.querySelectorAll('line'));
    if (lines.length < 3 * n) return;

    const G = geometry();
    const sideVisible = visibleSideFaces69(G);
    const setDash = (line, hidden) => {
      if (!line) return;
      if (hidden) line.setAttribute('stroke-dasharray', '9 8');
      else line.removeAttribute('stroke-dasharray');
    };

    // 1. Ребра нижньої основи. Нижня грань від спостерігача закрита,
    // тому ребро видно лише тоді, коли видима прилегла бічна грань.
    for (let i = 0; i < n; i++) {
      setDash(lines[i], !sideVisible[i]);
    }

    // 2. Ребра верхньої основи. Ми дивимося на призму трохи згори,
    // тому верхня основа видима і всі її граничні ребра кресляться суцільно.
    for (let i = 0; i < n; i++) {
      setDash(lines[n + i], false);
    }

    // 3. Бічні ребра. Кожне з них належить двом сусіднім бічним граням.
    // Воно невидиме тільки тоді, коли обидві ці грані повернуті від спостерігача.
    for (let i = 0; i < n; i++) {
      const prev = (i - 1 + n) % n;
      const visible = sideVisible[prev] || sideVisible[i];
      setDash(lines[2 * n + i], !visible);
    }
  }

  function scheduleVisibility69() {
    if (scheduled69) return;
    scheduled69 = true;
    requestAnimationFrame(applyCorrectVisibility69);
  }

  function attachObserver69() {
    const svg = document.getElementById('planeSvg69');
    if (!svg) {
      setTimeout(attachObserver69, 80);
      return;
    }

    const observer = new MutationObserver(scheduleVisibility69);
    observer.observe(svg, { childList: true, subtree: true });
    scheduleVisibility69();

    document.querySelectorAll('[data-view69="plane"]').forEach(btn =>
      btn.addEventListener('click', () => setTimeout(scheduleVisibility69, 0))
    );
    window.addEventListener('resize', scheduleVisibility69);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachObserver69, { once: true });
  } else {
    attachObserver69();
  }
})();
