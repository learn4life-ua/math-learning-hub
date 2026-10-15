const $ = id => document.getElementById(id);

let n = 4;
let a = 6;
let h = 4;
let reg = 0;
let anim = false;
let transparent = true;
let wireframe = false;
let mode = 'model';
let scene, camera, renderer, controls, group;
const C = {};

function cache() {
  ['canvas3d','badge','modeChip','status','freeState','regState','makeRegular','hint','ra','rh','la','lh','statL','statP','statLat','statTotal','height','apothem','radius','face','base','formulaNotice','calc'].forEach(id => C[id] = $(id));
}

function regular() {
  return reg > .999;
}

function geom() {
  const R = a / (2 * Math.sin(Math.PI / n));
  const r = a / (2 * Math.tan(Math.PI / n));
  const base = [];
  for (let i = 0; i < n; i++) {
    const t = Math.PI / 2 + 2 * Math.PI * i / n;
    base.push(new THREE.Vector3(R * Math.cos(t), 0, R * Math.sin(t)));
  }
  const k = 1 - reg;
  const ox = R * .58 * k;
  const oz = -R * .28 * k;
  const apex = new THREE.Vector3(ox, h, oz);
  const O = new THREE.Vector3(0, 0, 0);
  const H = new THREE.Vector3(ox, 0, oz);
  const N = new THREE.Vector3().addVectors(base[0], base[1]).multiplyScalar(.5);
  return {R, r, base, apex, O, H, N, l: Math.sqrt(h * h + r * r)};
}

function init3d() {
  const c = C.canvas3d;
  const w = Math.max(c.clientWidth, 1);
  const hh = Math.max(c.clientHeight, 1);
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0f172a);
  camera = new THREE.PerspectiveCamera(45, w / hh, .1, 100);
  camera.position.set(11, 9, 13);
  renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.setSize(w, hh);
  c.appendChild(renderer.domElement);
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.target.set(0, h / 2, 0);
  scene.add(new THREE.AmbientLight(0xffffff, .78));
  const d = new THREE.DirectionalLight(0xffffff, .9);
  d.position.set(10, 18, 12);
  scene.add(d);
  const grid = new THREE.GridHelper(24, 24, 0x334155, 0x1e293b);
  grid.position.y = -.02;
  scene.add(grid);
  group = new THREE.Group();
  scene.add(group);
  build();
  loop();
}

function loop() {
  requestAnimationFrame(loop);
  controls?.update();
  renderer?.render(scene, camera);
}

function resize() {
  if (!renderer) return;
  const w = Math.max(C.canvas3d.clientWidth, 1);
  const hh = Math.max(C.canvas3d.clientHeight, 1);
  camera.aspect = w / hh;
  camera.updateProjectionMatrix();
  renderer.setSize(w, hh);
}

function clear() {
  while (group?.children.length) {
    const o = group.children.pop();
    o.geometry?.dispose();
    o.material?.dispose?.();
  }
}

function line(A, B, color, dash = false) {
  const g = new THREE.BufferGeometry().setFromPoints([A, B]);
  const m = dash
    ? new THREE.LineDashedMaterial({color, dashSize: .22, gapSize: .14})
    : new THREE.LineBasicMaterial({color});
  const l = new THREE.Line(g, m);
  if (dash) l.computeLineDistances();
  group.add(l);
  return l;
}

function polyline(points, color) {
  const g = new THREE.BufferGeometry().setFromPoints(points);
  const l = new THREE.Line(g, new THREE.LineBasicMaterial({color}));
  group.add(l);
  return l;
}

function point(P, color, size = .11) {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(size, 16, 16),
    new THREE.MeshBasicMaterial({color})
  );
  mesh.position.copy(P);
  group.add(mesh);
  return mesh;
}

function sprite(text, color = '#fff', s = 1) {
  const c = document.createElement('canvas');
  c.width = 320;
  c.height = 72;
  const x = c.getContext('2d');
  x.font = '700 25px Arial';
  x.textAlign = 'center';
  x.textBaseline = 'middle';
  x.lineWidth = 5;
  x.strokeStyle = '#0f172acc';
  x.strokeText(text, 160, 36);
  x.fillStyle = color;
  x.fillText(text, 160, 36);
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({
    map: new THREE.CanvasTexture(c),
    transparent: true,
    depthTest: false
  }));
  sp.scale.set(3.1 * s, .7 * s, 1);
  return sp;
}

function faceMesh(p, color, opacity) {
  const q = [];
  for (let i = 1; i < p.length - 1; i++) {
    [p[0], p[i], p[i + 1]].forEach(v => q.push(v.x, v.y, v.z));
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(q, 3));
  g.computeVertexNormals();
  group.add(new THREE.Mesh(g, new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
    side: THREE.DoubleSide,
    depthWrite: false
  })));
}

function triArea(A, B, Cc) {
  const u = new THREE.Vector3().subVectors(B, A);
  const v = new THREE.Vector3().subVectors(Cc, A);
  return .5 * new THREE.Vector3().crossVectors(u, v).length();
}

function rightAngleMark(origin, dirA, dirB, color = 0xffffff, size = .34) {
  const aDir = dirA.clone().normalize();
  const bDir = dirB.clone().normalize();
  if (!isFinite(aDir.x) || !isFinite(bDir.x)) return;
  const p1 = origin.clone().addScaledVector(aDir, size);
  const corner = p1.clone().addScaledVector(bDir, size);
  const p2 = origin.clone().addScaledVector(bDir, size);
  polyline([p1, corner, p2], color);
}

function build() {
  if (!group) return;
  clear();
  const G = geom();
  const p = [];

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    [G.base[i], G.base[j], G.apex].forEach(v => p.push(v.x, v.y, v.z));
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
  g.computeVertexNormals();
  group.add(new THREE.Mesh(g, new THREE.MeshPhongMaterial({
    color: 0x14b8a6,
    transparent,
    opacity: transparent ? .3 : .82,
    side: THREE.DoubleSide,
    wireframe,
    shininess: 38
  })));

  for (let i = 0; i < n; i++) {
    line(G.base[i], G.base[(i + 1) % n], 0x99f6e4);
    line(G.base[i], G.apex, 0xccfbf1);
  }

  if (C.base.checked) faceMesh(G.base, 0x8b5cf6, .42);
  if (C.face.checked) faceMesh([G.base[0], G.base[1], G.apex], 0xf59e0b, .5);

  if (C.height.checked) {
    line(G.apex, G.H, 0xfb7185, true);
    const baseDir = regular()
      ? new THREE.Vector3().subVectors(G.N, G.O)
      : new THREE.Vector3().subVectors(G.O, G.H);
    rightAngleMark(G.H, new THREE.Vector3(0, 1, 0), baseDir, 0xfda4af, .32);
  }

  if (regular() && C.apothem.checked) {
    line(G.apex, G.N, 0x22d3ee);
    const sideDir = new THREE.Vector3().subVectors(G.base[1], G.N);
    const apothemDir = new THREE.Vector3().subVectors(G.apex, G.N);
    rightAngleMark(G.N, sideDir, apothemDir, 0x67e8f9, .3);
  }

  if (regular() && C.radius.checked) {
    line(G.O, G.N, 0x34d399, true);
  }

  point(G.O, 0x34d399, .12);
  const os = sprite(regular() ? 'O = H - центр основи' : 'O - центр правильної основи', '#6ee7b7', .78);
  os.position.copy(G.O).add(new THREE.Vector3(0, .24, 0));
  group.add(os);

  if (!regular()) {
    line(G.H, G.O, 0xf59e0b, true);
    point(G.H, 0xf59e0b, .12);
    const hs = sprite('H - основа висоти', '#fbbf24', .75);
    hs.position.copy(G.H).add(new THREE.Vector3(0, .25, 0));
    group.add(hs);
  }

  const ms = sprite('M - вершина', '#ffffff', .82);
  ms.position.copy(G.apex).add(new THREE.Vector3(0, .38, 0));
  group.add(ms);

  if (regular()) {
    point(G.N, 0x22d3ee, .1);
    const ns = sprite('N - середина сторони', '#67e8f9', .72);
    ns.position.copy(G.N).add(new THREE.Vector3(0, .22, 0));
    group.add(ns);
  }

  calc(G);
}

function calc(G = geom()) {
  const P = n * a;
  const Sbase = .5 * P * G.r;
  let Sb = 0;
  for (let i = 0; i < n; i++) {
    Sb += triArea(G.base[i], G.base[(i + 1) % n], G.apex);
  }
  const St = Sb + Sbase;

  C.la.textContent = `${a} см`;
  C.lh.textContent = `${h} см`;
  C.statL.textContent = regular() ? `${G.l.toFixed(2).replace('.', ',')} см` : '—';
  C.statP.textContent = `${P} см`;
  C.statLat.textContent = `${Sb.toFixed(2).replace('.', ',')} см²`;
  C.statTotal.textContent = `${St.toFixed(2).replace('.', ',')} см²`;

  C.calc.innerHTML = regular()
    ? `P=${P}; ON≈${G.r.toFixed(2).replace('.', ',')}; l≈${G.l.toFixed(2).replace('.', ',')}; S<sub>біч</sub>≈${Sb.toFixed(2).replace('.', ',')} см²; S<sub>повн</sub>≈${St.toFixed(2).replace('.', ',')} см²`
    : `Основа є правильним ${n}-кутником, але H ≠ O. S<sub>біч</sub>=S₁+S₂+…+Sₙ≈${Sb.toFixed(2).replace('.', ',')} см². Формулу ½P·l не застосовуємо.`;

  const name = {3:'трикутна',4:'чотирикутна',5:'п’ятикутна',6:'шестикутна',7:'семикутна',8:'восьмикутна'}[n];
  C.badge.textContent = regular()
    ? `Правильна ${name} піраміда`
    : `${name[0].toUpperCase() + name.slice(1)} піраміда з правильною основою`;

  if (!anim) updateUI();
}

function updateUI() {
  const r = regular();
  C.modeChip.textContent = r ? 'основа правильна, H = O' : 'основа правильна, H ≠ O';
  C.modeChip.className = `chip ${r ? 'reg' : 'free'}`;

  C.status.textContent = r
    ? 'Виконано обидві умови правильної піраміди'
    : 'Основа правильна, але вершина M зміщена: H ≠ O';

  C.freeState.className = `state ${r ? '' : 'free'}`;
  C.regState.className = `state ${r ? 'reg' : ''}`;
  C.freeState.innerHTML = 'Піраміда<br><span class="font-medium">основа правильна, H ≠ O</span>';
  C.regState.innerHTML = 'Правильна<br><span class="font-medium">основа правильна, H = O</span>';

  C.makeRegular.className = `transform-btn ${r ? 'back' : ''}`;
  C.makeRegular.querySelector('span').textContent = r ? 'Повернути зміщену вершину' : 'Зробити правильною';
  C.makeRegular.querySelector('i').className = r ? 'fa-solid fa-arrow-rotate-left mr-1' : 'fa-solid fa-wand-magic-sparkles mr-1';

  C.hint.innerHTML = r
    ? '<b>Чому вона правильна?</b> Основа - правильний многокутник, і основа висоти H збігається з центром O. Виконано обидві умови.'
    : '<b>Важливо:</b> у цій моделі основа вже є правильним многокутником. Але цього недостатньо. Щоб піраміда була правильною, потрібно ще H = O. Кнопка змінює лише положення вершини.';

  C.apothem.disabled = !r;
  C.radius.disabled = !r;
  $('heightText').textContent = r ? 'Висота MO' : 'Висота MH';
  $('heightTextM').textContent = r ? 'Висота MO' : 'Висота MH';

  C.formulaNotice.innerHTML = r
    ? '<b>Правильна піраміда:</b> основа - правильний многокутник і H = O. Тому можна використовувати апофему та формулу Sбіч = ½Pосн·l.'
    : '<b>Піраміда з правильною основою, але не правильна:</b> H ≠ O. Правильність визначається не тільки наявністю висоти. Потрібні дві умови: правильна основа та збіг H з O.';

  syncMirrors();
}

function animateReg(target) {
  if (anim) return;
  const start = reg;
  const t0 = performance.now();
  anim = true;
  C.makeRegular.disabled = true;

  function f(now) {
    const x = Math.min(1, (now - t0) / 900);
    const e = x < .5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
    reg = start + (target - start) * e;
    build();
    if (x < 1) requestAnimationFrame(f);
    else {
      reg = target;
      anim = false;
      C.makeRegular.disabled = false;
      updateUI();
      build();
    }
  }
  requestAnimationFrame(f);
}

function toggleReg() {
  const target = regular() ? 0 : 1;
  if (matchMedia('(max-width:1023px)').matches && mobilePanel.classList.contains('open')) {
    closePanel();
    setTimeout(() => animateReg(target), 180);
  } else {
    animateReg(target);
  }
}

function shapeButtons() {
  const b = $('shapeBtns');
  b.innerHTML = '';
  for (let k = 3; k <= 8; k++) {
    const x = document.createElement('button');
    x.textContent = `${k}-кутна`;
    x.className = `px-2 py-2 text-xs font-bold rounded-xl border ${k === n ? 'bg-teal-50 border-teal-500 text-teal-900' : 'bg-slate-50 border-slate-200'}`;
    x.onclick = () => {
      n = k;
      shapeButtons();
      build();
    };
    b.appendChild(x);
  }
}

function setMode(m) {
  mode = m;
  const map = {model:'panelModel', properties:'panelProperties', formula:'panelFormula', tasks:'panelTasks'};
  Object.entries(map).forEach(([k, id]) => $(id).hidden = k !== m);
  document.querySelectorAll('.tab-btn').forEach(b => {
    b.className = `tab-btn px-3 py-2 rounded-lg text-xs font-semibold ${b.dataset.mode === m ? 'bg-white text-teal-900' : 'bg-teal-900 text-white'}`;
  });
  if (m === 'formula' && MathJax?.typesetPromise) MathJax.typesetPromise();
}

const tasks = [
  ['Сторона основи правильної семикутної піраміди 10 см, апофема 20 см. Знайдіть Sбіч.',['700 см²','350 см²','1400 см²','200 см²'],0,'P=70 см; Sбіч=½·70·20=700 см².'],
  ['Правильна чотирикутна піраміда: a=6 см, h=4 см. Знайдіть апофему.',['5 см','10 см','√52 см','4 см'],0,'ON=3 см; l=√(4²+3²)=5 см.'],
  ['Для a=6 см, h=4 см знайдіть Sповн.',['96 см²','60 см²','36 см²','120 см²'],0,'l=5; Sбіч=60; Sосн=36; Sповн=96 см².'],
  ['Sбіч правильної трикутної піраміди 108 см², a=12 см. Знайдіть l.',['6 см','9 см','3 см','12 см'],0,'P=36; l=2Sбіч/P=216/36=6 см.'],
  ['Правильна чотирикутна піраміда: a=8 см, l=5 см. Знайдіть Sповн.',['144 см²','80 см²','64 см²','160 см²'],0,'Sбіч=80; Sосн=64; Sповн=144 см².']
];

let ti = 0, answered = false, good = 0, total = 0;

function loadTask(i) {
  ti = i;
  answered = false;
  const t = tasks[i];
  $('taskNo').textContent = `Завдання ${i + 1} з ${tasks.length}`;
  $('question').textContent = t[0];
  const box = $('opts');
  box.innerHTML = '';
  const vv = t[1].map((text, index) => ({text, index})).sort(() => Math.random() - .5);
  vv.forEach(v => {
    const b = document.createElement('button');
    b.className = 'w-full text-left p-2.5 rounded-xl border bg-slate-50 text-xs font-semibold';
    b.textContent = v.text;
    b.onclick = () => check(v.index, b);
    box.appendChild(b);
  });
  $('feedback').className = 'hidden';
  $('next').classList.add('opacity-50', 'pointer-events-none');
  $('next').querySelector('span').textContent = i === tasks.length - 1 ? 'Показати підсумок' : 'Наступне завдання';
}

function check(i, b) {
  if (answered) return;
  answered = true;
  total++;
  const t = tasks[ti];
  const f = $('feedback');
  if (i === t[2]) {
    good++;
    b.className = 'w-full text-left p-2.5 rounded-xl border border-emerald-400 bg-emerald-50 text-xs font-semibold';
    f.className = 'p-3 rounded-xl text-xs bg-emerald-50 border border-emerald-300';
    f.innerHTML = `<b>✓ Правильно.</b> ${t[3]}`;
  } else {
    b.className = 'w-full text-left p-2.5 rounded-xl border border-rose-400 bg-rose-50 text-xs font-semibold';
    f.className = 'p-3 rounded-xl text-xs bg-rose-50 border border-rose-300';
    f.innerHTML = `<b>✕ Неправильно.</b> Правильна відповідь: <b>${t[1][t[2]]}</b>.<br>${t[3]}`;
  }
  $('score').textContent = `${good} / ${total}`;
  $('next').classList.remove('opacity-50', 'pointer-events-none');
}

function summary() {
  const pct = Math.round(good / tasks.length * 100);
  $('taskCard').innerHTML = `<div class="text-center p-5 bg-teal-50 border border-teal-200 rounded-xl"><h3 class="font-bold text-lg">Тренажер завершено</h3><p class="mt-2">${good} із ${tasks.length} • <b>${pct}%</b></p><button id="restart" class="mt-4 w-full py-2 bg-teal-700 text-white rounded-xl text-xs font-bold">Пройти ще раз</button></div>`;
  $('restart').onclick = () => location.reload();
}

function syncMirrors() {
  document.querySelectorAll('[data-mirror]').forEach(m => {
    const t = $(m.dataset.mirror);
    m.checked = t.checked;
    m.disabled = t.disabled;
  });
}

function initMirrors() {
  document.querySelectorAll('[data-mirror]').forEach(m => m.onchange = () => {
    const t = $(m.dataset.mirror);
    t.checked = m.checked;
    t.dispatchEvent(new Event('change'));
    syncMirrors();
  });
}

const mobilePanel = $('mobilePanel');
const mobileBackdrop = $('mobileBackdrop');
let mobileMode = null;

function fit() {
  document.documentElement.style.setProperty('--hh', document.querySelector('body>header').getBoundingClientRect().height + 'px');
  resize();
}

function closePanel() {
  mobilePanel.classList.remove('open');
  mobileBackdrop.classList.remove('open');
  mobileMode = null;
  requestAnimationFrame(fit);
}

function openPanel(m) {
  mobileMode = m;
  mobilePanel.classList.add('open');
  mobileBackdrop.classList.add('open');
  requestAnimationFrame(fit);
}

document.addEventListener('DOMContentLoaded', () => {
  cache();
  shapeButtons();
  C.makeRegular.onclick = toggleReg;
  ['height','apothem','radius','face','base'].forEach(id => $(id).onchange = () => {
    build();
    syncMirrors();
  });
  C.ra.oninput = () => { a = +C.ra.value; build(); };
  C.rh.oninput = () => { h = +C.rh.value; build(); };
  $('reset').onclick = () => {
    camera.position.set(11,9,13);
    controls.target.set(0,h/2,0);
    controls.update();
  };
  $('trans').onclick = () => { transparent = !transparent; build(); };
  $('wire').onclick = () => { wireframe = !wireframe; build(); };
  document.querySelectorAll('.tab-btn').forEach(b => b.addEventListener('click', () => {
    setMode(b.dataset.mode);
    if (matchMedia('(max-width:1023px)').matches) {
      if (mobilePanel.classList.contains('open') && mobileMode === b.dataset.mode) closePanel();
      else openPanel(b.dataset.mode);
    }
  }));
  $('next').onclick = () => ti < tasks.length - 1 ? loadTask(ti + 1) : summary();
  $('openHelp').onclick = () => { $('drawer').hidden = false; $('overlay').hidden = false; };
  $('closeHelp').onclick = $('overlay').onclick = () => { $('drawer').hidden = true; $('overlay').hidden = true; };
  $('mobileClose').onclick = closePanel;
  mobileBackdrop.onclick = closePanel;
  initMirrors();
  updateUI();
  loadTask(0);
  setMode('model');
  init3d();
  fit();
  window.addEventListener('resize', fit);
});