/* ============ دعم النساء ============ */
const isF=()=>S.sex==='f';
const F_IMG={breathe_man:1,heart_breath:1,posture:1,sleep:1,walk:1,water:1};
const GOALS_M=[['erection','تقوية الانتصاب'],['pe','التحكم في سرعة القذف'],['bladder','تحسين السيطرة على المثانة'],['recovery','التعافي بعد جراحة البروستاتا'],['fitness','لياقة عامة ووقاية']];
const GOALS_F=[['bladder','التحكم في تسرّب البول'],['postpartum','التعافي بعد الولادة'],['prolapse','دعم أعضاء الحوض (الهبوط)'],['sexual','تحسين الوظيفة الجنسية'],['fitness','لياقة عامة ووقاية']];
const CUES_F=[
  ['طريقة إيقاف البول','أثناء التبول حاولي إيقاف التدفق في منتصفه — العضلات التي تشدّينها هي المطلوبة.<br><b style="color:var(--danger)">للتعرّف فقط مرة واحدة</b>، ولا تتمرّني أثناء التبول بانتظام.'],
  ['طريقة منع الغازات','تخيّلي أنك تمنعين خروج الغازات، واضغطي العضلات المسؤولة عن ذلك دون شدّ البطن.'],
  ['علامات الانقباض الصحيح','إحساس بشدّ ورفع حول فتحتي المهبل والشرج إلى الداخل والأعلى، كأنك ترفعين شيئًا صغيرًا. إن شعرت بذلك فأنت تشدّين العضلة الصحيحة.']
];
const WEVID=[
  ['target','تسرّب البول عند السعال والجهد','مراجعة كوكرين لـ31 تجربة (1817 امرأة): النساء المصابات بالسلس الإجهادي اللواتي مارسن تمارين قاع الحوض كنّ أكثر بنحو 8 أضعاف في الإبلاغ عن الشفاء (56% مقابل 6%).','a','مراجعة منهجية — Dumoulin 2018، Cochrane'],
  ['heart','أثناء الحمل وبعد الولادة','تمارين قاع الحوض أثناء الحمل لدى من لا يعانين تسرّبًا خفّضت خطر التسرّب في أواخر الحمل بنحو 62%. وتمارين ما بعد الولادة مفيدة، لكن أثرها البعيد أقل وضوحًا.','b','مراجعة منهجية — Woodley 2020، Cochrane'],
  ['shield','هبوط أعضاء الحوض','تجربة POPPY على 447 امرأة: برنامج تمارين فردي لمدة 16 أسبوعًا حسّن أعراض الهبوط مقارنة بالنصائح وحدها.','a','تجربة عشوائية — Hagen 2014، Lancet'],
  ['star','الوظيفة الجنسية','تشير دراسات صغيرة إلى أن تقوية قاع الحوض قد تحسّن الإثارة والوصول للنشوة والرضا، لكن جودة الأدلة ما زالت محدودة.','c','مراجعة منهجية — Ferreira 2015'],
  ['drop','السكري وصحة المرأة','السكري يزيد احتمال تسرّب البول والتهابات المسالك. وأدوية SGLT2 (مثل إمباغليفلوزين وداباغليفلوزين) تزيد الالتهابات الفطرية التناسلية — النظافة الجيدة ومراجعة الطبيب عند الأعراض.','b','ADA Standards of Care 2026'],
  ['moon','الدورة الشهرية والسكر','بعض النساء يلاحظن ارتفاع السكر في الأيام التي تسبق الدورة. سجّلي قراءاتك وناقشي النمط مع طبيبك إن تكرر.','c','دراسات رصدية']
];
const WSRCS=[
  ['Dumoulin C, Cacciari LP, Hay-Smith EJC. PFMT vs no treatment for urinary incontinence in women. Cochrane 2018','https://doi.org/10.1002/14651858.CD005654.pub4'],
  ['Woodley SJ, et al. PFMT for preventing and treating incontinence in antenatal and postnatal women. Cochrane 2020','https://doi.org/10.1002/14651858.CD007471.pub4'],
  ['Hagen S, et al. Individualised PFMT in women with pelvic organ prolapse (POPPY). Lancet 2014','https://doi.org/10.1016/S0140-6736(13)61977-7'],
  ['Ferreira CH, et al. Pelvic floor muscle training and female sexual function: systematic review','https://pubmed.ncbi.nlm.nih.gov/?term=pelvic+floor+muscle+training+female+sexual+function+systematic+review'],
  ['American Diabetes Association. Standards of Care in Diabetes 2026','https://diabetesjournals.org/care/issue/49/Supplement_1']
];
const ART_F=['كيجل بعد الولادة','<p>يمكن البدء بانقباضات خفيفة وقصيرة بعد الولادة الطبيعية بأيام إن لم يكن هناك ألم، أما بعد القيصرية أو التمزق فانتظري إذن طبيبك. ابدئي من المستوى الأول، وزيدي تدريجيًا. التسرّب في الأشهر الأولى شائع، والتمارين المنتظمة تساعد على التعافي.</p><p><b>راجعي الطبيبة</b> إن شعرت بثقل أو بروز في المهبل، أو استمر التسرّب بعد 3 أشهر.</p>'];
function renderWomen(head){
  const LV={a:['أدلة قوية','a'],b:['أدلة متوسطة','b'],c:['أدلة أولية','c']};
  app.innerHTML=`${head}
  <div class="sec"><h2>تمارينك</h2></div>
  <div class="tiles"><button class="tile quick" id="mD"><div class="hd"><span class="badge">${ic('play')}</span><span class="sub">اليوم ${S.progDay}</span></div><h3>جلسة البرنامج</h3><div class="sub">تقوية قاع الحوض والتحكم</div></button>
  <button class="tile quick" id="mC"><div class="hd"><span class="badge">${ic('target')}</span><span class="sub">2 د</span></div><h3>تمرين التحكم</h3><div class="sub">انقباضات سريعة ثم ثبات</div></button></div>
  <div class="sec"><h2>ما تقوله الدراسات</h2></div>
  <div class="card" style="padding:4px 16px">${WEVID.map(([i,t,d,l,src])=>`<div class="ev"><span class="badge">${ic(i)}</span><div><b>${t}</b><p>${d}</p><span class="lvl ${LV[l][1]}">${LV[l][0]}</span> <span class="small muted">${src}</span></div></div>`).join('')}</div>
  <div class="sec"><h2>نصائح يومية</h2></div>
  <div class="card">
   <div class="ev"><span class="badge">${ic('target')}</span><div><b>«الحيلة» قبل السعال والرفع</b><p>شدّي قاع الحوض قبل السعال أو العطاس أو حمل الأطفال والأغراض.</p></div></div>
   <div class="ev"><span class="badge">${ic('drop')}</span><div><b>لا تقلّلي الماء خوفًا من التسرّب</b><p>البول المركّز يهيّج المثانة. وزّعي الماء على اليوم وقلّليه قبل النوم بساعتين.</p></div></div>
   <div class="ev"><span class="badge">${ic('leaf')}</span><div><b>تجنّبي الإمساك</b><p>الشدّ المتكرر عند الإخراج يُضعف قاع الحوض. ألياف وماء وحركة.</p></div></div></div>
  <div class="sec"><h2>تحذيرات مهمة</h2></div>
  <div class="warn"><b class="hrow">${ic('alert')} متى تراجعين الطبيبة؟</b>ثقل أو بروز في المهبل، ألم في الحوض أو أثناء العلاقة، دم في البول، حرقان وحرارة، أو تسرّب لا يتحسّن بعد 3 أشهر من التمارين.</div>
  <div class="warn"><b class="hrow">${ic('heart')} أثناء الحمل</b>التمارين آمنة ومفيدة عادةً، لكن استشيري طبيبتك أولًا إن كان حملك عالي الخطورة، وتجنّبي الاستلقاء على الظهر لفترات طويلة بعد منتصف الحمل.</div>
  <div class="sec"><h2>المراجع العلمية</h2></div>
  <div class="card srcs"><ol style="margin:0;padding-inline-start:18px">${WSRCS.map(([t,u])=>`<li><a href="${u}" target="_blank" rel="noopener">${t}</a></li>`).join('')}</ol></div>
  <p class="small muted center">معلومات تثقيفية مبنية على دراسات منشورة، ولا تغني عن استشارة الطبيبة.</p>`;
  $('#mC').onclick=()=>startSession('control');
  $('#mD').onclick=()=>startNext();
  app.querySelectorAll('[data-seg]').forEach(b=>b.onclick=()=>{ S.hseg=b.dataset.seg; save(); render(); });
}
/* مقياس إزعاج التسرّب الشهري (مقياس بسيط من التطبيق) */
const leakWeek=()=>S.bl.filter(x=>x.k==='leak'&&Date.now()-x.ts<7*864e5).length;
const leakDue=()=>!S.uiq.length||dayDiff(S.uiq[S.uiq.length-1].date,today())>=28;
function leakSheet(){
  modal(`<form id="lkF" aria-labelledby="lkFh"><h3 id="lkFh">مقياس التسرّب الشهري</h3><p class="small muted">خلال آخر 4 أسابيع، كم أزعجك تسرّب البول في حياتك اليومية؟ (0 = لا إطلاقًا، 10 = كثيرًا جدًا)</p>
    <fieldset class="radios scale"><legend class="visually-hidden">درجة الإزعاج</legend>${Array.from({length:11},(_,i)=>`<label><input type="radio" name="b" value="${i}" ${i===0?'required':''}> ${i}</label>`).join('')}</fieldset>
    <p class="small muted">تسرّب مسجّل في مذكرة المثانة آخر 7 أيام: <b>${leakWeek()}</b></p><p id="lkE" class="err small" role="alert"></p>
    <button type="submit" class="btn accent">حفظ</button></form>`,(m,close)=>{
    m.querySelector('#lkF').addEventListener('submit',e=>{ e.preventDefault(); const v=new FormData(e.target).get('b'); if(v===null){ m.querySelector('#lkE').textContent='اختاري درجة من 0 إلى 10'; return; }
      S.uiq.push({date:today(),s:+v,leaks:leakWeek()}); save(); reschedule(); close(); toast('سُجّلت النتيجة'); render(); }); });
}
function leakCard(){
  const q=S.uiq, last=q[q.length-1];
  return `<div class="card"><div class="row" style="justify-content:space-between"><h3 style="margin:0">مقياس التسرّب</h3>${last?`<span class="tagx">${last.s}/10</span>`:''}</div>
    ${q.length?lineChart(q.slice(-8).map(x=>({x:x.date.slice(5),v:x.s})),{min:0,max:10,label:'تطور إزعاج التسرّب'}):'<p class="small muted">سجّلي نقطة البداية الآن ثم كل شهر — انخفاض الرقم يعني تحسّنًا.</p>'}
    <p class="small muted" style="margin:6px 0 0">التسرّب آخر 7 أيام: ${leakWeek()} مرة (من مذكرة المثانة).</p>
    <button class="btn ${leakDue()?'accent':'ghost'}" id="lkGo" style="margin-top:8px">${leakDue()?ic('play')+'سجّلي نتيجة هذا الشهر':'القياس التالي بعد '+(28-dayDiff(last.date,today()))+' يومًا'}</button></div>`;
}
