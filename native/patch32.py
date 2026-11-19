# التدريب التعليمي للشد الصحيح + رسومات متحركة
p='www/index.html'; s=open(p,encoding='utf-8').read()
def rep(a,b,n=1):
    global s
    assert s.count(a)==n,(a[:90],s.count(a)); s=s.replace(a,b)
rep('/* ============ التهيئة (Onboarding) ============ */', open('native/tut.js',encoding='utf-8').read()+'\n/* ============ التهيئة (Onboarding) ============ */')
rep('</style>', open('native/tut.css',encoding='utf-8').read()+'</style>')
rep("obj=['prof','ach',","obj=['prof','tut','ach',")
# إشارة المستخدم الناجحة تظهر في تعليمات الجلسة
rep("function curLabel(st){ if(st.t==='sq'&&st.lbl==='hold') return PH.hold;",
    "function curLabel(st){ const h=(st.t==='sq'||st.t==='e1')&&tutCueHint(); if(h) return [st.lbl==='hold'?PH.hold[0]:PH[st.t][0],h]; if(st.t==='sq'&&st.lbl==='hold') return PH.hold;")
# بعد الجلسة: رابط للتدريب
rep('<button data-r="pain">مؤلمة</button></div></div>','<button data-r="pain">مؤلمة</button></div><button class="linkbtn" id="tutFix">${ic(\'target\')} شددت أردافي أو حبست نفسي؟ تدرّب على الشد الصحيح</button></div>')
rep("  $('#home').onclick=()=>{ screen='tabs'; tab='home'; render(); window.scrollTo(0,0); };",
    "  $('#home').onclick=()=>{ screen='tabs'; tab='home'; render(); window.scrollTo(0,0); };\n  const tf=$('#tutFix'); if(tf) tf.onclick=()=>tutorial(0);")
# تبويب تعلّم: التدريب أولًا
rep('app.innerHTML=`<h1>تعلّم</h1><p class="muted">مقالات قصيرة تساعدك على التمرين الصحيح.</p>',
    'app.innerHTML=`<h1>تعلّم</h1><p class="muted">مقالات قصيرة تساعدك على التمرين الصحيح.</p>\n  <div class="card tcard"><div class="hrow" style="gap:12px"><span class="ic-badge" style="margin:0">${ic(\'target\')}</span><div style="flex:1"><b>تدريب تفاعلي: الشد الصحيح</b><p class="small muted" style="margin:2px 0 0">${S.tut&&S.tut.passed?\'أتقنته — راجعه متى شئت\':\'رسومات متحركة، ومختبر للإشارات، وتمرين موجّه مع كشف حبس النفس\'}</p></div></div><button class="btn accent sm" id="tutL" style="margin-top:10px">${ic(\'play\')}ابدأ</button></div>')
rep("  ${CREDIT}`;\n}","  ${CREDIT}`;\n  const tl=$('#tutL'); if(tl) tl.onclick=()=>tutorial(0);\n}",1) if s.count("  ${CREDIT}`;\n}")==1 else None
# الرئيسية
rep("${profCard()}${ramAskCard()}","${profCard()}${tutCard()}${ramAskCard()}")
rep("  bindDash(); bindProfCard();\n","  bindDash(); bindProfCard(); bindTutCard();\n")
# التهيئة: زر التدريب في خطوة «أين عضلاتك؟»
rep("""      <button class="btn accent" id="nx">فهمت، التالي</button>`;""","""      <button class="btn ghost" id="tutO">${ic('target')}جرّب التدريب التفاعلي الآن (3 دقائق)</button><div style="height:8px"></div>
      <button class="btn accent" id="nx">فهمت، التالي</button>`;""")
rep("  const pf=$('#pfOnb');","  const to=$('#tutO'); if(to) to.onclick=()=>tutorial(0);\n  const pf=$('#pfOnb');")
open(p,'w',encoding='utf-8').write(s); print('tut patched')
