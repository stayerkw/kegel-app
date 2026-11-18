# المرحلة الأولى من خطة Vigoris — إصلاح الأساس (يُطبق مرة واحدة على www/index.html)
p='www/index.html'; s=open(p,encoding='utf-8').read()
def rep(a,b,n=1):
    global s
    assert s.count(a)==n,(a[:90],s.count(a)); s=s.replace(a,b)

# ---------- 12.1 الحالة الافتراضية والترحيل ----------
rep("const DEF={v:3,onboarded:false,","const SCHEMA=3; // رقم بنية الحالة الحالية\nconst DEF={v:SCHEMA,diabetes:false,onboarded:false,")
rep("try{ S=Object.assign({},DEF,JSON.parse(localStorage.getItem(KEY)||'{}')); }catch(e){ S=Object.assign({},DEF); }",
"""// تثبيت جديد = لا حالة محفوظة: يبدأ من DEF بالإصدار الحالي ولا يمر بأي ترحيل.
// ترقية = حالة محفوظة: إن خلت من رقم الإصدار فهي من أقدم إصدار (1) فتمر بكل الترحيلات بالترتيب.
const _RAW=(()=>{ try{ return localStorage.getItem(KEY); }catch(e){ return null; } })();
try{ const st=_RAW?JSON.parse(_RAW):null; S=Object.assign({},DEF,st||{}); if(st&&st.v===undefined) S.v=1; }catch(e){ S=Object.assign({},DEF); }""")
# ترحيل 2→3: كان السكري مفعّلًا ضمنيًا لمن أكمل التهيئة في الإصدارات الأولى (التطبيق كان لمريض السكري). لا يُطبّق إلا على مستخدم قديم أكمل التهيئة.
rep("  if((S.v||2)<3){ S.v=3; if(S.diabetes===undefined) S.diabetes=true; }",
    "  if((S.v||2)<3){ S.v=3; if(S.onboarded&&S.diabetes===undefined) S.diabetes=true; }")

# ---------- 12.2 الإشعارات لمرة واحدة ----------
rep("    const keep=new Set([7999,9970,9971]), drop=pend.notifications.filter(n=>!keep.has(n.id));",
    "    const drop=pend.notifications.filter(n=>!ONESHOT_IDS.has(n.id));")
rep("async function scheduleReminders(){",
"""// إشعارات لمرة واحدة تُنشأ لحظيًا (نهاية فترة بلا تدخين، إعادة قياس السكر) — لا تلغيها إعادة جدولة التذكيرات الدورية
const ONESHOT_IDS=new Set([7999,9970,9971]);
async function scheduleReminders(){""")

# ---------- 12.4 حدود معرفة الإرسال ----------
rep("<p class=\"small muted\">نسجّل الإرسال فقط بعد تأكيدك، ليكون موعد التذكير التالي صحيحًا.</p>",
    "<p class=\"small muted\">لا يستطيع التطبيق معرفة إن أرسل تطبيق البريد الرسالة فعلًا، لذلك نسجّل الإرسال فقط بعد تأكيدك ليكون موعد التذكير التالي صحيحًا.</p>")

# ---------- 12.5 النسخ الاحتياطي ----------
rep("let data=JSON.stringify({app:'afiyati',v:3,at:new Date().toISOString(),state:S});",
    "let data=JSON.stringify({app:'afiyati',schema:BK_SCHEMA,v:S.v,at:new Date().toISOString(),state:S});")
rep("function validState(st){",
"""const BK_SCHEMA=1; // رقم بنية ملف النسخة الاحتياطية (النسخ الأقدم بلا رقم تُعامل كبنية 0)
function validState(st){""")
rep("  for(const k of ['glu','a1c']) if(st[k]&&!st[k].every(x=>x&&typeof x.v==='number'&&isFinite(x.v))) return false;",
"""  const num=(x,a,b)=>typeof x==='number'&&isFinite(x)&&x>=a&&x<=b;
  if(st.glu&&!st.glu.every(x=>x&&num(x.v,10,1500))) return false;
  if(st.a1c&&!st.a1c.every(x=>x&&num(x.v,2,25)&&D.test(x.date))) return false;
  if(st.progDay!==undefined&&!num(st.progDay,1,180)) return false;
  if(st.level!==undefined&&!num(st.level,1,4)) return false;
  if(st.waterLog&&!Object.entries(st.waterLog).every(([d,v])=>D.test(d)&&num(v,0,100))) return false;
  if(st.v!==undefined&&!num(st.v,1,SCHEMA)) return false;""")
rep("    if(!o||o.app!=='afiyati'||!validState(o.state)){ toast('الملف ليس نسخة احتياطية صالحة من Vigoris'); return; }",
    "    if(!o||o.app!=='afiyati'||(o.schema!==undefined&&!(o.schema>=0&&o.schema<=BK_SCHEMA))||!validState(o.state)){ toast('الملف ليس نسخة احتياطية صالحة من Vigoris'); return; }")
rep("      m.querySelector('#ry').onclick=async()=>{ close(); S=Object.assign({},DEF,o.state); fixState(); save(); applySecure(); await scheduleReminders(); toast('تمت استعادة بياناتك'); tab='home'; render(); }; }); }",
"""      m.querySelector('#ry').onclick=async()=>{ close(); const prev=JSON.stringify(S);
        try{ const st=JSON.parse(JSON.stringify(o.state)); const n=Object.assign({},DEF,st); if(st.v===undefined) n.v=1; const old=S; S=n; try{ fixState(); }catch(x){ S=old; throw x; } }
        catch(e){ S=JSON.parse(prev); toast('تعذّرت الاستعادة — بقيت بياناتك كما هي'); return; }
        save(); applySecure(); await scheduleReminders(); toast('تمت استعادة بياناتك'); tab='home'; render(); }; }); }""")

# ---------- 12.6 صلاحيات Health Connect والنوم ----------
rep("    S.hc.on=(st.readAuthorized||[]).length>0; save();",
    "    S.hc.perm=(st.readAuthorized||[]).slice(); S.hc.on=S.hc.perm.length>0; save();")
rep("  S.hc.at=Date.now();\n",
"""  S.hc.at=Date.now();
  // لا نقرأ إلا الأنواع المصرّح بها (المستخدمون القدامى بلا قائمة: نفترض صلاحياتهم السابقة)
  const ok=t=>!Array.isArray(S.hc.perm)||S.hc.perm.includes(t);
""")
rep("  try{ const r=await HCP.queryAggregated({dataType:'steps',","  if(ok('steps')) try{ const r=await HCP.queryAggregated({dataType:'steps',")
rep("""  try{ const r=await HCP.readSamples({dataType:'sleep',startDate:iso(mid-8*36e5),endDate:iso(now),limit:60});
    let mins=0; (r.samples||[]).forEach(s=>{ if(s.stages&&s.stages.length){ s.stages.forEach(g=>{ if(g.stage!=='awake'&&g.stage!=='inBed') mins+=(new Date(g.endDate)-new Date(g.startDate))/6e4; }); } else if(!s.sleepState||['asleep','light','deep','rem'].includes(s.sleepState)) mins+=(new Date(s.endDate)-new Date(s.startDate))/6e4; });""",
"""  if(ok('sleep')) try{ const r=await HCP.readSamples({dataType:'sleep',startDate:iso(mid-8*36e5),endDate:iso(now),limit:60});
    // نجمع فترات النوم ثم ندمج المتداخلة منها (ساعتان تسجلان نفس الليلة) فلا تُحسب المدة مرتين
    const iv=[]; (r.samples||[]).forEach(s=>{ if(s.stages&&s.stages.length){ s.stages.forEach(g=>{ if(g.stage!=='awake'&&g.stage!=='inBed') iv.push([+new Date(g.startDate),+new Date(g.endDate)]); }); } else if(!s.sleepState||['asleep','light','deep','rem'].includes(s.sleepState)) iv.push([+new Date(s.startDate),+new Date(s.endDate)]); });
    const mins=mergedMinutes(iv);""")
rep("  try{ const r=await HCP.readSamples({dataType:'bloodGlucose',","  if(ok('bloodGlucose')) try{ const r=await HCP.readSamples({dataType:'bloodGlucose',")
rep("let v=s.value; if(s.unit&&s.unit!=='mg/dL'&&v<40) v=v*18;","let v=s.value; if(/mmol/i.test(s.unit||'')||(!s.unit&&v<40)) v=v*18.016;")
rep("  try{ const r=await HCP.readSamples({dataType:'heartRate',","  if(ok('heartRate')) try{ const r=await HCP.readSamples({dataType:'heartRate',")
rep("  try{ const r=await HCP.readSamples({dataType:'restingHeartRate',","  if(ok('restingHeartRate')) try{ const r=await HCP.readSamples({dataType:'restingHeartRate',")
rep("const iso=t=>new Date(t).toISOString();",
"""const iso=t=>new Date(t).toISOString();
function mergedMinutes(iv){ const a=iv.filter(([x,y])=>y>x).sort((p,q)=>p[0]-q[0]); let tot=0,cs=null,ce=null;
  for(const [x,y] of a){ if(cs===null){ cs=x; ce=y; } else if(x<=ce){ ce=Math.max(ce,y); } else { tot+=ce-cs; cs=x; ce=y; } }
  if(cs!==null) tot+=ce-cs; return tot/6e4; }
const HC_TYPES=[['steps','الخطوات'],['sleep','النوم'],['bloodGlucose','سكر الدم'],['heartRate','النبض'],['restingHeartRate','نبض الراحة']];
function hcStatusHTML(){ if(!S.hc.on) return '';
  const known=Array.isArray(S.hc.perm), g=t=>!known||S.hc.perm.includes(t), all=HC_TYPES.every(([t])=>g(t));
  return `<div class="hcst"><p class="small" style="margin:0 0 6px"><b>${all?'متصل — كل البيانات مسموحة':'متصل جزئيًا — بعض البيانات غير مسموحة'}</b></p>
   <div class="hcp">${HC_TYPES.map(([t,n])=>`<span class="${g(t)?'ok':'no'}">${ic(g(t)?'check':'x')}${n}</span>`).join('')}</div>
   <p class="small muted" style="margin:6px 0 0">آخر مزامنة: ${S.hc.at?fd(dstr(new Date(S.hc.at)))+' '+hm(new Date(S.hc.at).getHours()*60+new Date(S.hc.at).getMinutes()):'لم تتم بعد'}${all?'':' · لإضافة صلاحية افتح إعدادات Health Connect'}</p></div>`; }""")
rep("      <button class=\"btn ghost\" id=\"stSync\">${ic('repeat')}تحديث من الساعة</button>`",
    "      ${hcStatusHTML()}<button class=\"btn ghost\" id=\"stSync\">${ic('repeat')}تحديث من الساعة</button>`")

# ---------- 12.7 أمان البرنامج: الألم يوقف التدرّج ----------
rep("""    <button data-r="easy">سهلة</button><button data-r="ok">مناسبة</button><button data-r="hard">صعبة</button></div></div>""",
    """    <button data-r="easy">سهلة</button><button data-r="ok">مناسبة</button><button data-r="hard">صعبة</button><button data-r="pain">مؤلمة</button></div></div>""")
rep("    if(b.dataset.r==='hard') toast('لا بأس — إن تكررت الصعوبة خذ وقتك، وتوقف إن شعرت بألم.');",
"""    if(b.dataset.r==='hard') toast('لا بأس — إن تكررت الصعوبة خذ وقتك، وتوقف إن شعرت بألم.');
    if(b.dataset.r==='pain'){ S.painAt=today(); S.suggestAdvance=false; save(); painSheet(); }""")
rep("function evalAdvance(){",
"""// الألم أو الأعراض المزمنة لا يُبنى عليها تدرّج تلقائي في التقوية: يتوقف اقتراح التقدّم ويُنصح بتقييم مختص
const careHold=()=>!!S.warned||(S.painAt&&dayDiff(S.painAt,today())<28);
function painSheet(){ modal(`<h3>توقّف عن التمارين الآن</h3><p>الألم أثناء تمارين قاع الحوض ليس طبيعيًا. أوقف التمارين، ولا تزد شدتها.</p>
  <p class="small muted">قد تكون العضلات مشدودة أكثر من اللازم، وفي هذه الحالة تمارين التقوية قد تزيد المشكلة. ننصحك بمراجعة طبيب أو أخصائي علاج طبيعي لقاع الحوض قبل المتابعة.</p>
  <p class="small muted">أوقفنا اقتراح التقدّم في البرنامج لمدة 4 أسابيع.</p><button class="btn accent" id="pOk">فهمت</button>`,(m,close)=>{ m.querySelector('#pOk').onclick=close; }); }
function evalAdvance(){
  if(careHold()){ S.suggestAdvance=false; return; }""")
rep("  const adv = S.suggestAdvance && !dayDone ?","  const adv = S.suggestAdvance && !careHold() && !dayDone ?")

# ---------- 12.8 قواعد الفحوصات ومراجعها ----------
rep("['a1c','السكر التراكمي HbA1c','كل 3 أشهر إن لم تصل للهدف، وكل 6 أشهر إن كان ضمن الهدف.',()=>{ const l=S.a1c[S.a1c.length-1]; return l&&l.v<7?6:3; },'drop'],",
    "['a1c','السكر التراكمي HbA1c','مرتين في السنة على الأقل إن أكد طبيبك أنك ضمن هدفك ومستقر، وكل 3 أشهر إن لم تصل لهدفك أو تغيّر علاجك أو تكرر الانخفاض.',()=>S.a1cStable?6:3,'drop'],")
rep("['kidney','وظائف الكلى: الألبومين في البول (UACR) وeGFR','تحليل بول وتحليل دم سنويًا لاكتشاف تأثر الكلى مبكرًا.',()=>12,'flask'],",
    "['kidney','وظائف الكلى: الألبومين في البول (UACR) وeGFR','تحليل بول وتحليل دم سنويًا: من وقت التشخيص في النوع الثاني، وبعد 5 سنوات من التشخيص في النوع الأول. قد يطلبه طبيبك أكثر إن ظهر تأثر في الكلى.',()=>12,'flask'],")
rep("['foot','فحص القدم الشامل','عند الطبيب سنويًا (الإحساس والنبض والجلد)، مع فحص قدميك بنفسك يوميًا.',()=>12,'shield'],",
    "['foot','فحص القدم الشامل','عند الطبيب سنويًا (الإحساس والنبض والجلد)، وأكثر إن صنّف طبيبك قدمك عالية الخطورة، مع فحص قدميك بنفسك يوميًا.',()=>S.footHigh?3:12,'shield'],")
rep("const CHECKS=[",
"""// مرجع كل قاعدة وتاريخ مراجعتها داخل التطبيق. «إرشاد رسمي» = توصية معتمدة من جهة طبية؛ «عام» = نصيحة تثقيفية.
const ADA26='https://diabetesjournals.org/care/issue/49/Supplement_1';
const CHK_SRC={a1c:['ADA — Standards of Care in Diabetes 2026، القسم 6 (التوصية 6.2)','https://pmc.ncbi.nlm.nih.gov/articles/PMC12690178','إرشاد رسمي'],
  kidney:['ADA — Standards of Care in Diabetes 2026، القسم 11 (التوصية 11.1)',ADA26,'إرشاد رسمي'],
  eye:['ADA — Standards of Care in Diabetes 2026، القسم 12',ADA26,'إرشاد رسمي'],
  foot:['ADA — Standards of Care in Diabetes 2026، القسم 12',ADA26,'إرشاد رسمي'],
  lipid:['ADA — Standards of Care in Diabetes 2026، القسم 10',ADA26,'إرشاد رسمي'],
  dental:['نصيحة تثقيفية عامة — يحدد طبيب الأسنان الموعد','', 'عام']};
const CHK_REVIEWED='2026-11';
const CHECKS=[""")
rep("""    <div class="field"><label for="ckD">تاريخ آخر فحص</label><input id="ckD" type="date" max="${today()}" value="${checkLast(k)||today()}"></div>""",
"""    <div class="field"><label for="ckD">تاريخ آخر فحص</label><input id="ckD" type="date" max="${today()}" value="${checkLast(k)||today()}"></div>
    ${k==='a1c'?`<label class="chk"><input type="checkbox" id="ckS" ${S.a1cStable?'checked':''}> أكد طبيبي أنني ضمن هدفي ومستقر (الفحص كل 6 أشهر)</label>`:''}
    ${k==='foot'?`<label class="chk"><input type="checkbox" id="ckS" ${S.footHigh?'checked':''}> صنّف طبيبي قدمي عالية الخطورة (الفحص كل 3 أشهر)</label>`:''}
    <p class="small muted src">${ic('books')} المصدر: ${CHK_SRC[k][1]?`<a href="${CHK_SRC[k][1]}" target="_blank" rel="noopener">${CHK_SRC[k][0]}</a>`:CHK_SRC[k][0]} · ${CHK_SRC[k][2]} · آخر مراجعة في التطبيق ${CHK_REVIEWED}. لا يغني عن خطة طبيبك.</p>""")
rep("m.querySelector('#ckF').addEventListener('submit',e=>{ e.preventDefault(); const v=m.querySelector('#ckD').value;",
    "m.querySelector('#ckF').addEventListener('submit',e=>{ e.preventDefault(); const v=m.querySelector('#ckD').value, cs=m.querySelector('#ckS'); if(cs){ if(k==='a1c') S.a1cStable=cs.checked; if(k==='foot') S.footHigh=cs.checked; }")

# ---------- 12.11 سهولة الوصول ----------
rep('<div class="phase" id="ph">استعد</div>','<div class="phase" id="ph" role="status" aria-live="polite" aria-atomic="true">استعد</div>')
rep('<div class="phase" id="tPh">','<div class="phase" id="tPh" role="status" aria-live="polite">')
rep(".dav{width:40px;height:40px;",".dav{width:44px;height:44px;")
rep(".dbell{position:relative;width:40px;height:40px;",".dbell{position:relative;width:44px;height:44px;")
rep(".dtheme button{width:34px;height:30px;",".dtheme button{width:44px;height:38px;")

# ---------- طلب المستخدم: اللغة خارج الرئيسية ----------
rep("""    <button class="dlang" id="dLang" data-noi18n>${LANG==='en'?'العربية':'English'}</button>\n""","")
rep("  on('#dLang',()=>setLang(LANG==='en'?'ar':'en'));\n","")
rep("""    h=`<div class="row" style="justify-content:flex-end"><button class="btn ghost sm" id="langT" data-noi18n style="width:auto" lang="${LANG==='en'?'ar':'en'}">${LANG==='en'?'العربية':'English'}</button></div>${IMG('breathe_man')}<h1>Vigoris</h1>""",
"""    h=`${S.langOk?'':`<div class="card langc" data-noi18n><p style="margin:0 0 10px">${LANG==='en'?'Your device language is <b>English</b>. Continue in English?':'لغة جهازك <b>العربية</b>. هل تتابع بالعربية؟'}</p>
      <div class="btnrow"><button class="btn accent sm" id="langK">${LANG==='en'?'Continue in English':'متابعة بالعربية'}</button><button class="btn ghost sm" id="langT" lang="${LANG==='en'?'ar':'en'}">${LANG==='en'?'التبديل إلى العربية':'Switch to English'}</button></div></div>`}${IMG('breathe_man')}<h1>Vigoris</h1>""")
rep("  const lt=$('#langT'); if(lt) lt.onclick=()=>setLang(LANG==='en'?'ar':'en');",
    "  const lt=$('#langT'); if(lt) lt.onclick=()=>{ S.langOk=true; save(); setLang(LANG==='en'?'ar':'en'); };\n  const lk=$('#langK'); if(lk) lk.onclick=()=>{ S.langOk=true; save(); renderOnb(); };")
# الانتقال للخطوة التالية يعني قبول اللغة الحالية
rep("  const nx=$('#nx'); if(nx) nx.onclick=()=>{ if(nx.disabled) return; if(st<5){","  const nx=$('#nx'); if(nx) nx.onclick=()=>{ if(nx.disabled) return; if(st===0&&!S.langOk){ S.langOk=true; save(); } if(st<5){")

css="""
.hcst{background:var(--bg);border-radius:14px;padding:10px 12px;margin:10px 0}
.hcp{display:flex;flex-wrap:wrap;gap:6px}
.hcp span{display:inline-flex;align-items:center;gap:4px;font-size:12px;padding:4px 9px;border-radius:12px}
.hcp span .ic{width:13px;height:13px}
.hcp .ok{background:var(--accentSoft);color:var(--accent)}.hcp .no{background:#FDE5E3;color:#B4432F}
body.dark .hcp .no{background:#3A1D17;color:#F2A08F}
.src a{color:var(--accent)}
label.chk{display:flex;gap:10px;align-items:flex-start;font-size:14px;margin:10px 0;line-height:1.5}
label.chk input{width:22px;height:22px;flex:none;margin:0}
.langc{border:1px solid var(--line)}
.rate{flex-wrap:wrap}
"""
rep('</style>',css+'</style>')
open(p,'w',encoding='utf-8').write(s); print('phase1 patched')
