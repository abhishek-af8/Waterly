package com.waterly.hydration;

import android.app.KeyguardManager;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.view.WindowManager;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Register custom native Waterly plugin BEFORE super.onCreate
        registerPlugin(WaterlyReminderPlugin.class);

        super.onCreate(savedInstanceState);

        // Apply lock screen wake and display flags
        applyLockScreenAndWakeFlags();

        // Check if opened from reminder intent
        handleReminderIntent(getIntent());

        // Ensure high priority notification channel is created
        WaterlyReminderPlugin.createNotificationChannel(this);
    }

    @Override
    public void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        applyLockScreenAndWakeFlags();
        handleReminderIntent(intent);
    }

    @Override
    public void onResume() {
        super.onResume();
        applyLockScreenAndWakeFlags();
        handleReminderIntent(getIntent());
    }

    @Override
    public void onAttachedToWindow() {
        super.onAttachedToWindow();
        applyLockScreenAndWakeFlags();
    }

    private void handleReminderIntent(Intent intent) {
        if (intent != null && intent.getBooleanExtra("fromReminder", false)) {
            WaterlyReminderPlugin.setPendingReminder(true);
        }
    }

    private void applyLockScreenAndWakeFlags() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            setShowWhenLocked(true);
            setTurnScreenOn(true);
            KeyguardManager keyguardManager = (KeyguardManager) getSystemService(Context.KEYGUARD_SERVICE);
            if (keyguardManager != null) {
                keyguardManager.requestDismissKeyguard(this, null);
            }
        }

        getWindow().addFlags(
            WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED |
            WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD |
            WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON |
            WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON |
            WindowManager.LayoutParams.FLAG_ALLOW_LOCK_WHILE_SCREEN_ON
        );
    }
}
