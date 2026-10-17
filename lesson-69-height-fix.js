// Методичне уточнення: висоту призми будуємо від вершини верхньої основи
// до площини нижньої основи. У прямій призмі ця висота збігається
// з відповідним бічним ребром.
const originalGeometry69 = geometry;
geometry = function () {
  const G = originalGeometry69();
  const T = G.top[0].clone();
  const H = new THREE.Vector3(T.x, 0, T.z);
  return {...G, T, H};
};

const originalUpdateUI69Height = updateUI;
updateUI = function () {
  originalUpdateUI69Height();
  const st = stage();
  if (st === 0) {
    C.hint.innerHTML = '<b>Похила призма:</b> висота h проведена з вершини верхньої основи перпендикулярно до площини нижньої основи. Вона не збігається з бічним ребром b. Змінюй d і порівнюй h та b.';
  } else if (st === 1) {
    C.hint.innerHTML = '<b>Пряма призма:</b> висота, проведена з вершини верхньої основи, збігається з відповідним бічним ребром, тому b = h. Бічні грані - прямокутники.';
  } else {
    C.hint.innerHTML = '<b>Правильна призма:</b> призма пряма, тому її бічне ребро є висотою, а основа - правильний многокутник.';
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const blue = document.querySelector('#panelProperties .info.blue');
  if (blue) blue.innerHTML = '<b>Висота.</b> Перпендикуляр, опущений з точки площини однієї основи на площину іншої. У моделі висоту проведено з вершини верхньої основи. У прямій призмі кожне бічне ребро є висотою.';

  const helpItems = document.querySelectorAll('#drawer ol li');
  if (helpItems[0]) helpItems[0].innerHTML = 'Почни з похилої призми. Увімкни висоту: вона проведена <b>з вершини верхньої основи</b> перпендикулярно до площини нижньої основи. Порівняй h і бічне ребро b.';
});

// Спочатку підключаємо буквені позначення, а після них - режим
// «Зображення на площині», щоб обидва шари працювали узгоджено.
(() => {
  const labelsScript = document.createElement('script');
  labelsScript.src = 'lesson-69-labels.js?v=20261016-1642';
  labelsScript.onload = () => {
    const planeScript = document.createElement('script');
    planeScript.src = 'lesson-69-plane-view.js?v=20261017-1000';
    document.body.appendChild(planeScript);
  };
  document.body.appendChild(labelsScript);
})();
