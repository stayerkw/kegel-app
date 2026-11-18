/* ============ 2.5 — اختبار القوة والمستويات (مبني على مبادئ تدريب القوة) ============ */
const LV_NAME=['','مبتدئ','متمكّن','قوي','خبير'];
function levelFromTest(t){ if(!t) return null; const h=t.hold,f=t.flicks; if(h>=10&&f>=15) return 4; if(h>=8&&f>=10) return 3; if(h>=5&&f>=6) return 2; return 1; }
function curLevel(){ return S.test?levelFromTest(S.test):Math.min(3,S.level||1); }
const POS={lie:['مستلقيًا','استلقِ على ظهرك، ركبتاك مثنيتان وقدماك على الأرض.'],sit:['جالسًا','اجلس على كرسي، ظهرك مستقيم وقدماك مسطّحتان على الأرض.'],stand:['واقفًا','قف وقدماك بعرض الكتفين، والركبتان مرتخيتان غير مقفلتين.'],walk:['أثناء المشي','امشِ بخطى عادية، واضغط ضغطًا متوسطًا مع كل انقباضة دون حبس النفس.']};
const POS_BY_LV={1:['lie','lie','sit'],2:['lie','sit','stand'],3:['sit','stand','stand'],4:['stand','stand','walk']};
const testDue=()=>!S.test||dayDiff(S.test.date,today())>=14;
function prescribe(p,t){
  const lv=curLevel(); p.lv=lv; p.flicks=30; p.pos=POS_BY_LV[lv].slice();
  if(S.test){
    const h=Math.max(3,Math.min(10,Math.round(S.test.hold)));
    p.sq=p.light?Math.max(3,h-2):h; p.rl=Math.max(4,p.sq); p.reps=p.light?8:Math.round(8+4*t); p.n=3;
    p.flicks=Math.max(6,Math.min(30,Math.round(S.test.flicks))); p.holdSec=Math.max(8,Math.min(30,Math.round(S.test.hold*1.5)));
    if(p.patterns.length<3) p.patterns=['classic','rapid','classic'];
  }
  if(p.n===2) p.pos=[p.pos[0],p.pos[2]];
  return p;
}

let TT=null;
function startTest(){ TT={st:'intro',hold:0,flicks:0,t0:0,timer:null}; screen='test'; renderTabs(); keepAwake(true); document.body.classList.add('immersive'); renderTest(); }
function endTest(){ if(TT&&TT.timer) clearInterval(TT.timer); TT=null; keepAwake(false); document.body.classList.remove('immersive'); screen='tabs'; render(); }
function renderTest(){
  if(!TT) return;
  const stepTxt={intro:'قبل البدء',hold:'الخطوة 1 من 2',rest:'استراحة قصيرة',flick:'الخطوة 2 من 2',result:'النتيجة'}[TT.st];
  let h=`<div class="topbar"><button class="iconbtn" id="tX" aria-label="إغلاق الاختبار">${ic('x')}</button><div class="center"><b class="small">اختبار القوة</b><div class="small muted">${stepTxt}</div></div><span style="width:44px"></span></div>`;
  if(TT.st==='intro'){
    h+=`${IMG('posture','sm')}<h1 class="center">لنقِس قوتك الآن</h1>
    <p class="muted center">دقيقتان فقط. نبني على النتيجة خطتك: مدة الانقباض = أقصى ثبات تستطيعه حتى 10 ثوانٍ، وعدد الانقباضات السريعة = ما تؤديه قبل التعب. نعيد الاختبار كل أسبوعين لنرفع مستواك.</p>
    <div class="card"><div class="ev"><span class="badge">${ic('hourglass')}</span><div><b>1. أطول ثبات</b><p>اضغط بأقصى قوة واثبت، وأرخِ عندما تشعر أن الضغط ضعف.</p></div></div>
    <div class="ev"><span class="badge">${ic('bolt')}</span><div><b>2. الانقباضات السريعة</b><p>اضغط وأرخِ بسرعة، واضغط الزر مع كل انقباضة حتى تتعب.</p></div></div></div>
    <div class="warn small">استلقِ على ظهرك، وتنفّس بحرية. لا تشدّ البطن أو الأرداف — هذا يفسد القياس.</div>
    <button class="btn accent" id="tGo">${ic('play')}ابدأ الاختبار</button>`;
  } else if(TT.st==='hold'){
    h+=`<div class="ring-wrap" style="margin-top:20px"><div class="ring-center" style="position:static"><div class="count" id="tSec">0.0</div><div class="small muted">ثانية</div></div></div>
    <div class="phase" id="tPh">${TT.t0?'اثبت…':'جاهز؟'}</div><p class="hint">${TT.t0?'حافظ على الضغط وتنفّس. اضغط الزر عندما يضعف الضغط.':'اضغط الزر وابدأ الضغط في اللحظة نفسها.'}</p>
    <button class="btn big-btn" id="tHold">${TT.t0?ic('stop')+'أرخيت العضلة':ic('play')+'ابدأ الضغط الآن'}</button>`;
  } else if(TT.st==='rest'){
    h+=`<div class="ring-wrap" style="margin-top:20px"><div class="ring-center" style="position:static"><div class="count" id="tRest">15</div><div class="small muted">راحة</div></div></div>
    <div class="phase">استرخِ تمامًا</div><p class="hint">سجّلنا ${TT.hold.toFixed(1)} ثانية. استعد للانقباضات السريعة.</p>`;
  } else if(TT.st==='flick'){
    h+=`<p class="hint center" style="margin-top:14px">اضغط وأرخِ بسرعة. المس الدائرة مع كل انقباضة كاملة، وتوقف عندما تضعف أو لا تسترخي العضلة كاملًا.</p>
    <button class="tapper" id="tTap" aria-label="سجّل انقباضة"><b id="tCnt">${TT.flicks}</b><span>انقباضة</span></button>
    <p class="small muted center" id="tLeft">الحد الأقصى 60 ثانية</p>
    <button class="btn ghost" id="tStop">${ic('check')}انتهيت</button>`;
  } else if(TT.st==='result'){
    const t={hold:Math.round(TT.hold*10)/10,flicks:TT.flicks}, lv=levelFromTest(t), prev=S.test, pl=levelFromTest(prev);
    const h2=Math.max(3,Math.min(10,Math.round(t.hold)));
    h+=`${IMG('trophy','sm')}<h1 class="center">مستواك: ${LV_NAME[lv]}</h1>
    <div class="grid3"><div class="card stat" style="margin:0"><b>${t.hold}</b><span class="small muted">ثانية ثبات</span></div><div class="card stat" style="margin:0"><b>${t.flicks}</b><span class="small muted">انقباضة سريعة</span></div><div class="card stat" style="margin:0"><b>${lv}/4</b><span class="small muted">المستوى</span></div></div>
    ${prev?`<div class="card small">${pl<lv?'<b>تقدّمت مستوى!</b> ':''}الاختبار السابق (${prev.date}): ثبات ${prev.hold} ث، ${prev.flicks} انقباضة سريعة.</div>`:''}
    <div class="card"><h3>خطتك للأسبوعين القادمين</h3>
    <p class="small" style="margin:0">3 جلسات يوميًا · كل جلسة 8–12 انقباضة قريبة من أقصى جهدك، مدة كل منها <b>${h2} ث</b> وراحة مثلها · و<b>${Math.max(6,Math.min(30,t.flicks))}</b> انقباضة سريعة في جلسة السرعة.</p>
    <p class="small muted" style="margin:6px 0 0">الوضعيات: ${POS_BY_LV[lv].map(k=>POS[k][0]).join(' ← ')}. ننتقل من الاستلقاء إلى الوقوف ثم المشي كلما زادت قوتك.</p></div>
    <button class="btn accent" id="tSave">${ic('check')}اعتمد خطتي</button><div style="height:8px"></div><button class="btn ghost" id="tRe">إعادة الاختبار</button>`;
  }
  app.innerHTML=h;
  $('#tX').onclick=()=>endTest();
  const g=$('#tGo'); if(g) g.onclick=()=>{ TT.st='hold'; TT.t0=0; renderTest(); speak('استلقِ براحة '+yaName()+'. عندما تكون جاهزًا اضغط الزر وابدأ.'); };
  const hb=$('#tHold'); if(hb) hb.onclick=()=>{
    if(!TT.t0){ TT.t0=performance.now(); ac(); SFX.squeeze(); Haptic.heavy(); speak('اضغط واثبت'); renderTest();
      TT.timer=setInterval(()=>{ const s=(performance.now()-TT.t0)/1000, el=$('#tSec'); if(el) el.textContent=s.toFixed(1); if(s>=60){ hb.click(); } },100); }
    else { clearInterval(TT.timer); TT.hold=Math.min(60,(performance.now()-TT.t0)/1000); TT.st='rest'; SFX.relax(); Haptic.double(); speak('ممتاز. استرخِ.'); renderTest();
      let r=15; TT.timer=setInterval(()=>{ r--; const el=$('#tRest'); if(el) el.textContent=r; if(r<=0){ clearInterval(TT.timer); TT.st='flick'; TT.flicks=0; TT.t0=performance.now(); renderTest(); speak('الآن انقباضات سريعة. اضغط وأرخِ بسرعة.'); startFlickTimer(); } },1000); }
  };
  const tp=$('#tTap'); if(tp) tp.onclick=()=>{ TT.flicks++; $('#tCnt').textContent=TT.flicks; Haptic.light(); SFX.tick(); tp.classList.remove('pop'); void tp.offsetWidth; tp.classList.add('pop'); };
  const ts=$('#tStop'); if(ts) ts.onclick=()=>finishFlicks();
  const sv=$('#tSave'); if(sv) sv.onclick=()=>{
    const t={date:today(),hold:Math.round(TT.hold*10)/10,flicks:TT.flicks}, before=curLevel();
    S.tests=(S.tests||[]).concat([t]).slice(-60); S.test=t; save();
    const after=curLevel(); if(S.test && after>before) toast('مبروك! انتقلت إلى مستوى «'+LV_NAME[after]+'»');
    else toast('اعتُمدت خطتك الجديدة'); SFX.done(); reschedule(); endTest(); };
  const re=$('#tRe'); if(re) re.onclick=()=>{ TT={st:'intro',hold:0,flicks:0,t0:0,timer:null}; renderTest(); };
}
function startFlickTimer(){ clearInterval(TT.timer); TT.timer=setInterval(()=>{ if(!TT) return; const s=(performance.now()-TT.t0)/1000, el=$('#tLeft'); if(el) el.textContent='متبقٍ '+Math.max(0,Math.ceil(60-s))+' ثانية'; if(s>=60) finishFlicks(); },250); }
function finishFlicks(){ if(!TT||TT.st!=='flick') return; clearInterval(TT.timer); TT.st='result'; Haptic.long(); SFX.done(); speak('انتهى الاختبار. أحسنت '+yaName()+'.'); renderTest(); }

/* ============ السكري: القراءات، الأدوية، المثانة، فحص ما قبل الرياضة ============ */
const mgU=()=>S.gUnit!=='mmol';
const GU=()=>mgU()?'ملغ/دل':'ملمول/ل';
const gfmt=v=>mgU()?String(Math.round(v)):(v/18).toFixed(1);
const numIn=x=>parseFloat(String(x||'').replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[٫,]/g,'.'));
const GCTX=[['fast','صائم'],['pre','قبل وجبة أو رياضة'],['post','بعد الأكل بساعتين'],['bed','قبل النوم'],['rnd','وقت آخر']];
const GCTXN=Object.fromEntries(GCTX);
function gluAdd(v,ctx,ts,src,id){ S.glu.push({ts:ts||Date.now(),v:Math.round(v),ctx:ctx||'rnd',src:src||'m',id:id||null}); S.glu.sort((a,b)=>a.ts-b.ts); if(S.glu.length>3000) S.glu=S.glu.slice(-3000); save(); }
function gluStats(days){ const cut=Date.now()-days*864e5, a=S.glu.filter(g=>g.ts>=cut); if(!a.length) return null;
  const avg=a.reduce((x,g)=>x+g.v,0)/a.length; return {n:a.length,avg,tir:a.filter(g=>g.v>=70&&g.v<=180).length/a.length,low:a.filter(g=>g.v<70).length,high:a.filter(g=>g.v>250).length,last:a[a.length-1]}; }
const gLast=()=>S.glu.length?S.glu[S.glu.length-1]:null;
function gClass(v){ return v<70?'lo':v>250?'vhi':v>180?'hi':'ok'; }
function gluChart(days=14){
  const W=320,H=150,P=26, end=Date.now(), start=end-days*864e5, a=S.glu.filter(g=>g.ts>=start);
  const y=v=>{ const c=Math.max(40,Math.min(320,v)); return H-P-(c-40)/(320-40)*(H-2*P); }, x=t=>P+(t-start)/(end-start)*(W-2*P);
  const st=gluStats(days), lbl=st?`آخر ${days} يومًا: ${st.n} قراءة، المتوسط ${gfmt(st.avg)} ${GU()}، ${Math.round(st.tir*100)}% ضمن النطاق`:'لا قراءات بعد';
  return `<svg class="gchart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${lbl}"><title>${lbl}</title>
    <rect x="${P}" y="${y(180)}" width="${W-2*P}" height="${y(70)-y(180)}" rx="6" class="band"/>
    <line x1="${P}" x2="${W-P}" y1="${y(70)}" y2="${y(70)}" class="gl"/><line x1="${P}" x2="${W-P}" y1="${y(180)}" y2="${y(180)}" class="gl"/>
    <text x="${W-P+4}" y="${y(70)+4}" class="gt">${gfmt(70)}</text><text x="${W-P+4}" y="${y(180)+4}" class="gt">${gfmt(180)}</text>
    ${a.length>1?`<polyline class="gline" points="${a.map(g=>x(g.ts).toFixed(1)+','+y(g.v).toFixed(1)).join(' ')}"/>`:''}
    ${a.map(g=>`<circle cx="${x(g.ts).toFixed(1)}" cy="${y(g.v).toFixed(1)}" r="3.6" class="gp ${gClass(g.v)}"/>`).join('')}
    ${a.length?'':`<text x="${W/2}" y="${H/2}" text-anchor="middle" class="gt">سجّل أول قراءة لتظهر هنا</text>`}</svg>`;
}
function gluAdvice(v){
  if(v<54) return `<div class="warn"><b class="hrow">${ic('alert')} انخفاض شديد (${gfmt(v)})</b>تناول 15 غرامًا من سكر سريع فورًا (نصف كوب عصير أو 3–4 أقراص جلوكوز)، وأعد القياس بعد 15 دقيقة. إن شعرت بدوخة أو تشوّش أو لم تتحسن: اطلب مساعدة طبية فورًا.</div>`;
  if(v<70) return `<div class="warn"><b class="hrow">${ic('alert')} انخفاض (${gfmt(v)})</b>قاعدة 15–15: تناول 15 غرامًا من سكر سريع، ثم أعد القياس بعد 15 دقيقة. كرّر حتى يتجاوز ${gfmt(70)}، ثم وجبة خفيفة. سنذكّرك بالقياس.</div>`;
  if(v>250) return `<div class="warn"><b class="hrow">${ic('alert')} ارتفاع (${gfmt(v)})</b>اشرب ماء، وأعد القياس لاحقًا. إن كنت تستخدم الإنسولين افحص الكيتونات. تجنّب الرياضة الشديدة إن وُجدت كيتونات، وتواصل مع طبيبك إن تكرر الارتفاع.</div>`;
  if(v>180) return `<p class="small muted">أعلى من النطاق المستهدف عادةً بعد الأكل (أقل من ${gfmt(180)}). المشي 10–15 دقيقة بعد الوجبة يساعد على خفضه.</p>`;
  return `<p class="small" style="color:var(--ok)">ضمن النطاق المستهدف.</p>`;
}
function oneShot(id,at,title,body,go,ch){ if(!LN||at<=new Date()) return; LN.schedule({notifications:[{id,title,body,schedule:{at,allowWhileIdle:true},channelId:ch||'health',smallIcon:'ic_stat_notify',extra:{go:go||'health'}}]}).catch(()=>{}); }
function gluSheet(after){
  const lastCtx=(()=>{ const h=new Date().getHours(); return h<10?'fast':h>=22?'bed':'pre'; })();
  modal(`<form id="gF" novalidate aria-labelledby="gFh"><div class="hrow" style="gap:10px"><span class="ic-badge" style="margin:0">${ic('drop')}</span><h3 id="gFh" style="margin:0">تسجيل قراءة السكر</h3></div>
    <div class="field"><label for="gV">القراءة (${GU()}) <span aria-hidden="true">*</span></label>
    <input id="gV" name="v" type="text" inputmode="decimal" enterkeyhint="done" autocomplete="off" required aria-describedby="gHint gErr">
    <span id="gHint" class="small muted">${mgU()?'مثال: 126':'مثال: 7.0'} — يمكنك تغيير الوحدة من الإعدادات.</span>
    <span id="gErr" class="err small" role="alert"></span></div>
    <fieldset class="radios"><legend>التوقيت</legend>${GCTX.map(([k,n])=>`<label><input type="radio" name="ctx" value="${k}" ${k===lastCtx?'checked':''}> ${n}</label>`).join('')}</fieldset>
    <button type="submit" class="btn accent">${ic('check')}حفظ القراءة</button></form><div id="gRes"></div>`,(m,close)=>{
    const f=m.querySelector('#gF'), inp=m.querySelector('#gV'), err=m.querySelector('#gErr');
    setTimeout(()=>inp.focus(),250);
    inp.addEventListener('input',()=>{ inp.removeAttribute('aria-invalid'); err.textContent=''; });
    f.addEventListener('submit',e=>{ e.preventDefault();
      let n=numIn(inp.value); if(!mgU()) n=n*18;
      if(!isFinite(n)||n<20||n>600){ inp.setAttribute('aria-invalid','true'); err.textContent=mgU()?'أدخل رقمًا بين 20 و600':'أدخل رقمًا بين 1.1 و33'; inp.focus(); return; }
      const ctx=(new FormData(f)).get('ctx')||'rnd'; gluAdd(n,ctx); Haptic.success();
      if(n<70) oneShot(9971,new Date(Date.now()+15*6e4),'أعد قياس السكر الآن','مرّت 15 دقيقة على علاج الانخفاض — تأكد أنه تجاوز '+gfmt(70)+'.','glu');
      f.remove(); m.querySelector('#gRes').innerHTML=`<h3>سُجّلت: ${gfmt(n)} ${GU()} · ${GCTXN[ctx]}</h3>${gluAdvice(n)}<button class="btn" id="gOk">تم</button>`;
      m.querySelector('#gOk').onclick=()=>{ close(); after&&after(n); render(); };
    });
  });
}
function a1cSheet(){
  modal(`<form id="aF" novalidate aria-labelledby="aFh"><h3 id="aFh">تسجيل التراكمي (HbA1c)</h3>
    <div class="field"><label for="aV">النسبة % <span aria-hidden="true">*</span></label><input id="aV" type="text" inputmode="decimal" required autocomplete="off" aria-describedby="aErr"><span id="aErr" class="err small" role="alert"></span></div>
    <div class="field"><label for="aD">تاريخ التحليل</label><input id="aD" type="date" value="${today()}" max="${today()}"></div>
    <p class="small muted">الهدف لأغلب البالغين أقل من 7%، ويحدده طبيبك حسب حالتك.</p>
    <button type="submit" class="btn accent">حفظ</button></form>`,(m,close)=>{
    const f=m.querySelector('#aF'), i=m.querySelector('#aV'), er=m.querySelector('#aErr'); setTimeout(()=>i.focus(),250);
    i.addEventListener('input',()=>{ i.removeAttribute('aria-invalid'); er.textContent=''; });
    f.addEventListener('submit',e=>{ e.preventDefault(); const v=numIn(i.value); if(!isFinite(v)||v<4||v>18){ i.setAttribute('aria-invalid','true'); er.textContent='أدخل نسبة بين 4 و18'; i.focus(); return; }
      S.a1c.push({date:m.querySelector('#aD').value||today(),v:Math.round(v*10)/10}); S.a1c.sort((a,b)=>a.date<b.date?-1:1); save(); close(); toast('سُجّل التراكمي'); render(); });
  });
}
/* فحص ما قبل الرياضة — إرشادات ADA العامة */
function exCheck(kind){
  const lg=gLast(), fresh=lg&&Date.now()-lg.ts<30*6e4;
  const verdict=v=>{
    const eve=new Date().getHours()>=17;
    let h='';
    if(v<70) h=`<div class="warn"><b>لا تبدأ الآن.</b> عالج الانخفاض أولًا: 15 غرامًا من سكر سريع، وأعد القياس بعد 15 دقيقة.</div>`;
    else if(v<90) h=`<div class="warn"><b>تناول 15–30 غرامًا من الكربوهيدرات قبل البدء</b> (حبة فاكهة متوسطة أو كوب حليب)، ثم أعد القياس بعد 15 دقيقة. سنذكّرك.</div>`;
    else if(v<=250) h=`<div class="card" style="border-color:var(--ok)"><b class="hrow" style="color:var(--ok)">${ic('checkCircle')} مناسب للرياضة</b><p class="small" style="margin:6px 0 0">احمل معك مصدر سكر سريع، واشرب ماء. إن شعرت بارتجاف أو تعرّق أو دوخة توقف وقِس.</p></div>`;
    else h=`<div class="warn"><b>السكر مرتفع (${gfmt(v)}).</b> إن وُجدت كيتونات أو شعرت بتعب أو غثيان: أجّل الرياضة. إن لم توجد كيتونات وتشعر بخير: نشاط خفيف إلى متوسط فقط، واشرب ماء، وأعد القياس.</div>`;
    if(v>=70) h+=`<label class="chk"><input type="checkbox" id="xBed" ${eve?'checked':''}> ذكّرني بقياس السكر قبل النوم (خطر الانخفاض يستمر حتى 24 ساعة بعد الرياضة، ويزيد ليلًا بعد رياضة المساء)</label>`;
    h+=`<p class="small muted">إرشادات عامة من جمعية السكري الأمريكية، وتهمّ خصوصًا من يستخدم الإنسولين أو أدوية السلفونيل يوريا. اتبع تعليمات طبيبك إن اختلفت.</p><button class="btn accent" id="xOk">تم</button>`;
    return h;
  };
  modal(`<div class="hrow" style="gap:10px"><span class="ic-badge" style="margin:0">${ic('shield')}</span><h3 style="margin:0">فحص السكر قبل الرياضة</h3></div><div id="xB"></div>`,(m,close)=>{
    const show=v=>{ m.querySelector('#xB').innerHTML=verdict(v);
      if(v>=70&&v<90) oneShot(9971,new Date(Date.now()+15*6e4),'أعد قياس السكر','مرّت 15 دقيقة بعد الكربوهيدرات — قِس قبل أن تبدأ الرياضة.','glu');
      m.querySelector('#xOk').onclick=()=>{ const b=m.querySelector('#xBed'); if(b&&b.checked){ const [hh,mm]=S.bed.split(':').map(Number), now=new Date(); let at=new Date(now.getFullYear(),now.getMonth(),now.getDate(),hh,mm-15); if(at<=now) at=new Date(at.getTime()+864e5); oneShot(9970,at,'قِس السكر قبل النوم','تمرّنت اليوم — تأكد أن السكر ليس منخفضًا قبل أن تنام.','glu'); toast('سنذكّرك قبل النوم'); } close(); render(); }; };
    if(fresh) show(lg.v);
    else m.querySelector('#xB').innerHTML=`<p class="muted small">${lg?'آخر قراءة قبل أكثر من 30 دقيقة.':'لا توجد قراءة حديثة.'} قِس الآن ثم سجّلها.</p><button class="btn accent" id="xM">${ic('drop')}سجّل قراءة الآن</button>`,
      m.querySelector('#xM').onclick=()=>{ close(); gluSheet(v=>exCheck(kind)); };
  });
}
/* الأدوية */
function medKey(d,id,t){ return d+'|'+id+'|'+t; }
const medTaken=(d,id,t)=>!!(S.medLog[d]&&S.medLog[d][id+'|'+t]);
function medMark(d,id,t,v){ S.medLog[d]=Object.assign({},S.medLog[d],{[id+'|'+t]:v?Date.now():0}); const ks=Object.keys(S.medLog).sort(); if(ks.length>120) ks.slice(0,ks.length-120).forEach(k=>delete S.medLog[k]); save(); }
function medAdherence(days){ let due=0,tk=0; for(let i=0;i<days;i++){ const d=addDays(today(),-i); S.meds.filter(x=>x.on).forEach(md=>md.times.forEach(t=>{ if(i===0&&toMin(t)>new Date().getHours()*60+new Date().getMinutes()) return; due++; if(medTaken(d,md.id,t)) tk++; })); } return due?tk/due:null; }
function medSheet(md){
  md=md||{id:'m'+Date.now().toString(36),name:'',dose:'',times:['08:00'],on:true};
  const isNew=!S.meds.find(x=>x.id===md.id);
  modal(`<form id="mF" novalidate aria-labelledby="mFh"><h3 id="mFh">${isNew?'إضافة دواء':'تعديل الدواء'}</h3>
    <div class="field"><label for="mN">اسم الدواء <span aria-hidden="true">*</span></label><input id="mN" type="text" value="${esc(md.name)}" required maxlength="40" autocomplete="off" aria-describedby="mErr"><span id="mErr" class="err small" role="alert"></span></div>
    <div class="field"><label for="mD">الجرعة</label><input id="mD" type="text" value="${esc(md.dose)}" maxlength="30" autocomplete="off" aria-describedby="mDh"><span id="mDh" class="small muted">مثال: حبة 500 ملغ مع الأكل</span></div>
    <fieldset class="radios"><legend>المواعيد</legend><div id="mT"></div><button type="button" class="btn ghost sm" id="mAdd">${ic('plus')}موعد آخر</button></fieldset>
    <button type="submit" class="btn accent">${ic('check')}حفظ</button>${isNew?'':'<div style="height:8px"></div><button type="button" class="btn ghost" id="mDel" style="color:var(--danger)">حذف الدواء</button>'}</form>`,(m,close)=>{
    let times=md.times.slice();
    const draw=()=>{ m.querySelector('#mT').innerHTML=times.map((t,i)=>`<div class="set"><label for="mt${i}">الموعد ${i+1}</label><span class="row" style="flex:0 0 auto;gap:6px"><input id="mt${i}" type="time" value="${t}" data-i="${i}">${times.length>1?`<button type="button" class="iconbtn" data-x="${i}" aria-label="حذف الموعد ${i+1}">${ic('x')}</button>`:''}</span></div>`).join('');
      m.querySelectorAll('[data-i]').forEach(x=>x.onchange=()=>{ times[+x.dataset.i]=x.value||times[+x.dataset.i]; });
      m.querySelectorAll('[data-x]').forEach(x=>x.onclick=()=>{ times.splice(+x.dataset.x,1); draw(); }); };
    draw();
    m.querySelector('#mAdd').onclick=()=>{ if(times.length<4){ times.push('20:00'); draw(); } else toast('أقصى 4 مواعيد'); };
    const n=m.querySelector('#mN'), er=m.querySelector('#mErr'); n.addEventListener('input',()=>{ n.removeAttribute('aria-invalid'); er.textContent=''; });
    m.querySelector('#mF').addEventListener('submit',e=>{ e.preventDefault(); const nv=n.value.trim(); if(!nv){ n.setAttribute('aria-invalid','true'); er.textContent='اكتب اسم الدواء'; n.focus(); return; }
      if(isNew && S.meds.length>=5){ toast('أقصى 5 أدوية'); return; }
      Object.assign(md,{name:nv,dose:m.querySelector('#mD').value.trim(),times:[...new Set(times)].sort()});
      if(isNew) S.meds.push(md); save(); notifPermission(); reschedule(); close(); toast('حُفظ الدواء — سنذكّرك في مواعيده'); render(); });
    const dl=m.querySelector('#mDel'); if(dl) dl.onclick=()=>{ S.meds=S.meds.filter(x=>x.id!==md.id); save(); reschedule(); close(); render(); };
  });
}
const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
/* مذكرة المثانة */
const BLK=[['void','تبوّل',ic('drop')],['urge','إلحاح',ic('bolt')],['leak','تسرّب',ic('alert')]];
function blAdd(k){ S.bl.push({ts:Date.now(),k}); if(S.bl.length>2000) S.bl=S.bl.slice(-2000); save(); Haptic.light(); }
function nightWindow(dayStr){ const [bh,bm]=S.bed.split(':').map(Number), [wh,wm]=S.wake.split(':').map(Number); const d=new Date(dayStr+'T00:00:00'); const wake=new Date(d.getFullYear(),d.getMonth(),d.getDate(),wh,wm).getTime(); let bed=new Date(d.getFullYear(),d.getMonth(),d.getDate()-1,bh,bm).getTime(); if(bh<12) bed+=864e5; return [bed,wake]; }
function nocturia(dayStr){ const [a,b]=nightWindow(dayStr); return S.bl.filter(x=>x.k==='void'&&x.ts>a&&x.ts<b).length; }
function nocturiaAvg(n){ let s=0,c=0; for(let i=0;i<n;i++){ const d=addDays(today(),-i); const [a,b]=nightWindow(d); if(S.bl.some(x=>x.ts>a-12*36e5&&x.ts<b+12*36e5)){ s+=nocturia(d); c++; } } return c?s/c:null; }
const blToday=k=>S.bl.filter(x=>x.k===k&&dstr(new Date(x.ts))===today()).length;

/* ============ الساعة الذكية — Health Connect ============ */
const HCP=plug('Health');
const BIO=plug('NativeBiometric'), FS=plug('Filesystem'), SH=plug('Share');
async function hcConnect(){
  if(!HCP){ toast('الربط متاح في تطبيق الجوال فقط'); return; }
  try{
    const a=await HCP.isAvailable();
    if(!a.available){ modal(`<h3>ثبّت Health Connect</h3><p class="small muted">الربط مع ساعتك يتم عبر تطبيق Health Connect من Google (مدمج في أندرويد 14 وأحدث). ثبّته من المتجر، ثم اربط تطبيق ساعتك به (Samsung Health أو Fitbit أو Google Fit أو Huawei Health عبر تطبيق وسيط)، ثم ارجع هنا.</p><button class="btn accent" id="hcI">فتح Health Connect</button>`,(m,close)=>{ m.querySelector('#hcI').onclick=()=>{ HCP.openHealthConnectSettings().catch(()=>{}); close(); }; }); return; }
    const st=await HCP.requestAuthorization({read:['steps','sleep','bloodGlucose','heartRate','restingHeartRate'],write:[]});
    S.hc.on=(st.readAuthorized||[]).length>0; save();
    if(!S.hc.on){ toast('لم تُمنح الصلاحيات — يمكنك منحها من إعدادات Health Connect'); return; }
    toast('تم ربط ساعتك عبر Health Connect'); await hcSync(true); render();
  }catch(e){ toast('تعذّر الربط: '+((e&&e.message)||e)); }
}
const iso=t=>new Date(t).toISOString();
async function hcSync(force){
  if(!HCP||!S.hc.on) return false;
  if(!force && S.hc.at && Date.now()-S.hc.at<5*6e4) return false;
  const now=new Date(), mid=new Date(now.getFullYear(),now.getMonth(),now.getDate()).getTime(), before=JSON.stringify(S.hc);
  S.hc.at=Date.now();
  try{ const r=await HCP.queryAggregated({dataType:'steps',startDate:iso(mid-6*864e5),endDate:iso(now),bucket:'day',aggregation:'sum'});
    const wk={}; (r.samples||[]).forEach(x=>{ wk[dstr(new Date(x.startDate))]=Math.round(x.value||0); }); S.hc.week=wk; S.hc.steps=wk[today()]||0; S.hc.stepsDate=today(); }catch(e){}
  try{ const r=await HCP.readSamples({dataType:'sleep',startDate:iso(mid-8*36e5),endDate:iso(now),limit:60});
    let mins=0; (r.samples||[]).forEach(s=>{ if(s.stages&&s.stages.length){ s.stages.forEach(g=>{ if(g.stage!=='awake'&&g.stage!=='inBed') mins+=(new Date(g.endDate)-new Date(g.startDate))/6e4; }); } else if(!s.sleepState||['asleep','light','deep','rem'].includes(s.sleepState)) mins+=(new Date(s.endDate)-new Date(s.startDate))/6e4; });
    if(mins>0){ S.hc.sleep=Math.round(mins); S.hc.sleepDate=today(); if(mins>=420 && !heartToday().sleep) heartSet('sleep',true); } }catch(e){}
  try{ const r=await HCP.readSamples({dataType:'bloodGlucose',startDate:iso(Date.now()-3*864e5),endDate:iso(now),limit:200});
    const have=new Set(S.glu.map(g=>g.id||g.ts));
    (r.samples||[]).forEach(s=>{ const id=s.platformId||('hc'+s.startDate), ts=new Date(s.startDate).getTime(); if(have.has(id)||have.has(ts)) return; let v=s.value; if(s.unit&&s.unit!=='mg/dL'&&v<40) v=v*18; if(v>=20&&v<=600) gluAdd(v,'rnd',ts,'hc',id); }); }catch(e){}
  try{ const r=await HCP.readSamples({dataType:'heartRate',startDate:iso(Date.now()-2*36e5),endDate:iso(now),limit:200,ascending:false});
    const s=(r.samples||[]).sort((a,b)=>new Date(b.endDate)-new Date(a.endDate))[0]; if(s){ S.hc.hr=Math.round(s.value); S.hc.hrAt=new Date(s.endDate).getTime(); } }catch(e){}
  try{ const r=await HCP.readSamples({dataType:'restingHeartRate',startDate:iso(Date.now()-3*864e5),endDate:iso(now),limit:10,ascending:false});
    const s=(r.samples||[]).sort((a,b)=>new Date(b.endDate)-new Date(a.endDate))[0]; if(s) S.hc.rhr=Math.round(s.value); }catch(e){}
  save(); return before!==JSON.stringify(S.hc);
}
async function hcHrBetween(a,b){ if(!HCP||!S.hc.on) return null; try{ const r=await HCP.readSamples({dataType:'heartRate',startDate:iso(a),endDate:iso(b),limit:500}); const v=(r.samples||[]).map(s=>s.value).filter(Boolean); return v.length?Math.round(v.reduce((x,y)=>x+y,0)/v.length):null; }catch(e){ return null; } }
const stepsNow=()=>S.hc.on&&S.hc.stepsDate===today()?S.hc.steps:null;
const fmtH=m=>Math.floor(m/60)+' س '+(m%60?(m%60)+' د':'');
function stepsSheet(){
  modal(`<div id="stB"></div>`,(m,close)=>{
    const draw=()=>{ const s=stepsNow(), g=S.stepGoal, wk=S.hc.week||{};
      const days=Array.from({length:7},(_,i)=>addDays(today(),i-6)), mx=Math.max(g,...days.map(d=>wk[d]||0));
      m.querySelector('#stB').innerHTML=`<div class="hrow" style="gap:10px"><span class="ic-badge" style="margin:0">${hi('walking')}</span><h3 style="margin:0">المشي والنوم</h3></div>${IMG('walk','sm')}
      ${S.hc.on?`<div class="grid3"><div class="card stat" style="margin:0"><b>${(s||0).toLocaleString('ar')}</b><span class="small muted">خطوة اليوم</span></div><div class="card stat" style="margin:0"><b>${Math.max(0,g-(s||0)).toLocaleString('ar')}</b><span class="small muted">متبقٍ</span></div><div class="card stat" style="margin:0"><b>${S.hc.sleepDate===today()&&S.hc.sleep?fmtH(S.hc.sleep):'—'}</b><span class="small muted">نوم الليلة</span></div></div>
      <p class="small muted">${s>=g?'وصلت لهدفك اليوم.':'تحتاج نحو '+Math.ceil(Math.max(0,g-(s||0))/100)+' دقيقة مشي سريع لتصل للهدف.'}${S.hc.rhr?' · نبض الراحة '+S.hc.rhr:''}</p>
      <div class="bars" style="height:110px">${days.map(d=>`<div><small>${wk[d]?Math.round(wk[d]/100)/10+'k':''}</small><span class="${wk[d]>=g?'':'zero'}" style="height:${Math.max(3,(wk[d]||0)/mx*100)}%"></span><small>${AR_DAYS[new Date(d+'T12:00').getDay()]}</small></div>`).join('')}</div>
      <button class="btn ghost" id="stSync">${ic('repeat')}تحديث من الساعة</button>`
      :`<p class="muted small">اربط ساعتك أو تطبيق الصحة لتعرف خطواتك ونومك تلقائيًا. يتم الربط عبر Health Connect من Google، والبيانات تُقرأ فقط وتبقى على جهازك.</p><button class="btn accent" id="stCon">${ic('pulse')}ربط الساعة الذكية</button>`}
      <div class="set" style="margin-top:10px"><label for="stG">هدف الخطوات اليومي</label><select id="stG">${[5000,6000,7000,8000,9000,10000,12000].map(n=>`<option value="${n}" ${n===g?'selected':''}>${n.toLocaleString('ar')}</option>`).join('')}</select></div>
      <p class="small muted" style="margin:6px 0 0">تحليل لـ57 دراسة (Lancet Public Health 2025): نحو 7000 خطوة يوميًا ارتبطت بانخفاض كبير في الوفيات وأمراض القلب والسكري مقارنة بـ2000 خطوة.</p>`;
      const c=m.querySelector('#stCon'); if(c) c.onclick=async()=>{ await hcConnect(); draw(); };
      const y=m.querySelector('#stSync'); if(y) y.onclick=async()=>{ y.disabled=true; await hcSync(true); draw(); render(); };
      m.querySelector('#stG').onchange=e=>{ S.stepGoal=+e.target.value; save(); draw(); render(); }; };
    draw(); });
}

/* ============ البرنامج الغذائي لمرضى السكري (متوسطي) ============ */
const MEALS=[ // حسب يوم الأسبوع: 0 الأحد
  ['fish','سمك دهني','سلمون أو سردين أو ماكريل أو هامور مشوي — الحصة الأولى من حصتين أسبوعيًا.','أوميغا 3 وبروتين لا يرفع السكر. اشوه أو اخبزه بدل القلي.'],
  ['grains','بقوليات','عدس أو حمص أو فول أو لوبيا مع سلطة.','أليافها تبطئ امتصاص السكر وتشبع أطول. اجعلها بدل جزء من الأرز.'],
  ['avocado','أفوكادو وزيت زيتون','نصف حبة أفوكادو مع البيض أو السلطة، وملعقة زيت زيتون بكر.','دهون أحادية غير مشبعة — من أعمدة النظام المتوسطي.'],
  ['fish','سمك — الحصة الثانية','سمك مشوي أو تونة بالماء مع خضار.','حصتان أسبوعيًا من السمك من توصيات النظام المتوسطي.'],
  ['veg','خضار ورقية وشمندر','جرجير أو سبانخ أو شمندر مع وجبة الغداء.','غنية بالنترات الطبيعية التي يحوّلها الجسم إلى أكسيد النيتريك (دليل أولي).'],
  ['leaf','مكسرات غير مملحة','حفنة (30 غ) من الجوز أو اللوز أو الفستق كوجبة خفيفة.','دهون صحية وألياف؛ الحفنة الواحدة تكفي لأن سعراتها عالية.'],
  ['citrus','فاكهة ملوّنة كاملة','توت أو فراولة أو عنب أحمر أو برتقال — كاملة لا عصير، مع زبادي أو مكسرات.','الفلافونويد ارتبط بانخفاض ضعف الانتصاب. اقرنها ببروتين لتخفيف ارتفاع السكر.']
];
const DAILY=[['oil','زيت زيتون بكر بدل الدهون الأخرى'],['veg','خضار في وجبتين على الأقل'],['fruit','فاكهة كاملة (لا عصير) 1–2 حصة'],['grain','حبوب كاملة بدل الأبيض'],['noproc','بلا لحوم مصنّعة أو مشروبات سكرية']];
const mealToday=()=>S.mealLog[today()]||{};
function mealSet(k,v){ const d=today(); S.mealLog[d]=Object.assign({},S.mealLog[d],{[k]:v}); const ks=Object.keys(S.mealLog).sort(); if(ks.length>120) ks.slice(0,ks.length-120).forEach(x=>delete S.mealLog[x]); save(); }
function mealWeek(){ let n=0; for(let i=0;i<7;i++){ const l=S.mealLog[addDays(today(),-i)]; if(l&&l.focus) n++; } return n; }

/* ============ تنفّس القلب المبني على الدراسات ============ */
function breathPlan(){ const B=S.br, cyc=60/B.bpm, ti=Math.round((B.ratio==='55'?cyc/2:cyc*0.4)*100)/100; return {ti,te:Math.round((cyc-ti)*100)/100,reps:Math.round(B.min*B.bpm)}; }
function breathDays(from,to){ const set=new Set(); S.logs.filter(l=>l.kind==='breath'&&!l.skipped&&l.date>=from&&l.date<=to).forEach(l=>{ set[l.date]=(set[l.date]||0)+(l.dur||0); }); return Object.keys(set).filter(d=>set[d]>=300).length; }
function breathWeeks(){ let w=0; for(let k=0;k<12;k++){ const to=addDays(today(),-7*k), from=addDays(to,-6); if(breathDays(from,to)>=3) w++; else if(k>0) break; } return w; }
function breathSheet(){
  modal(`<div id="brB"></div>`,(m,close)=>{
    const draw=()=>{ const B=S.br, p=breathPlan(), wk=breathDays(addDays(today(),-6),today()), ws=breathWeeks();
      m.querySelector('#brB').innerHTML=`<div class="hrow" style="gap:10px"><span class="ic-badge" style="margin:0">${hi('lungs')}</span><h3 style="margin:0">تنفّس القلب</h3></div>${IMG('heart_breath','sm')}
      <p class="small" style="margin-top:0">تنفّس بطيء على «تردد الرنين» (5.5–6 أنفاس في الدقيقة) يرفع تقلّب نبض القلب ويحسّن حساسية منعكس الضغط، بما في ذلك لدى مرضى السكري من النوع الثاني.</p>
      <fieldset class="radios seg2"><legend>السرعة</legend>${[[5.5,'5.5 نَفَس/د · الأعلى أثرًا'],[6,'6 أنفاس/د']].map(([v,n])=>`<label><input type="radio" name="bpm" value="${v}" ${B.bpm===v?'checked':''}> ${n}</label>`).join('')}</fieldset>
      <fieldset class="radios seg2"><legend>نسبة الشهيق إلى الزفير</legend>${[['55','متساوية 1:1'],['46','زفير أطول 4:6']].map(([v,n])=>`<label><input type="radio" name="ratio" value="${v}" ${B.ratio===v?'checked':''}> ${n}</label>`).join('')}</fieldset>
      <fieldset class="radios seg3"><legend>المدة</legend>${[5,10,15].map(v=>`<label><input type="radio" name="min" value="${v}" ${B.min===v?'checked':''}> ${v} دقائق</label>`).join('')}</fieldset>
      <p class="small muted">كل نَفَس: شهيق ${p.ti} ث · زفير ${p.te} ث · ${p.reps} نَفَسًا.</p>
      <div class="card" style="box-shadow:none;background:var(--bg)"><div class="row" style="justify-content:space-between"><b>هدف الأسبوع</b><b style="text-align:left">${Math.min(wk,7)} / 3 أيام</b></div><div class="pbar" style="margin:8px 0"><i style="width:${Math.min(100,wk/3*100)}%"></i></div>
      <p class="small muted" style="margin:0">5 دقائق على الأقل، 3 أيام أسبوعيًا أو أكثر، لمدة 4 أسابيع — هذا ما تطلبه الدراسات لظهور أثر على الضغط. ${ws?'أنجزت '+ws+' '+(ws===1?'أسبوعًا':'أسابيع')+' متتالية.':''}</p></div>
      <button class="btn accent" id="brStart">${ic('play')}ابدأ ${B.min} دقائق</button>
      <details style="margin-top:10px"><summary>الدراسات</summary><div class="small">
      <p><b>السرعة والنسبة:</b> مقارنة بين أنماط تنفّس مختلفة وجدت أن 5.5 نَفَس/د بنسبة متساوية أعطت أعلى تقلّب لنبض القلب. <span class="lvl b">أدلة متوسطة</span> Lin 2014، Int J Psychophysiol.</p>
      <p><b>ضغط الدم:</b> تحليل تجميعي اعتمد معيار 10 أنفاس/د أو أقل، 5 دقائق أو أكثر، 3 أيام أسبوعيًا لمدة 4 أسابيع: انخفاض في الضغط والنبض. <span class="lvl b">أدلة متوسطة</span> Chaddha 2019، Complement Ther Med. وتحليل أحدث لـ31 دراسة أكّد انخفاض الضغط الانقباضي. Shao 2024، Mindfulness.</p>
      <p><b>السكري:</b> التنفّس بـ6 أنفاس/د حسّن حساسية منعكس الضغط فورًا لدى مرضى السكري من النوع الثاني. <span class="lvl c">أدلة أولية</span> Acta Diabetol، PMID 25956276.</p>
      <p><b>جمعية القلب الأمريكية</b> عدّت التنفّس البطيء الموجّه خيارًا مساعدًا معقولًا لخفض الضغط. Brook 2013، Hypertension.</p>
      <p class="muted">يكمّل العلاج ولا يغني عن أدوية الضغط أو السكري.</p></div></details>`;
      m.querySelectorAll('input[type=radio]').forEach(r=>r.onchange=()=>{ const v=r.value; S.br[r.name]=r.name==='ratio'?v:+v; save(); draw(); });
      m.querySelector('#brStart').onclick=()=>{ close(); startSession('breath'); }; };
    draw(); });
}

/* ============ مؤشر الانتصاب IIEF-5 (صياغة مختصرة) ============ */
const FREQ=['تقريبًا لا أبدًا','أقل من النصف بكثير','نحو النصف','أكثر من النصف بكثير','دائمًا تقريبًا'];
const IIEF=[
  ['ثقتك بقدرتك على الوصول للانتصاب والمحافظة عليه',null,['منخفضة جدًا','منخفضة','متوسطة','عالية','عالية جدًا'],1],
  ['عند الإثارة، كم مرة كان الانتصاب صلبًا بما يكفي للإيلاج؟','لا نشاط جنسي',FREQ,0],
  ['أثناء الجماع، كم مرة استطعت المحافظة على الانتصاب بعد الإيلاج؟','لم أحاول',FREQ,0],
  ['أثناء الجماع، ما مدى صعوبة المحافظة على الانتصاب حتى النهاية؟','لم أحاول',['صعب للغاية','صعب جدًا','صعب','صعب قليلًا','ليس صعبًا'],0],
  ['عند محاولة الجماع، كم مرة كان مُرضيًا لك؟','لم أحاول',FREQ,0]
];
function iiefCat(s){ return s>=22?['لا يوجد ضعف','ok']:s>=17?['ضعف خفيف','b']:s>=12?['خفيف إلى متوسط','b']:s>=8?['متوسط','c']:['شديد','c']; }
const iiefDue=()=>!S.iief.length||dayDiff(S.iief[S.iief.length-1].date,today())>=28;
function iiefSheet(){
  modal(`<form id="iF" novalidate aria-labelledby="iFh"><h3 id="iFh">مؤشر الانتصاب الشهري</h3><p class="small muted">5 أسئلة عن آخر 4 أسابيع، مقتبسة بتصرّف من استبيان IIEF-5 المعتمد. إجاباتك تبقى على جهازك.</p>
    ${IIEF.map(([q,z,opts,base],i)=>`<fieldset class="radios q"><legend>${i+1}. ${q}</legend>${z?`<label><input type="radio" name="q${i}" value="0" required> ${z}</label>`:''}${opts.map((o,j)=>`<label><input type="radio" name="q${i}" value="${j+1}" required> ${o}</label>`).join('')}</fieldset>`).join('')}
    <p id="iErr" class="err small" role="alert"></p><button type="submit" class="btn accent">احسب النتيجة</button></form><div id="iRes"></div>`,(m,close)=>{
    const f=m.querySelector('#iF');
    f.addEventListener('change',()=>{ m.querySelector('#iErr').textContent=''; });
    f.addEventListener('submit',e=>{ e.preventDefault(); const fd=new FormData(f), a=IIEF.map((_,i)=>fd.get('q'+i));
      const miss=a.findIndex(x=>x===null); if(miss>-1){ m.querySelector('#iErr').textContent='أجب عن السؤال '+(miss+1); const el=f.querySelector(`[name=q${miss}]`); el&&el.focus(); return; }
      const sc=a.reduce((s,x)=>s+(+x),0), [cat,lv]=iiefCat(sc), prev=S.iief[S.iief.length-1];
      S.iief.push({date:today(),s:sc,a:a.map(Number)}); save(); reschedule();
      f.remove(); m.querySelector('#iRes').innerHTML=`<div class="center"><div class="count" style="font-size:52px;font-weight:700">${sc}<small style="font-size:18px" class="muted">/25</small></div><span class="lvl ${lv}">${cat}</span></div>
      ${prev?`<p class="small center">السابق (${prev.date}): ${prev.s} — ${sc>prev.s?'تحسّن':sc<prev.s?'تراجع':'ثابت'}.</p>`:''}
      <p class="small muted">مقياس فرز وليس تشخيصًا. النتيجة 21 أو أقل تستحق مناقشتها مع طبيبك، خصوصًا مع السكري، لأن ضعف الانتصاب قد يكون مؤشرًا مبكرًا لأمراض القلب. التحسّن مع التمارين يظهر عادة خلال 3–6 أشهر.</p><button class="btn" id="iOk">تم</button>`;
      m.querySelector('#iOk').onclick=()=>{ close(); render(); }; });
  });
}
function lineChart(pts,{min,max,h=120,fmt=v=>v,label}){ // pts: [{x:label,v}]
  const W=320,P=24; if(!pts.length) return ''; const n=pts.length, x=i=>n===1?W/2:P+i*(W-2*P)/(n-1), y=v=>h-P-(v-min)/(max-min)*(h-2*P);
  return `<svg class="gchart" viewBox="0 0 ${W} ${h}" role="img" aria-label="${label}"><title>${label}</title>
  ${n>1?`<polyline class="gline" points="${pts.map((p,i)=>x(i)+','+y(p.v)).join(' ')}"/>`:''}
  ${pts.map((p,i)=>`<circle cx="${x(i)}" cy="${y(p.v)}" r="4" class="gp ok"/><text x="${x(i)}" y="${y(p.v)-9}" text-anchor="middle" class="gt b">${fmt(p.v)}</text><text x="${x(i)}" y="${h-4}" text-anchor="middle" class="gt">${p.x}</text>`).join('')}</svg>`;
}

/* ============ التقارير والنسخ الاحتياطي ============ */
function reportText(days,doctor){
  const from=addDays(today(),-(days-1)), inR=l=>l.date>=from&&!l.skipped, L=S.logs.filter(inR);
  const kg=L.filter(l=>['daily','quick','rapidq','control'].includes(l.kind)), br=L.filter(l=>l.kind==='breath');
  const g=gluStats(days), a1=S.a1c[S.a1c.length-1], adh=medAdherence(days), noc=nocturiaAvg(days), ii=S.iief[S.iief.length-1];
  const wk=S.hc.week||{}, stepsArr=Object.keys(wk).filter(d=>d>=from).map(d=>wk[d]);
  let w=0,wc=0; for(let i=0;i<days;i++){ const v=S.waterLog[addDays(today(),-i)]; if(v!==undefined){ w+=v; wc++; } }
  const L1=[`تقرير «عافيتي» ${doctor?'للطبيب':'الأسبوعي'}${nm()?' — '+nm():''}`,`الفترة: ${from} إلى ${today()} (${days} يومًا)`,''];
  L1.push(`• تمارين قاع الحوض: ${kg.length} جلسة، ${Math.round(kg.reduce((a,l)=>a+(l.dur||0),0)/60)} دقيقة. المستوى: ${LV_NAME[curLevel()]}${S.test?` (آخر اختبار ${S.test.date}: ثبات ${S.test.hold} ث، ${S.test.flicks} انقباضة سريعة)`:''}.`);
  if(S.diabetes){
    L1.push(g?`• السكر: ${g.n} قراءة، المتوسط ${gfmt(g.avg)} ${GU()}، ضمن ${gfmt(70)}–${gfmt(180)}: ${Math.round(g.tir*100)}%، انخفاضات أقل من ${gfmt(70)}: ${g.low}، أعلى من ${gfmt(250)}: ${g.high}.`:'• السكر: لا قراءات مسجلة في الفترة.');
    if(a1) L1.push(`• التراكمي HbA1c: ${a1.v}% بتاريخ ${a1.date}${S.a1c.length>1?` (السابق ${S.a1c[S.a1c.length-2].v}%)`:''}.`);
  }
  if(S.meds.length) L1.push(`• الأدوية: ${S.meds.map(x=>x.name+(x.dose?' ('+x.dose+')':'')+' '+x.times.join('، ')).join(' | ')}${adh!==null?` — الالتزام ${Math.round(adh*100)}%`:''}.`);
  if(noc!==null) L1.push(`• التبول الليلي: متوسط ${noc.toFixed(1)} مرة/ليلة.`);
  if(stepsArr.length) L1.push(`• الخطوات: متوسط ${Math.round(stepsArr.reduce((a,b)=>a+b,0)/stepsArr.length)} يوميًا (الهدف ${S.stepGoal}).`);
  if(S.hc.rhr) L1.push(`• نبض الراحة: ${S.hc.rhr}.`);
  L1.push(`• تنفّس بطيء: ${new Set(br.map(l=>l.date)).size} أيام، ${Math.round(br.reduce((a,l)=>a+(l.dur||0),0)/60)} دقيقة.`);
  if(wc) L1.push(`• الماء: متوسط ${(w/wc).toFixed(1)} كوب يوميًا.`);
  const ex=Object.keys(S.heartLog).filter(d=>d>=from&&S.heartLog[d].walk).length, rs=Object.keys(S.heartLog).filter(d=>d>=from&&S.heartLog[d].resist).length;
  L1.push(`• الرياضة: هوائية ${ex} أيام، مقاومة ${rs} أيام.`);
  const sm=Object.keys(S.smokeLog).filter(d=>d>=from).reduce((a,d)=>a+(S.smokeLog[d].ok||0),0); if(S.smoke.on) L1.push(`• فترات بلا تدخين ناجحة: ${sm}.`);
  if(ii) L1.push(`• مؤشر الانتصاب IIEF-5: ${ii.s}/25 (${iiefCat(ii.s)[0]}) بتاريخ ${ii.date}${S.iief.length>1?`، السابق ${S.iief[S.iief.length-2].s}`:''}.`);
  if(doctor && S.diabetes){ const gl=S.glu.filter(x=>x.ts>=Date.now()-days*864e5).slice(-40); if(gl.length){ L1.push('','قراءات السكر (آخر '+gl.length+'):'); gl.forEach(x=>{ const d=new Date(x.ts); L1.push(`${dstr(d)} ${pad(d.getHours())}:${pad(d.getMinutes())} — ${gfmt(x.v)} ${GU()} (${GCTXN[x.ctx]||''})`); }); } }
  L1.push('','أُنشئ بتطبيق عافيتي — من تطوير: حامد الدهاش. معلومات مسجلة ذاتيًا وليست تشخيصًا.');
  return L1.join('\n');
}
async function shareText(title,text){
  if(SH){ try{ await SH.share({title,text,dialogTitle:title}); return true; }catch(e){ return false; } }
  try{ await navigator.clipboard.writeText(text); toast('نُسخ النص'); return true; }catch(e){ return false; }
}
function reportSheet(days,doctor){
  const t=reportText(days,doctor);
  modal(`<h3>${doctor?'تقرير للطبيب — آخر 30 يومًا':'التقرير الأسبوعي'}</h3><pre class="rep" tabindex="0">${esc(t)}</pre>
    <div class="row"><button class="btn accent" id="rS">${ic('share')}مشاركة</button><button class="btn ghost" id="rC" style="flex:0 0 auto">نسخ</button></div>`,(m,close)=>{
    m.querySelector('#rS').onclick=()=>shareText(doctor?'تقرير عافيتي للطبيب':'تقرير عافيتي الأسبوعي',t);
    m.querySelector('#rC').onclick=async()=>{ try{ await navigator.clipboard.writeText(t); toast('نُسخ التقرير'); }catch(e){ toast('تعذّر النسخ'); } };
  });
}
async function exportBackup(){
  const data=JSON.stringify({app:'afiyati',v:3,at:new Date().toISOString(),state:S}), name='afiyati-backup-'+today()+'.json';
  if(FS&&SH){ try{ const w=await FS.writeFile({path:name,data,directory:'CACHE',encoding:'utf8'}); await SH.share({title:'نسخة احتياطية — عافيتي',files:[w.uri],dialogTitle:'احفظ النسخة في Drive أو أرسلها لنفسك'}); S.lastBackup=today(); save(); render(); return; }catch(e){ if(/cancel/i.test(String(e&&e.message||e))) return; } }
  const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([data],{type:'application/json'})); a.download=name; document.body.appendChild(a); a.click(); a.remove(); S.lastBackup=today(); save(); render();
}
function importBackup(file){
  if(!file) return; const rd=new FileReader();
  rd.onload=()=>{ let o; try{ o=JSON.parse(rd.result); }catch(e){ toast('الملف ليس نسخة احتياطية صالحة'); return; }
    if(!o||o.app!=='afiyati'||!o.state||!Array.isArray(o.state.logs)){ toast('الملف ليس نسخة احتياطية من عافيتي'); return; }
    modal(`<h3>استعادة النسخة؟</h3><p class="small muted">نسخة بتاريخ ${esc(String(o.at||'').slice(0,10))} تحتوي ${o.state.logs.length} جلسة. ستحلّ محل بياناتك الحالية على هذا الجهاز.</p><button class="btn accent" id="ry">استعادة</button><div style="height:8px"></div><button class="btn ghost" id="rn">إلغاء</button>`,(m,close)=>{
      m.querySelector('#rn').onclick=close;
      m.querySelector('#ry').onclick=async()=>{ close(); S=Object.assign({},DEF,o.state); fixState(); save(); await scheduleReminders(); toast('تمت استعادة بياناتك'); tab='home'; render(); }; }); };
  rd.readAsText(file);
}
async function privacySheet(){
  let html='<p>تعذّر تحميل السياسة.</p>'; try{ const r=await fetch('privacypolicy.html'); const t=await r.text(); const d=new DOMParser().parseFromString(t,'text/html'); const mn=d.querySelector('main'); if(mn) html=mn.innerHTML; }catch(e){}
  modal(`<div class="policy">${html}</div>`);
}

/* ============ القفل بالبصمة ============ */
let _bgAt=0;
function showLock(){
  if(!S.lock||!BIO||document.getElementById('lockv')) return;
  const d=document.createElement('div'); d.id='lockv'; d.className='lockv'; d.setAttribute('role','dialog'); d.setAttribute('aria-modal','true'); d.setAttribute('aria-labelledby','lkH');
  d.innerHTML=`<div class="lk">${ic('lock','lg')}<h2 id="lkH">عافيتي مقفل</h2><p>بياناتك الصحية محمية. افتح بالبصمة أو قفل الجوال.</p><button class="btn white" id="unl">${ic('finger')}فتح</button></div>`;
  document.body.appendChild(d); d.querySelector('#unl').onclick=unlock; setTimeout(unlock,300);
}
async function unlock(){ try{ await BIO.verifyIdentity({reason:'افتح عافيتي',title:'عافيتي',subtitle:'تحقّق من هويتك',description:'استخدم البصمة أو قفل الجوال',useFallback:true,maxAttempts:5}); const d=document.getElementById('lockv'); d&&d.remove(); }catch(e){} }
async function toggleLock(){
  if(S.lock){ S.lock=false; save(); toast('أُلغي القفل'); render(); return; }
  if(!BIO){ toast('القفل متاح في تطبيق الجوال فقط'); return; }
  try{ const a=await BIO.isAvailable({useFallback:true}); if(!a.isAvailable){ toast('لا توجد بصمة أو قفل شاشة مفعّل على الجوال'); return; }
    await BIO.verifyIdentity({reason:'تفعيل قفل عافيتي',title:'عافيتي',subtitle:'أكّد هويتك لتفعيل القفل',useFallback:true}); S.lock=true; save(); toast('فُعّل القفل بالبصمة'); render(); }catch(e){ toast('لم يُفعّل القفل'); }
}

/* ============ تبويب «صحتي» ============ */
function renderHealth(){
  const seg=S.hseg||(S.diabetes?'dm':'men');
  const segs=[S.diabetes?['dm','السكري']:null,['food','الغذاء'],['ind','المؤشرات'],['men','صحة الرجل']].filter(Boolean);
  const head=`<div class="mhero"><h1>صحتي</h1><p>${S.diabetes?'متابعة السكري والغذاء والمؤشرات — كل توصية هنا من دراسة منشورة أو إرشاد طبي معتمد.':'ما الذي يحسّن الانتصاب والتحكم فعلًا؟ كل نقطة من دراسة منشورة.'}</p></div>
  <div class="segc" role="tablist" aria-label="أقسام صحتي">${segs.map(([k,n])=>`<button role="tab" aria-selected="${seg===k}" class="${seg===k?'on':''}" data-seg="${k}">${n}</button>`).join('')}</div>`;
  let body='';
  if(seg==='men'){ renderMen(head); return; }
  if(seg==='dm') body=dmBody();
  if(seg==='food') body=foodBody();
  if(seg==='ind') body=indBody();
  app.innerHTML=head+body+CREDIT;
  app.querySelectorAll('[data-seg]').forEach(b=>b.onclick=()=>{ S.hseg=b.dataset.seg; save(); render(); });
  bindHealth();
}
function dmBody(){
  const g7=gluStats(7), g14=gluStats(14), lg=gLast(), a1=S.a1c[S.a1c.length-1], noc=nocturiaAvg(7), lastNight=nocturia(today());
  const doses=[]; S.meds.filter(x=>x.on).forEach(md=>md.times.forEach(t=>doses.push({md,t})));
  doses.sort((a,b)=>a.t<b.t?-1:1);
  return `<div class="sec"><h2>السكر</h2><button class="btn accent sm" id="gAdd">${ic('plus')}قراءة</button></div>
  <div class="card">
    <div class="grid3" style="margin-bottom:10px"><div class="stat"><b class="${lg?gClass(lg.v):''}">${lg?gfmt(lg.v):'—'}</b><span class="small muted">آخر قراءة</span></div><div class="stat"><b>${g7?gfmt(g7.avg):'—'}</b><span class="small muted">متوسط 7 أيام</span></div><div class="stat"><b>${g14?Math.round(g14.tir*100)+'%':'—'}</b><span class="small muted">ضمن النطاق</span></div></div>
    ${gluChart(14)}
    <p class="small muted" style="margin:6px 0 0">النطاق المظلّل ${gfmt(70)}–${gfmt(180)} ${GU()}. الهدف لأغلب البالغين: صائم ${gfmt(80)}–${gfmt(130)}، وبعد الأكل بساعتين أقل من ${gfmt(180)}${g14&&g14.low?` · <b style="color:var(--danger)">${g14.low} انخفاض خلال أسبوعين</b>`:''}.</p>
    ${S.hc.on?'<p class="small muted" style="margin:4px 0 0">تُضاف قراءات جهاز القياس أو الحسّاس المرتبط بـHealth Connect تلقائيًا.</p>':''}
  </div>
  <div class="card"><div class="row" style="justify-content:space-between"><h3 style="margin:0">التراكمي HbA1c</h3><button class="btn ghost sm" id="aAdd" style="flex:0 0 auto">${ic('plus')}إضافة</button></div>
    ${S.a1c.length?lineChart(S.a1c.slice(-6).map(x=>({x:x.date.slice(5),v:x.v})),{min:Math.min(5,...S.a1c.map(x=>x.v))-0.5,max:Math.max(9,...S.a1c.map(x=>x.v))+0.5,fmt:v=>v+'%',label:'تطور التراكمي'}):'<p class="small muted">سجّل نتيجة آخر تحليل لتتابع تطوّرها كل 3 أشهر.</p>'}
    <p class="small" style="margin:6px 0 0">كل ارتفاع 1% في التراكمي ارتبط بزيادة احتمال ضعف الانتصاب (Lu 2009). ضبط السكر نفسه علاج للانتصاب.</p></div>
  <div class="card"><div class="ev" style="padding-top:0"><span class="badge">${ic('shield')}</span><div><b>فحص ما قبل الرياضة</b><p>قِس السكر قبل المشي أو تمارين المقاومة لتعرف إن كان آمنًا، وما الذي تأكله قبلها.</p></div></div><button class="btn accent" id="exC">${ic('play')}ابدأ الفحص</button></div>
  <div class="sec"><h2>الأدوية</h2><button class="btn ghost sm" id="mAdd2">${ic('plus')}دواء</button></div>
  <div class="card plan">${doses.length?doses.map(({md,t})=>{ const tk=medTaken(today(),md.id,t); return `<div class="slot ${tk?'done':''}"><span class="tm">${t}</span><button class="st" data-med="${md.id}|${t}" aria-pressed="${tk}" aria-label="${tk?'تم أخذ':'لم يُؤخذ'} ${esc(md.name)}">${tk?ic('check'):ic('pill')}</button><span class="tx"><b>${esc(md.name)}</b><span>${esc(md.dose)||'—'}</span></span><button class="iconbtn" data-medit="${md.id}" aria-label="تعديل ${esc(md.name)}">${ic('set')}</button></div>`; }).join(''):'<p class="small muted" style="margin:12px 0">أضف أدويتك (مثل الميتفورمين) ليصلك تذكير في مواعيدها مع زر «أخذته».</p>'}
    ${S.meds.length?`<p class="small muted" style="margin:8px 0">الالتزام آخر 7 أيام: ${medAdherence(7)===null?'—':Math.round(medAdherence(7)*100)+'%'}</p>`:''}</div>
  <div class="sec"><h2>مذكرة المثانة</h2><span>${noc!==null?'متوسط الليل '+noc.toFixed(1):''}</span></div>
  <div class="card"><p class="small muted" style="margin-top:0">سجّل كل مرة بلمسة. السكري يزيد عدد مرات التبول والاستيقاظ ليلًا، والمذكرة تساعد طبيبك وتُظهر أثر التمارين.</p>
    <div class="row">${BLK.map(([k,n,i])=>`<button class="btn ghost bl" data-bl="${k}">${i}${n}<span class="cnt">${blToday(k)}</span></button>`).join('')}</div>
    <p class="small" style="margin:10px 0 0">الليلة الماضية: <b>${lastNight}</b> مرة · ${S.nightLess?'تتوقف تذكيرات الماء قبل النوم بساعتين.':'تذكيرات الماء لا تتوقف قبل النوم.'}</p>
    ${noc!==null&&noc>=2?'<div class="warn small" style="margin-top:8px">الاستيقاظ للتبول مرتين أو أكثر كل ليلة يستحق مراجعة الطبيب — قد يرتبط بارتفاع السكر أو البروستاتا أو النوم.</div>':''}</div>
  <div class="sec"><h2>الساعة الذكية</h2></div>
  <div class="card"><div class="ev" style="padding:0"><span class="badge">${ic('pulse')}</span><div><b>${S.hc.on?'مرتبطة عبر Health Connect':'اربط ساعتك'}</b><p>${S.hc.on?`الخطوات اليوم ${stepsNow()??'—'} · النوم ${S.hc.sleepDate===today()&&S.hc.sleep?fmtH(S.hc.sleep):'—'}${S.hc.rhr?' · نبض الراحة '+S.hc.rhr:''}`:'لقراءة الخطوات والنوم والنبض وقراءات السكر من جهاز القياس تلقائيًا.'}</p></div></div>
    <button class="btn ${S.hc.on?'ghost':'accent'}" id="hcB" style="margin-top:10px">${S.hc.on?ic('repeat')+'تحديث الآن':ic('pulse')+'ربط الساعة الذكية'}</button></div>
  <div class="card srcs small"><b>المراجع</b><ol style="margin:6px 0 0;padding-inline-start:18px">
    <li><a href="https://diabetesjournals.org/care/issue" target="_blank" rel="noopener">American Diabetes Association. Standards of Care in Diabetes 2026 — Diabetes Care</a></li>
    <li><a href="https://doi.org/10.2337/dc16-1728" target="_blank" rel="noopener">Colberg SR, et al. Physical Activity/Exercise and Diabetes. Diabetes Care 2016</a></li>
    <li><a href="https://pubmed.ncbi.nlm.nih.gov/19473477/" target="_blank" rel="noopener">HbA1c and erectile dysfunction in diabetic men — PMID 19473477</a></li>
    <li><a href="https://doi.org/10.1111/dme.13403" target="_blank" rel="noopener">Kouidrat Y, et al. High prevalence of ED in diabetes: 145 studies. Diabet Med 2017</a></li></ol></div>`;
}
function foodBody(){
  const wd=new Date().getDay(), m=MEALS[wd], tm=mealToday(), tom=MEALS[(wd+1)%7];
  return `<div class="card fcard"><p class="lbl">برنامج اليوم · ${AR_DAYS[wd]}</p><div class="hrow" style="gap:12px;align-items:flex-start"><span class="ic-badge" style="margin:0;width:52px;height:52px">${ic(m[0])}</span><div style="flex:1"><h3 style="margin:0">${m[1]}</h3><p class="small" style="margin:4px 0">${m[2]}</p><p class="small muted" style="margin:0">${m[3]}</p></div></div>
    <button class="btn ${tm.focus?'ghost':'accent'}" id="fDone" style="margin-top:12px" aria-pressed="${!!tm.focus}">${tm.focus?ic('check')+'تناولتها اليوم':'سجّل أنك تناولتها'}</button>
    <p class="small muted" style="margin:8px 0 0">غدًا: ${tom[1]} · أنجزت ${mealWeek()} من 7 هذا الأسبوع</p></div>
  <div class="sec"><h2>ثوابت كل يوم</h2><span>${DAILY.filter(([k])=>tm[k]).length} من ${DAILY.length}</span></div>
  <div class="card">${DAILY.map(([k,t])=>`<div class="hab ${tm[k]?'on':''}"><button class="hb" data-meal="${k}" aria-pressed="${!!tm[k]}" aria-label="${t}"><span class="box">${tm[k]?ic('check'):''}</span></button><span style="flex:1"><b>${t}</b></span></div>`).join('')}</div>
  <div class="sec"><h2>أسبوعك الغذائي</h2></div>
  <div class="card plan">${MEALS.map((x,i)=>`<div class="slot ${i===wd?'next':''}"><span class="tm">${AR_DAYS[i]}</span><span class="st">${ic(x[0])}</span><span class="tx"><b>${x[1]}</b><span>${x[2]}</span></span></div>`).join('')}</div>
  <div class="card"><h3>قواعد مهمة لمريض السكري</h3>
    <div class="ev"><span class="badge">${ic('grains')}</span><div><b>راقب كمية النشويات لا نوعها فقط</b><p>ربع الطبق نشويات (أرز أو خبز)، ونصفه خضار، وربعه بروتين.</p></div></div>
    <div class="ev"><span class="badge">${ic('citrus')}</span><div><b>الفاكهة كاملة، والعصير لا</b><p>التوت والعنب والتفاح ارتبطت بانخفاض خطر السكري، بينما ارتبط العصير بارتفاعه.</p></div></div>
    <div class="ev"><span class="badge">${ic('drop')}</span><div><b>قِس بعد الوجبات الجديدة</b><p>قياس بعد الأكل بساعتين يخبرك كيف يتفاعل جسمك مع كل وجبة.</p></div></div>
    <div class="ev"><span class="badge">${ic('walk')}</span><div><b>امشِ 10–15 دقيقة بعد الأكل</b><p>المشي بعد الوجبة يخفض ارتفاع السكر بعدها.</p></div></div></div>
  <div class="sec"><h2>ما تقوله الدراسات</h2></div>
  <div class="card" style="padding:4px 16px">
    <div class="ev"><span class="badge">${ic('leaf')}</span><div><b>النظام المتوسطي يحمي الانتصاب لدى مرضى السكري</b><p>تجربة MÈDITA: رجال بسكري نوع 2 حديث التشخيص، تابعتهم 8 سنوات. من اتبع النظام المتوسطي كان خطر ضعف الوظيفة الجنسية لديهم أقل بنحو النصف مقارنة بالنظام قليل الدهون.</p><span class="lvl a">أدلة قوية</span> <span class="small muted">Maiorino، J Diabetes Complications 2016</span></div></div>
    <div class="ev"><span class="badge">${ic('chart')}</span><div><b>كلما زاد الالتزام قلّ الضعف</b><p>دراسة CAPRI على 555 رجلًا بسكري نوع 2: أعلى التزام بالنظام المتوسطي ارتبط بأقل انتشار لضعف الانتصاب.</p><span class="lvl b">أدلة متوسطة</span> <span class="small muted">Giugliano، J Sex Med 2010</span></div></div>
    <div class="ev"><span class="badge">${ic('citrus')}</span><div><b>الفاكهة الكاملة لا العصير</b><p>ثلاث حصص أسبوعيًا من التوت ارتبطت بخطر سكري أقل بنحو 26%، بينما ارتبط العصير بزيادة الخطر.</p><span class="lvl b">أدلة متوسطة</span> <span class="small muted">Muraki، BMJ 2013</span></div></div>
    <div class="ev"><span class="badge">${ic('star')}</span><div><b>الفلافونويد والانتصاب</b><p>من تناولوا أكثر أطعمة غنية بالفلافونويد (توت، حمضيات) كان خطر ضعف الانتصاب لديهم أقل.</p><span class="lvl b">أدلة متوسطة</span> <span class="small muted">Cassidy، Am J Clin Nutr 2016</span></div></div></div>
  <div class="card srcs small"><b>المراجع</b><ol style="margin:6px 0 0;padding-inline-start:18px">
    <li><a href="https://pubmed.ncbi.nlm.nih.gov/?term=MEDITA+Mediterranean+diet+sexual+function+type+2+diabetes" target="_blank" rel="noopener">Maiorino MI, et al. Mediterranean diet and sexual function in newly diagnosed type 2 diabetes: the MÈDITA trial. J Diabetes Complications 2016</a></li>
    <li><a href="https://pubmed.ncbi.nlm.nih.gov/?term=Giugliano+2010+Mediterranean+diet+erectile+dysfunction+type+2+diabetes" target="_blank" rel="noopener">Giugliano F, et al. Adherence to Mediterranean diet and ED in men with type 2 diabetes. J Sex Med 2010</a></li>
    <li><a href="https://doi.org/10.1136/bmj.f5001" target="_blank" rel="noopener">Muraki I, et al. Fruit consumption and risk of type 2 diabetes. BMJ 2013</a></li>
    <li><a href="https://doi.org/10.3945/ajcn.115.122010" target="_blank" rel="noopener">Cassidy A, et al. Dietary flavonoid intake and ED. Am J Clin Nutr 2016</a></li></ol></div>`;
}
function indBody(){
  const ii=S.iief, last=ii[ii.length-1], tests=S.tests||[];
  return `<div class="card"><div class="row" style="justify-content:space-between"><h3 style="margin:0">مؤشر الانتصاب IIEF-5</h3>${last?`<span class="lvl ${iiefCat(last.s)[1]}">${last.s}/25</span>`:''}</div>
    ${ii.length?lineChart(ii.slice(-8).map(x=>({x:x.date.slice(5),v:x.s})),{min:4,max:26,label:'تطور مؤشر الانتصاب'}):'<p class="small muted">قِس نقطة البداية الآن، ثم كل شهر — لترى أثر التمارين والغذاء بالأرقام.</p>'}
    <button class="btn ${iiefDue()?'accent':'ghost'}" id="iGo" style="margin-top:8px">${iiefDue()?ic('play')+'أجب عن الاستبيان (دقيقة)':'القياس التالي بعد '+(28-dayDiff(last.date,today()))+' يومًا'}</button></div>
  <div class="card"><div class="row" style="justify-content:space-between"><h3 style="margin:0">اختبار القوة</h3><span class="tagx">${LV_NAME[curLevel()]}</span></div>
    ${tests.length?lineChart(tests.slice(-8).map(x=>({x:x.date.slice(5),v:x.hold})),{min:0,max:Math.max(12,...tests.map(x=>x.hold))+2,fmt:v=>v+'ث',label:'تطور أطول ثبات'}):'<p class="small muted">لم تُجرِ اختبار القوة بعد.</p>'}
    <button class="btn ${testDue()?'accent':'ghost'}" id="tGo2" style="margin-top:8px">${testDue()?ic('play')+'ابدأ اختبار القوة':'الاختبار التالي بعد '+(14-dayDiff(S.test.date,today()))+' يومًا · أعِده الآن'}</button></div>
  <div class="sec"><h2>التقارير</h2></div>
  <div class="card"><div class="ev" style="padding-top:0"><span class="badge">${ic('chart')}</span><div><b>التقرير الأسبوعي</b><p>ملخص 7 أيام: التمارين، السكر، الأدوية، الخطوات، المثانة.</p></div></div><button class="btn ghost" id="rW">${ic('share')}عرض ومشاركة</button>
    <div class="ev"><span class="badge">${hi('stetho')}</span><div><b>تقرير للطبيب</b><p>30 يومًا مع آخر قراءات السكر والتراكمي والأدوية ومؤشر الانتصاب — أرسله قبل موعدك.</p></div></div><button class="btn accent" id="rD">${ic('share')}إنشاء تقرير الطبيب</button></div>
  <div class="card"><h3>متى ترى النتائج؟</h3><div class="tl">
    <div><b>2–4 أسابيع</b><span>إحساس أوضح بالعضلة وتحكّم أفضل بالمثانة.</span></div>
    <div><b>6 أسابيع</b><span>في تجربة على رجال بسكري نوع 2، تحسّن مؤشر الانتصاب وتدفّق الدم مع التمارين المنزلية.</span></div>
    <div><b>3 أشهر</b><span>تحسّن الانتصاب لدى نسبة كبيرة في تجربة Dorey.</span></div>
    <div><b>3–6 أشهر</b><span>النتيجة الكاملة لتدريب القوة. استمر حتى بعدها للمحافظة.</span></div></div>
    <p class="small muted" style="margin:8px 0 0"><span class="lvl b">أدلة متوسطة</span> Ahmad 2026، J Physiother · Dorey 2005، BJU Int</p></div>`;
}
function bindHealth(){
  const on=(id,f)=>{ const e=$(id); if(e) e.onclick=f; };
  on('#gAdd',()=>gluSheet()); on('#aAdd',a1cSheet); on('#exC',()=>exCheck()); on('#mAdd2',()=>medSheet());
  on('#hcB',async()=>{ if(S.hc.on){ await hcSync(true); render(); toast('تم التحديث'); } else hcConnect(); });
  on('#fDone',()=>{ mealSet('focus',!mealToday().focus); Haptic.light(); render(); });
  on('#iGo',()=>iiefSheet()); on('#tGo2',()=>startTest()); on('#rW',()=>reportSheet(7,false)); on('#rD',()=>reportSheet(30,true));
  app.querySelectorAll('[data-meal]').forEach(b=>b.onclick=()=>{ mealSet(b.dataset.meal,!mealToday()[b.dataset.meal]); Haptic.light(); render(); });
  app.querySelectorAll('[data-med]').forEach(b=>b.onclick=()=>{ const [id,t]=b.dataset.med.split('|'); medMark(today(),id,t,!medTaken(today(),id,t)); Haptic.light(); reschedule(); render(); });
  app.querySelectorAll('[data-medit]').forEach(b=>b.onclick=()=>medSheet(S.meds.find(x=>x.id===b.dataset.medit)));
  app.querySelectorAll('[data-bl]').forEach(b=>b.onclick=()=>{ blAdd(b.dataset.bl); toast('سُجّل: '+BLK.find(x=>x[0]===b.dataset.bl)[1]); render(); });
}

/* ============ إشعارات 2.5 ============ */
const KNACK=[['قبل أن تسعل أو تعطس','اشدد قاع الحوض أولًا ثم اسعل — «الحيلة» تمنع التسرّب.'],['قبل أن ترفع شيئًا','شدّ قاع الحوض ثم ارفع، وتنفّس أثناء الرفع.'],['قبل أن تقف من الجلوس','انقباضة سريعة قبل الوقوف تحمي المثانة.']];
function moreNotifs(list,now){
  const D=(i,h,m)=>new Date(now.getFullYear(),now.getMonth(),now.getDate()+i,h,m,0);
  if(S.meal.on){ const [h,m]=S.meal.time.split(':').map(Number), [eh,em]=S.meal.eve.split(':').map(Number);
    for(let i=0;i<7;i++){ const wd=(now.getDay()+i)%7, ml=MEALS[wd], at=D(i,h,m), ev=D(i,eh,em);
      if(at>now && !(i===0&&mealToday().focus)) list.push({id:9000+i*2,title:'غداء اليوم: '+ml[1],body:ml[2],schedule:{at,allowWhileIdle:true},channelId:'meals',smallIcon:'ic_stat_notify',actionTypeId:'MEAL',extra:{go:'meal'}});
      if(ev>now){ const tm=MEALS[(wd+1)%7]; list.push({id:9001+i*2,title:'جهّز لغدٍ: '+tm[1],body:tm[2],schedule:{at:ev,allowWhileIdle:true},channelId:'meals',smallIcon:'ic_stat_notify',extra:{go:'meal'}}); } } }
  S.meds.filter(x=>x.on).forEach((md,mi)=>md.times.forEach((t,ti)=>{ const [h,m]=t.split(':').map(Number);
    for(let i=0;i<7;i++){ const at=D(i,h,m); if(at<=now) continue; const d=dstr(at); if(medTaken(d,md.id,t)) continue;
      list.push({id:9300+i*20+mi*4+ti,title:'موعد دواء: '+md.name,body:(md.dose?md.dose+' — ':'')+'اضغط «أخذته» بعد تناوله.',schedule:{at,allowWhileIdle:true},channelId:'meds',smallIcon:'ic_stat_notify',actionTypeId:'MED',extra:{go:'med',key:d+'|'+md.id+'|'+t}}); } }));
  if(S.knackOn) for(let i=0;i<7;i++){ const at=D(i,11,0); if(at>now){ const k=KNACK[i%3]; list.push({id:9900+i,title:k[0],body:k[1],schedule:{at,allowWhileIdle:true},channelId:'training',smallIcon:'ic_stat_notify',extra:{go:'home'}}); } }
  if(S.test){ const at=new Date(S.test.date+'T18:00:00'); at.setDate(at.getDate()+14); const a2=at>now?at:D(1,18,0); list.push({id:9960,title:'حان اختبار القوة',body:'دقيقتان لقياس تقدّمك ورفع مستوى خطتك.',schedule:{at:a2,allowWhileIdle:true},channelId:'training',smallIcon:'ic_stat_notify',extra:{go:'test'}}); }
  else if(S.onboarded) list.push({id:9960,title:'اختبر قوتك لتُبنى خطتك',body:'اختبار دقيقتين يحدد مدة انقباضك وعدد التكرارات المناسبة لك.',schedule:{at:D(now.getHours()<18?0:1,18,30),allowWhileIdle:true},channelId:'training',smallIcon:'ic_stat_notify',extra:{go:'test'}});
  { const l=S.iief[S.iief.length-1]; let at=l?new Date(l.date+'T21:00:00'):D(3,21,0); if(l) at.setDate(at.getDate()+30); if(at<=now) at=D(1,21,0); list.push({id:9950,title:'مؤشر الانتصاب الشهري',body:'5 أسئلة سريعة لقياس تقدّمك هذا الشهر.',schedule:{at,allowWhileIdle:true},channelId:'health',smallIcon:'ic_stat_notify',extra:{go:'iief'}}); }
  { let at=D((5-now.getDay()+7)%7,20,0); if(at<=now) at=D((5-now.getDay()+7)%7+7,20,0); list.push({id:9980,title:'تقريرك الأسبوعي جاهز',body:'ملخص التمارين والسكر والخطوات — شاركه أو احفظه.',schedule:{at,allowWhileIdle:true},channelId:'health',smallIcon:'ic_stat_notify',extra:{go:'report'}}); }
}
