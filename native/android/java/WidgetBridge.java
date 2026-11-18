package com.hamedaldahash.vigoris;

import android.content.Context;
import android.content.SharedPreferences;
import android.view.WindowManager;
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

    /** إخفاء محتوى التطبيق في قائمة التطبيقات المفتوحة عند تفعيل القفل */
    @PluginMethod
    public void setSecure(PluginCall call) {
        final boolean on = Boolean.TRUE.equals(call.getBoolean("on", false));
        getActivity().runOnUiThread(() -> {
            if (on) getActivity().getWindow().addFlags(WindowManager.LayoutParams.FLAG_SECURE);
            else getActivity().getWindow().clearFlags(WindowManager.LayoutParams.FLAG_SECURE);
            call.resolve();
        });
    }
}
