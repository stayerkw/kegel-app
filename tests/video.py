"""الرسم الطبي المتحرك (إطارات الفيديو) في شاشة التمرين: للرجال فقط، والإطار المرسوم يتبع fill في الكلاسيكي والمصعد والثبات الطويل"""
import asyncio, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from phase1 import check, results, async_playwright, page  # noqa

PROF = {'age': 40, 'c': {'pelvicPain': False, 'pelvicSurg': False}, 'a': {}, 'aAsked': True}
BASE = {'onboarded': True, 'v': 3, 'startDate': '2026-11-01', 'logs': [], 'progDay': 40, 'lang': 'ar', 'sex': 'm', 'tut': {'passed': True}, 'prof': PROF}

# fill الحالي من حلقة العدّاد (1 − الإزاحة/المحيط) ومقارنته بموضع الفيديو بعد انتهاء التقديم
PROBE = """(()=>{ const c=document.getElementById('medCanvas'), ring=document.getElementById('ring');
  const C=2*Math.PI*103, fill=1-(+ring.getAttribute('stroke-dashoffset'))/C;
  // الإطار المرسوم فعلًا على اللوحة (0..29) مقابل fill × 29، والتأكد أن اللوحة ليست فارغة
  const px=c.getContext('2d').getImageData(c.width/2|0,c.height/2|0,1,1).data;
  return {fill, pos:(+c.dataset.f)/29, paused:true, muted:true, drawn:px[0]+px[1]+px[2]>0, t:R.s.steps[R.i].t}; })()"""

async def run_pattern(b, pat):
    pg = await page(b, BASE)
    await pg.evaluate(f"(()=>{{ const pl=planFor(S.progDay); startSession('daily',{{...pl,patterns:['{pat}','{pat}','{pat}']}},0); }})()")
    await pg.wait_for_function("!!MED.img&&document.getElementById('medCanvas')&&document.getElementById('medCanvas').dataset.f!==undefined", timeout=8000)
    await pg.evaluate("R.e=Math.max(0,R.s.steps[0].d-0.05)")  # تخطّي مرحلة الاستعداد
    worst, samples, paused, muted, phases = 0, 0, True, True, set()
    for _ in range(26):
        await pg.wait_for_timeout(450)
        # نوقف المحرك لحظة القياس حتى لا يتغير fill بين القراءتين
        await pg.evaluate("R.paused=true")
        r = await pg.evaluate(PROBE)
        await pg.evaluate("R.paused=false; R.last=performance.now()")
        if r['t'] == 'ready': continue
        phases.add(r['t']); samples += 1
        worst = max(worst, abs(r['fill'] - r['pos']))
        paused &= r['drawn']; muted &= r['muted']
    errs = pg.errs
    await pg.close()
    return worst, samples, paused, muted, phases, errs

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for pat in ['classic', 'elevator', 'hold']:
            worst, n, paused, muted, phases, errs = await run_pattern(b, pat)
            # فرق أقل من إطار واحد تقريبًا (1/15 ث من 4 ث ≈ 0.017) + هامش ترميز
            check(f'الفيديو: مزامنة {pat} مع fill (أسوأ فرق {worst:.3f}، {n} قياسات، المراحل {sorted(phases)})', n >= 16 and worst < 0.03 and len(phases) >= (1 if pat == 'hold' else 2), worst)
            check(f'الرسم الطبي: {pat} مرسوم فعلًا (ليس فارغًا)', paused and muted)
            check(f'الفيديو: {pat} بلا أخطاء', not errs, errs)

        # النساء: الأرجوحة كما هي بلا فيديو، والتنفس بلا فيديو
        pg = await page(b, dict(BASE, sex='f'))
        await pg.evaluate("startSession('daily',planFor(S.progDay),0)"); await pg.wait_for_timeout(400)
        check('النساء: الرسم التشريحي بدل إطارات الرجال', await pg.evaluate("!document.getElementById('medCanvas')&&!!document.getElementById('lvH')"))
        await pg.close()
        pg = await page(b, BASE)
        await pg.evaluate("startSession('breath')"); await pg.wait_for_timeout(400)
        check('التنفس: بلا رسم طبي', await pg.evaluate("!document.getElementById('medCanvas')"))
        r = await pg.evaluate("fetch('img/kegel_m_frames.webp').then(r=>[r.ok,+r.headers.get('content-length')])")
        check('الإطارات: الملف موجود وصغير', r[0] and r[1] < 250000, r)
        await pg.close(); await b.close()
    bad = [n for n, ok in results if not ok]
    print(f'\n{len(results)-len(bad)}/{len(results)} passed')
    sys.exit(1 if bad else 0)

if __name__ == '__main__':
    asyncio.run(main())
