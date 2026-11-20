"""اختبارات إصلاحات المراجعة (Gemini 1 و2). التشغيل مثل tests/phase1.py"""
import asyncio, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from phase1 import check, results, async_playwright, page  # noqa

BASE = {'onboarded': True, 'v': 3, 'startDate': '2026-11-01', 'logs': [], 'progDay': 10, 'lang': 'ar', 'diabetes': False,
        'tut': {'passed': True}, 'prof': {'age': 40, 'c': {}, 'a': {}, 'aAsked': True, 'consent': '2026-11-01'}}

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await page(b, BASE)

        # 1) الوجبات والحساسية
        r = await pg.evaluate("(P().a={egg:true},mealFor(MEALS[2]).m[2])")
        check('وجبات: الأفوكادو بلا بيض لمن يتحسس من البيض', 'البيض' not in r and 'السلطة' in r, r)
        r = await pg.evaluate("(P().a={dairy:true},mealFor(MEALS[6]).m[2])")
        check('وجبات: الفاكهة بلا زبادي لمن يتحسس من الحليب', 'زبادي' not in r and 'مكسرات' in r, r)
        r = await pg.evaluate("(P().a={nuts:true},mealFor(MEALS[6]).m[2])")
        check('وجبات: الفاكهة بلا مكسرات لمن يتحسس منها', 'مكسرات' not in r and 'زبادي' in r, r)
        r = await pg.evaluate("(P().a={dairy:true,peanut:true},mealFor(MEALS[6]).m[2])")
        check('وجبات: بلا زبادي ولا مكسرات', 'زبادي' not in r and 'مكسرات' not in r, r)
        r = await pg.evaluate("(P().a={nuts:true},P().c={ckd:true},mealFor(MEALS[5]))")
        check('وجبات: البديل يحتفظ بملاحظة الكلى', r.get('swapped') and 'ckd' in r['notes'], r)
        await pg.evaluate("P().a={};P().c={}")

        # 2) قرار التقدّم: جلسة صعبة في اليوم تُسقطه
        r = await pg.evaluate("""(()=>{ const d=k=>addDays(today(),-k); S.suggestAdvance=false;
          S.logs=[0,1,2,3,4,5,6].flatMap(k=>[1,2,3].map(j=>({kind:'daily',date:d(k),rating:k<3?(j===1?'hard':'easy'):'ok',ts:j})));
          evalAdvance(); const a=S.suggestAdvance;
          S.logs=[0,1,2,3,4,5,6].flatMap(k=>[1,2,3].map(j=>({kind:'daily',date:d(k),rating:k<3?'easy':'ok',ts:j})));
          evalAdvance(); const b=S.suggestAdvance; S.logs=[]; S.suggestAdvance=false; return [a,b]; })()""")
        check('التقدّم: «صعبة» ثم «سهلة» في نفس اليوم لا تقترح التقدّم', r == [False, True], r)

        # 4) الماء لمن ينام صباحًا
        r = await pg.evaluate("(S.water={...S.water,on:true,from:'08:00',to:'22:00',every:120},S.nightLess=true,S.bed='06:30',waterSlots().length)")
        check('الماء: نوم 06:30 لا يلغي التذكيرات', r > 3, r)
        r = await pg.evaluate("(S.bed='23:30',waterSlots().map(hm).pop())")
        check('الماء: نوم 23:30 يوقفها قبله بساعتين', r <= '21:30', r)

        # 5) أوقات التذكير الذكية: جلسة الظهر لا تُحسب صباحية
        r = await pg.evaluate("""(()=>{ S.reminders=['07:00','13:00','21:00']; S.progDay=10; const L=[];
          const n=planFor(S.progDay).n, late=n===2?'20:30':'13:10', want=n===2?2:1;
          for(let k=1;k<=6;k++){ const d=addDays(today(),-k); L.push({kind:'daily',date:d,ts:new Date(d+'T'+late).getTime()}); }
          S.logs=L; const s=learnedSlots(); S.logs=[]; return [s[0].length,s[want].length]; })()""")
        check('التذكير الذكي: الجلسة تُنسب لأقرب موعد لا لترتيبها', r == [0, 6], r)

        # 7) breathDays لا يستخدم Set ككائن
        r = await pg.evaluate("""(()=>{ const d=today(); S.logs=[{kind:'breath',date:d,dur:200},{kind:'breath',date:d,dur:200}]; const n=breathDays(d,d); S.logs=[]; return n; })()""")
        check('التنفس: يجمع مدة اليوم بشكل صحيح', r == 1, r)

        # 12) الحامل: وضعية الجنب بدل الظهر
        r = await pg.evaluate("(S.sex='f',P().stage='preg',posFor(1))")
        check('الحامل: لا استلقاء على الظهر', 'lie' not in r and 'side' in r, r)
        await pg.evaluate("P().stage='none';S.sex='m'")

        # 13) السكر قبل الرياضة حسب العلاج
        r = await pg.evaluate("(S.diabetes=true,P().c={dm:true,insulin:false,heart:false,htn:false,neuro:false,retino:false},S.glu=[{ts:Date.now(),date:today(),v:85,ctx:'rand'}],exCheck(),new Promise(r=>setTimeout(()=>r(document.querySelector('dialog[open]').innerText),200)))")
        check('السكر 85 بدون إنسولين: لا يُطلب أكل كربوهيدرات', 'يمكنك البدء' in r, r[:120])
        await pg.evaluate("document.querySelector('dialog[open]').close()")
        r = await pg.evaluate("(P().c={dm:true,insulin:true,htn:true,beta:true,heart:false,neuro:false,retino:false},exCheck(),new Promise(r=>setTimeout(()=>r(document.querySelector('dialog[open]').innerText),200)))")
        check('السكر 85 مع إنسولين: كربوهيدرات + تنبيه حاصرات بيتا', '15–30' in r and 'حاصرات بيتا' in r, r[:160])
        await pg.evaluate("document.querySelector('dialog[open]').close();S.diabetes=false;P().c={}")

        # 14) الخروج بسبب الألم يوقف التدرّج
        r = await pg.evaluate("""(async()=>{ P().c={pelvicPain:false,pelvicSurg:false}; S.suggestAdvance=true; startSession('daily',planFor(S.progDay),0); await new Promise(r=>setTimeout(r,300));
          askExit(false); await new Promise(r=>setTimeout(r,100)); document.querySelector('#mPain').click(); await new Promise(r=>setTimeout(r,300));
          return [S.painAt===today(), S.suggestAdvance, !!document.querySelector('dialog[open]')]; })()""")
        check('الخروج بسبب ألم: يسجّل الألم ويوقف التقدّم ويعرض النصيحة', r == [True, False, True], r)
        await pg.evaluate("document.querySelectorAll('dialog[open]').forEach(d=>d.close());S.painAt=null")

        # 16) تنبيه القلب في قسم الرجال
        r = await pg.evaluate("(tab='men',S.hseg='men',render(),document.querySelector('#app').innerText.includes('تقييمًا قلبيًا'))")
        check('قسم الرجال: تنبيه ألم الصدر أثناء الجهد', r)

        # الويدجت: أكواب الماء المضافة من الشاشة الرئيسية تُسجّل في يومها، وتُرسل اللغة والوضع المحايد
        r = await pg.evaluate("""(async()=>{ const y=addDays(today(),-1); S.waterLog={}; window.__pendW=[{date:y,n:2},{date:today(),n:1}];
          await pullWidgetWater(); S.wDiscreet=true; updateWidget(); const w=window.__wb[window.__wb.length-1];
          return [S.waterLog[y], S.waterLog[today()], w.discreet, w.lang]; })()""")
        check('الويدجت: مزامنة الماء + الوضع المحايد + اللغة', r == [2, 1, True, 'ar'], r)
        r = await pg.evaluate("(async()=>{ window.__pendW=[]; return await pullWidgetWater(); })()")
        check('الويدجت: لا شيء معلّق = لا تغيير', r is False, r)

        # الإشعارات: كلها غير دقيقة حتى لا تفتح مكتبة الإشعارات شاشة «المنبهات والتذكيرات» (الإذن مُزال)
        r = await pg.evaluate("(async()=>{ S.remindersOn=true; S.water.on=true; S.knackOn=true; await scheduleReminders(); const L=window.__sched; return [L.length, L.every(n=>n.isExactNotification===false&&n.isExactMandatory===false)]; })()")
        check('الإشعارات: كل التذكيرات غير دقيقة (لا تطلب إذن المنبهات)', r[0] > 10 and r[1], r)

        # ثبات ضعيف (ثانية): الخطة تبدأ من ثباته الفعلي وتزيد ثانية أسبوعيًا حتى 3، بلا أنماط طويلة
        r = await pg.evaluate("""(()=>{ const o=[]; S.progDay=120;
          S.test={date:today(),hold:1,flicks:8}; let pl=planFor(S.progDay); o.push(pl.sq, pl.patterns.some(x=>['elevator','hold','steps'].includes(x)), buildSession('control').steps.find(x=>x.lbl==='hold').d);
          S.test={date:addDays(today(),-8),hold:1,flicks:8}; o.push(planFor(S.progDay).sq);
          S.test={date:addDays(today(),-30),hold:1,flicks:8}; o.push(planFor(S.progDay).sq);
          S.test={date:today(),hold:8,flicks:14}; o.push(planFor(S.progDay).sq); S.test=null; S.progDay=10; return o; })()""")
        check('ثبات ثانية: 1 ث ← 2 بعد أسبوع ← 3 حدًا، بلا أنماط طويلة، والقوي كما هو', r == [1, False, 2, 2, 3, 8], r)

        # 9) لا حيلة تعليقات HTML في القوالب
        r = await pg.evaluate("document.documentElement.outerHTML.includes(\"'<!--'\")")
        check('تنظيف: لا إخفاء بالتعليقات', not r)
        check('بلا أخطاء', not pg.errs, pg.errs)
        await pg.close()
        await b.close()
    bad = [n for n, ok in results if not ok]
    print(f'\n{len(results)-len(bad)}/{len(results)} passed')
    sys.exit(1 if bad else 0)

if __name__ == '__main__':
    asyncio.run(main())
