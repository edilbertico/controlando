import * as Notifications from 'expo-notifications';
import { User, Med } from '../types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const CATEGORY_MED = 'MED_REMINDER';

export async function requestNotifPermission(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function configureMedCategory() {
  await Notifications.setNotificationCategoryAsync(CATEGORY_MED, [
    { identifier: 'TOMAR', buttonTitle: 'Tomar', options: { opensAppToForeground: false } },
    { identifier: 'POSPONER', buttonTitle: 'Posponer 15 min', options: { opensAppToForeground: false } },
  ]);
}

function timeToTrigger(t: string): Notifications.NotificationTriggerInput {
  const [h, m] = t.split(':').map(Number);
  return { hour: h, minute: m, repeats: true } as Notifications.NotificationTriggerInput;
}

export async function scheduleAllMeds(user: User) {
  await cancelAllMeds();
  for (const med of user.meds) {
    for (const t of med.schedule) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `💊 Hora de tu medicamento`,
          body: `${med.name} — ${med.dose} (${med.presentation})`,
          data: { medId: med.id, type: 'med' },
          categoryIdentifier: CATEGORY_MED,
        },
        trigger: timeToTrigger(t),
      });
    }
  }
}

export async function cancelAllMeds() {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const n of scheduled) {
    if (n.content.data?.type === 'med') await Notifications.cancelScheduledNotificationAsync(n.identifier);
  }
}

export async function scheduleSnooze(medId: string, medName: string, inMin = 15) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `💊 Recordatorio pospuesto`,
      body: `${medName} — confirma cuando lo tomes`,
      data: { medId, type: 'med' },
      categoryIdentifier: CATEGORY_MED,
    },
    trigger: { seconds: inMin * 60, repeats: false } as Notifications.NotificationTriggerInput,
  });
}

export function lowStockMeds(user: User): Med[] {
  return user.meds.filter((m) => m.inventory <= m.threshold);
}
