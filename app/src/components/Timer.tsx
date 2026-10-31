import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, fonts, type } from '../theme';
import { useColors, useStyles } from '../theme/ThemeContext';

/**
 * Cronômetro regressivo no tempo médio da prova. Ao zerar, continua contando
 * o tempo excedido em vermelho, sem interromper a questão.
 */
export function useCountdown(seconds: number, running: boolean, resetKey: unknown) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => setElapsed(0), [resetKey]);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [running, resetKey]);
  return { elapsed, remaining: seconds - elapsed, inTime: elapsed <= seconds };
}

const fmt = (s: number) => `${Math.floor(Math.abs(s) / 60)}:${String(Math.abs(s) % 60).padStart(2, '0')}`;

export function Timer({ remaining, total }: { remaining: number; total: number }) {
  const colors = useColors();
  const styles = useStyles(createStyles);
  const over = remaining < 0;
  const pct = Math.max(0, remaining) / total;
  return (
    <View style={styles.wrap} accessibilityRole="timer" accessibilityLabel={over ? `Excedeu ${fmt(remaining)}` : `Restam ${fmt(remaining)}`}>
      <Text style={[styles.text, over && { color: colors.wrong }]}>
        {over ? '+' : ''}
        {fmt(remaining)}
      </Text>
      <View style={styles.track}>
        <View style={[styles.bar, { width: `${pct * 100}%`, backgroundColor: pct < 0.2 ? colors.wrong : colors.primary }]} />
      </View>
    </View>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
  wrap: { alignItems: 'flex-end', minWidth: 72 },
  text: { fontFamily: fonts.bodyBold, fontSize: type.lead, color: colors.ink, fontVariant: ['tabular-nums'] },
  track: { width: 72, height: 4, backgroundColor: colors.line, borderRadius: 2, marginTop: 4, overflow: 'hidden' },
  bar: { height: 4 },
});
