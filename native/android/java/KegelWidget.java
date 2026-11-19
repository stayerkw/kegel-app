package com.hamedaldahash.vigoris;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.view.View;
import android.widget.RemoteViews;
import android.widget.Toast;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

/**
 * ويدجت الشاشة الرئيسية: السلسلة، حلقتا تقدّم (الجلسات والماء)، وزرّان سريعان.
 * - يصفّر أرقام اليوم تلقائيًا بعد منتصف الليل حتى لو لم يُفتح التطبيق.
 * - زر الماء يضيف كوبًا في الخلفية دون فتح التطبيق، ويستلمه التطبيق عند فتحه (consumePendingWater).
 * - الوضع المحايد يخفي أي نص يكشف طبيعة التطبيق.
 */
public class KegelWidget extends AppWidgetProvider {
    static final String PREFS = "kegel_widget";
    static final String ACTION_ADD_WATER = "com.hamedaldahash.vigoris.ACTION_ADD_WATER";

    static String today() {
        return new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(new Date());
    }

    static int num(SharedPreferences p, String k, int def) {
        try { return Integer.parseInt(p.getString(k, String.valueOf(def))); } catch (Exception e) { return def; }
    }

    /** يوم جديد ولم يُحدّث التطبيق الويدجت بعد: أرقام اليوم تبدأ من الصفر */
    static boolean stale(SharedPreferences p) {
        String d = p.getString("updatedDate", null);
        return d != null && !d.equals(today());
    }

    @Override
    public void onUpdate(Context c, AppWidgetManager m, int[] ids) {
        for (int id : ids) m.updateAppWidget(id, build(c));
    }

    @Override
    public void onReceive(Context c, Intent i) {
        super.onReceive(c, i);
        if (!ACTION_ADD_WATER.equals(i.getAction())) return;
        SharedPreferences p = c.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        SharedPreferences.Editor e = p.edit();
        String t = today();
        if (stale(p)) {
            e.putString("done", "0").putString("water", "0").putBoolean("dayDone", false).putString("updatedDate", t);
        }
        int water = stale(p) ? 0 : num(p, "water", 0);
        e.putString("water", String.valueOf(water + 1));
        // الإضافات المعلّقة تُحفظ مع تاريخها («2026-11-20:2;…») حتى يسجّلها التطبيق في يومها الصحيح
        e.putString("pending", addPending(p.getString("pending", ""), t));
        e.apply();
        refreshAll(c);
        boolean en = "en".equals(p.getString("lang", "ar"));
        Toast.makeText(c, en ? "Glass of water added" : c.getString(R.string.w_water_added), Toast.LENGTH_SHORT).show();
    }

    static String addPending(String log, String day) {
        StringBuilder out = new StringBuilder(); boolean hit = false;
        for (String part : log.split(";")) {
            if (part.isEmpty()) continue;
            String[] kv = part.split(":");
            if (kv.length == 2 && kv[0].equals(day)) {
                int n; try { n = Integer.parseInt(kv[1]); } catch (Exception x) { n = 0; }
                out.append(day).append(':').append(n + 1).append(';'); hit = true;
            } else out.append(part).append(';');
        }
        if (!hit) out.append(day).append(":1;");
        return out.toString();
    }

    static RemoteViews build(Context c) {
        SharedPreferences p = c.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        boolean en = "en".equals(p.getString("lang", "ar"));
        boolean discreet = p.getBoolean("discreet", false);
        boolean old = stale(p);
        RemoteViews v = new RemoteViews(c.getPackageName(), en ? R.layout.kegel_widget_en : R.layout.kegel_widget);

        int need = Math.max(1, num(p, "need", 3));
        int done = old ? 0 : num(p, "done", 0);
        int goal = Math.max(1, num(p, "waterGoal", 8));
        int water = old ? 0 : num(p, "water", 0);
        boolean dayDone = !old && p.getBoolean("dayDone", false);

        v.setTextViewText(R.id.w_streak, p.getString("streak", "0"));
        v.setTextViewText(R.id.w_day, discreet ? "" : c.getString(en ? R.string.w_day_fmt_en : R.string.w_day_fmt, p.getString("day", "1")));
        v.setViewVisibility(R.id.w_day, discreet ? View.GONE : View.VISIBLE);

        v.setTextViewText(R.id.w_sessions, done + "/" + need);
        v.setProgressBar(R.id.w_ring_train, 100, Math.min(100, done * 100 / need), false);
        v.setTextViewText(R.id.w_water, water + "/" + goal);
        v.setProgressBar(R.id.w_ring_water, 100, Math.min(100, water * 100 / goal), false);
        v.setTextViewText(R.id.w_sessions_lbl, discreet ? "" : c.getString(en ? R.string.w_sessions_lbl_en : R.string.w_sessions_lbl));
        v.setViewVisibility(R.id.w_sessions_lbl, discreet ? View.GONE : View.VISIBLE);
        v.setTextViewText(R.id.w_water_lbl, c.getString(en ? R.string.w_water_lbl_en : R.string.w_water_lbl));
        v.setInt(R.id.ic_w_check_i, "setColorFilter", 0xFF22D3EE);
        v.setInt(R.id.ic_w_drop_i, "setColorFilter", 0xFF38BDF8);

        int go = discreet ? (en ? R.string.w_go_discreet_en : R.string.w_go_discreet)
                : dayDone ? (en ? R.string.w_extra_en : R.string.w_extra)
                : (en ? R.string.w_go_en : R.string.w_go);
        v.setTextViewText(R.id.w_go, c.getString(go));
        v.setTextViewText(R.id.w_add_water, c.getString(en ? R.string.w_add_water_en : R.string.w_add_water));

        v.setOnClickPendingIntent(R.id.w_root, link(c, "vigoris://home", 30));
        v.setOnClickPendingIntent(R.id.w_go, link(c, "vigoris://session", 31));
        Intent add = new Intent(c, KegelWidget.class).setAction(ACTION_ADD_WATER);
        v.setOnClickPendingIntent(R.id.w_add_water, PendingIntent.getBroadcast(c, 32, add,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE));
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
