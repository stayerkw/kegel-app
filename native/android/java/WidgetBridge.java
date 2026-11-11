package com.stayerkw.kegel;

import android.content.Context;
import android.content.SharedPreferences;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/** جسر بين التطبيق والويدجت: يحفظ آخر الأرقام ويحدّث الويدجت فورًا */
@CapacitorPlugin(name = "WidgetBridge")
public class WidgetBridge extends Plugin {
    @PluginMethod
    public void update(PluginCall call) {
        SharedPreferences.Editor e = getContext()
                .getSharedPreferences(KegelWidget.PREFS, Context.MODE_PRIVATE).edit();
        for (String k : new String[]{"day", "streak", "done", "need", "water", "waterGoal"}) {
            String v = call.getString(k);
            if (v != null) e.putString(k, v);
        }
        Boolean dd = call.getBoolean("dayDone", false);
        e.putBoolean("dayDone", dd != null && dd);
        e.apply();
        KegelWidget.refreshAll(getContext());
        call.resolve();
    }
}
