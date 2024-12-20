import { useCallback, useEffect, useState } from 'react';
import { NotificationService, NotificationConfig } from '@/lib/services/notification';
import { useLineProfile } from './useLineProfile';

export function useWebNotifications(userId: string | null | undefined) {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const { profile } = useLineProfile(userId || null);

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    const granted = await NotificationService.requestPermission();
    if (granted) {
      setPermission('granted');
    }
    return granted;
  }, []);

  const showNotification = useCallback((content: string) => {
    if (!content.trim()) return { success: false, error: 'Empty content' };

    const config: NotificationConfig = {
      content,
      profile: profile || undefined
    };

    return NotificationService.show(config);
  }, [profile]);

  return {
    permission,
    requestPermission,
    showNotification
  };
}
