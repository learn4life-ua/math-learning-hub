'use strict';
(() => {
const $=id=>document.getElementById(id);
const number=n=>new Intl.NumberFormat('uk-UA',{maximumFractionDigits:2}).format(n);
const M=(body,block=false)=>`<math xmlns="http://www.w3.org/1998/Math/MathML"${block?' display="block"':''}>${body}</math>`;
const mi=s=>`<mi>${s}</mi>`, mn=s=>`<mn>${s}</mn>`, mo=s=>`<mo>${s}</mo>`, mt=s=>`<mtext>${s}</mtext>`;
const row=(...s)=>`<mrow>${s.join('')}</mrow>`;
const sq=s=>`<msup>${s}${mn(2)}</msup>`, root=s=>`<msqrt>${s}</msqrt>`;
const f=(a,b)=>`<mfrac>${row(a)}${row(b)}</mfrac>`;
const sub=(a,b)=>`<msub>${mi(a)}${mt(b)}</msub>`;
const pi=mi('π'), r=mi('r'), h=mi('h'), d=mi('d'), a=mi('a'), alpha=mi('α'), beta=mi('β');
const sin=arg=>row('<mi mathvariant="normal">sin</mi>',arg), cos=(arg,power=false)=>row(power?sq('<mi mathvariant="normal">cos</mi>'):'<mi mathvariant="normal">cos</mi>',arg);
const tg=arg=>row('<mi mathvariant="normal">tg</mi>',arg);
const halfAlpha=row(mo('('),f(alpha,mn(2)),mo(')'));
const S=label=>sub('S',label), eq=mo('='), plus=mo('+'), times=mo('·');
const formulas={base:M(row(S('осн'),eq,pi,sq(r))),side:M(row(S('біч'),eq,mn(2),pi,r,h)),full:M(row(S('повн'),eq,mn(2),pi,r,row(mo('('),h,plus,r,mo(')')))),axial:M(row(S('ось'),eq,mn(2),r,h)),diag:M(row(d,eq,root(row(mn(4),sq(r),plus,sq(h)))))};
const state={tab:'model',r:3,h:6,az:.48,elev:.42,zoom:1,transparent:true,wire:false,labels:true,hidden:true,rotationMode:false,angle:360,section:'axial',cut:.5,unfold:0,view:'3d',task:null,sectionAngle:.35,taskD:10,taskAlpha:35,taskA:2,taskCentral:60,taskBeta:40,taskK:2,taskScenario:0};
function areas(radius,height){return{base:Math.PI*radius*radius,side:2*Math.PI*radius*height,full:2*Math.PI*radius*(height+radius),axial:2*radius*height};}
let rotationFrame=0,taskIndex=0,solutionStep=0,quizIndex=0,quizScore=0,quizAnswered=false,quizSelected=null;
const canvas=$('scene'),ctx=canvas.getContext('2d');
let width=800,height=440,pixelRatio=1;
function resize(){const box=canvas.getBoundingClientRect();if(!box.width)return;width=box.width;height=box.height;pixelRatio=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*pixelRatio);canvas.height=Math.round(height*pixelRatio);draw();}
new ResizeObserver(resize).observe(canvas);
function palette(){return{ink:'#e8f1fa',muted:'#94a3b8',edge:'#99e5df',body:'#2c969d80',top:'#68c9bf50',amber:'#fcd34d',fill:'#f0b94f88',red:'#fda4af',grid:'#334155',paper:'#0f172a'};}
let scale=30;
function project(x,y,z){const ca=Math.cos(state.az),sa=Math.sin(state.az),ce=Math.cos(state.elev),se=Math.sin(state.elev);return[width*.5+scale*(ca*x-sa*z),height*.53-scale*(ce*(y-state.h/2)-se*(sa*x+ca*z))];}
function line3(points,color,dashed=false,lineWidth=1.7){if(points.length<2)return;ctx.beginPath();points.forEach((p,i)=>{const q=project(...p);i?ctx.lineTo(...q):ctx.moveTo(...q);});ctx.strokeStyle=color;ctx.lineWidth=lineWidth;ctx.setLineDash(dashed?[5,5]:[]);ctx.stroke();ctx.setLineDash([]);}
function poly3(points,fill,stroke=null){ctx.beginPath();points.forEach((p,i)=>{const q=project(...p);i?ctx.lineTo(...q):ctx.moveTo(...q);});ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1.5;ctx.stroke();}}
function label3(text,p,color,dx=0,dy=0){if(!state.labels)return;const[x,y]=project(...p);ctx.font='600 13px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineWidth=2.5;ctx.strokeStyle=palette().paper;ctx.strokeText(text,x+dx,y+dy);ctx.fillStyle=color;ctx.fillText(text,x+dx,y+dy);}
function ring(y,start=0,end=2*Math.PI,rad=state.r){const out=[];for(let i=0;i<=100;i++){const t=start+(end-start)*i/100;out.push([rad*Math.cos(t),y,rad*Math.sin(t)]);}return out;}
function setupDraw(){ctx.setTransform(pixelRatio,0,0,pixelRatio,0,0);ctx.clearRect(0,0,width,height);scale=Math.min((width-70)/(2*state.r),(height-55)/(state.h*Math.cos(state.view==='plane'?.3:state.elev)+2*state.r*Math.sin(state.view==='plane'?.3:state.elev)))*state.zoom;}
function drawGround(){
 if(state.view==='plane')return;
 const extent=Math.max(state.r*3.5,9),step=extent/12;
 for(let i=-12;i<=12;i++){
  const color=i===0?'#33415570':'#33415545';
  line3([[-extent,-.08,i*step],[extent,-.08,i*step]],color,false,.65);
  line3([[i*step,-.08,-extent],[i*step,-.08,extent]],color,false,.65);
 }
}
function drawCylinder(){const c=palette(),R=state.r,H=state.h;const left=-state.az,right=Math.PI-state.az,front=Math.PI/2-state.az;
 drawGround();
 const body=[...ring(0,left,right),...ring(H,right,left)];
 if(!state.wire){
  poly3(ring(0),state.transparent?'#2dd4bf12':'#205d66');
  const gradient=ctx.createLinearGradient(width/2-scale*R,0,width/2+scale*R,0);
  gradient.addColorStop(0,state.transparent?'#2dd4bf35':'#24636c');
  gradient.addColorStop(.38,state.transparent?'#5eead466':'#439f9e');
  gradient.addColorStop(1,state.transparent?'#22d3ee25':'#205c6b');
  poly3(body,gradient);
  poly3(ring(H),state.transparent?'#5eead435':'#4e9998');
 }
 line3(ring(H),c.edge,false,1.2);
 if(state.hidden)line3(ring(0,right,left+2*Math.PI),'#8bd5d0a0',true,1);
 line3(ring(0,left,right),c.edge,false,1.3);
 for(const theta of [left,right])line3([[R*Math.cos(theta),0,R*Math.sin(theta)],[R*Math.cos(theta),H,R*Math.sin(theta)]],c.edge,false,1.2);
 if(state.wire)for(let i=0;i<12;i++){
  const t=i*Math.PI/6,hidden=Math.sin(t+state.az)<0;
  if(!hidden||state.hidden)line3([[R*Math.cos(t),0,R*Math.sin(t)],[R*Math.cos(t),H,R*Math.sin(t)]],hidden?'#8bd5d065':'#8bd5d0a0',hidden,.8);
 }
 if(state.view!=='net'&&state.tab==='sections'){
  if(state.section==='axial'){
   const th=state.sectionAngle;const A=[R*Math.cos(th),0,R*Math.sin(th)],B=[-A[0],0,-A[2]],AA=[A[0],H,A[2]],BB=[B[0],H,B[2]];
   poly3([A,B,BB,AA],c.fill);line3([AA,BB],c.amber,false,2.5);line3([A,B],c.amber,true,2);line3([A,AA],c.amber,false,2);line3([B,BB],c.amber,true,2);
   label3('2r',[0,0,0],c.amber,0,18);label3('h',AA,c.amber,18,20);
  }else{const y=H*state.cut;poly3(ring(y),c.fill);line3(ring(y),c.amber,false,2.5);label3('r',[R*.45*Math.cos(front),y,R*.45*Math.sin(front)],c.amber,14,-12);line3([[0,y,0],[R*Math.cos(front),y,R*Math.sin(front)]],c.amber);}
 }
 line3([[0,-.35,0],[0,H+.5,0]],c.muted,true,1.3);
 const rp=[R*Math.cos(.35),0,R*Math.sin(.35)];line3([[0,0,0],rp],c.edge,true);
 const gp=[R*Math.cos(.35),0,R*Math.sin(.35)],gpt=[gp[0],H,gp[2]];line3([gp,gpt],c.red,Math.sin(.35+state.az)<0,1.8);label3('A',gp,c.ink,14,7);if(state.task!==3&&state.task!==5)label3('A₁',gpt,c.ink,14,-7);if(state.task!==null)drawTaskGeometry();
 if(state.tab!=='sections'&&state.task===null){label3('r',[rp[0]*.55,0,rp[2]*.55],c.ink,12,10);label3('h = l',[gp[0],H*.55,gp[2]],c.red,23,0);}
 label3('O',[0,0,0],c.ink,-15,0);label3('O₁',[0,H,0],c.ink,-17,-4);if(state.task===null)label3('Вісь',[0,H+.4,0],c.muted,25,-10);
}
let spinFrame=0;
function toggleSpin(){if(state.view!=='3d')setView('3d');if(spinFrame){cancelAnimationFrame(spinFrame);spinFrame=0;$('spinModel').textContent='▶ Обертати';return;}let previous=performance.now();$('spinModel').textContent='Ⅱ Зупинити';function tick(now){state.az+=(now-previous)*.0005;previous=now;draw();spinFrame=requestAnimationFrame(tick);}spinFrame=requestAnimationFrame(tick);}

function drawTaskGeometry(){const c=palette(),R=state.r,H=state.h,n=state.task,th=state.sectionAngle;
 if([0,1,2].includes(n)){const A=[R*Math.cos(th),0,R*Math.sin(th)],B=[-A[0],0,-A[2]],AA=[A[0],H,A[2]],BB=[B[0],H,B[2]];poly3([A,B,BB,AA],c.fill);line3([A,B,BB,AA,A],c.amber,true,2.4);label3('2r',[0,0,0],c.amber,0,21);label3('h',[A[0],H*.5,A[2]],c.amber,18,0);if(n!==0){line3([B,AA],c.amber,false,3);label3('d',[0,H*.5,0],c.amber,-16,0);if(n===1)label3('α',B,c.amber,21,-19);}}
 if(n===3||n===5){const q=.35,A=[R*Math.cos(q),0,R*Math.sin(q)],O=[0,0,0],T=[0,H,0];poly3([A,O,T],c.fill);line3([A,O,T,A],c.amber,true,2.4);if(n===3)label3('6 см',[A[0]*.5,H*.5,A[2]*.5],c.amber,18,-5);label3(n===3?'60°':'β',A,c.amber,-16,-17);label3('h',[0,H*.5,0],c.red,-19,0);label3('r',[A[0]*.5,0,A[2]*.5],c.amber,0,n===5?25:16);
  if(n===5){const alpha=state.taskCentral*Math.PI/180,B=[R*Math.cos(q+alpha),0,R*Math.sin(q+alpha)],K=[(A[0]+B[0])/2,0,(A[2]+B[2])/2];poly3([A,O,B],c.fill);line3([A,B],c.amber,true,2.6);line3([O,B],c.amber,true,1.8);line3([O,K],c.red,true,2.3);label3('B',B,c.amber,10,13);label3('K',K,c.red,0,17);label3('a',[K[0]*.5,0,K[2]*.5],c.red,12,0);label3('α',[R*.25*Math.cos(q+alpha/2),0,R*.25*Math.sin(q+alpha/2)],c.amber,-8,-12);}
 }
 if(n===4){label3('k = '+number(state.taskK),[0,H+.4,0],c.amber,0,-15);}
}

function drawRotation(){drawGround();const c=palette(),R=state.r,H=state.h,A=state.angle*Math.PI/180,start=-state.az;const strips=[];
 for(let i=0;i<100;i++){const t1=start+A*i/100,t2=start+A*(i+1)/100;strips.push({depth:Math.sin((t1+t2)/2+state.az),pts:[[R*Math.cos(t1),0,R*Math.sin(t1)],[R*Math.cos(t2),0,R*Math.sin(t2)],[R*Math.cos(t2),H,R*Math.sin(t2)],[R*Math.cos(t1),H,R*Math.sin(t1)]]});}
 strips.sort((a,b)=>a.depth-b.depth).forEach(s=>poly3(s.pts,s.depth>0?c.body:c.top));
 if(A>0){poly3([[0,H,0],...ring(H,start,start+A)],c.top);line3(ring(H,start,start+A),c.edge);line3(ring(0,start,start+A),c.edge,true);}
 const last=start+A,base=[R*Math.cos(last),0,R*Math.sin(last)],top=[base[0],H,base[2]];poly3([[0,0,0],base,top,[0,H,0]],c.fill,c.amber);line3([[0,0,0],[0,H,0]],c.red,false,2.5);
 label3('r',[base[0]*.55,0,base[2]*.55],c.amber,5,17);label3('h',[0,H*.5,0],c.red,-20,0);label3(state.angle+'°',[0,H+.5,0],c.amber,0,-10);
}
function drawNet(){
 const c=palette(),u=state.unfold/100,R=state.r,H=state.h;
 // First hinge the rigid bases out, then unroll the lateral surface.
 // Its arc length remains 2πr throughout: |d(x,z)/dt| = r.
 const hinge=Math.min(1,u/.35)*Math.PI/2,bend=Math.max(0,(u-.35)/.65),k=1-bend;
 const surface=(t,y)=>[k<1e-6?R*t:R*Math.sin(k*t)/k,y,k<1e-6?0:R*(1-Math.cos(k*t))/k];
 const base=(t,top)=>[R*Math.sin(t),(top?H:0)+(top?1:-1)*R*(1-Math.cos(t))*Math.sin(hinge),R*(1-Math.cos(t))*Math.cos(hinge)];
 const raw=p=>[p[0]+.18*(1-u)*p[2],-p[1]+.38*(1-u)*p[2]];
 const rings=[false,true].map(top=>Array.from({length:121},(_,i)=>base(i*Math.PI/60,top)));
 const edges=[0,H].map(y=>Array.from({length:121},(_,i)=>surface(-Math.PI+i*Math.PI/60,y)));
 const all=[...rings.flat(),...edges.flat()].map(raw),xs=all.map(p=>p[0]),ys=all.map(p=>p[1]);
 const minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
 const fit=Math.min((width-100)/(maxX-minX),(height-30)/(maxY-minY))*state.zoom;
 const pp=p=>{const q=raw(p);return[width/2+fit*(q[0]-(minX+maxX)/2),height/2+fit*(q[1]-(minY+maxY)/2)];};
 function path(points,fill,stroke,dash=false){ctx.beginPath();points.forEach((p,i)=>{const q=pp(p);i?ctx.lineTo(...q):ctx.moveTo(...q);});if(fill){ctx.closePath();ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1.3;ctx.setLineDash(dash?[4,4]:[]);ctx.stroke();ctx.setLineDash([]);}}
 function text(str,p,dx=0,dy=0,color=c.ink){const q=pp(p);ctx.font='600 13px system-ui';ctx.textAlign='center';ctx.fillStyle=color;ctx.fillText(str,q[0]+dx,q[1]+dy);}
 path(rings[0],'#5eead430',c.edge);
 const strips=Array.from({length:100},(_,i)=>{const t=-Math.PI+(i+.5)*Math.PI/50;return{t,depth:Math.cos(k*t)};}).sort((a,b)=>a.depth-b.depth);
 if(bend>.999)path([surface(-Math.PI,0),surface(Math.PI,0),surface(Math.PI,H),surface(-Math.PI,H)],'#2c969d70');
 else for(const{t}of strips)path([surface(t-Math.PI/100,0),surface(t+Math.PI/100,0),surface(t+Math.PI/100,H),surface(t-Math.PI/100,H)],'#2c969d70');
 edges.forEach(e=>path(e,null,c.edge));
 for(const t of [-Math.PI,Math.PI])path([surface(t,0),surface(t,H)],null,c.edge);
 path(rings[1],'#5eead430',c.edge);
 // Bases are hinged at the two opposite long edges, with one common scale.
 for(const top of [false,true]){const center=[0,(top?H:0)+(top?1:-1)*R*Math.sin(hinge),R*Math.cos(hinge)],end=[R,center[1],center[2]];path([center,end],null,c.amber);text('r',[(center[0]+end[0])/2,center[1],center[2]],0,-5,c.amber);}
 if(u>.97){text('2πr = '+number(2*R)+'π см',[0,0,0],0,-9);text('h = '+number(H)+' см',[Math.PI*R,H/2,0],30,4);}
 else text(state.unfold<=35?'Відкриваємо основи':'Розгортаємо бічну поверхню',[0,H/2,0],0,0);
}
function draw(){if(!ctx||!width)return;setupDraw();if(state.view==='net')drawNet();else {const az=state.az,elev=state.elev;if(state.view==='plane'){state.az=0;state.elev=.3;}if(state.rotationMode&&(state.tab==='model'||state.task===2))drawRotation();else drawCylinder();state.az=az;state.elev=elev;}}
function sync(){const{r:R,h:H}=state;const values=areas(R,H);$('radiusOut').textContent=number(R)+' см';$('heightOut').textContent=number(H)+' см';
 for(const[key,coeff]of [['Base',R*R],['Side',2*R*H],['Full',2*R*(H+R)]]){$('metric'+key).textContent=number(coeff)+'π см²';$('metric'+key+'D').textContent='≈ '+number(values[key.toLowerCase()])+' см²';}
 $('modelInfo').innerHTML='<div class="factlist"><div class="fact"><b>Основи</b><br>Два рівні круги в паралельних площинах.</div><div class="fact"><b>Твірна й висота</b><br>l = h = '+number(H)+' см. Усі твірні паралельні та рівні.</div><div class="fact"><b>Вісь</b><br>Пряма через центри основ O і O₁.</div></div><div class="note" style="margin-top:16px">'+(state.rotationMode?'Прямокутник зі сторонами r та h обертається навколо сторони h. Його друга сторона задає радіус, а не діаметр.':'Знайди на моделі радіус r і діаметр 2r = '+number(2*R)+' см. Чому основа - круг, а не коло?')+'</div>';
 $('rotationOut').textContent=state.angle+'°';$('cutHeightOut').textContent=Math.round(state.cut*100)+'% висоти';$('unfoldOut').textContent=state.unfold+'%';
 $('sectionInfo').innerHTML=state.section==='axial'?'<h3>Прямокутник 2r × h</h3><p>Площина містить вісь циліндра. Дві сторони перерізу - діаметри основ, дві інші - твірні.</p><div class="formula">'+formulas.axial+'<p class="readout">'+number(2*R)+' · '+number(H)+' = <b>'+number(values.axial)+' см²</b></p></div><p class="small">'+(Math.abs(H-2*R)<.001?'Зараз переріз - квадрат, бо h = 2r.':'Зроби осьовий переріз квадратом: установи h = 2r.')+'</p><div class="note">Діагональ перерізу: '+formulas.diag+'</div>':'<h3>Круг радіуса r</h3><p>Площина перпендикулярна до осі й паралельна основам. Круг перерізу рівний основі на будь-якому рівні всередині циліндра.</p><div class="formula">'+M(row(S('пер'),eq,S('осн'),eq,pi,sq(r)))+'<p class="readout">'+number(R*R)+'π ≈ <b>'+number(values.base)+' см²</b></p></div><div class="note">Змінюй рівень перерізу. Його площа залишається сталою.</div>';
 $('netInfo').innerHTML='<h3>Прямокутник і два круги</h3><p>Розріз уздовж твірної перетворює бічну поверхню на прямокутник зі сторонами h і 2πr.</p><div class="formula-list"><div class="formula"><small>Бічна поверхня</small>'+formulas.side+'</div><div class="formula"><small>Повна поверхня</small>'+M(row(S('повн'),eq,S('біч'),plus,mn(2),S('осн')))+'</div></div><div class="note warm" style="margin-top:14px">Етикетка: тільки бічна поверхня. Закрита банка: бічна поверхня та дві основи.</div>';
 draw();
}
function stopRotation(){cancelAnimationFrame(rotationFrame);rotationFrame=0;$('animateRotation').textContent='▶ Обертати прямокутник';}
function setView(view){state.view=view;for(const id of ['surfaceStyle','wireStyle','spinModel'])$(id).hidden=view==='net';for(const id of ['netPlay','netFold'])$(id).hidden=view!=='net';document.querySelector('.viewhint').textContent=view==='net'?'Розгорни або згорни модель. Повзунок розгортання - у вкладці «Розгортка».':'Перетягуй для обертання · Стрілки - поворот · + / − - масштаб';['view3d','viewPlane','viewNet'].forEach((id,i)=>$(id).setAttribute('aria-pressed',String(view===['3d','plane','net'][i])));$('stageTitle').textContent=view==='net'?'Розгортка поверхні циліндра':view==='plane'?'Циліндр на площині':'Прямий круговий циліндр';$('stageTag').textContent=view==='net'?'Розгортання':view==='plane'?'Площинне зображення':'3D-модель';resize();draw();}
function openPanel(){if(!matchMedia('(max-width:1023px)').matches)return;$('lessonPanel').classList.add('open');$('panelBackdrop').hidden=false;$('lessonPanel').setAttribute('role','dialog');$('lessonPanel').setAttribute('aria-modal','true');$('panelClose').focus();}
function closePanel(){$('lessonPanel').classList.remove('open');$('panelBackdrop').hidden=true;$('lessonPanel').removeAttribute('role');$('lessonPanel').removeAttribute('aria-modal');$('tab-'+state.tab).focus();resize();}
function setTab(tab,open=true){stopRotation();if(tab!=='tasks'&&state.task!==null){state.r=3;state.h=6;$('radius').value=3;$('height').value=6;}state.tab=tab;if(tab!=='tasks'){state.task=null;state.rotationMode=false;}document.querySelectorAll('[role=tab]').forEach(b=>{const active=b.dataset.tab===tab;b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;});document.querySelectorAll('[role=tabpanel]').forEach(p=>p.hidden=p.id!=='panel-'+tab);
 if(['model','sections','net'].includes(tab)){$('panel-'+tab).insertBefore($('sharedControls'),tab==='model'?$('modelControls'):tab==='sections'?$('sectionControls'):$('netControls'));$('modelControls').hidden=tab!=='model';$('sectionControls').hidden=tab!=='sections';$('netControls').hidden=tab!=='net';$('stageSub').textContent={model:'Два рівні круги та бічна поверхня',sections:'Осьовий переріз або переріз, паралельний основам',net:'Прямокутник 2πr × h і два круги'}[tab];$('sideTitle').textContent='Змінюй розміри';$('hiddenLines').closest('label').hidden=tab==='net';$('labels').closest('label').hidden=tab==='net';setView(tab==='net'?'net':state.view==='net'?'3d':state.view);sync();}
 else if(tab==='tasks')renderTask();else if(tab==='quiz')renderQuiz();
 if(open)openPanel();resize();
}
document.querySelectorAll('[role=tab]').forEach((b,i,all)=>{b.addEventListener('click',()=>setTab(b.dataset.tab));b.addEventListener('keydown',e=>{let n;if(e.key==='ArrowRight')n=(i+1)%all.length;else if(e.key==='ArrowLeft')n=(i+all.length-1)%all.length;else if(e.key==='Home')n=0;else if(e.key==='End')n=all.length-1;else return;e.preventDefault();setTab(all[n].dataset.tab);if(!matchMedia('(max-width:1023px)').matches)all[n].focus();});});
$('view3d').onclick=()=>{setView('3d');};$('viewPlane').onclick=()=>{stopRotation();setView('plane');};$('viewNet').onclick=()=>{setTab('net',false);setView('net');if(matchMedia('(max-width:1023px)').matches)openPanel();};
$('panelClose').onclick=closePanel;$('panelBackdrop').onclick=closePanel;
document.addEventListener('keydown',e=>{if(!$('lessonPanel').classList.contains('open'))return;if(e.key==='Escape')closePanel();if(e.key==='Tab'){const focusable=[...$('lessonPanel').querySelectorAll('button,input,a,select,[tabindex="0"]')].filter(el=>!el.disabled&&el.getClientRects().length);if(e.shiftKey&&document.activeElement===focusable[0]){e.preventDefault();focusable.at(-1).focus();}else if(!e.shiftKey&&document.activeElement===focusable.at(-1)){e.preventDefault();focusable[0].focus();}}});
window.addEventListener('resize',()=>{if(!matchMedia('(max-width:1023px)').matches){$('lessonPanel').classList.remove('open');$('panelBackdrop').hidden=true;$('lessonPanel').removeAttribute('role');$('lessonPanel').removeAttribute('aria-modal');}resize();});

for(const[id,key]of [['radius','r'],['height','h']])$(id).addEventListener('input',e=>{state[key]=Number(e.target.value);sync();});
$('labels').addEventListener('change',e=>{state.labels=e.target.checked;draw();});$('hiddenLines').addEventListener('change',e=>{state.hidden=e.target.checked;draw();});
function setRotation(on){stopRotation();state.rotationMode=on;$('showRotation').setAttribute('aria-pressed',String(on));$('showCylinder').setAttribute('aria-pressed',String(!on));$('rotationControls').hidden=!on;sync();}
$('showCylinder').onclick=()=>setRotation(false);$('showRotation').onclick=()=>setRotation(true);$('rotation').oninput=e=>{stopRotation();state.angle=Number(e.target.value);sync();};
$('animateRotation').onclick=()=>{if(rotationFrame){stopRotation();return;}state.angle=0;const start=performance.now();$('animateRotation').textContent='Ⅱ Зупинити';function frame(now){state.angle=Math.min(360,Math.round((now-start)/14));$('rotation').value=state.angle;$('rotationOut').textContent=state.angle+'°';draw();if(state.angle<360)rotationFrame=requestAnimationFrame(frame);else stopRotation();}rotationFrame=requestAnimationFrame(frame);};
function setSection(name){state.section=name;$('axial').setAttribute('aria-pressed',String(name==='axial'));$('horizontal').setAttribute('aria-pressed',String(name==='horizontal'));$('cutHeightWrap').hidden=name==='axial';sync();}
$('axial').onclick=()=>setSection('axial');$('horizontal').onclick=()=>setSection('horizontal');$('cutHeight').oninput=e=>{state.cut=Number(e.target.value)/100;sync();};
let netFrame=0;
function animateNet(target){cancelAnimationFrame(netFrame);const from=state.unfold,start=performance.now();function step(now){const t=Math.min(1,(now-start)/1800);state.unfold=Math.round(from+(target-from)*(t*t*(3-2*t)));$('unfold').value=state.unfold;sync();netFrame=t<1?requestAnimationFrame(step):0;}netFrame=requestAnimationFrame(step);}
$('unfold').oninput=e=>{cancelAnimationFrame(netFrame);state.unfold=Number(e.target.value);sync();};$('netClosed').onclick=()=>animateNet(0);$('netOpen').onclick=()=>{animateNet(100);if(matchMedia('(max-width:1023px)').matches)closePanel();};$('netPlay').onclick=()=>animateNet(100);$('netFold').onclick=()=>animateNet(0);
$('surfaceStyle').onclick=()=>{state.transparent=!state.transparent;$('surfaceStyle').setAttribute('aria-pressed',String(state.transparent));draw();};
$('wireStyle').onclick=()=>{state.wire=!state.wire;$('wireStyle').setAttribute('aria-pressed',String(state.wire));draw();};
function zoom(delta){state.zoom=Math.max(.65,Math.min(2.8,state.zoom+delta));draw();}$('spinModel').onclick=toggleSpin;$('zoomIn').onclick=()=>zoom(.15);$('zoomOut').onclick=()=>zoom(-.1);$('resetView').onclick=()=>{state.az=.48;state.elev=.42;state.zoom=1;draw();};
let pointer=null;canvas.addEventListener('pointerdown',e=>{pointer={x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);});canvas.addEventListener('pointermove',e=>{if(!pointer)return;state.az+=(e.clientX-pointer.x)*.008;state.elev=Math.max(.18,Math.min(1.05,state.elev+(e.clientY-pointer.y)*.005));pointer={x:e.clientX,y:e.clientY};draw();});canvas.addEventListener('pointerup',()=>pointer=null);canvas.addEventListener('pointercancel',()=>pointer=null);canvas.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-'].includes(e.key)){e.preventDefault();if(e.key==='ArrowLeft')state.az-=.15;if(e.key==='ArrowRight')state.az+=.15;if(e.key==='ArrowUp')state.elev=Math.min(1.05,state.elev+.08);if(e.key==='ArrowDown')state.elev=Math.max(.18,state.elev-.08);if(e.key==='+'||e.key==='=')zoom(.1);if(e.key==='-')zoom(-.1);draw();}});

$('helpOpen').onclick=()=>$('help').showModal();$('helpClose').onclick=()=>$('help').close();$('help').addEventListener('click',e=>{if(e.target===$('help')){const b=$('help').getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)$('help').close();}});
const theory=[
 ['1 · Тіла обертання','Тіло обертання','<p>Тіло обертання утворюється обертанням плоскої фігури навколо фіксованої прямої - осі обертання. З однієї фігури можна отримати різні тіла, змінюючи вісь.</p><p><b>Осьовий переріз</b> утворює площина, що містить вісь. Поперечний переріз довільного тіла обертання не завжди круг: можливі кільця, кілька концентричних кілець або вироджений переріз.</p>'],
 ['2 · Елементи','Прямий круговий циліндр','<p>Циліндр утворюється обертанням прямокутника навколо прямої, що містить одну з його сторін.</p><div class="factlist"><div class="fact"><b>Основи</b> - рівні круги в паралельних площинах.</div><div class="fact"><b>Вісь</b> - пряма через центри основ, перпендикулярна до них.</div><div class="fact"><b>Твірні</b> - паралельні рівні відрізки бічної поверхні.</div><div class="fact"><b>Висота</b> - відстань між площинами основ. Для прямого циліндра l = h.</div></div>'],
 ['3 · Перерізи','Прямокутник або круг','<p>Площина через вісь дає <b>прямокутник 2r × h</b>. Його сторони - діаметри основ і твірні. Якщо h = 2r, це квадрат.</p>'+formulas.axial+formulas.diag+'<p>Площина, паралельна основам і така, що перетинає циліндр, дає <b>круг радіуса r</b>, рівний основі.</p>'+M(row(S('пер'),eq,pi,sq(r)),true)],
 ['4 · Розгортка','Прямокутник і дві основи','<p>Після розрізу вздовж твірної бічна поверхня розгортається у прямокутник. Його сторони - h та довжина кола основи 2πr.</p><p>Повна розгортка містить цей прямокутник і два рівні круги.</p><div class="note">Плутанина r і 2r змінює результат удвічі. В осьовому перерізі ширина - 2r, а довжина розгортки - 2πr.</div>'],
 ['5 · Площі','Яку поверхню обчислюємо?','<div class="formula-list"><div class="formula"><small>Одна основа</small>'+formulas.base+'</div><div class="formula"><small>Бічна поверхня</small>'+formulas.side+'</div><div class="formula"><small>Повна поверхня</small>'+M(row(S('повн'),eq,mn(2),pi,r,h,plus,mn(2),pi,sq(r)),true)+'</div></div><p>Для посудини без кришки додаємо одну основу: '+M(row(S('без кришки'),eq,mn(2),pi,r,h,plus,pi,sq(r)))+'. Якщо довжини задані в сантиметрах, площі вимірюємо у см².</p>'],
 ['6 · Розв’язування','Від рисунка до формули','<ol><li>Познач r, h, діаметр 2r та потрібну похилу.</li><li>Для кута між прямою і площиною знайди ортогональну проєкцію похилої.</li><li>Застосуй теорему Піфагора або тригонометрію у прямокутному трикутнику.</li><li>Обери площу: основа, переріз, бічна чи повна поверхня.</li><li>Перевір одиниці та правдоподібність відповіді.</li></ol><p class="note warm">У задачі 2 проєкція діагоналі - діаметр. У задачі 4 проєкція похилої - радіус.</p>']
];
$('theoryContent').innerHTML=theory.map(([tag,title,body])=>'<article class="paper"><div class="eyebrow">'+tag+'</div><h2>'+title+'</h2>'+body+'</article>').join('');
function diagram(type){const base='<ellipse cx="180" cy="72" rx="83" ry="27" fill="none" stroke="currentColor"/><path d="M97 72V257M263 72V257M97 257A83 27 0 0 0 263 257" fill="none" stroke="currentColor"/><path d="M97 257A83 27 0 0 1 263 257M180 72V257" fill="none" stroke="currentColor" stroke-dasharray="5 5" opacity=".65"/>';
 let extra='';if(type===1)extra='<path d="M97 257L263 72M97 257H263" stroke="#b77a18" stroke-width="2" stroke-dasharray="5 4" fill="none"/><text x="166" y="155">d</text><text x="121" y="245">α</text><text x="268" y="170">h</text><text x="165" y="295">2r</text>';
 else if(type===3||type===5)extra='<path d="M180 72L112 270L180 257" fill="none" stroke="#b77a18" stroke-width="2" stroke-dasharray="5 4"/><circle cx="180" cy="72" r="3" fill="currentColor"/><circle cx="180" cy="257" r="3" fill="currentColor"/><text x="187" y="68">O₁</text><text x="182" y="250">O</text><text x="95" y="288">A</text><text x="125" y="258">'+(type===3?'60°':'β')+'</text>'+(type===3?'<text x="114" y="155">6 см</text>':'<path d="M112 270L240 275M180 257L177 272" stroke="#b77a18" stroke-width="2" fill="none" stroke-dasharray="5 4"/><text x="241" y="295">B</text><text x="170" y="298">K</text><text x="180" y="268">a</text><text x="198" y="263">α</text>');
 else if(type===2)extra='<path d="M180 72H263V257H180Z" fill="#f8cb6744" stroke="#b77a18" stroke-width="2"/><path d="M97 257L263 72" stroke="#b77a18" stroke-dasharray="5 4"/><text x="208" y="63">1 см</text><text x="269" y="175">3 см</text><text x="156" y="164">d</text>';
 else extra='<path d="M97 257V72H263V257Z" stroke="#b77a18" stroke-width="2" fill="#f8cb6733"/><text x="270" y="175">6 см</text><text x="155" y="299">2r = 10 см</text>';
 return '<svg class="schematic" viewBox="0 0 360 325" role="img" aria-label="Схема до задачі '+(type+1)+'. Рисунок без масштабу."><g stroke-width="1.7">'+base+extra+'</g></svg>';
}
const task6Answer=f(row(mn(2),pi,sq(a),tg(beta)),cos(halfAlpha,true));
const tasks=[
 {title:'Площа осьового перерізу',text:'Висота циліндра дорівнює 6 см, а радіус основи - 5 см. Знайдіть площу осьового перерізу циліндра.',steps:['Осьовий переріз - прямокутник. Його висота дорівнює 6 см, ширина - діаметру 2r = 10 см.',M(row(S('ось'),eq,mn(2),r,h,eq,mn(2),times,mn(5),times,mn(6),eq,mn(60),mt(' см²')),true)],answer:'60 см²',input:{label:'Площа осьового перерізу, см²',correct:60,hint:'Ширина прямокутника дорівнює діаметру 10 см. Помнож її на висоту 6 см.'}},
 {title:'Діагональ і кут із площиною',text:'Діагональ осьового перерізу циліндра дорівнює d і утворює з площиною основи кут α. Знайдіть висоту циліндра та площу основи.',steps:['Проєкція діагоналі на основу - діаметр 2r. У прямокутному трикутнику гіпотенуза дорівнює d, катети - h і 2r.',M(row(h,eq,d,sin(alpha),mo(';'),mn(2),r,eq,d,cos(alpha)),true),M(row(r,eq,f(row(d,cos(alpha)),mn(2)),mo(';'),S('осн'),eq,f(row(pi,sq(d),cos(alpha,true)),mn(4))),true)],answer:M(row(h,eq,d,sin(alpha),mo(';'),S('осн'),eq,f(row(pi,sq(d),cos(alpha,true)),mn(4))))+'<p class="small">d > 0, 0° < α < 90°.</p>'},
 {title:'Обертання прямокутника',text:'Прямокутник зі сторонами 1 см і 3 см обертають навколо більшої сторони. Знайдіть діагональ осьового перерізу утвореного циліндра та площу його повної поверхні.',steps:['Вісь проходить уздовж більшої сторони, тому h = 3 см, r = 1 см. Ширина осьового перерізу дорівнює 2 см.',M(row(d,eq,root(row(sq(mn(3)),plus,sq(mn(2)))),eq,root(mn(13)),mt(' см')),true),M(row(S('повн'),eq,mn(2),pi,times,mn(1),times,mn(3),plus,mn(2),pi,times,sq(mn(1)),eq,mn(8),pi,mt(' см²')),true)],answer:M(row(d,eq,root(mn(13)),mt(' см; '),S('повн'),eq,mn(8),pi,mt(' см²'))),input:{label:'Коефіцієнт при π у площі повної поверхні',correct:8,hint:'Додай 6π см² бічної поверхні та 2π см² двох основ.'}},
 {title:'Похила до площини основи',text:'Точки O і O₁ - центри нижньої та верхньої основ циліндра. Точка A лежить на колі нижньої основи. Відрізок O₁A дорівнює 6 см і утворює з площиною основи кут 60°. Знайдіть площу бічної поверхні.',steps:['Проєкція O₁A на основу - AO, тобто радіус. Трикутник AOO₁ прямокутний при O.',M(row(r,eq,mn(6),cos(mn('60°')),eq,mn(3),mt(' см')),true),M(row(h,eq,mn(6),sin(mn('60°')),eq,mn(3),root(mn(3)),mt(' см')),true),M(row(S('біч'),eq,mn(2),pi,times,mn(3),times,mn(3),root(mn(3)),eq,mn(18),pi,root(mn(3)),mt(' см²')),true)],answer:M(row(mn(18),pi,root(mn(3)),mt(' см²'))),input:{label:'Коефіцієнт перед π√3 у відповіді',correct:18,hint:'Радіус 3 см, висота 3√3 см. Коефіцієнт дорівнює 2 · 3 · 3.'}},
 {title:'Як змінюється площа?',text:'Як зміниться площа бічної поверхні, якщо: 1) радіус збільшити в k разів; 2) висоту зменшити в k разів; 3) висоту збільшити в k разів, а радіус зменшити в k разів? Якою є залежність площі від радіуса та від висоти?',steps:['Нехай k > 1. Використовуємо S = 2πrh. У кожному випадку параметр, не названий в умові, залишається сталим.',M(row(mi('S′'),eq,mn(2),pi,mo('('),mi('kr'),mo(')'),h,eq,mi('kS')),true)+'<p>Перший випадок: площа збільшується в k разів.</p>',M(row(mi('S′'),eq,mn(2),pi,r,f(h,mi('k')),eq,f(mi('S'),mi('k'))),true)+'<p>Другий випадок: площа зменшується в k разів.</p>',M(row(mi('S′'),eq,mn(2),pi,f(r,mi('k')),mi('kh'),eq,mi('S')),true)+'<p>Третій випадок: площа не змінюється. За сталої висоти площа прямо пропорційна радіусу, а за сталого радіуса - висоті.</p>'],answer:'1) Збільшиться в k разів; 2) зменшиться в k разів; 3) не зміниться. Обидві окремі залежності - пряма пропорційність.'},
 {title:'Хорда нижньої основи',text:'У нижній основі циліндра проведено хорду AB, яку видно із центра O під кутом α. Відрізок O₁A утворює з площиною основи кут β. Знайдіть площу бічної поверхні, якщо відстань від O до хорди дорівнює a.',steps:['Опустимо OK ⟂ AB. У рівнобедреному трикутнику AOB висота OK є медіаною та бісектрисою. Тому ∠AOK = α/2.',M(row(cos(halfAlpha),eq,f(a,r),mo(';'),r,eq,f(a,cos(halfAlpha))),true),M(row(tg(beta),eq,f(h,r),mo(';'),h,eq,f(row(a,tg(beta)),cos(halfAlpha))),true),M(row(S('біч'),eq,mn(2),pi,r,h,eq,task6Answer),true)],answer:M(row(S('біч'),eq,task6Answer))+'<p class="small">a > 0, 0° < α < 180° (менший центральний кут), 0° < β < 90°. Випадок хорди-діаметра потребує окремого розгляду.</p>'}
];
function renderTask(){const task=tasks[taskIndex];state.task=taskIndex;state.elev=taskIndex===5?.82:.48;state.az=.2;state.zoom=1;setView('3d');state.rotationMode=false;updateTaskModel();$('taskNav').innerHTML=tasks.map((t,i)=>'<button data-task="'+i+'" aria-pressed="'+(i===taskIndex)+'">Задача '+(i+1)+'</button>').join('');$('taskNav').querySelectorAll('button').forEach(b=>b.onclick=()=>{taskIndex=Number(b.dataset.task);solutionStep=0;renderTask();});
 $('taskContent').innerHTML='<div class="taskgrid"><article class="taskcard"><div class="tasktitle"><span class="taskbadge">'+(taskIndex+1)+'</span><h2>'+task.title+'</h2></div><p>'+task.text+'</p>'+(taskIndex===4?'<div class="note">Для висловів «збільшити / зменшити в k разів» беремо k > 1.</div>':'')+'<div class="taskactions"><button class="primary" id="nextStep">Показати перший крок</button><button id="allSteps">Усе розв’язання</button></div><div id="solution" class="solution" aria-live="polite"></div>'+(task.input?'<form class="taskcheck" id="taskCheck"><label for="taskAnswer">'+task.input.label+'</label><br><input id="taskAnswer" type="text" inputmode="decimal" autocomplete="off" aria-describedby="taskFeedback" placeholder="Введи число"><button type="submit">Перевірити</button><div class="feedback" id="taskFeedback" role="status"></div></form>':'')+'</article><aside class="taskcard">'+(taskIndex===4?'<h2>Досліди множник k</h2><label class="rangelabel" for="factor">k <output id="factorOut">2</output></label><input type="range" id="factor" min="1.1" max="5" step=".1" value="2"><div class="formula-list" id="factorResult"></div><p class="small muted">Це додаткова ілюстрація для вибраного k, а не нова числова умова задачі.</p>':'<h2>Динамічний рисунок на головній сцені</h2><p class="small muted">Повертай модель перетягуванням. Точки A, A₁ та допоміжні побудови закріплено на циліндрі.</p><div id="taskModelControls"></div><button id="taskShowModel" class="primary">Показати велику модель</button>')+'<div class="note warm" style="margin-top:18px">'+['Використай діаметр 2r, а не радіус r.','Кут із площиною вимірюємо між діагоналлю та її проєкцією.','Радіус - менша сторона початкового прямокутника.','Тут проєкція - радіус. Не перенось діаметр із задачі 2.','Пряма пропорційність діє за сталого другого параметра.','У знаменнику - квадрат косинуса половини центрального кута.'][taskIndex]+'</div></aside></div>';
 $('nextStep').onclick=()=>{solutionStep=Math.min(solutionStep+1,task.steps.length);showSteps();};$('allSteps').onclick=()=>{solutionStep=task.steps.length;showSteps();};
 if(task.input)$('taskCheck').onsubmit=e=>{e.preventDefault();const input=$('taskAnswer').value.trim().replace(',','.');const value=/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(input)?Number(input):NaN;const fb=$('taskFeedback');if(!Number.isFinite(value)){fb.className='feedback no';fb.textContent='Введи одне число. Десяткову частину можна відділяти комою.';return;}const ok=Math.abs(value-task.input.correct)<.005;fb.className='feedback '+(ok?'ok':'no');fb.textContent=ok?'✓ Правильно. Перевір одиниці та поясни вибір формули.':'Поки не збігається. '+task.input.hint;};
 if(taskIndex===4){const factor=()=>{const k=Number($('factor').value);$('factorOut').textContent=number(k);$('factorResult').innerHTML='<div class="formula"><small>1 · Радіус × k</small>S′ / S = <b>'+number(k)+'</b></div><div class="formula"><small>2 · Висота ÷ k</small>S′ / S = <b>'+number(1/k)+'</b></div><div class="formula"><small>3 · Висота × k, радіус ÷ k</small>S′ / S = <b>1</b></div>';};$('factor').oninput=()=>{state.taskK=Number($('factor').value);factor();updateTaskModel();};factor();$('factorResult').insertAdjacentHTML('afterend','<div class="segmented"><button data-scenario="0">r × k</button><button data-scenario="1">h ÷ k</button><button data-scenario="2">r ÷ k, h × k</button></div><button id="taskShowModel" class="primary">Показати велику модель</button>');document.querySelectorAll('[data-scenario]').forEach(b=>b.onclick=()=>{state.taskScenario=Number(b.dataset.scenario);updateTaskModel();});}else buildTaskModelControls();if($('taskShowModel'))$('taskShowModel').onclick=()=>{closePanel();canvas.focus();};showSteps();
}
function updateTaskModel(){const n=taskIndex;state.task=n;
 if(n===0){state.r=5;state.h=6;}if(n===1){const x=state.taskAlpha*Math.PI/180;state.r=state.taskD*Math.cos(x)/2;state.h=state.taskD*Math.sin(x);}if(n===2){state.r=1;state.h=3;}if(n===3){state.r=3;state.h=3*Math.sqrt(3);}if(n===4){const k=state.taskK;state.r=state.taskScenario===0?3*k:state.taskScenario===2?3/k:3;state.h=state.taskScenario===1?6/k:state.taskScenario===2?6*k:6;}if(n===5){state.r=state.taskA/Math.cos(state.taskCentral*Math.PI/360);state.h=state.r*Math.tan(state.taskBeta*Math.PI/180);}
 $('radius').value=Math.max(1,Math.min(6,state.r));$('height').value=Math.max(1,Math.min(10,state.h));sync();$('stageTitle').textContent='Задача '+(n+1)+' · '+tasks[n].title;$('stageSub').textContent=[0,2,3].includes(n)?'Розміри за умовою · Повертай рисунок, щоб дослідити побудову':'Додаткове дослідження символічної умови';$('stageTag').textContent='Динамічна побудова';
 if($('taskModelReadout'))$('taskModelReadout').textContent='r ≈ '+number(state.r)+' см; h ≈ '+number(state.h)+' см';draw();
}
function buildTaskModelControls(){const wrap=$('taskModelControls');if(!wrap)return;let content='';
 const range=(id,label,min,max,value,unit='')=>'<div class="range"><label class="rangelabel" for="'+id+'">'+label+' <output id="'+id+'Out">'+number(value)+unit+'</output></label><input type="range" id="'+id+'" min="'+min+'" max="'+max+'" value="'+value+'" step="1"></div>';
 if(taskIndex===1)content='<div class="note">Додаткова підстановка для дослідження. В оригінальній умові d і α - символи.</div>'+range('exploreD','Діагональ d',2,16,state.taskD,' см')+range('exploreAlpha','Кут α',10,80,state.taskAlpha,'°');
 if(taskIndex===5)content='<div class="note">Додаткова підстановка для дослідження. В оригінальній умові a, α і β - символи.</div>'+range('exploreA','Відстань a',1,5,state.taskA,' см')+range('exploreCentral','Центральний кут α',20,140,state.taskCentral,'°')+range('exploreBeta','Кут β',10,70,state.taskBeta,'°');
 if([0,1,2].includes(taskIndex))content+=range('explorePlane','Поворот осьового перерізу',0,180,Math.round(state.sectionAngle*180/Math.PI),'°');
 if(taskIndex===2)content+='<button id="exploreRotation">Обертання прямокутника</button>'+range('exploreTurn','Кут обертання',0,360,360,'°');
 wrap.innerHTML=content+'<p class="small readout" id="taskModelReadout"></p>';
 const bindings=[['exploreD','taskD'],['exploreAlpha','taskAlpha'],['exploreA','taskA'],['exploreCentral','taskCentral'],['exploreBeta','taskBeta']];
 for(const[id,key]of bindings)if($(id))$(id).oninput=e=>{state[key]=Number(e.target.value);$(id+'Out').textContent=e.target.value+(id==='exploreD'||id==='exploreA'?' см':'°');updateTaskModel();};
 if($('explorePlane'))$('explorePlane').oninput=e=>{state.sectionAngle=Number(e.target.value)*Math.PI/180;$('explorePlaneOut').textContent=e.target.value+'°';draw();};
 if($('exploreTurn'))$('exploreTurn').oninput=e=>{state.rotationMode=true;state.angle=Number(e.target.value);$('exploreTurnOut').textContent=e.target.value+'°';draw();};
 if($('exploreRotation'))$('exploreRotation').onclick=()=>{state.rotationMode=!state.rotationMode;state.angle=360;draw();};updateTaskModel();
}

function showSteps(){const t=tasks[taskIndex];$('solution').innerHTML=solutionStep?'<ol>'+t.steps.slice(0,solutionStep).map(s=>'<li>'+s+'</li>').join('')+'</ol>'+(solutionStep===t.steps.length?'<div class="answer"><b>Відповідь</b><br>'+t.answer+'</div>':''):'';$('nextStep').textContent=solutionStep===t.steps.length?'Усі кроки відкрито':'Показати '+(solutionStep?'наступний':'перший')+' крок';$('nextStep').disabled=solutionStep===t.steps.length;}
const quiz=[
 {q:'Яка фігура є основою циліндра?',o:['Коло','Круг','Прямокутник','Еліпс'],c:1,why:'Основа - круг. Коло є його межею, а еліпс - перспективне зображення круга на рисунку.'},
 {q:'Які розміри має осьовий переріз?',o:['r і h','2πr і h','2r і h','r і 2h'],c:2,why:'Осьовий переріз - прямокутник зі сторонами, що дорівнюють діаметру основи 2r та висоті h.'},
 {q:'Як зміниться площа перерізу, паралельного основам, якщо підняти січну площину всередині циліндра?',o:['Збільшиться','Зменшиться','Не зміниться','Залежить від висоти'],c:2,why:'Усі такі перерізи - круги радіуса r, рівні основі. Їхня площа дорівнює πr².'},
 {q:'Чому дорівнює довжина прямокутника розгортки бічної поверхні?',o:['2r','πr²','2πr','πrh'],c:2,why:'Довжина прямокутника дорівнює довжині кола основи: 2πr.'},
 {q:'У задачі 3 прямокутник 1 × 3 см обертають навколо сторони 3 см. Які r і h?',o:['r = 3, h = 1','r = 1, h = 3','r = 2, h = 3','r = 1, h = 6'],c:1,why:'Сторона на осі задає висоту 3 см, а відстань до протилежної сторони - радіус 1 см.'},
 {q:'Радіус збільшили в k разів, а висоту зменшили в k разів. Що сталося з бічною поверхнею?',o:['Зросла в k разів','Зменшилась у k разів','Зросла в k² разів','Не змінилась'],c:3,why:'Добуток rh не змінився: (kr)(h/k) = rh. Тому Sбіч = 2πrh стала.'},
 {q:'Що є проєкцією діагоналі осьового перерізу на площину основи?',o:['Радіус','Діаметр','Висота','Твірна'],c:1,why:'Кінці проєкції - протилежні кінці діаметра основи, тому її довжина 2r.'},
 {q:'Яку площу додаємо до бічної поверхні для посудини без кришки?',o:['Дві основи','Жодної основи','Одну основу','Осьовий переріз'],c:2,why:'Посудина без кришки має бічну поверхню та дно: S = 2πrh + πr².'}
];
function renderQuiz(){const t=quiz[quizIndex];$('quizContent').innerHTML='<div class="quiztop"><div><div class="eyebrow">Самоперевірка</div><b>Запитання '+(quizIndex+1)+' із '+quiz.length+'</b></div><span class="tag">Правильно: '+quizScore+'</span></div><div class="progress"><span style="width:'+100*quizIndex/quiz.length+'%"></span></div><h2 style="margin-top:24px">'+t.q+'</h2><div class="options">'+t.o.map((s,i)=>'<button data-answer="'+i+'"'+(quizAnswered?' disabled':'')+' class="'+(quizAnswered?(i===t.c?'correct':i===quizSelected?'wrong':''):'')+'"><b>'+String.fromCharCode(1040+i)+'</b><span>'+s+'</span></button>').join('')+'</div><div class="feedback '+(quizAnswered?(quizSelected===t.c?'ok':'no'):'')+'" role="status">'+(quizAnswered?(quizSelected===t.c?'✓ Правильно. ':'Правильна відповідь: '+t.o[t.c]+'. ')+t.why:'Обери одну відповідь. Після вибору з’явиться пояснення.')+'</div><button class="primary" id="quizNext" '+(!quizAnswered?'disabled':'')+' style="margin-top:18px">'+(quizIndex===quiz.length-1?'Показати результат':'Далі')+'</button>';
 $('quizContent').querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>{if(quizAnswered)return;quizSelected=Number(b.dataset.answer);quizAnswered=true;if(quizSelected===t.c)quizScore++;renderQuiz();});$('quizNext').onclick=()=>{if(!quizAnswered)return;if(quizIndex<quiz.length-1){quizIndex++;quizAnswered=false;quizSelected=null;renderQuiz();}else{$('quizContent').innerHTML='<div class="eyebrow">Спробу завершено</div><h2>Твій результат</h2><p class="scorebig">'+quizScore+' / '+quiz.length+'</p><p>'+(quizScore>=7?'Ти добре розрізняєш елементи, перерізи та площі циліндра.':quizScore>=4?'Повтори означення та формули, потім спробуй ще раз.':'Повернися до моделі й теорії та досліди кожен елемент окремо.')+'</p><button class="primary" id="quizRestart">Нова спроба</button> <button id="quizTheory">До теорії</button>';$('quizRestart').onclick=()=>{quizIndex=0;quizScore=0;quizAnswered=false;quizSelected=null;renderQuiz();};$('quizTheory').onclick=()=>setTab('theory');}};
}
// Pure calculations are exposed for deterministic verification without external dependencies.
window.CylinderLesson={areas,tasks,quiz};
document.documentElement.dataset.theme='light';setTab('model',false);sync();resize();
})();
