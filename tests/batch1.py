"""اختبارات الدفعة الأولى: الفحص الأسبوعي، المقارنة الصادقة، الأنماط، الحركة الذكية، عصرة ما بعد التبول، عوامل الانتصاب"""
import asyncio, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from phase1 import check, results, async_playwright, page  # noqa

PROF = {'age': 45, 'c': {'pelvicPain': False, 'pelvicSurg': False, 'voiding': False}, 'a': {}, 'aAsked': True, 'consent': '2026-11-01'}
BASE = {'onboarded': True, 'v': 3, 'startDate': '2026-10-01', 'logs': [], 'progDay': 30, 'lang': 'ar', 'diabetes': False, 'sex': 'm',
        'goals': ['erection'], 'tut': {'passed': True}, 'test': {'date': '2026-11-15', 'hold': 8, 'flicks': 12}, 'prof': PROF}

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await page(b, BASE)

        # الفحص الأسبوعي مستحق أول مرة ويظهر في الرئيسية
        check('فحص الأسبوع: مستحق في البداية', await pg.evaluate("wkDue()"))
        await pg.evaluate("(tab='home',render())")
        check('فحص الأسبوع: بطاقته في الرئيسية', await pg.evaluate("!!document.querySelector('#wkB')"))

        # الحفظ: سؤالا الانتصاب اختياريان ويظهران بعد الموافقة فقط
        await pg.click('#wkB'); await pg.wait_for_timeout(200)
        check('فحص الأسبوع: لا أسئلة انتصاب قبل الموافقة', await pg.evaluate("!document.querySelector('input[name=ehs]')"))
        await pg.evaluate("document.querySelector('input[name=edo][value=\"1\"]').click()"); await pg.wait_for_timeout(150)
        check('فحص الأسبوع: تظهر بعد الموافقة', await pg.evaluate("!!document.querySelector('input[name=ehs]')&&!!document.querySelector('input[name=morn]')"))
        await pg.check('input[name=leak][value="2"]'); await pg.check('input[name=pmd][value="2"]')
        await pg.check('input[name=ehs][value="2"]'); await pg.check('input[name=morn][value="1"]')
        await pg.click('#wkF button[type=submit]'); await pg.wait_for_timeout(600)
        r = await pg.evaluate("(()=>{ const l=wkLast(); return [l.leak,l.pmd,l.ehs,l.morn,!!l.ctx,wkDue()]; })()")
        check('فحص الأسبوع: يحفظ الإجابات والسياق', r == [2, 2, 2, 1, True, False], r)
        check('فحص الأسبوع: يقترح درس العصرة لمن ذكر تنقيطًا', await pg.evaluate("!!document.querySelector('dialog[open]')&&document.querySelector('dialog[open]').innerText.includes('عصرة ما بعد التبول')"))
        await pg.evaluate("document.querySelectorAll('dialog[open]').forEach(d=>d.close())")

        # المقارنة الصادقة: لا تحسن يُعرض إن لم يتغير شيء
        r = await pg.evaluate("""(()=>{ S.wk=[{date:'2026-10-02',leak:2,pmd:2,ehs:2,morn:1,ctx:{}},{date:today(),leak:2,pmd:2,ehs:2,morn:1,ctx:{}}];
          S.tests=[{date:'2026-10-02',hold:8,flicks:12},{date:'2026-11-15',hold:8,flicks:12}]; return [wkCompare().every(r=>r.st==='same'), progressHTML().includes('الأرقام لم تتحسن بعد')]; })()""")
        check('المقارنة: لا تغيّر = رسالة صادقة وخطوة عملية', r == [True, True], r)
        r = await pg.evaluate("""(()=>{ S.wk.push({date:addDays(today(),1),leak:0,pmd:1,ehs:3,morn:2,ctx:{}}); const c=wkCompare(); return Object.fromEntries(c.map(x=>[x.k,x.st])); })()""")
        check('المقارنة: التحسن يُحسب في الاتجاه الصحيح', r.get('leak') == 'up' and r.get('pmd') == 'up' and r.get('ehs') == 'up' and r.get('morn') == 'up', r)
        check('أين يظهر تحسنك: هدف الانتصاب يبرز الصلابة والصباحي', await pg.evaluate("focusMetric().keys.join()") == 'ehs,morn')

        # الأنماط: لا تظهر قبل 4 أسابيع، وتظهر مع فرق واضح
        r = await pg.evaluate("""(()=>{ S.wk=[1,2,3].map(i=>({date:addDays(today(),-7*i),leak:0,morn:1,ctx:{sleep:400}})); return patternCard().includes('بعد 4 أسابيع'); })()""")
        check('الأنماط: لا استنتاج قبل 4 أسابيع', r)
        r = await pg.evaluate("""(()=>{ S.wk=[[3,480],[3,450],[1,360],[0,350]].map(([m,sl],i)=>({date:addDays(today(),-7*i),leak:0,morn:m,ctx:{sleep:sl,adh:0.5,walk:1}})); return patternCard(); })()""")
        check('الأنماط: ربط النوم الكافي بالانتصاب الصباحي كملاحظة لا سبب', 'نمت فيها 7 ساعات أو أكثر' in r and 'وليست سببًا مؤكدًا' in r, r[:200])

        # الجدول الزمني: «أنت هنا» في الأسبوع الصحيح ومع مصادر
        r = await pg.evaluate("(S.startDate=addDays(today(),-80),[progWeek(),timelineCard().includes('أنت هنا · الأسبوع 12'),timelineCard().includes('NICE')])")
        check('الجدول الزمني: الأسبوع 12 + مصدر NICE', r == [12, True, True], r)

        # الحركة الذكية: تُمنع مع صعوبة إفراغ المثانة، وأوقاتها خارج النوم
        r = await pg.evaluate("(P().c.voiding=true,knackSheet(),new Promise(r=>setTimeout(()=>r(document.querySelector('dialog[open]').innerText),200)))")
        check('الحركة الذكية: تحذير وعدم تمرين مع صعوبة الإفراغ', 'اسأل طبيبك' in r and 'تمرين موجّه' not in r, r[:120])
        await pg.evaluate("document.querySelectorAll('dialog[open]').forEach(d=>d.close());P().c.voiding=false")
        r = await pg.evaluate("""(()=>{ S.wake='06:00'; S.bed='23:30'; const out=[]; for(let i=0;i<30;i++){ out.push(...knackTimes(addDays(today(),i))); } return [Math.min(...out),Math.max(...out),knackTimes('2026-11-20').join()===knackTimes('2026-11-20').join()]; })()""")
        check('الحركة الذكية: أوقات بين الاستيقاظ+ساعة والنوم−ساعتين وثابتة لليوم', r[0] >= 420 and r[1] <= 1290 and r[2], r)
        r = await pg.evaluate("""(async()=>{ S.knackOn=true; S.pmdRem=today(); await scheduleReminders(); const ids=window.__sched.map(n=>n.id);
          return [ids.filter(i=>i>=9900&&i<9914).length, ids.filter(i=>i>=4100&&i<4114).length, ids.includes(9990)]; })()""")
        check('التذكيرات: الحركة الذكية مرتان يوميًا + العصرة + فحص الأسبوع', r[0] >= 12 and r[1] >= 12 and r[2], r)
        r = await pg.evaluate("""(async()=>{ P().c.voiding=true; await scheduleReminders(); const ids=window.__sched.map(n=>n.id); P().c.voiding=false;
          return [ids.filter(i=>i>=9900&&i<9914).length, ids.filter(i=>i>=4100&&i<4114).length]; })()""")
        check('التذكيرات: لا حركة ذكية ولا عصرة مع صعوبة الإفراغ', r == [0, 0], r)

        # التمرين الموجّه ينتهي ويسجّل
        await pg.evaluate("knackPractice()"); await pg.wait_for_timeout(33000)
        check('التمرين الموجّه: 3 جولات ثم يسجّل الإتمام', await pg.evaluate("S.knackDone===today()"))
        await pg.evaluate("document.querySelectorAll('dialog[open]').forEach(d=>d.close())")

        # عوامل الانتصاب وتقرير الطبيب
        await pg.evaluate("(tab='men',S.hseg='men',render())")
        await pg.click('#edfGo'); await pg.wait_for_timeout(200)
        await pg.check('input[name=f][value=bb]'); await pg.check('input[name=f][value=sleep]')
        await pg.click('#edF button[type=submit]'); await pg.wait_for_timeout(300)
        rep = await pg.evaluate("(S.wk=[{date:addDays(today(),-21),leak:2,pmd:2,ehs:2,morn:1},{date:today(),leak:1,pmd:1,ehs:3,morn:2}],reportText(30,true))")
        check('تقرير الطبيب: العوامل + فحص الأسبوع + المقارنة', 'حاصرات بيتا' in rep and 'صلابة الانتصاب (EHS)' in rep and 'مقارنة بأول فحص' in rep, rep[-400:])

        # الخصوصية: إيقاف أسئلة الانتصاب يحذف إجاباتها، وحذف الملف الصحي يحذف الفحص والعوامل
        await pg.evaluate("(tab='set',render())"); await pg.click('#edOn'); await pg.wait_for_timeout(200)
        check('الخصوصية: إيقاف أسئلة الانتصاب يحذف إجاباتها', await pg.evaluate("S.edOpt===false&&S.wk.every(x=>x.ehs==null&&x.morn==null)"))
        await pg.evaluate("profClear()"); await pg.wait_for_timeout(150); await pg.click('#pcY'); await pg.wait_for_timeout(200)
        check('الخصوصية: حذف الملف الصحي يحذف الفحص والعوامل', await pg.evaluate("S.wk.length===0&&S.edf===null"))

        # النساء: لا أسئلة رجال
        await pg.evaluate("S.sex='f'; S.edOpt=undefined; wkSheet()"); await pg.wait_for_timeout(200)
        check('النساء: سؤال التسرّب فقط', await pg.evaluate("!!document.querySelector('input[name=leak]')&&!document.querySelector('input[name=pmd]')&&!document.querySelector('input[name=edo]')"))
        await pg.evaluate("document.querySelectorAll('dialog[open]').forEach(d=>d.close());S.sex='m'")

        # التقدّم يُعرض بلا أخطاء
        await pg.evaluate("(tab='prog',render())")
        check('صفحة التقدّم: بطاقات الدفعة الأولى', await pg.evaluate("!!document.querySelector('#wkGo')&&document.querySelector('#app').innerText.includes('ماذا تتوقع ومتى')"))
        check('بلا أخطاء', not pg.errs, pg.errs)
        await pg.close(); await b.close()
    bad = [n for n, ok in results if not ok]
    print(f'\n{len(results)-len(bad)}/{len(results)} passed')
    sys.exit(1 if bad else 0)

if __name__ == '__main__':
    asyncio.run(main())
