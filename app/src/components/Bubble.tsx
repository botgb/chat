import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme';

export type BubbleState = 'empty' | 'filled' | 'right' | 'wrong';

/** Bolinha do cartão-resposta: o elemento central da identidade do app. */
export function Bubble({
  label,
  state = 'empty',
  size = 32,
}: {
  label?: string;
  state?: BubbleState;
  size?: number;
}) {
  const fill =
    state === 'filled' ? colors.ink : state === 'right' ? colors.right : state === 'wrong' ? colors.wrong : 'transparent';
  const border = state === 'empty' ? colors.sheetInk : fill;
  return (
    <View
      style={[
        styles.bubble,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: fill, borderColor: border },
      ]}
    >
      {label ? (
        <Text
          style={[
            styles.label,
            { fontSize: size * 0.45, color: state === 'empty' ? colors.sheetInk : colors.paper },
          ]}
        >
          {label}
        </Text>
      ) : null}
    </View>
  );
}

/** Fileira de bolinhas que mostra progresso (ex.: meta do dia 3 de 10). */
export function BubbleRow({ total, filled, size = 14 }: { total: number; filled: number; size?: number }) {
  return (
    <View style={styles.row} accessibilityLabel={`${filled} de ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <Bubble key={i} size={size} state={i < filled ? 'filled' : 'empty'} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: { borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  label: { fontFamily: fonts.bodyBold, includeFontPadding: false },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
});
