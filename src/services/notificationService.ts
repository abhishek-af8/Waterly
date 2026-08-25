export type NotificationStatus = 'granted' | 'denied' | 'default' | 'unsupported';

export interface NotificationResult {
  success: boolean;
  status: NotificationStatus;
  error?: string;
}

// Generate a valid PNG data URI icon for OS notification daemons
function getWaterlyPngIcon(): string {
  if (typeof document === 'undefined') return '';
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 192;
    canvas.height = 192;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // Dark rounded background
    ctx.fillStyle = '#082f49';
    ctx.beginPath();
    ctx.arc(96, 96, 90, 0, Math.PI * 2);
    ctx.fill();

    // Cyan droplet
    ctx.fillStyle = '#06b6d4';
    ctx.beginPath();
    ctx.moveTo(96, 36);
    ctx.bezierCurveTo(96, 36, 148, 98, 148, 126);
    ctx.arc(96, 126, 52, 0, Math.PI);
    ctx.bezierCurveTo(44, 98, 96, 36, 96, 36);
    ctx.closePath();
    ctx.fill();

    return canvas.toDataURL('image/png');
  } catch {
    return '';
  }
}

class NotificationService {
  private swRegistration: ServiceWorkerRegistration | null = null;
  private hasInitializedSW = false;

  constructor() {
    this.initServiceWorker();
  }

  public async initServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return null;
    }
    if (this.swRegistration) return this.swRegistration;

    try {
      const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      this.swRegistration = reg;
      this.hasInitializedSW = true;
      return reg;
    } catch (e) {
      console.warn('[Waterly Notification] Service Worker registration attempt:', e);
      return null;
    }
  }

  public getStatus(): NotificationStatus {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported';
    }
    return Notification.permission;
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  public async requestPermission(): Promise<NotificationStatus> {
    if (!this.isSupported()) {
      return 'unsupported';
    }
    try {
      console.log('[Waterly Notification] Requesting notification permission...');
      const permission = await Notification.requestPermission();
      console.log('[Waterly Notification] Permission result:', permission);
      return permission;
    } catch (e) {
      console.error('[Waterly Notification] Failed to request notification permission:', e);
      return this.getStatus();
    }
  }

  public async sendHydrationNotification(
    title = '💧 Waterly — Hydration Check',
    body = 'Time for a refreshing glass of water!'
  ): Promise<NotificationResult> {
    const isIframe = typeof window !== 'undefined' && window.self !== window.top;
    const initialStatus = this.getStatus();

    console.group('[Waterly Notification Pipeline]');
    console.log('1. Button clicked / Notification triggered');
    console.log('2. Current Notification.permission:', initialStatus);
    console.log('3. Context Environment:', {
      isSupported: this.isSupported(),
      inIframe: isIframe,
      hasServiceWorker: typeof navigator !== 'undefined' && 'serviceWorker' in navigator,
      protocol: typeof window !== 'undefined' ? window.location.protocol : 'unknown',
      origin: typeof window !== 'undefined' ? window.location.origin : 'unknown',
    });

    if (!this.isSupported()) {
      const err = 'Notifications are not supported by this browser.';
      console.error('4. Failure:', err);
      console.groupEnd();
      return { success: false, status: 'unsupported', error: err };
    }

    let currentStatus = initialStatus;
    if (currentStatus === 'default') {
      currentStatus = await this.requestPermission();
      console.log('2b. Updated permission after prompt:', currentStatus);
    }

    if (currentStatus !== 'granted') {
      const errorMsg =
        currentStatus === 'denied'
          ? 'Notification permission is blocked. Please allow notifications in your browser site settings.'
          : 'Notification permission was dismissed or not granted.';
      console.warn('4. Failure (permission not granted):', errorMsg);
      console.groupEnd();
      return {
        success: false,
        status: currentStatus,
        error: errorMsg,
      };
    }

    const pngIcon = getWaterlyPngIcon();
    const notificationTag = `waterly-${Date.now()}`;
    let dispatchedSuccessfully = false;
    let lastError: string | null = null;

    // Strategy A: Service Worker showNotification (Primary on Android and background tabs)
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      try {
        console.log('3a. Attempting dispatch via Service Worker showNotification...');
        let reg = this.swRegistration;
        if (!reg) {
          reg = await this.initServiceWorker();
        }
        if (!reg) {
          reg = await navigator.serviceWorker.getRegistration();
        }

        if (reg) {
          await reg.showNotification(title, {
            body,
            icon: pngIcon || undefined,
            badge: pngIcon || undefined,
            tag: notificationTag,
            silent: false,
          });
          dispatchedSuccessfully = true;
          console.log('4a. Successfully dispatched via Service Worker Registration!');
        }
      } catch (swErr) {
        lastError = swErr instanceof Error ? swErr.message : String(swErr);
        console.warn('3a. SW showNotification caught error:', swErr);
      }
    }

    // Strategy B: Standard Window Notification constructor (Direct desktop browser API)
    if (!dispatchedSuccessfully) {
      try {
        console.log('3b. Attempting dispatch via direct window Notification API...');
        const notif = new Notification(title, {
          body,
          icon: pngIcon || undefined,
          tag: notificationTag,
          silent: false,
        });

        notif.onshow = () => {
          console.log('4b. Notification.onshow event fired — display confirmed by OS!');
        };
        notif.onerror = (e) => {
          console.error('4b. Notification.onerror event fired:', e);
        };
        notif.onclick = () => {
          window.focus();
          notif.close();
        };

        dispatchedSuccessfully = true;
        console.log('4b. Successfully dispatched via window Notification constructor!');
      } catch (directErr) {
        lastError = directErr instanceof Error ? directErr.message : String(directErr);
        console.error('3b. Direct Notification constructor failed:', directErr);
      }
    }

    // Fallback attempt: minimal options if icon/tags caused issues
    if (!dispatchedSuccessfully) {
      try {
        console.log('3c. Attempting basic fallback Notification without options...');
        const simpleNotif = new Notification(title, { body });
        simpleNotif.onclick = () => {
          window.focus();
          simpleNotif.close();
        };
        dispatchedSuccessfully = true;
        console.log('4c. Successfully dispatched basic fallback Notification!');
      } catch (fallbackErr) {
        lastError = fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr);
        console.error('3c. Basic fallback Notification failed:', fallbackErr);
      }
    }

    if (!dispatchedSuccessfully) {
      const formattedError = isIframe
        ? `Browser blocked notification inside embedded preview (${lastError || 'Permissions policy'}). Open app in a new tab to see OS notifications.`
        : `Could not trigger notification: ${lastError || 'Browser rejected the notification request.'}`;
      console.error('4. Overall Failure:', formattedError);
      console.groupEnd();
      return {
        success: false,
        status: currentStatus,
        error: formattedError,
      };
    }

    console.log('4. Notification pipeline complete (Success)');
    console.groupEnd();
    return { success: true, status: 'granted' };
  }
}

export const notificationService = new NotificationService();
