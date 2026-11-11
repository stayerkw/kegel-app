package com.stayerkw.kegel;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.widget.RemoteViews;

/** ويدجت الشاشة الرئيسية: السلسلة، جلسات اليوم، أكواب الماء + زرّان سريعان */
public class KegelWidget extends AppWidgetProvider {
    static final String PREFS = "kegel_widget";

    @Override
    public void onUpdate(Context c, AppWidgetManager m, int[] ids) {
        for (int id : ids) m.updateAppWidget(id, build(c));
    }

    static RemoteViews build(Context c) {
        SharedPreferences p = c.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        RemoteViews v = new RemoteViews(c.getPackageName(), R.layout.kegel_widget);
        v.setTextViewText(R.id.w_day, c.getString(R.string.w_day_fmt, p.getString("day", "1")));
        v.setTextViewText(R.id.w_streak, p.getString("streak", "0"));
        v.setTextViewText(R.id.w_sessions, p.getString("done", "0") + "/" + p.getString("need", "3"));
        v.setTextViewText(R.id.w_water, p.getString("water", "0") + "/" + p.getString("waterGoal", "8"));
        boolean dayDone = p.getBoolean("dayDone", false);
        v.setTextViewText(R.id.w_go, c.getString(dayDone ? R.string.w_extra : R.string.w_go));
        v.setOnClickPendingIntent(R.id.w_root, link(c, "kegel://home", 30));
        v.setOnClickPendingIntent(R.id.w_go, link(c, "kegel://session", 31));
        v.setOnClickPendingIntent(R.id.w_add_water, link(c, "kegel://water", 32));
        return v;
    }

    static PendingIntent link(Context c, String uri, int requestCode) {
        Intent i = new Intent(Intent.ACTION_VIEW, Uri.parse(uri));
        i.setPackage(c.getPackageName());
        i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        return PendingIntent.getActivity(c, requestCode, i,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    static void refreshAll(Context c) {
        AppWidgetManager m = AppWidgetManager.getInstance(c);
        int[] ids = m.getAppWidgetIds(new ComponentName(c, KegelWidget.class));
        for (int id : ids) m.updateAppWidget(id, build(c));
    }
}
