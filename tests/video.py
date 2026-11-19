"""الفيديو الطبي في شاشة التمرين: للرجال فقط، بلا صوت ولا تشغيل تلقائي، وموضعه يتبع fill في الكلاسيكي والمصعد والثبات الطويل"""
import asyncio, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from phase1 import check, results, async_playwright, page  # noqa

PROF = {'age': 40, 'c': {'pelvicPain': False, 'pelvicSurg': False}, 'a': {}, 'aAsked': True}
BASE = {'onboarded': True, 'v': 3, 'startDate': '2026-11-01', 'logs': [], 'progDay': 40, 'lang': 'ar', 'sex': 'm', 'tut': {'passed': True}, 'prof': PROF}

# fill الحالي من حلقة العدّاد (1 − الإزاحة/المحيط) ومقارنته بموضع الفيديو بعد انتهاء التقديم
PROBE = """(async()=>{ const v=document.getElementById('medVideo'), ring=document.getElementById('ring');
  if(v.seeking) await new Promise(r=>v.addEventListener('seeked',r,{once:true}));
  const C=2*Math.PI*103, fill=1-(+ring.getAttribute('stroke-dashoffset'))/C;
  return {fill, pos:v.currentTime/v.duration, paused:v.paused, muted:v.muted, t:R.s.steps[R.i].t, dur:v.duration}; })()"""

async def run_pattern(b, pat):
    pg = await page(b, BASE)
    await pg.evaluate(f"(()=>{{ const pl=planFor(S.progDay); startSession('daily',{{...pl,patterns:['{pat}','{pat}','{pat}']}},0); }})()")
    await pg.wait_for_function("document.getElementById('medVideo')&&document.getElementById('medVideo').readyState>=1&&document.getElementById('medVideo').src.startsWith('blob:')", timeout=8000)
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
        paused &= r['paused']; muted &= r['muted']
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
            check(f'الفيديو: {pat} متوقف وصامت دائمًا', paused and muted)
            check(f'الفيديو: {pat} بلا أخطاء', not errs, errs)

        # النساء: الأرجوحة كما هي بلا فيديو، والتنفس بلا فيديو
        pg = await page(b, dict(BASE, sex='f'))
        await pg.evaluate("startSession('daily',planFor(S.progDay),0)"); await pg.wait_for_timeout(400)
        check('النساء: الأرجوحة بدل الفيديو', await pg.evaluate("!document.getElementById('medVideo')&&!!document.getElementById('lvH')"))
        await pg.close()
        pg = await page(b, BASE)
        await pg.evaluate("startSession('breath')"); await pg.wait_for_timeout(400)
        check('التنفس: بلا فيديو', await pg.evaluate("!document.getElementById('medVideo')"))
        r = await pg.evaluate("(()=>{ const v=document.createElement('video'); return [v.canPlayType('video/mp4; codecs=\"avc1.4D401F\"')]; })()")
        check('الفيديو: H.264 مدعوم', r[0] in ('probably', 'maybe'), r)
        await pg.close(); await b.close()
    bad = [n for n, ok in results if not ok]
    print(f'\n{len(results)-len(bad)}/{len(results)} passed')
    sys.exit(1 if bad else 0)

if __name__ == '__main__':
    asyncio.run(main())
