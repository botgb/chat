// Configurações do app, guardadas no aparelho. Lembretes são notificações locais (sem servidor).
import { Platform } from 'react-native';
import type { ThemeMode } from '../theme/ThemeContext';

export type Profile = {
  nome: string;
  sobrenome: string;
  usuario: string;
  email: string;
  telefone: string;
};

export type TextSize = 'normal' | 'grande' | 'maior';
export const TEXT_SCALE: Record<TextSize, number> = { normal: 1, grande: 1.15, maior: 1.3 };
export const TEXT_SIZES: TextSize[] = ['normal', 'grande', 'maior'];

export type Settings = {
  theme: ThemeMode;
  textSize: TextSize;
  sound: boolean;
  vibration: boolean;
  notifications: {
    daily: boolean; // lembrete para estudar
    dailyHour: number;
    streak: boolean; // aviso à noite para não perder a ofensiva
  };
  profile: Profile;
};

export const REMINDER_HOURS = [8, 12, 18, 20];
export const STREAK_REMINDER_HOUR = 21;

export const defaultSettings = (): Settings => ({
  theme: 'system',
  textSize: 'normal',
  sound: true,
  vibration: true,
  notifications: { daily: false, dailyHour: 18, streak: false },
  profile: { nome: '', sobrenome: '', usuario: '', email: '', telefone: '' },
});

/** Mescla o que estava salvo com os padrões, para tolerar versões antigas. */
export function mergeSettings(saved: Partial<Settings> | null): Settings {
  const d = defaultSettings();
  if (!saved) return d;
  return {
    ...d,
    ...saved,
    notifications: { ...d.notifications, ...saved.notifications },
    profile: { ...d.profile, ...saved.profile },
  };
}

export const isValidEmail = (s: string) => s === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());

/** Formata telefone brasileiro enquanto digita: (11) 91234-5678. */
export function formatPhone(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : '';
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/** Vibração de acerto/erro, respeitando a preferência. */
export async function feedback(settings: Settings, kind: 'right' | 'wrong'): Promise<void> {
  if (!settings.vibration || Platform.OS === 'web') return;
  const Haptics = await import('expo-haptics');
  await Haptics.notificationAsync(
    kind === 'right' ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error,
  );
}

/**
 * Reagenda os lembretes conforme as configurações.
 * Devolve false se o usuário negou a permissão de notificações.
 */
export async function applyNotifications(n: Settings['notifications']): Promise<boolean> {
  if (Platform.OS === 'web') return true;
  const Notifications = await import('expo-notifications');
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!n.daily && !n.streak) return true;

  const perm = await Notifications.requestPermissionsAsync();
  if (!perm.granted) return false;

  const daily = Notifications.SchedulableTriggerInputTypes.DAILY;
  if (n.daily) {
    await Notifications.scheduleNotificationAsync({
      content: { title: 'Hora de estudar', body: 'Uma fase rápida mantém você no ritmo da prova.' },
      trigger: { type: daily, hour: n.dailyHour, minute: 0 },
    });
  }
  if (n.streak) {
    await Notifications.scheduleNotificationAsync({
      content: { title: 'Sua ofensiva está esperando', body: 'Cumpra a meta de hoje antes de dormir.' },
      trigger: { type: daily, hour: STREAK_REMINDER_HOUR, minute: 0 },
    });
  }
  return true;
}
