import { useCallback, useEffect, useState } from 'react';
import { notificationService, NotificationResult, NotificationStatus } from '../services/notificationService';

export function useNotifications() {
  const [status, setStatus] = useState<NotificationStatus>(() => notificationService.getStatus());

  useEffect(() => {
    setStatus(notificationService.getStatus());
  }, []);

  const requestPermission = useCallback(async (): Promise<NotificationStatus> => {
    const result = await notificationService.requestPermission();
    setStatus(result);
    return result;
  }, []);

  const sendTestNotification = useCallback(async (): Promise<NotificationResult> => {
    const result = await notificationService.sendHydrationNotification(
      '💧 Waterly — Hydration Check',
      'Time for a refreshing glass of water!'
    );
    setStatus(notificationService.getStatus());
    return result;
  }, []);

  return {
    status,
    isSupported: notificationService.isSupported(),
    requestPermission,
    sendTestNotification,
  };
}

