/* =========================================================
   trwells.com: case-study pages (par.html, gspro-analytics.html)
   Hero tracks, reveals, the process rail, count-ups and the
   screen viewer. Vanilla JS, no dependencies. Cached like
   styles.css, so bump the ?v= on its <script> when it changes.
   ========================================================= */
(()=>{
'use strict';
const D=document.documentElement,motion=D.classList.contains('motion');
const $=(s,c=document)=>c.querySelector(s),$$=(s,c=document)=>[...c.querySelectorAll(s)];
const clamp=(v,a=0,b=1)=>v<a?a:v>b?b:v;
const f1=v=>v.toFixed(1);
const mul=a=>()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};

/* ---------- small facts ---------- */
$$('.year').forEach(e=>{e.textContent=String(new Date().getFullYear())});

/* ---------- hero: a few seeded tracks behind the title ---------- */
(()=>{const svg=$('.tracks');if(!svg)return;const r=mul(+(svg.dataset.seed||1978));let o='';
  const spiral=(x,y,a,q,R,k)=>{let d='';for(let i=0;i<600;i++){const da=3/R;a+=q*da;R*=Math.exp(-k*da);if(R<7)break;x+=Math.cos(a)*3;y+=Math.sin(a)*3;d+='L'+f1(x)+' '+f1(y)}return d};
  const V=[[260,240],[1180,170],[1270,620],[170,720],[1010,840]];
  V.forEach(([vx,vy],k)=>{const bx=vx<720?-40:1480,by=vy+(r()-.5)*120,red=k===1;
    o+='<path class="b" pathLength="1" style="--k:'+k+'" d="M'+bx+' '+f1(by)+'L'+vx+' '+vy+'"/>';
    for(let j=0;j<(red?3:2);j++){const q=r()<.5?-1:1;o+='<path class="'+(red&&j===0?'r':'')+'" pathLength="1" style="--k:'+(k+j+1)+'" d="M'+vx+' '+vy+spiral(vx,vy,r()*6.28,q,50+r()*150,.13+r()*.1)+'"/>'}});
  svg.innerHTML=o})();

/* ---------- contact spiral ---------- */
(()=>{const p=$('.spiral path');if(!p)return;let d='M460 -560L460 0';for(let t=0;t<=31.4;t+=.06){const rr=460*Math.exp(-.122*t);d+='L'+f1(Math.cos(t)*rr)+' '+f1(Math.sin(t)*rr)}p.setAttribute('d',d)})();

/* ---------- copy email ---------- */
$$('.copy').forEach(b=>{const lab=$('span',b),sr=$('.sr');let t;
  b.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(b.dataset.copy);b.classList.add('done');lab.textContent='Copied';if(sr)sr.textContent='Email address copied';clearTimeout(t);t=setTimeout(()=>{b.classList.remove('done');lab.textContent='Copy email'},2000)}catch(e){location.href='mailto:'+b.dataset.copy}})});

/* ---------- spotlight on cards ---------- */
$$('.spot').forEach(c=>c.addEventListener('pointermove',e=>{const r=c.getBoundingClientRect();c.style.setProperty('--mx',(e.clientX-r.left)+'px');c.style.setProperty('--my',(e.clientY-r.top)+'px')}));

/* ---------- nav: these pages live under Work ---------- */
const nav=$('.nav'),ind=$('.ind'),cur=$('.links a.on');
const placeInd=()=>{if(!ind||!cur||!cur.offsetWidth)return;ind.style.left=cur.offsetLeft+'px';ind.style.width=cur.offsetWidth+'px';ind.style.opacity='1'};
placeInd();addEventListener('resize',placeInd);if(document.fonts)document.fonts.ready.then(placeInd);

/* ---------- screens: missing files show a placeholder ---------- */
$$('.shot img').forEach(im=>{const miss=()=>im.closest('.shot').classList.add('missing');im.addEventListener('error',miss);if(im.complete&&im.naturalWidth===0)miss()});

/* ---------- screen viewer ---------- */
(()=>{const box=$('#lb');if(!box)return;
  const img=$('img',box),cap=$('figcaption',box),count=$('.count',box),shots=$$('.shot');let idx=0,open=false,back=null;
  const avail=()=>shots.filter(s=>!s.classList.contains('missing'));
  function show(i){const list=avail();if(!list.length)return;idx=(i+list.length)%list.length;const s=list[idx];
    img.src=s.dataset.src;img.alt=s.dataset.caption||'';cap.textContent=s.dataset.caption||'';
    count.textContent=String(idx+1).padStart(2,'0')+' / '+String(list.length).padStart(2,'0')}
  function openAt(s){if(s.classList.contains('missing'))return;back=s;show(avail().indexOf(s));box.hidden=false;box.classList.add('on');open=true;document.body.style.overflow='hidden';$('.x',box).focus()}
  function close(){box.classList.remove('on');box.hidden=true;open=false;document.body.style.overflow='';if(back)back.focus()}
  shots.forEach(s=>s.addEventListener('click',()=>openAt(s)));
  $('.x',box).addEventListener('click',close);$('.p',box).addEventListener('click',()=>show(idx-1));$('.n',box).addEventListener('click',()=>show(idx+1));
  box.addEventListener('click',e=>{if(e.target===box)close()});
  addEventListener('keydown',e=>{if(!open)return;if(e.key==='Escape')close();else if(e.key==='ArrowLeft')show(idx-1);else if(e.key==='ArrowRight')show(idx+1)})})();

if(!motion){
  addEventListener('scroll',()=>nav.classList.toggle('solid',scrollY>40),{passive:true});
  return;
}

/* ---------- reveals ---------- */
const io=new IntersectionObserver(es=>{es.forEach(e=>{if(!e.isIntersecting)return;e.target.classList.add('in');io.unobserve(e.target)})},{rootMargin:'0px 0px -8% 0px'});
$$('.rv').forEach(el=>io.observe(el));

/* ---------- hero title: words blur in one at a time ---------- */
$$('[data-words]').forEach(h=>{let i=0;
  const walk=n=>{[...n.childNodes].forEach(c=>{
    if(c.nodeType===3){const f=document.createDocumentFragment();
      c.textContent.split(/(\s+)/).forEach(t=>{if(!t)return;if(/^\s+$/.test(t)){f.appendChild(document.createTextNode(t));return}const s=document.createElement('span');s.className='wd';s.textContent=t;s.style.setProperty('--i',i++);f.appendChild(s)});
      c.replaceWith(f)}
    else if(c.nodeType===1)walk(c)})};
  walk(h)});

/* ---------- count-ups ---------- */
const count=el=>{const to=+el.dataset.count,suf=el.dataset.suf||'',t0=performance.now(),dur=1600;
  const step=now=>{const k=clamp((now-t0)/dur),v=Math.round(to*(1-Math.pow(1-k,3)));el.innerHTML=v.toLocaleString('en-US')+(suf?'<em>'+suf+'</em>':'');if(k<1)requestAnimationFrame(step)};requestAnimationFrame(step)};
const cio=new IntersectionObserver(es=>{es.forEach(e=>{if(!e.isIntersecting)return;count(e.target);cio.unobserve(e.target)})},{threshold:.6});
$$('[data-count]').forEach(el=>{el.innerHTML='0'+(el.dataset.suf?'<em>'+el.dataset.suf+'</em>':'');cio.observe(el)});

/* ---------- scroll: the screenshot settles, the rail fills, the spiral draws ---------- */
const dev=$('.device'),tracks=$('.tracks'),rail=$('.rail i'),steps=$('.steps'),items=$$('.step'),spiral=$('.spiral path'),contact=$('.contact');
let queued=false,onStep=-2;
function update(){const y=scrollY,vh=innerHeight;
  if(dev){const hp=clamp(y/(vh*.75));dev.style.transform='rotateX('+f1(20*(1-hp))+'deg) scale('+(.93+.07*hp).toFixed(4)+') translateY('+f1(30*(1-hp))+'px)'}
  if(tracks)tracks.style.transform='translate3d(0,'+f1(clamp(y/vh,0,1.5)*vh*.2)+'px,0)';
  if(steps&&rail){const r=steps.getBoundingClientRect();rail.style.setProperty('--p',clamp((vh*.7-r.top)/Math.max(1,r.height)).toFixed(4));
    let a=-1;items.forEach((s,i)=>{if(s.getBoundingClientRect().top<vh*.62)a=i});
    if(a!==onStep){onStep=a;items.forEach((s,i)=>s.classList.toggle('on',i<=a))}}
  if(spiral&&contact){const t=contact.getBoundingClientRect().top;spiral.style.strokeDashoffset=(1-clamp((vh-t)/(vh*1.1))).toFixed(4)}
  nav.classList.toggle('solid',y>40)}
const req=()=>{if(!queued){queued=true;requestAnimationFrame(()=>{queued=false;update()})}};
addEventListener('scroll',req,{passive:true});addEventListener('resize',req);update();

Promise.race([document.fonts?document.fonts.ready:Promise.resolve(),new Promise(r=>setTimeout(r,1800))]).then(()=>{placeInd();update();requestAnimationFrame(()=>D.classList.add('ready'))});
})();
