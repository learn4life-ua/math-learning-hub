// Буквені позначення та методична візуалізація для 3D-моделі призми.
// Нижня основа: A, B, C, ...; верхня: A₁, B₁, C₁, ...;
// K - основа висоти A₁K. У прямій призмі K = A.

function prismLabelSprite69(text, color = '#f8fafc', scale = 1) {
  const canvas = document.createElement('canvas');
  canvas.width = 192;
  canvas.height = 96;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = '700 40px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineWidth = 8;
  ctx.strokeStyle = 'rgba(15,23,42,.92)';
  ctx.strokeText(text, 96, 48);
  ctx.fillStyle = color;
  ctx.fillText(text, 96, 48);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
    depthWrite: false
  }));
  sprite.scale.set(1.18 * scale, .59 * scale, 1);
  sprite.renderOrder = 20;
  return sprite;
}

function outwardOffset69(P, amount = .38) {
  const v = new THREE.Vector3(P.x, 0, P.z);
  if (v.lengthSq() < 1e-8) return new THREE.Vector3(amount, 0, amount);
  return v.normalize().multiplyScalar(amount);
}

function addPrismLabels69(G) {
  if (!group || !$('labels')?.checked) return;

  const letters = ['A','B','C','D','E','F','G','H'];
  const st = stage();
  const compact = matchMedia('(max-width: 520px)').matches;
  const scale = compact ? .82 : 1;
  const out = compact ? .30 : .40;

  for (let i = 0; i < n; i++) {
    // Маленькі маркери вершин допомагають співвіднести букву з конкретною точкою.
    point(G.bottom[i], i === 0 ? 0xfde68a : 0xe2e8f0, .07);
    point(G.top[i], i === 0 ? 0xa7f3d0 : 0xccfbf1, .07);

    const baseText = (i === 0 && st > 0) ? 'A = K' : letters[i];
    const low = prismLabelSprite69(baseText, i === 0 ? '#fde68a' : '#e2e8f0', scale);
    low.position.copy(G.bottom[i]).add(outwardOffset69(G.bottom[i], out));
    low.position.y += .18;
    group.add(low);

    const high = prismLabelSprite69(`${letters[i]}₁`, i === 0 ? '#a7f3d0' : '#ccfbf1', scale);
    high.position.copy(G.top[i]).add(outwardOffset69(G.top[i], out));
    high.position.y += .24;
    group.add(high);
  }

  // У похилій призмі K не збігається з A, тому підписуємо основу висоти окремо.
  if (st === 0) {
    const k = prismLabelSprite69('K', '#fda4af', scale * 1.05);
    k.position.copy(G.H).add(new THREE.Vector3(.28, .16, .20));
    group.add(k);
  }
}

function addObliqueTriangle69(G) {
  if (!group || stage() !== 0) return;
  if (!C.height?.checked || !C.edge?.checked) return;

  const A = G.bottom[0].clone();
  const K = G.H.clone();
  const A1 = G.top[0].clone();
  const AK = K.clone().sub(A);
  const dNow = AK.length();
  if (dNow < .05) return;

  // AK - ортогональна проєкція бічного ребра AA₁ на площину основи.
  line(A, K, 0xfbbf24, true);
  const midAK = new THREE.Vector3().addVectors(A, K).multiplyScalar(.5);
  const dLabel = sprite('d = AK', '#fde68a', .48);
  dLabel.position.copy(midAK).add(new THREE.Vector3(0, .22, 0));
  group.add(dLabel);

  // Кут між ребром і площиною - це кут між AA₁ та його проєкцією AK.
  const e1 = AK.clone().normalize();
  const e2 = new THREE.Vector3(0, 1, 0);
  const alphaRad = Math.atan2(h, dNow);
  const radius = Math.min(.85, Math.max(.42, dNow * .18));
  const arc = [];
  const steps = 20;
  for (let i = 0; i <= steps; i++) {
    const t = alphaRad * i / steps;
    arc.push(A.clone()
      .addScaledVector(e1, Math.cos(t) * radius)
      .addScaledVector(e2, Math.sin(t) * radius));
  }
  polyline(arc, 0xfbbf24);

  const tMid = alphaRad / 2;
  const alphaPos = A.clone()
    .addScaledVector(e1, Math.cos(tMid) * (radius + .30))
    .addScaledVector(e2, Math.sin(tMid) * (radius + .30));
  const alphaLabel = prismLabelSprite69('α', '#fde68a', .78);
  alphaLabel.position.copy(alphaPos);
  group.add(alphaLabel);

  // Точка K уже позначена висотою; додатковий маркер робить трикутник AA₁K очевиднішим.
  point(K, 0xfb7185, .09);
  point(A, 0xfde68a, .08);
  point(A1, 0xa7f3d0, .08);
}

function setStatsGrid69(count) {
  const stats = $('stats');
  if (!stats) return;
  stats.style.gridTemplateColumns = matchMedia('(min-width: 640px)').matches
    ? `repeat(${count}, minmax(0, 1fr))`
    : 'repeat(2, minmax(0, 1fr))';
}

function setStat69(node, title, value, hidden = false) {
  if (!node) return;
  const card = node.closest('.stat');
  if (!card) return;
  card.hidden = hidden;
  const titleNode = card.querySelector('div');
  if (titleNode) titleNode.innerHTML = title;
  node.innerHTML = value;
}

function updateGeometryStats69(G = geometry()) {
  const st = stage();

  if (st === 0) {
    setStatsGrid69(4);
    setStat69(C.statH, 'Висота A₁K = h', `${fmt(h)} см`);
    setStat69(C.statB, 'Бічне ребро AA₁ = b', `${fmt(G.b)} см`);
    setStat69(C.statAngle, 'Кут α = ∠KAA₁', `${fmt(G.alpha)}°`);
    setStat69(C.statLat, 'Проєкція AK = d', `${fmt(G.shift.length())} см`);
    setStat69(C.statTotal, '', '', true);
  } else if (st === 1) {
    setStatsGrid69(4);
    setStat69(C.statH, 'Висота і бічне ребро', `AA₁ = h = b = ${fmt(h)} см`);
    setStat69(C.statB, 'Кут ребра з основою', 'α = 90°');
    setStat69(C.statAngle, 'S біч.', 'P<sub>осн</sub> · h');
    setStat69(C.statLat, 'S повн.', 'S<sub>біч</sub> + 2S<sub>осн</sub>');
    setStat69(C.statTotal, '', '', true);
  } else {
    const P = n * a;
    const Sbase = n * a * a / (4 * Math.tan(Math.PI / n));
    const Sl = P * h;
    const St = Sl + 2 * Sbase;
    setStatsGrid69(5);
    setStat69(C.statH, 'Сторона основи a', `${fmt(a)} см`);
    setStat69(C.statB, 'Висота = ребро', `h = b = ${fmt(h)} см`);
    setStat69(C.statAngle, 'Периметр P осн.', `${fmt(P)} см`);
    setStat69(C.statLat, 'S біч.', `${fmt(Sl)} см²`);
    setStat69(C.statTotal, 'S повн.', `${fmt(St)} см²`);
  }
}

const originalBuild69Labels = build;
build = function () {
  originalBuild69Labels();
  const G = geometry();
  addObliqueTriangle69(G);
  if ($('labels')?.checked) addPrismLabels69(G);
  updateGeometryStats69(G);
};

const originalUpdateUI69Labels = updateUI;
updateUI = function () {
  originalUpdateUI69Labels();
  const st = stage();
  const shiftTitle = C.shiftControl?.querySelector('.control-head b');
  if (shiftTitle) shiftTitle.textContent = 'Проєкція бічного ребра AK = d';

  if (st === 0) {
    C.hint.innerHTML = '<b>Похила призма:</b> у прямокутному трикутнику AA₁K: A₁K = h - висота, AK = d - проєкція бічного ребра AA₁ на площину основи, α = ∠KAA₁ - кут між ребром і площиною основи.';
  } else if (st === 1) {
    C.hint.innerHTML = '<b>Пряма призма:</b> K = A, тому AA₁ = h = b, а кут між бічним ребром і площиною основи дорівнює 90°. Бічні грані - прямокутники.';
  } else {
    C.hint.innerHTML = '<b>Правильна призма:</b> призма пряма, тому AA₁ = h = b, а правильна основа дозволяє обчислювати її периметр і площу за стороною a.';
  }
  updateGeometryStats69();
};

function ensureLabelControls69() {
  if (!$('labels')) {
    const desktopBox = document.querySelector('#sceneOptionsDesktop > div');
    if (desktopBox) {
      const label = document.createElement('label');
      label.innerHTML = '<input id="labels" type="checkbox" checked> Позначення';
      desktopBox.appendChild(label);
    }
  }

  const mobileGrid = document.querySelector('#mobileSceneOptions .grid');
  if (mobileGrid && !mobileGrid.querySelector('[data-mirror="labels"]')) {
    const label = document.createElement('label');
    label.innerHTML = '<input data-mirror="labels" type="checkbox" checked> Позначення';
    mobileGrid.appendChild(label);
  }
}

function bindLabelControls69() {
  const labels = $('labels');
  const mirror = document.querySelector('[data-mirror="labels"]');
  if (!labels) return;

  if (!labels.dataset.bound69) {
    labels.dataset.bound69 = '1';
    labels.addEventListener('change', () => {
      if (mirror) mirror.checked = labels.checked;
      build();
    });
  }

  if (mirror && !mirror.dataset.bound69) {
    mirror.dataset.bound69 = '1';
    mirror.checked = labels.checked;
    mirror.addEventListener('change', () => {
      labels.checked = mirror.checked;
      build();
    });
  }
}

function initPrismLabels69() {
  ensureLabelControls69();
  bindLabelControls69();

  // Коротко пояснюємо систему букв у властивостях.
  const heightCard = document.querySelector('#panelProperties .info.blue');
  if (heightCard && !document.getElementById('notationInfo69')) {
    const note = document.createElement('div');
    note.id = 'notationInfo69';
    note.className = 'info violet';
    note.innerHTML = '<b>Позначення.</b> Нижня основа: A, B, C, ...; верхня: A₁, B₁, C₁, ... . Точка K - основа висоти, тому у похилій призмі A₁K = h. У прямій призмі K = A і AA₁ = h = b.';
    heightCard.insertAdjacentElement('afterend', note);

    const geo = document.createElement('div');
    geo.id = 'obliqueGeometryInfo69';
    geo.className = 'info amber';
    geo.innerHTML = '<b>Похила призма.</b> У прямокутному трикутнику AA₁K маємо A₁K = h, AK = d, AA₁ = b. Тому b = √(h² + d²). Кут α = ∠KAA₁ - це кут між бічним ребром і його проєкцією AK на площину основи; sin α = h / b.';
    note.insertAdjacentElement('afterend', geo);
  }

  const help = document.querySelector('#drawer ol');
  if (help && !document.getElementById('labelsHelp69')) {
    const li = document.createElement('li');
    li.id = 'labelsHelp69';
    li.innerHTML = 'Увімкни <b>«Позначення»</b>: нижня основа позначена A, B, C, ...; верхня - A₁, B₁, C₁, ...; K - основа висоти. У похилій призмі пунктир AK показує проєкцію бічного ребра, а дуга α - кут ребра з площиною основи.';
    help.insertBefore(li, help.children[1] || null);
  }

  window.addEventListener('resize', () => updateGeometryStats69());
  if (typeof build === 'function' && group) build();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPrismLabels69);
} else {
  initPrismLabels69();
}
