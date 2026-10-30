import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { TopBar } from '../../components/TopBar';
import { useApp } from '../../state/AppState';
import { colors, fonts, space, type } from '../../theme';

export default function Provas() {
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

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <TopBar />
      <ScrollView contentContainerStyle={{ padding: space(4), gap: space(6), paddingBottom: space(12) }}>
        <Text style={styles.hero}>Provas</Text>
        {error && <Text style={styles.error}>Não foi possível concluir: {error}</Text>}
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
                      <Button label="Baixar prova" onPress={() => run(e.id, app.install)} />
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  hero: { fontFamily: fonts.display, fontSize: type.hero, color: colors.ink },
  lead: { fontFamily: fonts.body, fontSize: type.lead - 2, color: colors.inkSoft },
  section: { fontFamily: fonts.display, fontSize: type.title, color: colors.ink },
  title: { fontFamily: fonts.displayMedium, fontSize: type.lead, color: colors.ink, flexShrink: 1 },
  muted: { fontFamily: fonts.body, fontSize: type.small + 1, color: colors.inkSoft, lineHeight: (type.small + 1) * 1.4 },
  card: { borderRadius: 18, borderWidth: 2, borderBottomWidth: 5, borderColor: colors.line, padding: space(4), gap: space(3) },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: space(2) },
  badge: { fontFamily: fonts.display, fontSize: type.small, color: colors.right, backgroundColor: colors.rightBg, paddingHorizontal: space(2), paddingVertical: 2, borderRadius: 8, overflow: 'hidden' },
  error: { fontFamily: fonts.bodyBold, fontSize: type.body, color: colors.wrong },
});
