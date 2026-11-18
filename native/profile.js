/* ============ الملف الصحي الاختياري (المرحلة الثانية) ============
   - كل الأسئلة اختيارية، وتُسأل مرة واحدة: الإجابة تُحفظ، و«أفضّل عدم الإجابة» تُحفظ أيضًا فلا يتكرر السؤال.
   - القيمة غير المعرّفة = لم يُسأل بعد. true/false = أجاب. 'na' = فضّل عدم الإجابة.
   - إخفاء قسم لا يحذف بياناته. */
const COND=[ // [المفتاح، النص، شرط الظهور]
  ['dm','السكري',()=>true],
  ['insulin','أستخدم الإنسولين أو حبوبًا قد تُنزل السكر بشدة',()=>profDm()],
  ['htn','ارتفاع ضغط الدم',()=>true],
  ['heart','مرض في القلب، أو ألم أو ضيق في الصدر مع الجهد',()=>true],
  ['ckd','مرض في الكلى',()=>true],
  ['retino','اعتلال الشبكية، أو جراحة عيون حديثة',()=>true],
  ['neuro','تنميل في القدمين، أو جرح أو قرحة في القدم',()=>true],
  ['pelvicPain','ألم مزمن في الحوض، أو ألم أثناء الجماع أو التمارين',()=>true],
  ['pelvicSurg','جراحة حديثة في الحوض أو البروستاتا، أو قسطرة بولية حاليًا',()=>true],
  ['hernia','فتق',()=>true],
  ['gout','النقرس',()=>true],
  ['warfarin','أستخدم دواء الوارفارين لمنع التجلط',()=>true]
];
const ALG=[['fish','السمك'],['shell','الروبيان والمحار'],['nuts','المكسرات'],['peanut','الفول السوداني'],['dairy','الحليب ومشتقاته (أو عدم تحمّل اللاكتوز)'],['gluten','القمح والجلوتين (السيلياك)'],['egg','البيض'],['sesame','السمسم'],['legumes','البقوليات']];
const STAGES=[['none','لا شيء مما يلي'],['preg','حامل'],['pp6','ولدتُ خلال آخر 6 أسابيع'],['pp','بعد الولادة (أكثر من 6 أسابيع)'],['meno','سن اليأس أو بعده']];
function defProf(){ return {age:null,c:{},a:{},aAsked:false,smoker:undefined,stage:undefined,consent:null,dismissed:false}; }
const P=()=>S.prof||(S.prof=defProf());
const profDm=()=>!!S.diabetes;
const has=k=>k==='dm'?!!S.diabetes:P().c[k]===true;            // لديه الحالة (بإقراره)
const asked=k=>k==='dm'?(P().c.dm!==undefined||S.onboarded):P().c[k]!==undefined;
const profDone=()=>P().consent&&COND.every(([k,,v])=>!v()||asked(k));
const htn=()=>has('htn');

// متطلبات كل ميزة من أسئلة: لا يُسأل إلا ما يلزمها وما لم يُسأل بعد
const NEED={
  kegel:['pelvicPain','pelvicSurg'],
  aerobic:['heart','htn','neuro','retino','insulin'],
  resist:['heart','htn','retino','hernia'],
  food:['ckd','gout','warfarin','__alg']
};
function missing(feature){ return NEED[feature].filter(k=>k==='__alg'?!P().aAsked:(COND.find(c=>c[0]===k)[2]()&&!asked(k))); }

// المصادر: لكل قاعدة مرجع حقيقي يدعمها
const SRC={
  colberg:['ADA — Physical Activity/Exercise and Diabetes (Colberg 2016، الجدول 5)','https://doi.org/10.2337/dc16-1728','إرشاد رسمي'],
  mayo:['Mayo Clinic — رفع الأثقال وضغط الدم','https://www.mymlc.com/health-information/faqs/w/weightlifting-bad-for-your-blood-pressure','مرجع طبي تثقيفي'],
  acsm:['ACSM — التمرين للوقاية من ارتفاع الضغط وعلاجه','https://acsm.org/exercise-for-the-prevention-and-treatment-of-hypertension/','إرشاد رسمي'],
  nice:['NICE NG210 — اضطرابات قاع الحوض','https://www.nice.org.uk/guidance/NG210/chapter/Recommendations','إرشاد رسمي'],
  vitk:['NIH ODS — فيتامين K والوارفارين','https://ods.od.nih.gov/factsheets/VitaminK-HealthProfessional/','مرجع رسمي'],
  nkf:['National Kidney Foundation — البوتاسيوم ومرض الكلى','https://www.kidney.org/atoz/content/potassium','مرجع رسمي'],
  acr:['American College of Rheumatology — إرشادات علاج النقرس 2020','https://doi.org/10.1002/acr.24180','إرشاد رسمي'],
  ada6:['ADA — Standards of Care 2026، القسم 6 (انخفاض السكر)','https://pmc.ncbi.nlm.nih.gov/articles/PMC12690178','إرشاد رسمي']
};
const srcLink=k=>{ const s=SRC[k]; return `<a href="${s[1]}" target="_blank" rel="noopener">${s[0]}</a>`; };

// قواعد السلامة للتمارين: [الميزة، الشرط، المستوى، النص، المصدر]
const EXRULES=[
  ['aerobic',()=>has('heart'),'stop','ذكرت مرضًا في القلب أو ألمًا في الصدر مع الجهد: احصل على إذن طبيبك قبل الرياضة الهوائية أو زيادة شدتها، وتوقف فورًا واتصل بالإسعاف إن ظهر ألم في الصدر.','colberg'],
  ['aerobic',()=>has('neuro'),'caution','مع تنميل القدمين أو جرح في القدم: تجنّب المشي والأنشطة التي تحمل وزن الجسم ما دام في القدم جرح لم يلتئم، وفضّل الدراجة الثابتة أو السباحة (إن لم يكن الجرح مفتوحًا)، وافحص قدميك بعد كل نشاط.','colberg'],
  ['aerobic',()=>has('retino'),'caution','مع اعتلال الشبكية أو جراحة عيون حديثة: تجنّب التمارين العنيفة والقفز وخفض الرأس تحت مستوى القلب وحبس النفس، واسأل طبيب العيون عن الشدة المناسبة.','colberg'],
  ['aerobic',()=>has('insulin'),'caution','مع الإنسولين أو الحبوب التي تُنزل السكر: قِس السكر قبل الرياضة؛ إن كان أقل من 90 ملغ/دل تناول 15–30 غرامًا من السكريات السريعة أولًا، واحمل معك سكرًا.','ada6'],
  ['aerobic',()=>has('htn'),'caution','مع ارتفاع الضغط: الرياضة الهوائية المعتدلة معظم أيام الأسبوع مفيدة لخفضه. لا تتمرن إن كانت قراءتك 180/110 أو أعلى، وراجع طبيبك.','acsm'],
  ['aerobic',()=>P().age>=65,'info','ابدأ بشدة خفيفة وزدها تدريجيًا، وأضف تمارين التوازن مرتين أسبوعيًا.','colberg'],
  ['resist',()=>has('htn'),'stop','لا ترفع أثقالًا إن كان ضغطك غير منضبط وأعلى من 180/110، واستشر طبيبك قبل البدء إن كان أعلى من 160/100. لا تحبس نفسك أثناء الرفع.','mayo'],
  ['resist',()=>has('heart'),'stop','مع مرض القلب: احصل على إذن طبيبك قبل تمارين المقاومة.','colberg'],
  ['resist',()=>has('retino'),'caution','مع اعتلال الشبكية: تجنّب الأوزان الثقيلة وحبس النفس.','colberg'],
  ['resist',()=>has('hernia'),'caution','مع الفتق: تجنّب الأوزان الثقيلة وشدّ البطن، واسأل طبيبك عن التمارين المناسبة.','colberg'],
  ['kegel',()=>has('pelvicPain'),'stop','ذكرت ألمًا مزمنًا في الحوض: قد تكون العضلات مشدودة أكثر من اللازم، وتمارين التقوية وحدها قد تزيد الألم. يُنصح بتقييم أخصائي علاج طبيعي لقاع الحوض قبل البدء، ولن يتقدم البرنامج تلقائيًا.','nice'],
  ['kegel',()=>has('pelvicSurg'),'stop','بعد جراحة حديثة في الحوض أو البروستاتا: لا تبدأ إلا بعد موافقة جرّاحك وإزالة القسطرة.','nice']
];
const exWarn=f=>EXRULES.filter(r=>r[0]===f&&r[1]());
function exWarnHTML(f){ const w=exWarn(f); if(!w.length) return '';
  return w.map(([,,lv,t,s])=>`<div class="${lv==='info'?'card small':'warn small'} exw">${t}<span class="src">${ic('books')} ${srcLink(s)}</span></div>`).join(''); }

// قواعد الطعام: وسوم الوجبات وما يتعارض معها
const MEAL_TAGS={fish:['fish'],grains:['legumes','ckd'],avocado:['ckd'],veg:['warfarin','ckd'],leaf:['nuts','ckd'],citrus:['ckd']};
const MEAL_NOTE={
  ckd:['مع مرض الكلى: هذه الوجبة غنية بالبوتاسيوم أو الفوسفور. التزم بالكمية التي يحددها طبيبك أو أخصائي التغذية.','nkf'],
  warfarin:['مع الوارفارين: لا تمنع الخضار الورقية، لكن حافظ على كمية ثابتة منها كل أسبوع ولا تغيّرها فجأة لأنها تؤثر على مفعول الدواء.','vitk'],
  gout:['مع النقرس: اختر السلمون أو الهامور بدل السردين والماكريل والأنشوجة لأنها أغنى بالبيورين.','acr']
};
const MEAL_ALT=[['chicken','دجاج مشوي بلا جلد مع خضار','صدر دجاج مشوي أو مخبوز مع خضار وزيت زيتون.',[]],
  ['yogurt','زبادي قليل الدسم مع فاكهة','كوب زبادي مع حفنة توت أو فراولة.',['dairy']],
  ['eggs','بيض مع خضار','بيضتان مسلوقتان مع خيار وطماطم.',['egg']],
  ['veg2','خضار مشوية بزيت الزيتون','كوسا وباذنجان وفلفل مشوي بملعقة زيت زيتون بكر.',[]]];
function mealFor(m){ // يعيد الوجبة نفسها أو بديلًا آمنًا إن تعارضت مع حساسية
  const a=P().a, tags=MEAL_TAGS[m[0]]||[], conflict=tags.filter(t=>a[t]===true);
  if(m[0]==='fish'&&a.shell===true&&/روبيان|محار/.test(m[2])) conflict.push('shell');
  if(!conflict.length) return {m,notes:Object.keys(MEAL_NOTE).filter(k=>(tags.includes(k)||(k==='gout'&&m[0]==='fish'))&&has(k))};
  const alt=MEAL_ALT.find(([,,,t])=>!t.some(x=>a[x]===true))||MEAL_ALT[3];
  return {m:[alt[0]==='veg2'?'veg':'leaf',alt[1],alt[2],'بديل لأنك ذكرت حساسية من '+conflict.map(c=>(ALG.find(x=>x[0]===c)||[,c])[1]).join(' و')+'.'],notes:[],swapped:true};
}

// ورقة الأسئلة: تعرض فقط ما يلزم ولم يُسأل، وتحفظ كل إجابة
function profSheet(keys,opts){ opts=opts||{}; const p=P();
  const cks=keys.filter(k=>k!=='__alg'&&k!=='__age'&&k!=='__smoke'&&k!=='__stage');
  const wantAlg=keys.includes('__alg'), wantAge=keys.includes('__age'), wantSm=keys.includes('__smoke'), wantSt=keys.includes('__stage')&&isFem();
  modal(`<form id="pfF" novalidate aria-labelledby="pfH"><h3 id="pfH">${opts.title||'سؤال سريع قبل المتابعة'}</h3>
   <p class="small muted"><span>${opts.why||'نسألك لنتجنّب اقتراح ما قد لا يناسب حالتك.'}</span> <span>إجاباتك اختيارية، تبقى على جهازك فقط، ولن نسألك مرة أخرى. يمكنك تعديلها أو حذفها من الإعدادات.</span></p>
   ${wantAge?`<div class="field"><label for="pfA">عمرك</label><input id="pfA" type="number" inputmode="numeric" min="18" max="110" value="${p.age||''}" aria-describedby="pfAe"><span id="pfAe" class="err small" role="alert"></span></div>`:''}
   ${cks.length?`<fieldset class="chks"><legend>هل لديك أيٌّ مما يلي؟ اختر كل ما ينطبق</legend>${cks.map(k=>{ const c=COND.find(x=>x[0]===k); return `<label class="chk"><input type="checkbox" name="c" value="${k}" ${has(k)?'checked':''}> ${c[1]}</label>`; }).join('')}</fieldset>`:''}
   ${wantAlg?`<fieldset class="chks"><legend>حساسية أو أطعمة لا تتناولها</legend>${ALG.map(([k,n])=>`<label class="chk"><input type="checkbox" name="a" value="${k}" ${p.a[k]?'checked':''}> ${n}</label>`).join('')}</fieldset>`:''}
   ${wantSm?`<fieldset class="radios seg2"><legend>هل تدخّن؟</legend><label><input type="radio" name="sm" value="1" ${p.smoker===true?'checked':''}> نعم</label><label><input type="radio" name="sm" value="0" ${p.smoker===false?'checked':''}> لا</label></fieldset>`:''}
   ${wantSt?`<fieldset class="radios"><legend>مرحلتك الحالية</legend>${STAGES.map(([k,n])=>`<label><input type="radio" name="st" value="${k}" ${p.stage===k?'checked':''}> ${n}</label>`).join('')}</fieldset>`:''}
   <button type="submit" class="btn accent">${opts.ok||'حفظ والمتابعة'}</button><div style="height:8px"></div>
   <button type="button" class="btn ghost" id="pfNa">أفضّل عدم الإجابة</button></form>`,(m,close)=>{
    const f=m.querySelector('#pfF');
    // «السكري» يُظهر سؤال الإنسولين مباشرة
    f.addEventListener('submit',e=>{ e.preventDefault();
      if(wantAge){ const v=m.querySelector('#pfA').value; if(v){ const n=+v; if(!(n>=1&&n<=110)){ m.querySelector('#pfAe').textContent='أدخل عمرًا صحيحًا'; return; } p.age=n; } }
      const on=new Set([...f.querySelectorAll('input[name=c]:checked')].map(x=>x.value));
      cks.forEach(k=>{ if(k==='dm'){ S.diabetes=on.has('dm'); p.c.dm=S.diabetes; } else p.c[k]=on.has(k); });
      if(on.has('dm')&&!asked('insulin')&&!cks.includes('insulin')) p.c.insulin=undefined;
      if(wantAlg){ const as=new Set([...f.querySelectorAll('input[name=a]:checked')].map(x=>x.value)); ALG.forEach(([k])=>p.a[k]=as.has(k)); p.aAsked=true; }
      if(wantSm){ const r=f.querySelector('input[name=sm]:checked'); if(r){ p.smoker=r.value==='1'; if(!p.smoker&&!S.smokeManual) S.smoke.on=false; if(p.smoker) S.smoke.on=true; } }
      if(wantSt){ const r=f.querySelector('input[name=st]:checked'); if(r) p.stage=r.value; }
      afterProf(); close(); opts.then&&opts.then(); });
    m.querySelector('#pfNa').onclick=()=>{ cks.forEach(k=>{ if(k!=='dm'&&p.c[k]===undefined) p.c[k]='na'; }); if(wantAlg) p.aAsked=true; if(wantSm&&p.smoker===undefined) p.smoker='na'; if(wantSt&&p.stage===undefined) p.stage='na';
      afterProf(); close(); opts.then&&opts.then(); };
  });
}
function afterProf(){ const p=P(); p.consent=p.consent||today();
  if(has('pelvicPain')||has('pelvicSurg')) S.warned=true;
  if(has('ckd')&&!p.ckdWaterSet){ p.ckdWaterSet=true; S.water.on=false; }
  save(); reschedule(); }
// يطلب الأسئلة الناقصة لميزة ثم يكمل؛ إن لم ينقص شيء يكمل مباشرة
function ensureAsked(feature,then,title,why){ const miss=missing(feature); if(!miss.length){ then&&then(); return; }
  profSheet(miss,{title,why,then}); }
function profAll(){ const keys=['__age',...COND.filter(([,,v])=>v()).map(c=>c[0]),'__alg','__smoke','__stage'];
  profSheet(keys,{title:'ملفك الصحي',why:'يساعدنا على تخصيص التمارين والغذاء والتنبيهات، وإخفاء ما لا يخصّك.',ok:'حفظ',then:()=>{ P().dismissed=true; save(); render(); }}); }
function profSummary(){ const p=P(), cs=COND.filter(([k])=>has(k)).map(c=>c[1].split('،')[0]), al=ALG.filter(([k])=>p.a[k]===true).map(a=>a[1].split(' (')[0]);
  const en=LANG==='en', j=en?', ':'، ';
  return [p.age?(en?'Age: ':'العمر: ')+p.age:'',cs.length?(en?'Conditions: ':'الحالات: ')+cs.map(T).join(j):'',al.length?(en?'Allergies: ':'الحساسية: ')+al.map(T).join(j):'',p.smoker===true?T('مدخّن'):''].filter(Boolean); }
function profCard(){ if(profDone()||P().dismissed||!S.onboarded) return '';
  return `<div class="card pfc"><div class="hrow" style="gap:10px"><span class="ic-badge" style="margin:0">${ic('user')}</span><div style="flex:1"><b>أكمل ملفك الصحي (دقيقة)</b><p class="small muted" style="margin:2px 0 0">العمر والحالات والحساسية — لنخصّص لك التمارين والغذاء ونخفي ما لا يخصّك.</p></div></div>
   <div class="btnrow" style="margin-top:10px"><button class="btn accent sm" id="pfGo">ابدأ</button><button class="btn ghost sm" id="pfLater">لاحقًا</button></div></div>`; }
function bindProfCard(){ const g=$('#pfGo'); if(g) g.onclick=profAll; const l=$('#pfLater'); if(l) l.onclick=()=>{ P().dismissed=true; save(); render(); }; }
function profClear(){ modal(`<h3>حذف الملف الصحي؟</h3><p class="small muted">يُحذف العمر والحالات والحساسية فقط. تبقى قراءاتك وجلساتك كما هي، وقسم السكري يبقى حسب إعداده.</p><div class="btnrow"><button class="btn danger" id="pcY">حذف</button><button class="btn ghost" id="pcN">إلغاء</button></div>`,(m,close)=>{
  m.querySelector('#pcN').onclick=close; m.querySelector('#pcY').onclick=()=>{ S.prof=defProf(); S.prof.dismissed=true; save(); close(); toast('حُذف الملف الصحي'); render(); }; }); }
function bpCard(){ return `<div class="card"><h3>قياس الضغط في البيت بالطريقة الصحيحة</h3><ol class="small" style="margin:0;padding-inline-start:18px;line-height:1.9">
    <li>لا قهوة ولا تدخين ولا رياضة قبل القياس بـ30 دقيقة، وأفرغ المثانة.</li><li>اجلس مستندًا وقدماك على الأرض، واسترح 5 دقائق بصمت.</li>
    <li>الذراع مسنودة بمستوى القلب، والكمّ على الجلد مباشرة.</li><li>خذ قراءتين بينهما دقيقة، صباحًا ومساءً، وسجّل المتوسط.</li></ol>
    <p class="small muted" style="margin:6px 0 0">${S.diabetes?'الهدف لأغلب مرضى السكري أقل من 130/80 حسب ADA. ':'هدفك يحدده طبيبك. '}${ic('alert')} 180/120 أو أعلى مع ألم صدر أو ضيق نفس: اتصل بالإسعاف ${emerg()}.</p></div>`; }
