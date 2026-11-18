import sys,re
P='/home/claude/kegel-app/www/index.html'; s=open(P,encoding='utf-8').read()
def rep(a,b,c=1):
    global s
    if s.count(a)!=c: sys.exit('X %d %s'%(s.count(a),a[:90]))
    s=s.replace(a,b)
rep("const LN = plug('LocalNotifications')","const LN = wrapLN(plug('LocalNotifications'))")
ENGINE=r"""/* ============ اللغات: الإنجليزية والصياغة بالمؤنث ============ */
const AR_RE=/[\u0600-\u06FF]/, NUM_RE=/\d+([.:,]\d+)*/g;
let _pat=null, _femRe=null;
const reEsc=x=>x.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
function patList(){ if(_pat) return _pat; _pat=((window.I18N&&I18N.enPat)||[]).map(([a,b])=>[new RegExp('^'+reEsc(a).replace(/\\\{s\\\}/g,'(.+?)')+'$'),b]); return _pat; }
function trEn(k){ if(!window.I18N) return null; const d=I18N.en[k]; if(d!=null) return d;
  for(const [re,b] of patList()){ const m=k.match(re); if(m){ let j=1; return b.replace(/\{s\}/g,()=>{ const g=m[j++]||''; if(!AR_RE.test(g)) return g; const r=trEn(g.trim()); return r==null?g:r; }); } }
  return null; }
function feminize(t){ if(!window.I18N) return t;
  for(const [a,b] of I18N.femP) if(t.includes(a)&&!t.includes(b)) t=t.split(a).join(b);
  if(!_femRe){ const ws=Object.keys(I18N.femW).sort((a,b)=>b.length-a.length).map(reEsc); _femRe=new RegExp('(^|[\\s«(\\-—،.:؛!؟"])([وف]?)('+ws.join('|')+')(?=$|[\\s».,،؛:!؟)\\-—…"])','g'); }
  return t.replace(_femRe,(m,p,c,w)=>p+c+I18N.femW[w]); }
function trText(t){
  if(!t||typeof t!=='string'||!AR_RE.test(t)) return t;
  if(LANG==='en'){ const lead=t.match(/^\s*/)[0], trail=t.match(/\s*$/)[0], nums=[]; const k=t.replace(/\s+/g,' ').trim().replace(NUM_RE,x=>{ nums.push(x); return '{n}'; }); const v=trEn(k); if(v==null) return t; let i=0; return lead+v.replace(/\{n\}/g,()=>nums[i++]??'')+trail; }
  if(isFem()) return feminize(t);
  return t;
}
const T=trText;
const _l10nDone=new WeakMap(), _l10nAttr=new WeakMap();
function l10n(root){
  if(!root||(LANG!=='en'&&!isFem())) return;
  if(root.nodeType===3){ root=root.parentNode; if(!root) return; }
  if(root.nodeType!==1&&root.nodeType!==11) return;
  const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT); let n;
  while((n=w.nextNode())){ const v=n.nodeValue; if(_l10nDone.get(n)===v||!AR_RE.test(v)) continue; const p=n.parentElement; if(p&&p.closest('script,style,[data-noi18n]')) continue; const o=trText(v); _l10nDone.set(n,o); if(o!==v) n.nodeValue=o; }
  [root,...root.querySelectorAll('[aria-label],[title],[placeholder],[alt]')].forEach(e=>{ if(!e.getAttribute) return; let mm=_l10nAttr.get(e); if(!mm){ mm={}; _l10nAttr.set(e,mm); }
    ['aria-label','title','placeholder','alt'].forEach(a=>{ const v=e.getAttribute(a); if(!v||!AR_RE.test(v)||mm[a]===v) return; const o=trText(v); mm[a]=o; if(o!==v) e.setAttribute(a,o); }); });
}
function startL10n(){
  document.documentElement.lang=LANG==='en'?'en':'ar'; document.documentElement.dir=LANG==='en'?'ltr':'rtl';
  if(LANG!=='en'&&!isFem()) return;
  document.title=trText(document.title); l10n(document.body);
  new MutationObserver(ms=>{ for(const m of ms){ if(m.type==='characterData') l10n(m.target); else m.addedNodes.forEach(nd=>l10n(nd)); } }).observe(document.body,{childList:true,subtree:true,characterData:true});
}
function wrapLN(ln){ if(!ln) return ln; const tr=n=>Object.assign({},n,{title:T(n.title),body:T(n.body)});
  return new Proxy(ln,{get(t,k){ const f=t[k];
    if(k==='schedule') return o=>f.call(t,Object.assign({},o,{notifications:(o.notifications||[]).map(tr)}));
    if(k==='createChannel') return o=>f.call(t,Object.assign({},o,{name:T(o.name)}));
    if(k==='registerActionTypes') return o=>f.call(t,{types:(o.types||[]).map(ty=>Object.assign({},ty,{actions:(ty.actions||[]).map(a=>Object.assign({},a,{title:T(a.title)}))}))});
    return typeof f==='function'?f.bind(t):f; }}); }
function isFem(){"""
rep("function isFem(){",ENGINE)
s=s.replace("TTS.speak({text:t,lang:'ar-SA',","TTS.speak({text:t,lang:LANG==='en'?'en-US':'ar-SA',",1)
s=s.replace("u.lang='ar-SA';","u.lang=LANG==='en'?'en-US':'ar-SA';",1)
rep("  return L1.join('\\n');\n}","  return L1.map(T).join('\\n');\n}")
rep("  return {subj,body:head.join('\\n')+reportText(days,true)+'\\n\\nمع الشكر،\\n'+(d.patient||'')};","  return {subj:T(subj),body:head.map(T).join('\\n')+reportText(days,true)+'\\n\\n'+T('مع الشكر،')+'\\n'+(d.patient||'')};")
rep("""  if(S.diabetes){ const ck=CHECKS.map(([k,t])=>t.split(':')[0].split('(')[0].trim()+': '+(checkLast(k)||'لم يُسجَّل')).join(' | '); L1.push('• آخر الفحوص الدورية: '+ck+'.'); }""",
"""  if(S.diabetes){ const ck=CHECKS.map(([k,t])=>T(t)+': '+(checkLast(k)||T('لم يُسجَّل'))).join(' | '); L1.push(T('• آخر الفحوص الدورية:')+' '+ck+'.'); }""")
s=s.replace("toLocaleString('ar')","toLocaleString(LANG==='en'?'en':'ar')")
rep("new Intl.DateTimeFormat('ar',{day:'numeric',month:'short',year:'numeric',numberingSystem:'latn'})","new Intl.DateTimeFormat(LANG==='en'?'en':'ar',{day:'numeric',month:'short',year:'numeric',numberingSystem:'latn'})")
rep("new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura',{day:'numeric',month:'long',numberingSystem:'latn'})","new Intl.DateTimeFormat(LANG==='en'?'en-u-ca-islamic-umalqura':'ar-SA-u-ca-islamic-umalqura',{day:'numeric',month:'long',numberingSystem:'latn'})")
rep("""<p>كل ${d.every} يومًا · ${d.last?'آخر إرسال '+fd(d.last)+' · ':''}${d.on?'الموعد القادم '+fd(docNext()):'التذكير متوقف'}${d.fileNo?' · ملف '+esc(d.fileNo):''}</p>""",
"""<p><span>كل ${d.every} يومًا</span>${d.last?` · <span>آخر إرسال ${fd(d.last)}</span>`:''} · <span>${d.on?'الموعد القادم '+fd(docNext()):'التذكير متوقف'}</span>${d.fileNo?` · <span>ملف ${esc(d.fileNo)}</span>`:''}</p>""")
s=s.replace('<button class="btn ghost sm" id="langT" style="width:auto"','<button class="btn ghost sm" id="langT" data-noi18n style="width:auto"',1)
s=s.replace('<select id="lgS">','<select id="lgS" data-noi18n>',1)
rep("rollover(); render();\nif(!S.ctryInit)","startL10n();\nrollover(); render();\nif(!S.ctryInit)")
rep("/* 2.5 */","/* 2.5 */\nhtml[dir=ltr] body{direction:ltr}")
open(P,'w',encoding='utf-8').write(s)
print('ok')
