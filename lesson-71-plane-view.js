// Заняття 71: навчальне креслення на площині, буквені позначення основи
// та методично коректні числові показники для трьох станів піраміди.
(() => {
  let view71 = '3d';
  // H зарезервовано для основи висоти, тому у восьмикутній основі після G використовуємо K.
  const letters71 = ['A','B','C','D','E','F','G','K'];

  function svgEl71(name, attrs = {}, text = '') {
    const el = document.createElementNS('http://www.w3.org/2000/svg', name);
    Object.entries(attrs).forEach(([k,v]) => el.setAttribute(k,String(v)));
    if (text) el.textContent = text;
    return el;
  }

  function injectStyles71() {
    if ($('planeStyles71')) return;
    const s=document.createElement('style');
    s.id='planeStyles71';
    s.textContent=`
      #viewSwitch71{position:absolute;z-index:18;top:58px;left:50%;transform:translateX(-50%);display:flex;gap:3px;padding:4px;border-radius:12px;background:rgba(15,23,42,.9);border:1px solid #475569;box-shadow:0 6px 20px rgba(15,23,42,.18)}
      #viewSwitch71 button{min-height:34px;padding:7px 12px;border:0;border-radius:9px;background:transparent;color:#cbd5e1;font-size:11px;font-weight:800;white-space:nowrap}
      #viewSwitch71 button.active{background:#fff;color:#0f766e;box-shadow:0 2px 8px rgba(15,23,42,.16)}
      #plane71{display:none;position:absolute;inset:0;background:#fcfcfb;overflow:hidden}
      #plane71 svg{display:block;width:100%;height:100%}
      #plane71 .paper-note{position:absolute;z-index:3;top:106px;left:50%;transform:translateX(-50%);padding:5px 10px;border:1px solid #e2e8f0;border-radius:999px;background:rgba(255,255,255,.94);color:#64748b;font-size:10px;font-weight:700;white-space:nowrap}
      .lesson71-plane-mode{background:#fcfcfb!important;border-color:#cbd5e1!important}
      .lesson71-plane-mode #canvas3d{visibility:hidden}
      .lesson71-plane-mode #plane71{display:block}
      .lesson71-plane-mode #viewBtns{display:none!important}
      .lesson71-plane-mode #sceneOptionsDesktop>div{background:rgba(255,255,255,.96)!important;border-color:#cbd5e1!important;color:#334155!important}
      .lesson71-plane-mode #sceneOptionsDesktop label{background:#f8fafc!important;color:#334155!important;border:1px solid #e2e8f0}
      @media(max-width:1023px){#viewSwitch71{top:54px;max-width:calc(100% - 20px)}#viewSwitch71 button{font-size:10px;padding:7px 9px}#plane71 .paper-note{top:100px}}
      @media(max-width:440px){#viewSwitch71{left:8px;right:8px;transform:none;display:grid;grid-template-columns:1fr 1fr}#viewSwitch71 button{min-width:0;padding:7px 5px}#plane71 .paper-note{max-width:calc(100% - 28px);overflow:hidden;text-overflow:ellipsis}}
    `;
    document.head.appendChild(s);
  }

  function sceneCard71(){return C.canvas3d?.parentElement||null}

  function ensureUI71(){
    const card=sceneCard71();
    if(!card||$('viewSwitch71'))return;
    const sw=document.createElement('div');
    sw.id='viewSwitch71';
    sw.setAttribute('aria-label','Спосіб зображення піраміди');
    sw.innerHTML='<button type="button" data-view71="3d" class="active"><i class="fa-solid fa-cube"></i> 3D-модель</button><button type="button" data-view71="plane"><i class="fa-regular fa-pen-to-square"></i> Зображення на площині</button>';
    card.appendChild(sw);
    const plane=document.createElement('div');
    plane.id='plane71';
    plane.innerHTML='<div class="paper-note">Так піраміду зображають на площині аркуша · схематично, не в масштабі</div><svg id="planeSvg71" viewBox="0 0 1000 650" role="img" aria-label="Стереометричне креслення піраміди"></svg>';
    card.appendChild(plane);
    sw.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>setView71(b.dataset.view71)));
  }

  function setView71(mode71){
    view71=mode71==='plane'?'plane':'3d';
    const card=sceneCard71(); if(!card)return;
    card.classList.toggle('lesson71-plane-mode',view71==='plane');
    document.querySelectorAll('#viewSwitch71 button').forEach(b=>b.classList.toggle('active',b.dataset.view71===view71));
    if(view71==='plane')renderPlane71(); else requestAnimationFrame(()=>resize());
  }

  function baseLabelSprite71(text,color='#f8fafc'){
    const cv=document.createElement('canvas');cv.width=128;cv.height=96;
    const x=cv.getContext('2d');x.font='700 42px Arial';x.textAlign='center';x.textBaseline='middle';x.lineWidth=7;x.strokeStyle='rgba(15,23,42,.92)';x.strokeText(text,64,48);x.fillStyle=color;x.fillText(text,64,48);
    const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(cv),transparent:true,depthTest:false,depthWrite:false}));
    const compact=matchMedia('(max-width:520px)').matches;
    sp.scale.set(compact ? .62 : .76, compact ? .47 : .57, 1);
    sp.renderOrder=20;
    return sp;
  }

  function addBaseLabels3D71(){
    if(!group)return;
    const G=geom();
    for(let i=0;i<n;i++){
      point(G.base[i],0xe2e8f0,.065);
      const s=baseLabelSprite71(letters71[i]||String(i+1));
      const out=G.base[i].clone().setY(0);
      if(out.lengthSq()<1e-8)out.set(1,0,1);
      out.normalize().multiplyScalar(matchMedia('(max-width:520px)').matches ? .24 : .34);
      s.position.copy(G.base[i]).add(out).add(new THREE.Vector3(0,.14,0));
      group.add(s);
    }
  }

  function applyMethodicalStats71(G=geom()){
    const st=currentStage();
    const P=polygonPerimeter(G.base),Sbase=polygonAreaXZ(G.base);let Sb=0;
    for(let i=0;i<n;i++)Sb+=triArea(G.base[i],G.base[(i+1)%n],G.apex);
    const St=Sb+Sbase;
    C.statL.textContent=regular()?`${G.l.toFixed(2).replace('.',',')} см`:'—';
    if(st===0){
      C.statP.textContent='—';C.statLat.textContent='ΣSᵢ';C.statTotal.textContent='Sбіч + Sосн';
      C.calc.innerHTML='Для довільної піраміди числові площі не визначаємо за моделлю без заданих довжин усіх потрібних елементів. S<sub>біч</sub>=S₁+S₂+…+Sₙ; S<sub>повн</sub>=S<sub>біч</sub>+S<sub>осн</sub>.';
    }else if(st===1){
      C.statP.textContent=`${P.toFixed(0).replace('.',',')} см`;C.statLat.textContent='ΣSᵢ';C.statTotal.textContent='Sбіч + Sосн';
      C.calc.innerHTML=`P<sub>осн</sub>=${P.toFixed(0)} см. Основа вже правильна, але піраміда ще не правильна, тому S<sub>біч</sub>=S₁+S₂+…+Sₙ. Формулу ½P·l ще не застосовуємо.`;
    }else{
      C.statP.textContent=`${P.toFixed(0).replace('.',',')} см`;C.statLat.textContent=`${Sb.toFixed(2).replace('.',',')} см²`;C.statTotal.textContent=`${St.toFixed(2).replace('.',',')} см²`;
      C.calc.innerHTML=`P=${P.toFixed(0)}; ON≈${G.r.toFixed(2).replace('.',',')}; l≈${G.l.toFixed(2).replace('.',',')}; S<sub>біч</sub>=½P·l≈${Sb.toFixed(2).replace('.',',')} см²; S<sub>повн</sub>≈${St.toFixed(2).replace('.',',')} см²`;
    }
    const name={3:'трикутною',4:'чотирикутною',5:'п’ятикутною',6:'шестикутною',7:'семикутною',8:'восьмикутною'}[n];
    if(st===0)C.badge.textContent=`Піраміда з довільною ${name} основою`;
  }

  function renderPlane71(){
    const svg=$('planeSvg71');if(!svg)return;const G=geom(),st=currentStage();svg.innerHTML='';
    const defs=svgEl71('defs'),pat=svgEl71('pattern',{id:'grid71',width:28,height:28,patternUnits:'userSpaceOnUse'});pat.appendChild(svgEl71('path',{d:'M 28 0 L 0 0 0 28',fill:'none',stroke:'#eef2f7','stroke-width':1}));defs.appendChild(pat);svg.appendChild(defs);svg.appendChild(svgEl71('rect',{x:0,y:0,width:1000,height:650,fill:'url(#grid71)'}));

    const rawProject=P=>({x:P.x+.52*P.z,y:-P.y+.24*P.z});
    const raw=[...G.base.map(rawProject),rawProject(G.apex),rawProject(G.H)];if(baseIsRegular())raw.push(rawProject(G.O));if(regular())raw.push(rawProject(G.N));
    const minX=Math.min(...raw.map(p=>p.x)),maxX=Math.max(...raw.map(p=>p.x)),minY=Math.min(...raw.map(p=>p.y)),maxY=Math.max(...raw.map(p=>p.y));
    const scale=Math.min(710/Math.max(maxX-minX,1),440/Math.max(maxY-minY,1)),cx=(minX+maxX)/2,cy=(minY+maxY)/2;
    const P=Q=>{const r=rawProject(Q);return{x:500+(r.x-cx)*scale,y:355+(r.y-cy)*scale}};
    const b=G.base.map(P),M=P(G.apex),H=P(G.H),O=P(G.O),N=P(G.N);
    const line=(A,B,{stroke='#334155',width=3,dash='',opacity=1}={})=>svg.appendChild(svgEl71('line',{x1:A.x,y1:A.y,x2:B.x,y2:B.y,stroke,'stroke-width':width,'stroke-linecap':'round','stroke-dasharray':dash,opacity}));
    const label=(pt,text,{dx=0,dy=0,fill='#0f172a',size=21}={})=>svg.appendChild(svgEl71('text',{x:pt.x+dx,y:pt.y+dy,fill,'font-size':size,'font-family':'Arial, sans-serif','font-weight':700,'text-anchor':'middle','paint-order':'stroke',stroke:'#fff','stroke-width':5,'stroke-linejoin':'round'},text));
    const polygon=(pts,fill,opacity=.3)=>svg.appendChild(svgEl71('polygon',{points:pts.map(p=>`${p.x},${p.y}`).join(' '),fill,opacity}));
    const rightMark=(origin,A,B,color='#334155',size=17)=>{
      const u={x:A.x-origin.x,y:A.y-origin.y},v={x:B.x-origin.x,y:B.y-origin.y};
      const lu=Math.hypot(u.x,u.y)||1,lv=Math.hypot(v.x,v.y)||1;
      u.x/=lu;u.y/=lu;v.x/=lv;v.y/=lv;
      const p1={x:origin.x+u.x*size,y:origin.y+u.y*size};
      const c={x:p1.x+v.x*size,y:p1.y+v.y*size};
      const p2={x:origin.x+v.x*size,y:origin.y+v.y*size};
      svg.appendChild(svgEl71('polyline',{points:`${p1.x},${p1.y} ${c.x},${c.y} ${p2.x},${p2.y}`,fill:'none',stroke:color,'stroke-width':3,'stroke-linejoin':'round'}));
    };

    const all3=[...G.base,G.apex],center=all3.reduce((s,p)=>s.add(p),new THREE.Vector3()).multiplyScalar(1/all3.length),viewDir=new THREE.Vector3(-.52,.24,1).normalize();
    const faceFront=pts=>{const e1=new THREE.Vector3().subVectors(pts[1],pts[0]),e2=new THREE.Vector3().subVectors(pts[2],pts[0]),nr=new THREE.Vector3().crossVectors(e1,e2);if(nr.lengthSq()<1e-10)return false;const fc=pts.reduce((s,p)=>s.add(p),new THREE.Vector3()).multiplyScalar(1/pts.length);if(nr.dot(fc.clone().sub(center))<0)nr.multiplyScalar(-1);return nr.normalize().dot(viewDir)>1e-7};
    const baseFront=faceFront([...G.base].reverse()),sideFront=Array.from({length:n},(_,i)=>faceFront([G.base[i],G.base[(i+1)%n],G.apex]));

    if(C.base?.checked)polygon(b,'#c4b5fd',.32);if(C.face?.checked)polygon([b[0],b[1],M],'#fde68a',.46);
    for(let i=0;i<n;i++){const j=(i+1)%n;line(b[i],b[j],{dash:(baseFront||sideFront[i])?'':'9 8'});line(b[i],M,{dash:(sideFront[(i-1+n)%n]||sideFront[i])?'':'9 8'});}

    if(C.height?.checked){
      line(M,H,{stroke:'#e11d48',width:3.5,dash:'8 6'});
      if(regular()){
        if(C.radius?.checked) rightMark(H,M,N,'#e11d48',17);
      }else{
        const q={x:b[0].x-H.x,y:b[0].y-H.y},ql=Math.hypot(q.x,q.y)||1;
        q.x/=ql;q.y/=ql;
        const guide={x:H.x+q.x*68,y:H.y+q.y*68};
        line(H,guide,{stroke:'#d97706',width:2,dash:'6 6',opacity:.72});
        rightMark(H,M,guide,'#e11d48',17);
      }
      label({x:(M.x+H.x)/2,y:(M.y+H.y)/2},regular()?'MO = h':'MH = h',{dx:20,fill:'#be123c',size:18});
    }

    if(st<2){label(H,'H',{dx:17,dy:21,fill:'#b45309'});}
    if(baseIsRegular()){
      svg.appendChild(svgEl71('circle',{cx:O.x,cy:O.y,r:4.5,fill:'#059669'}));
      if(st===1)line(H,O,{stroke:'#d97706',width:2.6,dash:'7 6'});
      label(O,regular()?'O = H':'O',{dx:-18,dy:18,fill:'#047857',size:19});
    }
    if(regular()&&C.apothem?.checked){
      line(M,N,{stroke:'#0891b2',width:3});
      label({x:(M.x+N.x)/2,y:(M.y+N.y)/2},'MN = l',{dx:-24,fill:'#0e7490',size:18});
      rightMark(N,M,b[0],'#0891b2',15);
    }
    if(regular()&&C.radius?.checked){line(O,N,{stroke:'#059669',width:2.6,dash:'7 6'});label({x:(O.x+N.x)/2,y:(O.y+N.y)/2},'ON',{dy:-10,fill:'#047857',size:17});}
    if(regular()&&(C.apothem?.checked||C.radius?.checked)){svg.appendChild(svgEl71('circle',{cx:N.x,cy:N.y,r:4,fill:'#0891b2'}));label(N,'N',{dx:15,dy:18,fill:'#0e7490',size:18});}

    const pc={x:b.reduce((s,p)=>s+p.x,0)/n,y:b.reduce((s,p)=>s+p.y,0)/n};
    b.forEach((pt,i)=>{const dx=pt.x-pc.x,dy=pt.y-pc.y,L=Math.hypot(dx,dy)||1;svg.appendChild(svgEl71('circle',{cx:pt.x,cy:pt.y,r:3.5,fill:'#334155'}));label(pt,letters71[i],{dx:18*dx/L,dy:18*dy/L+5,size:20});});
    svg.appendChild(svgEl71('circle',{cx:M.x,cy:M.y,r:4.5,fill:'#0f172a'}));label(M,'M',{dx:0,dy:-16,size:21});

    const legend=svgEl71('g');legend.appendChild(svgEl71('line',{x1:62,y1:605,x2:118,y2:605,stroke:'#334155','stroke-width':3}));legend.appendChild(svgEl71('text',{x:128,y:611,fill:'#475569','font-size':16,'font-family':'Arial, sans-serif'},'видиме ребро'));legend.appendChild(svgEl71('line',{x1:275,y1:605,x2:331,y2:605,stroke:'#334155','stroke-width':3,'stroke-dasharray':'9 8'}));legend.appendChild(svgEl71('text',{x:341,y:611,fill:'#475569','font-size':16,'font-family':'Arial, sans-serif'},'невидиме ребро'));svg.appendChild(legend);
  }

  const oldBuild71=build;
  build=function(){oldBuild71();addBaseLabels3D71();applyMethodicalStats71();if(view71==='plane')renderPlane71()};
  const oldCalc71=calc;
  calc=function(G=geom()){oldCalc71(G);applyMethodicalStats71(G)};
  const oldUpdate71=updateUI;
  updateUI=function(){oldUpdate71();const st=currentStage();const near=$('vertexNearCenter');if(near)near.textContent=st===0?'Менше зміщення':'Ближче до O';applyMethodicalStats71();if(view71==='plane')renderPlane71()};

  injectStyles71();
  document.addEventListener('DOMContentLoaded',()=>{
    ensureUI71();
    document.querySelectorAll('#sceneOptionsDesktop input,#mobileSceneOptions input').forEach(x=>x.addEventListener('change',()=>{if(view71==='plane')setTimeout(renderPlane71,0)}));
    applyMethodicalStats71();
  });
  window.addEventListener('resize',()=>{if(view71==='plane')renderPlane71()});
})();