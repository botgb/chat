import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  currentHearts,
  dayKey,
  HEART_REFILL_COST,
  HEART_REFILL_MS,
  MAX_HEARTS,
  visibleStreak,
} from '../lib/gamification';
import { useApp } from '../state/AppState';
import { subjectIcon, useStudy } from '../state/useStudy';
import { colors, fonts, space, type } from '../theme';
import { Button } from './Button';
import { Sheet, SheetOption } from './Sheet';

type Panel = 'exam' | 'subject' | 'streak' | 'diamonds' | 'hearts' | null;

function Item({ icon, value, color, label, onPress }: { icon: string; value: string | number; color: string; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.item} accessibilityRole="button" accessibilityLabel={label} hitSlop={4}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.value, { color }]} numberOfLines={1}>
        {value}
      </Text>
    </Pressable>
  );
}

// "ENEM 2023, dia 2" vira "23 D2" para caber na barra.
const shortExam = (title: string) => {
  const year = title.match(/\b(19|20)(\d{2})\b/)?.[2];
  const day = title.match(/dia\s*(\d)/i)?.[1];
  return [year, day && `D${day}`].filter(Boolean).join(' ') || title.slice(0, 5);
};

export function TopBar() {
  const app = useApp();
  const study = useStudy();
  const { progress } = app;
  const [panel, setPanel] = useState<Panel>(null);
  const now = Date.now();
  const streak = visibleStreak(progress, dayKey(new Date()));
  const hearts = currentHearts(progress, now);
  const close = () => setPanel(null);

  const examShort = study.examId
    ? shortExam(study.exams.find((e) => e.id === study.examId)?.title ?? '')
    : study.vestibularInfo?.name ?? 'Provas';
  const subjectCount = study.activeSubjects.length || study.subjects.length;
  const nextHeartMin = hearts < MAX_HEARTS ? Math.ceil((HEART_REFILL_MS - ((now - progress.heartsUpdatedAt) % HEART_REFILL_MS)) / 60000) : 0;

  return (
    <View style={styles.bar}>
      <Item icon="📝" value={examShort} color={colors.ink} label={`Prova: ${study.examLabel}. Trocar`} onPress={() => setPanel('exam')} />
      <Item
        icon="📚"
        value={subjectCount}
        color={colors.primary}
        label={`Matérias: ${study.activeSubjects.length ? study.activeSubjects.join(', ') : 'todas'}. Trocar`}
        onPress={() => setPanel('subject')}
      />
      <Item icon="🔥" value={streak} color={streak > 0 ? colors.streak : colors.lockedDark} label={`${streak} dias seguidos`} onPress={() => setPanel('streak')} />
      <Item icon="💎" value={progress.diamonds} color={colors.gem} label={`${progress.diamonds} diamantes`} onPress={() => setPanel('diamonds')} />
      <Item icon="❤️" value={hearts} color={hearts > 0 ? colors.heart : colors.lockedDark} label={`${hearts} vidas`} onPress={() => setPanel('hearts')} />

      <Sheet visible={panel === 'exam'} title="Escolha a prova" onClose={close}>
        {study.vestibulares.map((v) => (
          <View key={v.id} style={{ gap: space(2) }}>
            <SheetOption
              icon="🗂️"
              label={`${v.name}: todas as provas`}
              detail="Mistura todas as provas baixadas deste vestibular"
              selected={study.vestibular === v.id && !study.examId}
              onPress={() => {
                study.selectExam(v.id, null);
                close();
              }}
            />
            {app.packs
              .filter((p) => p.vestibular === v.id)
              .map((p) => (
                <SheetOption
                  key={p.id}
                  icon="📄"
                  label={p.title}
                  detail={`${p.questions.length} questões`}
                  selected={study.examId === p.id}
                  onPress={() => {
                    study.selectExam(v.id, p.id);
                    close();
                  }}
                />
              ))}
          </View>
        ))}
        <SheetOption
          icon="⬇️"
          label="Baixar outras provas"
          onPress={() => {
            close();
            router.push('/provas');
          }}
        />
      </Sheet>

      <Sheet visible={panel === 'subject'} title="Escolha as matérias" onClose={close}>
        <SheetOption icon="📚" label="Todas as matérias" selected={study.activeSubjects.length === 0} onPress={() => study.setSubjects([])} />
        {study.subjects.map((s) => (
          <SheetOption key={s} icon={subjectIcon(s)} label={s} selected={study.activeSubjects.includes(s)} onPress={() => study.toggleSubject(s)} />
        ))}
        <View style={{ marginTop: space(2) }}>
          <Button label="Pronto" onPress={close} />
        </View>
      </Sheet>

      <Sheet visible={panel === 'streak'} title={`${streak} ${streak === 1 ? 'dia seguido' : 'dias seguidos'}`} onClose={close}>
        <Text style={styles.info}>Cumpra a meta diária ({progress.dailyGoal} questões) para manter a ofensiva.</Text>
        <Text style={styles.info}>
          Congelamentos disponíveis: {progress.freezes}. Eles salvam a ofensiva se você perder um dia. Você ganha um a cada 7 dias seguidos.
        </Text>
        <Text style={styles.info}>Seu recorde: {progress.bestStreak} dias.</Text>
      </Sheet>

      <Sheet visible={panel === 'diamonds'} title={`${progress.diamonds} diamantes`} onClose={close}>
        <Text style={styles.info}>Ganhe diamantes completando missões diárias e conquistando estrelas novas nas fases.</Text>
        <Text style={styles.info}>Use os diamantes para recarregar suas vidas ({HEART_REFILL_COST} 💎).</Text>
      </Sheet>

      <Sheet visible={panel === 'hearts'} title={`${hearts} de ${MAX_HEARTS} vidas`} onClose={close}>
        <Text style={styles.info}>
          Cada erro numa fase da trilha gasta 1 vida. Revisar erros não gasta vidas.
          {hearts < MAX_HEARTS ? ` Próxima vida em ${nextHeartMin} min.` : ''}
        </Text>
        <Button
          label={hearts >= MAX_HEARTS ? 'Vidas cheias' : `Recarregar por ${HEART_REFILL_COST} 💎`}
          disabled={hearts >= MAX_HEARTS || progress.diamonds < HEART_REFILL_COST}
          onPress={() => app.buyHeartRefill() && close()}
        />
        {hearts < MAX_HEARTS && progress.diamonds < HEART_REFILL_COST && (
          <Text style={styles.info}>Faltam {HEART_REFILL_COST - progress.diamonds} diamantes. Complete missões para ganhar mais.</Text>
        )}
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space(2),
    paddingVertical: space(3),
    borderBottomWidth: 2,
    borderBottomColor: colors.line,
    backgroundColor: colors.bg,
  },
  // Cinco itens com a mesma largura: espaçamento igual entre eles.
  item: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3, minWidth: 0 },
  icon: { fontSize: type.lead - 2 },
  value: { fontFamily: fonts.display, fontSize: type.body - 1, flexShrink: 1 },
  info: { fontFamily: fonts.body, fontSize: type.body, lineHeight: type.body * 1.45, color: colors.inkSoft },
});
