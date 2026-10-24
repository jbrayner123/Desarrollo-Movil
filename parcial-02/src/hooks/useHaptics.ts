// parcial-02/src/hooks/useHaptics.ts
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

export function useHaptics() {
  const vibrateSuccess = async (duration = 500) => {
    try {
      await Haptics.vibrate({ duration });
    } catch {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(duration);
      }
    }
  };

  const impactHeavy = async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    } catch {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(50);
      }
    }
  };

  const notificationSuccess = async () => {
    try {
      await Haptics.notification({ type: NotificationType.Success });
    } catch {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
    }
  };

  return {
    vibrateSuccess,
    impactHeavy,
    notificationSuccess
  };
}
