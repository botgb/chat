import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { resolveUrl } from '../lib/content';
import { Question } from '../lib/types';
import { Colors, fonts, space, type } from '../theme';
import { useColors, useStyles } from '../theme/ThemeContext';

function ContentImage({ src, w, h }: { src: string; w?: number; h?: number }) {
  const styles = useStyles(createStyles);
  return (
    <Image
      source={{ uri: resolveUrl(src) }}
      style={[styles.image, { aspectRatio: w && h ? w / h : 4 / 3 }]}
      contentFit="contain"
      cachePolicy="disk"
      accessibilityLabel="Imagem da questão"
    />
  );
}

type AltState = 'idle' | 'selected' | 'right' | 'wrong' | 'dim';

const altColors = (colors: Colors): Record<AltState, { border: string; bg: string; letterBg: string; letter: string }> => ({
  idle: { border: colors.line, bg: colors.bg, letterBg: colors.surface, letter: colors.inkSoft },
  selected: { border: colors.primary, bg: colors.selectedBg, letterBg: colors.primary, letter: colors.onColor },
  right: { border: colors.right, bg: colors.rightBg, letterBg: colors.right, letter: colors.onColor },
  wrong: { border: colors.wrong, bg: colors.wrongBg, letterBg: colors.wrong, letter: colors.onColor },
  dim: { border: colors.line, bg: colors.bg, letterBg: colors.surface, letter: colors.lockedDark },
});

export function QuestionView({
  question,
  selected,
  revealed,
  onSelect,
  scale = 1,
}: {
  question: Question;
  selected: string | null;
  revealed: boolean;
  onSelect: (letter: string) => void;
  scale?: number; // tamanho do texto escolhido pelo aluno
}) {
  const colors = useColors();
  const styles = useStyles(createStyles);
  return (
    <View style={{ gap: space(5) }}>
      <View style={{ gap: space(3) }}>
        {question.statement.map((b, i) =>
          b.type === 'text' ? (
            <Text key={i} style={[styles.statement, scale !== 1 && { fontSize: (type.body + 1) * scale, lineHeight: (type.body + 1) * scale * 1.5 }]}>
              {b.text}
            </Text>
          ) : (
            <ContentImage key={i} src={b.src} w={b.w} h={b.h} />
          ),
        )}
      </View>

      <View style={{ gap: space(3) }} accessibilityRole="radiogroup">
        {question.alternatives.map((alt) => {
          let state: AltState = selected === alt.letter ? 'selected' : 'idle';
          if (revealed) {
            if (alt.letter === question.answer) state = 'right';
            else if (alt.letter === selected) state = 'wrong';
            else state = 'dim';
          }
          const c = altColors(colors)[state];
          return (
            <Pressable
              key={alt.letter}
              onPress={() => !revealed && onSelect(alt.letter)}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected === alt.letter, disabled: revealed }}
            >
              {({ pressed }) => (
                <View style={{ paddingTop: pressed && !revealed ? 3 : 0 }}>
                  <View
                    style={[
                      styles.alt,
                      { borderColor: c.border, backgroundColor: c.bg, borderBottomWidth: pressed && !revealed ? 2 : 5 },
                    ]}
                  >
                    <View style={[styles.letter, { backgroundColor: c.letterBg }]}>
                      <Text style={[styles.letterText, { color: c.letter }]}>{alt.letter}</Text>
                    </View>
                    <View style={{ flex: 1, gap: space(2) }}>
                      {alt.text ? <Text style={[styles.altText, scale !== 1 && { fontSize: type.body * scale, lineHeight: type.body * scale * 1.4 }, state === 'dim' && { color: colors.inkSoft }]}>{alt.text}</Text> : null}
                      {alt.image ? <ContentImage src={alt.image} w={alt.imageW} h={alt.imageH} /> : null}
                    </View>
                  </View>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
  statement: { fontFamily: fonts.body, fontSize: type.body + 1, lineHeight: (type.body + 1) * 1.5, color: colors.ink },
  image: { width: '100%', borderRadius: 12, backgroundColor: colors.surface },
  alt: { flexDirection: 'row', alignItems: 'center', gap: space(3), padding: space(3), borderRadius: 16, borderWidth: 2 },
  letter: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  letterText: { fontFamily: fonts.display, fontSize: type.body },
  altText: { fontFamily: fonts.body, fontSize: type.body, lineHeight: type.body * 1.4, color: colors.ink },
});
