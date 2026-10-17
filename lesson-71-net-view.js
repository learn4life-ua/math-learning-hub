// Заняття 71: інтерактивна розгортка поверхні піраміди.
// Працює поверх уже наявних режимів 3D-моделі та зображення на площині.
(() => {
  const LETTERS_71_NET = ['A','B','C','D','E','F','G','K'];
  let netProgress71 = 1;

  const svgNS71 = 'http://www.w3.org/2000/svg';
  const svg71 = (name, attrs = {}, text = '') => {
    const el = document.createElementNS(svgNS71, name);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, String(v)));
    if (text) el.textContent = text;
    return el;
  };

  function card71Net() {
    return document.getElementById('canvas3d')?.parentElement || null;
  }

  function injectNetStyles71() {
    if (document.getElementById('netStyles71')) return;
    const style = document.createElement('style');
    style.id = 'netStyles71';
    style.textContent = `
      #net71{display:none;position:absolute;inset:0;background:#fcfcfb;overflow:hidden;z-index:4}
      #net71 svg{display:block;width:100%;height:100%}
      #net71Controls{position:absolute;z-index:7;left:50%;top:108px;transform:translateX(-50%);display:flex;align-items:center;gap:9px;padding:7px 11px;border:1px solid #cbd5e1;border-radius:12px;background:rgba(255,255,255,.96);box-shadow:0 5px 16px rgba(15,23,42,.10);color:#334155;font-size:10.5px;font-weight:700;white-space:nowrap}
      #net71Controls input{width:130px;accent-color:#0f766e}
      #net71Info{position:absolute;z-index:7;left:18px;right:18px;bottom:18px;display:flex;justify-content:center;pointer-events:none}
      #net71Info>div{max-width:760px;padding:8px 12px;border:1px solid #cbd5e1;border-radius:12px;background:rgba(255,255,255,.95);box-shadow:0 4px 14px rgba(15,23,42,.08);font-size:11px;line-height:1.45;color:#334155;text-align:center}
      .lesson71-net-mode{background:#fcfcfb!important;border-color:#cbd5e1!important}
      .lesson71-net-mode #canvas3d{visibility:hidden}
      .lesson71-net-mode #plane71{display:none!important}
      .lesson71-net-mode #net71{display:block}
      .lesson71-net-mode #viewBtns,.lesson71-net-mode #sceneOptionsDesktop{display:none!important}
      #viewSwitch71 button[data-view71="net"]{color:#cbd5e1}
      #viewSwitch71 button[data-view71="net"].active{background:#fff;color:#0f766e;box-shadow:0 2px 8px rgba(15,23,42,.16)}
      @media(max-width:1023px){
        #net71Controls{top:100px;max-width:calc(100% - 18px);padding:6px 8px;gap:6px}
        #net71Controls input{width:92px}
        #net71Info{left:9px;right:9px;bottom:10px}
        #net71Info>div{font-size:10px;padding:7px 9px}
      }
      @media(max-width:440px){
        #viewSwitch71{grid-template-columns:repeat(3,minmax(0,1fr))!important}
        #viewSwitch71 button{font-size:9px!important;padding:6px 3px!important}
        #net71Controls{top:96px;font-size:9px}
        #net71Controls input{width:72px}
      }
    `;
    document.head.appendChild(style);
  }

  function ensureNetUI71() {
    const card = card71Net();
    const sw = document.getElementById('viewSwitch71');
    if (!card || !sw) return false;

    if (!sw.querySelector('[data-view71="net"]')) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.dataset.view71 = 'net';
      btn.innerHTML = '<i class="fa-solid fa-diagram-project"></i> Розгортка';
      sw.appendChild(btn);
      btn.addEventListener('click', () => activateNet71());
    }

    if (!document.getElementById('net71')) {
      const wrap = document.createElement('div');
      wrap.id = 'net71';
      wrap.innerHTML = `
        <div id="net71Controls">
          <span><i class="fa-solid fa-layer-group"></i> Розгортання</span>
          <input id="net71Range" type="range" min="0" max="100" step="1" value="100" aria-label="Ступінь розгортання">
          <span id="net71Value">100%</span>
        </div>
        <svg id="netSvg71" viewBox="0 0 1000 650" role="img" aria-label="Розгортка поверхні піраміди"></svg>
        <div id="net71Info"><div></div></div>`;
      card.appendChild(wrap);

      const range = document.getElementById('net71Range');
      range.addEventListener('input', () => {
        netProgress71 = (+range.value || 0) / 100;
        document.getElementById('net71Value').textContent = `${range.value}%`;
        renderNet71();
      });
    }

    // Коли користувач переходить назад у 3D або креслення, прибираємо net-клас.
    sw.querySelectorAll('button:not([data-view71="net"])').forEach(btn => {
      if (btn.dataset.netClearReady71) return;
      btn.dataset.netClearReady71 = '1';
      btn.addEventListener('click', () => {
        card.classList.remove('lesson71-net-mode');
        sw.querySelector('[data-view71="net"]')?.classList.remove('active');
      });
    });
    return true;
  }

  function activateNet71() {
    const card = card71Net();
    const sw = document.getElementById('viewSwitch71');
    if (!card || !sw) return;
    card.classList.remove('lesson71-plane-mode');
    card.classList.add('lesson71-net-mode');
    sw.querySelectorAll('button').forEach(b => b.classList.toggle('active', b.dataset.view71 === 'net'));
    renderNet71();
  }

  function dist2(A, B) {
    return Math.hypot(B.x - A.x, B.y - A.y);
  }

  function signedArea2(poly) {
    let s = 0;
    for (let i = 0; i < poly.length; i++) {
      const A = poly[i], B = poly[(i + 1) % poly.length];
      s += A.x * B.y - B.x * A.y;
    }
    return s / 2;
  }

  function centroid2(poly) {
    return {
      x: poly.reduce((s, p) => s + p.x, 0) / poly.length,
      y: poly.reduce((s, p) => s + p.y, 0) / poly.length
    };
  }

  // Точна плоска побудова бічної грані за трьома її сторонами:
  // AB - ребро основи, MA і MB - бічні ребра.
  function triangleApex2(A, B, MA, MB, center) {
    const c = Math.max(dist2(A, B), 1e-8);
    const ux = (B.x - A.x) / c, uy = (B.y - A.y) / c;
    const x = (MA * MA - MB * MB + c * c) / (2 * c);
    const hh = Math.sqrt(Math.max(0, MA * MA - x * x));
    const foot = {x: A.x + ux * x, y: A.y + uy * x};
    const n1 = {x: -uy, y: ux}, n2 = {x: uy, y: -ux};
    const T1 = {x: foot.x + n1.x * hh, y: foot.y + n1.y * hh};
    const T2 = {x: foot.x + n2.x * hh, y: foot.y + n2.y * hh};
    const d1 = Math.hypot(T1.x - center.x, T1.y - center.y);
    const d2 = Math.hypot(T2.x - center.x, T2.y - center.y);
    return d1 >= d2 ? T1 : T2;
  }

  function renderNet71() {
    const svg = document.getElementById('netSvg71');
    if (!svg || typeof geom !== 'function') return;
    const G = geom();
    const st = currentStage();
    svg.innerHTML = '';

    const defs = svg71('defs');
    const pattern = svg71('pattern', {id:'netGrid71',width:28,height:28,patternUnits:'userSpaceOnUse'});
    pattern.appendChild(svg71('path',{d:'M 28 0 L 0 0 0 28',fill:'none',stroke:'#eef2f7','stroke-width':1}));
    defs.appendChild(pattern);
    svg.appendChild(defs);
    svg.appendChild(svg71('rect',{x:0,y:0,width:1000,height:650,fill:'url(#netGrid71)'}));

    // Основа в площині XZ. Масштаб однаковий для основи та граней, щоб фінальна
    // розгортка зберігала справжні співвідношення довжин у межах моделі.
    const baseRaw = G.base.map(p => ({x:p.x, y:-p.z}));
    const cRaw = centroid2(baseRaw);
    const facesRaw = [];
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      const A = baseRaw[i], B = baseRaw[j];
      const MA = G.apex.distanceTo(G.base[i]);
      const MB = G.apex.distanceTo(G.base[j]);
      facesRaw.push({A, B, T:triangleApex2(A,B,MA,MB,cRaw), i, j});
    }

    const allRaw = [...baseRaw, ...facesRaw.map(f => f.T)];
    const minX = Math.min(...allRaw.map(p => p.x)), maxX = Math.max(...allRaw.map(p => p.x));
    const minY = Math.min(...allRaw.map(p => p.y)), maxY = Math.max(...allRaw.map(p => p.y));
    const scale = Math.min(760 / Math.max(maxX-minX,1), 430 / Math.max(maxY-minY,1));
    const cx = (minX+maxX)/2, cy = (minY+maxY)/2;
    const P = q => ({x:500+(q.x-cx)*scale, y:350+(q.y-cy)*scale});
    const b = baseRaw.map(P), center = P(cRaw);

    const line = (A,B,attrs={}) => svg.appendChild(svg71('line',{
      x1:A.x,y1:A.y,x2:B.x,y2:B.y,stroke:attrs.stroke||'#334155','stroke-width':attrs.width||2.8,
      'stroke-dasharray':attrs.dash||'',opacity:attrs.opacity ?? 1,'stroke-linecap':'round'
    }));
    const label = (pt,text,attrs={}) => svg.appendChild(svg71('text',{
      x:pt.x+(attrs.dx||0),y:pt.y+(attrs.dy||0),fill:attrs.fill||'#0f172a','font-size':attrs.size||18,
      'font-family':'Arial, sans-serif','font-weight':700,'text-anchor':'middle','paint-order':'stroke',stroke:'#fff','stroke-width':5,'stroke-linejoin':'round'
    },text));

    // Основа.
    svg.appendChild(svg71('polygon',{
      points:b.map(p=>`${p.x},${p.y}`).join(' '),fill:'#ddd6fe',stroke:'#475569','stroke-width':3,opacity:.82
    }));

    // Бічні грані. На 0% вони притиснуті до основи, на 100% маємо повну розгортку.
    facesRaw.forEach((f, idx) => {
      const A = b[f.i], B = b[f.j], fullT = P(f.T);
      const mid = {x:(A.x+B.x)/2,y:(A.y+B.y)/2};
      const T = {
        x: mid.x + (fullT.x-mid.x)*netProgress71,
        y: mid.y + (fullT.y-mid.y)*netProgress71
      };
      const fill = idx % 2 ? '#ccfbf1' : '#dbeafe';
      svg.appendChild(svg71('polygon',{
        points:`${A.x},${A.y} ${B.x},${B.y} ${T.x},${T.y}`,
        fill,stroke:'#0f766e','stroke-width':2.6,opacity:.82
      }));
      if (netProgress71 > .72) label(T,'M',{dy:T.y<center.y?-9:18,fill:'#0f766e',size:15});
    });

    // Ребра основи поверх граней - лінії згину.
    for (let i = 0; i < n; i++) {
      line(b[i],b[(i+1)%n],{stroke:'#64748b',width:2.2,dash:'6 5'});
    }

    // Позначення вершин основи.
    b.forEach((pt,i)=>{
      const vx=pt.x-center.x,vy=pt.y-center.y,L=Math.hypot(vx,vy)||1;
      label(pt,LETTERS_71_NET[i]||String(i+1),{dx:16*vx/L,dy:16*vy/L+5,size:17});
    });

    // Для правильної піраміди виділяємо апофему на одній бічній грані.
    if (regular() && netProgress71 > .82 && facesRaw[0]) {
      const f = facesRaw[0], A=b[f.i], B=b[f.j], T=P(f.T), N={x:(A.x+B.x)/2,y:(A.y+B.y)/2};
      line(T,N,{stroke:'#0891b2',width:3});
      label({x:(T.x+N.x)/2,y:(T.y+N.y)/2},'l',{dx:12,fill:'#0e7490',size:17});
      label(N,'N',{dx:12,dy:15,fill:'#0e7490',size:15});
      const ux=(B.x-A.x)/(dist2(A,B)||1),uy=(B.y-A.y)/(dist2(A,B)||1);
      const tx=(T.x-N.x),ty=(T.y-N.y),tl=Math.hypot(tx,ty)||1,vx=tx/tl,vy=ty/tl,s=12;
      const p1={x:N.x+ux*s,y:N.y+uy*s},c={x:p1.x+vx*s,y:p1.y+vy*s},p2={x:N.x+vx*s,y:N.y+vy*s};
      svg.appendChild(svg71('polyline',{points:`${p1.x},${p1.y} ${c.x},${c.y} ${p2.x},${p2.y}`,fill:'none',stroke:'#0891b2','stroke-width':2.5}));
    }

    // Підпис стану та формули.
    const info = document.querySelector('#net71Info>div');
    if (info) {
      if (st === 0) {
        info.innerHTML = '<b>Довільна піраміда.</b> Розгортка складається з основи та бічних трикутників, які загалом не є рівними. <b>S<sub>біч</sub> = S₁ + S₂ + … + Sₙ</b>.';
      } else if (st === 1) {
        info.innerHTML = '<b>Основа правильна, але піраміда ще не правильна.</b> Бічні трикутники загалом різні, тому <b>S<sub>біч</sub> = S₁ + S₂ + … + Sₙ</b>.';
      } else {
        info.innerHTML = '<b>Правильна піраміда.</b> Усі бічні грані - рівні рівнобедрені трикутники, їхні апофеми рівні. <b>S<sub>біч</sub> = ½P<sub>осн</sub>l</b>, <b>S<sub>повн</sub> = S<sub>біч</sub> + S<sub>осн</sub></b>.';
      }
    }

    const topText = st === 2 ? 'Розгортка правильної піраміди' : 'Розгортка піраміди';
    svg.appendChild(svg71('text',{x:500,y:145,fill:'#475569','font-size':16,'font-family':'Arial, sans-serif','font-weight':700,'text-anchor':'middle'},`${topText} · схематичне розгортання`));
  }

  function rerenderIfNet71() {
    if (card71Net()?.classList.contains('lesson71-net-mode')) renderNet71();
  }

  injectNetStyles71();

  document.addEventListener('DOMContentLoaded', () => {
    // plane-view створює перемикач на DOMContentLoaded; даємо йому завершити ініціалізацію.
    requestAnimationFrame(() => {
      if (!ensureNetUI71()) {
        setTimeout(() => { ensureNetUI71(); rerenderIfNet71(); }, 80);
      }
    });

    document.querySelectorAll('#panelModel input,#shapeBtns').forEach(el => {
      el.addEventListener('input', rerenderIfNet71);
      el.addEventListener('change', rerenderIfNet71);
      el.addEventListener('click', () => setTimeout(rerenderIfNet71, 0));
    });
  });

  // Перехоплюємо основні оновлення моделі, не змінюючи її математику.
  const oldBuild71Net = build;
  build = function () {
    oldBuild71Net();
    rerenderIfNet71();
  };

  const oldUpdateUI71Net = updateUI;
  updateUI = function () {
    oldUpdateUI71Net();
    rerenderIfNet71();
  };

  window.addEventListener('resize', rerenderIfNet71);
})();