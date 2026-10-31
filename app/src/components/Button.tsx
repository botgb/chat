import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors, fonts, space, type } from '../theme';
import { useColors, useStyles } from '../theme/ThemeContext';

type Variant = 'primary' | 'success' | 'danger' | 'ghost';

const palette = (colors: Colors): Record<Variant, { bg: string; edge: string; text: string }> => ({
  primary: { bg: colors.btnPrimary, edge: colors.btnPrimaryEdge, text: colors.onColor },
  success: { bg: colors.btnSuccess, edge: colors.btnSuccessEdge, text: colors.onColor },
  danger: { bg: colors.btnDanger, edge: colors.btnDangerEdge, text: colors.onColor },
  ghost: { bg: colors.card, edge: colors.line, text: colors.inkSoft },
});

const EDGE = 4;

/** Botão com "degrau" sólido embaixo que afunda ao tocar. */
export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled,
}: {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
}) {
  const colors = useColors();
  const styles = useStyles(createStyles);
  const p = disabled ? { bg: colors.locked, edge: colors.lockedDark, text: colors.inkSoft } : palette(colors)[variant];
  return (
    <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityState={{ disabled }}>
      {({ pressed }) => (
        <View style={{ paddingTop: pressed ? EDGE : 0 }}>
          <View
            style={[
              styles.base,
              {
                backgroundColor: p.bg,
                borderColor: variant === 'ghost' ? colors.line : p.bg,
                borderBottomColor: p.edge,
                borderBottomWidth: pressed ? 2 : EDGE + 2,
              },
            ]}
          >
            <Text style={[styles.label, { color: p.text }]}>{label}</Text>
          </View>
        </View>
      )}
    </Pressable>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
  base: { paddingVertical: space(3.5), paddingHorizontal: space(5), borderRadius: 16, borderWidth: 2, alignItems: 'center' },
  label: { fontFamily: fonts.display, fontSize: type.lead - 2, letterSpacing: 0.3 },
});
