package com.hamedaldahash.vigoris;

import android.app.Activity;
import android.content.Context;
import android.content.SharedPreferences;
import android.view.WindowManager;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/** جسر بين التطبيق والويدجت: يحفظ آخر الأرقام ويحدّث الويدجت فورًا، ويسلّم أكواب الماء المضافة من الويدجت */
@CapacitorPlugin(name = "WidgetBridge")
public class WidgetBridge extends Plugin {
    @PluginMethod
    public void update(PluginCall call) {
        SharedPreferences.Editor e = getContext()
                .getSharedPreferences(KegelWidget.PREFS, Context.MODE_PRIVATE).edit();
        for (String k : new String[]{"day", "streak", "done", "need", "water", "waterGoal", "lang"}) {
            String v = call.getString(k);
            if (v != null) e.putString(k, v);
        }
        Boolean dd = call.getBoolean("dayDone", false);
        e.putBoolean("dayDone", dd != null && dd);
        Boolean ds = call.getBoolean("discreet", false);
        e.putBoolean("discreet", ds != null && ds);
        // تاريخ آخر تحديث: بعد منتصف الليل يعرض الويدجت أرقام اليوم الجديد من الصفر
        e.putString("updatedDate", KegelWidget.today());
        e.apply();
        KegelWidget.refreshAll(getContext());
        call.resolve();
    }

    /** يعيد أكواب الماء المضافة من الويدجت لكل يوم ثم يصفّرها: [{date, n}] */
    @PluginMethod
    public void consumePendingWater(PluginCall call) {
        SharedPreferences p = getContext().getSharedPreferences(KegelWidget.PREFS, Context.MODE_PRIVATE);
        String log = p.getString("pending", "");
        p.edit().putString("pending", "").apply();
        JSArray items = new JSArray();
        for (String part : log.split(";")) {
            String[] kv = part.split(":");
            if (kv.length != 2) continue;
            try {
                JSObject o = new JSObject();
                o.put("date", kv[0]);
                o.put("n", Integer.parseInt(kv[1]));
                items.put(o);
            } catch (Exception ignored) { }
        }
        JSObject r = new JSObject();
        r.put("items", items);
        call.resolve(r);
    }

    /** إخفاء محتوى التطبيق في قائمة التطبيقات المفتوحة عند تفعيل القفل */
    @PluginMethod
    public void setSecure(PluginCall call) {
        final boolean on = Boolean.TRUE.equals(call.getBoolean("on", false));
        final Activity a = getActivity();
        if (a == null) { call.resolve(); return; }   // استدعاء أثناء إغلاق الشاشة: لا انهيار
        a.runOnUiThread(() -> {
            if (a.isFinishing() || a.getWindow() == null) { call.resolve(); return; }
            if (on) a.getWindow().addFlags(WindowManager.LayoutParams.FLAG_SECURE);
            else a.getWindow().clearFlags(WindowManager.LayoutParams.FLAG_SECURE);
            call.resolve();
        });
    }
}
