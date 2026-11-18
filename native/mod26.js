/* ============ الدولة: الوحدة، الطوارئ، رمضان ============ */
const CTRY={ // [الاسم، وحدة السكر، رقم الإسعاف، بلد مسلم]
  KW:['الكويت','mmol','112',1],SA:['السعودية','mg','997',1],AE:['الإمارات','mg','998',1],QA:['قطر','mg','999',1],BH:['البحرين','mg','999',1],OM:['عُمان','mg','9999',1],
  EG:['مصر','mg','123',1],JO:['الأردن','mg','911',1],IQ:['العراق','mg','112',1],LB:['لبنان','mg','140',1],SY:['سوريا','mg','110',1],PS:['فلسطين','mg','101',1],YE:['اليمن','mg','112',1],
  SD:['السودان','mg','999',1],LY:['ليبيا','mg','112',1],TN:['تونس','mg','190',1],DZ:['الجزائر','mg','14',1],MA:['المغرب','mg','15',1],TR:['تركيا','mg','112',1],PK:['باكستان','mg','1122',1],
  MY:['ماليزيا','mmol','999',1],ID:['إندونيسيا','mg','112',1],GB:['المملكة المتحدة','mmol','999',0],IE:['أيرلندا','mmol','112',0],US:['الولايات المتحدة','mg','911',0],CA:['كندا','mmol','911',0],
  AU:['أستراليا','mmol','000',0],NZ:['نيوزيلندا','mmol','111',0],DE:['ألمانيا','mg','112',0],FR:['فرنسا','mg','15',0],SE:['السويد','mmol','112',0],NL:['هولندا','mmol','112',0],IN:['الهند','mg','112',0]
};
const TZC={'Asia/Kuwait':'KW','Asia/Riyadh':'SA','Asia/Dubai':'AE','Asia/Qatar':'QA','Asia/Bahrain':'BH','Asia/Muscat':'OM','Africa/Cairo':'EG','Asia/Amman':'JO','Asia/Baghdad':'IQ','Asia/Beirut':'LB','Asia/Damascus':'SY','Asia/Gaza':'PS','Asia/Hebron':'PS','Asia/Aden':'YE','Africa/Khartoum':'SD','Africa/Tripoli':'LY','Africa/Tunis':'TN','Africa/Algiers':'DZ','Africa/Casablanca':'MA','Europe/Istanbul':'TR','Asia/Karachi':'PK','Asia/Kuala_Lumpur':'MY','Asia/Jakarta':'ID','Europe/London':'GB','Europe/Dublin':'IE','America/New_York':'US','America/Chicago':'US','America/Denver':'US','America/Los_Angeles':'US','America/Phoenix':'US','America/Toronto':'CA','America/Vancouver':'CA','Australia/Sydney':'AU','Australia/Melbourne':'AU','Australia/Perth':'AU','Pacific/Auckland':'NZ','Europe/Berlin':'DE','Europe/Paris':'FR','Europe/Stockholm':'SE','Europe/Amsterdam':'NL','Asia/Kolkata':'IN','Asia/Calcutta':'IN'};
function detectCountry(){
  try{ for(const l of (navigator.languages||[navigator.language])){ const r=(l.split(/[-_]/)[1]||'').toUpperCase(); if(CTRY[r]) return r; } }catch(e){}
  try{ const z=Intl.DateTimeFormat().resolvedOptions().timeZone; if(TZC[z]) return TZC[z]; }catch(e){}
  return null;
}
const ctry=()=>S.country&&CTRY[S.country]?S.country:(detectCountry()||'');
const ctryName=c=>CTRY[c]?CTRY[c][0]:'غير محددة';
const emerg=()=>CTRY[ctry()]?CTRY[ctry()][2]:'112';
const emergBtn=()=>`<a class="btn danger" href="tel:${emerg()}" style="margin-top:8px">${ic('alert')}اتصل بالإسعاف ${emerg()}</a>`;
function hijriMonth(d=new Date()){ try{ return +new Intl.DateTimeFormat('en-u-ca-islamic-umalqura',{month:'numeric'}).format(d); }catch(e){ return 0; } }
const isRamadanDate=(d=new Date())=>hijriMonth(d)===9;
const ramadanOn=()=>S.ram.mode==='on'||(S.ram.mode==='auto'&&isRamadanDate()&&!!(CTRY[ctry()]||[])[3]);
const ramWaterSlots=()=>{ let a=toMin(S.ram.iftar), b=toMin(S.ram.suhoor); if(b<=a) b+=1440; const out=[]; for(let m=a+15;m<=b-10&&out.length<S.water.goal;m+=Math.max(45,Math.floor((b-a-25)/Math.max(1,S.water.goal-1)))) out.push(m%1440); return out; };
function ramadanCard(){
  if(!ramadanOn()) return '';
  const lg=gLast(), dm=S.diabetes;
  return `<div class="card ramc"><div class="hrow" style="gap:10px"><span class="ic-badge" style="margin:0">${ic('moon')}</span><div style="flex:1"><b>وضع رمضان</b><p class="small muted" style="margin:2px 0 0">الإفطار ${S.ram.iftar} · السحور ${S.ram.suhoor}${S.ram.mode==='auto'?' · فُعّل تلقائيًا':''}</p></div><button class="btn ghost sm" id="ramSet" style="flex:0 0 auto">${ic('set')}</button></div>
   ${dm?`<div class="warn small" style="margin-top:10px"><b>أفطر فورًا</b> إذا كان السكر أقل من ${gfmt(70)} أو أعلى من ${gfmt(300)} ${GU()}، أو شعرت بأعراض الانخفاض. قياس السكر لا يُفطر.</div>
   <p class="small" style="margin:8px 0 0">قِس: قبل السحور، منتصف النهار، قبل الإفطار، وبعد الإفطار بساعتين.${lg?' آخر قراءة: <b>'+gfmt(lg.v)+'</b>':''}</p>
   <button class="btn accent sm" id="ramG" style="margin-top:8px">${ic('drop')}سجّل قراءة</button>`:'<p class="small" style="margin:8px 0 0">تذكيرات الماء الآن بين الإفطار والسحور، والرياضة الخفيفة بعد الإفطار بساعتين.</p>'}
  </div>`;
}
function ramSheet(){
  modal(`<form id="rmF" aria-labelledby="rmH"><h3 id="rmH">وضع رمضان</h3>
    <fieldset class="radios seg3"><legend>التفعيل</legend>${[['auto','تلقائي'],['on','مفعّل'],['off','متوقف']].map(([v,n])=>`<label><input type="radio" name="md" value="${v}" ${S.ram.mode===v?'checked':''}> ${n}</label>`).join('')}</fieldset>
    <p class="small muted" style="margin-top:-6px">«تلقائي» يعمل في شهر رمضان حسب التقويم الهجري (أم القرى) في الدول الإسلامية.</p>
    <div class="set"><label for="rmI">وقت الإفطار</label><input type="time" id="rmI" value="${S.ram.iftar}"></div>
    <div class="set"><label for="rmS">نهاية السحور (الإمساك)</label><input type="time" id="rmS" value="${S.ram.suhoor}"></div>
    <div class="card small" style="box-shadow:none;background:var(--bg)"><b>إرشادات الصيام لمريض السكري</b><ul style="margin:6px 0 0;padding-inline-start:18px">
      <li>استشر طبيبك قبل رمضان لتقييم خطورة الصيام وتعديل مواعيد الأدوية والجرعات.</li>
      <li>أفطر فورًا إذا نزل السكر عن ${gfmt(70)} أو تجاوز ${gfmt(300)} ${GU()}.</li>
      <li>أخّر السحور قدر الإمكان، وابدأ الإفطار بتمر وماء ثم وجبة متوازنة بعد قليل.</li>
      <li>الرياضة الخفيفة بعد الإفطار بساعتين، وتُحسب صلاة التراويح نشاطًا.</li>
      <li>من لا يصوم لعذر طبي مأجور ولا حرج عليه.</li></ul>
      <p class="muted" style="margin:6px 0 0">إرشادات IDF-DAR الدولية للسكري ورمضان.</p></div>
    <button type="submit" class="btn accent">${ic('check')}حفظ</button></form>`,(m,close)=>{
    m.querySelector('#rmF').addEventListener('submit',e=>{ e.preventDefault(); const fd=new FormData(e.target);
      S.ram.mode=fd.get('md')||'auto'; S.ram.iftar=m.querySelector('#rmI').value||S.ram.iftar; S.ram.suhoor=m.querySelector('#rmS').value||S.ram.suhoor; save(); reschedule(); close(); render(); }); });
}
function ramNotifs(list,now){
  if(!ramadanOn()) return;
  const D=(i,h,m)=>new Date(now.getFullYear(),now.getMonth(),now.getDate()+i,h,m,0);
  const [ih,im]=S.ram.iftar.split(':').map(Number), [sh,sm]=S.ram.suhoor.split(':').map(Number);
  for(let i=0;i<5;i++){
    const before=D(i,sh,sm-45), post=D(i,ih+2,im), mid=D(i,ih-5,im), pre=D(i,ih,im-20);
    if(before>now) list.push({id:9600+i*6,title:'وقت السحور',body:'تسحّر الآن: بروتين وخضار ونشويات بطيئة واشرب ماء'+(S.diabetes?'، وقِس السكر.':'.'),schedule:{at:before,allowWhileIdle:true},channelId:'meals',smallIcon:'ic_stat_notify',extra:{go:'glu'}});
    if(S.diabetes){
      if(mid>now) list.push({id:9601+i*6,title:'قياس منتصف النهار',body:'قِس السكر — أفطر فورًا إن كان أقل من '+gfmt(70)+' أو أعلى من '+gfmt(300)+'.',schedule:{at:mid,allowWhileIdle:true},channelId:'health',smallIcon:'ic_stat_notify',extra:{go:'glu'}});
      if(pre>now) list.push({id:9602+i*6,title:'قبل الإفطار',body:'قِس السكر الآن، ثم ابدأ إفطارك بتمرة وماء.',schedule:{at:pre,allowWhileIdle:true},channelId:'health',smallIcon:'ic_stat_notify',extra:{go:'glu'}});
      if(post>now) list.push({id:9603+i*6,title:'بعد الإفطار بساعتين',body:'وقت قياس السكر، ووقت مناسب لمشي خفيف.',schedule:{at:post,allowWhileIdle:true},channelId:'health',smallIcon:'ic_stat_notify',extra:{go:'glu'}});
    }
  }
}

/* ============ دليل الفحوصات الدورية (ADA 2026) ============ */
const CHECKS=[
  ['a1c','السكر التراكمي HbA1c','كل 3 أشهر إن لم تصل للهدف، وكل 6 أشهر إن كان ضمن الهدف.',()=>{ const l=S.a1c[S.a1c.length-1]; return l&&l.v<7?6:3; },'drop'],
  ['kidney','وظائف الكلى: الألبومين في البول (UACR) وeGFR','تحليل بول وتحليل دم سنويًا لاكتشاف تأثر الكلى مبكرًا.',()=>12,'flask'],
  ['eye','فحص قاع العين بتوسيع الحدقة','عند طبيب العيون سنويًا، وقد يمدّه إلى سنتين إن كانت الفحوص سليمة.',()=>12,'eye'],
  ['foot','فحص القدم الشامل','عند الطبيب سنويًا (الإحساس والنبض والجلد)، مع فحص قدميك بنفسك يوميًا.',()=>12,'shield'],
  ['lipid','دهون الدم (الكوليسترول)','سنويًا، أو حسب ما يحدده طبيبك.',()=>12,'heart'],
  ['dental','الأسنان واللثة','كل 6–12 شهرًا؛ أمراض اللثة أكثر مع السكري وتؤثر على ضبطه.',()=>12,'smile']
];
function checkLast(k){ if(k==='a1c'){ const l=S.a1c[S.a1c.length-1]; const c=S.checks.a1c; return l&&(!c||l.date>c)?l.date:c||null; } return S.checks[k]||null; }
function checkDue(k,months){ const l=checkLast(k); if(!l) return null; const d=new Date(l+'T10:00:00'); d.setMonth(d.getMonth()+months); return dstr(d); }
function checksBody(){
  const rows=CHECKS.map(([k,t,how,mf,icn])=>{ const l=checkLast(k), due=checkDue(k,mf()), over=!l||due<=today(), soon=due&&!over&&dayDiff(today(),due)<=30;
    return `<button class="chkrow" data-chk="${k}"><span class="badge ${over?'due':soon?'soon':''}">${ic(icn)}</span><span class="tx"><b>${t}</b><span>${how}</span><span class="st ${over?'due':soon?'soon':'ok'}">${!l?'لم يُسجَّل — أضف تاريخ آخر فحص':over?'مستحق الآن (آخره '+l+')':'التالي '+due+(soon?' — قريبًا':'')}</span></span></button>`; }).join('');
  return `<div class="sec"><h2>الفحوصات الدورية</h2><span>${CHECKS.filter(([k,,,mf])=>{ const l=checkLast(k); return !l||checkDue(k,mf())<=today(); }).length} مستحقة</span></div>
  <div class="card" style="padding:4px 12px">${rows}</div>
  <div class="card"><h3>قياس الضغط في البيت بالطريقة الصحيحة</h3><ol class="small" style="margin:0;padding-inline-start:18px;line-height:1.9">
    <li>لا قهوة ولا تدخين ولا رياضة قبل القياس بـ30 دقيقة، وأفرغ المثانة.</li><li>اجلس مستندًا وقدماك على الأرض، واسترح 5 دقائق بصمت.</li>
    <li>الذراع مسنودة بمستوى القلب، والكمّ على الجلد مباشرة.</li><li>خذ قراءتين بينهما دقيقة، صباحًا ومساءً، وسجّل المتوسط.</li></ol>
    <p class="small muted" style="margin:6px 0 0">الهدف لأغلب مرضى السكري أقل من 130/80 حسب ADA. ${ic('alert')} 180/120 أو أعلى مع ألم صدر أو ضيق نفس: اتصل بالإسعاف ${emerg()}.</p></div>`;
}
function checkSheet(k){
  const c=CHECKS.find(x=>x[0]===k);
  modal(`<form id="ckF" novalidate aria-labelledby="ckH"><h3 id="ckH">${c[1]}</h3><p class="small muted">${c[2]}</p>
    <div class="field"><label for="ckD">تاريخ آخر فحص</label><input id="ckD" type="date" max="${today()}" value="${checkLast(k)||today()}"></div>
    <p class="small muted">سنذكّرك عند موعد الفحص التالي.</p><button type="submit" class="btn accent">${ic('check')}حفظ</button></form>`,(m,close)=>{
    m.querySelector('#ckF').addEventListener('submit',e=>{ e.preventDefault(); const v=m.querySelector('#ckD').value; if(v){ S.checks[k]=v; save(); reschedule(); } close(); toast('سُجّل — الموعد التالي '+checkDue(k,c[3]())); render(); }); });
}
function checkNotifs(list,now){
  if(!S.diabetes) return;
  CHECKS.forEach(([k,t,,mf],i)=>{ const due=checkDue(k,mf()); if(!due) return; let at=new Date(due+'T10:30:00'); if(at<=now){ if(dayDiff(due,today())>60) return; at=new Date(now.getFullYear(),now.getMonth(),now.getDate()+1,10,30); }
    if(dayDiff(today(),dstr(at))>60) return;
    list.push({id:9700+i,title:'حان موعد فحص: '+t,body:'احجز موعدك، ثم سجّل تاريخ الفحص في التطبيق.',schedule:{at,allowWhileIdle:true},channelId:'health',smallIcon:'ic_stat_notify',extra:{go:'checks'}}); });
}
