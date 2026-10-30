import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, space, type } from '../theme';

type Variant = 'primary' | 'success' | 'danger' | 'ghost';

const palette: Record<Variant, { bg: string; edge: string; text: string }> = {
  primary: { bg: colors.primary, edge: colors.primaryDark, text: '#fff' },
  success: { bg: colors.right, edge: colors.rightDark, text: '#fff' },
  danger: { bg: colors.wrong, edge: colors.wrongDark, text: '#fff' },
  ghost: { bg: colors.bg, edge: colors.line, text: colors.inkSoft },
};

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
  const p = disabled ? { bg: colors.locked, edge: colors.lockedDark, text: colors.inkSoft } : palette[variant];
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

const styles = StyleSheet.create({
  base: { paddingVertical: space(3.5), paddingHorizontal: space(5), borderRadius: 16, borderWidth: 2, alignItems: 'center' },
  label: { fontFamily: fonts.display, fontSize: type.lead - 2, letterSpacing: 0.3 },
});
