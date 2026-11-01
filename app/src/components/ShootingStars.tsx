// Estrelas cadentes de vez em quando no céu da trilha. Respeita "Reduzir movimento".
import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, StyleSheet, useWindowDimensions, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

const LEN = 140;

export function ShootingStars() {
  const { width, height } = useWindowDimensions();
  const t = useRef(new Animated.Value(0)).current;
  const [shot, setShot] = useState<{ x: number; y: number; angle: number } | null>(null);
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduce).catch(() => {});
  }, []);

  useEffect(() => {
    if (reduce) return;
    let timer: ReturnType<typeof setTimeout>;
    const next = () => {
      timer = setTimeout(() => {
        setShot({ x: width * (0.35 + Math.random() * 0.6), y: height * (0.05 + Math.random() * 0.4), angle: 140 + Math.random() * 25 });
        t.setValue(0);
        Animated.timing(t, { toValue: 1, duration: 950, easing: Easing.out(Easing.quad), useNativeDriver: true }).start(next);
      }, 4500 + Math.random() * 7000);
    };
    next();
    return () => clearTimeout(timer);
  }, [reduce, t, width, height]);

  if (!shot) return null;
  const rad = (shot.angle * Math.PI) / 180;
  const dist = 260;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Animated.View
        style={{
          position: 'absolute',
          left: shot.x - LEN,
          top: shot.y,
          width: LEN,
          height: 3,
          opacity: t.interpolate({ inputRange: [0, 0.15, 0.7, 1], outputRange: [0, 1, 0.8, 0] }),
          transform: [
            { translateX: t.interpolate({ inputRange: [0, 1], outputRange: [0, Math.cos(rad) * dist] }) },
            { translateY: t.interpolate({ inputRange: [0, 1], outputRange: [0, Math.sin(rad) * dist] }) },
            { rotate: `${shot.angle}deg` },
          ],
          transformOrigin: 'right center',
        }}
      >
        <Svg width={LEN} height={3}>
          <Defs>
            <LinearGradient id="cauda" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0} />
              <Stop offset="1" stopColor="#FFFFFF" stopOpacity={0.95} />
            </LinearGradient>
          </Defs>
          <Rect width={LEN} height={3} rx={1.5} fill="url(#cauda)" />
        </Svg>
      </Animated.View>
    </View>
  );
}
