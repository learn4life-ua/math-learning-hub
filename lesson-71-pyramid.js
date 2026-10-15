const $ = id => document.getElementById(id);

let n = 4;
let a = 6;
let h = 4;
let baseReg = 0;
let apexReg = 0;
let anim = false;
let transparent = true;
let wireframe = false;
let mode = 'model';
let scene, camera, renderer, controls, group;
let lastStage = -1;
const C = {};

function cache() {
  ['canvas3d','badge','modeChip','status','makeRegular','hint','ra','rh','la','lh','statL','statP','statLat','statTotal','height','apothem','radius','face','base','formulaNotice','calc'].forEach(id => C[id] = $(id));
}

function baseIsRegular() { return baseReg > .999; }
function regular() { return baseIsRegular() && apexReg > .999; }
function currentStage() {
  if (!baseIsRegular()) return 0;
  if (!regular()) return 1;
  return 2;
}

function enhanceMethodicalUI() {
  const states = document.querySelector('.states');
  if (states) {
    states.innerHTML = `
      <div id="freeState" class="state free">Довільна піраміда<br><span class="font-medium">основа довільна</span></div>
      <div class="arrow text-teal-700"><i class="fa-solid fa-arrow-right"></i></div>
      <div id="baseState" class="state">Правильна основа<br><span class="font-medium">H ≠ O</span></div>
      <div class="arrow text-teal-700"><i class="fa-solid fa-arrow-right"></i></div>
      <div id="regState" class="state">Правильна піраміда<br><span class="font-medium">H = O</span></div>`;
  }
  C.freeState = $('freeState');
  C.baseState = $('baseState');
  C.regState = $('regState');

  const aControl = C.ra?.parentElement;
  if (aControl && !$('arbitraryBaseNote')) {
    const note = document.createElement('div');
    note.id = 'arbitraryBaseNote';
    note.className = 'p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed';
    note.innerHTML = '<b>Довільна основа:</b> її сторони можуть мати різні довжини, тому одну величину <i>a</i> для всіх сторін не задаємо.';
    aControl.insertAdjacentElement('afterend', note);
  }

  const props = $('panelProperties')?.querySelector('.text-xs.space-y-2');
  if (props && !$('elementCountCard')) {
    const counts = document.createElement('div');
    counts.id = 'elementCountCard';
    counts.className = 'p-3 bg-indigo-50 rounded-xl border border-indigo-200';
    props.appendChild(counts);

    const regProps = document.createElement('div');
    regProps.className = 'p-3 bg-emerald-50 rounded-xl border border-emerald-200';
    regProps.innerHTML = `<b class="block mb-1">У правильній піраміді</b>
      <ul class="list-disc pl-4 space-y-1">
        <li>усі бічні ребра рівні;</li>
        <li>усі бічні грані - рівні рівнобедрені трикутники;</li>
        <li>усі апофеми рівні.</li>
      </ul>`;
    props.appendChild(regProps);

    const compare = document.createElement('div');
    compare.className = 'p-3 bg-rose-50 rounded-xl border border-rose-200';
    compare.innerHTML = `<b class="block mb-1">Не плутай</b>
      Висота піраміди перпендикулярна <b>площині основи</b>. Апофема правильної піраміди - це висота <b>бічної грані</b>, тому вона перпендикулярна відповідній стороні основи.`;
    props.appendChild(compare);
  }

  const formulaPanel = $('panelFormula');
  if (formulaPanel) {
    const blocks = Array.from(formulaPanel.children);
    if (blocks[2] && !blocks[2].id) blocks[2].id = 'formulaRegularLateral';
    if (blocks[3] && !blocks[3].id) blocks[3].id = 'formulaTotal';
    if (blocks[4] && !blocks[4].id) blocks[4].id = 'formulaMON';
  }

  const drawer = $('drawer');
  if (drawer) {
    const ol = drawer.querySelector('ol');
    if (ol) ol.innerHTML = `
      <li>Почни з <b>довільної піраміди</b>: її основа не є правильним многокутником. Знайди вершину M і основу висоти H.</li>
      <li>Натисни <b>«Зробити основу правильною»</b>. Основа перетвориться на правильний n-кутник, але H ще не збігатиметься з O.</li>
      <li>Натисни <b>«Зробити правильною»</b>. Простеж, як H переміщується до центра O.</li>
      <li>Перевір дві умови: основа - правильний многокутник і H = O.</li>
      <li>Лише після цього ввімкни апофему MN та ON і досліди прямокутний трикутник MON.</li>
      <li>Порівняй: для довільної піраміди Sбіч - сума площ бічних граней; формула ½P·l застосовується до правильної піраміди.</li>
      <li>Виконай тренажер і переглянь підсумок.</li>`;
  }
}

function irregularTemplate(i, R) {
  const radial = [1.08, .82, 1.15, .90, 1.06, .86, 1.12, .94];
  const angleShift = [0, .055, -.045, .065, -.04, .05, -.035, .025];
  const t = Math.PI / 2 + 2 * Math.PI * i / n + angleShift[i];
  const rr = R * radial[i];
  return new THREE.Vector3(rr * Math.cos(t), 0, rr * Math.sin(t));
}

function geom() {
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
  const offset = new THREE.Vector3(R * .46, 0, -R * .22).multiplyScalar(1 - apexReg);
  const H = offset.clone();
  const apex = new THREE.Vector3(H.x, h, H.z);
  const N = new THREE.Vector3().addVectors(base[0], base[1]).multiplyScalar(.5);
  const r = O.distanceTo(N);
  const l = Math.sqrt(h * h + r * r);

  return {R, base, regularBase, apex, O, H, N, r, l};
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
  c.innerHTML = '';
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
    if (o.material) {
      if (Array.isArray(o.material)) o.material.forEach(m => m.dispose?.());
      else o.material.dispose?.();
    }
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
  c.width = 560;
  c.height = 80;
  const x = c.getContext('2d');
  x.font = '700 25px Arial';
  x.textAlign = 'center';
  x.textBaseline = 'middle';
  x.lineWidth = 5;
  x.strokeStyle = '#0f172acc';
  x.strokeText(text, 280, 40);
  x.fillStyle = color;
  x.fillText(text, 280, 40);
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({
    map: new THREE.CanvasTexture(c), transparent: true, depthTest: false
  }));
  sp.scale.set(5.2 * s, .74 * s, 1);
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
    color, transparent: true, opacity, side: THREE.DoubleSide, depthWrite: false
  })));
}

function triArea(A, B, Cc) {
  const u = new THREE.Vector3().subVectors(B, A);
  const v = new THREE.Vector3().subVectors(Cc, A);
  return .5 * new THREE.Vector3().crossVectors(u, v).length();
}

function polygonPerimeter(points) {
  let p = 0;
  for (let i = 0; i < points.length; i++) p += points[i].distanceTo(points[(i + 1) % points.length]);
  return p;
}

function polygonAreaXZ(points) {
  let s = 0;
  for (let i = 0; i < points.length; i++) {
    const A = points[i], B = points[(i + 1) % points.length];
    s += A.x * B.z - B.x * A.z;
  }
  return Math.abs(s) / 2;
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
    const inPlane = new THREE.Vector3().subVectors(G.base[0], G.H);
    rightAngleMark(G.H, new THREE.Vector3(0, 1, 0), inPlane, 0xfda4af, .32);
    const midH = new THREE.Vector3().addVectors(G.apex, G.H).multiplyScalar(.5);
    const hLabel = sprite(regular() ? 'MO ⟂ площині основи' : 'MH ⟂ площині основи', '#fda4af', .62);
    hLabel.position.copy(midH).add(new THREE.Vector3(.8, 0, .2));
    group.add(hLabel);
  }

  point(G.H, regular() ? 0x34d399 : 0xf59e0b, .12);
  if (!regular()) {
    const hs = sprite('H - основа висоти', '#fbbf24', .62);
    hs.position.copy(G.H).add(new THREE.Vector3(0, .26, 0));
    group.add(hs);
  }

  if (baseIsRegular()) {
    point(G.O, 0x34d399, .12);
    if (!regular()) line(G.H, G.O, 0xf59e0b, true);
    const os = sprite(regular() ? 'O = H - центр основи' : 'O - центр правильної основи', '#6ee7b7', .62);
    os.position.copy(G.O).add(new THREE.Vector3(0, .25, 0));
    group.add(os);
  }

  if (regular() && C.apothem.checked) {
    line(G.apex, G.N, 0x22d3ee);
    const sideDir = new THREE.Vector3().subVectors(G.base[1], G.N);
    const apothemDir = new THREE.Vector3().subVectors(G.apex, G.N);
    rightAngleMark(G.N, sideDir, apothemDir, 0x67e8f9, .3);
    const midA = new THREE.Vector3().addVectors(G.apex, G.N).multiplyScalar(.5);
    const aLabel = sprite('MN ⟂ стороні основи', '#67e8f9', .58);
    aLabel.position.copy(midA).add(new THREE.Vector3(-.8, 0, .2));
    group.add(aLabel);
  }

  if (regular() && C.radius.checked) line(G.O, G.N, 0x34d399, true);

  const ms = sprite('M - вершина', '#ffffff', .66);
  ms.position.copy(G.apex).add(new THREE.Vector3(0, .38, 0));
  group.add(ms);

  if (regular()) {
    point(G.N, 0x22d3ee, .1);
    const ns = sprite('N - середина сторони', '#67e8f9', .58);
    ns.position.copy(G.N).add(new THREE.Vector3(0, .22, 0));
    group.add(ns);
  }

  calc(G);
}

function calc(G = geom()) {
  const P = polygonPerimeter(G.base);
  const Sbase = polygonAreaXZ(G.base);
  let Sb = 0;
  for (let i = 0; i < n; i++) Sb += triArea(G.base[i], G.base[(i + 1) % n], G.apex);
  const St = Sb + Sbase;
  const st = currentStage();

  C.la.textContent = `${a} см`;
  C.lh.textContent = `${h} см`;
  C.statL.textContent = regular() ? `${G.l.toFixed(2).replace('.', ',')} см` : '—';
  C.statP.textContent = `${P.toFixed(baseIsRegular() ? 0 : 2).replace('.', ',')} см`;
  C.statLat.textContent = `${Sb.toFixed(2).replace('.', ',')} см²`;
  C.statTotal.textContent = `${St.toFixed(2).replace('.', ',')} см²`;

  if (regular()) {
    C.calc.innerHTML = `P=${P.toFixed(0)}; ON≈${G.r.toFixed(2).replace('.', ',')}; l≈${G.l.toFixed(2).replace('.', ',')}; S<sub>біч</sub>=½P·l≈${Sb.toFixed(2).replace('.', ',')} см²; S<sub>повн</sub>≈${St.toFixed(2).replace('.', ',')} см²`;
  } else {
    C.calc.innerHTML = `S<sub>біч</sub>=S₁+S₂+…+Sₙ≈${Sb.toFixed(2).replace('.', ',')} см²; S<sub>повн</sub>=S<sub>біч</sub>+S<sub>осн</sub>≈${St.toFixed(2).replace('.', ',')} см². Формулу ½P·l ще не застосовуємо.`;
  }

  const name = {3:'трикутна',4:'чотирикутна',5:'п’ятикутна',6:'шестикутна',7:'семикутна',8:'восьмикутна'}[n];
  C.badge.textContent = st === 0
    ? `Довільна ${name} піраміда`
    : st === 1
      ? `${name[0].toUpperCase() + name.slice(1)} піраміда з правильною основою`
      : `Правильна ${name} піраміда`;

  if (!anim) updateUI();
}

function updateUI() {
  const st = currentStage();
  const r = regular();

  C.modeChip.textContent = st === 0 ? 'основа довільна' : st === 1 ? 'основа правильна, H ≠ O' : 'основа правильна, H = O';
  C.modeChip.className = `chip ${st === 0 ? 'free' : st === 1 ? 'mid' : 'reg'}`;

  C.status.textContent = st === 0
    ? 'Основа - довільний многокутник'
    : st === 1
      ? 'Основа правильна, але H не збігається з O'
      : 'Виконано обидві умови правильної піраміди';

  C.freeState.className = `state ${st === 0 ? 'free' : ''}`;
  C.baseState.className = `state ${st === 1 ? 'mid' : ''}`;
  C.regState.className = `state ${st === 2 ? 'reg' : ''}`;

  C.makeRegular.className = `transform-btn ${st === 2 ? 'back' : ''}`;
  C.makeRegular.querySelector('i').className = st === 2 ? 'fa-solid fa-arrow-rotate-left mr-1' : 'fa-solid fa-wand-magic-sparkles mr-1';
  C.makeRegular.querySelector('span').textContent = st === 0
    ? 'Зробити основу правильною'
    : st === 1
      ? 'Зробити правильною'
      : 'Повернути довільну';

  C.hint.innerHTML = st === 0
    ? '<b>Крок 1.</b> Зараз основа довільна. Спочатку перетвори її на правильний n-кутник.'
    : st === 1
      ? '<b>Крок 2.</b> Основа вже правильна, але цього недостатньо: потрібно, щоб основа висоти H збіглася з центром O.'
      : '<b>Правильна піраміда:</b> основа - правильний многокутник і H = O. Виконано обидві умови.';

  C.apothem.disabled = !r;
  C.radius.disabled = !r;
  if (st !== 2) {
    C.apothem.checked = false;
    C.radius.checked = false;
  } else if (lastStage !== 2) {
    C.apothem.checked = true;
    C.radius.checked = true;
  }

  $('heightText').textContent = r ? 'Висота MO' : 'Висота MH';
  $('heightTextM').textContent = r ? 'Висота MO' : 'Висота MH';

  const aControl = C.ra?.parentElement;
  const aTitle = aControl?.querySelector('b');
  const arbitraryNote = $('arbitraryBaseNote');
  if (aControl) aControl.hidden = st === 0;
  if (arbitraryNote) arbitraryNote.hidden = st !== 0;
  if (aTitle) aTitle.textContent = 'Сторона основи a';

  C.formulaNotice.innerHTML = st === 0
    ? '<b>Довільна піраміда:</b> Sбіч знаходимо як суму площ усіх бічних граней. Формула ½Pосн·l тут не застосовується.'
    : st === 1
      ? '<b>Основа вже правильна, але піраміда ще не правильна:</b> H ≠ O. Апофема MN і трикутник MON у цьому режимі не використовуються.'
      : '<b>Правильна піраміда:</b> основа - правильний многокутник і H = O. Тепер можна використовувати апофему та формулу Sбіч = ½Pосн·l.';

  const regularLateral = $('formulaRegularLateral');
  const mon = $('formulaMON');
  if (regularLateral) regularLateral.hidden = !r;
  if (mon) mon.hidden = !r;

  const counts = $('elementCountCard');
  if (counts) counts.innerHTML = `<b class="block mb-1">${n}-кутна піраміда</b>Має <b>${n + 1}</b> вершин, <b>${n + 1}</b> граней і <b>${2 * n}</b> ребер.`;

  syncMirrors();
  lastStage = st;
}

function animateValue(which, target, duration = 850, done) {
  if (anim) return;
  const start = which === 'base' ? baseReg : apexReg;
  const t0 = performance.now();
  anim = true;
  C.makeRegular.disabled = true;

  function frame(now) {
    const x = Math.min(1, (now - t0) / duration);
    const e = x < .5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
    const value = start + (target - start) * e;
    if (which === 'base') baseReg = value;
    else apexReg = value;
    build();
    if (x < 1) requestAnimationFrame(frame);
    else {
      if (which === 'base') baseReg = target;
      else apexReg = target;
      anim = false;
      C.makeRegular.disabled = false;
      updateUI();
      build();
      done?.();
    }
  }
  requestAnimationFrame(frame);
}

function resetToArbitrary() {
  if (anim) return;
  animateValue('apex', 0, 650, () => animateValue('base', 0, 750));
}

function stageAction() {
  const st = currentStage();
  const run = () => {
    if (st === 0) animateValue('base', 1);
    else if (st === 1) animateValue('apex', 1);
    else resetToArbitrary();
  };

  if (matchMedia('(max-width:1023px)').matches && mobilePanel.classList.contains('open')) {
    closePanel();
    setTimeout(run, 180);
  } else run();
}

function shapeButtons() {
  const b = $('shapeBtns');
  b.innerHTML = '';
  for (let k = 3; k <= 8; k++) {
    const x = document.createElement('button');
    x.textContent = `${k}-кутна`;
    x.className = `px-2 py-2 text-xs font-bold rounded-xl border ${k === n ? 'bg-teal-50 border-teal-500 text-teal-900' : 'bg-slate-50 border-slate-200'}`;
    x.onclick = () => { n = k; shapeButtons(); build(); };
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
  updateUI();
  if (m === 'formula' && window.MathJax?.typesetPromise) MathJax.typesetPromise();
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
  $('taskCard').innerHTML = `<div class="text-center p-5 bg-teal-50 border border-teal-200 rounded-xl"><h3 class="font-bold text-lg">Тренажер завершено</h3><p class="mt-2">Правильних відповідей: <b>${good} із ${tasks.length}</b></p><p class="mt-1 text-sm">Результат: <b>${pct}%</b></p><button id="restart" class="mt-4 w-full py-2 bg-teal-700 text-white rounded-xl text-xs font-bold">Пройти ще раз</button></div>`;
  $('restart').onclick = () => location.reload();
}

function syncMirrors() {
  document.querySelectorAll('[data-mirror]').forEach(m => {
    const t = $(m.dataset.mirror);
    if (!t) return;
    m.checked = t.checked;
    m.disabled = t.disabled;
  });
}

function initMirrors() {
  document.querySelectorAll('[data-mirror]').forEach(m => m.onchange = () => {
    const t = $(m.dataset.mirror);
    if (!t) return;
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
  enhanceMethodicalUI();
  shapeButtons();
  C.makeRegular.onclick = stageAction;

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
