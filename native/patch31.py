# المرحلة الثانية: الملف الصحي الاختياري + الإظهار حسب الحالة + سلامة التمارين والغذاء
import re
p='www/index.html'; s=open(p,encoding='utf-8').read()
mod=open('native/profile.js',encoding='utf-8').read()
def rep(a,b,n=1):
    global s
    assert s.count(a)==n,(a[:90],s.count(a)); s=s.replace(a,b)

rep('/* ============ التهيئة (Onboarding) ============ */', mod+'\n/* ============ التهيئة (Onboarding) ============ */')

# حالة: الملف الصحي ضمن الحالة والنسخة الاحتياطية
rep("  const dflt={tests:[],","  if(!S.prof||typeof S.prof!=='object') S.prof=defProf(); if(S.prof.c&&S.prof.c.dm===undefined&&S.onboarded) S.prof.c.dm=!!S.diabetes;\n  const dflt={tests:[],")
rep("obj=['ach',","obj=['prof','ach',")

# ---------- التهيئة ----------
rep("let ob={step:0,goals:new Set(S.goals),q:[null,null,null,null],flip:{}};","let ob={step:0,goals:new Set(S.goals),q:[null,null,null],flip:{}};")
rep("  const N=6, st=ob.step;","  const N=7, st=ob.step;")
rep("""             ['هل لديك ألم حوض مزمن أو أعراض بولية مزمنة أو جراحة حديثة؟',['لا','نعم']],
             ['هل لديك سكري؟',['لا','نعم']]];
    h=`<h1>مستوى البداية</h1><p class="muted">أربعة أسئلة لنحدد من أين تبدأ ونخصّص متابعتك.</p>`+""",
"""             ['هل لديك ألم حوض مزمن أو أعراض بولية مزمنة أو جراحة حديثة؟',['لا','نعم']]];
    h=`<h1>مستوى البداية</h1><p class="muted">ثلاثة أسئلة لنحدد من أين تبدأ.</p>`+""")
rep("""  } else if(st===4){
    const lvl=calcLevel();""","""  } else if(st===4){
    const sm=profSummary();
    h=`<h1>ملفك الصحي</h1><p class="muted">عمرك وحالتك الصحية وحساسيتك من الأطعمة، لنخصّص لك التمارين والغذاء والتنبيهات، ولا نعرض لك ما لا يخصّك (مثل أقسام السكري أو الضغط).</p>
    ${IMG('heart_breath','sm')}
    <div class="card small"><b>اختياري وخاص:</b> الإجابات تبقى على جهازك فقط ولا تُرسل لأي جهة، ويمكنك تعديلها أو حذفها في أي وقت من الإعدادات.</div>
    ${P().consent?`<div class="card small"><b>تم الحفظ</b>${sm.length?'<br>'+sm.map(esc).join('<br>'):'<br>لا حالات مسجّلة'}</div>`:''}
    <button class="btn accent" id="pfOnb">${P().consent?'تعديل إجاباتي':'أجب عن الأسئلة (دقيقة)'}</button><div style="height:8px"></div>
    <button class="btn ${P().consent?'accent':'ghost'}" id="nx">${P().consent?'التالي':'لاحقًا'}</button>`;
  } else if(st===5){
    const lvl=calcLevel();""")
rep("""    ${ob.q[2]===1?'<div class="warn"><b>ننصحك باستشارة طبيب قبل البدء.</b>""","""    ${exWarnHTML('kegel')}${exWarnHTML('aerobic')}
    ${ob.q[2]===1?'<div class="warn"><b>ننصحك باستشارة طبيب قبل البدء.</b>""")
rep("""    ${isF()?'<div class="warn">إن كنتِ حاملًا أو في الأسابيع الستة الأولى بعد الولادة، استشيري طبيبتك قبل البدء.</div>':''}""",
    """    ${isF()&&!['none','meno','pp'].includes(P().stage)?'<div class="warn">إن كنتِ حاملًا أو في الأسابيع الستة الأولى بعد الولادة، استشيري طبيبتك قبل البدء.</div>':''}""")
rep("  } else if(st===5){\n    h=`<h1>مواعيد التذكير</h1>","  } else if(st===6){\n    h=`<h1>مواعيد التذكير</h1>")
rep("if(st===0&&!S.langOk){ S.langOk=true; save(); } if(st<5){","if(st===0&&!S.langOk){ S.langOk=true; save(); } if(st<6){")
rep("  const sk=$('#skipN'); if(sk) sk.onclick=()=>finishOnb(false);",
    "  const sk=$('#skipN'); if(sk) sk.onclick=()=>finishOnb(false);\n  const pf=$('#pfOnb'); if(pf) pf.onclick=()=>profSheet(['__age',...COND.filter(([,,v])=>v()).map(c=>c[0]),'__alg','__smoke','__stage'],{title:'ملفك الصحي',why:'يساعدنا على تخصيص التمارين والغذاء والتنبيهات.',ok:'حفظ',then:()=>renderOnb()});")
rep("S.warned=ob.q[2]===1; S.diabetes=ob.q[3]===1;","S.warned=ob.q[2]===1||has('pelvicPain')||has('pelvicSurg'); S.diabetes=P().c.dm===true;")
# تذكير الماء في التهيئة لا يُقترح لمريض الكلى
rep("""<div class="card"><div class="set"><span class="hrow">${ic('drop')} تذكير شرب الماء<br></span>""","""${has('ckd')?'<div class="warn small">ذكرت مرضًا في الكلى: أوقفنا تذكير الماء لأن طبيبك قد يحدد كمية السوائل. فعّله فقط إن سمح لك.</div>':''}<div class="card"><div class="set"><span class="hrow">${ic('drop')} تذكير شرب الماء<br></span>""")

# ---------- بوابة بدء جلسة قاع الحوض ----------
rep("function startSession(kind,plan,idx){\n","""function startSession(kind,plan,idx){
  if(kind!=='breath'){
    if(missing('kegel').length){ ensureAsked('kegel',()=>startSession(kind,plan,idx),'قبل أول تمرين','بعض الحالات تحتاج تقييم مختص قبل تمارين التقوية.'); return; }
    if(has('pelvicSurg')&&!P().surgOk){ modal(`<h3>بعد الجراحة</h3><p>ذكرت جراحة حديثة في الحوض أو البروستاتا أو قسطرة بولية. هل سمح لك جرّاحك بتمارين قاع الحوض، وأُزيلت القسطرة؟</p><div class="btnrow"><button class="btn accent" id="sgY">نعم، سمح لي</button><button class="btn ghost" id="sgN">ليس بعد</button></div><p class="small muted">${ic('books')} ${srcLink('nice')}</p>`,(m,close)=>{
        m.querySelector('#sgY').onclick=()=>{ P().surgOk=today(); save(); close(); startSession(kind,plan,idx); };
        m.querySelector('#sgN').onclick=()=>{ close(); toast('ننتظر موافقة جرّاحك — يمكنك قراءة قسم «تعلّم» حتى ذلك الحين'); }; }); return; }
  }
""")

# ---------- العادات والمشي: أسئلة قبل الرياضة وتحذيرات ----------
rep("function heartSheet(){\n  modal(","function heartSheet(){\n  const miss=[...new Set([...missing('aerobic'),...missing('resist')])]; if(miss.length){ profSheet(miss,{title:'قبل الرياضة',why:'بعض الحالات تحتاج احتياطات خاصة مع الرياضة الهوائية وتمارين المقاومة.',then:heartSheet}); return; }\n  modal(")
rep("""    ${S.diabetes?`<button class="btn ghost sm" id="hEx" style="margin-top:8px">${ic('shield')}فحص السكر قبل الرياضة</button>`:''}</div>`;""",
    """    ${exWarnHTML('aerobic')}${exWarnHTML('resist')}
    ${S.diabetes?`<button class="btn ghost sm" id="hEx" style="margin-top:8px">${ic('shield')}فحص السكر قبل الرياضة</button>`:''}</div>`;""")
rep("function stepsSheet(){\n","function stepsSheet(){\n  if(missing('aerobic').length){ ensureAsked('aerobic',stepsSheet,'قبل المشي','بعض الحالات تحتاج احتياطات خاصة مع المشي والرياضة.'); return; }\n")
rep("""      m.querySelector('#stB').innerHTML=`<div class="hrow" style="gap:10px"><span class="ic-badge" style="margin:0">${hi('walking')}</span><h3 style="margin:0">المشي والنوم</h3></div>${IMG('walk','sm')}""",
    """      m.querySelector('#stB').innerHTML=`<div class="hrow" style="gap:10px"><span class="ic-badge" style="margin:0">${hi('walking')}</span><h3 style="margin:0">المشي والنوم</h3></div>${IMG('walk','sm')}${exWarnHTML('aerobic')}""")

# ---------- الغذاء ----------
rep("""function foodBody(){
  const wd=new Date().getDay(), m=MEALS[wd], tm=mealToday(), tom=MEALS[(wd+1)%7];
  return `""","""function foodBody(){
  if(missing('food').length) return `<div class="card fcard"><p class="lbl">قبل أن نقترح عليك وجبات</p><h3 style="margin:4px 0">هل لديك حساسية أو حالة تمنعك من أطعمة معينة؟</h3>
    <p class="small muted">نسألك مرة واحدة فقط ونحفظ إجابتك، فلا نقترح عليك ما لا يناسبك.</p><button class="btn accent" id="fAsk">${ic('leaf')}أجب (30 ثانية)</button></div>`;
  const wd=new Date().getDay(), mf=mealFor(MEALS[wd]), m=mf.m, tm=mealToday(), tom=mealFor(MEALS[(wd+1)%7]).m;
  const notes=mf.notes.map(k=>`<div class="warn small exw">${MEAL_NOTE[k][0]}<span class="src">${ic('books')} ${srcLink(MEAL_NOTE[k][1])}</span></div>`).join('');
  return `${has('ckd')?`<div class="warn small exw">مع مرض الكلى قد يحدد طبيبك كمية البوتاسيوم والفوسفور والسوائل. خطتك الغذائية الأساسية هي ما يحدده طبيبك أو أخصائي التغذية، وهذه اقتراحات عامة.<span class="src">${ic('books')} ${srcLink('nkf')}</span></div>`:''}""")
rep("""<p class="small muted" style="margin:0">${m[3]}</p></div></div>""","""<p class="small muted" style="margin:0">${m[3]}</p></div></div>${notes}""")
rep("""  <div class="card plan">${MEALS.map((x,i)=>`<div class="slot ${i===wd?'next':''}"><span class="tm">${AR_DAYS[i]}</span><span class="st">${ic(x[0])}</span><span class="tx"><b>${x[1]}</b><span>${x[2]}</span></span></div>`).join('')}</div>
  <div class="card"><h3>قواعد مهمة لمريض السكري</h3>""","""  <div class="card plan">${MEALS.map(x=>mealFor(x).m).map((x,i)=>`<div class="slot ${i===wd?'next':''}"><span class="tm">${AR_DAYS[i]}</span><span class="st">${ic(x[0])}</span><span class="tx"><b>${x[1]}</b><span>${x[2]}</span></span></div>`).join('')}</div>
  ${P().a.gluten===true?'<div class="card small">مع حساسية القمح: اختر حبوبًا خالية من الجلوتين مثل الأرز البني والكينوا والذرة بدل القمح والشعير.</div>':''}
  ${S.diabetes?`<div class="card"><h3>قواعد مهمة لمريض السكري</h3>""")
rep("""    <div class="ev"><span class="badge">${ic('walk')}</span><div><b>امشِ 10–15 دقيقة بعد الأكل</b><p>المشي بعد الوجبة يخفض ارتفاع السكر بعدها.</p></div></div></div>""",
    """    <div class="ev"><span class="badge">${ic('walk')}</span><div><b>امشِ 10–15 دقيقة بعد الأكل</b><p>المشي بعد الوجبة يخفض ارتفاع السكر بعدها.</p></div></div></div>`:''}""")
# دراستا MÈDITA وCAPRI عن رجال مصابين بالسكري: تظهران لمريض السكري من الرجال فقط
i=s.index("""    <div class="ev"><span class="badge">${ic('leaf')}</span><div><b>النظام المتوسطي يحمي الانتصاب لدى مرضى السكري</b>""")
j=s.index("""    <div class="ev"><span class="badge">${ic('citrus')}</span><div><b>الفاكهة الكاملة لا العصير</b>""",i)
s=s[:i]+"    ${S.diabetes&&!isFem()?`"+s[i:j].rstrip('\n')+"`:''}\n"+s[j:]
rep("  on('#fDone',()=>{","  on('#fAsk',()=>ensureAsked('food',render,'الأطعمة التي لا تناسبك','نحفظ إجابتك ولا نقترح عليك ما يتعارض معها.'));\n  on('#fDone',()=>{")

# ---------- إظهار محتوى السكري والضغط حسب الحالة فقط ----------
rep("${EVID.map(([i,t,d,l,src])=>","${EVID.filter(([,t,d])=>S.diabetes||!/السكري|سكري/.test(t)).map(([i,t,d,l,src])=>")
rep("${WEVID.map(([i,t,d,l,src])=>","${WEVID.filter(([,t])=>S.diabetes||!/السكري|السكر/.test(t)).map(([i,t,d,l,src])=>")
rep("' دقائق — جيد لضغط الدم والقلب'","(htn()?' دقائق — جيد لضغط الدم والقلب':' دقائق — جيد للقلب')")
rep("""      <p><b>ضغط الدم:</b>""","""      ${htn()?'':'<!--'}<p><b>ضغط الدم:</b>""")
rep("""      <p><b>السكري:</b>""","""      ${htn()?'':'-->'}${S.diabetes?'':'<!--'}<p><b>السكري:</b>""")
rep("""      <p><b>جمعية القلب الأمريكية</b>""","""      ${S.diabetes?'':'-->'}${htn()?'':'<!--'}<p><b>جمعية القلب الأمريكية</b>""")
rep("""      <p class="muted">يكمّل العلاج ولا يغني عن أدوية الضغط أو السكري.</p></div></details>`;""","""      ${htn()?'':'-->'}<p class="muted">يكمّل العلاج ولا يغني عن أي دواء.</p></div></details>`;""")
# بطاقة قياس الضغط: لمن ذكر ارتفاع الضغط فقط (في المؤشرات بدل قسم الفحوص)
a=s.index('  <div class="card"><h3>قياس الضغط في البيت بالطريقة الصحيحة</h3>'); b=s.index("</div>`;\n}",a)
s=s[:a]+s[b+len("</div>"):]
rep("function indBody(){\n  const ii=S.iief, last=ii[ii.length-1], tests=S.tests||[];\n  return `","function indBody(){\n  const ii=S.iief, last=ii[ii.length-1], tests=S.tests||[];\n  return `${htn()?bpCard():''}")

# ---------- الرئيسية ----------
rep("  ${recover}${adv}${ramAskCard()}","  ${recover}${adv}${profCard()}${ramAskCard()}")
rep("  bindDash();\n","  bindDash(); bindProfCard();\n")
rep("""<button id="qkC">${ic('calendar')}<span>الفحوصات</span></button>""","""${S.diabetes?`<button id="qkC">${ic('calendar')}<span>الفحوصات</span></button>`:`<button id="qkP">${ic('user')}<span>ملفي الصحي</span></button>`}""")
rep("  on('#qkS',","  on('#qkP',profAll);\n  on('#qkS',")
rep("<p>${MEALS[new Date().getDay()][1]} — وجبة اليوم</p>","<p>${missing('food').length?'أخبرنا بما لا يناسبك لنقترح وجباتك':mealFor(MEALS[new Date().getDay()]).m[1]+' — وجبة اليوم'}</p>")

# ---------- الإعدادات ----------
rep("""   <div class="set"><label for="lgS">اللغة · Language</label>""","""   <div class="set"><span>ملفك الصحي<br><span class="small muted">${profSummary().map(esc).join(' · ')||'لم يُكمل بعد — اختياري'}</span></span><button class="btn ghost sm" id="pfEd" style="flex:0 0 auto;width:auto">${P().consent?'تعديل':'إكمال'}</button></div>
   ${P().consent?`<div class="set"><span class="small muted">الملف يبقى على جهازك فقط. حذفه لا يمس قراءاتك وجلساتك.</span><button class="btn ghost sm" id="pfDel" style="flex:0 0 auto;width:auto">حذف</button></div>`:''}
   <div class="set"><label for="lgS">اللغة · Language</label>""")
rep("""   <div class="set"><label for="gU">وحدة السكر</label>""","""   ${S.diabetes?'':'<!--'}<div class="set"><label for="gU">وحدة السكر</label>""")
s=re.sub(r"(<div class=\"set\"><label for=\"gU\">وحدة السكر</label>.*?</select></div>)",lambda m_:m_.group(1)+"${S.diabetes?'':'-->'}",s,count=1,flags=re.S)
rep("  $('#fsz').onchange=","  $('#pfEd').onclick=profAll; const pd=$('#pfDel'); if(pd) pd.onclick=profClear;\n  $('#fsz').onchange=")
# إعادة تفعيل السكري من الإعدادات تُبقي بياناته؛ وإيقافه يخفيها فقط
rep("on('#dmOn',()=>{ S.diabetes=!S.diabetes;","on('#dmOn',()=>{ S.diabetes=!S.diabetes; P().c.dm=S.diabetes;")

# ---------- تقرير الطبيب: العمر والحالات المصرّح بها ----------
rep("const L1=[`تقرير «Vigoris» ${doctor?'للطبيب':'الأسبوعي'}${nm()?' — '+nm():''}`,`الفترة: ${from} إلى ${today()} (${days} يومًا)`,''];",
    "const L1=[`تقرير «Vigoris» ${doctor?'للطبيب':'الأسبوعي'}${nm()?' — '+nm():''}`,`الفترة: ${from} إلى ${today()} (${days} يومًا)`,...(doctor?profSummary():[]),''];")

# ---------- الماء ومرض الكلى ----------
rep("""      m.querySelector('#wsBody').innerHTML=`<div style="color:var(--water)">${cupsSVG(Math.min(w,g),g)}</div>""",
    """      m.querySelector('#wsBody').innerHTML=`${has('ckd')?`<div class="warn small exw">مع مرض الكلى قد يحدد طبيبك كمية السوائل اليومية. اجعل هدفك ما يحدده طبيبك لا 8 أكواب.<span class="src">${ic('books')} ${srcLink('nkf')}</span></div>`:''}<div style="color:var(--water)">${cupsSVG(Math.min(w,g),g)}</div>""")

css="""
.exw{margin:8px 0}.exw .src{display:block;margin-top:6px;font-size:12px;opacity:.85}.exw .src a{color:inherit;text-decoration:underline}
.exw .src .ic{width:13px;height:13px;vertical-align:-2px}
fieldset.chks{border:0;padding:0;margin:10px 0}fieldset.chks legend{font-weight:700;margin-bottom:4px}
.pfc{border:1px solid var(--accent)}
"""
rep('</style>',css+'</style>')
open(p,'w',encoding='utf-8').write(s); print('phase2 patched')
