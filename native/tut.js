/* ============ التدريب التعليمي: تعلّم الشد الصحيح ============
   1) الأخطاء الشائعة  2) الوضعية وشدة 3 من 10 ويد على الأرداف  3) مختبر الإشارات (يجرّب المستخدم عدة طرق ويحفظ الأنسب له)
   4) تمرين موجّه: شهيق ← زفير مع شد خفيف والعدّ بصوت ← إفلات، مع حسّاس اختياري يكشف حبس النفس  5) فحص ذاتي وتغذية راجعة.
   الإشارة الناجحة تُستخدم بعدها في كل الجلسات. */
const TUT_SRC=[
  ['Stafford RE et al. Neurourol Urodyn 2016 — أثر التعليمات اللفظية على عضلات قاع الحوض لدى الرجال','https://pubmed.ncbi.nlm.nih.gov/25727781/'],
  ['Ben Ami N et al. IJERPH 2022 — مقارنة ست تعليمات لفظية لدى الرجال','https://www.mdpi.com/1660-4601/19/19/12031'],
  ['POGP (جمعية العلاج الطبيعي البريطانية لصحة الحوض) — تمارين قاع الحوض للرجال','https://thepogp.co.uk/_userfiles/pages/files/POGP-PelvicFloorMen(UL).pdf'],
  ['Continence Foundation of Australia — قاع الحوض لدى الرجال','https://continence.org.au/news/male-pelvic-floor-what-you-need-know'],
  ['Squeezy (تطبيق معتمد من NHS) — كيف تجد عضلات قاع الحوض','https://squeezyapp.com/articles/how-to-find-your-pelvic-floor/']
];
// [المعرّف، العنوان، الطريقة، كيف تعرف أنك نجحت، اختصار يُقال أثناء الجلسة]
const TCUES_M=[
  ['penis','قصّر القضيب','تخيّل أنك تسحب القضيب للداخل نحو جسمك، كأنك تقصّره قليلًا. حركة صغيرة جدًا.','تشعر بشد خفيف عند قاعدة القضيب، والأرداف ساكنة.','اسحب القضيب للداخل'],
  ['wave','موجة البحر الباردة','تخيّل أنك تمشي في بحر بارد وموجة قادمة، فترفع الخصيتين للأعلى بعيدًا عن الماء.','تشعر بالخصيتين ترتفعان قليلًا.','ارفع الخصيتين بعيدًا عن الموجة'],
  ['gas','منع الغازات بهدوء','تخيّل أنك في مصعد مزدحم وتمنع خروج غازات — بهدوء ودون أن يلاحظ أحد.','تشعر بانقباض حول فتحة الشرج يرتفع للداخل، وليس بانقباض الأرداف.','امنع الغازات بهدوء'],
  ['marble','التقاط حبة صغيرة','تخيّل أنك تجلس على حبة صغيرة (حبة عنب) وتلتقطها بعضلات الحوض وترفعها للداخل.','إحساس بالرفع للأعلى من منطقة ما بين الخصيتين والشرج.','التقط الحبة وارفعها'],
  ['urine','إيقاف البول (للتعرّف فقط)','في نهاية التبول جرّب إيقاف التدفق مرة واحدة لتتعرف على العضلة، ثم أكمل التبول. لا تكررها كتمرين لأنها قد تمنع إفراغ المثانة كاملًا.','يتوقف التدفق أو يبطؤ.','أوقف البول (تخيّلًا)']
];
const TCUES_F=[
  ['gaswee','منع الغازات والبول معًا','شدّي من الخلف إلى الأمام: كأنك تمنعين الغازات ثم البول، ثم ارفعي للداخل.','إحساس بانقباض يمتد من الخلف للأمام ويرتفع للداخل.','امنعي الغازات والبول وارفعي'],
  ['marble','التقاط حبة صغيرة','تخيّلي أنك تجلسين على حبة عنب وتلتقطينها بالمهبل وترفعينها للداخل.','إحساس بالرفع للأعلى، والأرداف ساكنة.','التقطي الحبة وارفعيها'],
  ['tissue','سحب منديل','تخيّلي أنك تسحبين منديلًا من علبته ببطء للأعلى والداخل.','حركة ناعمة للأعلى، دون دفع للأسفل.','اسحبي المنديل للأعلى'],
  ['urine','إيقاف البول (للتعرّف فقط)','في نهاية التبول جرّبي إيقاف التدفق مرة واحدة لتتعرفي على العضلة. لا تكرريها كتمرين.','يتوقف التدفق أو يبطؤ.','أوقفي البول (تخيّلًا)']
];
const tutCues=()=>isFem()?TCUES_F:TCUES_M;
const TUT=()=>S.tut||(S.tut={cue:null,rate:{},rounds:0,good:0,passed:false,issues:{},at:null,dismissed:false});
function tutCueHint(){ const t=S.tut; if(!t||!t.cue) return null; const c=tutCues().find(x=>x[0]===t.cue); if(!c) return null;
  const add=[]; if(t.issues.glute) add.push('الأرداف مرتخية'); if(t.issues.breath) add.push('عدّ بصوت'); if(t.issues.glute||t.issues.belly) add.push('شدة 3 من 10');
  return c[4]+(add.length?' — '+add.join(' · '):''); }

// ---------- الرسومات ----------
const SLING_REL="M40 70 Q150 150 260 70", SLING_UP="M40 70 Q150 96 260 70";
const SVG_SLING=`<svg class="tsling" viewBox="0 0 300 175" role="img" aria-label="عضلات قاع الحوض ترتفع مع الشد وتنزل مع الإفلات"><title>عضلات قاع الحوض كالأرجوحة</title>
 <path d="M30 40 C40 120,90 160,150 160 C210 160,260 120,270 40" fill="none" stroke="var(--line)" stroke-width="14" stroke-linecap="round"/>
 <text x="24" y="28" class="tlbl">عظم العانة</text><text x="276" y="28" text-anchor="end" class="tlbl">العصعص</text>
 <path class="tsl-p" d="${SLING_REL}" fill="none" stroke="var(--accent)" stroke-width="12" stroke-linecap="round"/>
 <circle class="tsl-b" cx="150" cy="108" r="9"/>
 <g class="tarr"><path d="M150 82 V50" stroke="var(--accent)" stroke-width="4" stroke-linecap="round"/><path d="M140 60 L150 48 L160 60" fill="none" stroke="var(--accent)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></g>
 <text class="tsl-t1" x="150" y="172" text-anchor="middle">شدّ: ترتفع للداخل</text><text class="tsl-t2" x="150" y="172" text-anchor="middle">أفلت: تنزل وترتخي</text>
</svg>`;
const SVG_MISTAKES=`<div class="tmist">
 <figure><svg viewBox="0 0 80 80" aria-hidden="true"><path d="M14 30 Q14 64 40 64 Q66 64 66 30" fill="var(--heartSoft)" stroke="var(--heart)" stroke-width="3"/><path d="M40 30 V62" stroke="var(--heart)" stroke-width="3"/><path d="M22 40 Q28 34 34 40M46 40 Q52 34 58 40" stroke="var(--heart)" stroke-width="3" fill="none"/><path class="tstrike" d="M10 14 L70 70" stroke="var(--heart)" stroke-width="5" stroke-linecap="round"/></svg><figcaption>شدّ الأرداف</figcaption></figure>
 <figure><svg viewBox="0 0 80 80" aria-hidden="true"><path d="M40 12 V30M40 30 C26 30 16 40 16 56 C16 66 26 68 32 62 C38 56 40 44 40 30 C40 44 42 56 48 62 C54 68 64 66 64 56 C64 40 54 30 40 30" fill="var(--waterSoft)" stroke="var(--water)" stroke-width="3"/><rect x="24" y="4" width="32" height="10" rx="5" fill="var(--heart)"/><path class="tstrike" d="M10 14 L70 70" stroke="var(--heart)" stroke-width="5" stroke-linecap="round"/></svg><figcaption>حبس النفس</figcaption></figure>
 <figure><svg viewBox="0 0 80 80" aria-hidden="true"><ellipse cx="40" cy="44" rx="24" ry="22" fill="var(--smokeSoft)" stroke="var(--smoke)" stroke-width="3"/><path d="M40 52 V72M32 64 L40 74 L48 64" stroke="var(--heart)" stroke-width="4" fill="none" stroke-linecap="round"/><path class="tstrike" d="M10 14 L70 70" stroke="var(--heart)" stroke-width="5" stroke-linecap="round"/></svg><figcaption>الدفع للأسفل بالبطن</figcaption></figure></div>`;
const SVG_EFFORT=`<svg class="teff" viewBox="0 0 300 74" role="img" aria-label="شدة الشد: 3 من 10"><title>الشدة المطلوبة 3 من 10</title>
 ${Array.from({length:10},(_,i)=>`<rect x="${8+i*29}" y="${34-i*2.6}" width="22" height="${18+i*2.6}" rx="5" fill="var(--line)"/>${i<3?`<rect class="teb" style="--i:${i}" x="${8+i*29}" y="${34-i*2.6}" width="22" height="${18+i*2.6}" rx="5" fill="var(--accent)"/>`:''}`).join('')}
 <text x="8" y="70" class="tlbl">خفيف</text><text x="80" y="18" text-anchor="middle" class="tlbl tacc">هنا</text><text x="292" y="70" text-anchor="end" class="tlbl">أقصى قوة</text></svg>`;
const BR_D="M10 70 C40 70 50 20 80 20 C110 20 120 70 150 70 C180 70 190 20 220 20 C250 20 260 70 290 70";
const SVG_BREATH=`<svg class="tbr" viewBox="0 0 300 96" role="img" aria-label="الشد مع الزفير"><title>شهيق للاسترخاء، وزفير مع الشد</title>
 <rect class="tbz tbz1" x="80" y="10" width="70" height="70" rx="10" fill="var(--accent)"/><rect class="tbz tbz2" x="220" y="10" width="70" height="70" rx="10" fill="var(--accent)"/>
 <path d="${BR_D}" fill="none" stroke="var(--water)" stroke-width="4" stroke-linecap="round"/>
 <circle class="tbr-dot" r="8" style="offset-path:path('${BR_D}')"/>
 <text x="45" y="92" text-anchor="middle" class="tlbl">شهيق: أرخِ</text><text x="115" y="92" text-anchor="middle" class="tlbl tacc">زفير: اشدّ</text><text x="185" y="92" text-anchor="middle" class="tlbl">شهيق: أفلت</text><text x="255" y="92" text-anchor="middle" class="tlbl tacc">زفير: اشدّ</text></svg>`;
const SVG_HAND=`<svg class="thand" viewBox="0 0 220 130" role="img" aria-label="اليد على الأرداف: يجب أن تبقى ليّنة"><title>فحص الأرداف باليد</title>
 <g transform="translate(55 64)"><circle r="56" fill="var(--accentSoft)"/>
  <g class="tglute"><path d="M-30 -14 Q-30 28 0 28 Q30 28 30 -14" fill="var(--card)" stroke="var(--muted)" stroke-width="3"/><path d="M0 -14 V26" stroke="var(--muted)" stroke-width="2"/>
   <path class="tg-tense" d="M-22 -2 Q-15 -9 -8 -2M8 -2 Q15 -9 22 -2" stroke="var(--heart)" stroke-width="3" fill="none"/></g>
  <path d="M10 -24 l6 26 M18 -26 l6 26 M26 -24 l5 24 M34 -18 l3 20 M6 -12 q-8 6 -2 16 l14 14 q10 8 22 -2" fill="none" stroke="var(--accent)" stroke-width="4" stroke-linecap="round"/></g>
 <g class="th-ok"><circle cx="160" cy="48" r="16" fill="var(--accentSoft)"/><path d="M152 48 l6 6 l11 -12" fill="none" stroke="var(--accent)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><text x="160" y="90" text-anchor="middle" class="tlbl">صحيح: ليّنة</text></g>
 <g class="th-bad"><circle cx="160" cy="48" r="16" fill="var(--heartSoft)"/><path d="M160 39 v11 M160 57 v1" stroke="var(--heart)" stroke-width="4" stroke-linecap="round"/><text x="160" y="90" text-anchor="middle" class="tlbl">خطأ: متصلبة</text></g></svg>`;

// ---------- حسّاس الجوال لكشف حبس النفس (تجريبي) ----------
const BreathSensor={on:false,buf:[],h:null,ok:false,
  start(){ this.buf=[]; this.ok=false; this.h=e=>{ const g=e.accelerationIncludingGravity; if(!g||g.z==null) return; const p=Math.atan2(g.y||0,g.z)*57.3; this.buf.push([performance.now(),p]); this.ok=true; if(this.buf.length>3000) this.buf.splice(0,1000); };
    try{ if(typeof DeviceMotionEvent!=='undefined'&&DeviceMotionEvent.requestPermission) DeviceMotionEvent.requestPermission().catch(()=>{}); }catch(e){}
    window.addEventListener('devicemotion',this.h); this.on=true; },
  stop(){ if(this.h) window.removeEventListener('devicemotion',this.h); this.on=false; },
  std(t0,t1){ const v=this.buf.filter(([t])=>t>=t0&&t<t1).map(x=>x[1]); if(v.length<8) return null; const m=v.reduce((a,b)=>a+b,0)/v.length; return Math.sqrt(v.reduce((a,b)=>a+(b-m)*(b-m),0)/v.length); }
};

// ---------- الواجهة ----------
let TU=null; // حالة التمرين الموجّه
function tutorial(startPage){
  const t=TUT(); let page=startPage||0; const N=5;
  modal(`<div class="tut" id="tutB"></div>`,(m,close)=>{
    m.classList.add('tutm');
    m.addEventListener('close',()=>{ tutStop(); });
    const draw=()=>{ const B=m.querySelector('#tutB');
      const dots=`<div class="steps tsteps">${Array.from({length:N},(_,i)=>`<i class="${i<=page?'on':''}"></i>`).join('')}</div>`;
      let h='';
      if(page===0) h=`<h2>تعلّم الشد الصحيح</h2><p>عضلات قاع الحوض داخلية ولا تُرى، لذلك يخطئ كثيرون في البداية. الشد الصحيح صغير وخفي: سحب للداخل والأعلى، والأرداف والنفس والبطن مرتخية.</p>
        ${SVG_SLING.replace('class="tsling"','class="tsling demo"')}<p class="small muted center">العضلة كأرجوحة بين عظم العانة والعصعص — عند الشد ترتفع للأعلى، وعند الإفلات تنزل.</p>
        <h3>الأخطاء الثلاثة الأكثر شيوعًا</h3>${SVG_MISTAKES}
        <p class="small">في هذا التدريب نصلح الثلاثة خطوة بخطوة، ونجد معًا الطريقة التي تناسب جسمك.</p>`;
      else if(page===1) h=`<h2>الوضعية والشدة</h2>
        <div class="tstep"><b>1. استلقِ على ظهرك وركبتاك مثنيتان</b><p class="small muted">هذه أسهل وضعية للتعلّم لأن العضلة لا تحمل وزن الجسم. باعد ركبتيك بعرض الحوض.</p></div>
        <div class="tstep"><b>2. ضع يدك على أردافك</b>${SVG_HAND}<p class="small muted">يدك هي «جهاز الإنذار»: يجب أن تبقى الأرداف ليّنة طوال الشد. إن شعرت بها تتصلب فالشد أقوى من اللازم.</p></div>
        <div class="tstep"><b>3. الشدة: 3 من 10 فقط</b>${SVG_EFFORT}<p class="small muted">الشد القوي يستدعي الأرداف والبطن وحبس النفس. ابدأ خفيفًا جدًا — القوة تأتي لاحقًا.</p></div>`;
      else if(page===2){ const C=tutCues();
        h=`<h2>مختبر الإشارات</h2><p class="small">جرّب كل طريقة مرة أو مرتين (شد خفيف 3 ثوانٍ ثم إفلات)، ثم قيّمها. سنحفظ الطريقة التي شعرت بها أوضح، ونذكّرك بها في كل جلسة.</p>
        ${C.map(([id,ti,how,chk])=>{ const r=t.rate[id]; return `<div class="tcue ${t.cue===id?'best':''}"><div class="tcue-h"><b>${ti}</b>${t.cue===id?`<span class="tagx">الأنسب لك</span>`:''}</div><p class="small">${how}</p><p class="small muted">${ic('check')} ${chk}</p>
          <div class="trate" role="group" aria-label="${ti}"><button data-rt="${id}|2" class="${r===2?'on':''}">شعرت بها بوضوح</button><button data-rt="${id}|1" class="${r===1?'on':''}">قليلًا</button><button data-rt="${id}|0" class="${r===0?'on':''}">لم أشعر</button><button data-rt="${id}|-1" class="${r===-1?'on':''}">شددت الأرداف</button></div></div>`; }).join('')}
        <details class="tcheck"><summary>${ic('target')} طرق للتأكد أنك تشد العضلة الصحيحة</summary><div class="small">
          ${isFem()?`<p><b>المرآة:</b> بمرآة يد، يجب أن تري منطقة العجان (بين المهبل والشرج) ترتفع للداخل قليلًا.</p>`:`<p><b>المرآة:</b> قف جانبيًا أمام المرآة: يجب أن ترى قاعدة القضيب تنسحب للداخل والخصيتين ترتفعان قليلًا.</p>`}
          <p><b>اللمس:</b> ضع أصابعك على ${isFem()?'العجان (بين المهبل والشرج)':'المنطقة بين الخصيتين والشرج'}: يجب أن تشعر بها ترتفع للأعلى عند الشد، لا أن تبرز للأسفل.</p>
          <p><b>البطن:</b> ضع يدك فوق السرة: لا يجب أن يتصلب ما فوق السرة. شدّ خفيف أسفل البطن طبيعي.</p>
          <p><b>بعد التبول${isFem()?'':' (للرجال)'}:</b> ${isFem()?'شد العضلة يجب ألا يدفع شيئًا للأسفل.':'شدّة واحدة بعد انتهاء التبول تُخرج آخر قطرات البول — علامة أن العضلة الصحيحة تعمل.'}</p></div></details>`; }
      else if(page===3){ const c=tutCues().find(x=>x[0]===t.cue)||tutCues()[0];
        h=`<h2>تمرين موجّه</h2><p class="small"><span>3 تكرارات بالإشارة:</span> <b>${c[1]}</b></p><p class="small">اشدّ مع الزفير، وعدّ بصوت مسموع «واحد، اثنان، ثلاثة» — من يعدّ بصوت لا يستطيع حبس نفسه.</p>
        ${SVG_BREATH}${SVG_SLING}
        <div class="tprac"><div class="tring"><svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="52" fill="none" stroke="var(--ringBg)" stroke-width="8"/><circle id="tRing" cx="60" cy="60" r="52" fill="none" stroke="var(--accent)" stroke-width="8" stroke-linecap="round" stroke-dasharray="326.7" stroke-dashoffset="326.7" transform="rotate(-90 60 60)"/></svg><div><b id="tNum">—</b><span id="tRep"></span></div></div>
          <div class="tphase" id="tPh" role="status" aria-live="polite">جاهز؟</div><p class="small muted center" id="tHint">${c[2]}</p>
          <div id="tSensor" class="small center tsens"></div></div>
        <label class="chk"><input type="checkbox" id="tUseS"> ${ic('pulse')} استخدم الجوال لكشف حبس النفس (تجريبي): استلقِ وضع الجوال على بطنك أسفل السرة</label>
        <button class="btn accent" id="tGo">${ic('play')}ابدأ التمرين (45 ثانية)</button>`; }
      else if(page===4){ const q=TU&&TU.ans||{};
        h=`<h2>كيف كان؟</h2><p class="small">أجب بصدق — الهدف أن نعدّل الطريقة لا أن ننجح من أول مرة.</p>
        ${[['felt','شعرت بشد ورفع للداخل'],['glute','انقبضت الأرداف أو الفخذان'],['breath','حبست نفسي أو توقف صوتي أثناء العد'],['belly','تصلّب البطن أو شعرت بدفع للأسفل']].map(([k,n])=>`<div class="tq"><span>${n}</span><div class="trate"><button data-q="${k}|1" class="${q[k]===1?'on':''}">نعم</button><button data-q="${k}|0" class="${q[k]===0?'on':''}">لا</button></div></div>`).join('')}
        ${TU&&TU.sensed?`<div class="warn small">${ic('pulse')} الحسّاس لاحظ أن حركة تنفّسك توقفت أثناء الشد في ${TU.sensed} من 3 تكرارات.</div>`:''}
        <div id="tFb"></div>`; }
      B.innerHTML=dots+h+`<div class="btnrow tnav">${page>0?`<button class="btn ghost" id="tBack">السابق</button>`:''}${page<4?`<button class="btn ${page===3?'ghost':'accent'}" id="tNext">${page===3?'تخطَّ إلى التقييم':'التالي'}</button>`:`<button class="btn accent" id="tDone">إنهاء</button>`}</div>
        <details class="small srcs"><summary>المراجع</summary><ol>${TUT_SRC.map(([n,u])=>`<li><a href="${u}" target="_blank" rel="noopener">${n}</a></li>`).join('')}</ol></details>`;
      const on=(s,f)=>{ const e=B.querySelector(s); if(e) e.onclick=f; };
      on('#tBack',()=>{ tutStop(); page--; draw(); B.scrollIntoView&&m.querySelector('.sheet').scrollTo(0,0); });
      on('#tNext',()=>{ tutStop(); if(page===2&&!t.cue) t.cue=tutCues()[0][0]; page++; save(); draw(); m.querySelector('.sheet').scrollTo(0,0); });
      on('#tDone',()=>{ close(); render(); });
      B.querySelectorAll('[data-rt]').forEach(b=>b.onclick=()=>{ const [id,v]=b.dataset.rt.split('|'); t.rate[id]=+v; if(+v===-1) t.issues.glute=true;
        const best=Object.entries(t.rate).filter(([,r])=>r>0).sort((a,b)=>b[1]-a[1]); t.cue=best.length?best[0][0]:t.cue; save(); Haptic.light(); draw(); });
      on('#tGo',()=>tutPractice(m,()=>{ page=4; draw(); m.querySelector('.sheet').scrollTo(0,0); }));
      B.querySelectorAll('[data-q]').forEach(b=>b.onclick=()=>{ const [k,v]=b.dataset.q.split('|'); TU=TU||{}; TU.ans=TU.ans||{}; TU.ans[k]=+v; draw(); tutFeedback(B); });
      if(page===4) tutFeedback(B);
    };
    draw(); });
}
function tutStop(){ if(TU&&TU.timer){ clearInterval(TU.timer); TU.timer=null; } BreathSensor.stop(); }
function tutPractice(m,done){
  const c=tutCues().find(x=>x[0]===TUT().cue)||tutCues()[0], useS=m.querySelector('#tUseS')&&m.querySelector('#tUseS').checked;
  const R=[]; for(let i=1;i<=3;i++){ R.push(['in',4,i,'شهيق — أرخِ كل شيء']); R.push(['sq',3,i,c[4]]); R.push(['rl',8,i,'أفلت تمامًا — دع العضلة تنزل']); }
  R.unshift(['pre',useS?10:3,0,useS?'تنفّس بهدوء — نقيس حركة تنفّسك':'استعد']);
  TU={i:0,t0:performance.now(),timer:null,ans:{},sensed:0,base:null,phT:{}}; if(useS) BreathSensor.start();
  const $m=s=>m.querySelector(s), ring=$m('#tRing'), C=326.7;
  m.querySelector('#tGo').disabled=true; m.querySelector('#tGo').style.opacity=.5;
  const enter=()=>{ const [ph,d,rep,txt]=R[TU.i]; TU.phT[TU.i]=performance.now();
    $m('#tPh').textContent=T({pre:'استعد',in:'شهيق',sq:'ازفر واشدّ — عدّ بصوت',rl:'أفلت'}[ph]); $m('#tHint').textContent=T(txt);
    $m('#tRep').textContent=rep?T('تكرار '+rep+' من 3'):''; const sl=m.querySelector('.tsling'); if(sl){ sl.classList.toggle('up',ph==='sq'); sl.classList.toggle('rel',ph==='rl'); }
    speak(ph==='sq'?txt+'. واحد':ph==='in'?'شهيق':ph==='rl'?'أفلت':txt); if(ph==='sq') Haptic.double(); };
  enter();
  const me=TU; TU.timer=setInterval(()=>{ if(TU!==me||!R[me.i]){ clearInterval(me.timer); return; } const [ph,d]=R[TU.i], el=(performance.now()-TU.phT[TU.i])/1000;
    ring.style.strokeDashoffset=C*(1-Math.min(1,el/d)); $m('#tNum').textContent=ph==='sq'?String(Math.min(3,Math.floor(el)+1)):Math.max(0,Math.ceil(d-el));
    if(ph==='sq'&&!TU['n'+TU.i+Math.floor(el)]&&Math.floor(el)>0&&el<d){ TU['n'+TU.i+Math.floor(el)]=1; speak(['','اثنان','ثلاثة'][Math.floor(el)]||''); }
    if(el>=d){
      if(useS&&BreathSensor.ok){ const t0=TU.phT[TU.i], t1=performance.now();
        if(ph==='pre'||ph==='in'){ const s=BreathSensor.std(t0+500,t1); if(s!=null) TU.base=TU.base==null?s:(TU.base*0.6+s*0.4); }
        if(ph==='sq'&&TU.base&&TU.base>0.08){ const s=BreathSensor.std(t0+300,t1); if(s!=null&&s<TU.base*0.3){ TU.sensed++; $m('#tSensor').innerHTML=`<span class="warnc">${ic('alert')} ${T('يبدو أن نفسك توقف — عدّ بصوت أعلى')}</span>`; speak('لا تحبس نفسك'); } else $m('#tSensor').innerHTML=`<span class="okc">${ic('checkCircle')} ${T('تنفّسك مستمر — ممتاز')}</span>`; }
        if(ph==='pre'&&!(TU.base>0.08)) $m('#tSensor').textContent=T('لم يلتقط الحسّاس حركة تنفّس كافية — أكمل بدونه');
      } else if(useS&&ph==='pre') $m('#tSensor').textContent=T('الحسّاس غير متاح على هذا الجهاز — أكمل بدونه');
      TU.i++; if(TU.i>=R.length){ tutStop(); TU.ans={breath:TU.sensed?1:undefined}; const t=TUT(); t.rounds++; t.at=today(); save(); SFX.done(); done(); return; } enter(); }
  },100);
}
function tutFeedback(B){ const q=(TU&&TU.ans)||{}, t=TUT(), fb=B.querySelector('#tFb'); if(!fb) return;
  if(['felt','glute','breath','belly'].some(k=>q[k]===undefined)){ fb.innerHTML=''; return; }
  t.issues={glute:q.glute===1,breath:q.breath===1,belly:q.belly===1};
  const tips=[];
  if(q.glute) tips.push(['الأرداف','خفّف الشدة إلى 2 من 10 — الحركة الصحيحة صغيرة لا يراها أحد. باعد ركبتيك قليلًا، وأبقِ يدك على الأرداف: إن تصلبت توقف وابدأ أخف.']);
  if(q.breath) tips.push(['النفس','عدّ بصوت مسموع طوال الشد؛ إن توقف صوتك فأنت حابس نفسك. أو أطلق صوت «سسس» طويلًا وأنت تشد — الشد يكون على الزفير.']);
  if(q.belly) tips.push(['البطن','إن شعرت بدفع للأسفل فهذا عكس المطلوب. فكّر في «سحب للداخل والأعلى» لا «ضغط». جرّب إشارة أخرى من المختبر، وتجنّب تخيّل «رفع المثانة» لأنه يشد البطن.']);
  if(!q.felt) tips.push(['لم تشعر بها','جرّب إشارة أخرى من مختبر الإشارات، أو استخدم المرآة أو اللمس للتأكد. الاستلقاء أسهل من الجلوس.']);
  const ok=q.felt&&!q.glute&&!q.breath&&!q.belly;
  // الجولة تُحتسب مرة واحدة حتى لو غيّر المستخدم إجابته
  if(ok&&!TU.counted){ t.good++; TU.counted=true; } else if(!ok&&TU.counted){ t.good=Math.max(0,t.good-1); TU.counted=false; }
  if(t.good>=2) t.passed=true;
  const struggle=t.rounds>=3&&t.good===0;
  save();
  fb.innerHTML=ok?`<div class="card tok"><b class="hrow">${ic('checkCircle')} ${t.passed?'أتقنت الشد الصحيح':'ممتاز — شد صحيح'}</b><p class="small">${t.passed?'سنذكّرك بإشارتك في كل جلسة. حافظ على الشد الخفيف والعدّ بصوت.':'أعد التمرين مرة أخرى للتثبيت — مرتان ناجحتان تكفيان.'}</p>${t.passed?'':`<button class="btn accent sm" id="tAgain">${ic('repeat')}مرة أخرى</button>`}</div>`
    :`${tips.map(([h,p])=>`<div class="card tfix"><b>${h}</b><p class="small">${p}</p></div>`).join('')}
     ${struggle?`<div class="warn small">جرّبت ${t.rounds} مرات دون أن تشعر بالشد الصحيح. هذا شائع، والحل الأفضل جلسة مع أخصائي علاج طبيعي لقاع الحوض: يستخدم الموجات فوق الصوتية أو جهاز «البيوفيدباك» ليريك العضلة وهي تعمل على الشاشة.</div>`:''}
     <div class="btnrow"><button class="btn accent sm" id="tAgain">${ic('repeat')}أعد التمرين</button><button class="btn ghost sm" id="tLab">مختبر الإشارات</button></div>`;
  const a=fb.querySelector('#tAgain'); if(a) a.onclick=()=>{ document.querySelectorAll('dialog').forEach(d=>d.close()); tutorial(3); };
  const l=fb.querySelector('#tLab'); if(l) l.onclick=()=>{ document.querySelectorAll('dialog').forEach(d=>d.close()); tutorial(2); };
}
function tutCard(){ const t=S.tut; if(t&&(t.passed||t.dismissed)) return ''; if(!S.onboarded) return '';
  return `<div class="card tcard"><div class="hrow" style="gap:12px"><span class="ic-badge" style="margin:0">${ic('target')}</span><div style="flex:1"><b>هل تشدّ العضلة الصحيحة؟</b><p class="small muted" style="margin:2px 0 0">تدريب تفاعلي 3 دقائق: تجد الطريقة التي تناسبك، وتتخلّص من شدّ الأرداف وحبس النفس.</p></div></div>
   <div class="btnrow" style="margin-top:10px"><button class="btn accent sm" id="tutGo">ابدأ التدريب</button><button class="btn ghost sm" id="tutLater">أتقنته</button></div></div>`; }
function bindTutCard(){ const g=$('#tutGo'); if(g) g.onclick=()=>tutorial(0); const l=$('#tutLater'); if(l) l.onclick=()=>{ TUT().dismissed=true; save(); render(); }; }
