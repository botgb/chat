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

function Counter({ icon, value, color, label, onPress }: { icon: string; value: string | number; color: string; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.counter} accessibilityRole="button" accessibilityLabel={`${value} ${label}`} hitSlop={6}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.value, { color }]}>{value}</Text>
    </Pressable>
  );
}

function Selector({ label, onPress, a11y }: { label: string; onPress: () => void; a11y: string }) {
  return (
    <Pressable onPress={onPress} style={styles.selector} accessibilityRole="button" accessibilityLabel={a11y}>
      <Text style={styles.selectorText} numberOfLines={1}>
        {label}
      </Text>
      <Text style={styles.caret}>▾</Text>
    </Pressable>
  );
}

const shortExam = (title: string) => title.replace(/\s*\(.*\)\s*/, '').replace(/,?\s*dia\s*/i, ' D');

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
  const subjectLabel =
    study.activeSubjects.length === 1 ? subjectIcon(study.activeSubjects[0]) : study.activeSubjects.length > 1 ? `${study.activeSubjects.length}` : '📚';
  const nextHeartMin = hearts < MAX_HEARTS ? Math.ceil((HEART_REFILL_MS - ((now - progress.heartsUpdatedAt) % HEART_REFILL_MS)) / 60000) : 0;

  return (
    <View style={styles.bar}>
      <View style={styles.selectors}>
        <Selector label={examShort} onPress={() => setPanel('exam')} a11y={`Prova: ${study.examLabel}. Trocar`} />
        <Selector
          label={subjectLabel}
          onPress={() => setPanel('subject')}
          a11y={`Matérias: ${study.activeSubjects.length ? study.activeSubjects.join(', ') : 'todas'}. Trocar`}
        />
      </View>
      <Counter icon="🔥" value={streak} color={streak > 0 ? colors.streak : colors.lockedDark} label="dias seguidos" onPress={() => setPanel('streak')} />
      <Counter icon="💎" value={progress.diamonds} color={colors.gem} label="diamantes" onPress={() => setPanel('diamonds')} />
      <Counter icon="❤️" value={hearts} color={hearts > 0 ? colors.heart : colors.lockedDark} label="vidas" onPress={() => setPanel('hearts')} />

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
    gap: space(3),
    paddingHorizontal: space(3),
    paddingVertical: space(2.5),
    borderBottomWidth: 2,
    borderBottomColor: colors.line,
    backgroundColor: colors.bg,
  },
  selectors: { flex: 1, flexDirection: 'row', gap: space(1.5), minWidth: 0 },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: space(2),
    paddingVertical: space(1.5),
    borderRadius: 10,
    borderWidth: 2,
    borderBottomWidth: 3,
    borderColor: colors.line,
    flexShrink: 1,
    minWidth: 0,
  },
  selectorText: { fontFamily: fonts.display, fontSize: type.body - 1, color: colors.ink, flexShrink: 1 },
  caret: { fontSize: 12, color: colors.inkSoft },
  counter: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  icon: { fontSize: type.lead - 2 },
  value: { fontFamily: fonts.display, fontSize: type.lead - 2 },
  info: { fontFamily: fonts.body, fontSize: type.body, lineHeight: type.body * 1.45, color: colors.inkSoft },
});
