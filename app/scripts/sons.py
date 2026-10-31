"""Efeitos sonoros e trilha dos vídeos do Plus, sintetizados do zero (sem direitos de terceiros).

Rode `python3 scripts/sons.py` para gerar os arquivos .wav em assets/sons/.
"""
import math
import os
import random
import struct
import wave

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'assets', 'sons')
RATE = 22050
random.seed(7)


def save(name, samples, gain=0.8):
    peak = max(1e-9, max(abs(s) for s in samples))
    os.makedirs(OUT, exist_ok=True)
    with wave.open(os.path.join(OUT, f'{name}.wav'), 'wb') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(RATE)
        w.writeframes(b''.join(struct.pack('<h', int(32767 * gain * s / peak)) for s in samples))


def env(i, n, attack=0.01, release=0.5):
    """Envelope simples: subida rápida e queda exponencial."""
    t = i / RATE
    a = min(1.0, t / attack) if attack else 1.0
    return a * math.exp(-t / max(1e-4, release * n / RATE))


def tone(freq, dur, wave_='sine', release=0.4, vibrato=0.0):
    n = int(dur * RATE)
    out = []
    phase = 0.0
    for i in range(n):
        f = freq * (1 + vibrato * math.sin(2 * math.pi * 6 * i / RATE))
        phase += 2 * math.pi * f / RATE
        if wave_ == 'sine':
            v = math.sin(phase)
        elif wave_ == 'square':
            v = 0.6 if math.sin(phase) > 0 else -0.6
        else:  # triângulo
            v = 2 / math.pi * math.asin(math.sin(phase))
        out.append(v * env(i, n, release=release))
    return out


def mix(*tracks):
    n = max(len(t) for t in tracks)
    return [sum(t[i] for t in tracks if i < len(t)) for i in range(n)]


def at(samples, seconds, total):
    pad = int(seconds * RATE)
    out = [0.0] * total
    for i, s in enumerate(samples):
        if pad + i < total:
            out[pad + i] += s
    return out


# Pop: entrada de personagem e balão de fala.
pop = []
n = int(0.12 * RATE)
for i in range(n):
    f = 900 - 500 * i / n
    pop.append(math.sin(2 * math.pi * f * i / RATE) * env(i, n, attack=0.002, release=0.25))
save('pop', pop, 0.7)

# Whoosh: troca de cena (ruído com envelope em sino).
whoosh = []
n = int(0.35 * RATE)
last = 0.0
for i in range(n):
    x = i / n
    noise = random.uniform(-1, 1)
    last = last + (0.15 + 0.6 * x) * (noise - last)  # filtro passa-baixa que vai abrindo
    whoosh.append(last * math.sin(math.pi * x))
save('whoosh', whoosh, 0.5)

# Boing: personagem pulando.
boing = []
n = int(0.25 * RATE)
for i in range(n):
    f = 260 + 220 * math.sin(math.pi * i / n)
    boing.append(math.sin(2 * math.pi * f * i / RATE) * env(i, n, attack=0.005, release=0.6))
save('boing', boing, 0.6)

# Ding: destaque do benefício.
save('ding', mix(tone(1318.5, 0.6, release=0.5), [0.4 * s for s in tone(2637, 0.6, release=0.3)]), 0.6)

# Vinheta do Plus: arpejo ascendente (dó, mi, sol, dó) com brilho.
total = int(1.1 * RATE)
notes = [523.25, 659.25, 783.99, 1046.5]
tracks = [at(tone(f, 0.5, 'triangle', release=0.5), k * 0.11, total) for k, f in enumerate(notes)]
tracks.append(at([0.5 * s for s in tone(2093, 0.6, release=0.6)], 0.44, total))
save('vinheta', mix(*tracks), 0.7)

# Trilha de fundo: 10 s a 120 bpm, bumbo, chimbal e acordes leves (fica bem baixa no app).
total = int(10 * RATE)
beat = 0.5
kick = []
n = int(0.18 * RATE)
for i in range(n):
    f = 120 * math.exp(-i / (0.05 * RATE)) + 45
    kick.append(math.sin(2 * math.pi * f * i / RATE) * env(i, n, attack=0.001, release=0.5))
hat = [random.uniform(-1, 1) * env(i, int(0.05 * RATE), attack=0.001, release=0.2) for i in range(int(0.05 * RATE))]
chords = [[261.63, 329.63, 392.0], [220.0, 261.63, 329.63], [174.61, 220.0, 261.63], [196.0, 246.94, 293.66]]
parts = []
for b in range(20):
    parts.append(at(kick, b * beat, total))
    parts.append(at([0.25 * s for s in hat], b * beat + beat / 2, total))
for k in range(5):
    chord = chords[k % 4]
    for f in chord:
        parts.append(at([0.18 * s for s in tone(f, 2.0, 'triangle', release=0.8)], k * 2.0, total))
music = mix(*parts)
fade = int(0.6 * RATE)
for i in range(fade):
    music[-1 - i] *= i / fade
save('trilha', music, 0.6)

# Errado: buzina curta de resposta errada (dois toques graves).
total = int(0.45 * RATE)
buzz = [0.0] * total
for k in range(2):
    n = int(0.17 * RATE)
    for i in range(n):
        ph = 2 * math.pi * 150 * i / RATE
        v = (1 if math.sin(ph) > 0 else -1) * 0.5 + 0.5 * math.sin(2 * ph)
        j = int(k * 0.22 * RATE) + i
        if j < total:
            buzz[j] += v * env(i, n, attack=0.004, release=0.9)
save('errado', buzz, 0.55)

# Coração perdido: nota que cai.
cor = []
n = int(0.4 * RATE)
phase = 0.0
for i in range(n):
    f = 880 * (0.5 ** (i / n * 1.2))
    phase += 2 * math.pi * f / RATE
    cor.append((2 / math.pi * math.asin(math.sin(phase))) * env(i, n, attack=0.003, release=0.5))
save('coracao', cor, 0.6)

# Tchan: acorde dramático (pausa dramática, revelação).
total = int(1.3 * RATE)
tracks = [at([0.5 * s for s in tone(f, 1.3, 'square', release=0.55, vibrato=0.004)], 0.0, total) for f in [110.0, 130.81, 164.81, 220.0]]
tracks.append([random.uniform(-1, 1) * env(i, int(0.3 * RATE), attack=0.001, release=0.25) for i in range(int(0.3 * RATE))])
save('tchan', mix(*tracks), 0.6)

# Festa: língua de sogra (glissando), confete (estalos) e brilho.
total = int(1.0 * RATE)
gl = []
phase = 0.0
n = int(0.5 * RATE)
for i in range(n):
    f = 400 + 500 * (i / n)
    phase += 2 * math.pi * f / RATE
    gl.append((0.6 if math.sin(phase) > 0 else -0.6) * env(i, n, attack=0.02, release=0.9))
parts = [at(gl, 0.0, total)]
for k in range(10):
    c = [random.uniform(-1, 1) * env(i, 600, attack=0.001, release=0.15) for i in range(600)]
    parts.append(at([0.5 * x for x in c], 0.45 + k * 0.05 + random.uniform(0, 0.03), total))
parts += [at([0.4 * x for x in tone(f, 0.4, 'triangle', release=0.5)], 0.5 + j * 0.08, total) for j, f in enumerate([784, 988, 1175, 1568])]
save('festa', mix(*parts), 0.6)

print('sons gerados em', OUT, sorted(os.listdir(OUT)))
