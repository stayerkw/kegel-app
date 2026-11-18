/* ============ لوحة التحكم الرئيسية (تصميم Vigoris) ============ */
const HEART_SVG=`<svg class="gheart" viewBox="0 0 240 210" aria-hidden="true"><defs>
 <radialGradient id="hgA" cx="38%" cy="30%" r="80%"><stop offset="0" stop-color="#9FF3FF"/><stop offset=".35" stop-color="#3CC6DA"/><stop offset=".75" stop-color="#0F8EA4"/><stop offset="1" stop-color="#075E73"/></radialGradient>
 <linearGradient id="hgB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".75"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
 <filter id="hgG" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
 <filter id="hgS" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="14" stdDeviation="12" flood-color="#012A3A" flood-opacity=".45"/></filter></defs>
 <path filter="url(#hgS)" fill="url(#hgA)" d="M120 196C88 170 18 128 18 70 18 38 42 16 72 16c22 0 38 12 48 30 10-18 26-30 48-30 30 0 54 22 54 54 0 58-70 100-102 126z"/>
 <path fill="url(#hgB)" opacity=".55" d="M48 52c6-18 22-26 38-24 12 2 20 10 24 18-14-6-34-6-50 10-6 6-10 12-12 18-4-6-3-14 0-22z"/>
 <polyline filter="url(#hgG)" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" points="46,108 92,108 106,82 124,140 140,96 150,108 194,108"/></svg>`;
const MOSQUE_SVG=`<svg class="mosque" viewBox="0 0 320 170" preserveAspectRatio="xMidYMax slice" aria-hidden="true"><defs>
 <linearGradient id="mqS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0E4A5E"/><stop offset="1" stop-color="#03283A"/></linearGradient>
 <radialGradient id="mqM" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#FFF4C2"/><stop offset="1" stop-color="#F3D27A"/></radialGradient></defs>
 <rect width="320" height="170" fill="url(#mqS)"/>
 ${[[30,22],[70,40],[118,16],[160,34],[214,20],[262,44],[296,18],[240,62],[18,64]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="1.4" fill="#CFF6FF" opacity=".8"/>`).join('')}
 <circle cx="104" cy="44" r="22" fill="url(#mqM)"/><circle cx="114" cy="38" r="20" fill="#0C4256"/>
 <path fill="#0A3445" d="M0 150c60-26 120-30 180-18s100 10 140-4v42H0z"/>
 <g fill="#062636"><rect x="46" y="70" width="8" height="70"/><path d="M50 52l6 18h-12z"/><rect x="230" y="78" width="7" height="62"/><path d="M233.5 62l5 16h-10z"/>
 <path d="M86 140v-30c0-24 26-40 54-46 28 6 54 22 54 46v30z"/><path d="M140 52v12" stroke="#062636" stroke-width="3"/><circle cx="140" cy="50" r="3"/>
 <path d="M66 140v-16c0-10 10-18 20-20 10 2 20 10 20 20v16z"/><path d="M176 140v-16c0-10 10-18 20-20 10 2 20 10 20 20v16z"/></g>
 <g fill="#F6C66B">${[104,118,132,148,162,176].map(x=>`<rect x="${x}" y="118" width="6" height="12" rx="3"/>`).join('')}</g>
 <path fill="#04212F" d="M0 160c80-14 170-16 320-6v16H0z"/></svg>`;
const dayAdh=ds=>{ if(S.startDate&&ds<S.startDate) return null; return Math.min(1,dailyDoneOn(ds)/planFor(S.progDay).n); };
function adhAvg(from,to){ let s=0,c=0; for(let d=from;d<=to;d=addDays(d,1)){ const v=dayAdh(d); if(v!==null){ s+=v; c++; } } return c?s/c:null; }
const MON=()=>Array.from({length:12},(_,i)=>{ try{ return new Intl.DateTimeFormat(LANG==='en'?'en':'ar',{month:'short'}).format(new Date(2026,i,15)); }catch(e){ return String(i+1); } });
function chartData(r){
  const t=today(), out=[];
  if(r==='w'){ for(let i=6;i>=0;i--){ const d=addDays(t,-i); out.push({x:AR_DAYS[new Date(d+'T12:00').getDay()],v:dayAdh(d)}); } }
  else if(r==='m'){ for(let i=5;i>=0;i--){ const to=addDays(t,-i*5), from=addDays(to,-4); out.push({x:to.slice(8)+'/'+to.slice(5,7),v:adhAvg(from,to)}); } }
  else if(r==='q'){ for(let i=12;i>=0;i-=2){ const to=addDays(t,-i*7), from=addDays(to,-13); out.push({x:to.slice(8)+'/'+to.slice(5,7),v:adhAvg(from,to)}); } }
  else { const m=MON(), now=new Date(); for(let i=11;i>=0;i-=2){ const d=new Date(now.getFullYear(),now.getMonth()-i,1); const from=dstr(d), to=dstr(new Date(d.getFullYear(),d.getMonth()+2,0)); out.push({x:m[d.getMonth()],v:adhAvg(from,to>t?t:to)}); } }
  return out;
}
function dashChart(r){
  const pts=chartData(r), W=330,H=190,L=34,R=14,Tp=24,B=26, n=pts.length;
  const x=i=>L+i*(W-L-R)/Math.max(1,n-1), y=v=>Tp+(1-v)*(H-Tp-B);
  const vals=pts.map((p,i)=>p.v===null?null:[x(i),y(p.v)]).filter(Boolean);
  const line=vals.map(p=>p.join(',')).join(' '), lastI=pts.map(p=>p.v).lastIndexOf(pts.filter(p=>p.v!==null).slice(-1)[0]?.v);
  const last=vals[vals.length-1], lastV=pts.filter(p=>p.v!==null).slice(-1)[0];
  const lbl=`الالتزام بالتمارين: ${lastV?Math.round(lastV.v*100):0}%`;
  return `<svg class="dchart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${lbl}"><title>${lbl}</title><defs><linearGradient id="dcA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0A9CAC" stop-opacity=".28"/><stop offset="1" stop-color="#0A9CAC" stop-opacity="0"/></linearGradient></defs>
   ${[0,25,50,75,100].map(v=>`<line x1="${L}" x2="${W-R}" y1="${y(v/100)}" y2="${y(v/100)}" class="gl2"/><text x="${L-8}" y="${y(v/100)+4}" class="ax" text-anchor="end">${v}</text>`).join('')}
   ${vals.length>1?`<path d="M${vals[0][0]},${y(0)} L${line.replace(/ /g,' L')} L${vals[vals.length-1][0]},${y(0)} Z" fill="url(#dcA)"/><polyline points="${line}" class="dline"/>`:''}
   ${vals.map(([a,b])=>`<circle cx="${a}" cy="${b}" r="5" class="dpt"/>`).join('')}
   ${last?`<g><rect x="${last[0]-24}" y="${last[1]-30}" width="48" height="20" rx="10" class="dtip"/><text x="${last[0]}" y="${last[1]-16}" text-anchor="middle" class="dtipt">${Math.round(lastV.v*100)}%</text></g>`:''}
   ${pts.map((p,i)=>`<text x="${x(i)}" y="${H-6}" text-anchor="middle" class="ax">${p.x}</text>`).join('')}
   ${vals.length?'':`<text x="${W/2}" y="${H/2}" text-anchor="middle" class="ax">أكمل جلستك الأولى ليظهر منحنى الالتزام</text>`}</svg>`;
}
function relDays(ds){ const d=dayDiff(today(),ds); if(d<0) return 'مستحق الآن'; if(d===0) return 'اليوم'; if(d===1) return 'غدًا'; if(d<45) return 'بعد '+d+' يومًا'; return 'بعد '+Math.round(d/30)+' أشهر'; }
function upcomingTasks(){
  const t=[];
  if(S.diabetes) CHECKS.forEach(([k,title,,mf,icn])=>{ const due=checkDue(k,mf()); t.push({date:due||today(),title:'فحص '+title.split(':')[0].split('(')[0].trim(),icon:ic(icn),tone:k==='a1c'?'red':'teal',act:()=>checkSheet(k),unset:!due}); });
  if(docReady()&&S.doc.on) t.push({date:docNext(),title:'إرسال تقرير الطبيب',icon:hi('stetho'),tone:'blue',act:()=>sendDoc()});
  S.meds.filter(m=>m.on).forEach(md=>md.times.forEach(tm=>{ if(!medTaken(today(),md.id,tm)) t.push({date:today(),title:'جرعة '+md.name,sub:tm,icon:ic('pill'),tone:'pink',act:()=>{ tab='men'; S.hseg='dm'; render(); }}); }));
  if(S.onboarded) t.push({date:S.test?addDays(S.test.date,14):today(),title:'اختبار القوة',icon:ic('target'),tone:'teal',act:startTest});
  if(isFem()) t.push({date:S.uiq.length?addDays(S.uiq[S.uiq.length-1].date,28):today(),title:'مقياس التسرّب الشهري',icon:ic('drop'),tone:'teal',act:leakSheet});
  else t.push({date:S.iief.length?addDays(S.iief[S.iief.length-1].date,28):today(),title:'مؤشر الانتصاب الشهري',icon:ic('chart'),tone:'teal',act:iiefSheet});
  return t.sort((a,b)=>a.date<b.date?-1:a.date>b.date?1:0);
}
function taskRow(x,i){ const d=new Date((x.date<today()?today():x.date)+'T12:00'); const m=MON()[d.getMonth()];
  return `<button class="trow" data-task="${i}"><span class="tdate"><b>${x.date<=today()?'':d.getDate()}</b><small>${x.date<=today()?'اليوم':m}</small></span><span class="ttx"><b>${esc(x.title)}</b><span>${x.sub?esc(x.sub)+' · ':''}${x.unset?'لم يُسجَّل':relDays(x.date)}</span></span><span class="tic ${x.tone}">${x.icon}</span></button>`; }
function tasksSheet(){ const T=upcomingTasks(); modal(`<h3>كل المهام القادمة</h3><div class="tlist">${T.map(taskRow).join('')}</div>`,(m,close)=>{ m.querySelectorAll('[data-task]').forEach(b=>b.onclick=()=>{ close(); T[+b.dataset.task].act(); }); }); }
let dRange='w';
function dashHTML(plan,done,dayDone,idx){
  const st=streak(), sNow=stepsNow(), wk=S.hc.week||{}, yS=wk[addDays(today(),-1)];
  const stepsDelta=sNow!=null&&yS?Math.round((sNow-yS)/yS*100):null;
  const adh=adhAvg(addDays(today(),-6),today()), adhPrev=adhAvg(addDays(today(),-13),addDays(today(),-7));
  const lg=gLast(), tasks=upcomingTasks(), soon=tasks.filter(x=>dayDiff(today(),x.date)<=7).length;
  const ring=(v,r,sw,col)=>{ const C=2*Math.PI*r; return `<circle cx="${r+sw}" cy="${r+sw}" r="${r}" fill="none" stroke="var(--ringBg)" stroke-width="${sw}"/><circle cx="${r+sw}" cy="${r+sw}" r="${r}" fill="none" stroke="${col}" stroke-width="${sw}" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C*(1-Math.max(0,Math.min(1,v||0)))}" transform="rotate(-90 ${r+sw} ${r+sw})"/>`; };
  const bars=`<span class="mbars" aria-hidden="true"><i></i><i></i><i></i></span>`;
  const stat=(cls,icon,val,unit,lbl,foot)=>`<div class="scard ${cls}"><span class="sic">${icon}</span><div class="sv"><b>${val}${unit?`<small> ${unit}</small>`:''}</b><span>${lbl}</span>${foot||''}</div>${bars}</div>`;
  const delta=(v)=>v==null?'':`<em class="${v>=0?'up':'down'}">${v>=0?'↑':'↓'} ${Math.abs(v)}%</em>`;
  const sleepTxt=S.hc.sleepDate===today()&&S.hc.sleep?`${Math.floor(S.hc.sleep/60)}h ${S.hc.sleep%60}m`:'—';
  const s1=stat('steps',ic('steps'),sNow!=null?sNow.toLocaleString(LANG==='en'?'en':'ar'):'—','',sNow!=null?'خطوة اليوم':'اربط ساعتك للخطوات',delta(stepsDelta));
  const s2=stat('sleep',hi('sleepy'),sleepTxt,'','مدة النوم','');
  const s3=S.diabetes?stat('glu',ic('drop'),lg?gfmt(lg.v):'—',GU(),'سكر الدم',lg?`<em class="${gClass(lg.v)==='ok'?'ok':'warnc'}">${gClass(lg.v)==='ok'?ic('checkCircle')+' ضمن النطاق':ic('alert')+' خارج النطاق'}</em>`:'')
    :stat('water',ic('drop'),waterToday(),'/ '+S.water.goal,'أكواب الماء','');
  const s4=`<div class="scard adh"><span class="sic gold">${ic('trophy')}</span><div class="sv"><b>${adh==null?'—':Math.round(adh*100)+'%'}</b><span>الالتزام الأسبوعي</span>${adh!=null&&adhPrev!=null?delta(Math.round((adh-adhPrev)*100)):''}</div><svg class="sring" viewBox="0 0 56 56" aria-hidden="true">${ring(adh,22,6,'var(--accent2)')}</svg></div>`;
  const dpct=Math.round(done/plan.n*100), workImg=isFem()?'<img src="img/ui/workout_f.webp" alt="" class="wimg" decoding="async">':IMG('posture','wimg');
  const ramShow=(ramWindow()&&!ramadanOn())||(!ramWindow()&&S.diabetes&&(CTRY[ctry()]||[])[3]);
  return `<header class="dhero">
   <div class="dtop"><button class="dav" id="dAv" aria-label="الإعدادات">${ic('user')}</button>
    <button class="dbell" id="dBell" aria-label="المهام القادمة">${ic('bell')}${soon?`<b>${soon}</b>`:''}</button>
    <button class="dlang" id="dLang" data-noi18n>${LANG==='en'?'العربية':'English'}</button>
    <span style="flex:1"></span>
    <div class="dtheme" role="group" aria-label="المظهر"><button id="dSun" aria-pressed="${!S.dark}" aria-label="الوضع الفاتح" class="${S.dark?'':'on'}">${ic('sun')}</button><button id="dMoon" aria-pressed="${!!S.dark}" aria-label="الوضع الليلي" class="${S.dark?'on':''}">${ic('moon')}</button></div></div>
   <div class="dwel"><div><h1>مرحبًا بك في Vigoris</h1><p>لصحة أفضل .. خطوة بخطوة</p>${st?`<span class="dstreak">${ic('flame')} ${st} ${st===1?'يوم':'أيام'} متتالية</span>`:''}</div>${HEART_SVG}</div>
  </header>
  <div class="stats">${s1}${s2}${s3}${s4}</div>
  <section class="dcard wcard"><div class="dh"><h2>${ic('barbell')} تمارين اليوم</h2></div>
   <div class="wbody"><div class="wart">${workImg}</div>
    <div class="winfo"><div class="wring"><svg viewBox="0 0 120 120" aria-hidden="true">${ring(done/plan.n,52,8,'var(--accent)')}</svg><div><b>${dpct}%</b><span>من الهدف</span></div></div>
     <div class="wmeta"><span class="muted small">المستوى الحالي</span><span class="lvpill">${ic('chart')} ${LV_NAME[curLevel()]}</span>
      <span class="muted small" style="margin-top:8px">الجلسات المكتملة</span><b class="wdone">${done} / ${plan.n} ${done>=plan.n?`<span class="okc">${ic('checkCircle')}</span>`:''}</b></div></div></div>
   <p class="small muted wnext">${dayDone?'أحسنت، أنهيت جلسات اليوم':`التالية: جلسة ${idx+1} — ${PAT_NAME[plan.patterns[idx]]}${(plan.pos||[])[idx]?' · '+POS[plan.pos[idx]][0]:''}`}</p>
   <button class="btn accent" id="${dayDone?'extra':'go'}">${ic('play')}${dayDone?'جلسة إضافية اختيارية':done?'متابعة التمرين':'ابدأ التمرين'}</button></section>
  <section class="dcard"><div class="dh"><h2>${ic('pulse')} نظرة عامة على صحتك</h2></div>
   <div class="rtabs" role="tablist" aria-label="الفترة">${[['w','أسبوع'],['m','شهر'],['q','ثلاثة أشهر'],['y','سنة']].map(([k,n])=>`<button role="tab" aria-selected="${dRange===k}" class="${dRange===k?'on':''}" data-rg="${k}">${n}</button>`).join('')}</div>
   <div id="dChart">${dashChart(dRange)}</div><p class="small muted" style="margin:4px 0 0">نسبة إكمال جلسات تمارين قاع الحوض اليومية.</p></section>
  <section class="dcard"><div class="dh"><h2>${ic('calendar')} مهام قادمة</h2></div>
   <div class="tlist">${tasks.slice(0,3).map(taskRow).join('')}</div>
   <button class="linkbtn" id="dAll">عرض جميع المهام ←</button></section>
  ${ramShow?`<section class="dcard rpromo">${MOSQUE_SVG}<div class="rp"><h2>${ic('moon')} رمضان والصيام</h2><p><b>${S.diabetes?'الصيام لمريض السكري يحتاج احتياطات':'استعد لصيام صحي'}</b></p><p class="small">${S.diabetes?'احرص على قياس السكر بانتظام، وقيّم خطورة صيامك مع طبيبك.':'نظّم الماء والنوم والتمارين بين الإفطار والسحور.'}</p><button class="btn ghostw" id="dRam">${ic('books')}عرض الإرشادات</button></div></section>`:''}
  <section class="dcard dpromo"><div class="dp"><h2>${ic('leaf')} النظام الغذائي المتوسطي</h2><p>${MEALS[new Date().getDay()][1]} — وجبة اليوم</p><button class="btn ghosta" id="dDiet">${ic('leaf')}عرض الخطة الغذائية</button></div><img src="img/ui/salad.webp" alt="" class="salad" decoding="async"></section>
  <section class="dcard"><div class="dh"><h2>${ic('bolt')} وصول سريع</h2></div>
   <div class="quick"><button id="qkR">${ic('chart')}<span>تقرير صحي</span></button><button id="qkD">${hi('stetho')}<span>تقرير الطبيب</span></button><button id="qkC">${ic('calendar')}<span>الفحوصات</span></button><button id="qkS">${ic('set')}<span>الإعدادات</span></button></div></section>`;
}
function bindDash(){
  const on=(id,f)=>{ const e=$(id); if(e) e.onclick=f; };
  on('#dAv',()=>{ tab='set'; render(); window.scrollTo(0,0); });
  on('#dBell',tasksSheet); on('#dAll',tasksSheet);
  on('#dLang',()=>setLang(LANG==='en'?'ar':'en'));
  on('#dSun',()=>{ S.dark=false; save(); render(); }); on('#dMoon',()=>{ S.dark=true; save(); render(); });
  app.querySelectorAll('[data-rg]').forEach(b=>b.onclick=()=>{ dRange=b.dataset.rg; app.querySelectorAll('[data-rg]').forEach(x=>{ x.classList.toggle('on',x===b); x.setAttribute('aria-selected',x===b); }); $('#dChart').innerHTML=dashChart(dRange); });
  const T=upcomingTasks(); app.querySelectorAll('.tlist [data-task]').forEach(b=>b.onclick=()=>T[+b.dataset.task].act());
  on('#dRam',ramSheet); on('#dDiet',()=>{ tab='men'; S.hseg='food'; render(); window.scrollTo(0,0); });
  on('#qkR',()=>reportSheet(7,false)); on('#qkD',()=>docReady()?reportSheet(30,true):docSheet());
  on('#qkC',()=>{ if(S.diabetes){ tab='men'; S.hseg='dm'; render(); setTimeout(()=>{ const e=document.querySelector('.chkrow'); e&&e.scrollIntoView({block:'center'}); },60); } else toast('فعّل متابعة السكري من الإعدادات لعرض الفحوصات'); });
  on('#qkS',()=>{ tab='set'; render(); window.scrollTo(0,0); });
}
