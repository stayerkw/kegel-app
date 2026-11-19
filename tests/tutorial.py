"""اختبارات التدريب التعليمي للشد الصحيح."""
import asyncio, json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from phase1 import MOCK, SPY, URL, check, results, async_playwright  # noqa

BASE = {'onboarded': True, 'v': 3, 'startDate': '2026-11-01', 'logs': [], 'progDay': 5, 'lang': 'ar', 'diabetes': False, 'sex': 'm',
        'prof': {'c': {'pelvicPain': False, 'pelvicSurg': False}, 'a': {}, 'consent': '2026-11-19'}}
# حركة تنفّس اصطناعية على الحسّاس: تتذبذب في الشهيق والإفلات، وتتوقف تمامًا أثناء الشد (حبس نفس)
MOTION = """
window.__holdBreath=true;
setInterval(()=>{ const ph=(window.TU&&TU.i!=null)?null:null; const t=performance.now()/1000;
  const sq=document.getElementById('tPh')&&/اشدّ/.test(document.getElementById('tPh').textContent);
  const amp=(sq&&window.__holdBreath)?0:6; const y=Math.sin(t*1.3)*amp*0.17, z=9.8;
  const e=new Event('devicemotion'); e.accelerationIncludingGravity={x:0,y:y,z:z}; window.dispatchEvent(e); },20);
"""

async def page(b, st, pre=''):
    pg = await b.new_page(viewport={'width': 390, 'height': 844})
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    await pg.clock.install()
    await pg.add_init_script(MOCK + SPY + pre + ";if(!sessionStorage.__s){sessionStorage.__s=1;localStorage.setItem('kegel_v1'," + json.dumps(json.dumps(st)) + ")}")
    await pg.goto(URL); await pg.clock.run_for(800)
    pg.errs = errs
    return pg

async def run_practice(pg, sensor=False):
    if sensor: await pg.check('#tUseS')
    await pg.click('#tGo')
    for _ in range(70):
        await pg.clock.run_for(1000)
        if await pg.evaluate("!!document.querySelector('[data-q]')"): break

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()

        pg = await page(b, BASE)
        check('الرئيسية: بطاقة التدريب ظاهرة', await pg.evaluate("!!document.querySelector('#tutGo')"))
        await pg.click('#tutGo'); await pg.clock.run_for(300)
        check('الصفحة 1: رسم الأرجوحة المتحرك', await pg.evaluate("!!document.querySelector('.tsling.demo')"))
        await pg.click('#tNext'); await pg.clock.run_for(200)
        check('الصفحة 2: الشدة 3 من 10 وفحص الأرداف', await pg.evaluate("!!document.querySelector('.teff')&&!!document.querySelector('.thand')"))
        await pg.click('#tNext'); await pg.clock.run_for(200)
        await pg.click('[data-rt="penis|0"]'); await pg.click('[data-rt="wave|2"]'); await pg.click('[data-rt="gas|-1"]')
        check('المختبر: حفظ الإشارة الأنسب', await pg.evaluate("S.tut.cue==='wave'&&S.tut.issues.glute===true"))
        await pg.click('#tNext'); await pg.clock.run_for(200)
        check('التمرين: يعرض الإشارة المختارة', 'موجة البحر' in await pg.evaluate("document.querySelector('.tut').innerText"))
        await run_practice(pg)
        check('التمرين: ينتهي إلى التقييم', await pg.evaluate("!!document.querySelector('[data-q]')&&S.tut.rounds===1"))
        for k, v in [('felt', 1), ('glute', 1), ('breath', 0), ('belly', 0)]:
            await pg.click(f'[data-q="{k}|{v}"]')
        check('التقييم: نصيحة الأرداف', 'خفّف الشدة إلى 2 من 10' in await pg.evaluate("document.querySelector('#tFb').innerText"))
        check('التقييم: لا يُحتسب نجاحًا مع شد الأرداف', await pg.evaluate("S.tut.good===0&&!S.tut.passed"))
        check('بلا أخطاء', not pg.errs, pg.errs)
        await pg.close()

        # الحسّاس: يكشف حبس النفس أثناء الشد
        pg = await page(b, dict(BASE, tut={'cue': 'penis', 'rate': {}, 'rounds': 0, 'good': 0, 'passed': False, 'issues': {}}), MOTION)
        await pg.evaluate("tutorial(3)"); await pg.clock.run_for(300)
        await run_practice(pg, sensor=True)
        sensed = await pg.evaluate("TU.sensed")
        check('الحسّاس: كشف حبس النفس في التكرارات الثلاثة', sensed == 3, sensed)
        check('الحسّاس: يملأ إجابة النفس تلقائيًا', await pg.evaluate("TU.ans.breath===1"))
        await pg.close()

        # الحسّاس: لا إنذار كاذب مع تنفّس مستمر
        pg = await page(b, dict(BASE, tut={'cue': 'penis', 'rate': {}, 'rounds': 0, 'good': 0, 'passed': False, 'issues': {}}), MOTION + ";window.__holdBreath=false;")
        await pg.evaluate("tutorial(3)"); await pg.clock.run_for(300)
        await run_practice(pg, sensor=True)
        check('الحسّاس: لا إنذار مع تنفّس مستمر', await pg.evaluate("TU.sensed") == 0, await pg.evaluate("TU.sensed"))
        await pg.close()

        # نجاحان = إتقان، والإشارة تظهر في الجلسة
        pg = await page(b, dict(BASE, tut={'cue': 'penis', 'rate': {}, 'rounds': 0, 'good': 0, 'passed': False, 'issues': {}}))
        for _ in range(2):
            await pg.evaluate("document.querySelectorAll('dialog').forEach(d=>d.close()); tutorial(3)"); await pg.clock.run_for(300)
            await run_practice(pg)
            for k, v in [('felt', 1), ('glute', 0), ('breath', 0), ('belly', 0)]:
                await pg.click(f'[data-q="{k}|{v}"]')
        check('الإتقان بعد نجاحين', await pg.evaluate("S.tut.passed===true&&S.tut.good===2"))
        check('الجلسة: تستخدم إشارة المستخدم', await pg.evaluate("curLabel({t:'sq',d:3}).join(' ').includes('اسحب القضيب')"))
        await pg.evaluate("document.querySelectorAll('dialog').forEach(d=>d.close()); tab='home'; render()")
        check('الرئيسية: تختفي البطاقة بعد الإتقان', await pg.evaluate("!document.querySelector('#tutGo')"))
        await pg.close()

        # ثلاث محاولات فاشلة: نصيحة أخصائي
        pg = await page(b, dict(BASE, tut={'cue': 'penis', 'rate': {}, 'rounds': 2, 'good': 0, 'passed': False, 'issues': {}}))
        await pg.evaluate("tutorial(3)"); await pg.clock.run_for(300); await run_practice(pg)
        for k, v in [('felt', 0), ('glute', 0), ('breath', 0), ('belly', 0)]:
            await pg.click(f'[data-q="{k}|{v}"]')
        check('3 محاولات فاشلة: توصية بأخصائي', 'أخصائي علاج طبيعي' in await pg.evaluate("document.querySelector('#tFb').innerText"))
        await pg.close()

        # النساء: إشارات خاصة
        pg = await page(b, dict(BASE, sex='f'))
        await pg.evaluate("tutorial(2)"); await pg.clock.run_for(300)
        check('النساء: إشارات خاصة بالمرأة', 'منع الغازات والبول معًا' in await pg.evaluate("document.querySelector('.tut').innerText"))
        await pg.close()

        await b.close()
    bad = [n for n, ok in results if not ok]
    print(f'\n{len(results)-len(bad)}/{len(results)} passed')
    sys.exit(1 if bad else 0)

asyncio.run(main())
