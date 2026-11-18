import re,sys
P='/home/claude/kegel-app/www/index.html'
s=open(P,encoding='utf-8').read()
mod=open('/home/claude/kegel-app/native/mod25.js',encoding='utf-8').read()
def rep(a,b,cnt=1):
    global s
    n=s.count(a)
    if n!=cnt: sys.exit(f'count {n}!={cnt} for: {a[:90]!r}')
    s=s.replace(a,b)

# ---- الحالة
rep("""  progDay:1,dayDoneOn:null,logs:[],ach:{},suggestAdvance:false,warned:false,startDate:null,smartRem:true,water:null,waterLog:{}};""",
"""  progDay:1,dayDoneOn:null,logs:[],ach:{},suggestAdvance:false,warned:false,startDate:null,smartRem:true,water:null,waterLog:{}};
const defBr=()=>({bpm:5.5,ratio:'55',min:10});
const defHc=()=>({on:false,at:0,steps:null,stepsDate:null,week:{},sleep:null,sleepDate:null,hr:null,rhr:null});""")
rep("""if(S.smartRem===undefined) S.smartRem=true; }""",
"""if(S.smartRem===undefined) S.smartRem=true;
  if((S.v||2)<3){ S.v=3; if(S.diabetes===undefined) S.diabetes=true; }
  const dflt={tests:[],test:null,glu:[],a1c:[],meds:[],medLog:{},bl:[],iief:[],mealLog:{},gUnit:'mg',bed:'23:30',wake:'06:00',nightLess:true,knackOn:true,stepGoal:7000,lock:false,lastBackup:null,hseg:null};
  Object.keys(dflt).forEach(k=>{ if(S[k]===undefined) S[k]=Array.isArray(dflt[k])?[]:(dflt[k]&&typeof dflt[k]==='object')?{}:dflt[k]; });
  if(S.diabetes===undefined) S.diabetes=false;
  if(!S.meal) S.meal={on:true,time:'12:30',eve:'21:00'}; if(!S.br) S.br=defBr(); if(!S.hc) S.hc=defHc(); }""")

# ---- البرنامج: الوصفة من الاختبار
rep("""  return {day,phase:ph,reps,sq,rl,n,patterns,light,holdSec};""","""  return prescribe({day,phase:ph,reps,sq,rl,n,patterns,light,holdSec},t);""")
rep("""  else if(kind==='breath'){ pattern='breath'; reps=30; title='تنفّس القلب — 5 دقائق';
    for(let r=1;r<=reps;r++){add('in',4,r);add('out',6,r);} }""",
"""  else if(kind==='breath'){ pattern='breath'; const b=breathPlan(); reps=b.reps; title='تنفّس القلب — '+S.br.min+' دقائق · '+S.br.bpm+' نَفَس/د';
    for(let r=1;r<=reps;r++){add('in',b.ti,r);add('out',b.te,r);} }""")
rep("""  else if(kind==='rapidq'){ pattern='rapid'; reps=30; title='النيران السريعة — 60 ثانية';""",
"""  else if(kind==='rapidq'){ pattern='rapid'; reps=(plan&&plan.flicks)||30; title='النيران السريعة — '+reps+' انقباضة';""")
rep("""    pattern=plan.patterns[idx]||'classic'; title='جلسة '+(idx+1)+' من '+plan.n+' — '+PAT_NAME[pattern];""",
"""    pattern=plan.patterns[idx]||'classic'; var pos=(plan.pos||[])[idx]; title='جلسة '+(idx+1)+' من '+plan.n+' — '+PAT_NAME[pattern]+(pos?' · '+POS[pos][0]:'');""")
rep("""    else if(pattern==='rapid'){ reps=30; for(let r=1;r<=reps;r++){add('sq',1,r);add('rl',1,r);} }""",
"""    else if(pattern==='rapid'){ reps=plan.flicks||30; for(let r=1;r<=reps;r++){add('sq',1,r);add('rl',1,r);} }""")
rep("""  steps.unshift({t:'ready',d:3,rep:0});
  const total=steps.reduce((a,s)=>a+s.d,0);
  return {kind,idx,pattern,reps,title,steps,total};""",
"""  steps.unshift({t:'ready',d:(typeof pos!=='undefined'&&pos)?7:3,rep:0});
  const total=steps.reduce((a,s)=>a+s.d,0);
  return {kind,idx,pattern,reps,title,steps,total,pos:(typeof pos!=='undefined'?pos:null)};""")
rep("""  if(p==='rapid') return '30 انقباضة سريعة: ثانية ضغط وثانية إرخاء';""","""  if(p==='rapid') return (plan.flicks||30)+' انقباضة سريعة: ثانية ضغط وثانية إرخاء';""")
rep("""function curLabel(st){ if(st.t==='sq'&&st.lbl==='hold') return PH.hold; return PH[st.t]; }""",
"""function curLabel(st){ if(st.t==='sq'&&st.lbl==='hold') return PH.hold; if(st.t==='ready'&&R&&R.s.pos) return ['الوضعية: '+POS[R.s.pos][0],POS[R.s.pos][1]]; return PH[st.t]; }""")
rep("""  speak((nm()?'أهلًا '+yaName()+'. ':'')+(kind==='breath'?'نبدأ التنفّس البطيء بعد ثلاث ثوانٍ.':'جهّز نفسك، نبدأ بعد ثلاث ثوانٍ.'));""",
"""  speak((nm()?'أهلًا '+yaName()+'. ':'')+(kind==='breath'?'نبدأ التنفّس البطيء بعد ثلاث ثوانٍ.':s.pos?'الوضعية: '+POS[s.pos][0]+'. '+POS[s.pos][1]:'جهّز نفسك، نبدأ بعد ثلاث ثوانٍ.'));""")
# معدل النبض أثناء التنفّس من الساعة
rep("""  lastDone={log,fresh:checkAch(),first:totalSessions()===1};""",
"""  if(s.kind==='breath' && S.hc.on){ const a=R.startedAt,b=Date.now(); setTimeout(async()=>{ const hr=await hcHrBetween(a,b); if(hr){ log.hr=hr; save(); const el=document.getElementById('dHr'); if(el) el.textContent='متوسط نبضك أثناء الجلسة: '+hr+' نبضة/د'; } },4000); }
  lastDone={log,fresh:checkAch(),first:totalSessions()===1};""")
rep("""  <p class="center muted">${log.kind==='breath'?'تنفّس بطيء · '+Math.max(1,Math.round(log.dur/60))+' دقائق — جيد لضغط الدم والقلب':log.reps+' تكرار · '+Math.max(1,Math.round(log.dur/60))+' دقيقة'}</p>""",
"""  <p class="center muted">${log.kind==='breath'?'تنفّس بطيء · '+Math.max(1,Math.round(log.dur/60))+' دقائق — جيد لضغط الدم والقلب':log.reps+' تكرار · '+Math.max(1,Math.round(log.dur/60))+' دقيقة'}</p>
  ${log.kind==='breath'?`<p class="center small" id="dHr">${S.hc.on?'نقرأ نبضك من الساعة…':''}</p><div class="card small center">هدف الأسبوع: ${Math.min(breathDays(addDays(today(),-6),today()),7)} من 3 أيام بـ5 دقائق أو أكثر</div>`:''}""")

# ---- الإنجازات
rep("""  ['comeback','comeback','عودة بعد انقطاع',()=>!!S.comeback]
];""","""  ['comeback','comeback','عودة بعد انقطاع',()=>!!S.comeback],
  ['test1','target','أول اختبار قوة',()=>!!S.test],
  ['lv3','medal','مستوى «قوي»',()=>!!S.test&&curLevel()>=3],
  ['lv4','trophy','مستوى «خبير»',()=>!!S.test&&curLevel()>=4]
];""")

# ---- الماء: توقف قبل النوم
rep("""function waterSlots(){ const [fh,fm]=S.water.from.split(':').map(Number),[th,tm]=S.water.to.split(':').map(Number), out=[]; for(let m=fh*60+fm;m<=th*60+tm;m+=S.water.every) out.push(m); return out; }""",
"""function waterSlots(){ const [fh,fm]=S.water.from.split(':').map(Number),[th,tm]=S.water.to.split(':').map(Number), out=[]; let end=th*60+tm;
  if(S.nightLess){ let b=toMin(S.bed); if(b<6*60) b+=1440; end=Math.min(end,b-120); }
  for(let m=fh*60+fm;m<=end;m+=S.water.every) out.push(m); return out; }""")
# toMin defined later than waterSlots? ensure available: move definition up
rep("""const WMSG=[""","""const toMin=t=>{ const [h,m]=t.split(':').map(Number); return h*60+m; };
const WMSG=[""")
rep("""const toMin=t=>{ const [h,m]=t.split(':').map(Number); return h*60+m; };
function smokeSlots()""","""function smokeSlots()""")

# ---- الإشعارات
rep("""    try{ await LN.createChannel({id:'water',name:'تذكير شرب الماء',importance:4,vibration:true}); }catch(e){}""",
"""    try{ await LN.createChannel({id:'water',name:'تذكير شرب الماء',importance:4,vibration:true}); }catch(e){}
    try{ await LN.createChannel({id:'meals',name:'البرنامج الغذائي',importance:4,vibration:true}); }catch(e){}
    try{ await LN.createChannel({id:'meds',name:'مواعيد الأدوية',importance:5,vibration:true}); }catch(e){}
    try{ await LN.createChannel({id:'health',name:'السكر والمؤشرات',importance:4,vibration:true}); }catch(e){}""")
rep("""{id:'SMOKE_END',actions:[{id:'ok',title:'أكملتها'},{id:'slip',title:'لم أكملها'}]}]});""",
"""{id:'SMOKE_END',actions:[{id:'ok',title:'أكملتها'},{id:'slip',title:'لم أكملها'}]},{id:'MED',actions:[{id:'take',title:'أخذته'}]},{id:'MEAL',actions:[{id:'ate',title:'تناولتها'}]}]});""")
rep("""      list.push({id:8000+i,title:'وقت الرياضة',body:'40 دقيقة مشي سريع أو جري — 4 مرات أسبوعيًا تحسّن الانتصاب وصحة القلب. سجّلها بعد أن تنتهي.'""",
"""      list.push({id:8000+i,title:'وقت الرياضة',body:(S.diabetes?'قِس السكر أولًا، ثم ':'')+'30–40 دقيقة مشي سريع — 150 دقيقة أسبوعيًا تحسّن الانتصاب والسكر والقلب.'""")
rep("""    if(list.length) await LN.schedule({notifications:list});""","""    try{ moreNotifs(list,now); }catch(e){ console.log('more notif',e); }
    if(list.length) await LN.schedule({notifications:list});""")
rep("""    if(go==='smoke'){ if(screen!=='session'){ screen='tabs'; tab='home'; render(); } return; }""",
"""    if(go==='smoke'){ if(screen!=='session'){ screen='tabs'; tab='home'; render(); } return; }
    if(go==='med'){ const k=a.notification.extra.key; if(a.actionId==='take'&&k){ const [d,id,t]=k.split('|'); medMark(d,id,t,true); toast('سُجّل الدواء'); } if(screen==='tabs'||screen==='done'){ screen='tabs'; tab='men'; S.hseg='dm'; render(); } return; }
    if(go==='meal'){ if(a.actionId==='ate') mealSet('focus',true); if(screen==='tabs'||screen==='done'){ screen='tabs'; tab='men'; S.hseg='food'; render(); } return; }
    if(go==='test'){ if(screen==='tabs'||screen==='done') startTest(); return; }
    if(go==='iief'){ if(screen==='tabs'||screen==='done'){ screen='tabs'; tab='men'; S.hseg='ind'; render(); setTimeout(iiefSheet,300); } return; }
    if(go==='report'){ if(screen==='tabs'||screen==='done'){ screen='tabs'; tab='men'; S.hseg='ind'; render(); setTimeout(()=>reportSheet(7,false),300); } return; }
    if(go==='glu'){ if(screen==='tabs'||screen==='done'){ screen='tabs'; tab='men'; S.hseg='dm'; render(); setTimeout(()=>gluSheet(),300); } return; }""")

# ---- عادات القلب: المقاومة + 150 دقيقة
rep("""const HEART=[['walk','run','رياضة هوائية 40 دقيقة','مشي سريع أو جري — 4 مرات أسبوعيًا تكفي'],""",
"""const HEART=[['walk','run','رياضة هوائية 30–40 دقيقة','مشي سريع أو جري — 150 دقيقة أسبوعيًا على الأقل'],['resist','barbell','تمارين مقاومة 20–30 دقيقة','مرتان إلى 3 أسبوعيًا في أيام غير متتالية'],""")
rep("""['breath','wind','تنفّس بطيء 5 دقائق','6 أنفاس في الدقيقة تهدّئ الضغط']""","""['breath','wind','تنفّس القلب 5 دقائق أو أكثر','5.5 أنفاس في الدقيقة — 3 أيام أسبوعيًا على الأقل']""")
rep("""    <p class="small muted" style="margin:8px 0 0">تمرّنت ${heartWeekWalks()} من 7 أيام هذا الأسبوع — الهدف 4 أيام (160 دقيقة).</p></div>`;""",
"""    <p class="small muted" style="margin:8px 0 0">رياضة هوائية ${heartWeekWalks()} من 7 أيام · مقاومة ${heartWeekRes()} — الهدف 150 دقيقة هوائية ومقاومة مرتين أسبوعيًا.</p>
    ${S.diabetes?`<button class="btn ghost sm" id="hEx" style="margin-top:8px">${ic('shield')}فحص السكر قبل الرياضة</button>`:''}</div>`;""")
rep("""function heartWeekWalks(){""","""function heartWeekRes(){ let n=0; for(let i=0;i<7;i++){ const h=S.heartLog[addDays(today(),-i)]; if(h&&h.resist) n++; } return n; }
function heartWeekWalks(){""")
rep("""      const bg=m.querySelector('#brGo'); if(bg) bg.onclick=()=>{ close(); startSession('breath'); }; };""",
"""      const bg=m.querySelector('#brGo'); if(bg) bg.onclick=()=>{ close(); breathSheet(); };
      const hx=m.querySelector('#hEx'); if(hx) hx.onclick=()=>{ close(); exCheck(); }; };""")
rep("""    draw(); });
}
function smokeSheet(){""","""    draw(); });
}
function smokeSheet(){""")

# ---- الأيقونات: احتياطي HI + أيقونات جديدة
rep("""const ic=(n,c='')=>`<svg class="ic ${c}" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">${IC[n]||''}</svg>`;""",
"""const _sk='fill="none" stroke="currentColor" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"';
Object.assign(IC,{
  share:`<path d="M64 112h128v96H64z" opacity=".2"/><path ${_sk} d="M128 32v120M88 72l40-40 40 40M80 112H64a8 8 0 0 0-8 8v88a8 8 0 0 0 8 8h128a8 8 0 0 0 8-8v-88a8 8 0 0 0-8-8h-16"/>`,
  download:`<path d="M40 152h176v56H40z" opacity=".2"/><path ${_sk} d="M128 40v112M88 112l40 40 40-40M216 152v56a8 8 0 0 1-8 8H48a8 8 0 0 1-8-8v-56"/>`,
  upload:`<path d="M40 152h176v56H40z" opacity=".2"/><path ${_sk} d="M128 152V40M88 80l40-40 40 40M216 152v56a8 8 0 0 1-8 8H48a8 8 0 0 1-8-8v-56"/>`,
  finger:`<path ${_sk} d="M72 200c14-22 22-48 22-76a34 34 0 0 1 68 0c0 34-6 66-18 94M128 124c0 40-10 78-30 108M48 168c4-14 6-28 6-44a74 74 0 0 1 132-46M202 124c0 22-2 44-6 64"/>`,
  doc:`<path d="M152 32v56h56z" opacity=".2"/><path ${_sk} d="M200 224H56a8 8 0 0 1-8-8V40a8 8 0 0 1 8-8h96l56 56v128a8 8 0 0 1-8 8ZM152 32v56h56M96 136h64M96 168h64"/>`
});
const ic=(n,c='')=>IC[n]?`<svg class="ic ${c}" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">${IC[n]}</svg>`:(typeof HI!=='undefined'&&HI[n])?hi(n,'ic '+c):`<svg class="ic ${c}" viewBox="0 0 256 256" aria-hidden="true"></svg>`;""")

# ---- النوافذ: dialog أصلي (تركيز، رجوع، إغلاق باللمس خارجها)
rep("""function toast(t){ const d=document.createElement('div'); d.className='toast'; d.textContent=t; document.body.appendChild(d); setTimeout(()=>d.remove(),2600); }
function modal(html,bind){
  const m=document.createElement('div'); m.className='modal'; m.innerHTML='<div class="sheet"><div class="grab"></div>'+html+'</div>';
  document.body.appendChild(m); m.addEventListener('click',e=>{ if(e.target===m) m.remove(); });
  bind && bind(m, ()=>m.remove()); return m;
}""",
"""function toast(t){ const d=document.createElement('div'); d.className='toast'; d.setAttribute('role','status'); d.textContent=t; d.popover='manual'; document.body.appendChild(d); try{ d.showPopover(); }catch(e){} setTimeout(()=>d.remove(),2600); }
function modal(html,bind){
  const m=document.createElement('dialog'); m.className='modal'; m.setAttribute('closedby','any');
  m.innerHTML='<div class="sheet"><div class="grab" aria-hidden="true"></div>'+html+'</div>';
  document.body.appendChild(m);
  const close=()=>{ if(m.open) m.close(); else m.remove(); };
  m.addEventListener('close',()=>m.remove());
  m.addEventListener('click',e=>{ if(e.target===m) close(); });
  try{ m.showModal(); }catch(e){ m.setAttribute('open',''); }
  bind && bind(m, close); return m;
}""")
rep("""    const m=document.querySelector('.modal'); if(m){ m.remove(); return; }""","""    if(document.getElementById('lockv')) return;
    const m=[...document.querySelectorAll('dialog.modal')].pop(); if(m){ if(m.open) m.close(); else m.remove(); return; }""")
rep("""    if(screen==='session'){ askExit(); return; }""","""    if(screen==='session'){ askExit(); return; }
    if(screen==='test'){ endTest(); return; }""")
rep("""  APP.addListener('resume',()=>{ rollover(); if(screen!=='session') render(); scheduleReminders(); });""",
"""  APP.addListener('pause',()=>{ _bgAt=Date.now(); });
  APP.addListener('resume',()=>{ if(S.lock && _bgAt && Date.now()-_bgAt>60000) showLock(); rollover(); if(screen!=='session'&&screen!=='test') render(); scheduleReminders(); hcSync().then(ch=>{ if(ch&&screen==='tabs') render(); }); });""")

# ---- التبويبات والعرض
rep("""const ICONS={home:'home',men:'male',prog:'prog',learn:'learn',set:'set'};""","""const ICONS={home:'home',men:'pulse',prog:'prog',learn:'learn',set:'set'};""")
rep("""[['home','الرئيسية'],['men','صحة الرجل'],['prog','التقدم'],['learn','تعلّم'],['set','الإعدادات']]""","""[['home','الرئيسية'],['men','صحتي'],['prog','التقدم'],['learn','تعلّم'],['set','الإعدادات']]""")
rep("""  if(screen==='session') return;
  if(screen==='done'){""","""  if(screen==='session') return;
  if(screen==='test') return renderTest();
  if(screen==='done'){""")
rep("""({home:renderHome,men:renderMen,prog:renderProg,learn:renderLearn,set:renderSettings})[tab]();""","""({home:renderHome,men:renderHealth,prog:renderProg,learn:renderLearn,set:renderSettings})[tab]();""")
rep("""function renderMen(){
  const LV={a:['أدلة قوية','a'],b:['أدلة متوسطة','b'],c:['أدلة أولية','c']};
  app.innerHTML=`<div class="mhero"><h1>صحة الرجل</h1><p>ما الذي يحسّن الانتصاب والتحكم فعلًا؟ كل نقطة هنا من دراسة منشورة، مع درجة قوة الدليل.</p></div>""",
"""function renderMen(head){
  const LV={a:['أدلة قوية','a'],b:['أدلة متوسطة','b'],c:['أدلة أولية','c']};
  app.innerHTML=`${head}""")
rep("""  $('#mC').onclick=()=>startSession('control');
  $('#mD').onclick=()=>startNext();""","""  $('#mC').onclick=()=>startSession('control');
  $('#mD').onclick=()=>startNext();
  app.querySelectorAll('[data-seg]').forEach(b=>b.onclick=()=>{ S.hseg=b.dataset.seg; save(); render(); });""")
# دليل مرضى السكري ضمن صحة الرجل
rep(""" ['flame','تمارين قاع الحوض وسرعة القذف',""",""" ['target','تمارين قاع الحوض لدى مرضى السكري','تجربة عشوائية على 90 رجلًا بسكري نوع 2 وضعف انتصاب وعائي: 6 أسابيع من تمارين قاع الحوض المنزلية مع العلاج الدوائي حسّنت مؤشر الانتصاب وتدفّق الدم في الشرايين مقارنة بالدواء وحده.','b','تجربة عشوائية — Ahmad 2026، J Physiother'],
 ['flame','تمارين قاع الحوض وسرعة القذف',""")
rep(""" ['Pastore AL, et al. Pelvic floor muscle rehabilitation for lifelong premature ejaculation. Ther Adv Urol 2014',""",
""" ['Ahmad AM, et al. Li-ESWT and PFMT each mitigate ED in men with diabetes: RCT. J Physiother 2026','https://doi.org/10.1016/j.jphys.2026.03.009'],
 ['Pastore AL, et al. Pelvic floor muscle rehabilitation for lifelong premature ejaculation. Ther Adv Urol 2014',""")

# ---- الرئيسية: اختبار القوة + الخطوات + التنفس
rep("""  const tiles=[];""","""  const tiles=[], sNow=stepsNow(), sg=S.stepGoal;
  tiles.push(S.hc.on?`<button class="tile steps" id="tSt"><div class="hd"><span class="badge">${hi('walking')}</span><span class="sub">${S.hc.sleepDate===today()&&S.hc.sleep?'نوم '+fmtH(S.hc.sleep):''}</span></div><h3>المشي اليوم</h3><div class="big">${(sNow||0).toLocaleString('ar')}</div><div class="sub">${(sNow||0)>=sg?'وصلت لهدفك':'متبقٍ '+Math.max(0,sg-(sNow||0)).toLocaleString('ar')+' خطوة'}</div><div class="mini"><i style="width:${Math.min(100,(sNow||0)/sg*100)}%"></i></div></button>`
    :`<button class="tile steps" id="tSt"><div class="hd"><span class="badge">${hi('walking')}</span><span class="sub">الساعة</span></div><h3>المشي والنوم</h3><div class="sub">اربط ساعتك لتعرف كم مشيت وكم بقي، ومدة نومك</div></button>`);""")
rep("""  tiles.push(`<button class="tile quick" id="qB"><div class="hd"><span class="badge">${hi('lungs')}</span><span class="sub">5 د</span></div><h3>تنفّس القلب</h3><div class="sub">6 أنفاس في الدقيقة</div></button>`);""",
"""  tiles.push(`<button class="tile quick" id="qB"><div class="hd"><span class="badge">${hi('lungs')}</span><span class="sub">${S.br.min} د</span></div><h3>تنفّس القلب</h3><div class="sub">${S.br.bpm} أنفاس/د · هذا الأسبوع ${Math.min(breathDays(addDays(today(),-6),today()),7)} من 3 أيام</div></button>`);
  if(S.diabetes){ const lg=gLast(); tiles.push(`<button class="tile glu" id="tG"><div class="hd"><span class="badge">${ic('drop')}</span><span class="sub">${lg?GCTXN[lg.ctx]||'':''}</span></div><h3>السكر</h3><div class="big ${lg?gClass(lg.v):''}">${lg?gfmt(lg.v):'—'}<small style="font-size:12px;font-weight:500" class="muted"> ${GU()}</small></div><div class="sub">${lg?'منذ '+ago(lg.ts):'سجّل أول قراءة'}</div></button>`); }""")
rep("""  ${recover}${adv}""","""  ${recover}${adv}${testCard()}""")
rep("""  $('#q1').onclick=()=>startSession('quick'); $('#q2').onclick=()=>startSession('rapidq'); $('#qB').onclick=()=>startSession('breath'); $('#qC').onclick=()=>startSession('control');""",
"""  $('#q1').onclick=()=>startSession('quick'); $('#q2').onclick=()=>startSession('rapidq',plan); $('#qB').onclick=()=>breathSheet(); $('#qC').onclick=()=>startSession('control');
  const tSt=$('#tSt'); if(tSt) tSt.onclick=()=>stepsSheet(); const tG=$('#tG'); if(tG) tG.onclick=()=>gluSheet();
  const tc=$('#tcGo'); if(tc) tc.onclick=()=>startTest();
  if(S.hc.on) hcSync().then(ch=>{ if(ch&&screen==='tabs'&&tab==='home') renderHome(); });""")
rep("""  const planRows = slots.map((sl,i)=>{ const st2 = i<done?'done':(i===done&&!dayDone?'next':''); const pt=plan.patterns[i];""",
"""  const planRows = slots.map((sl,i)=>{ const st2 = i<done?'done':(i===done&&!dayDone?'next':''); const pt=plan.patterns[i], ps=(plan.pos||[])[i];""")
rep("""<span class="tx"><b>جلسة ${i+1} · ${PAT_NAME[pt]}</b>""","""<span class="tx"><b>جلسة ${i+1} · ${PAT_NAME[pt]}${ps?' · '+POS[ps][0]:''}</b>""")
rep("""      <div class="dring">""","""      <div class="dring" title="المستوى ${LV_NAME[curLevel()]}">""")
rep("""<div class="ph">${plan.light?'أسبوع خفيف · ':''}مرحلة ${plan.phase.name} — ${plan.phase.goal}</div>""",
"""<div class="ph">${plan.light?'أسبوع خفيف · ':''}المستوى: ${LV_NAME[curLevel()]} · مرحلة ${plan.phase.name}</div>""")

# ---- التقدم: بطاقة المستوى
rep("""  <div class="card"><h3>المرحلة الحالية: ${plan.phase.name}</h3>""","""  <div class="card"><div class="row" style="justify-content:space-between"><h3 style="margin:0">مستواك: ${LV_NAME[curLevel()]}</h3><span class="tagx">${curLevel()}/4</span></div>
  <div class="lvls">${[1,2,3,4].map(n=>`<i class="${n<=curLevel()?'on':''}"><b>${LV_NAME[n]}</b></i>`).join('')}</div>
  <p class="small muted" style="margin:8px 0 0">${S.test?`آخر اختبار ${S.test.date}: ثبات ${S.test.hold} ث، ${S.test.flicks} انقباضة سريعة. الوصفة الحالية: ${plan.sq} ث × ${plan.reps} تكرار، 3 مرات يوميًا.`:'أجرِ اختبار القوة لتُبنى خطتك على قوتك الفعلية.'}</p>
  <button class="btn ${testDue()?'accent':'ghost'}" id="pT" style="margin-top:10px">${testDue()?ic('play')+'ابدأ اختبار القوة':'أعد الاختبار الآن'}</button></div>
  <div class="card"><h3>المرحلة الحالية: ${plan.phase.name}</h3>""")
rep("""<p class="small muted" style="margin:0">${p.goal}</p></div>`).join('')}`;
}""","""<p class="small muted" style="margin:0">${p.goal}</p></div>`).join('')}`;
  const pT=$('#pT'); if(pT) pT.onclick=()=>startTest();
}""")

# ---- التعلم
rep("""  ['متى أرى النتائج؟','<p>يلاحظ أغلب الناس تحسنًا خلال <b>4 إلى 8 أسابيع</b> من التمرين المنتظم، وتتحسن النتائج أكثر حتى 3 أشهر. الانتظام أهم من الشدة: جلسة قصيرة كل يوم أفضل من جلسة طويلة متقطعة.</p>'],""",
"""  ['متى أرى النتائج؟','<p>تحسّن الإحساس بالعضلة والتحكم بالمثانة يبدأ خلال <b>2–4 أسابيع</b>. أما الانتصاب فتحسّن في التجارب بعد <b>6 أسابيع إلى 3 أشهر</b>، وتكتمل نتيجة تدريب القوة خلال <b>3–6 أشهر</b>. لذلك نقيس مؤشر الانتصاب شهريًا، واختبار القوة كل أسبوعين.</p><p class="small muted">Dorey 2005، BJU Int · Ahmad 2026، J Physiother</p>'],
  ['كيف تتدرّج خطتك؟',()=>`<p>العضلة تقوى بمبادئ تدريب القوة نفسها: <b>انقباضات قريبة من أقصى جهدك</b>، 8–12 مرة، <b>3 مرات يوميًا</b>، لمدة 8 أسابيع على الأقل. تبدأ مدة الانقباض بما تستطيعه وترتفع تدريجيًا حتى 10 ثوانٍ.</p>
   <p><b>اختبار كل أسبوعين:</b> نقيس أطول ثبات وعدد الانقباضات السريعة قبل التعب، فتُضبط خطتك تلقائيًا.</p>
   <p><b>الوضعيات:</b> البداية مستلقيًا لأن العضلة تعمل دون مقاومة الجاذبية، ثم جالسًا، ثم واقفًا، ثم أثناء المشي — كما في بروتوكول Dorey الذي حسّن الانتصاب.</p>
   <p><b>المستويات:</b> ${LV_NAME.slice(1).join(' ← ')}. مستواك الآن: <b>${LV_NAME[curLevel()]}</b>.</p><p class="small muted">Dorey 2004، Br J Gen Pract · مبادئ تدريب قاع الحوض — Bø، Br J Sports Med</p>`],
  ['«الحيلة»: شدّ قبل الضغط','<p>اشدد قاع الحوض <b>قبل</b> أي ارتفاع مفاجئ في ضغط البطن: السعال، العطاس، رفع شيء ثقيل، أو الوقوف من الجلوس. هذه الحركة تُسمّى «The Knack» وتمنع تسرّب البول، وتحوّل التمرين إلى عادة تلقائية في يومك.</p><p>سنذكّرك بها مرة يوميًا. يمكنك إيقاف التذكير من الإعدادات.</p><p class="small muted"><span class="lvl b">أدلة متوسطة</span> Miller 1998، J Am Geriatr Soc — دُرست أكثر على النساء، وتُستخدم في تأهيل الرجال بعد جراحة البروستاتا.</p>'],
  ['تنفّس القلب: ما الذي تقوله الدراسات؟','<p>للقلب والتنفّس إيقاع مشترك يبلغ ذروته عند نحو <b>5.5–6 أنفاس في الدقيقة</b> («تردد الرنين»). عنده يرتفع تقلّب نبض القلب ويتحسّن منعكس الضغط الذي ينظّم الضغط.</p><p><b>الجرعة:</b> 5 دقائق على الأقل، 3 أيام أسبوعيًا أو أكثر، لمدة 4 أسابيع — والأفضل 10–15 دقيقة يوميًا. الأثر يتراكم مع الممارسة.</p><p><b>مع السكري:</b> التنفّس البطيء حسّن منعكس الضغط لدى مرضى السكري من النوع الثاني، وهم أكثر عرضة لاضطرابه.</p><p class="small muted">Lin 2014 · Chaddha 2019 · Shao 2024 · Brook 2013 (AHA) · Lehrer 2014</p>'],""")

# ---- التهيئة: سؤال السكري
rep("""             ['هل لديك ألم حوض مزمن أو أعراض بولية مزمنة أو جراحة حديثة؟',['لا','نعم']]];
    h=`<h1>مستوى البداية</h1><p class="muted">ثلاثة أسئلة لنحدد من أين تبدأ.</p>`+""",
"""             ['هل لديك ألم حوض مزمن أو أعراض بولية مزمنة أو جراحة حديثة؟',['لا','نعم']],
             ['هل لديك سكري؟',['لا','نعم']]];
    h=`<h1>مستوى البداية</h1><p class="muted">أربعة أسئلة لنحدد من أين تبدأ ونخصّص متابعتك.</p>`+""")
rep("""let ob={step:0,goals:new Set(S.goals),q:[null,null,null],flip:{}};""","""let ob={step:0,goals:new Set(S.goals),q:[null,null,null,null],flip:{}};""")
rep("""  S.goals=[...ob.goals]; S.level=calcLevel(); S.progDay=[1,15,43][S.level-1]; S.warned=ob.q[2]===1;""",
"""  S.goals=[...ob.goals]; S.level=calcLevel(); S.progDay=[1,15,43][S.level-1]; S.warned=ob.q[2]===1; S.diabetes=ob.q[3]===1;""")

# ---- الإعدادات
rep("""  <h2>ويدجت الشاشة الرئيسية</h2>""","""  <h2>السكري والنوم</h2><div class="card">
   <div class="set"><span>متابعة السكري<br><span class="small muted">قسم السكري وفحص ما قبل الرياضة</span></span><button class="sw ${S.diabetes?'on':''}" id="dmOn" aria-pressed="${!!S.diabetes}" aria-label="متابعة السكري"></button></div>
   <div class="set"><label for="gU">وحدة السكر</label><select id="gU"><option value="mg" ${mgU()?'selected':''}>ملغ/دل</option><option value="mmol" ${mgU()?'':'selected'}>ملمول/ل</option></select></div>
   <div class="set"><label for="bedT">وقت النوم</label><input type="time" id="bedT" value="${S.bed}"></div>
   <div class="set"><label for="wakeT">وقت الاستيقاظ</label><input type="time" id="wakeT" value="${S.wake}"></div>
   <div class="set"><span>إيقاف تذكير الماء قبل النوم بساعتين<br><span class="small muted">يقلل الاستيقاظ للتبول ليلًا</span></span><button class="sw ${S.nightLess?'on':''}" id="nlOn" aria-pressed="${!!S.nightLess}" aria-label="إيقاف الماء قبل النوم"></button></div>
  </div>
  <h2>البرنامج الغذائي</h2><div class="card">
   <div class="set"><span>تذكير وجبة اليوم</span><button class="sw ${S.meal.on?'on':''}" id="mlOn" aria-pressed="${S.meal.on}" aria-label="تذكير الوجبات"></button></div>
   <div class="set"><label for="mlT">تذكير الغداء</label><input type="time" id="mlT" value="${S.meal.time}"></div>
   <div class="set"><label for="mlE">تذكير التحضير لغدٍ</label><input type="time" id="mlE" value="${S.meal.eve}"></div>
  </div>
  <h2>التمرين الذكي</h2><div class="card">
   <div class="set"><span>تذكير «الحيلة» اليومي<br><span class="small muted">شدّ قاع الحوض قبل السعال والرفع</span></span><button class="sw ${S.knackOn?'on':''}" id="knOn" aria-pressed="${!!S.knackOn}" aria-label="تذكير الحيلة"></button></div>
   <div class="set"><span>مستواك: ${LV_NAME[curLevel()]}</span><button class="btn ghost sm" id="stT">اختبار القوة</button></div>
  </div>
  <h2>الساعة الذكية</h2><div class="card">
   <div class="set"><span>${S.hc.on?'مرتبطة عبر Health Connect':'غير مرتبطة'}<br><span class="small muted">الخطوات، النوم، النبض، وقراءات السكر — قراءة فقط</span></span><button class="btn ${S.hc.on?'ghost':'accent'} sm" id="hcS">${S.hc.on?'تحديث':'ربط'}</button></div>
   ${S.hc.on&&HCP?'<div class="set"><span class="small muted">إدارة الصلاحيات</span><button class="btn ghost sm" id="hcSet">فتح Health Connect</button></div>':''}
  </div>
  <h2>الأمان والنسخ الاحتياطي</h2><div class="card">
   <div class="set"><span>قفل بالبصمة<br><span class="small muted">يُطلب عند فتح التطبيق وبعد دقيقة في الخلفية</span></span><button class="sw ${S.lock?'on':''}" id="lkOn" aria-pressed="${!!S.lock}" aria-label="قفل بالبصمة"></button></div>
   <div class="set"><span>نسخة احتياطية<br><span class="small muted">${S.lastBackup?'آخر نسخة: '+S.lastBackup:'لم تُحفظ نسخة بعد'} — احفظها في Google Drive</span></span><button class="btn ghost sm" id="bkE">${ic('download')}حفظ</button></div>
   <div class="set"><label for="bkF">استعادة من ملف</label><span><input type="file" id="bkF" accept="application/json,.json" class="visually-hidden"><label for="bkF" class="btn ghost sm" role="button" tabindex="0">${ic('upload')}اختيار ملف</label></span></div>
  </div>
  <h2>ويدجت الشاشة الرئيسية</h2>""")
rep("""   <p class="small muted">كل بياناتك محفوظة على هذا الجهاز فقط. لا حسابات، لا إعلانات، ولا يُرسل أي شيء لأي خادم.</p>""",
"""   <p class="small muted">كل بياناتك محفوظة على هذا الجهاز فقط. لا حسابات، لا إعلانات، ولا يُرسل أي شيء لأي خادم.</p>
   <button class="btn ghost" id="ppol" style="margin-bottom:8px">${ic('shield')}سياسة الخصوصية</button>""")
rep("""<p class="center small muted" style="margin-bottom:0">عافيتي · الإصدار 2.0</p>""","""<p class="center small muted" style="margin-bottom:0">عافيتي · الإصدار 2.5</p>""")
rep("""  $('#back1').onclick=()=>{""","""  const on=(id,f)=>{ const e=$(id); if(e) e.onclick=f; };
  on('#dmOn',()=>{ S.diabetes=!S.diabetes; if(!S.diabetes&&S.hseg==='dm') S.hseg=null; save(); render(); });
  $('#gU').onchange=e=>{ S.gUnit=e.target.value; save(); toast('الوحدة: '+GU()); };
  [['bedT','bed'],['wakeT','wake']].forEach(([id,k])=>$('#'+id).onchange=e=>{ if(e.target.value){ S[k]=e.target.value; save(); reschedule(); } });
  on('#nlOn',()=>{ S.nightLess=!S.nightLess; save(); reschedule(); render(); });
  on('#mlOn',async()=>{ S.meal.on=!S.meal.on; save(); if(S.meal.on) await notifPermission(); reschedule(); render(); });
  [['mlT','time'],['mlE','eve']].forEach(([id,k])=>$('#'+id).onchange=e=>{ if(e.target.value){ S.meal[k]=e.target.value; save(); reschedule(); } });
  on('#knOn',()=>{ S.knackOn=!S.knackOn; save(); reschedule(); render(); });
  on('#stT',()=>startTest());
  on('#hcS',async()=>{ if(S.hc.on){ await hcSync(true); toast('تم التحديث'); render(); } else hcConnect(); });
  on('#hcSet',()=>{ HCP.openHealthConnectSettings().catch(()=>{}); });
  on('#lkOn',toggleLock); on('#bkE',exportBackup); on('#ppol',privacySheet);
  $('#bkF').onchange=e=>{ importBackup(e.target.files[0]); e.target.value=''; };
  $('#back1').onclick=()=>{""")
rep("""  $('#wipe').onclick=()=>modal(""","""  $('#wipe').onclick=()=>modal(""")

# ---- إدراج الوحدة الجديدة قبل زر الرجوع
rep("""/* ============ زر الرجوع في أندرويد ============ */""",mod+"""
function testCard(){
  if(!S.onboarded) return '';
  if(!S.test) return `<div class="card tcard"><span class="ic-badge" style="margin:0">${ic('target')}</span><div style="flex:1"><b>ابنِ خطتك على قوتك الفعلية</b><p class="small muted" style="margin:2px 0 8px">اختبار دقيقتين يحدد مدة الانقباض وعدد التكرارات المناسبة لك.</p><button class="btn accent sm" id="tcGo">${ic('play')}ابدأ الاختبار</button></div></div>`;
  if(testDue()) return `<div class="card tcard"><span class="ic-badge" style="margin:0">${ic('arrowUp')}</span><div style="flex:1"><b>حان اختبار الأسبوعين</b><p class="small muted" style="margin:2px 0 8px">قِس تقدّمك — إن تحسّنت نرفع مستوى خطتك. مستواك الآن: ${LV_NAME[curLevel()]}.</p><button class="btn accent sm" id="tcGo">${ic('play')}ابدأ الاختبار</button></div></div>`;
  return '';
}
function ago(ts){ const m=Math.round((Date.now()-ts)/6e4); return m<60?m+' د':m<1440?Math.round(m/60)+' س':Math.round(m/1440)+' يوم'; }
/* ============ زر الرجوع في أندرويد ============ */""")

# ---- التشغيل: القفل والمزامنة
rep("""rollover(); render();
if(S.onboarded) scheduleReminders();""","""rollover(); render();
if(S.onboarded) scheduleReminders();
if(S.lock) showLock();
if(S.hc.on) hcSync(true).then(ch=>{ if(ch&&screen==='tabs') render(); });""")

# ---- CSS
rep("""</style>
</head>""","""/* 2.5 */
dialog.modal{position:fixed;inset:0;width:100%;height:100%;max-width:none;max-height:none;margin:0;border:0;padding:16px;background:transparent;align-items:flex-end;justify-content:center;color:var(--ink)}
dialog.modal[open]{display:flex}
dialog.modal::backdrop{background:rgba(4,12,24,.55)}
body:has(dialog.modal[open]){overflow:hidden}
.modal .sheet{overscroll-behavior:contain}
.toast[popover]{inset:auto;left:50%;bottom:calc(96px + var(--safeB));margin:0;border:0;transform:translateX(-50%)}
.visually-hidden{position:absolute;clip-path:inset(50%);overflow:hidden;width:1px;height:1px;margin:-1px;padding:0;border:0;white-space:nowrap}
.field{display:flex;flex-direction:column;gap:4px;margin:12px 0 16px}
.field label{font-weight:600;font-size:14px}
.field input,.set select,.field select{font:inherit;font-size:max(1rem,1em);padding:12px;min-height:48px;border-radius:12px;border:1.5px solid #8A97A6;background:var(--bg);color:var(--ink);box-sizing:border-box;width:100%}
.set select{width:auto;min-height:40px;padding:6px 10px}
.field input:focus-visible,.radios input:focus-visible,.btn:focus-visible,.sw:focus-visible,.tabs button:focus-visible{outline:3px solid var(--accent2);outline-offset:2px}
.field input[aria-invalid=true]{border-color:var(--danger)}
.err{color:var(--danger);min-height:1em}
input,select{accent-color:var(--accent)}
.radios{border:0;margin:6px 0 14px;padding:0;min-inline-size:0}
.radios legend{font-weight:700;font-size:14px;margin-bottom:6px;padding:0}
.radios label{display:flex;align-items:center;gap:10px;padding:10px 12px;border:1.5px solid var(--line);border-radius:12px;margin:6px 0;min-height:44px;cursor:pointer}
.radios label:has(input:checked){border-color:var(--accent);background:var(--accentSoft)}
.radios input{width:20px;height:20px;margin:0}
.radios.seg2,.radios.seg3{display:grid;gap:6px}.radios.seg2{grid-template-columns:1fr 1fr}.radios.seg3{grid-template-columns:1fr 1fr 1fr}
.radios.seg2 legend,.radios.seg3 legend{grid-column:1/-1}.radios.seg2 label,.radios.seg3 label{margin:0;font-size:13.5px}
.radios.q label{font-size:14px}
.chk{display:flex;gap:10px;align-items:flex-start;margin:12px 0;font-size:14px}.chk input{width:20px;height:20px;margin-top:2px}
.segc{display:flex;gap:6px;margin:14px 0 4px;overflow-x:auto;scrollbar-width:none;padding:2px}
.segc button{flex:1 0 auto;padding:10px 14px;border-radius:14px;background:var(--card);box-shadow:var(--sh);font-weight:600;font-size:14px;color:var(--muted);min-height:44px}
.segc button.on{background:var(--deep);color:#fff}
body.dark .segc button.on{background:var(--accent)}
.gchart{width:100%;height:auto;display:block;direction:ltr}
.gchart .band{fill:var(--accentSoft)}.gchart .gl{stroke:var(--accent);stroke-width:1;stroke-dasharray:3 4;opacity:.5}
.gchart .gt{font:500 10px "Plex",system-ui;fill:var(--muted)}.gchart .gt.b{font-weight:700;fill:var(--ink);font-size:11px}
.gchart .gline{fill:none;stroke:var(--accent);stroke-width:2;opacity:.55;stroke-linejoin:round}
.gchart .gp{stroke:var(--card);stroke-width:1.5}.gp.ok{fill:var(--accent)}.gp.hi{fill:#D97706}.gp.vhi{fill:#B45309}.gp.lo{fill:var(--danger)}
.stat b.lo{color:var(--danger)}.stat b.hi,.stat b.vhi,.big.hi,.big.vhi{color:#B45309}.big.lo{color:var(--danger)}
.tile.steps .badge{background:var(--accentSoft);color:var(--accent)}.tile.steps .mini i{background:var(--accent)}
.tile.glu .badge{background:#FDECEC;color:#C0392B}body.dark .tile.glu .badge{background:#3A1717}
.btn.bl{flex:1;flex-direction:column;gap:2px;padding:10px 4px;font-size:13px;position:relative;min-height:64px}
.btn.bl .cnt{position:absolute;top:6px;inset-inline-end:8px;font-size:11px;background:var(--accentSoft);color:var(--accent);border-radius:999px;padding:0 6px}
.tcard{display:flex;gap:12px;align-items:flex-start;border:1.5px solid var(--accent)!important}
.fcard{background:linear-gradient(160deg,var(--accentSoft),var(--card))}
.fcard .lbl{margin:0 0 8px;font-size:12px;color:var(--accent);font-weight:700}
.tl{position:relative;padding-inline-start:18px}.tl::before{content:"";position:absolute;inset-inline-start:5px;top:6px;bottom:6px;width:2px;background:var(--line)}
.tl div{position:relative;margin:10px 0}.tl div::before{content:"";position:absolute;inset-inline-start:-18px;top:6px;width:12px;height:12px;border-radius:50%;background:var(--accent);box-shadow:0 0 0 3px var(--card)}
.tl b{display:block;font-size:14px}.tl span{font-size:13px;color:var(--muted)}
.lvls{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:10px}
.lvls i{font-style:normal;text-align:center;padding:8px 2px;border-radius:12px;background:var(--bg);color:var(--muted);font-size:12px}
.lvls i.on{background:var(--deep);color:#fff}
.tapper{display:grid;place-items:center;width:220px;height:220px;margin:18px auto;border-radius:50%;background:radial-gradient(circle at 50% 40%,var(--accent2),var(--accent));color:#fff;box-shadow:0 18px 50px -18px rgba(34,211,238,.7);touch-action:manipulation}
.tapper b{font-size:64px;line-height:1}.tapper span{font-size:14px;opacity:.9;margin-top:-30px}
.tapper.pop{animation:pop .18s ease-out}@keyframes pop{50%{transform:scale(.94)}}
.big-btn{min-height:64px;font-size:18px}
.rep{white-space:pre-wrap;font:13px/1.7 "Plex",system-ui;background:var(--bg);border-radius:14px;padding:12px;max-height:46vh;overflow:auto;direction:rtl;user-select:text}
.lockv{position:fixed;inset:0;z-index:100;display:grid;place-items:center;background:radial-gradient(120% 80% at 50% 0%,#12355B,#0B2545 60%);color:#fff;text-align:center;padding:24px}
.lockv .ic.lg{width:56px;height:56px;color:#67E8F9}.lockv h2{color:#fff;margin:12px 0 6px}.lockv p{opacity:.85;margin:0 0 20px}
.policy h1{font-size:20px}.policy h2{font-size:16px;margin:14px 0 4px}.policy p,.policy li{font-size:14px}
@media (prefers-reduced-motion:reduce){.tapper.pop{animation:none}}
</style>
</head>""")

open(P,'w',encoding='utf-8').write(s)
print('ok',len(s))
