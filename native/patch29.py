import re
p='www/index.html'; s=open(p,encoding='utf-8').read()
dash=open('native/dash.js',encoding='utf-8').read()
def rep(a,b,cnt=1):
    global s
    assert s.count(a)==cnt,(a[:80],s.count(a)); s=s.replace(a,b)
rep('function renderHome(){', dash+'\nfunction renderHome(){')
# استبدال الهيرو القديم بلوحة التحكم
a=s.index('  app.innerHTML=`\n  <header class="hero">'); b=s.index('    ${nextBox}\n  </header>\n',a)+len('    ${nextBox}\n  </header>\n')
s=s[:a]+'  app.innerHTML=`\n  ${dashHTML(plan,done,dayDone,idx)}\n'+s[b:]
rep('  <div class="sec"><h2>خطة اليوم</h2>','  <div class="sec"><h2>خطة اليوم</h2>')
rep("  const go=$('#go'); if(go) go.onclick=()=>startSession('daily',plan,idx);","  bindDash();\n  const go=$('#go'); if(go) go.onclick=()=>startSession('daily',plan,idx);")
# ألوان التصميم
rep(':root{--bg:#F2F6FA;--card:#FFFFFF;--ink:#0B1B2B;--muted:#56677A;--line:#DFE7EF;--accent:#0E7490;--deep:#0B2545;--accent2:#22D3EE;--accentSoft:#DDF3F8;',
    ':root{--bg:#EEF5F9;--card:#FFFFFF;--ink:#0A2533;--muted:#5A6E7C;--line:#DCE9F0;--accent:#0A8E9E;--deep:#032736;--accent2:#14A7B8;--accentSoft:#D9EEF4;--title:#026D84;--gold:#E8A51B;--ringBg:#E1EEF3;--side:#032736;')
rep('body.dark{--bg:#07111D;--card:#0F1C2B;--ink:#E8F0F7;--muted:#93A3B5;--line:#1C2C3E;--accentSoft:#0C2E3A;--waterSoft:#10263A;',
    'body.dark{--bg:#061821;--card:#0C2430;--ink:#E6F1F5;--muted:#93AAB5;--line:#16323F;--accentSoft:#0B3340;--title:#5ED3E2;--ringBg:#173744;--accent2:#22C3D5;--waterSoft:#10263A;')
css=open('native/dash.css',encoding='utf-8').read()
rep('</style>', css+'\n</style>')
open(p,'w',encoding='utf-8').write(s); print('ok')
