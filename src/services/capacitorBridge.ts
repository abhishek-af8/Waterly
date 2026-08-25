// Bridge service to communicate with Native Android Capacitor Plugin (WaterlyReminder)

export interface NativeReminderPlugin {
  triggerFullScreenReminder(options: { title: string; body: string }): Promise<{ success: boolean }>;
  scheduleExactAlarm(options: { triggerAtMs: number; title: string; body: string }): Promise<{ success: boolean }>;
  cancelAlarm(): Promise<{ success: boolean }>;
  checkPendingReminder(): Promise<{ hasPendingReminder: boolean }>;
  bringToForeground(): Promise<{ success: boolean }>;
  addListener(eventName: string, listenerFunc: (data: any) => void): Promise<{ remove: () => void }>;
}

export class CapacitorBridge {
  public static isNativeAndroid(): boolean {
    if (typeof window === 'undefined') return false;
    const win = window as any;
    return !!(
      win.Capacitor &&
      (win.Capacitor.getPlatform() === 'android' || win.Capacitor.isNativePlatform?.())
    );
  }

  private static getPlugin(): NativeReminderPlugin | null {
    if (typeof window === 'undefined') return null;
    const win = window as any;
    if (win.Capacitor?.Plugins?.WaterlyReminder) {
      return win.Capacitor.Plugins.WaterlyReminder as NativeReminderPlugin;
    }
    return null;
  }

  public static async checkPendingReminder(): Promise<boolean> {
    const plugin = this.getPlugin();
    if (!plugin) return false;
    try {
      const res = await plugin.checkPendingReminder();
      return !!res?.hasPendingReminder;
    } catch (e) {
      console.warn('[CapacitorBridge] checkPendingReminder error:', e);
      return false;
    }
  }

  public static addReminderListener(callback: () => void): () => void {
    const plugin = this.getPlugin();
    if (!plugin || typeof plugin.addListener !== 'function') {
      return () => {};
    }
    let removeHandle: (() => void) | null = null;
    plugin.addListener('reminderTriggered', () => {
      console.log('[CapacitorBridge] reminderTriggered event received from native layer');
      callback();
    }).then(handle => {
      removeHandle = () => handle?.remove?.();
    }).catch(err => {
      console.warn('[CapacitorBridge] addListener error:', err);
    });

    return () => {
      if (removeHandle) removeHandle();
    };
  }

  public static async triggerNativeFullScreenReminder(
    title = '💧 Time to hydrate! — Waterly',
    body = 'Your body is asking for some water. Take a refreshing sip now.'
  ): Promise<boolean> {
    const plugin = this.getPlugin();
    if (!plugin) return false;
    try {
      console.log('[CapacitorBridge] Triggering Native Full-Screen Reminder Intent...');
      const res = await plugin.triggerFullScreenReminder({ title, body });
      return !!res?.success;
    } catch (e) {
      console.warn('[CapacitorBridge] Failed to trigger native full-screen reminder:', e);
      return false;
    }
  }

  public static async scheduleNativeAlarm(
    triggerAtMs: number,
    title = '💧 Time to hydrate! — Waterly',
    body = 'Your body is asking for some water. Take a refreshing sip now.'
  ): Promise<boolean> {
    const plugin = this.getPlugin();
    if (!plugin) return false;
    try {
      console.log('[CapacitorBridge] Scheduling Native Exact Alarm at', new Date(triggerAtMs).toLocaleTimeString());
      const res = await plugin.scheduleExactAlarm({ triggerAtMs, title, body });
      return !!res?.success;
    } catch (e) {
      console.warn('[CapacitorBridge] Failed to schedule native alarm:', e);
      return false;
    }
  }

  public static async cancelNativeAlarm(): Promise<boolean> {
    const plugin = this.getPlugin();
    if (!plugin) return false;
    try {
      const res = await plugin.cancelAlarm();
      return !!res?.success;
    } catch (e) {
      console.warn('[CapacitorBridge] Failed to cancel native alarm:', e);
      return false;
    }
  }

  public static async bringAppToForeground(): Promise<boolean> {
    const plugin = this.getPlugin();
    if (!plugin) return false;
    try {
      const res = await plugin.bringToForeground();
      return !!res?.success;
    } catch (e) {
      console.warn('[CapacitorBridge] bringAppToForeground error:', e);
      return false;
    }
  }
}
