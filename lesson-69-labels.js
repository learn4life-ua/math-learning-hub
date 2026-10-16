// Буквені позначення для 3D-моделі призми.
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
  const subs = ['₁','₂','₃','₄','₅','₆','₇','₈','₉'];
  const topSub = subs[0];
  const st = stage();
  const compact = matchMedia('(max-width: 520px)').matches;
  const scale = compact ? .82 : 1;
  const out = compact ? .30 : .40;

  for (let i = 0; i < n; i++) {
    const baseText = (i === 0 && st > 0) ? 'A=K' : letters[i];
    const low = prismLabelSprite69(baseText, i === 0 ? '#fde68a' : '#e2e8f0', scale);
    low.position.copy(G.bottom[i]).add(outwardOffset69(G.bottom[i], out));
    low.position.y += .18;
    group.add(low);

    const high = prismLabelSprite69(`${letters[i]}${topSub}`, i === 0 ? '#a7f3d0' : '#ccfbf1', scale);
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

const originalBuild69Labels = build;
build = function () {
  originalBuild69Labels();
  if ($('labels')?.checked) addPrismLabels69(geometry());
};

document.addEventListener('DOMContentLoaded', () => {
  const labels = $('labels');
  if (labels) {
    labels.addEventListener('change', () => {
      build();
      syncMirrors();
    });
  }

  // Коротко пояснюємо систему букв у властивостях.
  const heightCard = document.querySelector('#panelProperties .info.blue');
  if (heightCard && !document.getElementById('notationInfo69')) {
    const note = document.createElement('div');
    note.id = 'notationInfo69';
    note.className = 'info violet';
    note.innerHTML = '<b>Позначення.</b> Нижня основа: A, B, C, ...; верхня: A₁, B₁, C₁, ... . Точка K - основа висоти, тому у похилій призмі A₁K = h. У прямій призмі K = A і AA₁ = h = b.';
    heightCard.insertAdjacentElement('afterend', note);
  }

  const help = document.querySelector('#drawer ol');
  if (help && !document.getElementById('labelsHelp69')) {
    const li = document.createElement('li');
    li.id = 'labelsHelp69';
    li.innerHTML = 'Увімкни <b>«Позначення»</b>: нижня основа позначена A, B, C, ...; верхня - A₁, B₁, C₁, ...; K - основа висоти.';
    help.insertBefore(li, help.children[1] || null);
  }

  build();
});
