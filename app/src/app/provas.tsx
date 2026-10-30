import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/Button';
import { useApp } from '../state/AppState';
import { colors, fonts, space, type } from '../theme';

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

  if (!app.manifest) {
    return (
      <View style={[styles.pad, { gap: space(4) }]}>
        <Text style={styles.lead}>
          {app.offline
            ? 'Sem internet. Conecte-se para ver as provas disponíveis.'
            : 'Carregando a lista de provas.'}
        </Text>
        <Button label="Tentar de novo" variant="secondary" onPress={app.refreshManifest} />
      </View>
    );
  }

  const byVestibular = app.manifest.vestibulares.map((v) => ({
    v,
    exams: app.manifest!.exams.filter((e) => e.vestibular === v.id).sort((a, b) => b.year - a.year || a.title.localeCompare(b.title)),
  }));

  return (
    <ScrollView contentContainerStyle={[styles.pad, { gap: space(6), paddingBottom: space(10) }]}>
      {error && <Text style={styles.error}>Não foi possível concluir: {error}</Text>}
      {byVestibular.map(({ v, exams }) => (
        <View key={v.id} style={{ gap: space(3) }}>
          <Text style={styles.section}>{v.name}</Text>
          <Text style={styles.muted}>Tempo por questão: {Math.round(v.secondsPerQuestion / 60)} min</Text>
          {exams.map((e) => {
            const installed = app.installed[e.id];
            const outdated = installed !== undefined && installed < e.packVersion;
            return (
              <View key={e.id} style={styles.card}>
                <Text style={styles.title}>{e.title}</Text>
                <Text style={styles.muted}>
                  {e.questionCount} questões, {e.subjects.join(', ')}
                </Text>
                {busy === e.id ? (
                  <ActivityIndicator color={colors.ink} />
                ) : installed === undefined ? (
                  <Button label="Baixar prova" onPress={() => run(e.id, app.install)} />
                ) : (
                  <View style={{ gap: space(2) }}>
                    {outdated && <Button label="Atualizar prova" onPress={() => run(e.id, app.install)} />}
                    <Button label="Remover do celular" variant="secondary" onPress={() => run(e.id, app.uninstall)} />
                  </View>
                )}
              </View>
            );
          })}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: space(5), paddingTop: space(4) },
  lead: { fontFamily: fonts.body, fontSize: type.lead, color: colors.inkSoft },
  section: { fontFamily: fonts.display, fontSize: type.title, color: colors.ink },
  title: { fontFamily: fonts.displayMedium, fontSize: type.lead, color: colors.ink },
  muted: { fontFamily: fonts.body, fontSize: type.small, color: colors.inkSoft },
  card: { backgroundColor: colors.paper, borderRadius: 16, padding: space(4), gap: space(3) },
  error: { fontFamily: fonts.bodyBold, fontSize: type.body, color: colors.wrong },
});
