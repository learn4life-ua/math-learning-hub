// Додатковий навчальний шар до заняття 70:
// 1) 3D-модель ↔ зображення на площині;
// 2) висота A₁H і проєкція AH для похилого паралелепіпеда;
// 3) коректні підписи величин;
// 4) підсумок тренажера;
// 5) компактна мобільна шапка та узгоджена палітра.
(() => {
  let view70 = '3d';

  function svgEl70(name, attrs = {}, text = '') {
    const el = document.createElementNS('http://www.w3.org/2000/svg', name);
    Object.entries(attrs).forEach(([k,v]) => el.setAttribute(k, String(v)));
    if (text) el.textContent = text;
    return el;
  }

  function injectStyles70() {
    if (document.getElementById('lesson70EnhancementStyles')) return;
    const s = document.createElement('style');
    s.id = 'lesson70EnhancementStyles';
    s.textContent = `
      /* Основна палітра узгоджена із заняттями 69 і 71: teal + slate. */
      body>header{background:#115e59!important}
      body>header #openInstructions,
      body>header .tab-btn:not(.bg-white){background:#134e4a!important;color:#ccfbf1!important}
      body>header .tab-btn.bg-white{color:#115e59!important}
      input[type=range]{accent-color:#0f766e!important}
      #shapeHint{background:#f0fdfa!important;border-color:#99f6e4!important;color:#134e4a!important}
      .shape-btn.bg-indigo-50{background:#f0fdfa!important;border-color:#2dd4bf!important;color:#134e4a!important}
      #panelModel #labelA,#panelModel #labelB,#panelModel #labelC{color:#0f766e!important;background:#f0fdfa!important}
      #quizScore{background:#f0fdfa!important;color:#115e59!important}

      #viewSwitch70{position:absolute;z-index:18;top:60px;left:50%;transform:translateX(-50%);display:flex;gap:3px;padding:4px;border-radius:12px;background:rgba(15,23,42,.9);border:1px solid #475569;box-shadow:0 6px 20px rgba(15,23,42,.18)}
      #viewSwitch70 button{min-height:34px;padding:7px 12px;border:0;border-radius:9px;background:transparent;color:#cbd5e1;font-size:11px;font-weight:800;white-space:nowrap}
      #viewSwitch70 button.active{background:#fff;color:#0f766e;box-shadow:0 2px 8px rgba(15,23,42,.16)}
      #plane70{display:none;position:absolute;inset:0;background:#fcfcfb;overflow:hidden}
      #plane70 svg{display:block;width:100%;height:100%}
      #plane70 .paper-note{position:absolute;z-index:3;top:108px;left:50%;transform:translateX(-50%);padding:5px 10px;border:1px solid #e2e8f0;border-radius:999px;background:rgba(255,255,255,.94);color:#64748b;font-size:10px;font-weight:700;white-space:nowrap}
      .lesson70-plane-mode{background:#fcfcfb!important;border-color:#cbd5e1!important}
      .lesson70-plane-mode #canvas3d{visibility:hidden}
      .lesson70-plane-mode #plane70{display:block}
      .lesson70-plane-mode #sceneViewControls{display:none!important}
      .lesson70-plane-mode #sceneElementControlsWrap>div{background:rgba(255,255,255,.96)!important;border-color:#cbd5e1!important;color:#334155!important}
      .lesson70-plane-mode #sceneElementControlsWrap label{background:#f8fafc!important;color:#334155!important;border:1px solid #e2e8f0}

      @media(max-width:1023px){
        body>header{position:relative!important;z-index:60}
        body>header>div{display:block!important;padding:6px 8px!important}
        body>header>div>div:first-child{gap:7px!important;min-width:0}
        body>header>div>div:first-child>div:first-child{width:32px!important;height:32px!important;border-radius:9px!important;flex:0 0 auto}
        body>header h1{font-size:13.5px!important;line-height:1.15;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:calc(100vw - 58px)}
        body>header p{display:none!important}

        /* П'ять кнопок в один ряд - шапка не забирає третину екрана. */
        body>header nav{display:grid!important;grid-template-columns:repeat(5,minmax(0,1fr))!important;gap:4px!important;margin-top:5px!important;overflow:visible!important;padding:0!important;width:100%}
        body>header nav button{width:100%!important;min-width:0!important;min-height:37px!important;height:37px!important;padding:3px 2px!important;font-size:0!important;line-height:1!important;white-space:nowrap!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:1px!important;border-radius:9px!important}
        body>header nav button i{font-size:11px!important;line-height:1!important}
        body>header nav #openInstructions::after{content:'Інструкція'}
        body>header nav #btnTabModel::after{content:'Модель'}
        body>header nav #btnTabProps::after{content:'Власт.'}
        body>header nav #btnTabTheorem::after{content:'Теорема'}
        body>header nav #btnTabTasks::after{content:'Тренажер'}
        body>header nav button::after{font-size:8.5px!important;font-weight:700;line-height:1.05}

        body>main{height:calc(100dvh - var(--lesson-header-height,84px))!important;padding:5px!important}
        body>main>section{height:100%!important;min-height:0!important}
        body>main>section>div:first-child{height:100%!important;min-height:0!important;border-radius:15px!important}
        #canvas3d{height:100%!important;min-height:0!important;touch-action:none}
        #rectStats{display:none!important}

        #viewSwitch70{top:51px;max-width:calc(100% - 16px)}
        #viewSwitch70 button{font-size:9.5px;padding:6px 8px;min-height:32px}
        #plane70 .paper-note{top:94px}
        #sceneViewControls{top:auto}
      }

      @media(max-width:440px){
        #viewSwitch70{left:7px;right:7px;transform:none;display:grid;grid-template-columns:1fr 1fr}
        #viewSwitch70 button{min-width:0;padding:6px 4px}
        #plane70 .paper-note{max-width:calc(100% - 24px);overflow:hidden;text-overflow:ellipsis}
        body>header nav button::after{font-size:8px!important}
      }
    `;
    document.head.appendChild(s);
  }

  function sceneCard70() {
    return document.getElementById('canvas3d')?.parentElement || null;
  }

  function ensureUI70() {
    const card = sceneCard70();
    if (!card || document.getElementById('viewSwitch70')) return;

    const sw = document.createElement('div');
    sw.id = 'viewSwitch70';
    sw.setAttribute('aria-label','Спосіб зображення паралелепіпеда');
    sw.innerHTML = `
      <button type="button" data-view70="3d" class="active"><i class="fa-solid fa-cube"></i> 3D-модель</button>
      <button type="button" data-view70="plane"><i class="fa-regular fa-pen-to-square"></i> Зображення на площині</button>`;
    card.appendChild(sw);

    const plane = document.createElement('div');
    plane.id = 'plane70';
    plane.innerHTML = '<div class="paper-note">Так паралелепіпед зображають на площині аркуша</div><svg id="planeSvg70" viewBox="0 0 1000 650" role="img" aria-label="Стереометричне креслення паралелепіпеда"></svg>';
    card.appendChild(plane);

    sw.querySelectorAll('button').forEach(btn => btn.addEventListener('click', () => setView70(btn.dataset.view70)));

    if (!document.getElementById('chkHeight70')) {
      const desktop = document.querySelector('#sceneElementControlsWrap > div');
      if (desktop) {
        const lab = document.createElement('label');
        lab.className = 'flex items-center gap-1.5 px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg cursor-pointer';
        lab.innerHTML = '<input type="checkbox" id="chkHeight70" checked><span class="text-pink-300 font-bold">Висота A₁H</span>';
        desktop.prepend(lab);
      }
      const mobile = document.querySelector('#mobileSceneOptions .mobile-scene-grid');
      if (mobile) {
        const lab = document.createElement('label');
        lab.innerHTML = '<input type="checkbox" data-height70 checked><span>Висота A₁H</span>';
        mobile.prepend(lab);
      }
    }
  }

  function setView70(mode) {
    view70 = mode === 'plane' ? 'plane' : '3d';
    const card = sceneCard70();
    if (!card) return;
    card.classList.toggle('lesson70-plane-mode', view70 === 'plane');
    document.querySelectorAll('#viewSwitch70 button').forEach(b => b.classList.toggle('active', b.dataset.view70 === view70));
    if (view70 === 'plane') renderPlane70();
    else requestAnimationFrame(() => typeof onResize === 'function' && onResize());
  }

  function heightOn70() {
    return document.getElementById('chkHeight70')?.checked !== false;
  }

  function addRightAngle3D70(H, towardA, size = .32) {
    const up = new THREE.Vector3(0,1,0);
    const along = towardA.clone().sub(H).setY(0);
    if (along.lengthSq() < 1e-8) along.set(1,0,0);
    along.normalize();
    const p1 = H.clone().addScaledVector(up,size);
    const c = p1.clone().addScaledVector(along,size);
    const p2 = H.clone().addScaledVector(along,size);
    addLine(p1,c,0xfda4af);
    addLine(c,p2,0xfda4af);
  }

  function addHeight3D70() {
    if (!mainGroup || shapeType !== 'general' || !heightOn70()) return;
    const v = getVertices();
    const A = v[0], A1 = v[4];
    const H = new THREE.Vector3(A1.x,0,A1.z);
    addLine(A1,H,0xfb7185,true);
    addLine(A,H,0xf59e0b,true);
    addRightAngle3D70(H,A);

    const dot = new THREE.Mesh(new THREE.SphereGeometry(.11,14,14),new THREE.MeshBasicMaterial({color:0xfb7185}));
    dot.position.copy(H); mainGroup.add(dot);

    const hLab = createTextSprite('A₁H = h','#fda4af',.88);
    hLab.position.copy(new THREE.Vector3().addVectors(A1,H).multiplyScalar(.5)).add(new THREE.Vector3(.45,0,.18));
    mainGroup.add(hLab);
    const pLab = createTextSprite('AH - проєкція','#fbbf24',.82);
    pLab.position.copy(new THREE.Vector3().addVectors(A,H).multiplyScalar(.5)).add(new THREE.Vector3(0,.26,.12));
    mainGroup.add(pLab);
    const HLab = createTextSprite('H','#fda4af',.72);
    HLab.position.copy(H).add(new THREE.Vector3(.18,.28,.12));
    mainGroup.add(HLab);
  }

  function relabelStats70() {
    const cards = Array.from(document.querySelectorAll('#rectStats > div'));
    if (cards.length < 4) return;
    const titles = cards.map(c => c.querySelector('div:first-child'));
    const rectangular = shapeType === 'rect' || shapeType === 'cube';
    if (rectangular) {
      if (titles[0]) titles[0].textContent = 'Вимір a';
      if (titles[1]) titles[1].textContent = 'Вимір b';
      if (titles[2]) titles[2].textContent = 'Вимір c';
    } else {
      if (titles[0]) titles[0].textContent = 'Ребро AB';
      if (titles[1]) titles[1].textContent = 'Ребро AD';
      if (titles[2]) titles[2].textContent = shapeType === 'general' ? 'Бічне ребро AA₁' : 'AA₁ = h';
    }
  }

  function renderPlane70() {
    const svg = document.getElementById('planeSvg70');
    if (!svg) return;
    const v = getVertices();
    svg.innerHTML = '';

    const defs = svgEl70('defs');
    const pat = svgEl70('pattern',{id:'grid70',width:28,height:28,patternUnits:'userSpaceOnUse'});
    pat.appendChild(svgEl70('path',{d:'M 28 0 L 0 0 0 28',fill:'none',stroke:'#eef2f7','stroke-width':1}));
    defs.appendChild(pat); svg.appendChild(defs);
    svg.appendChild(svgEl70('rect',{x:0,y:0,width:1000,height:650,fill:'url(#grid70)'}));

    const rawProject = P => ({x:P.x+.52*P.z,y:-P.y+.24*P.z});
    const raw = v.map(rawProject);
    if (shapeType === 'general') raw.push(rawProject(new THREE.Vector3(v[4].x,0,v[4].z)));
    const minX=Math.min(...raw.map(p=>p.x)),maxX=Math.max(...raw.map(p=>p.x));
    const minY=Math.min(...raw.map(p=>p.y)),maxY=Math.max(...raw.map(p=>p.y));
    const scale=Math.min(710/Math.max(maxX-minX,1),440/Math.max(maxY-minY,1));
    const cx=(minX+maxX)/2,cy=(minY+maxY)/2;
    const P = Q => {const r=rawProject(Q);return{x:500+(r.x-cx)*scale,y:355+(r.y-cy)*scale}};
    const q=v.map(P);

    const line=(A,B,{stroke='#334155',width=3,dash='',opacity=1}={})=>svg.appendChild(svgEl70('line',{x1:A.x,y1:A.y,x2:B.x,y2:B.y,stroke,'stroke-width':width,'stroke-linecap':'round','stroke-dasharray':dash,opacity}));
    const label=(pt,text,{dx=0,dy=0,fill='#0f172a',size=21}={})=>svg.appendChild(svgEl70('text',{x:pt.x+dx,y:pt.y+dy,fill,'font-size':size,'font-family':'Arial, sans-serif','font-weight':700,'text-anchor':'middle','paint-order':'stroke',stroke:'#fff','stroke-width':5,'stroke-linejoin':'round'},text));
    const polygon=(pts,fill,opacity=.3)=>svg.appendChild(svgEl70('polygon',{points:pts.map(p=>`${p.x},${p.y}`).join(' '),fill,opacity}));

    const faces=[[0,3,2,1],[4,5,6,7],[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7]];
    const center=v.reduce((s,p)=>s.add(p),new THREE.Vector3()).multiplyScalar(1/8);
    const viewDir=new THREE.Vector3(-.52,.24,1).normalize();
    const faceFront=idxs=>{
      const pts=idxs.map(i=>v[i]);
      const e1=new THREE.Vector3().subVectors(pts[1],pts[0]);
      const e2=new THREE.Vector3().subVectors(pts[2],pts[0]);
      const nrm=new THREE.Vector3().crossVectors(e1,e2);
      if(nrm.lengthSq()<1e-10)return false;
      const fc=pts.reduce((s,p)=>s.add(p),new THREE.Vector3()).multiplyScalar(1/pts.length);
      if(nrm.dot(fc.clone().sub(center))<0)nrm.multiplyScalar(-1);
      return nrm.normalize().dot(viewDir)>1e-7;
    };
    const front=faces.map(faceFront);
    const edges=[
      [0,1,[0,2]],[1,2,[0,3]],[2,3,[0,4]],[3,0,[0,5]],
      [4,5,[1,2]],[5,6,[1,3]],[6,7,[1,4]],[7,4,[1,5]],
      [0,4,[2,5]],[1,5,[2,3]],[2,6,[3,4]],[3,7,[4,5]]
    ];

    if (document.getElementById('chkOppFaces')?.checked) {
      polygon([q[0],q[1],q[5],q[4]],'#99f6e4',.32);
      polygon([q[2],q[3],q[7],q[6]],'#a7f3d0',.24);
    }

    edges.forEach(([i,j,fs])=>line(q[i],q[j],{dash:(front[fs[0]]||front[fs[1]])?'':'9 8'}));

    if (document.getElementById('chkAllDiags')?.checked) {
      [[0,6],[1,7],[2,4],[3,5]].forEach((e,i)=>line(q[e[0]],q[e[1]],{stroke:i===0?'#e11d48':'#d97706',width:2.8,dash:'8 7'}));
      const O={x:(q[0].x+q[6].x)/2,y:(q[0].y+q[6].y)/2};
      svg.appendChild(svgEl70('circle',{cx:O.x,cy:O.y,r:5,fill:'#d97706'})); label(O,'O',{dx:15,dy:-10,fill:'#92400e'});
    } else if (document.getElementById('chkMainDiag')?.checked && (shapeType==='rect'||shapeType==='cube')) {
      line(q[0],q[6],{stroke:'#e11d48',width:3});
      const m={x:(q[0].x+q[6].x)/2,y:(q[0].y+q[6].y)/2}; label(m,'d',{dy:-10,fill:'#be123c'});
    }

    if (activeMode==='theorem' && (shapeType==='rect'||shapeType==='cube')) {
      line(q[0],q[2],{stroke:'#0891b2',width:3});
      line(q[2],q[6],{stroke:'#059669',width:3});
      line(q[0],q[6],{stroke:'#e11d48',width:3});
      label({x:(q[0].x+q[2].x)/2,y:(q[0].y+q[2].y)/2},'AC',{dy:16,fill:'#0e7490',size:18});
      label({x:(q[2].x+q[6].x)/2,y:(q[2].y+q[6].y)/2},'CC₁',{dx:23,fill:'#047857',size:18});
      label({x:(q[0].x+q[6].x)/2,y:(q[0].y+q[6].y)/2},'AC₁',{dx:-24,fill:'#be123c',size:18});
    }

    if (shapeType==='general' && heightOn70()) {
      const H3=new THREE.Vector3(v[4].x,0,v[4].z),H=P(H3),A=q[0],A1=q[4];
      line(A1,H,{stroke:'#e11d48',width:3.5,dash:'8 6'});
      line(A,H,{stroke:'#d97706',width:3,dash:'7 6'});
      const u={x:(A1.x-H.x),y:(A1.y-H.y)},L=Math.hypot(u.x,u.y)||1,ux=u.x/L,uy=u.y/L;
      const w={x:A.x-H.x,y:A.y-H.y},WL=Math.hypot(w.x,w.y)||1,vx=w.x/WL,vy=w.y/WL,s=17;
      const p1={x:H.x+ux*s,y:H.y+uy*s},c={x:p1.x+vx*s,y:p1.y+vy*s},p2={x:H.x+vx*s,y:H.y+vy*s};
      svg.appendChild(svgEl70('polyline',{points:`${p1.x},${p1.y} ${c.x},${c.y} ${p2.x},${p2.y}`,fill:'none',stroke:'#e11d48','stroke-width':3}));
      label(H,'H',{dx:17,dy:21,fill:'#be123c'});
      label({x:(A1.x+H.x)/2,y:(A1.y+H.y)/2},'h',{dx:16,fill:'#be123c',size:18});
      label({x:(A.x+H.x)/2,y:(A.y+H.y)/2},'AH',{dy:-10,fill:'#a16207',size:18});
    }

    const letters=['A','B','C','D','A₁','B₁','C₁','D₁'];
    const pc={x:q.reduce((s,p)=>s+p.x,0)/8,y:q.reduce((s,p)=>s+p.y,0)/8};
    q.forEach((pt,i)=>{
      const dx=pt.x-pc.x,dy=pt.y-pc.y,L=Math.hypot(dx,dy)||1;
      svg.appendChild(svgEl70('circle',{cx:pt.x,cy:pt.y,r:3.5,fill:'#334155'}));
      label(pt,letters[i],{dx:18*dx/L,dy:18*dy/L+5,size:20});
    });

    const legend=svgEl70('g');
    legend.appendChild(svgEl70('line',{x1:62,y1:605,x2:118,y2:605,stroke:'#334155','stroke-width':3}));
    legend.appendChild(svgEl70('text',{x:128,y:611,fill:'#475569','font-size':16,'font-family':'Arial, sans-serif'},'видиме ребро'));
    legend.appendChild(svgEl70('line',{x1:275,y1:605,x2:331,y2:605,stroke:'#334155','stroke-width':3,'stroke-dasharray':'9 8'}));
    legend.appendChild(svgEl70('text',{x:341,y:611,fill:'#475569','font-size':16,'font-family':'Arial, sans-serif'},'невидиме ребро'));
    svg.appendChild(legend);
  }

  function summary70() {
    const card=document.getElementById('taskCard');
    if(!card)return;
    const pct=Math.round((scoreCorrect/taskPool.length)*100);
    card.innerHTML=`<div class="p-4 rounded-xl border border-teal-200 bg-teal-50 text-center space-y-2"><div class="text-xs uppercase tracking-wider font-bold text-teal-700">Підсумок</div><div class="text-3xl font-extrabold text-teal-800">${scoreCorrect} / ${taskPool.length}</div><p class="text-xs text-slate-700">${pct>=80?'Матеріал засвоєно впевнено.':pct>=60?'Основне зрозуміло. Варто повторити завдання з помилками.':'Повернися до властивостей і теореми, а потім спробуй ще раз.'}</p><button id="restart70" class="mt-2 px-4 py-2 rounded-xl bg-teal-700 text-white text-xs font-bold">Пройти ще раз</button></div>`;
    document.getElementById('restart70').onclick=()=>{scoreCorrect=0;scoreTotal=0;currentTaskIndex=0;document.getElementById('quizScore').textContent='0 / 0';card.innerHTML='<div class="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs"><div class="font-bold text-teal-900 mb-1" id="taskNumber"></div><p id="taskQuestion" class="leading-relaxed text-slate-800"></p></div><div class="space-y-1.5" id="taskOptions"></div><div id="taskFeedback" class="hidden p-3 rounded-xl text-xs font-medium"></div><button id="btnNextTask" class="w-full py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 opacity-50 pointer-events-none"><span>Наступне завдання</span><i class="fa-solid fa-arrow-right"></i></button>';bindNext70();loadTask(0)};
  }

  function bindNext70(){
    const btn=document.getElementById('btnNextTask');
    if(!btn)return;
    btn.onclick=()=>{if(currentTaskIndex<taskPool.length-1)loadTask(currentTaskIndex+1);else summary70()};
  }

  function fitMobileCamera70() {
    if (!camera || !controls || !window.matchMedia('(max-width:1023px)').matches) return;
    camera.position.set(8.4,6.6,9.6);
    camera.zoom = 1.08;
    camera.updateProjectionMatrix();
    controls.target.set(0, Math.max(1.6, paramC * .38), 0);
    controls.update();
    if (typeof onResize === 'function') onResize();
  }

  function bindReset70() {
    const reset=document.getElementById('btnReset');
    if(!reset)return;
    reset.onclick=()=>{
      if(window.matchMedia('(max-width:1023px)').matches){
        fitMobileCamera70();
      } else {
        camera.zoom=1;
        camera.position.set(11,9,13);
        controls.target.set(0,paramC/2,0);
        camera.updateProjectionMatrix();
        controls.update();
      }
    };
  }

  const originalBuild70=buildModel;
  buildModel=function(){originalBuild70();addHeight3D70();relabelStats70();if(view70==='plane')renderPlane70()};

  const originalCalc70=updateCalculations;
  updateCalculations=function(){originalCalc70();relabelStats70()};

  const originalSync70=syncControls;
  syncControls=function(){originalSync70();relabelStats70();if(view70==='plane')renderPlane70()};

  const originalMode70=setMode;
  setMode=function(m){originalMode70(m);if(view70==='plane')renderPlane70()};

  injectStyles70();
  ensureUI70();

  document.addEventListener('DOMContentLoaded',()=>{
    ensureUI70();
    bindNext70();
    bindReset70();
    const h=document.getElementById('chkHeight70');
    const hm=document.querySelector('[data-height70]');
    h?.addEventListener('change',()=>{if(hm)hm.checked=h.checked;buildModel()});
    hm?.addEventListener('change',()=>{if(h)h.checked=hm.checked;buildModel()});
    document.querySelectorAll('#sceneElementControlsWrap input,#mobileSceneOptions input').forEach(x=>x.addEventListener('change',()=>{if(view70==='plane')setTimeout(renderPlane70,0)}));
    relabelStats70();
    requestAnimationFrame(()=>requestAnimationFrame(fitMobileCamera70));
  });

  window.addEventListener('resize',()=>{if(view70==='plane')renderPlane70()});
})();