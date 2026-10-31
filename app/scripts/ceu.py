"""Céu da trilha: cores e ilustrações de cada matéria (constelações).

Rode `python3 scripts/ceu.py` para gerar src/illustrations/sky.ts e a prévia em
scripts/ceu/previa.html. Cada ilustração é um SVG próprio, com largura e altura, que a
trilha encaixa ao lado das estrelas sem sobrepor o caminho. Tudo desenhado aqui.
"""
import json
import math
import os
import re
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'ceu'))
from desenhos_base import *  # noqa: E402,F401,F403
import desenhos_base as base  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

DEFS3 = """
<linearGradient id="latao" x1="0" x2="1"><stop offset="0" stop-color="#FFE7A3"/><stop offset=".5" stop-color="#D9A93E"/><stop offset="1" stop-color="#8E6A1E"/></linearGradient>
<linearGradient id="regua" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE9B8"/><stop offset="1" stop-color="#E0B266"/></linearGradient>
<linearGradient id="neon" x1="0" x2="1"><stop offset="0" stop-color="#B9A6FF"/><stop offset="1" stop-color="#7FD4FF"/></linearGradient>
<linearGradient id="liquidoQ" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F59BFF"/><stop offset="1" stop-color="#8E3BD9"/></linearGradient>
<linearGradient id="liquidoV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9CF5C0"/><stop offset="1" stop-color="#1E9449"/></linearGradient>
<linearGradient id="liquidoA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFD98A"/><stop offset="1" stop-color="#E07B1F"/></linearGradient>
<radialGradient id="esfera" cx=".35" cy=".35" r=".75"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".35" stop-color="#C9D3FF"/><stop offset="1" stop-color="#5A6AC9"/></radialGradient>
<radialGradient id="esferaR" cx=".35" cy=".35" r=".75"><stop offset="0" stop-color="#FFE3E3"/><stop offset=".4" stop-color="#FF7A8A"/><stop offset="1" stop-color="#B02A44"/></radialGradient>
<radialGradient id="oceano" cx=".38" cy=".35" r=".75"><stop offset="0" stop-color="#7FD4FF"/><stop offset=".6" stop-color="#2E7DD9"/><stop offset="1" stop-color="#123C8C"/></radialGradient>
<linearGradient id="montanha" x1="0" x2="1"><stop offset="0" stop-color="#6E8FB8"/><stop offset=".5" stop-color="#4A6690"/><stop offset="1" stop-color="#2C3F63"/></linearGradient>
<linearGradient id="lava" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE066"/><stop offset=".5" stop-color="#FF8A1F"/><stop offset="1" stop-color="#D93030"/></linearGradient>
<linearGradient id="marmore" x1="0" x2="1"><stop offset="0" stop-color="#F4F2FA"/><stop offset=".6" stop-color="#C9C4DA"/><stop offset="1" stop-color="#8A84A3"/></linearGradient>
<radialGradient id="chama" cx=".5" cy=".65" r=".6"><stop offset="0" stop-color="#FFFBE0"/><stop offset=".45" stop-color="#FFD24A"/><stop offset="1" stop-color="#FF8A1F" stop-opacity="0"/></radialGradient>
<radialGradient id="halo" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFE7A3" stop-opacity=".55"/><stop offset="1" stop-color="#FFE7A3" stop-opacity="0"/></radialGradient>
<linearGradient id="predio" x1="0" x2="1"><stop offset="0" stop-color="#3A2F5C"/><stop offset="1" stop-color="#231B3E"/></linearGradient>
<linearGradient id="capaA" x1="0" x2="1"><stop offset="0" stop-color="#3D7BFF"/><stop offset="1" stop-color="#2148A8"/></linearGradient>
<linearGradient id="capaV" x1="0" x2="1"><stop offset="0" stop-color="#E05A5A"/><stop offset="1" stop-color="#8E2A2A"/></linearGradient>
<linearGradient id="capaG" x1="0" x2="1"><stop offset="0" stop-color="#3DAA5C"/><stop offset="1" stop-color="#1E6E38"/></linearGradient>
<linearGradient id="capaM" x1="0" x2="1"><stop offset="0" stop-color="#9A6238"/><stop offset="1" stop-color="#5E3A22"/></linearGradient>
<linearGradient id="pagina" x1="0" x2="1"><stop offset="0" stop-color="#FFF8E8"/><stop offset="1" stop-color="#E8D9B8"/></linearGradient>
<linearGradient id="vela" x1="0" x2="1"><stop offset="0" stop-color="#FFF6E0"/><stop offset="1" stop-color="#E3CFA0"/></linearGradient>
<linearGradient id="paleta" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E8C08A"/><stop offset="1" stop-color="#A9723F"/></linearGradient>
<linearGradient id="trofeu" x1="0" x2="1"><stop offset="0" stop-color="#FFF0A8"/><stop offset=".45" stop-color="#FFC531"/><stop offset="1" stop-color="#B07A00"/></linearGradient>
<radialGradient id="bola" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#B8BCCB"/></radialGradient>
<linearGradient id="tela" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3D7BFF"/><stop offset="1" stop-color="#9B5CFF"/></linearGradient>
<linearGradient id="aparelho" x1="0" x2="1"><stop offset="0" stop-color="#4A4F63"/><stop offset="1" stop-color="#22242F"/></linearGradient>
<linearGradient id="vermelhoL" x1="0" x2="1"><stop offset="0" stop-color="#FF6B6B"/><stop offset="1" stop-color="#B02A2A"/></linearGradient>
<linearGradient id="torre" x1="0" x2="1"><stop offset="0" stop-color="#D9B87A"/><stop offset="1" stop-color="#8E6A3A"/></linearGradient>
<linearGradient id="violao" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E8A55A"/><stop offset="1" stop-color="#9A5A22"/></linearGradient>
"""
ALL_DEFS = base.DEFS2 + DEFS3


def svg(body, w, h, x0=0, y0=0):
    """SVG próprio da ilustração, levando só os degradês que ela usa."""
    used = set(re.findall(r'url\(#([\w-]+)\)', body))
    defs = ''.join(d for d in re.findall(r'<(?:linear|radial)Gradient[^>]*?id="([\w-]+)".*?</(?:linear|radial)Gradient>', ALL_DEFS, re.S) if False)
    blocks = re.findall(r'(<(linear|radial)Gradient[^>]*?id="([\w-]+)".*?</(?:linear|radial)Gradient>)', ALL_DEFS, re.S)
    defs = ''.join(b[0] for b in blocks if b[2] in used)
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x0} {y0} {w} {h}"><defs>{defs}</defs>{body}</svg>'


def deco(body, w, h, x0=0, y0=0):
    return {'svg': ' '.join(svg(body, w, h, x0, y0).split()), 'w': w, 'h': h}


# ---------------- Matemática ----------------
def compasso():
    return ('<path d="M20 120 A70 70 0 0 1 120 60" fill="none" stroke="#B9A6FF" stroke-width="2" stroke-dasharray="4 5" opacity=".7"/>'
            '<line x1="70" y1="18" x2="30" y2="118" stroke="url(#metal)" stroke-width="7" stroke-linecap="round"/>'
            '<line x1="70" y1="18" x2="112" y2="112" stroke="url(#metal)" stroke-width="7" stroke-linecap="round"/>'
            '<polygon points="27,112 33,114 29,128" fill="#E8ECF5"/><rect x="108" y="104" width="10" height="16" rx="2" fill="#FFC531" transform="rotate(-24 113 112)"/>'
            '<circle cx="70" cy="18" r="10" fill="url(#latao)"/><rect x="66" y="0" width="8" height="12" rx="3" fill="url(#latao)"/>'
            '<path d="M42 82 L98 82" stroke="url(#metal)" stroke-width="3"/><circle cx="70" cy="82" r="4" fill="url(#latao)"/>')


def esquadro():
    s = '<polygon points="10,120 130,120 10,10" fill="url(#regua)" opacity=".95"/><polygon points="34,104 92,104 34,52" fill="#1A1240" opacity=".55"/>'
    s += ''.join(f'<line x1="{10+k*10}" y1="120" x2="{10+k*10}" y2="{112 if k % 5 else 106}" stroke="#8E6A1E" stroke-width="1.2"/>' for k in range(1, 12))
    s += ''.join(f'<line x1="10" y1="{120-k*10}" x2="{18 if k % 5 else 24}" y2="{120-k*10}" stroke="#8E6A1E" stroke-width="1.2"/>' for k in range(1, 11))
    return s + '<polyline points="10,10 10,120 130,120" fill="none" stroke="#FFF6D8" stroke-width="1.5" opacity=".7"/>'


def icosaedro():
    cx, cy, r = 70, 70, 58
    top = (cx, cy - r); bot = (cx, cy + r)
    up = [(cx + r * .9 * math.cos(a), cy - r * .32 + r * .22 * math.sin(a)) for a in [i * 2 * math.pi / 5 - .3 for i in range(5)]]
    dn = [(cx + r * .9 * math.cos(a + math.pi / 5), cy + r * .32 + r * .22 * math.sin(a + math.pi / 5)) for a in [i * 2 * math.pi / 5 - .3 for i in range(5)]]
    lines = []
    for i in range(5):
        lines += [(top, up[i]), (up[i], up[(i + 1) % 5]), (up[i], dn[i]), (dn[i], up[(i + 1) % 5]), (dn[i], dn[(i + 1) % 5]), (dn[i], bot)]
    s = f'<circle cx="{cx}" cy="{cy}" r="{r+6}" fill="url(#halo)" opacity=".5"/>'
    s += ''.join(f'<line x1="{a[0]:.1f}" y1="{a[1]:.1f}" x2="{b[0]:.1f}" y2="{b[1]:.1f}" stroke="url(#neon)" stroke-width="2" opacity=".85"/>' for a, b in lines)
    s += ''.join(f'<circle cx="{p[0]:.1f}" cy="{p[1]:.1f}" r="3" fill="#EDE6FF"/>' for p in [top, bot] + up + dn)
    return s


def grafico():
    s = '<rect x="0" y="0" width="140" height="110" rx="8" fill="#1F1650" opacity=".85"/>'
    s += ''.join(f'<line x1="{x}" y1="6" x2="{x}" y2="104" stroke="#5A4BB0" stroke-width=".8"/>' for x in range(14, 140, 14))
    s += ''.join(f'<line x1="6" y1="{y}" x2="134" y2="{y}" stroke="#5A4BB0" stroke-width=".8"/>' for y in range(14, 110, 14))
    s += '<line x1="70" y1="6" x2="70" y2="104" stroke="#B9A6FF" stroke-width="1.6"/><line x1="6" y1="84" x2="134" y2="84" stroke="#B9A6FF" stroke-width="1.6"/>'
    pts = ' '.join(f'{x},{84 - (x - 70) ** 2 / -60 * -1 * -1 - 0:.1f}' for x in range(18, 124, 4))
    pts = ' '.join(f'{x},{84 - (60 - (x - 70) ** 2 / 45):.1f}' for x in range(18, 124, 3))
    s += f'<polyline points="{pts}" fill="none" stroke="#FFC531" stroke-width="3" stroke-linecap="round"/>'
    s += '<circle cx="70" cy="24" r="4" fill="#FF5CA8"/>'
    return s


# ---------------- Química ----------------
def erlenmeyer():
    s = '<path d="M48 8 H82 V44 L118 118 Q120 126 112 126 H18 Q10 126 12 118 L48 44 Z" fill="url(#vidro)" stroke="#F3E6FF" stroke-width="2" stroke-opacity=".7"/>'
    s += '<path d="M34 86 H96 L112 118 Q114 122 108 122 H22 Q16 122 18 118 Z" fill="url(#liquidoQ)" opacity=".9"/>'
    s += ''.join(f'<circle cx="{x}" cy="{y}" r="{r}" fill="#FCE3FF" opacity=".75"/>' for x, y, r in [(52, 104, 4), (70, 96, 3), (84, 110, 5), (64, 76, 3), (72, 60, 4), (60, 40, 3)])
    s += '<rect x="44" y="2" width="42" height="9" rx="4" fill="#E9D9FF"/><path d="M56 50 L40 82" stroke="#FFF" stroke-width="3" opacity=".35"/>'
    return s


def tubos():
    s = '<rect x="0" y="70" width="150" height="12" rx="4" fill="url(#madeira)"/><rect x="6" y="112" width="138" height="10" rx="4" fill="url(#madeira)"/>'
    s += '<rect x="4" y="70" width="8" height="52" fill="#5E3A22"/><rect x="138" y="70" width="8" height="52" fill="#5E3A22"/>'
    for k, g in enumerate(['liquidoQ', 'liquidoV', 'liquidoA']):
        x = 30 + k * 40
        s += f'<rect x="{x-10}" y="16" width="20" height="96" rx="10" fill="url(#vidro)" stroke="#F3E6FF" stroke-opacity=".7"/>'
        s += f'<rect x="{x-8}" y="{60 - k * 10}" width="16" height="{50 + k * 10}" rx="8" fill="url(#{g})"/><ellipse cx="{x}" cy="{60 - k*10}" rx="8" ry="3" fill="#fff" opacity=".35"/>'
        s += f'<line x1="{x-5}" y1="24" x2="{x-5}" y2="100" stroke="#fff" stroke-width="2" opacity=".35"/>'
    return s


def molecula():
    nodes = [(70, 64, 18, 'esferaR'), (28, 30, 12, 'esfera'), (116, 28, 12, 'esfera'), (30, 110, 12, 'esfera'), (118, 108, 12, 'esfera')]
    s = ''.join(f'<line x1="70" y1="64" x2="{x}" y2="{y}" stroke="#D9D2F0" stroke-width="7" stroke-linecap="round"/>' for x, y, _, _ in nodes[1:])
    s += ''.join(f'<circle cx="{x}" cy="{y}" r="{r}" fill="url(#{g})"/>' for x, y, r, g in nodes)
    return s


def benzeno():
    pts = [(60 + 46 * math.cos(math.pi / 6 + k * math.pi / 3), 60 + 46 * math.sin(math.pi / 6 + k * math.pi / 3)) for k in range(6)]
    s = f'<circle cx="60" cy="60" r="60" fill="url(#halo)" opacity=".35"/>'
    s += f'<polygon points="{" ".join(f"{x:.1f},{y:.1f}" for x, y in pts)}" fill="none" stroke="#E59BFF" stroke-width="4" stroke-linejoin="round"/>'
    s += '<circle cx="60" cy="60" r="26" fill="none" stroke="#F3D6FF" stroke-width="3" opacity=".8"/>'
    s += ''.join(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="6" fill="url(#esfera)"/>' for x, y in pts)
    return s


def atomo():
    s = '<circle cx="65" cy="65" r="62" fill="url(#halo)" opacity=".35"/>'
    s += ''.join(f'<ellipse cx="65" cy="65" rx="58" ry="20" fill="none" stroke="#9FD8FF" stroke-width="2.4" opacity=".8" transform="rotate({a} 65 65)"/>' for a in (0, 60, 120))
    s += '<circle cx="65" cy="65" r="13" fill="url(#esferaR)"/><circle cx="58" cy="60" r="6" fill="url(#esfera)"/>'
    s += ''.join(f'<circle cx="{65 + 58*math.cos(math.radians(a))*math.cos(math.radians(r)) - 20*math.sin(math.radians(a))*math.sin(math.radians(r)):.1f}" cy="{65 + 58*math.cos(math.radians(a))*math.sin(math.radians(r)) + 20*math.sin(math.radians(a))*math.cos(math.radians(r)):.1f}" r="5" fill="#7FF3FF"/>' for a, r in [(30, 0), (200, 60), (110, 120)])
    return s


# ---------------- Geografia ----------------
def globo():
    s = '<rect x="58" y="128" width="24" height="10" rx="3" fill="url(#latao)"/><rect x="66" y="116" width="8" height="14" fill="url(#latao)"/>'
    s += '<path d="M14 66 A56 56 0 0 0 126 66" fill="none" stroke="url(#latao)" stroke-width="5"/>'
    s += '<circle cx="70" cy="62" r="48" fill="url(#oceano)"/>'
    s += '<path d="M44 34 q14 -8 22 2 q4 10 -6 14 q-8 6 -4 16 q-10 2 -14 -10 q-6 -10 2 -22z" fill="#5FD38A"/>'
    s += '<path d="M78 44 q12 -6 20 4 q6 12 -2 22 q-8 12 -4 26 q-12 -2 -14 -16 q-6 -14 0 -36z" fill="#5FD38A"/><path d="M60 88 q8 -2 10 6 q-4 6 -10 2z" fill="#5FD38A"/>'
    s += ''.join(f'<ellipse cx="70" cy="62" rx="{rx}" ry="48" fill="none" stroke="#DCF2FF" stroke-width=".8" opacity=".45"/>' for rx in (16, 34))
    s += ''.join(f'<line x1="{70-48*math.cos(math.asin(d/48)):.1f}" y1="{62+d}" x2="{70+48*math.cos(math.asin(d/48)):.1f}" y2="{62+d}" stroke="#DCF2FF" stroke-width=".8" opacity=".45"/>' for d in (-30, -12, 12, 30))
    s += '<ellipse cx="52" cy="40" rx="14" ry="7" fill="#fff" opacity=".25" transform="rotate(-30 52 40)"/>'
    return s


def montanhas():
    s = '<polygon points="0,120 50,30 100,120" fill="url(#montanha)"/><polygon points="50,30 62,52 54,48 48,58 40,48" fill="#F4F8FF"/>'
    s += '<polygon points="60,120 115,20 170,120" fill="url(#montanha)"/><polygon points="115,20 129,46 120,42 112,54 104,44" fill="#F4F8FF"/>'
    s += '<polygon points="115,20 170,120 128,120" fill="#22304E" opacity=".45"/><polygon points="50,30 100,120 68,120" fill="#22304E" opacity=".45"/>'
    s += '<path d="M0 120 Q60 104 110 116 T170 112 V124 H0 Z" fill="#2E6B5A"/>'
    return s


def rosa_ventos():
    s = '<circle cx="60" cy="60" r="52" fill="none" stroke="url(#latao)" stroke-width="3"/><circle cx="60" cy="60" r="44" fill="#0F2A4A" opacity=".6"/>'
    for a, l, c in [(0, 50, '#FFE7A3'), (90, 50, '#D9A93E'), (180, 50, '#D9A93E'), (270, 50, '#D9A93E'), (45, 30, '#8FE3FF'), (135, 30, '#8FE3FF'), (225, 30, '#8FE3FF'), (315, 30, '#8FE3FF')]:
        r = math.radians(a - 90)
        tip = (60 + l * math.cos(r), 60 + l * math.sin(r))
        lft = (60 + 8 * math.cos(r - math.pi / 2), 60 + 8 * math.sin(r - math.pi / 2))
        rgt = (60 + 8 * math.cos(r + math.pi / 2), 60 + 8 * math.sin(r + math.pi / 2))
        s += f'<polygon points="{tip[0]:.1f},{tip[1]:.1f} {lft[0]:.1f},{lft[1]:.1f} 60,60" fill="{c}"/><polygon points="{tip[0]:.1f},{tip[1]:.1f} {rgt[0]:.1f},{rgt[1]:.1f} 60,60" fill="{c}" opacity=".65"/>'
    return s + '<circle cx="60" cy="60" r="5" fill="url(#latao)"/><text x="60" y="6" text-anchor="middle" font-size="11" font-weight="800" fill="#FFE7A3">N</text>'


def vulcao():
    s = '<polygon points="10,120 58,40 82,40 130,120" fill="url(#piraR)"/><polygon points="70,40 130,120 96,120" fill="#3A1E2A" opacity=".4"/>'
    s += '<path d="M58 40 Q62 64 52 84 Q66 70 70 92 Q76 66 86 80 Q82 60 82 40 Z" fill="url(#lava)"/>'
    s += '<ellipse cx="70" cy="40" rx="14" ry="5" fill="#FFE066"/>'
    s += ''.join(f'<circle cx="{x}" cy="{y}" r="{r}" fill="#8A8EA8" opacity=".5"/>' for x, y, r in [(66, 22, 10), (80, 10, 13), (60, 4, 8)])
    return s


# ---------------- Filosofia ----------------
def lua_cheia():
    return ('<circle cx="70" cy="70" r="68" fill="url(#halo)" opacity=".5"/><circle cx="70" cy="70" r="46" fill="url(#lua)"/>'
            + ''.join(f'<circle cx="{70+dx}" cy="{70+dy}" r="{r}" fill="#8A8EA8" opacity=".45"/>' for dx, dy, r in [(-16, -10, 9), (12, 8, 7), (-4, 20, 5), (18, -20, 4), (-22, 12, 3)]))


def busto():
    s = '<rect x="30" y="118" width="80" height="14" rx="3" fill="url(#marmore)"/><rect x="40" y="104" width="60" height="16" fill="url(#marmore)"/>'
    s += '<path d="M28 104 Q30 80 52 74 L88 74 Q110 80 112 104 Z" fill="url(#marmore)"/>'
    s += '<rect x="60" y="58" width="20" height="20" fill="url(#marmore)"/>'
    s += '<path d="M48 34 Q48 10 70 10 Q94 10 92 36 Q92 52 84 60 Q76 68 64 66 Q52 62 50 50 Q44 46 48 34 Z" fill="url(#marmore)"/>'
    s += '<path d="M50 36 Q48 22 58 16 Q70 8 84 14 Q92 20 92 32" fill="none" stroke="#8A84A3" stroke-width="5" stroke-linecap="round" stroke-dasharray="3 5"/>'
    s += '<path d="M54 48 Q58 64 70 66 Q84 64 88 50 Q84 58 70 60 Q58 58 54 48 Z" fill="#B5AEC9"/>'
    s += '<path d="M60 36 q4 -3 8 0 M76 36 q4 -3 8 0" stroke="#8A84A3" stroke-width="2" fill="none"/><path d="M71 38 l-3 10 h5" stroke="#8A84A3" stroke-width="1.6" fill="none"/>'
    s += '<path d="M92 26 Q100 30 104 22 M90 18 Q98 14 100 8" stroke="#6FAF6A" stroke-width="3" fill="none"/>'
    return s


def lanterna():
    s = '<circle cx="50" cy="66" r="48" fill="url(#halo)"/><path d="M50 0 v14" stroke="#8790B0" stroke-width="3"/><path d="M36 14 h28 l6 12 h-40 z" fill="url(#metal)"/>'
    s += '<rect x="30" y="26" width="40" height="60" rx="6" fill="url(#vidro)" stroke="#C9D1E8" stroke-width="2"/>'
    s += '<ellipse cx="50" cy="60" rx="9" ry="16" fill="url(#chama)"/><rect x="46" y="70" width="8" height="10" fill="#F4F2FA"/>'
    s += '<path d="M28 86 h44 l-6 12 h-32 z" fill="url(#metal)"/>'
    return s


def balanca():
    s = '<rect x="64" y="20" width="6" height="96" fill="url(#latao)"/><rect x="40" y="114" width="54" height="10" rx="4" fill="url(#latao)"/><circle cx="67" cy="16" r="7" fill="url(#latao)"/>'
    s += '<line x1="14" y1="30" x2="120" y2="22" stroke="url(#latao)" stroke-width="5" stroke-linecap="round"/>'
    for x, y in [(16, 30), (118, 22)]:
        s += f'<line x1="{x}" y1="{y}" x2="{x-14}" y2="{y+40}" stroke="#D9A93E" stroke-width="1.5"/><line x1="{x}" y1="{y}" x2="{x+14}" y2="{y+40}" stroke="#D9A93E" stroke-width="1.5"/>'
        s += f'<path d="M{x-20} {y+40} h40 q-4 14 -20 14 q-16 0 -20 -14 z" fill="url(#latao)"/>'
    return s


def pilha_livros(cores=('capaA', 'capaV', 'capaG', 'capaM')):
    s = ''
    for k, c in enumerate(cores):
        y = 104 - k * 24; x = 10 + (k % 2) * 8; w = 120 - k * 8
        s += f'<rect x="{x}" y="{y}" width="{w}" height="22" rx="4" fill="url(#{c})"/><rect x="{x+w-14}" y="{y+3}" width="11" height="16" rx="2" fill="url(#pagina)"/>'
        s += f'<rect x="{x+10}" y="{y+8}" width="{w*.4:.0f}" height="3" rx="1.5" fill="#FFE7A3" opacity=".8"/>'
    return s


# ---------------- Sociologia ----------------
def cidade():
    s = ''
    blds = [(0, 50, 70), (36, 90, 46), (70, 30, 96), (100, 70, 60), (140, 40, 80)]
    for x, h, w in [(b[0], b[2], b[1] if False else 0) for b in blds]:
        pass
    for x, w, h in [(0, 34, 70), (36, 30, 104), (68, 40, 86), (110, 28, 120), (140, 36, 76)]:
        s += f'<rect x="{x}" y="{130-h}" width="{w}" height="{h}" fill="url(#predio)"/>'
        for r in range(int((h - 12) / 12)):
            for c in range(int((w - 8) / 9)):
                on = (x + r * 7 + c * 13) % 5 < 2
                s += f'<rect x="{x+5+c*9}" y="{130-h+8+r*12}" width="5" height="6" fill="{"#FFD27A" if on else "#4A3F70"}" opacity="{.95 if on else .8}"/>'
    s += '<rect x="117" y="2" width="2" height="10" fill="#8790B0"/><circle cx="118" cy="2" r="2.5" fill="#FF4B4B"/>'
    return s


def pessoas():
    cores = ['#FF8A1F', '#2F6FE8', '#14B8A6', '#FF5CA8', '#9B5CFF']
    s = ''
    for k, c in enumerate(cores):
        x = 16 + k * 26; y = 60 + (k % 2) * 10
        s += f'<circle cx="{x}" cy="{y}" r="10" fill="#F2CDA3"/><path d="M{x-14} {y+46} q0 -30 14 -30 q14 0 14 30 z" fill="{c}"/>'
    s += '<path d="M10 30 h44 a8 8 0 0 1 8 8 v14 a8 8 0 0 1 -8 8 h-26 l-10 8 v-8 h-8 a8 8 0 0 1 -8 -8 v-14 a8 8 0 0 1 8 -8z" fill="#fff" opacity=".85"/>'
    s += '<circle cx="22" cy="45" r="3" fill="#2B2D42"/><circle cx="32" cy="45" r="3" fill="#2B2D42"/><circle cx="42" cy="45" r="3" fill="#2B2D42"/>'
    return s


def rede():
    pts = [(20, 20), (70, 10), (120, 30), (40, 70), (100, 80), (20, 120), (70, 110), (125, 120)]
    edges = [(0, 1), (1, 2), (0, 3), (1, 3), (1, 4), (2, 4), (3, 4), (3, 5), (3, 6), (4, 6), (4, 7), (6, 7), (5, 6)]
    s = ''.join(f'<line x1="{pts[a][0]}" y1="{pts[a][1]}" x2="{pts[b][0]}" y2="{pts[b][1]}" stroke="#FFB37A" stroke-width="2" opacity=".55"/>' for a, b in edges)
    s += ''.join(f'<circle cx="{x}" cy="{y}" r="{9 if k in (3, 4) else 6}" fill="url(#esferaR)"/>' for k, (x, y) in enumerate(pts))
    return s


# ---------------- Português e Literatura ----------------
def livro_aberto():
    s = '<path d="M4 30 Q40 18 76 30 V122 Q40 110 4 122 Z" fill="url(#pagina)"/><path d="M76 30 Q112 18 148 30 V122 Q112 110 76 122 Z" fill="url(#pagina)"/>'
    s += '<path d="M2 120 Q40 108 76 120 Q112 108 150 120 V128 Q112 116 76 128 Q40 116 2 128 Z" fill="url(#capaA)"/>'
    s += '<path d="M76 30 V122" stroke="#C9B48A" stroke-width="2"/>'
    s += ''.join(f'<path d="M14 {46+k*12} q26 -6 52 0" stroke="#8E6E4C" stroke-width="1.6" fill="none" opacity=".7"/><path d="M86 {46+k*12} q26 -6 52 0" stroke="#8E6E4C" stroke-width="1.6" fill="none" opacity=".7"/>' for k in range(6))
    s += '<text x="40" y="20" font-size="22" font-weight="900" fill="#9FD0FF" opacity=".85">A</text><text x="98" y="16" font-size="18" font-weight="900" fill="#FFC531" opacity=".85">ç</text><text x="124" y="24" font-size="16" font-weight="900" fill="#FF8A8A" opacity=".85">?</text>'
    return s


def pena_tinteiro():
    s = '<path d="M28 96 h52 v10 q0 14 -26 14 q-26 0 -26 -14 z" fill="url(#aparelho)"/><rect x="38" y="86" width="32" height="12" rx="3" fill="#22242F"/><ellipse cx="54" cy="86" rx="16" ry="4" fill="#3D7BFF" opacity=".7"/>'
    s += '<path d="M58 86 L120 4 Q132 12 120 32 Q100 60 62 88 Z" fill="#F4F5F9"/><path d="M58 86 L118 10" stroke="#C3C8D6" stroke-width="2"/>'
    s += ''.join(f'<path d="M{70+k*9} {70-k*11} l{10} {-2}" stroke="#C3C8D6" stroke-width="1.4"/>' for k in range(5))
    return s


def blocos_letras():
    s = ''
    for k, (ch, g) in enumerate([('A', 'capaA'), ('B', 'capaV'), ('Ç', 'capaG')]):
        x = 6 + k * 46; y = 70 - (k % 2) * 24
        s += f'<rect x="{x}" y="{y}" width="42" height="42" rx="6" fill="url(#{g})"/><rect x="{x+4}" y="{y+4}" width="34" height="34" rx="4" fill="#fff" opacity=".9"/>'
        s += f'<text x="{x+21}" y="{y+31}" text-anchor="middle" font-size="24" font-weight="900" fill="#22242F">{ch}</text>'
    return s


def vela():
    s = '<circle cx="40" cy="30" r="34" fill="url(#halo)"/><ellipse cx="40" cy="36" rx="9" ry="18" fill="url(#chama)"/>'
    s += '<rect x="28" y="48" width="24" height="64" rx="4" fill="url(#vela)"/><path d="M28 54 q6 10 2 22 M50 52 q-4 8 0 16" stroke="#E3CFA0" stroke-width="3" fill="none"/>'
    s += '<ellipse cx="40" cy="116" rx="30" ry="7" fill="url(#latao)"/><path d="M68 112 q12 0 12 -10" stroke="url(#latao)" stroke-width="4" fill="none"/>'
    return s


# ---------------- Artes ----------------
def paleta_pincel():
    s = '<path d="M10 60 Q10 14 70 14 Q130 14 130 58 Q130 88 100 84 Q84 82 84 96 Q84 112 64 112 Q10 110 10 60 Z" fill="url(#paleta)"/><circle cx="96" cy="66" r="9" fill="#2A1C14"/>'
    s += ''.join(f'<circle cx="{x}" cy="{y}" r="9" fill="{c}"/>' for x, y, c in [(36, 40, '#FF4B6E'), (62, 30, '#FFC531'), (92, 32, '#2DBE60'), (112, 48, '#3D7BFF'), (32, 70, '#9B5CFF'), (48, 92, '#FF8A1F')])
    s += '<g transform="rotate(-35 90 90)"><rect x="86" y="40" width="8" height="70" rx="3" fill="url(#madeira)"/><rect x="85" y="34" width="10" height="10" fill="url(#metal)"/><path d="M85 34 Q90 16 95 34 Z" fill="#FF4B6E"/></g>'
    return s


def mascaras():
    s = '<g transform="rotate(-12 50 60)"><path d="M18 26 Q50 14 82 26 Q86 70 50 96 Q14 70 18 26 Z" fill="#FFF3D6"/><path d="M32 46 q8 -6 14 0 M56 46 q8 -6 14 0" stroke="#22242F" stroke-width="3" fill="none"/><path d="M34 64 Q50 82 66 64 Z" fill="#22242F"/></g>'
    s += '<g transform="rotate(14 100 70)"><path d="M70 40 Q102 28 134 40 Q138 84 102 110 Q66 84 70 40 Z" fill="#9B5CFF"/><path d="M84 62 q8 6 14 0 M108 62 q8 6 14 0" stroke="#fff" stroke-width="3" fill="none"/><path d="M86 88 Q102 72 118 88" stroke="#fff" stroke-width="4" fill="none"/></g>'
    return s


def notas():
    s = '<path d="M10 90 Q60 60 140 80" stroke="#FF9AD5" stroke-width="1.5" fill="none" opacity=".5"/>'
    for x, y, c in [(20, 70, '#FF9AD5'), (70, 50, '#FFC531'), (112, 62, '#7FD4FF')]:
        s += f'<ellipse cx="{x}" cy="{y+40}" rx="11" ry="8" fill="{c}" transform="rotate(-20 {x} {y+40})"/><rect x="{x+9}" y="{y}" width="3" height="40" fill="{c}"/><path d="M{x+12} {y} q14 6 10 22" stroke="{c}" stroke-width="3" fill="none"/>'
    return s


def cavalete():
    s = '<line x1="30" y1="130" x2="62" y2="6" stroke="url(#madeira)" stroke-width="6"/><line x1="110" y1="130" x2="78" y2="6" stroke="url(#madeira)" stroke-width="6"/><line x1="70" y1="10" x2="70" y2="130" stroke="#5E3A22" stroke-width="5"/>'
    s += '<rect x="22" y="20" width="96" height="76" fill="#FFF8E8" stroke="#9A6238" stroke-width="4"/>'
    s += '<path d="M24 80 Q50 50 70 70 T116 60 V94 H24 Z" fill="#7FD4FF" opacity=".8"/><circle cx="94" cy="40" r="10" fill="#FFC531"/><path d="M24 90 Q60 70 116 88 V94 H24 Z" fill="#2DBE60" opacity=".8"/>'
    s += '<rect x="26" y="96" width="88" height="6" fill="url(#madeira)"/>'
    return s


# ---------------- Educação Física ----------------
def bola():
    s = '<ellipse cx="60" cy="118" rx="40" ry="6" fill="#000" opacity=".25"/><circle cx="60" cy="60" r="52" fill="url(#bola)"/>'
    pent = lambda cx, cy, r, rot: ' '.join(f'{cx + r*math.cos(rot + k*2*math.pi/5):.1f},{cy + r*math.sin(rot + k*2*math.pi/5):.1f}' for k in range(5))
    s += f'<polygon points="{pent(60, 60, 16, -math.pi/2)}" fill="#22242F"/>'
    for k in range(5):
        a = -math.pi / 2 + k * 2 * math.pi / 5
        s += f'<polygon points="{pent(60 + 42*math.cos(a), 60 + 42*math.sin(a), 11, a + math.pi/2)}" fill="#22242F"/>'
        s += f'<line x1="{60 + 16*math.cos(a):.1f}" y1="{60 + 16*math.sin(a):.1f}" x2="{60 + 32*math.cos(a):.1f}" y2="{60 + 32*math.sin(a):.1f}" stroke="#22242F" stroke-width="2"/>'
    return s + '<ellipse cx="40" cy="34" rx="14" ry="8" fill="#fff" opacity=".6" transform="rotate(-30 40 34)"/>'


def trofeu():
    s = '<path d="M30 20 H12 Q8 52 34 54 M90 20 H108 Q112 52 86 54" fill="none" stroke="url(#trofeu)" stroke-width="7"/>'
    s += '<path d="M28 10 H92 V40 Q92 70 60 74 Q28 70 28 40 Z" fill="url(#trofeu)"/><rect x="52" y="72" width="16" height="22" fill="url(#trofeu)"/>'
    s += '<rect x="34" y="92" width="52" height="12" rx="3" fill="url(#trofeu)"/><rect x="26" y="104" width="68" height="18" rx="4" fill="url(#madeira)"/>'
    s += '<path d="M40 16 v26" stroke="#FFF8D0" stroke-width="5" opacity=".7"/>' + star_svg(60, 38, 11, '#FFF8D0')
    return s


def star_svg(cx, cy, r, fill):
    pts = []
    for k in range(10):
        rr = r if k % 2 == 0 else r * .45
        a = -math.pi / 2 + k * math.pi / 5
        pts.append(f'{cx + rr*math.cos(a):.1f},{cy + rr*math.sin(a):.1f}')
    return f'<polygon points="{" ".join(pts)}" fill="{fill}"/>'


def apito():
    return ('<path d="M20 40 h60 a30 30 0 1 1 -30 30 h-30 z" fill="url(#metal)"/><circle cx="80" cy="70" r="16" fill="#4C5370"/><rect x="20" y="40" width="22" height="14" fill="#C9D1E8"/>'
            '<path d="M10 30 Q-2 60 30 76" stroke="#FF4B4B" stroke-width="4" fill="none"/><ellipse cx="62" cy="54" rx="12" ry="5" fill="#fff" opacity=".45"/>'
            '<path d="M98 30 l10 -10 M104 44 l14 -4 M92 22 l4 -14" stroke="#FFE066" stroke-width="3" stroke-linecap="round"/>')


# ---------------- Tecnologias ----------------
def celular():
    s = '<rect x="20" y="4" width="76" height="132" rx="14" fill="url(#aparelho)"/><rect x="26" y="14" width="64" height="112" rx="8" fill="url(#tela)"/>'
    cores = ['#FFC531', '#2DBE60', '#FF5CA8', '#7FF3FF', '#FF8A1F', '#FFFFFF']
    s += ''.join(f'<rect x="{32+(k%3)*20}" y="{22+(k//3)*22}" width="14" height="14" rx="4" fill="{cores[k]}" opacity=".9"/>' for k in range(6))
    s += '<rect x="32" y="74" width="52" height="38" rx="6" fill="#fff" opacity=".22"/><rect x="48" y="7" width="20" height="4" rx="2" fill="#22242F"/>'
    return s


def wifi():
    s = ''.join(f'<path d="M{70-r} {100-r*.3:.0f} A{r} {r} 0 0 1 {70+r} {100-r*.3:.0f}" fill="none" stroke="#7FF3FF" stroke-width="9" stroke-linecap="round" opacity="{.95-k*.15:.2f}"/>' for k, r in enumerate((24, 48, 72)))
    return s + '<circle cx="70" cy="104" r="9" fill="#7FF3FF"/>'


def notebook():
    s = '<rect x="20" y="6" width="120" height="80" rx="8" fill="url(#aparelho)"/><rect x="26" y="12" width="108" height="68" rx="4" fill="#0B1A2A"/>'
    s += ''.join(f'<rect x="34" y="{20+k*10}" width="{[60,80,44,70,52][k]}" height="4" rx="2" fill="{["#7FF3FF","#FFC531","#FF5CA8","#9CF07C","#B9A6FF"][k]}" opacity=".85"/>' for k in range(5))
    s += '<path d="M6 88 H154 L146 100 H14 Z" fill="url(#metal)"/><rect x="66" y="90" width="28" height="4" rx="2" fill="#4C5370"/>'
    return s


def satelite():
    s = '<g transform="rotate(-25 70 60)"><rect x="54" y="44" width="32" height="32" rx="4" fill="url(#metal)"/>'
    s += '<rect x="2" y="48" width="48" height="24" fill="#2148A8"/><rect x="90" y="48" width="48" height="24" fill="#2148A8"/>'
    s += ''.join(f'<line x1="{2+k*12}" y1="48" x2="{2+k*12}" y2="72" stroke="#9FD8FF" stroke-width="1"/><line x1="{90+k*12}" y1="48" x2="{90+k*12}" y2="72" stroke="#9FD8FF" stroke-width="1"/>' for k in range(1, 4))
    s += '<line x1="50" y1="60" x2="54" y2="60" stroke="#C9D1E8" stroke-width="3"/><line x1="86" y1="60" x2="90" y2="60" stroke="#C9D1E8" stroke-width="3"/>'
    s += '<path d="M70 76 v10 M58 98 q12 -16 24 0" stroke="#C9D1E8" stroke-width="3" fill="none"/></g>'
    return s + ''.join(f'<path d="M{100+k*8} {108+k*6} q10 -2 14 8" stroke="#7FF3FF" stroke-width="2" fill="none" opacity="{.8-k*.25:.2f}"/>' for k in range(3))


# ---------------- Inglês ----------------
def torre_relogio():
    s = '<rect x="40" y="40" width="44" height="100" fill="url(#torre)"/><polygon points="40,40 62,2 84,40" fill="#3A3F5A"/><rect x="58" y="0" width="8" height="10" fill="url(#latao)"/>'
    s += '<rect x="36" y="38" width="52" height="6" fill="#6E5230"/><circle cx="62" cy="64" r="16" fill="#FFF6D8"/><circle cx="62" cy="64" r="16" fill="none" stroke="url(#latao)" stroke-width="3"/>'
    s += '<line x1="62" y1="64" x2="62" y2="53" stroke="#22242F" stroke-width="2.4"/><line x1="62" y1="64" x2="70" y2="68" stroke="#22242F" stroke-width="2"/>'
    s += ''.join(f'<rect x="{46+k*12}" y="{92+r*18}" width="6" height="12" fill="#FFD27A" opacity=".7"/>' for k in range(3) for r in range(3))
    return s + '<rect x="62" y="40" width="22" height="100" fill="#22242F" opacity=".2"/>'


def cabine():
    s = '<rect x="20" y="20" width="60" height="114" rx="4" fill="url(#vermelhoL)"/><path d="M18 22 Q50 2 82 22 Z" fill="url(#vermelhoL)"/>'
    s += '<rect x="26" y="28" width="48" height="10" fill="#1C1C1E"/><text x="50" y="36" text-anchor="middle" font-size="7" font-weight="800" fill="#fff">TELEPHONE</text>'
    s += ''.join(f'<rect x="{30+c*14}" y="{46+r*14}" width="11" height="11" fill="#FFF3D6" opacity=".85"/>' for c in range(3) for r in range(4))
    return s + '<rect x="66" y="80" width="4" height="12" rx="2" fill="url(#latao)"/><rect x="62" y="20" width="18" height="114" fill="#000" opacity=".15"/>'


def xicara():
    s = '<path d="M20 50 H96 V70 Q96 104 58 104 Q20 104 20 70 Z" fill="#F4F5F9"/><path d="M96 58 Q118 58 116 76 Q114 92 92 90" fill="none" stroke="#F4F5F9" stroke-width="7"/>'
    s += '<ellipse cx="58" cy="50" rx="38" ry="8" fill="#B5652A"/><ellipse cx="58" cy="112" rx="52" ry="8" fill="#E3E5EE"/>'
    s += '<path d="M30 66 q28 10 56 0" stroke="#3D7BFF" stroke-width="4" fill="none" opacity=".6"/>'
    return s + ''.join(f'<path d="M{44+k*14} 40 q-8 -12 0 -24 q8 -12 0 -22" stroke="#fff" stroke-width="3" fill="none" opacity=".45"/>' for k in range(3))


# ---------------- Espanhol ----------------
def violao():
    s = '<g transform="rotate(-28 70 70)"><rect x="64" y="0" width="12" height="70" fill="url(#madeira)"/><rect x="60" y="-8" width="20" height="14" rx="3" fill="#5E3A22"/>'
    s += '<path d="M70 56 C40 56 40 82 52 90 C34 96 34 132 70 132 C106 132 106 96 88 90 C100 82 100 56 70 56 Z" fill="url(#violao)"/>'
    s += '<circle cx="70" cy="98" r="11" fill="#3A2214"/><rect x="58" y="116" width="24" height="5" rx="2" fill="#3A2214"/>'
    s += ''.join(f'<line x1="{67+k*2}" y1="0" x2="{67+k*2}" y2="118" stroke="#FFF3D6" stroke-width=".7" opacity=".8"/>' for k in range(4))
    return s + '</g>'


def maracas():
    s = ''
    for x, rot, c in [(40, -20, '#FF5CA8'), (92, 18, '#FFC531')]:
        s += f'<g transform="rotate({rot} {x} 70)"><rect x="{x-4}" y="70" width="8" height="54" rx="4" fill="url(#madeira)"/><ellipse cx="{x}" cy="48" rx="24" ry="30" fill="{c}"/>'
        s += f'<path d="M{x-22} 44 Q{x} 54 {x+22} 44" stroke="#fff" stroke-width="3" fill="none" opacity=".8"/><path d="M{x-18} 60 Q{x} 68 {x+18} 60" stroke="#22242F" stroke-width="3" fill="none" opacity=".35"/><ellipse cx="{x-8}" cy="34" rx="6" ry="9" fill="#fff" opacity=".35"/></g>'
    return s


def leque():
    s = ''
    for k in range(9):
        a = math.radians(-160 + k * 17.5)
        s += f'<path d="M70 110 L{70+92*math.cos(a):.1f} {110+92*math.sin(a):.1f} A92 92 0 0 1 {70+92*math.cos(a+math.radians(17.5)):.1f} {110+92*math.sin(a+math.radians(17.5)):.1f} Z" fill="{"#D93030" if k % 2 else "#FF6B6B"}"/>'
    s += '<path d="M10 74 A92 92 0 0 1 130 74" fill="none" stroke="#FFE066" stroke-width="3" stroke-dasharray="2 6" opacity=".9"/>'
    return s + '<circle cx="70" cy="110" r="7" fill="url(#latao)"/>'


def bandeirinhas():
    s = '<path d="M0 10 Q80 40 160 10" stroke="#FFE7A3" stroke-width="2" fill="none"/>'
    cores = ['#FF5CA8', '#FFC531', '#2DBE60', '#3D7BFF', '#FF8A1F', '#9B5CFF']
    for k in range(6):
        x = 8 + k * 26; y = 10 + 30 * math.sin(math.pi * (x / 160)) * .8
        s += f'<path d="M{x} {y:.0f} h22 v28 l-11 -7 l-11 7 z" fill="{cores[k]}"/><circle cx="{x+11}" cy="{y+12:.0f}" r="4" fill="#fff" opacity=".7"/>'
    return s


# ---------------- Paletas e listas ----------------
B = base
SKY = {
    'Matemática': dict(top='#120B3A', base='#2A1C6B', star='#C6B5FF', decos=[deco(compasso(), 140, 130), deco(esquadro(), 140, 130), deco(icosaedro(), 140, 140), deco(grafico(), 140, 110)]),
    'Física': dict(top='#04071C', base='#0D1846', star='#7FD4FF', decos=[deco(B.galaxia(90, 90, 85), 180, 180), deco(B.planeta(110, 60, 40) + B.lua(185, 22, 12), 200, 120), deco(B.prisma(20, 70), 230, 120, -10, 0), deco(B.bobina(40, 140), 100, 150, -10, -10), deco(B.ima(20, 40), 100, 100)]),
    'Química': dict(top='#1A0A2E', base='#3B145A', star='#F0A6FF', decos=[deco(erlenmeyer(), 130, 130), deco(tubos(), 150, 125), deco(molecula(), 140, 130), deco(benzeno(), 120, 120), deco(atomo(), 130, 130)]),
    'Biologia': dict(top='#05232A', base='#0A3936', star='#7CF0B5', decos=[deco(B.dna(40, 10, 220), 80, 240), deco(B.celula(60, 60, 54), 120, 120), deco(B.folha(50, 70, .9, 25) + B.folha(85, 95, .6, -30), 130, 140), deco(B.borboleta(65, 45, 1), 130, 90), deco(B.agua_viva(45, 45), 90, 110), deco(B.cogumelo(40, 100) + B.cogumelo(80, 108).replace('url(#chapeu)', '#E8913A'), 120, 112)]),
    'História': dict(top='#2E1A44', base='#B4553A', star='#FFC531', decos=[deco(B.templo(10, 140, 140), 160, 150), deco(B.piramide(80, 110, 150, 105) + B.piramide(160, 110, 90, 62), 210, 115), deco(B.caravela(60, 80, 1), 120, 105), deco(B.ampulheta(40, 65, 1), 80, 130), deco(B.pergaminho(60, 40, 1), 125, 85)]),
    'Geografia': dict(top='#0A1E3A', base='#1F4D5E', star='#8FE3FF', decos=[deco(globo(), 140, 140), deco(montanhas(), 170, 125), deco(rosa_ventos(), 120, 120), deco(vulcao(), 140, 125)]),
    'Filosofia': dict(top='#141428', base='#2E2C4E', star='#D8D0FF', decos=[deco(lua_cheia(), 140, 140), deco(busto(), 140, 135), deco(lanterna(), 100, 115), deco(balanca(), 140, 130), deco(pilha_livros(), 140, 130)]),
    'Sociologia': dict(top='#1A1426', base='#3A2440', star='#FFB37A', decos=[deco(cidade(), 180, 132), deco(pessoas(), 140, 110), deco(rede(), 140, 135)]),
    'Português': dict(top='#0E1838', base='#1D3561', star='#9FD0FF', decos=[deco(livro_aberto(), 152, 130), deco(pena_tinteiro(), 135, 125), deco(blocos_letras(), 140, 115)]),
    'Literatura': dict(top='#1E1424', base='#46302A', star='#FFD9A0', decos=[deco(pilha_livros(('capaM', 'capaV', 'capaM', 'capaG')), 140, 130), deco(vela(), 90, 125), deco(pena_tinteiro(), 135, 125)]),
    'Artes': dict(top='#1E0F2E', base='#4A1C4A', star='#FF9AD5', decos=[deco(paleta_pincel(), 140, 120), deco(mascaras(), 145, 120), deco(notas(), 145, 115), deco(cavalete(), 140, 135)]),
    'Educação Física': dict(top='#0C2418', base='#1E4A2A', star='#9CF07C', decos=[deco(bola(), 120, 125), deco(trofeu(), 120, 125), deco(apito(), 125, 105)]),
    'Tecnologias e comunicação': dict(top='#06141E', base='#0F3040', star='#7FF3FF', decos=[deco(celular(), 116, 140), deco(wifi(), 140, 115), deco(notebook(), 160, 105), deco(satelite(), 150, 130)]),
    'Inglês': dict(top='#141832', base='#2C2A52', star='#FF9A9A', decos=[deco(torre_relogio(), 124, 142), deco(cabine(), 100, 136), deco(xicara(), 125, 122)]),
    'Espanhol': dict(top='#2A0F1E', base='#5C2238', star='#FFC07A', decos=[deco(violao(), 140, 150, 0, -10), deco(maracas(), 135, 130), deco(leque(), 140, 120), deco(bandeirinhas(), 165, 60)]),
}
DEFAULT = dict(top='#0B0F2A', base='#1A1F4A', star='#FFFFFF', decos=[])

# Ordem preferida: exatas juntas, depois natureza, humanas juntas e linguagens.
ORDER = ['Matemática', 'Física', 'Química', 'Biologia', 'Geografia', 'História', 'Sociologia', 'Filosofia',
         'Português', 'Literatura', 'Artes', 'Educação Física', 'Tecnologias e comunicação', 'Inglês', 'Espanhol']

if __name__ == '__main__':
    out = ['// Gerado por scripts/ceu.py. Não edite à mão.',
           '// Céu da trilha: cores (topo e base da faixa, cor das estrelas) e ilustrações de cada matéria.',
           'export type SkyDeco = { svg: string; w: number; h: number };',
           'export type SkyTheme = { top: string; base: string; star: string; decos: SkyDeco[] };',
           'export const SKY: Record<string, SkyTheme> = ' + json.dumps(SKY, ensure_ascii=False) + ';',
           'export const SKY_DEFAULT: SkyTheme = ' + json.dumps(DEFAULT) + ';',
           '/** Ordem preferida das matérias na trilha: exatas juntas, humanas juntas. */',
           'export const MATERIA_ORDER: string[] = ' + json.dumps(ORDER, ensure_ascii=False) + ';', '']
    open(os.path.join(ROOT, 'src', 'illustrations', 'sky.ts'), 'w').write('\n'.join(out))
    cells = ''
    for nome, t in SKY.items():
        imgs = ''.join(f'<div style="width:{d["w"]}px;height:{d["h"]}px;display:inline-block;margin:6px">{d["svg"]}</div>' for d in t['decos'])
        cells += f'<section style="background:linear-gradient({t["top"]},{t["base"]});padding:10px;margin:0 0 8px;border-radius:14px"><b style="color:{t["star"]};font:700 16px system-ui">{nome}</b><div>{imgs}</div></section>'
    open(os.path.join(ROOT, 'scripts', 'ceu', 'previa.html'), 'w').write(f'<!doctype html><meta charset="utf-8"><body style="margin:0;padding:12px;width:900px;background:#000">{cells}</body>')
    size = os.path.getsize(os.path.join(ROOT, 'src', 'illustrations', 'sky.ts'))
    print(len(SKY), 'matérias,', sum(len(t['decos']) for t in SKY.values()), 'ilustrações,', size // 1024, 'KB')
