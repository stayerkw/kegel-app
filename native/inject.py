"""يضيف الويدجت والروابط العميقة إلى مشروع أندرويد الذي يولّده Capacitor (يُشغَّل في البناء بعد cap add)."""
import os, shutil, sys
ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, 'android')
APP = sys.argv[1] if len(sys.argv) > 1 else 'android/app/src/main'

jdst = os.path.join(APP, 'java/com/stayerkw/kegel')
os.makedirs(jdst, exist_ok=True)
for f in os.listdir(os.path.join(SRC, 'java')):
    shutil.copy(os.path.join(SRC, 'java', f), jdst)
for d in os.listdir(os.path.join(SRC, 'res')):
    dst = os.path.join(APP, 'res', d); os.makedirs(dst, exist_ok=True)
    for f in os.listdir(os.path.join(SRC, 'res', d)):
        shutil.copy(os.path.join(SRC, 'res', d, f), dst)

mp = os.path.join(APP, 'AndroidManifest.xml')
m = open(mp, encoding='utf-8').read()
deep = '''            <intent-filter>
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="kegel" />
            </intent-filter>
'''
if 'android:scheme="kegel"' not in m:
    i = m.index('</intent-filter>') + len('</intent-filter>\n')
    m = m[:i] + deep + m[i:]
recv = '''        <receiver android:name=".KegelWidget" android:exported="false" android:label="@string/w_title">
            <intent-filter>
                <action android:name="android.appwidget.action.APPWIDGET_UPDATE" />
            </intent-filter>
            <meta-data android:name="android.appwidget.provider" android:resource="@xml/kegel_widget_info" />
        </receiver>
'''
if 'KegelWidget' not in m:
    m = m.replace('    </application>', recv + '    </application>', 1)
open(mp, 'w', encoding='utf-8').write(m)
print('widget + deep links injected')
