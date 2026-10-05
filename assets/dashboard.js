/* =========================================================
   trwells.com: the Business Overview report (index.html, work 02)
   A native rebuild of a Power BI report: its two pages, measures
   and filters, drawn as SVG over sample data generated here from
   a fixed seed. Nothing comes from the original data model.
   Vanilla JS, no dependencies. Cached like styles.css, so bump
   the ?v= on its <script> when it changes.
   ========================================================= */
(()=>{
'use strict';
const root=document.getElementById('bd');if(!root)return;
const app=root.querySelector('.bd-app');
const motion=document.documentElement.classList.contains('motion');
const $=(s,c=root)=>c.querySelector(s),$$=(s,c=root)=>[...c.querySelectorAll(s)];
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const r1=v=>Math.round(v*10)/10;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
const fmt=n=>Math.round(n).toLocaleString('en-US');
const sgn=n=>(n>0?'+':n<0?'−':'')+fmt(Math.abs(n));
const pc=v=>Math.round(v*100)+'%';
const sum=a=>a.reduce((s,v)=>s+v,0);
const med=a=>{if(!a.length)return 0;const s=[...a].sort((x,y)=>x-y),m=s.length>>1;return s.length%2?s[m]:(s[m-1]+s[m])/2};
const mul=a=>()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};

/* ---------- calendar: fiscal years run Oct 1 to Sep 30 ---------- */
const DAY=864e5,day=(y,m,d)=>Math.round(Date.UTC(y,m,d)/DAY),dt=n=>new Date(n*DAY);
const MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const fyS=fy=>day(fy-1,9,1),fyE=fy=>day(fy,8,30);
const fyOf=n=>{const d=dt(n);return d.getUTCFullYear()+(d.getUTCMonth()>=9?1:0)};
const fm=n=>(dt(n).getUTCMonth()+3)%12;                 // fiscal month, 0 = October
const fmName=(i,fy)=>MON[(i+9)%12]+' '+(i<3?fy-1:fy);
const dLong=n=>{const d=dt(n);return MON[d.getUTCMonth()]+' '+d.getUTCDate()+', '+d.getUTCFullYear()};
const dShort=n=>{const d=dt(n);return MON[d.getUTCMonth()]+' '+d.getUTCDate()};
const dIso=n=>dt(n).toISOString().slice(0,10);
const AS_OF=day(2026,8,30),CUR=2026,FYS=[2024,2025,2026];
const fyl=fy=>'FY'+String(fy%100).padStart(2,'0');

/* ---------- the model's shape: action groups and categories ---------- */
const GROUPS=[['Acquisition Management','Acquisition'],['Advance Notification','Advance notice'],['Audit','Audit'],['Interagency Agreement','Interagency'],['Procurement','Procurement'],['Subcontract Review','Subcontracts'],['Technology Transfer','Tech transfer'],['Wage Determination','Wage determination']];
const COL=GROUPS.map((_,g)=>'var(--bd-c'+g+')');
// name, short name, group, weight, median days, days allowed, needs approval, titles
const CATS=[
  ['Acquisition Management','Acquisition management',0,6,14,21,1,['Acquisition plan review','Contract modification','Option exercise','Delegation of authority']],
  ['Advance Notification','Advance notification',1,9,2,5,0,['Advance notice: subcontract award','Advance notice: sole-source award','Advance notice: consultant agreement']],
  ['Audit','Audit',2,3,28,45,0,['Incurred cost audit follow-up','Internal audit report','Audit finding closeout']],
  ['Interagency Agreement','Interagency agreement',3,5,20,30,1,['Interagency agreement','Interagency agreement modification','Interagency funding amendment']],
  ['Procurement','Procurement',4,13,9,14,1,['Purchase request review','Sole-source justification','Price reasonableness review','Requisition approval']],
  ['Procurement - PERT CAP','Procurement · PERT CAP',4,4,12,21,1,['Corrective action plan','Corrective action status update']],
  ['Subcontract Review','Subcontract review',5,15,7,10,1,['Subcontract consent','Subcontract modification consent','Subcontract award review']],
  ['Subcontract Review - LBNF Supplemental Agreement','Subcontract · LBNF',5,5,16,21,1,['Supplemental agreement','Supplemental agreement modification']],
  ['Subcontract Review - Other','Subcontract · other',5,6,10,14,1,['Time-and-materials subcontract','Subcontract option review']],
  ['Technology Transfer - CRADA','Tech transfer · CRADA',6,4,32,45,1,['CRADA proposal','CRADA amendment','CRADA joint work statement']],
  ['Technology Transfer - FOA','Tech transfer · FOA',6,2,18,30,1,['Partnership letter','Team application review']],
  ['Technology Transfer - Other','Tech transfer · other',6,3,14,21,1,['License agreement review','Nondisclosure agreement']],
  ['Technology Transfer - SPP','Tech transfer · SPP',6,6,22,30,1,['SPP agreement','SPP proposal review','SPP amendment']],
  ['Wage Determination - Davis Bacon','Wage · Davis-Bacon',7,5,6,10,1,['Davis-Bacon wage determination','Davis-Bacon modification']],
  ['Wage Determination - Service Contract Act','Wage · SCA',7,3,8,14,1,['Service Contract Act wage determination','Wage determination update']]];
const ROLES=[['Contracting Officer 1','Contracting Officer 2'],['Contract Specialist 1','Contract Specialist 2','Contract Specialist 3'],['Audit Liaison'],['Contracting Officer 1','Contracting Officer 2'],['Contract Specialist 1','Contract Specialist 2','Contract Specialist 3','Contract Specialist 4'],['Contract Specialist 2','Contract Specialist 3','Contract Specialist 4','Contracting Officer 2'],['Tech Transfer Lead 1','Tech Transfer Lead 2'],['Labor Standards Lead']];
const SEASON=[.95,1,1.05,1,1,1.05,1.1,1.2,1.4,.9,.95,.72];   // by calendar month: a September rush, a December lull

/* ---------- sample data: about 900 items a year, FY23 to FY26 ---------- */
const items=(()=>{
  const rnd=mul(41126),out=[],seq={};
  const gauss=()=>{let u=0;while(!u)u=rnd();return Math.sqrt(-2*Math.log(u))*Math.cos(6.2831853*rnd())};
  const pois=l=>{const L=Math.exp(-l);let k=0,p=1;do{k++;p*=rnd()}while(p>L);return k-1};
  const W=sum(CATS.map(c=>c[3]));
  const pick=()=>{let x=rnd()*W;for(let i=0;i<CATS.length;i++){x-=CATS[i][3];if(x<0)return i}return 0};
  const t0=fyS(2023);
  for(let d=t0;d<=AS_OF;d++){const w=dt(d).getUTCDay();if(w===0||w===6)continue;
    const n=pois(2.9*Math.pow(1.06,(d-t0)/365)*SEASON[dt(d).getUTCMonth()]);
    for(let k=0;k<n;k++){const c=pick(),C=CATS[c],g=C[2];
      const days=Math.max(1,Math.round(Math.exp(Math.log(C[4])+.55*gauss())*(rnd()<.025?3+rnd()*5:1)));
      const done=d+days,open=done>AS_OF,fy=fyOf(d),pool=ROLES[g];seq[fy]=(seq[fy]||0)+1;
      out.push({id:'BD-'+String(fy%100)+'-'+String(seq[fy]).padStart(4,'0'),t:C[7][Math.floor(rnd()*C[7].length)],c,g,a:pool[Math.floor(rnd()*pool.length)],
        r:d,due:d+C[5],done:open?null:done,st:open?'OPEN':(!C[6]&&rnd()<.85?'INFO ONLY':'CLOSED'),days:open?null:days})}}
  return out})();

/* ---------- state: one filter row scopes every visual ---------- */
const S0={pg:'ov',fy:CUR,g:-1,ap:false,vw:'m'};
let S={...S0};
const tables=new Set();let sort={k:'due',d:1};
const pass=i=>(S.g<0||i.g===S.g)&&(!S.ap||CATS[i.c][6]);

/* ---------- measures ---------- */
function overview(){
  const fy=S.fy,s=fyS(fy),e=fyE(fy),an=Math.min(AS_OF,e),all=items.filter(pass);
  const rec=all.filter(i=>i.r>=s&&i.r<=e),doneIn=all.filter(i=>i.done!=null&&i.done>=s&&i.done<=e);
  const open=rec.filter(i=>i.st==='OPEN'),comp=rec.length-open.length;
  const mr=Array(12).fill(0),mc=Array(12).fill(0),pr=Array(12).fill(0),ps=fyS(fy-1),pe=fyE(fy-1);
  all.forEach(i=>{if(i.r>=s&&i.r<=e)mr[fm(i.r)]++;if(i.r>=ps&&i.r<=pe)pr[fm(i.r)]++;if(i.done!=null&&i.done>=s&&i.done<=e)mc[fm(i.done)]++});
  const me=an>=e?12:fm(an)+1;
  const net=Array(96).fill(0),n0=an-95;
  all.forEach(i=>{if(i.r>=n0&&i.r<=an)net[i.r-n0]++;if(i.done!=null&&i.done>=n0&&i.done<=an)net[i.done-n0]--});
  const roll=[];for(let k=6;k<96;k++)roll.push({d:n0+k,v:sum(net.slice(k-6,k+1))/7});
  const days=doneIn.map(i=>i.days),cur=sum(mr.slice(0,me)),prev=sum(pr.slice(0,me));
  const cats=CATS.map((C,c)=>{const r=rec.filter(i=>i.c===c).length,d=doneIn.filter(i=>i.c===c);return{c,r,d:d.length,n:r-d.length,m:med(d.map(i=>i.days))}}).filter(x=>x.r||x.d).sort((a,b)=>b.r-a.r||a.c-b.c);
  return{fy,an,me,rec:rec.length,comp,open:open.length,og:GROUPS.map((_,g)=>open.filter(i=>i.g===g).length),
    mr,mc,pr,nf:sum(net.slice(66)),roll,days,mn:days.length?Math.min(...days):0,md:med(days),mx:days.length?Math.max(...days):0,
    vg:GROUPS.map((_,g)=>rec.filter(i=>i.g===g).length),yoy:prev?(cur-prev)/prev:0,cur,prev,cats,
    tot:{r:rec.length,d:doneIn.length,n:rec.length-doneIn.length,m:med(days)}}
}
const BUCKETS=[['0–7',0,7],['8–14',8,14],['15–30',15,30],['31–60',31,60],['61+',61,1e9]];
function workload(){
  const all=items.filter(pass),open=all.filter(i=>i.st==='OPEN').map(i=>({...i,age:AS_OF-i.r}));
  const od=open.filter(i=>i.due<AS_OF),d7=open.filter(i=>i.due>=AS_OF&&i.due<AS_OF+7);
  const fc=Array(14).fill(0);open.forEach(i=>{const k=i.due-AS_OF;if(k>=0&&k<14)fc[k]++});
  const days=all.filter(i=>i.done!=null&&i.done>=fyS(CUR)&&i.done<=fyE(CUR)).map(i=>i.days),ages=open.map(i=>i.age);
  const by=(f)=>{const m=new Map();open.forEach(i=>{const k=f(i);m.set(k,(m.get(k)||0)+1)});return[...m].sort((a,b)=>b[1]-a[1]||(a[0]>b[0]?1:-1))};
  return{open,od,d7,fc,nd:days.length,og:GROUPS.map((_,g)=>open.filter(i=>i.g===g).length),
    mn:days.length?Math.min(...days):0,md:med(days),mx:days.length?Math.max(...days):0,
    amn:ages.length?Math.min(...ages):0,amd:med(ages),amx:ages.length?Math.max(...ages):0,
    byA:by(i=>i.a),byC:by(i=>i.c),age:BUCKETS.map(([,a,z])=>GROUPS.map((_,g)=>open.filter(i=>i.g===g&&i.age>=a&&i.age<=z).length))}
}

/* ---------- drawing helpers ---------- */
const T={};      // hover and focus behavior per visual, keyed by data-c
const nice=(max,n=4)=>{if(max<=0)max=1;const raw=max/n,p=Math.pow(10,Math.floor(Math.log10(raw))),f=raw/p,st=Math.max(1,(f<=1?1:f<=2?2:f<=5?5:10)*p),top=Math.ceil(max/st)*st,t=[];for(let v=0;v<=top+1e-9;v+=st)t.push(v);return{max:top,t}};
// a bar with a 4px rounded data end, square at the baseline (b), running to the value (v)
function col(x,w,b,v,fill,cls,i){const h=Math.abs(b-v);if(h<.5||w<=0)return'';const r=Math.min(4,w/2,h),up=v<b;
  const d=up?'M'+r1(x)+' '+r1(b)+'V'+r1(v+r)+'Q'+r1(x)+' '+r1(v)+' '+r1(x+r)+' '+r1(v)+'H'+r1(x+w-r)+'Q'+r1(x+w)+' '+r1(v)+' '+r1(x+w)+' '+r1(v+r)+'V'+r1(b)+'Z'
            :'M'+r1(x)+' '+r1(b)+'V'+r1(v-r)+'Q'+r1(x)+' '+r1(v)+' '+r1(x+r)+' '+r1(v)+'H'+r1(x+w-r)+'Q'+r1(x+w)+' '+r1(v)+' '+r1(x+w)+' '+r1(v-r)+'V'+r1(b)+'Z';
  return'<path class="bd-m'+(up?'':' bd-dn')+(cls?' '+cls:'')+'" style="fill:'+fill+(i!=null?';--i:'+i:'')+'" d="'+d+'"/>'}
function hbar(x,y,len,th,fill,i){if(len<.5)return'';const r=Math.min(4,th/2,len);
  return'<path class="bd-m bd-mh" style="fill:'+fill+';--i:'+i+'" d="M'+r1(x)+' '+r1(y)+'H'+r1(x+len-r)+'Q'+r1(x+len)+' '+r1(y)+' '+r1(x+len)+' '+r1(y+r)+'V'+r1(y+th-r)+'Q'+r1(x+len)+' '+r1(y+th)+' '+r1(x+len-r)+' '+r1(y+th)+'H'+r1(x)+'Z"/>'}
const svg=(k,w,h,label,body)=>'<svg class="bd-svg" width="'+w+'" height="'+h+'" viewBox="0 0 '+w+' '+h+'" role="img" tabindex="0" aria-label="'+esc(label)+'" data-c="'+k+'">'+body+'</svg>';
const hl='<rect class="bd-hl" rx="6" width="0" height="0"/>';
const fit=(s,n)=>s.length>n?s.slice(0,Math.max(1,n-1)).trimEnd()+'…':s;
const grid=(ax,y,x0,x1)=>ax.t.map(t=>'<line class="bd-gl'+(t?'':' bd-bl')+'" x1="'+x0+'" x2="'+x1+'" y1="'+r1(y(t))+'" y2="'+r1(y(t))+'"/><text x="'+(x0-8)+'" y="'+r1(y(t)+3.5)+'" text-anchor="end">'+fmt(t)+'</text>').join('');
const row=(k,v,l)=>({k,v,l});
const gut=ax=>Math.round(Math.max(26,fmt(ax.max).length*6.2+14));   // room for the widest tick label

/* ---------- visuals ---------- */
const V={};
// Received vs completed: monthly columns over a net-flow strip, one count scale each (never a second axis)
V.rc=(w,M)=>{const ax=nice(Math.max(...M.mr,...M.mc)),pl=gut(ax),pr=4,pt=10,ph=150,gap=26,nh=48,xb=20,h=pt+ph+gap+nh+6+xb,n=12,bw=(w-pl-pr)/n,bar=Math.max(3,Math.min(24,(bw*.66-2)/2));
  const y=v=>pt+ph-v/ax.max*ph;
  const nt=pt+ph+gap,mx=Math.max(1,...M.mr.map((v,i)=>Math.abs(v-M.mc[i]))),z=nt+nh/2,ny=v=>z-v/mx*(nh/2);
  let o=grid(ax,y,pl,w-pr)+hl;
  o+='<text class="bd-pt" x="'+pl+'" y="'+(nt-9)+'">Net flow</text><line class="bd-gl bd-bl" x1="'+pl+'" x2="'+(w-pr)+'" y1="'+z+'" y2="'+z+'"/><text x="'+(pl-8)+'" y="'+(z+3.5)+'" text-anchor="end">0</text>';
  for(let i=0;i<n;i++){const cx=pl+bw*i+bw/2,nv=M.mr[i]-M.mc[i];
    o+=col(cx-bar-1,bar,y(0),y(M.mr[i]),'var(--bd-mute)','',i)+col(cx+1,bar,y(0),y(M.mc[i]),'var(--bd-ink)','',i)+col(cx-bar/2,bar,z,ny(nv),nv>0?'var(--red)':'var(--bd-mute)','',i);
    o+='<text x="'+r1(cx)+'" y="'+(h-5)+'" text-anchor="middle">'+(bw<30?MON[(i+9)%12][0]:MON[(i+9)%12])+'</text>';
    o+='<rect class="bd-hit" data-i="'+i+'" x="'+r1(pl+bw*i)+'" y="'+pt+'" width="'+r1(bw)+'" height="'+(nt+nh-pt)+'"/>'}
  T.rc={n,box:i=>[pl+bw*i+1,pt-4,bw-2,nt+nh-pt+8],tip:i=>({h:fmName(i,M.fy),rows:[row('var(--bd-mute)',fmt(M.mr[i]),'Received'),row('var(--bd-ink)',fmt(M.mc[i]),'Completed')],f:'Net flow '+sgn(M.mr[i]-M.mc[i])})};
  return{svg:svg('rc',w,h,'Columns: items received and completed each month of '+fyl(M.fy)+', with monthly net flow below.',o),
    table:{cols:['Month','Received','Completed','Net flow'],rows:M.mr.map((v,i)=>[fmName(i,M.fy),fmt(v),fmt(M.mc[i]),sgn(v-M.mc[i])])}}};
// a horizontal bar list, one series; key() draws a swatch beside the label when the color carries identity
function bars(k,w,data,{label,fill,key,full,unit,lw:lwMax,minH}){
  if(!data.length)return{svg:'<p class="bd-empty">Nothing open for this filter.</p>',table:{cols:['',unit],rows:[]}};
  const rh=Math.max(26,Math.min(34,(minH||0)/Math.max(1,data.length))),th=10,pt=4,h=Math.max(rh,data.length*rh)+pt*2,cw=6.1,lw=Math.min(lwMax||200,Math.max(...data.map(d=>d.l.length),4)*cw+(key?16:0)+12,w*.5);
  const max=Math.max(1,...data.map(d=>d.v)),x0=lw,x1=w-36,sc=v=>v/max*(x1-x0);
  let o=hl+'<line class="bd-gl bd-bl" x1="'+x0+'" x2="'+x0+'" y1="'+pt+'" y2="'+(h-pt)+'"/>';
  data.forEach((d,i)=>{const yy=pt+i*rh,yc=yy+rh/2,chars=Math.floor((lw-(key?16:0)-12)/cw);
    if(key)o+='<rect x="0" y="'+r1(yc-4)+'" width="8" height="8" rx="2" style="fill:'+key(d)+'"/>';
    o+='<text class="bd-lbl" x="'+(key?14:0)+'" y="'+r1(yc+4)+'">'+esc(fit(d.l,chars))+'</text>';
    o+=hbar(x0,yc-th/2,sc(d.v),th,fill(d),i)+'<text class="bd-v" x="'+r1(x0+sc(d.v)+6)+'" y="'+r1(yc+3.5)+'">'+fmt(d.v)+'</text>';
    o+='<rect class="bd-hit" data-i="'+i+'" x="0" y="'+yy+'" width="'+w+'" height="'+rh+'"/>'});
  const tot=sum(data.map(d=>d.v));
  T[k]={n:data.length,box:i=>[-6,pt+i*rh,w+12,rh],tip:i=>({h:full(data[i]),rows:[row(key?key(data[i]):fill(data[i]),fmt(data[i].v),unit)],f:tot?pc(data[i].v/tot)+' of the total':''})};
  return{svg:svg(k,w,h,label,o),table:{cols:['',unit],rows:data.map(d=>[full(d),fmt(d.v)])}}}
V.vg=(w,M)=>{const data=M.vg.map((v,g)=>({g,v,l:GROUPS[g][0]})).filter(d=>d.v||S.g<0).sort((a,b)=>b.v-a.v||a.g-b.g);
  if(w<360)data.forEach(d=>d.l=GROUPS[d.g][1]);
  return bars('vg',w,data,{label:'Bars: items received in '+fyl(M.fy)+' by action group.',fill:()=>'var(--bd-one)',key:d=>COL[d.g],full:d=>GROUPS[d.g][0],unit:'Received',minH:276})};
// Current FY vs last FY: two lines on one scale, monthly or running total
V.yy=(w,M)=>{const cum=S.vw==='c',acc=a=>{let s=0;return a.map(v=>s+=v)};
  const cur=(cum?acc(M.mr):M.mr).slice(0,M.me),prev=cum?acc(M.pr):M.pr,ax=nice(Math.max(...cur,...prev)),pl=gut(ax),pr=42,pt=12,xb=20,h=230,ph=h-pt-xb,n=12,bw=(w-pl-pr)/n;
  const y=v=>pt+ph-v/ax.max*ph,x=i=>pl+bw*i+bw/2,pts=a=>a.map((v,i)=>r1(x(i))+' '+r1(y(v))).join('L');
  let o=grid(ax,y,pl,w-pr)+'<rect class="bd-hl bd-x" width="0" height="0"/>';
  o+='<path class="bd-area" d="M'+r1(x(0))+' '+r1(y(0))+'L'+pts(cur)+'L'+r1(x(cur.length-1))+' '+r1(y(0))+'Z"/>';
  o+='<path class="bd-ln" pathLength="1" style="stroke:var(--bd-mute)" d="M'+pts(prev)+'"/><path class="bd-ln" pathLength="1" style="stroke:var(--bd-ink)" d="M'+pts(cur)+'"/>';
  const ec=cur.length-1,ep=11,yc=y(cur[ec]),yp=y(prev[ep]);
  o+='<circle class="bd-dot" r="4" cx="'+r1(x(ep))+'" cy="'+r1(yp)+'" style="fill:var(--bd-mute)"/><circle class="bd-dot" r="4" cx="'+r1(x(ec))+'" cy="'+r1(yc)+'" style="fill:var(--bd-ink)"/>';
  if(ec!==ep||Math.abs(yc-yp)>16)o+='<text class="bd-v" x="'+r1(x(ec)+9)+'" y="'+r1(yc+3.5)+'">'+fyl(M.fy)+'</text><text x="'+r1(x(ep)+9)+'" y="'+r1(yp+3.5)+'">'+fyl(M.fy-1)+'</text>';
  for(let i=0;i<n;i++)o+='<text x="'+r1(x(i))+'" y="'+(h-5)+'" text-anchor="middle">'+(bw<30?MON[(i+9)%12][0]:MON[(i+9)%12])+'</text>';
  o+='<g class="bd-hd"></g><rect class="bd-hit" data-x="1" x="'+pl+'" y="'+pt+'" width="'+r1(w-pl-pr)+'" height="'+ph+'"/>';
  const what=cum?'Running total':'Received';
  T.yy={n,xs:[...Array(n)].map((_,i)=>x(i)),box:i=>[x(i)-.5,pt,1,ph],dots:i=>[[x(i),y(prev[i]),'var(--bd-mute)']].concat(i<cur.length?[[x(i),y(cur[i]),'var(--bd-ink)']]:[]),
    tip:i=>({h:MON[(i+9)%12]+(cum?', year to date':''),rows:(i<cur.length?[row('var(--bd-ink)',fmt(cur[i]),fyl(M.fy))]:[]).concat([row('var(--bd-mute)',fmt(prev[i]),fyl(M.fy-1))]),
      f:i<cur.length&&prev[i]?(cur[i]>=prev[i]?'+':'−')+Math.abs(Math.round((cur[i]-prev[i])/prev[i]*100))+'% on '+fyl(M.fy-1):''})};
  return{svg:svg('yy',w,h,'Lines: '+what.toLowerCase()+' by month, '+fyl(M.fy)+' against '+fyl(M.fy-1)+'.',o),
    table:{cols:['Month',fyl(M.fy),fyl(M.fy-1)],rows:prev.map((v,i)=>[MON[(i+9)%12],i<cur.length?fmt(cur[i]):'–',fmt(v)])}}};
V.oa=(w,M)=>bars('oa',w,M.byA.map(([a,v])=>({a,v,l:a})),{label:'Bars: open items by assignee.',fill:()=>'var(--bd-one)',full:d=>d.a,unit:'Open items'});
V.oc=(w,M)=>bars('oc',w,M.byC.map(([c,v])=>({c,v,l:CATS[c][1]})),{label:'Bars: open items by category, colored by action group.',fill:d=>COL[CATS[d.c][2]],full:d=>CATS[d.c][0],unit:'Open items'});
// Open items by age: stacked columns, a 2px surface gap between segments
V.ag=(w,M)=>{const tots=M.age.map(sum),ax=nice(Math.max(...tots)),pl=gut(ax),pr=4,pt=20,xb=20,h=250,ph=h-pt-xb,n=BUCKETS.length,bw=(w-pl-pr)/n,bar=Math.min(24,bw*.5);
  const y=v=>pt+ph-v/ax.max*ph;
  let o=grid(ax,y,pl,w-pr)+hl;
  M.age.forEach((gs,i)=>{const cx=pl+bw*i+bw/2;let acc=0;const last=gs.reduce((l,v,g)=>v?g:l,-1);
    gs.forEach((v,g)=>{if(!v)return;const b=y(acc)-(acc?1:0),t=y(acc+v)+(g===last?0:1);acc+=v;
      o+=g===last?col(cx-bar/2,bar,b,t,COL[g],'',i):(b-t>.5?'<rect class="bd-m" style="fill:'+COL[g]+';--i:'+i+'" x="'+r1(cx-bar/2)+'" y="'+r1(t)+'" width="'+r1(bar)+'" height="'+r1(b-t)+'"/>':'')});
    if(tots[i])o+='<text class="bd-v" x="'+r1(cx)+'" y="'+r1(y(tots[i])-7)+'" text-anchor="middle">'+tots[i]+'</text>';
    o+='<text x="'+r1(cx)+'" y="'+(h-5)+'" text-anchor="middle">'+BUCKETS[i][0]+'</text><rect class="bd-hit" data-i="'+i+'" x="'+r1(pl+bw*i)+'" y="0" width="'+r1(bw)+'" height="'+(pt+ph)+'"/>'});
  T.ag={n,box:i=>[pl+bw*i+4,pt-18,bw-8,ph+20],tip:i=>({h:BUCKETS[i][0]+' days open',rows:M.age[i].map((v,g)=>v?row(COL[g],fmt(v),GROUPS[g][0]):null).filter(Boolean),f:fmt(tots[i])+' open items'})};
  return{svg:svg('ag',w,h,'Stacked columns: open items by days open, split by action group.',o),
    table:{cols:['Days open'].concat(GROUPS.map(g=>g[1]),'Total'),rows:M.age.map((gs,i)=>[BUCKETS[i][0]].concat(gs.map(fmt),fmt(tots[i])))}}};

/* ---------- tile minis ---------- */
// sparkline: the de-emphasis line with a 10% wash, the latest point in the accent
function spark(k,w,vals,tipf,zero){const h=44,p=5,n=vals.length,lo=Math.min(0,...vals),hi=Math.max(1,...vals),x=i=>p+(w-2*p)*(n<2?0:i/(n-1)),y=v=>p+(h-2*p)*(1-(v-lo)/(hi-lo||1));
  const d=vals.map((v,i)=>r1(x(i))+' '+r1(y(v))).join('L');
  let o='<rect class="bd-hl bd-x" width="0" height="0"/>';
  if(zero)o+='<line class="bd-gl bd-bl" x1="0" x2="'+w+'" y1="'+r1(y(0))+'" y2="'+r1(y(0))+'"/>';
  o+='<path class="bd-area bd-sp" d="M'+r1(x(0))+' '+r1(y(zero?0:lo))+'L'+d+'L'+r1(x(n-1))+' '+r1(y(zero?0:lo))+'Z"/><path class="bd-ln" pathLength="1" style="stroke:var(--bd-mute)" d="M'+d+'"/>';
  o+='<circle class="bd-dot" r="4" cx="'+r1(x(n-1))+'" cy="'+r1(y(vals[n-1]))+'" style="fill:var(--red)"/><g class="bd-hd"></g><rect class="bd-hit" data-x="1" x="0" y="0" width="'+w+'" height="'+h+'"/>';
  T[k]={n,xs:vals.map((_,i)=>x(i)),box:i=>[x(i)-.5,0,1,h],dots:i=>[[x(i),y(vals[i]),i===n-1?'var(--red)':'var(--bd-ink)']],tip:tipf};
  return svg(k,w,h,'Sparkline',o)}
// min, median and max on one track (the Power BI original drew this with Deneb)
function range(k,w,mn,md,mx,unit){const h=46,p=6,ty=22,x=v=>p+(w-2*p)*(mx>mn?(v-mn)/(mx-mn):.5),xm=clamp(x(md),p+(w-2*p)*.05,p+(w-2*p)*.95);
  let o='<line class="bd-trk" x1="'+p+'" x2="'+(w-p)+'" y1="'+ty+'" y2="'+ty+'"/>';
  o+='<circle class="bd-dot" r="4" cx="'+p+'" cy="'+ty+'" style="fill:var(--bd-mute)"/><circle class="bd-dot" r="4" cx="'+(w-p)+'" cy="'+ty+'" style="fill:var(--bd-mute)"/><circle class="bd-dot" r="5" cx="'+r1(xm)+'" cy="'+ty+'" style="fill:var(--red)"/>';
  o+='<text x="'+r1(clamp(xm,30,w-30))+'" y="9" text-anchor="middle" class="bd-v">median '+r1(md)+'</text><text x="0" y="'+(h-2)+'">min '+fmt(mn)+'</text><text x="'+w+'" y="'+(h-2)+'" text-anchor="end">max '+fmt(mx)+'</text>';
  const pos=[p,xm,w-p],lab=['Minimum','Median','Maximum'],val=[mn,md,mx];
  o+=pos.map((px,i)=>'<rect class="bd-hit" data-i="'+i+'" x="'+r1(px-14)+'" y="'+(ty-14)+'" width="28" height="28"/>').join('');
  T[k]={n:3,box:i=>[pos[i]-9,ty-9,18,18],tip:i=>({h:lab[i],rows:[row(i===1?'var(--red)':'var(--bd-mute)',r1(val[i])+' days',unit)]})};
  return svg(k,w,h,unit+': minimum '+fmt(mn)+', median '+r1(md)+', maximum '+fmt(mx)+' days',o)}
// one bar of shares, groups in slot order, 2px surface gaps
function strip(k,w,counts){const h=26,th=10,ty=8,tot=sum(counts);let o=hl,x=0;const segs=[];
  if(!tot)o+='<rect class="bd-trk2" x="0" y="'+ty+'" width="'+w+'" height="'+th+'" rx="4"/>';
  const nz=counts.map((v,g)=>[v,g]).filter(d=>d[0]),avail=w-2*(nz.length-1);
  nz.forEach(([v,g],j)=>{const sw=v/tot*avail,r=Math.min(4,sw/2),L=j===0,R=j===nz.length-1;
    o+='<path class="bd-m bd-mh" style="fill:'+COL[g]+';--i:'+j+'" d="M'+r1(x+(L?r:0))+' '+ty+'H'+r1(x+sw-(R?r:0))+(R?'Q'+r1(x+sw)+' '+ty+' '+r1(x+sw)+' '+(ty+r)+'V'+(ty+th-r)+'Q'+r1(x+sw)+' '+(ty+th)+' '+r1(x+sw-r)+' '+(ty+th):'V'+(ty+th))+'H'+r1(x+(L?r:0))+(L?'Q'+r1(x)+' '+(ty+th)+' '+r1(x)+' '+(ty+th-r)+'V'+(ty+r)+'Q'+r1(x)+' '+ty+' '+r1(x+r)+' '+ty:'V'+ty)+'Z"/>';
    segs.push([x,sw,v,g]);x+=sw+2});
  o+=segs.map((s,i)=>'<rect class="bd-hit" data-i="'+i+'" x="'+r1(s[0]-1)+'" y="0" width="'+r1(s[1]+2)+'" height="'+h+'"/>').join('');
  T[k]={n:segs.length,box:i=>[segs[i][0]-2,ty-4,segs[i][1]+4,th+8],tip:i=>({h:GROUPS[segs[i][3]][0],rows:[row(COL[segs[i][3]],fmt(segs[i][2]),'Open items')],f:pc(segs[i][2]/tot)+' of open items'})};
  return svg(k,w,h,'Open items by action group: '+nz.map(([v,g])=>GROUPS[g][0]+' '+v).join(', '),o)}
const meter=(v,fill)=>'<div class="bd-mtr" style="--v:'+r1(clamp(v,0,1)*100)+'%;--k:'+fill+'"><i></i></div>';
// the next 14 days of due dates; the first seven are the tile's number
function due14(k,w,fc){const h=44,n=14,bw=w/n,bar=Math.min(10,bw*.56),ax=nice(Math.max(...fc),2),y=v=>h-14-v/ax.max*(h-18);let o=hl;
  fc.forEach((v,i)=>{const cx=bw*i+bw/2;o+=col(cx-bar/2,bar,h-14,y(v),i<7?'var(--bd-ink)':'var(--bd-mute)','',i)+'<rect class="bd-hit" data-i="'+i+'" x="'+r1(bw*i)+'" y="0" width="'+r1(bw)+'" height="'+h+'"/>'});
  o+='<line class="bd-gl bd-bl" x1="0" x2="'+w+'" y1="'+(h-14)+'" y2="'+(h-14)+'"/><text x="0" y="'+(h-2)+'">'+dShort(AS_OF)+'</text><text x="'+w+'" y="'+(h-2)+'" text-anchor="end">'+dShort(AS_OF+13)+'</text>';
  T[k]={n,box:i=>[bw*i,0,bw,h-12],tip:i=>({h:dLong(AS_OF+i),rows:[row(i<7?'var(--bd-ink)':'var(--bd-mute)',fmt(fc[i]),'Due')],f:i?'In '+i+' day'+(i>1?'s':''):'Today'})};
  return svg(k,w,h,'Columns: open items due each day for the next 14 days.',o)}

/* ---------- page shells ---------- */
const INFO={nf:'Items received minus completions. A positive value means demand is exceeding throughput and the backlog is growing. A negative value indicates the office is catching up.',at:'The typical turnaround time from when an item is received to completed.'};
const tile=(label,val,sub,mini,info)=>'<div class="bd-tile"><p class="bd-tl">'+label+(info?'<button type="button" class="bd-i" data-info="'+esc(info)+'" aria-label="About '+label+'">i</button>':'')+'</p><p class="bd-tv">'+val+'</p><p class="bd-ts">'+sub+'</p><div class="bd-tg">'+(mini||'')+'</div></div>';
const slot=k=>'<div class="bd-mini" data-k="'+k+'"></div>';
const tgl=k=>'<button type="button" class="bd-tbl" data-tbl="'+k+'" data-f="tbl-'+k+'" aria-pressed="'+tables.has(k)+'">Table</button>';
const card=(k,span,title,sub,body,extra,legend)=>'<section class="bd-card bd-s'+span+'" aria-label="'+esc(title)+'"><header class="bd-ch"><div><h4>'+title+'</h4>'+(sub?'<p>'+sub+'</p>':'')+'</div><div class="bd-ca">'+(extra||'')+(k&&V[k]?tgl(k):'')+'</div></header><div class="bd-cb"'+(k?' data-k="'+k+'"':'')+'>'+(body||'')+'</div>'+(legend?'<ul class="bd-lg">'+legend+'</ul>':'')+'</section>';
const lgSq=(k,l)=>'<li><i style="background:'+k+'"></i>'+l+'</li>',lgLn=(k,l)=>'<li><i class="ln" style="background:'+k+'"></i>'+l+'</li>';
const gName=()=>S.g<0?'':' · '+GROUPS[S.g][0];

function shellOv(M){
  const top=M.og.map((v,g)=>[v,g]).filter(d=>d[0]).sort((a,b)=>b[0]-a[0]).slice(0,2).map(([v,g])=>GROUPS[g][1]+' '+v).join(' · ');
  const nfs=M.nf>0?'<span class="bd-st up">▲ Backlog growing</span>':M.nf<0?'<span class="bd-st dn">▼ Catching up</span>':'<span class="bd-st">Holding steady</span>';
  const yoy=M.prev?'<p class="bd-yoy"><b>'+(M.yoy>=0?'+':'−')+Math.abs(r1(M.yoy*100))+'%</b><span>'+(M.me<12?'year to date ':'')+'on '+fyl(M.fy-1)+'</span></p>':'';
  const seg='<div class="bd-seg sm" role="group" aria-label="Chart view">'+[['m','Monthly'],['c','Cumulative']].map(([v,l])=>'<button type="button" data-vw="'+v+'" data-f="vw-'+v+'" aria-pressed="'+(S.vw===v)+'">'+l+'</button>').join('')+'</div>';
  return'<div class="bd-tiles">'
    +tile('Received',fmt(M.rec),'Items received in '+fyl(M.fy),slot('t1'))
    +tile('Completed',M.rec?pc(M.comp/M.rec):'–',fmt(M.comp)+' of '+fmt(M.rec)+' closed or info only',meter(M.rec?M.comp/M.rec:0,'var(--bd-ink)'))
    +tile('Open',fmt(M.open),top||'Nothing open',slot('t3'))
    +tile('Net flow',sgn(M.nf),'Last 30 days to '+dShort(M.an)+' '+nfs,slot('t4'),INFO.nf)
    +tile('Approval time',M.days.length?r1(M.md)+'<small>days</small>':'\u2013','Median, '+fyl(M.fy)+' completions',M.days.length?slot('t5'):'',INFO.at)
    +'</div>'
    +card('rc',7,'Received vs completed','Monthly, '+fyl(M.fy)+gName(),'','',lgSq('var(--bd-mute)','Received')+lgSq('var(--bd-ink)','Completed')+lgSq('var(--red)','Net flow, backlog growing')+lgSq('var(--bd-mute)','Net flow, catching up'))
    +card('vg',5,'Volume by action group','Items received, '+fyl(M.fy))
    +card('yy',6,'Current FY vs last FY',(S.vw==='c'?'Running total':'Received each month')+gName(),'',yoy+seg,lgLn('var(--bd-ink)',fyl(M.fy))+lgLn('var(--bd-mute)',fyl(M.fy-1)))
    +card('',6,'Performance by category',fyl(M.fy)+gName(),perf(M));
}
function perf(M){if(!M.cats.length)return'<p class="bd-empty">No items for this filter.</p>';
  return'<div class="bd-tw"><table class="bd-t"><thead><tr><th scope="col">Category</th><th scope="col" class="n">Received</th><th scope="col" class="n">Completed</th><th scope="col" class="n">Net flow</th><th scope="col" class="n">Median days</th></tr></thead><tbody>'
    +M.cats.map(x=>'<tr><th scope="row" title="'+esc(CATS[x.c][0])+'"><i style="background:'+COL[CATS[x.c][2]]+'"></i>'+esc(CATS[x.c][1])+'</th><td class="n">'+fmt(x.r)+'</td><td class="n">'+fmt(x.d)+'</td><td class="n">'+sgn(x.n)+'</td><td class="n">'+r1(x.m)+'</td></tr>').join('')
    +'</tbody><tfoot><tr><th scope="row">Total</th><td class="n">'+fmt(M.tot.r)+'</td><td class="n">'+fmt(M.tot.d)+'</td><td class="n">'+sgn(M.tot.n)+'</td><td class="n">'+r1(M.tot.m)+'</td></tr></tfoot></table></div>'}
function shellWl(M){const n=M.open.length;
  return'<div class="bd-tiles">'
    +tile('Open',fmt(n),'Open items, every fiscal year',slot('w1'))
    +tile('Overdue',fmt(M.od.length),(n?pc(M.od.length/n):'0%')+' of open items are past due',meter(n?M.od.length/n:0,'var(--red)'))
    +tile('Due in next 7 days',fmt(M.d7.length),'Through '+dShort(AS_OF+6)+'; 14 days shown',slot('w3'))
    +tile('Approval time',M.nd?r1(M.md)+'<small>days</small>':'\u2013','Median, '+fyl(CUR)+' completions',M.nd?slot('w4'):'',INFO.at)
    +tile('Oldest open item',n?fmt(M.amx)+'<small>days</small>':'\u2013','Days open across open items',n?slot('w5'):'')
    +'</div>'
    +card('oa',4,'Open items by assignee','By role'+gName())
    +card('oc',4,'Open items by category','Colored by action group')
    +card('ag','4x','Open items by age','Days since received, by action group')
    +card('',12,'Open item detail',fmt(n)+' open items as of '+dLong(AS_OF)+gName(),detail(M));
}
const COLS=[['id','ID'],['t','Title'],['c','Category'],['a','Assignee'],['r','Received',1],['due','Due',1],['age','Days open',1],['s','Status']];
function detail(M){if(!M.open.length)return'<p class="bd-empty">No open items for this filter.</p>';
  const st=i=>i.due<AS_OF?2:i.due<AS_OF+7?1:0,key={id:i=>i.id,t:i=>i.t,c:i=>CATS[i.c][1],a:i=>i.a,r:i=>i.r,due:i=>i.due,age:i=>i.age,s:i=>-st(i)};
  const rows=[...M.open].sort((a,b)=>{const f=key[sort.k],x=f(a),y=f(b);return(x<y?-1:x>y?1:0)*sort.d||a.due-b.due||(a.id>b.id?1:-1)});
  return'<div class="bd-tw tall"><table class="bd-t bd-dt"><thead><tr>'+COLS.map(([k,l,num])=>'<th scope="col" class="'+(num?'n':'')+'" aria-sort="'+(sort.k===k?(sort.d>0?'ascending':'descending'):'none')+'"><button type="button" data-sort="'+k+'" data-f="sort-'+k+'">'+l+'<span aria-hidden="true">'+(sort.k===k?(sort.d>0?'↑':'↓'):'')+'</span></button></th>').join('')+'</tr></thead><tbody>'
    +rows.map(i=>{const s=st(i);return'<tr><td class="bd-id">'+i.id+'</td><td>'+esc(i.t)+'</td><td title="'+esc(CATS[i.c][0])+'"><i style="background:'+COL[i.g]+'"></i>'+esc(CATS[i.c][1])+'</td><td>'+esc(i.a)+'</td><td class="n">'+dIso(i.r)+'</td><td class="n">'+dIso(i.due)+'</td><td class="n">'+i.age+'</td><td><span class="bd-flag s'+s+'">'+['Open','Due soon','Overdue'][s]+'</span></td></tr>'}).join('')
    +'</tbody></table></div>'}
const tableHTML=t=>'<div class="bd-tw"><table class="bd-t"><thead><tr>'+t.cols.map((c,j)=>'<th scope="col"'+(j?' class="n"':'')+'>'+esc(c)+'</th>').join('')+'</tr></thead><tbody>'+t.rows.map(r=>'<tr>'+r.map((c,j)=>j?'<td class="n">'+esc(c)+'</td>':'<th scope="row">'+esc(c)+'</th>').join('')+'</tr>').join('')+'</tbody></table></div>';

/* ---------- the window: header, filter row, legend ---------- */
app.innerHTML='<div class="bd-win">'
  +'<div class="bd-bar"><p class="bd-ttl"><b>Overview</b><span>| Business</span></p>'
  +'<div class="bd-seg bd-tabs" role="tablist" aria-label="Report pages"><button type="button" role="tab" id="bd-t-ov" data-pg="ov" aria-controls="bd-body">Overview</button><button type="button" role="tab" id="bd-t-wl" data-pg="wl" aria-controls="bd-body">Workload</button></div>'
  +'<p class="bd-asof"><span class="pill"><span class="dot"></span>Sample data</span>As of '+dLong(AS_OF)+'</p></div>'
  +'<div class="bd-fil">'
  +'<div class="bd-f bd-fy"><span class="bd-lab" id="bd-fy-l">Fiscal year</span><div class="bd-seg" role="group" aria-labelledby="bd-fy-l">'+FYS.map(fy=>'<button type="button" data-fy="'+fy+'">'+fyl(fy)+'</button>').join('')+'</div></div>'
  +'<div class="bd-f"><button type="button" class="bd-sw" role="switch" aria-checked="false"><i aria-hidden="true"></i>Approvals only</button></div>'
  +'<button type="button" class="bd-reset">Reset</button></div>'
  +'<div class="bd-grp" role="group" aria-label="Action group filter"><span class="bd-lab">Action group</span>'+GROUPS.map((g,i)=>'<button type="button" class="bd-chip" data-g="'+i+'" aria-pressed="false"><i style="background:'+COL[i]+'"></i><span class="bd-ll">'+g[0]+'</span><span class="bd-ls">'+g[1]+'</span></button>').join('')+'</div>'
  +'<div class="bd-body" id="bd-body" role="tabpanel"></div>'
  +'<div class="bd-tip" aria-hidden="true"></div></div>'
  +'<p class="bd-foot">Sample data, generated in your browser from a fixed seed: '+fmt(items.length)+' items over four fiscal years. The pages, measures and filters follow the Power BI original; none of its data is used.</p>';
const win=$('.bd-win'),body=$('.bd-body'),tipEl=$('.bd-tip');

function sync(){
  $$('[data-pg]').forEach(b=>{const on=b.dataset.pg===S.pg;b.setAttribute('aria-selected',String(on));b.tabIndex=on?0:-1});
  body.setAttribute('aria-labelledby','bd-t-'+S.pg);
  $('.bd-ttl b').textContent=S.pg==='ov'?'Overview':'Workload';
  $$('[data-fy]').forEach(b=>{b.setAttribute('aria-pressed',String(+b.dataset.fy===S.fy));b.disabled=S.pg!=='ov'});
  $('.bd-fy').classList.toggle('off',S.pg!=='ov');$('.bd-fy').title=S.pg==='ov'?'':'Workload shows every open item, whatever the fiscal year';
  $('.bd-sw').setAttribute('aria-checked',String(S.ap));
  $$('[data-g]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.g===S.g)));
  $('.bd-grp').classList.toggle('on',S.g>=0);
  $('.bd-reset').disabled=S.fy===S0.fy&&S.g===S0.g&&!S.ap&&S.vw===S0.vw;
}

let built=false,lastW=0;
function render(anim){
  const f=document.activeElement&&root.contains(document.activeElement)?document.activeElement.dataset.f:null;
  hide();for(const k in T)delete T[k];
  if(!anim)body.classList.remove('bd-in');    // filters redraw in place; only a page change replays the entrance
  const M=S.pg==='ov'?overview():workload();
  body.innerHTML=S.pg==='ov'?shellOv(M):shellWl(M);
  $$('.bd-cb[data-k]',body).forEach(el=>{const k=el.dataset.k,r=V[k](Math.floor(el.clientWidth),M);el.innerHTML=tables.has(k)?tableHTML(r.table):r.svg});
  $$('.bd-mini[data-k]',body).forEach(el=>{const k=el.dataset.k,w=Math.floor(el.clientWidth);
    el.innerHTML=k==='t1'?spark(k,w,M.mr.slice(0,M.me),i=>({h:fmName(i,M.fy),rows:[row('var(--bd-mute)',fmt(M.mr[i]),'Received')]}))
      :k==='t3'||k==='w1'?strip(k,w,M.og)
      :k==='t4'?spark(k,w,M.roll.map(d=>d.v),i=>({h:dLong(M.roll[i].d),rows:[row('var(--bd-mute)',(M.roll[i].v>0?'+':M.roll[i].v<0?'−':'')+Math.abs(r1(M.roll[i].v)),'Net flow a day')],f:'7-day rolling average'}),true)
      :k==='t5'||k==='w4'?range(k,w,M.mn,M.md,M.mx,'Approval time')
      :k==='w3'?due14(k,w,M.fc)
      :range(k,w,M.amn,M.amd,M.amx,'Days open')});
  if(anim&&motion){body.classList.remove('bd-in');void body.offsetWidth;body.classList.add('bd-in')}
  lastW=body.clientWidth;sync();
  if(f){const el=body.querySelector('[data-f="'+f+'"]');if(el)el.focus({preventScroll:true})}
}
function set(p,anim){Object.assign(S,p);render(anim)}

/* ---------- controls ---------- */
win.addEventListener('click',e=>{const b=e.target.closest('button');if(!b||!win.contains(b))return;
  if(b.dataset.pg){if(b.dataset.pg!==S.pg)set({pg:b.dataset.pg},true)}
  else if(b.dataset.fy)set({fy:+b.dataset.fy})
  else if(b.dataset.g!=null)set({g:+b.dataset.g===S.g?-1:+b.dataset.g})
  else if(b.classList.contains('bd-sw'))set({ap:!S.ap})
  else if(b.classList.contains('bd-reset')){sort={k:'due',d:1};tables.clear();set({...S0,pg:S.pg},true)}
  else if(b.dataset.vw)set({vw:b.dataset.vw})
  else if(b.dataset.tbl){const k=b.dataset.tbl;tables.has(k)?tables.delete(k):tables.add(k);render(false)}
  else if(b.dataset.sort){const k=b.dataset.sort;sort=sort.k===k?{k,d:-sort.d}:{k,d:k==='age'?-1:1};render(false)}
  else if(b.dataset.info){e.stopPropagation();showInfo(b)}});
$('.bd-tabs').addEventListener('keydown',e=>{if(e.key!=='ArrowLeft'&&e.key!=='ArrowRight')return;e.preventDefault();const pg=S.pg==='ov'?'wl':'ov';set({pg},true);$('[data-pg="'+pg+'"]').focus()});

/* ---------- tooltip: hover, touch and keyboard all show the same readout ---------- */
let cur=null;
function place(cx,cy){const wr=win.getBoundingClientRect(),tw=tipEl.offsetWidth,th=tipEl.offsetHeight;let x=cx-wr.left+16,y=cy-wr.top+16;
  if(x+tw>wr.width-8)x=cx-wr.left-tw-16;if(y+th>wr.height-8)y=cy-wr.top-th-16;tipEl.style.transform='translate('+Math.round(clamp(x,8,wr.width-tw-8))+'px,'+Math.round(Math.max(8,y))+'px)'}
function fill(d){tipEl.textContent='';const add=(tag,cls,txt)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(txt!=null)n.textContent=txt;return n};
  if(d.h)tipEl.appendChild(add('p','h',d.h));
  (d.rows||[]).forEach(r=>{const p=add('p','r');const i=add('i');i.style.background=r.k;p.append(i,add('b','',r.v),add('span','',r.l));tipEl.appendChild(p)});
  if(d.f)tipEl.appendChild(add('p','f',d.f));if(d.x)tipEl.appendChild(add('p','x',d.x))}
function show(s,i,cx,cy){const k=s.dataset.c,t=T[k];if(!t||!t.n)return;if(cur&&cur.s!==s)hide();i=clamp(i,0,t.n-1);cur={s,k,i};
  const b=t.box(i),h=s.querySelector('.bd-hl');if(h){h.setAttribute('x',r1(b[0]));h.setAttribute('y',r1(b[1]));h.setAttribute('width',r1(b[2]));h.setAttribute('height',r1(b[3]));h.classList.add('on')}
  const g=s.querySelector('.bd-hd');if(g&&t.dots)g.innerHTML=t.dots(i).map(([x,y,c])=>'<circle class="bd-dot" r="4" cx="'+r1(x)+'" cy="'+r1(y)+'" style="fill:'+c+'"/>').join('');
  fill(t.tip(i));tipEl.classList.remove('info');tipEl.classList.add('on');
  if(cx==null){const r=s.getBoundingClientRect();cx=r.left+b[0]+b[2]/2;cy=r.top+b[1]}
  place(cx,cy)}
function hide(){if(cur){const h=cur.s.querySelector('.bd-hl');if(h)h.classList.remove('on');const g=cur.s.querySelector('.bd-hd');if(g)g.innerHTML=''}cur=null;tipEl.classList.remove('on')}
function showInfo(b){hide();fill({x:b.dataset.info});tipEl.classList.add('on','info');const r=b.getBoundingClientRect();place(r.right,r.bottom);cur={s:b,k:'info',i:0}}
const idxAt=(s,t,e)=>{const hit=e.target.closest('[data-i]');if(hit)return+hit.dataset.i;if(t.xs){const x=e.clientX-s.getBoundingClientRect().left;let bi=0;t.xs.forEach((v,i)=>{if(Math.abs(v-x)<Math.abs(t.xs[bi]-x))bi=i});return bi}return null};
body.addEventListener('pointermove',e=>{const s=e.target.closest('svg[data-c]');if(!s){if(cur&&cur.k!=='info')hide();return}
  const t=T[s.dataset.c],i=t&&e.target.closest('.bd-hit')?idxAt(s,t,e):null;if(i==null){if(cur&&cur.k!=='info')hide();return}show(s,i,e.clientX,e.clientY)});
body.addEventListener('pointerdown',e=>{const s=e.target.closest('svg[data-c]');if(s&&e.pointerType!=='mouse'){const t=T[s.dataset.c],i=t&&e.target.closest('.bd-hit')?idxAt(s,t,e):null;if(i!=null)show(s,i,e.clientX,e.clientY)}});
win.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse')hide()});
document.addEventListener('pointerdown',e=>{if(cur&&!e.target.closest('.bd-hit,.bd-i'))hide()});
body.addEventListener('focusin',e=>{const s=e.target.closest('svg[data-c]');if(s&&T[s.dataset.c]&&s.matches(':focus-visible'))show(s,0)});
body.addEventListener('focusout',e=>{if(cur&&cur.s===e.target)hide()});
body.addEventListener('keydown',e=>{const s=e.target.closest('svg[data-c]');if(!s||!cur||cur.s!==s)return;
  const d={ArrowRight:1,ArrowDown:1,ArrowLeft:-1,ArrowUp:-1}[e.key];if(e.key==='Escape'){hide();return}if(!d)return;e.preventDefault();show(s,cur.i+d)});
body.addEventListener('mouseover',e=>{const b=e.target.closest('.bd-i');if(b)showInfo(b)});
body.addEventListener('mouseout',e=>{const b=e.target.closest('.bd-i');if(b&&cur&&cur.k==='info'&&!b.contains(e.relatedTarget))hide()});
body.addEventListener('focusin',e=>{if(e.target.classList.contains('bd-i'))showInfo(e.target)});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&cur&&cur.k==='info')hide()});

/* ---------- build when the row first opens; redraw on resize ---------- */
function build(){if(built)return;built=true;render(true)}
const rowEl=root.closest('.row');
if(!rowEl||rowEl.classList.contains('open'))build();
else new MutationObserver((_,mo)=>{if(rowEl.classList.contains('open')){mo.disconnect();build()}}).observe(rowEl,{attributes:true,attributeFilter:['class']});
let rt;addEventListener('resize',()=>{if(!built)return;clearTimeout(rt);rt=setTimeout(()=>{if(body.clientWidth&&body.clientWidth!==lastW)render(false)},150)});
sync();
})();
