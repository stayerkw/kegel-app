"""اختبارات الدفعة الثانية: جلسة الدقيقة والعادات والوضع الصوتي، التدرّج الأذكى، المشي مع الكيجل، جلسة الإرخاء"""
import asyncio, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from phase1 import check, results, async_playwright, page  # noqa

PROF = {'age': 45, 'c': {'pelvicPain': False, 'pelvicSurg': False, 'voiding': False, 'heart': False, 'htn': False, 'neuro': False, 'retino': False, 'insulin': False}, 'a': {}, 'aAsked': True}
BASE = {'onboarded': True, 'v': 3, 'startDate': '2026-10-01', 'logs': [], 'progDay': 40, 'lang': 'ar', 'sex': 'm', 'diabetes': False,
        'tut': {'passed': True}, 'test': {'date': '2026-11-15', 'hold': 8, 'flicks': 12}, 'prof': PROF}
FINISH = "(async()=>{ R.i=R.s.steps.length-1; R.e=R.s.steps[R.i].d; await new Promise(r=>setTimeout(r,400)); })()"

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await page(b, BASE)

        # جلسة الدقيقة: ~64 ث، تُحسب جلسة يومية مرة واحدة فقط
        r = await pg.evaluate("(()=>{ const s=buildSession('minute'); return [Math.round(s.total), s.countAs]; })()")
        check('جلسة الدقيقة: نحو دقيقة وتُحسب من جلسات اليوم', 55 <= r[0] <= 70 and r[1] == 'daily', r)
        await pg.evaluate("startMinute(false)"); await pg.wait_for_timeout(300); await pg.evaluate(FINISH)
        r = await pg.evaluate("[dailyDoneOn(today()), buildSession('minute').countAs]")
        check('جلسة الدقيقة: الثانية في اليوم لا تُحسب مكررة', r == [1, None], r)
        await pg.evaluate("screen='tabs';tab='home';render()")

        # الوضع الصوتي: الشاشة معتمة والصوت مفعّل
        await pg.evaluate("S.voice=false;startMinute(true)"); await pg.wait_for_timeout(900)
        check('الوضع الصوتي: تعتيم + صوت', await pg.evaluate("!!document.getElementById('dimV')&&S.voice===true"))
        await pg.evaluate("askExit(); document.querySelector('#mExit').click()"); await pg.wait_for_timeout(300)

        # العادات: تذكير لكل عادة مختارة
        r = await pg.evaluate("""(async()=>{ S.anchors={brush:{on:true,time:'07:30'},coffee:{on:true,time:'10:30'}}; await scheduleReminders();
          const A=window.__sched.filter(n=>n.id>=4200&&n.id<4230); return [A.length, A.every(n=>n.extra.go==='minute')]; })()""")
        check('العادات: تذكيرات لعادتين لمدة أسبوع', r[0] >= 12 and r[1], r)

        # التدرّج الأذكى: الإرهاق يخفف التكرارات
        r = await pg.evaluate("""(()=>{ const pl=planFor(S.progDay); const a=buildSession('daily',pl,0).reps;
          S.logs.push({date:today(),ts:Date.now(),kind:'daily',pattern:'classic',rating:'hard'}); const s2=buildSession('daily',pl,0); S.logs.pop();
          return [a, s2.reps, s2.title.includes('مخففة')]; })()""")
        check('الإرهاق: «صعبة» ← تكرارات أقل في الجلسة التالية مع توضيح', r[1] < r[0] and r[2], r)

        # التراجع الآمن: 3 «صعبة» من آخر 5 ← اقتراح التخفيف والرجوع أسبوعًا
        await pg.evaluate("S.logs=[0,1,2].map(k=>({date:addDays(today(),-k),kind:'daily',rating:'hard',ts:k})); S.easeAsked=null; evalEase(); tab='home'; render()")
        check('التراجع الآمن: بطاقة التخفيف', await pg.evaluate("!!document.querySelector('#easeY')"))
        await pg.click('#easeY'); await pg.wait_for_timeout(200)
        check('التراجع الآمن: الرجوع 7 أيام', await pg.evaluate("S.progDay") == 33)

        # الدقة قبل المدة: لا تقدّم دون تأكيد الثلاثة
        await pg.evaluate("S.logs=[]; S.suggestAdvance=true; S.suggestEase=false; tab='home'; render()")
        await pg.click('#advY'); await pg.wait_for_timeout(200)
        await pg.evaluate("document.querySelectorAll('#avF input[name=c]')[0].checked=true; document.querySelector('#avF button[type=submit]').click()"); await pg.wait_for_timeout(200)
        check('الدقة قبل المدة: تأكيد ناقص = لا تقدّم', await pg.evaluate("S.progDay===33&&S.suggestAdvance===false"))
        await pg.evaluate("S.suggestAdvance=true; render()"); await pg.click('#advY'); await pg.wait_for_timeout(200)
        await pg.evaluate("document.querySelectorAll('#avF input[name=c]').forEach(x=>x.checked=true); document.querySelector('#avF button[type=submit]').click()"); await pg.wait_for_timeout(200)
        check('الدقة قبل المدة: تأكيد كامل = تقدّم يوم', await pg.evaluate("S.progDay") == 34)

        # النوع الأضعف
        r = await pg.evaluate("(S.test={date:today(),hold:8,flicks:6},[planFor(S.progDay).patterns.includes('rapid'),planFor(S.progDay).focus])")
        check('النوع الأضعف: انقباضات سريعة ضعيفة ← جلسة نيران سريعة', r == [True, 'rapid'] or r[0], r)

        # المشي: الهدف المشترك، والتسجيل اليدوي، و«امشِ واشدّ» بعد الإتقان فقط
        await pg.evaluate("tab='prog';render()")
        check('المشي: بطاقة الهدف المشترك + امشِ واشدّ', await pg.evaluate("!!document.querySelector('#wk10')&&!!document.querySelector('#wsGo')"))
        await pg.click('#wk10'); await pg.wait_for_timeout(200)
        check('المشي: تسجيل 10 دقائق', await pg.evaluate("walkMinWeek()") >= 10)
        await pg.evaluate("S.tut={passed:false};render()")
        check('المشي: «امشِ واشدّ» مخفية قبل إتقان التدريب', await pg.evaluate("!document.querySelector('#wsGo')"))
        await pg.evaluate("S.tut={passed:true}; P().c.neuro=true; walkSqueeze()"); await pg.wait_for_timeout(200)
        check('المشي: جرح القدم يمنع «امشِ واشدّ»', await pg.evaluate("screen!=='session'&&document.querySelector('dialog[open]').innerText.includes('جرح')"))
        await pg.evaluate("document.querySelectorAll('dialog[open]').forEach(d=>d.close()); P().c.neuro=false; walkSqueeze()"); await pg.wait_for_timeout(300)
        r = await pg.evaluate("[screen, R&&R.s.pattern, R&&Math.round(R.s.total)]")
        check('المشي: جلسة «امشِ واشدّ» 4 دقائق', r[0] == 'session' and r[1] == 'walk' and 230 <= r[2] <= 250, r)
        await pg.evaluate("askExit(); document.querySelector('#mExit').click()"); await pg.wait_for_timeout(300)

        # المشي بعد الأكل لمريض السكري
        r = await pg.evaluate("(async()=>{ S.diabetes=true; S.mealWalk=true; await scheduleReminders(); const n=window.__sched.filter(x=>x.id>=4300&&x.id<4320).length; S.diabetes=false; return n; })()")
        check('السكري: تذكير المشي بعد الأكل', r >= 12, r)

        # جلسة الإرخاء: لا تمر بأسئلة سلامة التقوية، وبلا رسم شد
        await pg.evaluate("P().c.pelvicPain=undefined; startSession('relax',{min:3})"); await pg.wait_for_timeout(400)
        r = await pg.evaluate("[screen, R&&R.s.pattern, R&&Math.round(R.s.total/60), !document.querySelector('.anat-card')]")
        check('الإرخاء: 3 دقائق بلا رسم شد ولا أسئلة تقوية', r == ['session', 'relax', 3, True], r)
        await pg.evaluate("R.e=R.s.steps[0].d"); await pg.wait_for_timeout(300)
        check('الإرخاء: إشارة إرخاء قاع الحوض مع الشهيق', 'أرخِ قاع الحوض' in await pg.evaluate("document.querySelector('#ph').textContent"))
        await pg.evaluate("askExit(); document.querySelector('#mExit').click(); P().c.pelvicPain=false"); await pg.wait_for_timeout(300)
        await pg.evaluate("prepSheet()"); await pg.wait_for_timeout(200)
        check('التهيئة قبل العلاقة: نصائح + بدء', await pg.evaluate("document.querySelector('dialog[open]').innerText.includes('النيكوتين')&&!!document.querySelector('#ppGo')"))
        await pg.evaluate("document.querySelectorAll('dialog[open]').forEach(d=>d.close())")

        # نافذة التمارين الأخرى
        await pg.evaluate("tab='home';render()"); await pg.click('#qMore'); await pg.wait_for_timeout(200)
        check('التمارين الأخرى: الدقيقة والصوتية والإرخاء والعادات', await pg.evaluate("['#q1','#qA','#qR','#qH','#qC','#q2','#qB'].every(i=>document.querySelector(i))"))
        # تمارين قبل التطبيق: تدخل في السلسلة والإنجازات وتنقل لليوم المناسب، بلا جلسات وهمية
        await pg.evaluate("document.querySelectorAll('dialog[open]').forEach(d=>d.close()); S.logs=[]; S.ach={}; S.progDay=1; S.prior=null; tab='set'; render()")
        await pg.click('#priorGo'); await pg.wait_for_timeout(200)
        await pg.fill('#prD', '30'); await pg.evaluate("document.querySelector('#prU').value=addDays(today(),-1)")
        await pg.click('#prF button[type=submit]'); await pg.wait_for_timeout(300)
        r = await pg.evaluate("[streak(), bestStreak(), !!S.ach.s30, S.progDay, totalSessions()]")
        check('تمارين سابقة: 30 يومًا ← سلسلة 30 + إنجاز 30 يومًا + اليوم 31 + بلا جلسات وهمية', r == [30, 30, True, 31, 0], r)
        check('تمارين سابقة: تظهر في تقرير الطبيب كبيانات أدخلها المستخدم', 'أدخلها المستخدم' in await pg.evaluate("reportText(30,true)"))
        await pg.evaluate("tab='prog';render()"); await pg.click('#priorP'); await pg.wait_for_timeout(200); await pg.click('#prDel'); await pg.wait_for_timeout(200)
        check('تمارين سابقة: الحذف يلغيها من السلسلة', await pg.evaluate("S.prior===null&&streak()===0"))
        check('بلا أخطاء', not pg.errs, pg.errs)
        await pg.close(); await b.close()
    bad = [n for n, ok in results if not ok]
    print(f'\n{len(results)-len(bad)}/{len(results)} passed')
    sys.exit(1 if bad else 0)

if __name__ == '__main__':
    asyncio.run(main())
