import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { FREE_EXAM_LIMIT, hasUltra } from '../lib/plus';
import { useApp } from '../state/AppState';
import { Colors, fonts, space, type } from '../theme';
import { useColors, useStyles } from '../theme/ThemeContext';

export default function Provas() {
  const colors = useColors();
  const styles = useStyles(createStyles);
  const app = useApp();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async (id: string, fn: (id: string) => Promise<void>) => {
    setBusy(id);
    setError(null);
    try {
      await fn(id);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  };

  const manifest = app.manifest;
  // Grátis e Plus: até 5 provas no aparelho ao mesmo tempo; Ultra: sem limite.
  const installedCount = Object.keys(app.installed).length;
  const atLimit = !hasUltra() && installedCount >= FREE_EXAM_LIMIT;
  // Provas baixadas que saíram do catálogo (ex.: a demonstração antiga) precisam poder ser removidas.
  const retired = manifest ? app.packs.filter((p) => !manifest.exams.some((e) => e.id === p.id)) : [];

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Voltar" hitSlop={12}>
          <Text style={styles.back}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Provas</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: space(4), gap: space(6), paddingBottom: space(12) }}>
        <Text style={styles.lead}>Baixe as provas que você vai prestar. Depois de baixadas, funcionam sem internet.</Text>
        {error && <Text style={styles.error}>Não foi possível concluir: {error}</Text>}
        {!hasUltra() && (
          <Text style={[styles.muted, atLimit && { color: colors.wrong }]}>
            {atLimit
              ? `Você já tem ${FREE_EXAM_LIMIT} provas baixadas, o limite do seu plano. Remova uma para baixar outra, ou conheça o Ultra para provas ilimitadas.`
              : `Provas baixadas: ${installedCount} de ${FREE_EXAM_LIMIT}.`}
          </Text>
        )}
        {!manifest && (
          <View style={{ gap: space(4) }}>
            <Text style={styles.lead}>
              {app.offline ? 'Sem internet. Conecte-se para ver as provas disponíveis.' : 'Carregando a lista de provas.'}
            </Text>
            <Button label="Tentar de novo" variant="ghost" onPress={app.refreshManifest} />
          </View>
        )}
        {manifest?.vestibulares.map((v) => (
          <View key={v.id} style={{ gap: space(3) }}>
            <View>
              <Text style={styles.section}>{v.name}</Text>
              <Text style={styles.muted}>{Math.round(v.secondsPerQuestion / 60)} min por questão</Text>
            </View>
            {manifest.exams
              .filter((e) => e.vestibular === v.id)
              .sort((a, b) => b.year - a.year || a.title.localeCompare(b.title))
              .map((e) => {
                const installed = app.installed[e.id];
                const outdated = installed !== undefined && installed < e.packVersion;
                return (
                  <View key={e.id} style={styles.card}>
                    <View style={styles.rowBetween}>
                      <Text style={styles.title}>{e.title}</Text>
                      {installed !== undefined && !outdated && <Text style={styles.badge}>Baixada</Text>}
                    </View>
                    <Text style={styles.muted}>
                      {e.questionCount} questões: {e.subjects.join(', ')}
                    </Text>
                    {busy === e.id ? (
                      <ActivityIndicator color={colors.primary} />
                    ) : installed === undefined ? (
                      atLimit ? (
                        <Button label="Limite de 5 provas: veja o Ultra" variant="ghost" onPress={() => router.push('/assinatura')} />
                      ) : (
                        <Button label="Baixar prova" onPress={() => run(e.id, app.install)} />
                      )
                    ) : (
                      <View style={{ gap: space(2) }}>
                        {outdated && <Button label="Atualizar prova" onPress={() => run(e.id, app.install)} />}
                        <Button label="Remover do celular" variant="ghost" onPress={() => run(e.id, app.uninstall)} />
                      </View>
                    )}
                  </View>
                );
              })}
          </View>
        ))}
        {retired.length > 0 && (
          <View style={{ gap: space(3) }}>
            <View>
              <Text style={styles.section}>Fora do catálogo</Text>
              <Text style={styles.muted}>Provas que você baixou, mas que não estão mais disponíveis.</Text>
            </View>
            {retired.map((p) => (
              <View key={p.id} style={styles.card}>
                <Text style={styles.title}>{p.title}</Text>
                {busy === p.id ? (
                  <ActivityIndicator color={colors.primary} />
                ) : (
                  <Button label="Remover do celular" variant="ghost" onPress={() => run(p.id, app.uninstall)} />
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', gap: space(3), paddingHorizontal: space(4), paddingVertical: space(2), borderBottomWidth: 2, borderBottomColor: colors.line },
  back: { fontFamily: fonts.display, fontSize: 36, color: colors.inkSoft, lineHeight: 38 },
  headerTitle: { fontFamily: fonts.display, fontSize: type.lead + 2, color: colors.ink },
  lead: { fontFamily: fonts.body, fontSize: type.lead - 2, color: colors.inkSoft },
  section: { fontFamily: fonts.display, fontSize: type.title, color: colors.ink },
  title: { fontFamily: fonts.displayMedium, fontSize: type.lead, color: colors.ink, flexShrink: 1 },
  muted: { fontFamily: fonts.body, fontSize: type.small + 1, color: colors.inkSoft, lineHeight: (type.small + 1) * 1.4 },
  card: { borderRadius: 18, borderWidth: 2, borderBottomWidth: 5, borderColor: colors.line, padding: space(4), gap: space(3) },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: space(2) },
  badge: { fontFamily: fonts.display, fontSize: type.small, color: colors.right, backgroundColor: colors.rightBg, paddingHorizontal: space(2), paddingVertical: 2, borderRadius: 8, overflow: 'hidden' },
  error: { fontFamily: fonts.bodyBold, fontSize: type.body, color: colors.wrong },
});
