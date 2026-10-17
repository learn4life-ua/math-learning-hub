// Перемикання між інтерактивною 3D-моделлю та навчальним стереометричним кресленням.
// У режимі «Зображення на площині» зберігаються ті самі параметри призми.
(() => {
  let view69 = '3d';

  function injectPlaneStyles69() {
    if (document.getElementById('planeStyles69')) return;
    const style = document.createElement('style');
    style.id = 'planeStyles69';
    style.textContent = `
      #viewSwitch69{position:absolute;z-index:14;top:58px;left:50%;transform:translateX(-50%);display:flex;gap:3px;padding:4px;border-radius:12px;background:rgba(15,23,42,.88);border:1px solid #475569;box-shadow:0 6px 20px rgba(15,23,42,.16)}
      #viewSwitch69 button{min-height:34px;padding:7px 12px;border-radius:9px;font-size:11px;font-weight:800;color:#cbd5e1;white-space:nowrap}
      #viewSwitch69 button.active{background:#fff;color:#115e59;box-shadow:0 2px 8px rgba(15,23,42,.16)}
      #plane69{display:none;position:absolute;inset:0;background:#fcfcfb;overflow:hidden}
      #plane69 .paper-note{position:absolute;top:108px;left:50%;transform:translateX(-50%);z-index:2;padding:5px 10px;border-radius:999px;background:rgba(255,255,255,.94);border:1px solid #e2e8f0;color:#64748b;font-size:10px;font-weight:700;white-space:nowrap}
      #plane69 svg{width:100%;height:100%;display:block}
      .scene-card.plane-mode{background:#fcfcfb;border-color:#cbd5e1}
      .scene-card.plane-mode #canvas3d{visibility:hidden}
      .scene-card.plane-mode #plane69{display:block}
      .scene-card.plane-mode #viewBtns{display:none!important}
      .scene-card.plane-mode #sceneOptionsDesktop>div{background:rgba(255,255,255,.95)!important;border-color:#cbd5e1!important;color:#334155!important;box-shadow:0 4px 14px rgba(15,23,42,.08)}
      .scene-card.plane-mode #sceneOptionsDesktop label{background:#f8fafc!important;color:#334155!important;border:1px solid #e2e8f0}
      @media(max-width:1023px){#viewSwitch69{top:54px;max-width:calc(100% - 24px)}#viewSwitch69 button{font-size:10px;padding:7px 9px}.scene-card.plane-mode #plane69 .paper-note{top:101px}}
      @media(max-width:420px){#viewSwitch69{left:8px;right:8px;transform:none;display:grid;grid-template-columns:1fr 1fr}#viewSwitch69 button{min-width:0;padding:7px 5px}.scene-card.plane-mode #plane69 .paper-note{top:101px;max-width:calc(100% - 28px);overflow:hidden;text-overflow:ellipsis}}
    `;
    document.head.appendChild(style);
  }

  function ensurePlaneUI69() {
    const card = document.querySelector('.scene-card');
    if (!card || document.getElementById('viewSwitch69')) return;

    const sw = document.createElement('div');
    sw.id = 'viewSwitch69';
    sw.setAttribute('aria-label', 'Спосіб зображення призми');
    sw.innerHTML = `
      <button type="button" data-view69="3d" class="active"><i class="fa-solid fa-cube"></i> 3D-модель</button>
      <button type="button" data-view69="plane"><i class="fa-regular fa-pen-to-square"></i> Зображення на площині</button>`;
    card.appendChild(sw);

    const plane = document.createElement('div');
    plane.id = 'plane69';
    plane.innerHTML = '<div class="paper-note">Так призму зображають на площині аркуша</div><svg id="planeSvg69" viewBox="0 0 1000 650" role="img" aria-label="Стереометричне креслення призми"></svg>';
    card.appendChild(plane);

    sw.querySelectorAll('button').forEach(btn => btn.addEventListener('click', () => setPlaneView69(btn.dataset.view69)));
  }

  function setPlaneView69(mode) {
    view69 = mode === 'plane' ? 'plane' : '3d';
    const card = document.querySelector('.scene-card');
    if (!card) return;
    card.classList.toggle('plane-mode', view69 === 'plane');
    document.querySelectorAll('#viewSwitch69 button').forEach(btn => btn.classList.toggle('active', btn.dataset.view69 === view69));
    if (view69 === 'plane') renderPlane69();
    else setTimeout(() => { if (typeof resize === 'function') resize(); }, 30);
  }

  function svgEl69(name, attrs = {}, text = '') {
    const el = document.createElementNS('http://www.w3.org/2000/svg', name);
    Object.entries(attrs).forEach(([k,v]) => el.setAttribute(k, String(v)));
    if (text) el.textContent = text;
    return el;
  }

  function renderPlane69() {
    const svg = document.getElementById('planeSvg69');
    if (!svg || typeof geometry !== 'function') return;

    const G = geometry();
    const st = stage();
    svg.innerHTML = '';

    const defs = svgEl69('defs');
    const pattern = svgEl69('pattern',{id:'paperGrid69',width:28,height:28,patternUnits:'userSpaceOnUse'});
    pattern.appendChild(svgEl69('path',{d:'M 28 0 L 0 0 0 28',fill:'none',stroke:'#eef2f7','stroke-width':1}));
    defs.appendChild(pattern);
    svg.appendChild(defs);
    svg.appendChild(svgEl69('rect',{x:0,y:0,width:1000,height:650,fill:'url(#paperGrid69)'}));

    // Паралельна проєкція, близька до звичного шкільного стереометричного креслення.
    const rawProject = P => ({x:P.x + .52*P.z, y:-P.y + .24*P.z});
    const raw = [...G.bottom,...G.top,G.H].map(rawProject);
    const minX=Math.min(...raw.map(p=>p.x)), maxX=Math.max(...raw.map(p=>p.x));
    const minY=Math.min(...raw.map(p=>p.y)), maxY=Math.max(...raw.map(p=>p.y));
    const usableW=700, usableH=440;
    const sx=usableW/Math.max(maxX-minX,1), sy=usableH/Math.max(maxY-minY,1);
    const scale=Math.min(sx,sy);
    const cx=(minX+maxX)/2, cy=(minY+maxY)/2;
    const P = Q => {
      const r=rawProject(Q);
      return {x:500+(r.x-cx)*scale, y:355+(r.y-cy)*scale};
    };
    const bottom=G.bottom.map(P), top=G.top.map(P), K=P(G.H);

    const letters=['A','B','C','D','E','F','G','H'];
    const line = (A,B,{stroke='#334155',width=3,dash='',opacity=1}={}) => {
      svg.appendChild(svgEl69('line',{
        x1:A.x,y1:A.y,x2:B.x,y2:B.y,stroke,
        'stroke-width':width,'stroke-linecap':'round',
        'stroke-dasharray':dash,opacity
      }));
    };
    const polygon = (pts,{fill='none',stroke='none',opacity=1}={}) => {
      svg.appendChild(svgEl69('polygon',{
        points:pts.map(p=>`${p.x},${p.y}`).join(' '),fill,stroke,opacity
      }));
    };
    const label = (pt,text,{dx=0,dy=0,fill='#0f172a',size=22,weight=700,anchor='middle'}={}) => {
      svg.appendChild(svgEl69('text',{
        x:pt.x+dx,y:pt.y+dy,fill,'font-size':size,
        'font-family':'Arial, sans-serif','font-weight':weight,
        'text-anchor':anchor,'paint-order':'stroke',
        'stroke':'#fff','stroke-width':5,'stroke-linejoin':'round'
      },text));
    };

    // Визначення видимості ребер за видимістю прилеглих граней.
    // Напрям до спостерігача узгоджений з rawProject:
    // x' = x + 0.52z, y' = -y + 0.24z.
    const viewDir = new THREE.Vector3(-.52,.24,1).normalize();
    const all3d=[...G.bottom,...G.top];
    const objectCenter=all3d.reduce((s,p)=>s.add(p),new THREE.Vector3()).multiplyScalar(1/all3d.length);

    const faceFront = pts => {
      if (!pts || pts.length < 3) return false;
      const e1=new THREE.Vector3().subVectors(pts[1],pts[0]);
      const e2=new THREE.Vector3().subVectors(pts[2],pts[0]);
      const normal=new THREE.Vector3().crossVectors(e1,e2);
      if (normal.lengthSq() < 1e-12) return false;

      const faceCenter=pts.reduce((s,p)=>s.add(p),new THREE.Vector3()).multiplyScalar(1/pts.length);
      const outward=faceCenter.clone().sub(objectCenter);
      if (normal.dot(outward) < 0) normal.multiplyScalar(-1);

      return normal.normalize().dot(viewDir) > 1e-7;
    };

    const topFront=faceFront(G.top);
    const bottomFront=faceFront(G.bottom);
    const sideFront=Array.from({length:n},(_,i)=>{
      const j=(i+1)%n;
      return faceFront([G.bottom[i],G.bottom[j],G.top[j],G.top[i]]);
    });

    const bottomEdgeVisible=i => bottomFront || sideFront[i];
    const topEdgeVisible=i => topFront || sideFront[i];
    const lateralEdgeVisible=i => sideFront[(i-1+n)%n] || sideFront[i];

    // Легке виділення основ або бічної грані, якщо відповідний перемикач увімкнено.
    if (C.bases?.checked) {
      polygon(bottom,{fill:'#ede9fe',opacity:.38});
      polygon(top,{fill:'#ede9fe',opacity:.30});
    }
    if (C.face?.checked) polygon([bottom[0],bottom[1],top[1],top[0]],{fill:'#fef3c7',opacity:.52});

    // Ребра креслення: суцільні, якщо ребро належить хоча б одній видимій грані.
    // Якщо обидві прилеглі грані повернуті від спостерігача, ребро невидиме і штрихове.
    for(let i=0;i<n;i++){
      const j=(i+1)%n;
      line(bottom[i],bottom[j],{dash:bottomEdgeVisible(i)?'':'9 8',width:3});
    }
    for(let i=0;i<n;i++){
      const j=(i+1)%n;
      line(top[i],top[j],{dash:topEdgeVisible(i)?'':'9 8',width:3});
    }
    for(let i=0;i<n;i++){
      line(bottom[i],top[i],{dash:lateralEdgeVisible(i)?'':'9 8',width:3});
    }

    // Діагональ призми за запитом.
    if (C.diag?.checked && n>=4) {
      const k=Math.floor(n/2);
      line(bottom[0],top[k],{stroke:'#b45309',width:3,dash:'8 7'});
      const mid={x:(bottom[0].x+top[k].x)/2,y:(bottom[0].y+top[k].y)/2};
      label(mid,'діагональ',{dy:-10,fill:'#92400e',size:17});
    }

    const A=bottom[0], A1=top[0];
    if (st===0) {
      // У похилій призмі показуємо прямокутний трикутник AA₁K.
      if (C.height?.checked) {
        line(A1,K,{stroke:'#e11d48',width:4,dash:'8 6'});
        const mh={x:(A1.x+K.x)/2,y:(A1.y+K.y)/2};
        label(mh,'h',{dx:18,fill:'#be123c',size:20});

        const vx=A1.x-K.x, vy=A1.y-K.y, L=Math.hypot(vx,vy)||1;
        const ux=vx/L, uy=vy/L, px=-uy, py=ux, s=18;
        const p1={x:K.x+ux*s,y:K.y+uy*s};
        const p2={x:p1.x+px*s,y:p1.y+py*s};
        const p3={x:K.x+px*s,y:K.y+py*s};
        svg.appendChild(svgEl69('polyline',{
          points:`${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y}`,
          fill:'none',stroke:'#e11d48','stroke-width':3
        }));
      }

      if (C.height?.checked && C.edge?.checked) {
        line(A,K,{stroke:'#d97706',width:3,dash:'7 6'});
        const md={x:(A.x+K.x)/2,y:(A.y+K.y)/2};
        label(md,'d',{dy:-9,fill:'#a16207',size:19});
      }

      if (C.edge?.checked) {
        line(A,A1,{stroke:'#0284c7',width:4});
        const mb={x:(A.x+A1.x)/2,y:(A.y+A1.y)/2};
        label(mb,'b',{dx:-18,fill:'#0369a1',size:20});
      }

      if (C.height?.checked && C.edge?.checked) {
        const v1={x:K.x-A.x,y:K.y-A.y};
        const v2={x:A1.x-A.x,y:A1.y-A.y};
        const a1=Math.atan2(v1.y,v1.x), a2=Math.atan2(v2.y,v2.x);
        let delta=a2-a1;
        while(delta>Math.PI) delta-=2*Math.PI;
        while(delta<-Math.PI) delta+=2*Math.PI;

        const r=34, steps=20, pts=[];
        for(let i=0;i<=steps;i++){
          const t=a1+delta*i/steps;
          pts.push(`${A.x+r*Math.cos(t)},${A.y+r*Math.sin(t)}`);
        }
        svg.appendChild(svgEl69('polyline',{
          points:pts.join(' '),fill:'none',stroke:'#d97706','stroke-width':3
        }));
        const am=a1+delta/2;
        label({x:A.x+(r+22)*Math.cos(am),y:A.y+(r+22)*Math.sin(am)},'α',{fill:'#92400e',size:20});
      }
      label(K,'K',{dx:17,dy:21,fill:'#be123c',size:21});
    } else if (C.height?.checked || C.edge?.checked) {
      // У прямій та правильній призмі висота збігається з бічним ребром.
      line(A,A1,{stroke:'#0284c7',width:4});
      const m={x:(A.x+A1.x)/2,y:(A.y+A1.y)/2};
      label(m,'h = b',{dx:-29,fill:'#0369a1',size:18});
    }

    // Позначення вершин: показуємо їх завжди у 2D, бо це навчальне креслення.
    for(let i=0;i<n;i++){
      const rb=rawProject(G.bottom[i]);
      const outward={x:rb.x-cx,y:rb.y-cy};
      const L=Math.hypot(outward.x,outward.y)||1;
      const dx=18*outward.x/L, dy=18*outward.y/L;
      const baseText=(i===0&&st>0)?'A = K':letters[i];

      label(bottom[i],baseText,{dx,dy:dy+8,size:20});
      label(top[i],`${letters[i]}₁`,{dx,dy:dy-3,size:20});
      svg.appendChild(svgEl69('circle',{cx:bottom[i].x,cy:bottom[i].y,r:3.6,fill:'#334155'}));
      svg.appendChild(svgEl69('circle',{cx:top[i].x,cy:top[i].y,r:3.6,fill:'#334155'}));
    }

    // Пояснення умовних ліній.
    const legend=svgEl69('g',{});
    legend.appendChild(svgEl69('line',{x1:66,y1:601,x2:122,y2:601,stroke:'#334155','stroke-width':3}));
    legend.appendChild(svgEl69('text',{x:132,y:607,fill:'#475569','font-size':16,'font-family':'Arial, sans-serif'},'видиме ребро'));
    legend.appendChild(svgEl69('line',{x1:274,y1:601,x2:330,y2:601,stroke:'#334155','stroke-width':3,'stroke-dasharray':'9 8'}));
    legend.appendChild(svgEl69('text',{x:340,y:607,fill:'#475569','font-size':16,'font-family':'Arial, sans-serif'},'невидиме ребро'));
    svg.appendChild(legend);
  }

  injectPlaneStyles69();
  ensurePlaneUI69();

  // Перемальовуємо 2D-режим після будь-якої зміни параметрів або стану призми.
  const buildBeforePlane69 = build;
  build = function () {
    buildBeforePlane69();
    if (view69 === 'plane') renderPlane69();
  };

  const updateBeforePlane69 = updateUI;
  updateUI = function () {
    updateBeforePlane69();
    if (view69 === 'plane') renderPlane69();
  };

  ['height','edge','diag','face','bases'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', () => {
      if (view69 === 'plane') renderPlane69();
    });
  });

  document.querySelectorAll('#mobileSceneOptions input').forEach(el =>
    el.addEventListener('change', () =>
      setTimeout(() => { if (view69 === 'plane') renderPlane69(); }, 0)
    )
  );

  window.addEventListener('resize', () => {
    if (view69 === 'plane') renderPlane69();
  });
})();
