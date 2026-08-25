package com.waterly.hydration;

import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.PowerManager;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;

public class WaterlyAlarmReceiver extends BroadcastReceiver {

    @Override
    public void onReceive(Context context, Intent intent) {
        String title = intent.getStringExtra("title");
        if (title == null) title = "💧 Time to hydrate! — Waterly";
        String body = intent.getStringExtra("body");
        if (body == null) body = "Your body is asking for some water. Take a refreshing sip now.";

        // Ensure high-priority notification channel is present
        WaterlyReminderPlugin.createNotificationChannel(context);

        // 1. Wake screen & acquire temporary wake lock
        PowerManager pm = (PowerManager) context.getSystemService(Context.POWER_SERVICE);
        PowerManager.WakeLock wakeLock = null;
        if (pm != null) {
            wakeLock = pm.newWakeLock(
                PowerManager.SCREEN_BRIGHT_WAKE_LOCK | PowerManager.ACQUIRE_CAUSES_WAKEUP | PowerManager.ON_AFTER_RELEASE,
                "waterly:alarm_receiver"
            );
            wakeLock.acquire(15 * 1000L); // 15 seconds
        }

        // 2. Full-Screen Intent targeting MainActivity
        Intent fullScreenIntent = new Intent(context, MainActivity.class);
        fullScreenIntent.addFlags(
            Intent.FLAG_ACTIVITY_NEW_TASK |
            Intent.FLAG_ACTIVITY_SINGLE_TOP |
            Intent.FLAG_ACTIVITY_CLEAR_TOP
        );
        fullScreenIntent.putExtra("fromReminder", true);

        PendingIntent fullScreenPendingIntent = PendingIntent.getActivity(
            context,
            WaterlyReminderPlugin.NOTIFICATION_ID,
            fullScreenIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_IMMUTABLE : 0)
        );

        // 3. Post Notification with FullScreenIntent
        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, WaterlyReminderPlugin.CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_popup_reminder)
            .setContentTitle(title)
            .setContentText(body)
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setAutoCancel(true)
            .setVibrate(new long[]{0, 500, 200, 500})
            .setContentIntent(fullScreenPendingIntent)
            .setFullScreenIntent(fullScreenPendingIntent, true);

        NotificationManagerCompat notificationManager = NotificationManagerCompat.from(context);
        try {
            notificationManager.notify(WaterlyReminderPlugin.NOTIFICATION_ID, builder.build());
        } catch (SecurityException ignored) {
        }

        // 4. Also launch MainActivity directly
        try {
            context.startActivity(fullScreenIntent);
        } catch (Exception ignored) {
        }

        if (wakeLock != null && wakeLock.isHeld()) {
            try {
                wakeLock.release();
            } catch (Exception ignored) {}
        }
    }
}
