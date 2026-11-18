"""اختبارات المرحلة الثانية: الملف الصحي، الأسئلة مرة واحدة، الإظهار حسب الحالة، سلامة التمارين والغذاء.
التشغيل مثل tests/phase1.py
"""
import asyncio, json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from phase1 import MOCK, SPY, URL, check, results, async_playwright, page  # noqa

BASE = {'onboarded': True, 'v': 3, 'startDate': '2026-11-01', 'logs': [], 'progDay': 10, 'lang': 'ar', 'diabetes': False,
        'glu': [{'ts': 1, 'date': '2026-11-10', 'v': 120, 'ctx': 'fast'}]}

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()

        # تثبيت جديد: لا مرض، والتهيئة فيها خطوة الملف الصحي
        pg = await page(b)
        check('تهيئة: 7 خطوات', await pg.evaluate("document.querySelectorAll('.steps i').length") == 7)
        await pg.evaluate("ob.step=4; renderOnb()")
        check('تهيئة: خطوة الملف الصحي موجودة', await pg.evaluate("!!document.querySelector('#pfOnb')"))
        await pg.click('#pfOnb'); await pg.wait_for_timeout(200)
        await pg.fill('#pfA', '52')
        await pg.check('input[name=c][value=dm]'); await pg.check('input[name=c][value=htn]'); await pg.check('input[name=a][value=fish]')
        await pg.click('dialog button[type=submit]'); await pg.wait_for_timeout(200)
        r = await pg.evaluate("({age:S.prof.age,dm:S.diabetes,htn:has('htn'),fish:S.prof.a.fish,heart:S.prof.c.heart})")
        check('تهيئة: حفظ العمر والحالات والحساسية', r == {'age': 52, 'dm': True, 'htn': True, 'fish': True, 'heart': False}, r)
        check('تهيئة: بلا أخطاء', not pg.errs, pg.errs)
        await pg.close()

        # غير مريض السكري: لا يظهر له شيء من السكري
        pg = await page(b, BASE)
        check('إخفاء السكري: لا قسم سكري في صحتي', await pg.evaluate("(tab='men',S.hseg=null,render(),!document.querySelector('[data-seg=dm]'))"))
        check('إخفاء السكري: لا قواعد السكري في الغذاء', await pg.evaluate("(S.prof.aAsked=true,['ckd','gout','warfarin'].forEach(k=>S.prof.c[k]=false),!foodBody().includes('قواعد مهمة لمريض السكري'))"))
        check('إخفاء السكري: لا وحدة السكر في الإعدادات', await pg.evaluate("(tab='set',render(),!document.querySelector('#gU'))"))
        check('إخفاء السكري: الوصول السريع يعرض الملف الصحي', await pg.evaluate("(tab='home',render(),!!document.querySelector('#qkP')&&!document.querySelector('#qkC'))"))
        check('إخفاء الضغط: لا بطاقة قياس الضغط', await pg.evaluate("!indBody().includes('قياس الضغط في البيت')"))
        check('إخفاء الضغط: لا فقرات الضغط في التنفّس', await pg.evaluate("(breathSheet(),!document.querySelector('dialog[open]').innerText.includes('ضغط الدم:'))"))
        await pg.close()

        # مريض الضغط: تظهر له بطاقة الضغط وتحذيرات الرياضة مع مصدر
        pg = await page(b, dict(BASE, prof={'age': 60, 'c': {'htn': True, 'heart': False, 'neuro': False, 'retino': False, 'insulin': False, 'hernia': False}, 'a': {}, 'aAsked': True, 'consent': '2026-11-19'}))
        check('الضغط: بطاقة القياس في المؤشرات', await pg.evaluate("indBody().includes('قياس الضغط في البيت')"))
        w = await pg.evaluate("exWarn('resist').map(r=>r[4])")
        check('الضغط: تحذير المقاومة مع مصدر', 'mayo' in w, w)
        check('العمر 65+: لا ينطبق على 60', await pg.evaluate("!exWarn('aerobic').some(r=>r[3].includes('التوازن'))"))
        await pg.close()

        # إخفاء القسم لا يحذف بياناته
        pg = await page(b, dict(BASE, diabetes=True))
        await pg.evaluate("tab='set'; render()"); await pg.click('#dmOn'); await pg.wait_for_timeout(100)
        check('إيقاف السكري يُبقي القراءات', await pg.evaluate("S.diabetes===false&&S.glu.length===1"))
        await pg.close()

        # الغذاء: يُسأل مرة واحدة، والحساسية تستبدل الوجبة
        pg = await page(b, BASE)
        check('الغذاء: يسأل قبل الاقتراح', await pg.evaluate("foodBody().includes('قبل أن نقترح عليك وجبات')"))
        await pg.evaluate("ensureAsked('food',()=>{})"); await pg.wait_for_timeout(150)
        await pg.check('input[name=a][value=fish]'); await pg.check('input[name=c][value=gout]')
        await pg.click('dialog button[type=submit]'); await pg.wait_for_timeout(150)
        check('الغذاء: لا يسأل مرة ثانية', await pg.evaluate("missing('food').length===0&&!foodBody().includes('قبل أن نقترح')"))
        check('الغذاء: حساسية السمك تستبدل وجبات السمك', await pg.evaluate("MEALS.filter(m=>m[0]==='fish').every(m=>{ const r=mealFor(m); return r.swapped&&!/سمك|سلمون|تونة/.test(r.m[1]+r.m[2]); })"))
        await pg.evaluate("S.prof.a.fish=false")
        check('الغذاء: النقرس يضيف ملاحظة لوجبة السمك', await pg.evaluate("mealFor(MEALS[0]).notes.includes('gout')"))
        await pg.close()

        # «أفضّل عدم الإجابة» تُحفظ ولا يتكرر السؤال
        pg = await page(b, BASE)
        await pg.evaluate("ensureAsked('aerobic',()=>{window.__done=1})"); await pg.wait_for_timeout(150)
        await pg.click('#pfNa'); await pg.wait_for_timeout(100)
        check('عدم الإجابة: لا يتكرر السؤال', await pg.evaluate("missing('aerobic').length===0&&window.__done===1"))
        await pg.close()

        # جراحة حديثة: لا تبدأ الجلسة قبل موافقة الجراح
        pg = await page(b, dict(BASE, prof={'c': {'pelvicPain': False, 'pelvicSurg': True}, 'a': {}, 'consent': '2026-11-19'}))
        await pg.evaluate("startSession('quick')"); await pg.wait_for_timeout(150)
        check('الجراحة: الجلسة لا تبدأ قبل الموافقة', await pg.evaluate("screen!=='session'&&!!document.querySelector('#sgN')"))
        await pg.click('#sgN'); await pg.wait_for_timeout(100)
        check('الجراحة: «ليس بعد» لا يبدأ', await pg.evaluate("screen!=='session'"))
        await pg.close()

        # الألم المزمن من الملف يوقف التدرّج
        pg = await page(b, dict(BASE, prof={'c': {'pelvicPain': False, 'pelvicSurg': False}, 'a': {}, 'consent': '2026-11-19'}))
        await pg.evaluate("ensureAsked('kegel',()=>{})")
        await pg.evaluate("S.prof.c.pelvicPain=undefined; ensureAsked('kegel',()=>{})"); await pg.wait_for_timeout(150)
        await pg.check('input[name=c][value=pelvicPain]'); await pg.click('dialog button[type=submit]'); await pg.wait_for_timeout(100)
        check('الألم: يوقف التدرّج التلقائي', await pg.evaluate("S.warned===true&&careHold()"))
        await pg.close()

        # حذف الملف الصحي لا يمس البيانات
        pg = await page(b, dict(BASE, logs=[{'date': '2026-11-10', 'kind': 'daily', 'ts': 1}], prof={'age': 40, 'c': {'htn': True}, 'a': {'fish': True}, 'consent': '2026-11-19'}))
        await pg.evaluate("profClear()"); await pg.wait_for_timeout(100); await pg.click('#pcY'); await pg.wait_for_timeout(100)
        check('حذف الملف: يبقى السجل والقراءات', await pg.evaluate("S.prof.age===null&&!has('htn')&&S.logs.length===1&&S.glu.length===1"))
        await pg.close()

        # الملف الصحي ضمن النسخة الاحتياطية ويُتحقق منه
        pg = await page(b, BASE)
        check('النسخة الاحتياطية: ملف صحي غير صالح يُرفض', await pg.evaluate("!validState({logs:[],prof:'x'})"))
        check('النسخة الاحتياطية: ملف صحي صالح يُقبل', await pg.evaluate("validState({logs:[],prof:{age:40,c:{},a:{}}})"))
        check('بلا أخطاء', not pg.errs, pg.errs)
        await pg.close()

        # تقرير الطبيب يتضمن ما صرّح به المستخدم فقط
        pg = await page(b, dict(BASE, prof={'age': 55, 'c': {'htn': True}, 'a': {}, 'consent': '2026-11-19'}))
        t = await pg.evaluate("reportText(30,true)")
        check('تقرير الطبيب: العمر والحالات', 'العمر: 55' in t and 'ارتفاع ضغط الدم' in t, t[:200])
        check('التقرير الأسبوعي: بلا بيانات الملف', 'العمر' not in await pg.evaluate("reportText(7,false)"))
        await pg.close()

        await b.close()
    bad = [n for n, ok in results if not ok]
    print(f'\n{len(results)-len(bad)}/{len(results)} passed')
    sys.exit(1 if bad else 0)

asyncio.run(main())
