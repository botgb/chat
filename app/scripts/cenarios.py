"""Cenários dos vídeos do Plus em estilo de recorte de papel (cutout): cores chapadas, bordas
cortadas à mão e uma sombra leve sob cada peça. Tudo desenhado aqui, sem imagens de terceiros.

Rode `python3 scripts/cenarios.py` para gerar src/illustrations/scenes.ts e a prévia em
scripts/cenarios/previa.html. Área de desenho: 360 x 640; o chão começa em y = 470 e os
personagens pisam em y = 585.
"""
import json
import math
import os
import random

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'scripts', 'cenarios')
os.makedirs(OUT, exist_ok=True)
W, H = 360, 640
SHADOW = 'rgba(0,0,0,0.18)'
rnd = random.Random(42)


def wob(points, j=1.6, step=18):
    """Polígono com bordas levemente irregulares, como papel cortado com tesoura."""
    out = []
    for (x1, y1), (x2, y2) in zip(points, points[1:] + points[:1]):
        n = max(1, int(math.hypot(x2 - x1, y2 - y1) / step))
        for k in range(n):
            t = k / n
            out.append((x1 + (x2 - x1) * t + rnd.uniform(-j, j), y1 + (y2 - y1) * t + rnd.uniform(-j, j)))
    return 'M' + ' L'.join(f'{x:.1f} {y:.1f}' for x, y in out) + ' Z'


def piece(points, fill, shadow=True, j=1.6):
    d = wob(points, j)
    sh = f'<path d="{d}" fill="{SHADOW}" transform="translate(2 3)"/>' if shadow else ''
    return sh + f'<path d="{d}" fill="{fill}"/>'


def rect(x, y, w, h, fill, shadow=True, j=1.6):
    return piece([(x, y), (x + w, y), (x + w, y + h), (x, y + h)], fill, shadow, j)


def circle(cx, cy, r, fill, shadow=True):
    pts = [(cx + r * math.cos(a), cy + r * math.sin(a)) for a in [i * math.pi / 14 for i in range(28)]]
    return piece(pts, fill, shadow, j=0.8)


def text(x, y, s, size, fill, weight=700, anchor='middle', rot=0):
    return (f'<text x="{x}" y="{y}" font-family="Fredoka, Arial Rounded MT Bold, sans-serif" font-size="{size}" '
            f'font-weight="{weight}" fill="{fill}" text-anchor="{anchor}" transform="rotate({rot} {x} {y})">{s}</text>')


def floor(color, line, y=470):
    out = rect(-10, y, W + 20, H - y + 10, color, shadow=False, j=1.2)
    for k in range(5):
        yy = y + 22 + k * 34
        out += f'<path d="M-5 {yy} L{W + 5} {yy + rnd.uniform(-2, 2):.1f}" stroke="{line}" stroke-width="2.5" opacity="0.5"/>'
    return out


def books(x, y, w, h, colors):
    out, cx = '', x
    while cx < x + w - 8:
        bw = rnd.choice([9, 11, 13])
        bh = h - rnd.choice([0, 4, 8, 12])
        out += rect(cx, y + h - bh, bw, bh, rnd.choice(colors), shadow=False, j=0.6)
        cx += bw + 1
    return out


BOOKS = ['#E85D4A', '#F2B518', '#3DAA5C', '#2F6FE8', '#9B5CFF', '#FF8A1F', '#14A090']

# 1. Quarto de estudo à noite (vídeo das vidas).
quarto = rect(-10, -10, W + 20, 490, '#5B5FA8', shadow=False)
quarto += rect(-10, 300, W + 20, 175, '#4E5296', shadow=False)  # rodapé da parede
quarto += rect(30, 90, 120, 130, '#2B2D5A') + rect(38, 98, 104, 114, '#1C2147', shadow=False)
quarto += circle(110, 130, 16, '#FCE7A4', shadow=False) + circle(116, 125, 13, '#1C2147', shadow=False)
for sx, sy in [(55, 120), (70, 175), (128, 190), (60, 150)]:
    quarto += f'<circle cx="{sx}" cy="{sy}" r="2" fill="#FCE7A4"/>'
quarto += rect(86, 90, 8, 130, '#2B2D5A', shadow=False)  # divisória da janela
quarto += rect(205, 70, 110, 140, '#F4F1E8') + text(260, 120, 'ENEM', 26, '#D93030', rot=-4) + text(260, 160, 'EU VOU', 20, '#22242F', rot=-4) + text(260, 185, 'PASSAR', 20, '#22242F', rot=-4)
quarto += rect(200, 262, 140, 14, '#8B5A3C') + books(206, 222, 128, 40, BOOKS)
quarto += floor('#8B5A3C', '#6E4229')
# Mesa e luminária à direita, na frente do chão.
quarto += rect(230, 430, 140, 18, '#A9785A') + rect(245, 448, 14, 110, '#8B5A3C') + rect(345, 448, 14, 110, '#8B5A3C')
quarto += piece([(300, 430), (306, 380), (290, 370), (326, 352), (334, 366), (314, 380), (312, 430)], '#2F6FE8')
quarto += piece([(286, 360), (330, 340), (338, 362)], '#F2B518')
quarto += rect(250, 400, 40, 30, '#F4F1E8') + rect(255, 405, 30, 3, '#B9BDCC', shadow=False) + rect(255, 413, 24, 3, '#B9BDCC', shadow=False)

# 2. Biblioteca (vídeo do anúncio).
bib = rect(-10, -10, W + 20, 490, '#E9C98F', shadow=False)
for bx in [0, 245]:
    bib += rect(bx, 40, 125, 430, '#7A4A2C')
    for k in range(5):
        y0 = 60 + k * 82
        bib += rect(bx + 8, y0, 109, 64, '#5C3620', shadow=False) + books(bx + 12, y0 + 6, 101, 58, BOOKS)
bib += rect(140, 80, 90, 120, '#9FD3F0') + rect(140, 80, 90, 120, 'none', shadow=False)
bib += rect(182, 80, 6, 120, '#7A4A2C', shadow=False) + rect(140, 137, 90, 6, '#7A4A2C', shadow=False)
bib += rect(146, 230, 80, 32, '#F4F1E8') + text(186, 252, 'SILÊNCIO', 14, '#D93030')
bib += floor('#3F7D5C', '#2E5E45')

# 3. Sala de aula (vídeo da assinatura): lousa, relógio e calendário.
sala = rect(-10, -10, W + 20, 490, '#9AD0C2', shadow=False)
sala += rect(-10, 330, W + 20, 145, '#86BDAF', shadow=False)
sala += rect(20, 70, 210, 150, '#7A4A2C') + rect(28, 78, 194, 134, '#2E5E45', shadow=False)
for k, line in enumerate(['x² + 2x = 15', 'Δ = b² - 4ac', 'ENEM: 30 dias']):
    sala += text(40, 112 + k * 34, line, 18, '#E9F2EE', weight=500, anchor='start', rot=rnd.uniform(-2, 1))
sala += rect(40, 220, 60, 8, '#F4F1E8')
sala += circle(305, 60, 26, '#F4F1E8') + f'<path d="M305 60 V44 M305 60 L316 66" stroke="#22242F" stroke-width="3" stroke-linecap="round"/>'
# calendário
sala += rect(250, 110, 92, 112, '#F4F1E8') + rect(250, 110, 92, 26, '#D93030', shadow=False)
sala += text(296, 129, 'OUTUBRO', 13, '#FFFFFF') + text(296, 178, '30', 44, '#22242F') + text(296, 206, 'DIAS', 14, '#D93030')
for k in range(4):
    sala += f'<circle cx="{262 + k * 22}" cy="112" r="3.5" fill="#22242F"/>'
sala += floor('#C9A26B', '#A88350')
sala += rect(220, 400, 150, 22, '#7A4A2C') + rect(232, 422, 126, 70, '#5C3620')  # mesa da professora
sala += rect(240, 378, 40, 22, '#2F6FE8') + rect(290, 384, 30, 16, '#F2B518')

SCENES = {'quarto': quarto, 'biblioteca': bib, 'sala': sala}


def svg(body):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">{body}</svg>'


if __name__ == '__main__':
    ts = ['// Gerado por scripts/cenarios.py. Não edite à mão.', '/** Cenários dos vídeos do Plus (360 x 640, chão em y = 470). */', 'export const SCENES = {']
    for k, b in SCENES.items():
        ts.append(f'  {k}: {json.dumps(" ".join(svg(b).split()), ensure_ascii=False)},')
    ts += ['} as const;', '', 'export type SceneName = keyof typeof SCENES;', '']
    open(os.path.join(ROOT, 'src', 'illustrations', 'scenes.ts'), 'w').write('\n'.join(ts))
    html = '<!doctype html><meta charset="utf-8"><body style="margin:0;display:flex;gap:12px;padding:12px;background:#222">' + ''.join(
        f'<div>{svg(b)}</div>' for b in SCENES.values()) + '</body>'
    open(os.path.join(OUT, 'previa.html'), 'w').write(html)
    print(len(SCENES), 'cenários')
