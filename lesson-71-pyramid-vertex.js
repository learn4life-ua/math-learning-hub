let arbitraryHXFactor = 0.25;
let arbitraryHZFactor = -0.16;
let vertexDragging = false;

const originalEnhanceMethodicalUI71 = enhanceMethodicalUI;
enhanceMethodicalUI = function () {
  originalEnhanceMethodicalUI71();

  const modelPanel = $('panelModel');
  const arbitraryNote = $('arbitraryBaseNote');
  if (modelPanel && !$('vertexPositionControl')) {
    const card = document.createElement('div');
    card.id = 'vertexPositionControl';
    card.className = 'p-3 bg-sky-50 border border-sky-200 rounded-xl text-xs space-y-3';
    card.innerHTML = `
      <div>
        <div class="font-bold text-sky-900 flex items-center gap-2"><i class="fa-solid fa-arrows-up-down-left-right"></i> Положення вершини M</div>
        <p class="text-[11px] text-slate-600 mt-1">Перетягни точку <b>H</b> на моделі або зміни її положення повзунками. Вершина <b>M</b> рухається разом із H, а MH залишається перпендикулярною до площини основи.</p>
      </div>
      <div>
        <div class="flex justify-between gap-2 mb-1"><span class="font-semibold">Ліворуч - праворуч</span><span id="vertexXValue" class="mono text-sky-800">25%</span></div>
        <input id="vertexX" type="range" min="-60" max="60" step="1" value="25" class="w-full">
      </div>
      <div>
        <div class="flex justify-between gap-2 mb-1"><span class="font-semibold">Назад - вперед</span><span id="vertexZValue" class="mono text-sky-800">-16%</span></div>
        <input id="vertexZ" type="range" min="-60" max="60" step="1" value="-16" class="w-full">
      </div>
      <div class="grid grid-cols-2 gap-2">
        <button id="vertexRandom" type="button" class="py-2 px-2 rounded-lg bg-white border border-sky-300 text-sky-900 font-bold">Інше положення</button>
        <button id="vertexNearCenter" type="button" class="py-2 px-2 rounded-lg bg-white border border-slate-300 text-slate-700 font-bold">Ближче до центра</button>
      </div>`;

    if (arbitraryNote) arbitraryNote.insertAdjacentElement('afterend', card);
    else modelPanel.appendChild(card);

    const vx = $('vertexX');
    const vz = $('vertexZ');
    const syncLabels = () => {
      $('vertexXValue').textContent = `${Math.round(arbitraryHXFactor * 100)}%`;
      $('vertexZValue').textContent = `${Math.round(arbitraryHZFactor * 100)}%`;
      vx.value = String(Math.round(arbitraryHXFactor * 100));
      vz.value = String(Math.round(arbitraryHZFactor * 100));
    };

    vx.addEventListener('input', () => {
      arbitraryHXFactor = +vx.value / 100;
      $('vertexXValue').textContent = `${vx.value}%`;
      build();
    });
    vz.addEventListener('input', () => {
      arbitraryHZFactor = +vz.value / 100;
      $('vertexZValue').textContent = `${vz.value}%`;
      build();
    });
    $('vertexRandom').addEventListener('click', () => {
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.22 + Math.random() * 0.34;
      arbitraryHXFactor = Math.cos(angle) * radius;
      arbitraryHZFactor = Math.sin(angle) * radius;
      syncLabels();
      build();
    });
    $('vertexNearCenter').addEventListener('click', () => {
      const len = Math.hypot(arbitraryHXFactor, arbitraryHZFactor) || 1;
      arbitraryHXFactor = arbitraryHXFactor / len * 0.18;
      arbitraryHZFactor = arbitraryHZFactor / len * 0.18;
      syncLabels();
      build();
    });
    window.syncVertexPositionControls71 = syncLabels;
  }
};

geom = function () {
  const R = a / (2 * Math.sin(Math.PI / n));
  const regularBase = [];
  const base = [];

  for (let i = 0; i < n; i++) {
    const t = Math.PI / 2 + 2 * Math.PI * i / n;
    const regPoint = new THREE.Vector3(R * Math.cos(t), 0, R * Math.sin(t));
    regularBase.push(regPoint);
    const irr = irregularTemplate(i, R);
    base.push(irr.clone().lerp(regPoint, baseReg));
  }

  const O = new THREE.Vector3(0, 0, 0);
  const arbitraryH = new THREE.Vector3(R * arbitraryHXFactor, 0, R * arbitraryHZFactor);
  const H = arbitraryH.clone().multiplyScalar(1 - apexReg);
  const apex = new THREE.Vector3(H.x, h, H.z);
  const N = new THREE.Vector3().addVectors(base[0], base[1]).multiplyScalar(.5);
  const r = O.distanceTo(N);
  const l = Math.sqrt(h * h + r * r);

  return {R, base, regularBase, apex, O, H, N, r, l};
};

const originalUpdateUI71 = updateUI;
updateUI = function () {
  originalUpdateUI71();
  const st = currentStage();
  const card = $('vertexPositionControl');
  if (card) card.hidden = st === 2;
  if (window.syncVertexPositionControls71) window.syncVertexPositionControls71();

  if (st === 0) {
    C.hint.innerHTML = '<b>Крок 1.</b> Основа довільна. Можна змінювати положення вершини M, пересуваючи основу висоти H у площині основи. Потім перетвори основу на правильний n-кутник.';
  } else if (st === 1) {
    C.hint.innerHTML = '<b>Крок 2.</b> Основа вже правильна. Спробуй різні положення H і переконайся: піраміда стане правильною лише тоді, коли H збіжиться з центром O.';
  }
};

function setupVertexDragging71() {
  if (!renderer?.domElement || renderer.domElement.dataset.vertexDragReady) return;
  const el = renderer.domElement;
  el.dataset.vertexDragReady = '1';
  const raycaster = new THREE.Raycaster();
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const hit = new THREE.Vector3();

  function pointerNdc(e) {
    const r = el.getBoundingClientRect();
    return new THREE.Vector2(
      ((e.clientX - r.left) / r.width) * 2 - 1,
      -((e.clientY - r.top) / r.height) * 2 + 1
    );
  }

  function screenDistanceToH(e) {
    const r = el.getBoundingClientRect();
    const H = geom().H.clone().project(camera);
    const hx = r.left + (H.x + 1) * r.width / 2;
    const hy = r.top + (1 - H.y) * r.height / 2;
    return Math.hypot(e.clientX - hx, e.clientY - hy);
  }

  el.addEventListener('pointerdown', e => {
    if (currentStage() === 2 || anim || screenDistanceToH(e) > 42) return;
    vertexDragging = true;
    controls.enabled = false;
    el.style.cursor = 'grabbing';
    el.setPointerCapture?.(e.pointerId);
    e.preventDefault();
    e.stopPropagation();
  }, true);

  el.addEventListener('pointermove', e => {
    if (!vertexDragging) return;
    raycaster.setFromCamera(pointerNdc(e), camera);
    if (!raycaster.ray.intersectPlane(plane, hit)) return;
    const R = a / (2 * Math.sin(Math.PI / n));
    let fx = hit.x / R;
    let fz = hit.z / R;
    const len = Math.hypot(fx, fz);
    const max = 0.60;
    if (len > max) {
      fx = fx / len * max;
      fz = fz / len * max;
    }
    arbitraryHXFactor = fx;
    arbitraryHZFactor = fz;
    if (window.syncVertexPositionControls71) window.syncVertexPositionControls71();
    build();
    e.preventDefault();
    e.stopPropagation();
  }, true);

  const stop = e => {
    if (!vertexDragging) return;
    vertexDragging = false;
    controls.enabled = true;
    el.style.cursor = 'grab';
    try { el.releasePointerCapture?.(e.pointerId); } catch (_) {}
    e.preventDefault();
    e.stopPropagation();
  };
  el.addEventListener('pointerup', stop, true);
  el.addEventListener('pointercancel', stop, true);
};

const originalInit3d71 = init3d;
init3d = function () {
  originalInit3d71();
  setupVertexDragging71();
};
