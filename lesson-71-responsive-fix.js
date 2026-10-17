// Заняття 71: фінальний мобільний адаптив для вузьких екранів.
// Виправляє компонування шапки/перемикача режимів і автоматично вписує 3D-модель у сцену.
(() => {
  const style = document.createElement('style');
  style.id = 'lesson71ResponsiveFixStyles';
  style.textContent = `
    @media (max-width:480px){
      body>header>div{padding:6px 8px!important}
      body>header nav{
        display:grid!important;
        grid-template-columns:repeat(3,minmax(0,1fr))!important;
        gap:4px!important;
        margin-top:5px!important;
      }
      body>header nav button{
        width:100%!important;
        min-width:0!important;
        height:32px!important;
        min-height:32px!important;
        padding:4px 5px!important;
        font-size:9.4px!important;
        line-height:1.05!important;
        white-space:nowrap!important;
        overflow:hidden!important;
        text-overflow:ellipsis!important;
      }
      body>main{height:calc(100dvh - 112px)!important;padding:5px!important}

      body>main section>div:first-child>.absolute.top-3>div:first-child{
        max-width:calc(100% - 126px)!important;
        padding:6px 8px!important;
      }
      #viewBtns{flex:0 0 auto!important}
      #viewBtns button{width:34px!important;height:34px!important}
      #badge{font-size:10px!important;line-height:1.15!important}

      #viewSwitch71{
        top:70px!important;
        left:8px!important;
        right:8px!important;
        transform:none!important;
        width:auto!important;
        max-width:none!important;
        display:grid!important;
        grid-template-columns:.82fr 1.46fr .82fr!important;
        gap:3px!important;
        padding:4px!important;
      }
      #viewSwitch71 button{
        min-width:0!important;
        min-height:44px!important;
        padding:5px 4px!important;
        font-size:9px!important;
        line-height:1.05!important;
        white-space:normal!important;
        overflow-wrap:anywhere!important;
        text-align:center!important;
      }
      #viewSwitch71 button i{margin-right:2px}

      #plane71 .paper-note{top:124px!important}
      #net71Controls{top:124px!important;max-width:calc(100% - 16px)!important}
      #net71Controls input{width:66px!important}

      #mobilePanel{max-height:calc(100dvh - 64px)!important}
    }

    @media (max-width:370px){
      body>header nav button{font-size:8.8px!important;padding-left:3px!important;padding-right:3px!important}
      #viewSwitch71 button{font-size:8.5px!important}
      #viewSwitch71 button i{display:block;margin:0 0 2px}
      #net71Controls{font-size:8.5px!important;gap:4px!important;padding:5px 6px!important}
      #net71Controls input{width:58px!important}
    }
  `;
  document.head.appendChild(style);

  function isMobile71(){
    return matchMedia('(max-width:1023px)').matches;
  }

  function is3D71(){
    const card = document.getElementById('canvas3d')?.parentElement;
    return card && !card.classList.contains('lesson71-plane-mode') && !card.classList.contains('lesson71-net-mode');
  }

  function fitMobilePyramid71(){
    if (!isMobile71() || !is3D71() || typeof geom !== 'function' || !camera || !controls) return;

    const G = geom();
    const pts = [...G.base, G.apex];
    if (!pts.length) return;

    const box = new THREE.Box3().setFromPoints(pts);
    const sphere = new THREE.Sphere();
    box.getBoundingSphere(sphere);

    // Центруємо по фактичній геометрії, а не по початку координат: це важливо,
    // коли H і вершина M зміщені від центра основи.
    const target = sphere.center.clone();

    const vFov = THREE.MathUtils.degToRad(camera.fov || 45);
    const aspect = Math.max(camera.aspect || 1, .35);
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect);
    const distV = sphere.radius / Math.max(Math.sin(vFov / 2), .1);
    const distH = sphere.radius / Math.max(Math.sin(hFov / 2), .1);
    // Додатковий запас потрібен для букв і підписів, які виходять за вершини моделі.
    const distance = Math.max(distV, distH, 12) * 1.34;

    let dir = camera.position.clone().sub(controls.target);
    if (dir.lengthSq() < 1e-6) dir.set(11, 9, 13);
    dir.normalize();

    controls.target.copy(target);
    camera.position.copy(target).add(dir.multiplyScalar(distance));
    camera.near = Math.max(.05, distance / 250);
    camera.far = Math.max(100, distance * 5);
    camera.updateProjectionMatrix();
    controls.update();
  }

  function scheduleFit71(delay = 0){
    setTimeout(() => requestAnimationFrame(fitMobilePyramid71), delay);
  }

  document.addEventListener('DOMContentLoaded', () => {
    // Після всіх ініціалізаторів і resize вписуємо модель у реальну мобільну сцену.
    scheduleFit71(50);

    C.ra?.addEventListener('input', () => scheduleFit71());
    C.rh?.addEventListener('input', () => scheduleFit71());
    document.getElementById('shapeBtns')?.addEventListener('click', () => scheduleFit71(40));

    // Існуючий reset спочатку повертає стандартний ракурс, після чого ми
    // коректно вписуємо всю піраміду разом із підписами.
    document.getElementById('reset')?.addEventListener('click', () => scheduleFit71(20));
  });

  let lastWidth71 = window.innerWidth;
  window.addEventListener('resize', () => {
    const w = window.innerWidth;
    if (Math.abs(w - lastWidth71) > 20) scheduleFit71(80);
    lastWidth71 = w;
  });
})();
