"""يضيف الويدجت والروابط العميقة وقواعد منع النسخ إلى مشروع أندرويد الذي يولّده Capacitor (يُشغَّل في البناء بعد cap add).
كل خطوة قابلة للتكرار بأمان، ويتوقف البناء برسالة واضحة إن لم يجد ما يتوقعه في الملف."""
import os, re, shutil, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, 'android')
APP = sys.argv[1] if len(sys.argv) > 1 else 'android/app/src/main'

# 1) نسخ ملفات جافا والموارد
jdst = os.path.join(APP, 'java/com/hamedaldahash/vigoris')
os.makedirs(jdst, exist_ok=True)
for f in os.listdir(os.path.join(SRC, 'java')):
    shutil.copy(os.path.join(SRC, 'java', f), jdst)
for d in os.listdir(os.path.join(SRC, 'res')):
    dst = os.path.join(APP, 'res', d); os.makedirs(dst, exist_ok=True)
    for f in os.listdir(os.path.join(SRC, 'res', d)):
        shutil.copy(os.path.join(SRC, 'res', d, f), dst)

mp = os.path.join(APP, 'AndroidManifest.xml')
m = open(mp, encoding='utf-8').read().replace('\r\n', '\n')

def fail(msg):
    sys.exit('inject.py: ' + msg)

# 2) الروابط العميقة vigoris:// داخل نشاط التطبيق الرئيسي تحديدًا (لا أول intent-filter في الملف)
deep = '''            <intent-filter>
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="vigoris" />
            </intent-filter>
'''
if 'android:scheme="vigoris"' not in m:
    act = re.search(r'<activity\b[^>]*android:name="[^"]*MainActivity"[^>]*>.*?</activity>', m, re.S)
    if not act:
        fail('لم يُعثر على MainActivity في AndroidManifest.xml')
    block = act.group(0)
    k = block.rindex('</activity>')
    block2 = block[:k].rstrip(' ') + deep + '        </activity>'
    m = m[:act.start()] + block2 + m[act.end():]

# 3) مستقبل الويدجت + أكشن إضافة الماء من الويدجت دون فتح التطبيق
recv = '''        <receiver android:name=".KegelWidget" android:exported="false" android:label="@string/w_title">
            <intent-filter>
                <action android:name="android.appwidget.action.APPWIDGET_UPDATE" />
                <action android:name="com.hamedaldahash.vigoris.ACTION_ADD_WATER" />
            </intent-filter>
            <meta-data android:name="android.appwidget.provider" android:resource="@xml/kegel_widget_info" />
        </receiver>
'''
if 'KegelWidget' not in m:
    if '</application>' not in m:
        fail('لم يُعثر على </application>')
    m = re.sub(r'([ \t]*)</application>', recv + r'\1</application>', m, count=1)
elif 'ACTION_ADD_WATER' not in m:
    m = m.replace('<action android:name="android.appwidget.action.APPWIDGET_UPDATE" />',
                  '<action android:name="android.appwidget.action.APPWIDGET_UPDATE" />\n                <action android:name="com.hamedaldahash.vigoris.ACTION_ADD_WATER" />', 1)

# 4) البيانات الصحية لا تُنسخ إلى السحابة ولا تُنقل تلقائيًا؛ النسخ يتم يدويًا ومشفّرًا من داخل التطبيق
app = re.search(r'<application\b[^>]*>', m, re.S)
if not app:
    fail('لم يُعثر على <application>')
tag = app.group(0)
def setattr_(tag, name, val):
    if re.search(r'android:%s="[^"]*"' % name, tag):
        return re.sub(r'android:%s="[^"]*"' % name, 'android:%s="%s"' % (name, val), tag)
    return tag.replace('<application', '<application android:%s="%s"' % (name, val), 1)
tag = setattr_(tag, 'allowBackup', 'false')
tag = setattr_(tag, 'fullBackupContent', 'false')              # أندرويد 11 وأقدم
tag = setattr_(tag, 'dataExtractionRules', '@xml/data_extraction_rules')  # أندرويد 12 وأحدث
m = m[:app.start()] + tag + m[app.end():]

# 5) لا منبّهات دقيقة: سياسة Google Play تقيّد هذا الإذن، والتذكيرات تعمل بدونه (قد تتأخر دقائق قليلة).
#    tools:node="remove" يحذفه حتى لو أضافته مكتبة أخرى عند دمج ملفات الـ manifest.
if 'xmlns:tools=' not in m:
    m = m.replace('<manifest ', '<manifest xmlns:tools="http://schemas.android.com/tools" ', 1)
for perm in ('SCHEDULE_EXACT_ALARM', 'USE_EXACT_ALARM'):
    m = re.sub(r'\s*<uses-permission android:name="android.permission.%s"[^>]*/>' % perm, '', m)
    m = m.replace('</manifest>', '    <uses-permission android:name="android.permission.%s" tools:node="remove" />\n</manifest>' % perm, 1)

open(mp, 'w', encoding='utf-8').write(m)
print('widget + deep links + no-backup + data extraction rules injected')
