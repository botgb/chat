import { router } from 'expo-router';
import { ReactNode, useState } from 'react';
import { KeyboardAvoidingView, Linking, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { Chip } from '../components/Chip';
import { Sheet } from '../components/Sheet';
import { applyNotifications, defaultSettings, formatPhone, isValidEmail, Profile, REMINDER_HOURS, Settings, STREAK_REMINDER_HOUR } from '../lib/settings';
import { useApp } from '../state/AppState';
import type { ThemeMode } from '../theme/ThemeContext';
import { Colors, fonts, space, type } from '../theme';
import { useColors, useStyles } from '../theme/ThemeContext';

function Section({ title, children }: { title: string; children: ReactNode }) {
  const styles = useStyles(createStyles);
  return (
    <View style={{ gap: space(2) }}>
      <Text style={styles.section}>{title}</Text>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

function ToggleRow({ label, detail, value, onChange, last }: { label: string; detail?: string; value: boolean; onChange: (v: boolean) => void; last?: boolean }) {
  const colors = useColors();
  const styles = useStyles(createStyles);
  return (
    <View style={[styles.row, !last && styles.rowLine]}>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        {detail ? <Text style={styles.muted}>{detail}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        accessibilityLabel={label}
        trackColor={{ false: colors.locked, true: colors.right }}
        thumbColor="#fff"
        ios_backgroundColor={colors.locked}
      />
    </View>
  );
}

function Field({
  label,
  value,
  onChange,
  error,
  last,
  ...input
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  last?: boolean;
} & Pick<React.ComponentProps<typeof TextInput>, 'keyboardType' | 'autoCapitalize' | 'autoComplete' | 'secureTextEntry' | 'placeholder' | 'textContentType'>) {
  const colors = useColors();
  const styles = useStyles(createStyles);
  return (
    <View style={[styles.field, !last && styles.rowLine]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        style={[styles.input, error && { borderColor: colors.wrong }]}
        placeholderTextColor={colors.lockedDark}
        accessibilityLabel={label}
        autoCorrect={false}
        {...input}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

function DangerButton({ label, onPress }: { label: string; onPress: () => void }) {
  const styles = useStyles(createStyles);
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => [styles.danger, pressed && { opacity: 0.6 }]}>
      <Text style={styles.dangerText}>{label}</Text>
    </Pressable>
  );
}

const THEMES: { mode: ThemeMode; label: string }[] = [
  { mode: 'system', label: 'Automático' },
  { mode: 'light', label: 'Desligado' },
  { mode: 'dark', label: 'Ligado' },
];

const SUBSCRIPTIONS_URL = Platform.select({
  ios: 'https://apps.apple.com/account/subscriptions',
  android: 'https://play.google.com/store/account/subscriptions',
  default: undefined,
});

export default function Configuracoes() {
  const styles = useStyles(createStyles);
  const app = useApp();
  const s = app.settings;
  const [profile, setProfile] = useState<Profile>(s.profile);
  const [password, setPassword] = useState('');
  const [saved, setSaved] = useState(false);
  const [confirm, setConfirm] = useState<'signout' | 'delete' | 'delete2' | null>(null);
  const [notifError, setNotifError] = useState(false);

  const update = (patch: Partial<Settings>) => app.updateSettings({ ...s, ...patch });

  const updateNotifications = async (patch: Partial<Settings['notifications']>) => {
    const notifications = { ...s.notifications, ...patch };
    update({ notifications });
    const ok = await applyNotifications(notifications);
    setNotifError(!ok);
    if (!ok) update({ notifications: { ...notifications, daily: false, streak: false } });
  };

  const setField = (k: keyof Profile) => (v: string) => {
    setSaved(false);
    setProfile((p) => ({ ...p, [k]: k === 'telefone' ? formatPhone(v) : k === 'usuario' ? v.replace(/\s/g, '').toLowerCase() : v }));
  };
  const emailError = isValidEmail(profile.email) ? undefined : 'Digite um e-mail válido, como nome@exemplo.com.';
  const dirty = JSON.stringify(profile) !== JSON.stringify(s.profile);

  const saveProfile = () => {
    if (emailError) return;
    update({ profile: { ...profile, nome: profile.nome.trim(), sobrenome: profile.sobrenome.trim(), email: profile.email.trim() } });
    setSaved(true);
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Voltar" hitSlop={12}>
          <Text style={styles.back}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Configurações</Text>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: space(4), gap: space(6), paddingBottom: space(16) }} keyboardShouldPersistTaps="handled">
          <Section title="Preferências">
            <View style={[styles.field, styles.rowLine]}>
              <Text style={styles.rowLabel}>Modo escuro</Text>
              <View style={styles.themes}>
                {THEMES.map((t) => (
                  <Chip key={t.mode} label={t.label} active={s.theme === t.mode} onPress={() => update({ theme: t.mode })} />
                ))}
              </View>
              <Text style={styles.muted}>Automático segue o tema do seu celular.</Text>
            </View>
            <ToggleRow label="Efeitos sonoros" value={s.sound} onChange={(v) => update({ sound: v })} />
            <ToggleRow label="Vibração" detail="Ao acertar e ao errar uma questão" value={s.vibration} onChange={(v) => update({ vibration: v })} last />
          </Section>

          <Section title="Perfil">
            <Field label="Nome" value={profile.nome} onChange={setField('nome')} autoCapitalize="words" autoComplete="given-name" textContentType="givenName" />
            <Field label="Sobrenome" value={profile.sobrenome} onChange={setField('sobrenome')} autoCapitalize="words" autoComplete="family-name" textContentType="familyName" />
            <Field label="Usuário" value={profile.usuario} onChange={setField('usuario')} autoCapitalize="none" autoComplete="username" textContentType="username" placeholder="ex.: maria.silva" />
            <Field
              label="Senha"
              value={password}
              onChange={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="new-password"
              textContentType="newPassword"
              placeholder="Usada quando o login estiver disponível"
            />
            <Field label="E-mail" value={profile.email} onChange={setField('email')} keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="emailAddress" error={emailError} />
            <Field label="Telefone" value={profile.telefone} onChange={setField('telefone')} keyboardType="phone-pad" autoComplete="tel" textContentType="telephoneNumber" placeholder="(11) 91234-5678" last />
            <View style={styles.saveRow}>
              <Button label={saved && !dirty ? 'Perfil salvo' : 'Salvar perfil'} variant="success" disabled={!dirty || !!emailError} onPress={saveProfile} />
              <Text style={styles.muted}>Seus dados ficam só neste aparelho. A senha ainda não é guardada: ela será usada quando o login existir.</Text>
            </View>
          </Section>

          <Section title="Notificações">
            <ToggleRow
              label="Lembrete para estudar"
              detail={`Todo dia às ${s.notifications.dailyHour}h`}
              value={s.notifications.daily}
              onChange={(v) => updateNotifications({ daily: v })}
            />
            {s.notifications.daily && (
              <View style={[styles.hours, styles.rowLine]}>
                {REMINDER_HOURS.map((h) => (
                  <Chip key={h} label={`${h}h`} active={s.notifications.dailyHour === h} onPress={() => updateNotifications({ dailyHour: h })} />
                ))}
              </View>
            )}
            <ToggleRow
              label="Aviso de ofensiva"
              detail={`Às ${STREAK_REMINDER_HOUR}h, para não perder seus dias seguidos`}
              value={s.notifications.streak}
              onChange={(v) => updateNotifications({ streak: v })}
              last
            />
            {notifError && <Text style={[styles.error, { padding: space(4), paddingTop: 0 }]}>Permissão de notificações negada. Ative nas configurações do celular.</Text>}
          </Section>

          <Section title="Assinatura">
            <View style={[styles.row, styles.rowLine]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowLabel}>Plano atual</Text>
                <Text style={styles.muted}>Grátis</Text>
              </View>
            </View>
            <View style={styles.saveRow}>
              <Button label="Conhecer o Aprova Plus" onPress={() => router.push('/assinatura')} />
              {SUBSCRIPTIONS_URL && <Button label="Gerenciar na loja de apps" variant="ghost" onPress={() => Linking.openURL(SUBSCRIPTIONS_URL)} />}
              <Text style={styles.muted}>Cancelamentos e trocas de plano são feitos pela App Store ou Google Play.</Text>
            </View>
          </Section>

          <View style={{ gap: space(3) }}>
            <DangerButton label="Sair da conta" onPress={() => setConfirm('signout')} />
            <DangerButton label="Excluir conta" onPress={() => setConfirm('delete')} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Sheet visible={confirm === 'signout'} title="Sair da conta?" onClose={() => setConfirm(null)}>
        <Text style={styles.info}>Seus dados de perfil saem deste aparelho. Seu progresso e as provas baixadas continuam aqui.</Text>
        <DangerButton
          label="Sair"
          onPress={() => {
            app.signOut();
            setProfile(defaultSettings().profile);
            setPassword('');
            setConfirm(null);
            router.back();
          }}
        />
        <Button label="Cancelar" variant="ghost" onPress={() => setConfirm(null)} />
      </Sheet>

      <Sheet visible={confirm === 'delete'} title="Excluir conta?" onClose={() => setConfirm(null)}>
        <Text style={styles.info}>
          Isto apaga tudo deste aparelho: XP, ofensiva, estrelas, diamantes, provas baixadas, perfil e configurações. Não dá para desfazer.
        </Text>
        <DangerButton label="Continuar" onPress={() => setConfirm('delete2')} />
        <Button label="Cancelar" variant="ghost" onPress={() => setConfirm(null)} />
      </Sheet>

      <Sheet visible={confirm === 'delete2'} title="Tem certeza?" onClose={() => setConfirm(null)}>
        <Text style={styles.info}>Última confirmação. Todos os seus dados serão apagados agora.</Text>
        <DangerButton
          label="Excluir tudo"
          onPress={async () => {
            setConfirm(null);
            await applyNotifications(defaultSettings().notifications);
            await app.deleteEverything();
            router.replace('/');
          }}
        />
        <Button label="Cancelar" variant="ghost" onPress={() => setConfirm(null)} />
      </Sheet>
    </SafeAreaView>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', gap: space(3), paddingHorizontal: space(4), paddingVertical: space(2), borderBottomWidth: 2, borderBottomColor: colors.line },
  back: { fontFamily: fonts.display, fontSize: 36, color: colors.inkSoft, lineHeight: 38 },
  headerTitle: { fontFamily: fonts.display, fontSize: type.lead + 2, color: colors.ink },
  section: { fontFamily: fonts.display, fontSize: type.lead, color: colors.ink },
  card: { borderRadius: 16, borderWidth: 2, borderBottomWidth: 4, borderColor: colors.line, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: space(3), paddingHorizontal: space(4), paddingVertical: space(3.5) },
  rowLine: { borderBottomWidth: 2, borderBottomColor: colors.line },
  rowLabel: { fontFamily: fonts.displayMedium, fontSize: type.body, color: colors.ink },
  muted: { fontFamily: fonts.body, fontSize: type.small, color: colors.inkSoft, lineHeight: type.small * 1.4 },
  field: { paddingHorizontal: space(4), paddingVertical: space(3), gap: space(1.5) },
  fieldLabel: { fontFamily: fonts.displayMedium, fontSize: type.small + 1, color: colors.inkSoft },
  input: { fontFamily: fonts.body, fontSize: type.body, color: colors.ink, backgroundColor: colors.surface, borderRadius: 12, borderWidth: 2, borderColor: colors.line, paddingHorizontal: space(3), paddingVertical: space(2.5) },
  error: { fontFamily: fonts.bodyBold, fontSize: type.small, color: colors.wrong },
  saveRow: { padding: space(4), gap: space(3) },
  themes: { flexDirection: 'row', flexWrap: 'wrap', gap: space(2), paddingVertical: space(1) },
  hours: { flexDirection: 'row', gap: space(2), paddingHorizontal: space(4), paddingBottom: space(3) },
  danger: { borderRadius: 16, borderWidth: 2, borderBottomWidth: 4, borderColor: colors.line, paddingVertical: space(3.5), alignItems: 'center' },
  dangerText: { fontFamily: fonts.display, fontSize: type.body + 1, color: colors.wrong },
  info: { fontFamily: fonts.body, fontSize: type.body, lineHeight: type.body * 1.45, color: colors.inkSoft },
});
