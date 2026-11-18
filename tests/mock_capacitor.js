
window.__sched=[]; window.__wb=[];
const mk=(n)=>({
  checkPermissions:async()=>({display:'granted'}), requestPermissions:async()=>({display:'granted'}),
  getPending:async()=>({notifications:[]}), cancel:async()=>{}, createChannel:async()=>{}, registerActionTypes:async()=>{},
  schedule:async(o)=>{window.__sched=o.notifications;}, addListener:(e,f)=>{window['__l_'+n+'_'+e]=f; return {remove(){}};},
  update:async(o)=>{window.__wb.push(o);}, impact:async()=>{}, notification:async()=>{}, vibrate:async()=>{},
  keepAwake:async()=>{}, speak:async(o)=>{window.__said=(window.__said||[]).concat([o.text]);}, openInstall:async()=>{}, allowSleep:async()=>{}, getLaunchUrl:async()=>({url:''}), exitApp(){}, changeExactNotificationSetting:async()=>{}
});
window.Capacitor={isNativePlatform:()=>true, registerPlugin:(n)=>mk(n)};

const _mk0=window.Capacitor.registerPlugin;
const now=Date.now();
window.Capacitor.registerPlugin=(n)=>{ const b=_mk0(n);
 if(n==='Health') Object.assign(b,{isAvailable:async()=>({available:true}),requestAuthorization:async()=>({readAuthorized:['steps','sleep','bloodGlucose','heartRate']}),
   queryAggregated:async(o)=>({samples:[0,1,2,3,4,5,6].map(i=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-6+i);return {startDate:d.toISOString(),endDate:d.toISOString(),value:[6200,8100,4300,7600,9100,5200,4380][i]};})}),
   readSamples:async(o)=>({samples:o.dataType==='sleep'?[{startDate:new Date(now-9*36e5).toISOString(),endDate:new Date(now-1.8*36e5).toISOString(),value:430}]:o.dataType==='bloodGlucose'?[{startDate:new Date(now-3*36e5).toISOString(),value:142,unit:'mg/dL',platformId:'g1'}]:o.dataType==='heartRate'?[{endDate:new Date().toISOString(),value:72}]:[{endDate:new Date().toISOString(),value:61}]}),
   openHealthConnectSettings:async()=>{}});
 if(n==='NativeBiometric') Object.assign(b,{isAvailable:async()=>({isAvailable:true}),verifyIdentity:async()=>{}});
 return b; };
