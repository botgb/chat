import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { resolveUrl } from '../lib/content';
import { Question } from '../lib/types';
import { colors, fonts, space, type } from '../theme';
import { Bubble, BubbleState } from './Bubble';

function ContentImage({ src, w, h }: { src: string; w?: number; h?: number }) {
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

export function QuestionView({
  question,
  selected,
  revealed,
  onSelect,
}: {
  question: Question;
  selected: string | null;
  revealed: boolean;
  onSelect: (letter: string) => void;
}) {
  return (
    <View style={{ gap: space(4) }}>
      <View style={{ gap: space(3) }}>
        {question.statement.map((b, i) =>
          b.type === 'text' ? (
            <Text key={i} style={styles.statement}>
              {b.text}
            </Text>
          ) : (
            <ContentImage key={i} src={b.src} w={b.w} h={b.h} />
          ),
        )}
      </View>

      <View style={{ gap: space(2) }} accessibilityRole="radiogroup">
        {question.alternatives.map((alt) => {
          let state: BubbleState = selected === alt.letter ? 'filled' : 'empty';
          if (revealed) {
            if (alt.letter === question.answer) state = 'right';
            else if (alt.letter === selected) state = 'wrong';
          }
          return (
            <Pressable
              key={alt.letter}
              onPress={() => !revealed && onSelect(alt.letter)}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected === alt.letter, disabled: revealed }}
              style={({ pressed }) => [
                styles.alt,
                selected === alt.letter && !revealed && styles.altSelected,
                revealed && alt.letter === question.answer && { backgroundColor: colors.rightBg },
                revealed && state === 'wrong' && { backgroundColor: colors.wrongBg },
                pressed && { opacity: 0.7 },
              ]}
            >
              <Bubble label={alt.letter} state={state} />
              <View style={{ flex: 1, gap: space(2) }}>
                {alt.text ? <Text style={styles.altText}>{alt.text}</Text> : null}
                {alt.image ? <ContentImage src={alt.image} w={alt.imageW} h={alt.imageH} /> : null}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  statement: { fontFamily: fonts.body, fontSize: type.body, lineHeight: type.body * 1.5, color: colors.ink },
  image: { width: '100%', backgroundColor: colors.paper },
  alt: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space(3),
    padding: space(3),
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  altSelected: { borderColor: colors.ink, backgroundColor: colors.paper },
  altText: { fontFamily: fonts.body, fontSize: type.body, lineHeight: type.body * 1.4, color: colors.ink, paddingTop: 4 },
});
