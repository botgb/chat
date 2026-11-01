// Trilha em constelações: cada matéria é um céu com a sua cor e as suas ilustrações, e cada
// fase é uma estrela. O céu é sempre noturno, nos dois temas do app.
//
// Tudo é calculado a partir das matérias vizinhas, então funciona em qualquer ordem:
//  - o degradê muda de um céu para o outro na passagem entre matérias;
//  - as ligações entre estrelas (retas dentro da matéria, curva de cometa entre matérias)
//    são desenhadas linha a linha da lista;
//  - as ilustrações só entram onde o caminho deixa espaço, sem sobrepor estrelas e ligações.
// A lista é virtualizada: só as linhas perto da tela são desenhadas.
import { forwardRef, memo, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { Animated, FlatList, ListViewToken, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Polygon, Polyline, RadialGradient, Rect, Stop, SvgXml } from 'react-native-svg';
import { Art } from '../illustrations/Art';
import { SKY, SKY_DEFAULT, SkyDeco, SkyTheme } from '../illustrations/sky';
import { buildPath, Level, PathItem, Unit } from '../lib/levels';
import { fonts } from '../theme';

const ROW = 140; // altura de cada estrela
const HEAD_FIRST = 96; // título da primeira constelação
const HEAD_NEXT = 200; // passagem entre matérias (degradê + título)

const themeOf = (subject: string): SkyTheme => SKY[subject] ?? SKY_DEFAULT;

// ---------- utilidades ----------
function rng(seed: string) {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}
const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const mix = (a: string, b: string, t: number) => {
  const [x, y] = [hex(a), hex(b)];
  return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * Math.min(1, Math.max(0, t)))).join(',')})`;
};
const starPoints = (cx: number, cy: number, r: number) =>
  Array.from({ length: 10 }, (_, k) => {
    const rr = k % 2 === 0 ? r : r * 0.45;
    const a = -Math.PI / 2 + (k * Math.PI) / 5;
    return `${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`;
  }).join(' ');

// ---------- layout ----------
type Link = { xa: number; ya: number; xb: number; yb: number; curve: boolean; lit: boolean; color: string };
type HeadRow = { kind: 'head'; key: string; ui: number; subject: string; prev: string | null; top: number; h: number; done: number; total: number };
type ItemRow = {
  kind: 'item';
  key: string;
  ui: number;
  subject: string;
  item: PathItem;
  x: number;
  top: number;
  h: number;
  label: string | null;
  fade: number; // 1 = normal; menor = estrela mais distante da atual
  deco: { d: SkyDeco; x: number; y: number; w: number; h: number } | null;
};
type Row = HeadRow | ItemRow;

/** x da ligação na altura y (reta, ou curva suave de cometa entre matérias). */
export function linkX(l: Link, y: number) {
  const t = (y - l.ya) / (l.yb - l.ya);
  const s = l.curve ? t * t * (3 - 2 * t) : t;
  return l.xa + (l.xb - l.xa) * s;
}

export function layout(units: Unit[], openedChests: string[], W: number, firstCurrent: string | undefined, topInset = 0) {
  const rows: Row[] = [];
  const links: Link[] = [];
  let y = 0;
  let prevStar: { x: number; y: number; lit: boolean; subject: string } | null = null;
  units.forEach((u, ui) => {
    const theme = themeOf(u.subject);
    const items = buildPath(u, openedChests);
    const h = ui === 0 ? HEAD_FIRST + topInset : HEAD_NEXT;
    rows.push({
      kind: 'head', key: `head:${u.subject}`, ui, subject: u.subject, prev: ui === 0 ? null : units[ui - 1].subject, top: y, h,
      done: u.levels.filter((l) => l.stars > 0).length, total: u.levels.length,
    });
    y += h;
    const r = rng(u.subject);
    let x = W * (0.3 + r() * 0.4);
    let dir = r() < 0.5 ? -1 : 1;
    const currentIdx = u.levels.findIndex((l) => l.current);
    let lastAssunto: string | undefined;
    items.forEach((item, i) => {
      if (i > 0) {
        if (r() < 0.35) dir = -dir; // às vezes muda de lado: caminho irregular
        x += dir * W * (0.1 + r() * 0.24);
        if (x < W * 0.18 || x > W * 0.82) {
          dir = -dir;
          x = Math.min(W * 0.82, Math.max(W * 0.18, x));
        }
      }
      const cy = y + ROW / 2;
      const done = item.kind === 'level' ? item.level.stars > 0 : item.opened;
      if (prevStar) {
        links.push({ xa: prevStar.x, ya: prevStar.y, xb: x, yb: cy, curve: prevStar.subject !== u.subject, lit: prevStar.lit, color: theme.star });
      }
      let label: string | null = null;
      let fade = 1;
      if (item.kind === 'level') {
        const a = item.level.assunto;
        if (a && a !== lastAssunto) label = a;
        lastAssunto = a ?? lastAssunto;
        // As próximas estrelas vão ficando mais apagadas quanto mais longe da atual.
        if (!item.level.unlocked) fade = currentIdx >= 0 ? Math.max(0.28, 1 - 0.14 * (item.level.index - currentIdx)) : 0.3;
      }
      rows.push({ kind: 'item', key: item.kind === 'level' ? item.level.id : item.id, ui, subject: u.subject, item, x, top: y, h: ROW, label, fade, deco: null });
      prevStar = { x, y: cy, lit: done, subject: u.subject };
      y += ROW;
    });
  });

  // Ilustrações: onde o caminho deixa espaço (estrela, nome e ligações ficam livres).
  const decoCount = new Map<string, number>();
  rows.forEach((row, ri) => {
    if (row.kind !== 'item' || ri % 2 === 0) return;
    const decos = themeOf(row.subject).decos;
    if (!decos.length) return;
    const top = row.top;
    const bottom = row.top + row.h;
    let lo = row.x - 70;
    let hi = row.x + 70;
    for (const l of links) {
      if (l.yb < top || l.ya > bottom) continue;
      for (let yy = Math.max(top, l.ya); yy <= Math.min(bottom, l.yb); yy += 6) {
        const lx = linkX(l, yy);
        lo = Math.min(lo, lx - 18);
        hi = Math.max(hi, lx + 18);
      }
    }
    const left = lo - 10;
    const right = W - hi - 10;
    const n = decoCount.get(row.subject) ?? 0;
    const d = decos[n % decos.length];
    const room = Math.max(left, right);
    const scale = Math.min(1, (ROW - 14) / d.h, room / d.w);
    if (d.w * scale < 62) return;
    const w = d.w * scale;
    const h = d.h * scale;
    row.deco = { d, w, h, y: (ROW - h) / 2, x: left >= right ? Math.max(6, left - w) : W - right + (right - w) };
    decoCount.set(row.subject, n + 1);
  });

  // Cor do céu em cada altura: degradê dentro da matéria e passagem suave entre matérias.
  const bands = rows
    .map((r, i) => ({ r, i }))
    .filter((x): x is { r: HeadRow; i: number } => x.r.kind === 'head')
    .map(({ r, i }) => {
      const next = rows.findIndex((x, j) => j > i && x.kind === 'head');
      const end = next < 0 ? y : rows[next].top;
      return { subject: r.subject, headTop: r.top, start: r.top + r.h, end, prev: r.prev };
    });
  const colorAt = (yy: number) => {
    for (let k = bands.length - 1; k >= 0; k--) {
      const b = bands[k];
      if (yy < b.headTop) continue;
      const t = themeOf(b.subject);
      if (yy < b.start) {
        if (!b.prev) return mix(t.top, t.top, 0);
        return mix(themeOf(b.prev).base, t.top, (yy - b.headTop) / (b.start - b.headTop));
      }
      return mix(t.top, t.base, (yy - b.start) / Math.max(1, b.end - b.start));
    }
    const t0 = themeOf(rows[0]?.subject ?? '').top;
    return mix(t0, t0, 0);
  };

  const offsets = rows.map((r) => r.top);
  const currentIndex = rows.findIndex((r) => r.kind === 'item' && r.item.kind === 'level' && r.item.level.id === firstCurrent);
  return { rows, links, offsets, colorAt, total: y, currentIndex };
}

// ---------- peças da linha ----------
function useLoop(duration: number) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.timing(v, { toValue: 1, duration, useNativeDriver: true }));
    loop.start();
    return () => loop.stop();
  }, [v, duration]);
  return v;
}

function Pulse() {
  const v = useLoop(1600);
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.pulse,
        { opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] }), transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [1, 1.6] }) }] },
      ]}
    />
  );
}

const Background = memo(function Background({ id, w, h, c1, c2, seed }: { id: string; w: number; h: number; c1: string; c2: string; seed: string }) {
  const r = rng(seed);
  const dots = Array.from({ length: Math.round((w * h) / 4200) }, () => ({ x: r() * w, y: r() * h, s: [0.6, 0.8, 1, 1.3][Math.floor(r() * 4)], o: 0.15 + r() * 0.55 }));
  return (
    <Svg width={w} height={h} style={StyleSheet.absoluteFill}>
      <Defs>
        <LinearGradient id={`g${id}`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={c1} />
          <Stop offset="1" stopColor={c2} />
        </LinearGradient>
      </Defs>
      <Rect width={w} height={h + 1} fill={`url(#g${id})`} />
      {dots.map((d, i) => (
        <Circle key={i} cx={d.x} cy={d.y} r={d.s} fill="#FFFFFF" opacity={d.o} />
      ))}
    </Svg>
  );
});

function LinkPieces({ links, top, h, w }: { links: Link[]; top: number; h: number; w: number }) {
  const pieces = links
    .filter((l) => l.yb > top && l.ya < top + h)
    .map((l, i) => {
      const pts: string[] = [];
      const y0 = Math.max(top, l.ya);
      const y1 = Math.min(top + h, l.yb);
      const step = Math.max(2, (y1 - y0) / 24);
      for (let yy = y0; yy <= y1 + 0.01; yy += step) pts.push(`${linkX(l, yy).toFixed(1)},${(yy - top).toFixed(1)}`);
      return l.lit ? (
        <Polyline key={i} points={pts.join(' ')} fill="none" stroke={l.color} strokeWidth={3} opacity={0.9} />
      ) : (
        <Polyline key={i} points={pts.join(' ')} fill="none" stroke="#FFFFFF" strokeWidth={1.5} strokeDasharray="5 7" opacity={0.28} />
      );
    });
  if (!pieces.length) return null;
  return (
    <Svg width={w} height={h} style={StyleSheet.absoluteFill} pointerEvents="none">
      {pieces}
    </Svg>
  );
}

function StarNode({ row, highlight, onPress }: { row: ItemRow; highlight: boolean; onPress: () => void }) {
  const theme = themeOf(row.subject);
  const it = row.item;
  if (it.kind === 'chest') {
    const ready = it.unlocked && !it.opened;
    return (
      <Pressable
        onPress={onPress}
        disabled={it.opened}
        accessibilityRole="button"
        accessibilityLabel={it.opened ? 'Baú aberto' : ready ? 'Abrir baú' : 'Baú bloqueado'}
        style={[styles.node, { left: row.x - 30, top: ROW / 2 - 30, width: 60, height: 60 }]}
      >
        {ready && <Pulse />}
        <Art name="bau" size={52} opacity={!it.unlocked ? 0.3 : it.opened ? 0.4 : 1} />
      </Pressable>
    );
  }
  const l: Level = it.level;
  const done = l.stars > 0;
  const size = highlight ? 64 : done ? 52 : 40;
  const fill = done ? theme.star : highlight ? '#FFFFFF' : l.unlocked ? '#E6E8F5' : '#5B6290';
  const r = highlight ? 22 : done ? 17 : l.last ? 14 : 11;
  return (
    <>
      {highlight && (
        <View pointerEvents="none" style={[styles.tip, { left: row.x - 52, top: ROW / 2 - 66 }]}>
          <Text style={styles.tipText}>Começar</Text>
        </View>
      )}
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${l.last ? 'Desafio da matéria' : `Fase ${l.index + 1}`}${l.assunto ? `, ${l.assunto}` : ''}${l.unlocked ? '' : ', bloqueada'}`}
        hitSlop={10}
        style={[styles.node, { left: row.x - size / 2, top: ROW / 2 - size / 2, width: size, height: size, opacity: row.fade }]}
      >
        {highlight && <Pulse />}
        <Svg width={size} height={size}>
          <Defs>
            <RadialGradient id="brilho" cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0.85} />
              <Stop offset="0.45" stopColor="#FFFFFF" stopOpacity={0.2} />
              <Stop offset="1" stopColor="#FFFFFF" stopOpacity={0} />
            </RadialGradient>
          </Defs>
          {(done || highlight) && <Circle cx={size / 2} cy={size / 2} r={size / 2} fill="url(#brilho)" opacity={0.75} />}
          <Polygon points={starPoints(size / 2, size / 2, r)} fill={fill} stroke={fill} strokeWidth={2} strokeLinejoin="round" />
        </Svg>
      </Pressable>
      {done && <Text style={[styles.stars, { left: row.x - 30, top: ROW / 2 + 22 }]}>{'★'.repeat(l.stars)}</Text>}
      {row.label && (
        <Text
          numberOfLines={1}
          style={[
            styles.label,
            {
              left: row.x - 80,
              top: ROW / 2 + (highlight ? 38 : done ? 34 : 22),
              opacity: done || highlight ? 0.9 : 0.42 * row.fade,
              fontFamily: highlight ? fonts.displayMedium : undefined,
            },
          ]}
        >
          {row.label}
        </Text>
      )}
    </>
  );
}

const de = (subject: string) => (/[ae]$/.test(subject) && !/ês$/.test(subject) ? 'da' : 'de');

export type LevelMapHandle = { scrollToCurrent: () => void; scrollToLevel: (id: string) => void };

export const LevelMap = forwardRef<LevelMapHandle, {
  units: Unit[];
  openedChests: string[];
  onPlay: (level: Level) => void;
  onOpenChest: (id: string, unlocked: boolean) => void;
  onUnitChange?: (index: number) => void;
  onCurrentVisible?: (visible: boolean) => void;
  footer?: React.ReactElement | null;
  topInset?: number; // espaço no topo para a faixa da matéria, que fica por cima do céu
}>(function LevelMap({ units, openedChests, onPlay, onOpenChest, onUnitChange, onCurrentVisible, footer, topInset = 0 }, ref) {
  const { width: W } = useWindowDimensions();
  const list = useRef<FlatList<Row>>(null);
  const firstCurrent = units.flatMap((u) => u.levels).find((l) => l.current)?.id;
  const L = useMemo(() => layout(units, openedChests, W, firstCurrent, topInset), [units, openedChests, W, firstCurrent, topInset]);

  useImperativeHandle(ref, () => ({
    scrollToCurrent: () => {
      if (L.currentIndex >= 0) list.current?.scrollToIndex({ index: L.currentIndex, viewPosition: 0.45, animated: true });
    },
    scrollToLevel: (id: string) => {
      const index = L.rows.findIndex((r) => r.kind === 'item' && r.item.kind === 'level' && r.item.level.id === id);
      if (index >= 0) list.current?.scrollToIndex({ index, viewPosition: 0.45, animated: true });
    },
  }));

  const cb = useRef({ onUnitChange, onCurrentVisible, currentIndex: L.currentIndex });
  cb.current = { onUnitChange, onCurrentVisible, currentIndex: L.currentIndex };
  const onViewable = useRef(({ viewableItems }: { viewableItems: ListViewToken[] }) => {
    const first = viewableItems.find((v) => (v.item as Row).kind === 'item')?.item as Row | undefined;
    if (first) cb.current.onUnitChange?.(first.ui);
    cb.current.onCurrentVisible?.(viewableItems.some((v) => v.index === cb.current.currentIndex));
  }).current;

  const renderItem = ({ item: row }: { item: Row }) => {
    const bg = <Background id={row.key.replace(/\W/g, '')} w={W} h={row.h} c1={L.colorAt(row.top)} c2={L.colorAt(row.top + row.h)} seed={row.key} />;
    if (row.kind === 'head') {
      return (
        <View style={{ height: row.h }}>
          {bg}
          <LinkPieces links={L.links} top={row.top} h={row.h} w={W} />
          <View style={styles.head} pointerEvents="none">
            <Text style={styles.headTitle} numberOfLines={1}>
              Constelação {de(row.subject)} {row.subject}
            </Text>
            <Text style={styles.headSub}>
              {row.done} de {row.total} estrelas acesas
            </Text>
          </View>
        </View>
      );
    }
    return (
      <View style={{ height: row.h }}>
        {bg}
        {row.deco && (
          <View pointerEvents="none" style={{ position: 'absolute', left: row.deco.x, top: row.deco.y, width: row.deco.w, height: row.deco.h, opacity: 0.5 }}>
            <SvgXml xml={row.deco.d.svg} width={row.deco.w} height={row.deco.h} />
          </View>
        )}
        <LinkPieces links={L.links} top={row.top} h={row.h} w={W} />
        <StarNode
          row={row}
          highlight={row.item.kind === 'level' && row.item.level.current}
          onPress={() => (row.item.kind === 'level' ? onPlay(row.item.level) : onOpenChest(row.item.id, row.item.unlocked))}
        />
      </View>
    );
  };

  return (
    <FlatList
      ref={list}
      style={{ flex: 1, backgroundColor: themeOf(units[0]?.subject ?? '').top }}
      data={L.rows}
      keyExtractor={(r) => r.key}
      renderItem={renderItem}
      getItemLayout={(_, index) => ({ length: L.rows[index].h, offset: L.offsets[index], index })}
      onViewableItemsChanged={onViewable}
      viewabilityConfig={{ itemVisiblePercentThreshold: 30 }}
      initialNumToRender={10}
      windowSize={7}
      ListFooterComponent={<View style={{ backgroundColor: L.colorAt(L.total), paddingBottom: 120 }}>{footer ?? null}</View>}
    />
  );
});

const styles = StyleSheet.create({
  node: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  pulse: { position: 'absolute', width: 64, height: 64, borderRadius: 32, borderWidth: 3, borderColor: '#FFFFFF' },
  tip: { position: 'absolute', width: 104, alignItems: 'center' },
  tipText: { backgroundColor: '#FFFFFF', color: '#1C1C1E', fontFamily: fonts.display, fontSize: 14, paddingHorizontal: 14, paddingVertical: 5, borderRadius: 14, overflow: 'hidden' },
  stars: { position: 'absolute', width: 60, textAlign: 'center', color: '#FFFFFF', opacity: 0.8, fontSize: 10, letterSpacing: 1 },
  label: { position: 'absolute', width: 160, textAlign: 'center', color: '#FFFFFF', fontSize: 11, fontWeight: '600' },
  head: { position: 'absolute', left: 20, right: 20, bottom: 14 },
  headTitle: { fontFamily: fonts.display, fontSize: 22, color: '#FFFFFF' },
  headSub: { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 2 },
});
