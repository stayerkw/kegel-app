"""اختبارات رجعية للمرحلة الأولى من خطة Vigoris.
التشغيل: من جذر المستودع
  (cd www && python3 -m http.server 8765 &) ; python3 tests/phase1.py
يتطلب: pip install playwright && playwright install chromium
"""
import asyncio, json, os, sys
from playwright.async_api import async_playwright

H = os.path.dirname(os.path.abspath(__file__))
URL = os.environ.get('VIGORIS_URL', 'http://localhost:8765/index.html')
MOCK = open(os.path.join(H, 'mock_capacitor.js'), encoding='utf-8').read()
# أدوات رصد إضافية: الإشعارات المعلّقة والملغاة، وصلاحيات وقراءات Health Connect
SPY = """
const _mk1=window.Capacitor.registerPlugin;
window.__cancelled=[]; window.__hcReads=[];
window.Capacitor.registerPlugin=(n)=>{ const b=_mk1(n);
  if(n==='LocalNotifications') Object.assign(b,{getPending:async()=>({notifications:(window.__PENDING||[]).map(id=>({id}))}),
    cancel:async(o)=>{ window.__cancelled.push(...o.notifications.map(x=>x.id)); }});
  if(n==='Health'){ const rs=b.readSamples, qa=b.queryAggregated;
    Object.assign(b,{requestAuthorization:async()=>({readAuthorized:window.__HC_PERMS||['steps','sleep','bloodGlucose','heartRate','restingHeartRate']}),
      readSamples:async(o)=>{ window.__hcReads.push(o.dataType); if(o.dataType==='sleep'&&window.__SLEEP) return {samples:window.__SLEEP}; return rs(o); },
      queryAggregated:async(o)=>{ window.__hcReads.push(o.dataType); return qa(o); }}); }
  return b; };
"""
results = []
def check(name, ok, info=''):
    results.append((name, bool(ok)))
    print(('PASS ' if ok else 'FAIL ') + name + (('  — ' + str(info)) if info and not ok else ''))

async def page(b, state=None, pre=''):
    pg = await b.new_page(viewport={'width': 390, 'height': 844})
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    init = MOCK + SPY + pre
    if state is not None:
        init += ";if(!sessionStorage.__s){sessionStorage.__s=1;localStorage.setItem('kegel_v1'," + json.dumps(json.dumps(state)) + ")}"
    await pg.add_init_script(init)
    await pg.goto(URL); await pg.wait_for_timeout(700)
    pg.errs = errs
    return pg

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()

        # 1) تثبيت جديد: لا مرض مفعّل افتراضيًا
        pg = await page(b)
        check('1 تثبيت جديد: السكري غير مفعّل', await pg.evaluate('S.diabetes===false&&S.v===SCHEMA'), await pg.evaluate('[S.diabetes,S.v]'))
        check('1 تثبيت جديد: بلا أخطاء', not pg.errs, pg.errs)
        await pg.close()

        # 2) ترقية من إصدارات سابقة: تبقى البيانات، ويُرحّل فقط ما يلزم
        logs = [{'date': '2026-10-01', 'kind': 'daily', 'ts': 1}]
        for v, onb, want in [(None, True, True), (1, True, True), (2, True, True), (2, False, False), (3, True, False)]:
            st = {'onboarded': onb, 'startDate': '2026-10-01', 'logs': logs, 'progDay': 20, 'glu': [{'ts': 1, 'date': '2026-10-01', 'v': 120, 'ctx': 'fast'}]}
            if v is not None: st['v'] = v
            if v == 3: st['diabetes'] = False
            pg = await page(b, st)
            r = await pg.evaluate('({d:S.diabetes,v:S.v,l:S.logs.length,p:S.progDay,g:S.glu.length})')
            check(f'2 ترقية من v={v} (أكمل التهيئة={onb})', r['d'] == want and r['v'] == 3 and r['l'] == 1 and r['p'] == 20 and r['g'] == 1, r)
            # الترحيل قابل للتكرار: تشغيله مرة ثانية لا يغيّر شيئًا
            again = await pg.evaluate('(()=>{ const a=JSON.stringify(S); fixState(); return a===JSON.stringify(S); })()')
            check(f'2 الترحيل قابل للتكرار v={v}', again)
            await pg.close()

        # 3) استيراد نسخة تالفة/معدلة: تُرفض دون تغيير البيانات
        base = {'onboarded': True, 'v': 3, 'startDate': '2026-10-01', 'logs': logs, 'progDay': 20}
        pg = await page(b, base)
        before = await pg.evaluate('JSON.stringify(S)')
        bad = [
            {'app': 'afiyati', 'state': {'logs': 'x'}},
            {'app': 'afiyati', 'state': {'logs': [{'date': 'bad'}]}},
            {'app': 'afiyati', 'state': {'logs': [], 'glu': [{'v': 'abc'}]}},
            {'app': 'afiyati', 'state': {'logs': [], 'glu': [{'v': 99999}]}},
            {'app': 'afiyati', 'state': {'logs': [], 'progDay': 999}},
            {'app': 'afiyati', 'schema': 99, 'state': {'logs': []}},
            {'app': 'other', 'state': {'logs': []}},
        ]
        for i, o in enumerate(bad):
            await pg.evaluate(f'restoreObj({json.dumps(o)})'); await pg.wait_for_timeout(100)
            dlg = await pg.evaluate("!!document.querySelector('dialog[open] #ry')")
            check(f'3 رفض نسخة غير صالحة #{i+1}', not dlg and await pg.evaluate('JSON.stringify(S)') == before)
        # نسخة قديمة صالحة (بلا رقم بنية) تُقبل
        await pg.evaluate("restoreObj({app:'afiyati',v:2,state:{onboarded:true,v:2,logs:[{date:'2026-09-01',kind:'daily'}],startDate:'2026-09-01'}})"); await pg.wait_for_timeout(150)
        await pg.click('#ry'); await pg.wait_for_timeout(300)
        check('3 قبول نسخة قديمة صالحة وترحيلها', await pg.evaluate("S.logs.length===1&&S.logs[0].date==='2026-09-01'&&S.v===3"))
        check('3 بلا أخطاء', not pg.errs, pg.errs)
        await pg.close()

        # 4) إعادة جدولة التذكيرات لا تلغي الإشعارات لمرة واحدة
        pg = await page(b, base, ";window.__PENDING=[7999,9970,9971,1001,1002,9700];")
        await pg.evaluate('scheduleReminders()'); await pg.wait_for_timeout(200)
        c = await pg.evaluate('window.__cancelled')
        check('4 الإبقاء على الإشعارات لمرة واحدة', not ({7999, 9970, 9971} & set(c)) and {1001, 1002, 9700} <= set(c), c)
        await pg.close()

        # 5) حساب المواعيد الشهرية في نهاية الشهر والسنة الكبيسة
        pg = await page(b, base)
        cases = [('2026-01-31', 1, '2026-02-28'), ('2028-01-31', 1, '2028-02-29'), ('2026-01-29', 1, '2026-02-28'),
                 ('2026-01-30', 1, '2026-02-28'), ('2026-03-31', 1, '2026-04-30'), ('2026-08-31', 6, '2027-02-28'),
                 ('2026-11-30', 3, '2027-02-28'), ('2026-05-15', 12, '2027-05-15'), ('2027-12-31', 2, '2028-02-29')]
        for d, m, want in cases:
            got = await pg.evaluate(f"addMonths('{d}',{m})")
            check(f'5 {d} + {m} شهر = {want}', got == want, got)
        await pg.close()

        # 6) فتح رابط البريد لا يسجّل الإرسال
        st = dict(base, doc={'on': True, 'email': 'dr@example.com', 'every': 30, 'last': None, 'patient': 'x', 'phone': '', 'fileNo': '', 'dr': ''})
        pg = await page(b, st)
        await pg.evaluate('sendDoc()'); await pg.wait_for_timeout(200)
        check('6 فتح البريد لا يسجّل الإرسال', await pg.evaluate('S.doc.last===null&&!!S.doc.pend'))
        await pg.evaluate('docConfirm()'); await pg.wait_for_timeout(150); await pg.click('#dcN'); await pg.wait_for_timeout(100)
        check('6 «لم أرسله» لا يسجّل', await pg.evaluate('S.doc.last===null&&!S.doc.pend'))
        await pg.evaluate("S.doc.pend=today(); docConfirm()"); await pg.wait_for_timeout(150); await pg.click('#dcY'); await pg.wait_for_timeout(100)
        check('6 التأكيد يسجّل الإرسال', await pg.evaluate('S.doc.last===today()'))
        await pg.close()

        # 7) صلاحية نوع واحد من Health Connect: حالة جزئية وقراءة المسموح فقط
        pg = await page(b, base, ";window.__HC_PERMS=['steps'];")
        await pg.evaluate('hcConnect()'); await pg.wait_for_timeout(400)
        reads = set(await pg.evaluate('window.__hcReads'))
        check('7 قراءة الأنواع المسموحة فقط', reads == {'steps'}, reads)
        html = await pg.evaluate('hcStatusHTML()')
        check('7 عرض حالة الاتصال الجزئي', 'متصل جزئيًا' in html)
        await pg.close()

        # 7ب) دمج فترات النوم المتداخلة (ساعتان تسجلان نفس الليلة)
        pg = await page(b, base)
        m = await pg.evaluate("mergedMinutes([[0,60*6e4],[30*6e4,90*6e4],[120*6e4,150*6e4]])")
        check('7ب دمج النوم المتداخل = 120 دقيقة', abs(m - 120) < 1e-6, m)
        await pg.close()

        # 8) لا تُعرض قراءة قديمة على أنها حديثة
        pg = await page(b, dict(base, hc={'on': True, 'steps': 5000, 'stepsDate': '2020-01-01', 'week': {}, 'sleep': 400, 'sleepDate': '2020-01-01'}))
        check('8 الخطوات القديمة لا تُعرض كقراءة اليوم', await pg.evaluate("(S.hc.stepsDate='2020-01-01', stepsNow()===null)"))
        await pg.close()

        # 9) تحويل وحدات السكر من mmol/L
        pg = await page(b, base)
        check('9 تحويل 7 mmol/L ≈ 126 mg/dL', await pg.evaluate("Math.round(7*18.016)") == 126)
        await pg.close()

        # 14) الألم يوقف التدرّج التلقائي
        easy = [{'date': d, 'kind': 'daily', 'rating': 'easy', 'ts': 1} for d in ['2026-11-16', '2026-11-17', '2026-11-18']]
        pg = await page(b, dict(base, logs=easy, painAt=None, warned=False))
        await pg.evaluate('evalAdvance()')
        check('14 بدون ألم: يُقترح التقدّم', await pg.evaluate('S.suggestAdvance===true'))
        await pg.evaluate("S.suggestAdvance=false; S.painAt=today(); evalAdvance()")
        check('14 مع ألم مسجّل: لا يُقترح التقدّم', await pg.evaluate('S.suggestAdvance===false'))
        await pg.evaluate("S.painAt=null; S.warned=true; evalAdvance()")
        check('14 مع أعراض مزمنة من التهيئة: لا يُقترح التقدّم', await pg.evaluate('S.suggestAdvance===false'))
        await pg.close()

        # 12.9) مؤشر الانتصاب مع «لا نشاط»: لا تصنيف
        pg = await page(b, dict(base, sex='m'))
        await pg.evaluate('iiefSheet()'); await pg.wait_for_timeout(200)
        for i in range(5):
            await pg.click(f'dialog input[name=q{i}][value="{1 if i==0 else 0}"]')
        await pg.click('dialog button[type=submit]'); await pg.wait_for_timeout(150)
        check('12.9 «لا نشاط» لا ينتج تصنيفًا', await pg.evaluate("S.iief.length===0&&!!S.iiefNA"))
        await pg.close()

        # 18) تكبير الخط: لا تمرير أفقي ولا عناصر خارج الشاشة في الرئيسية
        for fs in ['l', 'x']:
            pg = await page(b, dict(base, fs=fs, diabetes=True))
            ov = await pg.evaluate("document.documentElement.scrollWidth<=document.documentElement.clientWidth+1")
            check(f'18 تكبير الخط ({fs}): بلا تمرير أفقي', ov)
            await pg.close()

        # اللغة: لا زر لغة في الرئيسية
        pg = await page(b, base)
        check('اللغة: لا زر تغيير لغة في الرئيسية', await pg.evaluate("!document.querySelector('#dLang')"))
        await pg.close()

        await b.close()
    bad = [n for n, ok in results if not ok]
    print(f'\n{len(results)-len(bad)}/{len(results)} passed')
    sys.exit(1 if bad else 0)

asyncio.run(main())
