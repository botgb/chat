"""Fonte das ilustrações do app (SVG 64x64).

Rode `python3 scripts/ilustracoes.py` para gerar src/illustrations/data.ts
e a prévia em scripts/ilustracoes/previa.html.
"""
import json, math, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'scripts', 'ilustracoes')
os.makedirs(OUT, exist_ok=True)

B, Bd, Bl = '#3D7BFF', '#2657CC', '#DCE8FF'
P, Pd = '#9B5CFF', '#7438DB'
K, Kl = '#FF5CA8', '#FF9CCB'
T, Td = '#14B8A6', '#0E8C7E'
O, Od, Ol = '#FF8A1F', '#D96A00', '#FFB066'
G, Gd, Gl = '#FFC531', '#DB9C00', '#FFE08A'
R = '#FF4B6E'
Gr, Grl = '#2DBE60', '#7FDC9E'
C, Cl, Cm = '#2EB8E6', '#B8EDFB', '#74D3F2'
I, W, L = '#2B2D42', '#FFFFFF', '#E3E5EE'

def star(cx, cy, ro, ri, n=5):
    pts = []
    for k in range(2 * n):
        r = ro if k % 2 == 0 else ri
        a = -math.pi / 2 + k * math.pi / n
        pts.append(f'{cx + r * math.cos(a):.1f},{cy + r * math.sin(a):.1f}')
    return ' '.join(pts)

def rounded_poly(points, color, w=6):
    return f'<polygon points="{points}" fill="{color}" stroke="{color}" stroke-width="{w}" stroke-linejoin="round"/>'

ICONS = {}

# ---- barra de cima ----
ICONS['prova'] = f'''
<rect x="12" y="11" width="40" height="49" rx="10" fill="{Bd}"/>
<rect x="12" y="8" width="40" height="48" rx="10" fill="{B}"/>
<rect x="18" y="15" width="28" height="36" rx="6" fill="{W}"/>
<rect x="24" y="4" width="16" height="9" rx="4.5" fill="{G}"/>
<circle cx="25" cy="24" r="3.5" fill="{B}"/><rect x="31" y="22.5" width="10" height="3" rx="1.5" fill="{L}"/>
<circle cx="25" cy="33" r="3.5" fill="{L}"/><rect x="31" y="31.5" width="10" height="3" rx="1.5" fill="{L}"/>
<circle cx="25" cy="42" r="3.5" fill="{L}"/><rect x="31" y="40.5" width="10" height="3" rx="1.5" fill="{L}"/>'''

def book(x, y, w, h, c, band):
    return (f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="5" fill="{c}"/>'
            f'<rect x="{x + w - 10}" y="{y + 3}" width="7" height="{h - 6}" rx="2" fill="{W}"/>'
            f'<rect x="{x + 7}" y="{y}" width="4" height="{h}" fill="{band}"/>')
ICONS['materias'] = book(8, 44, 48, 13, T, Td) + book(13, 31, 42, 13, K, '#D93684') + book(9, 18, 40, 13, O, Od) + \
    f'<rect x="38" y="8" width="5" height="12" rx="1.5" fill="{P}"/>'

ICONS['ofensiva'] = f'''
<path d="M32 5 C37 16 51 22 51 39 C51 51 42 59 32 59 C22 59 13 51 13 39 C13 30 18 25 22 19 C23.5 26 26 29.5 28.5 30 C27 20 29 12 32 5 Z" fill="{O}"/>
<path d="M32 30 C35 36 42 39.5 42 47 C42 53 37.5 57 32 57 C26.5 57 22 53 22 47 C22 41.5 26 38.5 28.5 34.5 C29.5 37 31 38.5 32.5 38.5 C31.5 35.5 31.5 32.5 32 30 Z" fill="{G}"/>'''

ICONS['diamantes'] = f'''
{rounded_poly("19,13 45,13 55,26 32,53 9,26", C, 6)}
<polygon points="19,13 45,13 55,26 9,26" fill="{Cl}" stroke="{Cl}" stroke-width="2" stroke-linejoin="round"/>
<polygon points="21,26 43,26 32,51" fill="{Cm}"/>
<polygon points="27,13 37,13 43,26 21,26" fill="{W}" opacity="0.7"/>'''

ICONS['vidas'] = f'''
<path d="M32 55 C29 53 9 41 9 24 C9 15.5 15.5 9 23.5 9 C27.5 9 30.5 11 32 14 C33.5 11 36.5 9 40.5 9 C48.5 9 55 15.5 55 24 C55 41 35 53 32 55 Z" fill="{R}"/>
<ellipse cx="21" cy="20" rx="5.5" ry="3.5" fill="{W}" opacity="0.55" transform="rotate(-35 21 20)"/>'''

# ---- abas ----
ICONS['inicio'] = f'''
{rounded_poly("32,8 55,30 9,30", R, 6)}
<rect x="14" y="27" width="36" height="30" rx="7" fill="{G}"/>
<rect x="27" y="39" width="10" height="18" rx="5" fill="{B}"/>
<circle cx="32" cy="22" r="4" fill="{W}"/>'''

ICONS['missoes'] = f'''
<circle cx="30" cy="34" r="24" fill="{R}"/><circle cx="30" cy="34" r="17" fill="{W}"/>
<circle cx="30" cy="34" r="10" fill="{R}"/><circle cx="30" cy="34" r="4" fill="{W}"/>
<line x1="31" y1="33" x2="52" y2="12" stroke="{I}" stroke-width="4" stroke-linecap="round"/>
{rounded_poly("50,6 58,14 52,18 46,12", B, 3)}'''

ICONS['ranking'] = f'''
<path d="M18 16 H11 C9 16 9 27 18 30 M46 16 H53 C55 16 55 27 46 30" fill="none" stroke="{G}" stroke-width="5" stroke-linecap="round"/>
<path d="M17 8 H47 V24 C47 34 40.5 41 32 41 C23.5 41 17 34 17 24 Z" fill="{G}"/>
<rect x="22" y="13" width="5" height="16" rx="2.5" fill="{Gl}"/>
<rect x="28" y="40" width="8" height="8" fill="{Gd}"/>
<rect x="17" y="47" width="30" height="10" rx="5" fill="{O}"/>'''

ICONS['assinatura'] = f'''
{rounded_poly("11,47 14,20 24,32 32,13 40,32 50,20 53,47", G, 6)}
<rect x="10" y="44" width="44" height="12" rx="5" fill="{Gd}"/>
<circle cx="14" cy="19" r="4.5" fill="{K}"/><circle cx="32" cy="12" r="4.5" fill="{B}"/><circle cx="50" cy="19" r="4.5" fill="{T}"/>
<circle cx="22" cy="50" r="2.5" fill="{W}"/><circle cx="32" cy="50" r="2.5" fill="{W}"/><circle cx="42" cy="50" r="2.5" fill="{W}"/>'''

ICONS['perfil'] = f'''
<circle cx="32" cy="22" r="12" fill="{P}"/>
<path d="M11 57 C11 45 20 37 32 37 C44 37 53 45 53 57 Z" fill="{P}"/>
<circle cx="28" cy="18" r="3" fill="{W}" opacity="0.6"/>'''

# ---- trilha ----
ICONS['estrela'] = rounded_poly(star(32, 34, 25, 11.5), G, 6) + \
    f'<circle cx="25" cy="27" r="3" fill="{W}" opacity="0.6"/>'
ICONS['bau'] = f'''
<rect x="8" y="30" width="48" height="27" rx="7" fill="{O}"/>
<path d="M8 33 V25 C8 17 14 12 22 12 H42 C50 12 56 17 56 25 V33 Z" fill="{Ol}"/>
<rect x="27" y="12" width="10" height="45" fill="{G}"/>
<rect x="25" y="27" width="14" height="13" rx="4" fill="{Gd}"/>
<circle cx="32" cy="33.5" r="2.5" fill="{I}"/>'''
ICONS['guia'] = f'''
<rect x="14" y="8" width="40" height="49" rx="8" fill="{T}"/>
<rect x="14" y="8" width="11" height="49" rx="5" fill="{Td}"/>
<circle cx="14" cy="18" r="3" fill="{W}"/><circle cx="14" cy="28" r="3" fill="{W}"/><circle cx="14" cy="38" r="3" fill="{W}"/><circle cx="14" cy="48" r="3" fill="{W}"/>
<rect x="31" y="18" width="17" height="9" rx="3" fill="{W}"/>'''

# ---- matérias ----
ICONS['matematica'] = f'''
<rect x="8" y="8" width="48" height="48" rx="13" fill="{B}"/>
<rect x="17" y="21" width="12" height="4" rx="2" fill="{W}"/><rect x="21" y="17" width="4" height="12" rx="2" fill="{W}"/>
<rect x="35" y="21" width="12" height="4" rx="2" fill="{W}"/>
<g transform="rotate(45 23 41)"><rect x="17" y="39" width="12" height="4" rx="2" fill="{W}"/><rect x="21" y="35" width="4" height="12" rx="2" fill="{W}"/></g>
<rect x="35" y="39" width="12" height="4" rx="2" fill="{W}"/><circle cx="41" cy="34.5" r="2.2" fill="{W}"/><circle cx="41" cy="47.5" r="2.2" fill="{W}"/>'''

ICONS['biologia'] = f'''
<g stroke="{G}" stroke-width="4" stroke-linecap="round">
<line x1="25" y1="12" x2="39" y2="12"/><line x1="29" y1="21" x2="35" y2="21"/><line x1="29" y1="43" x2="35" y2="43"/><line x1="25" y1="52" x2="39" y2="52"/></g>
<path d="M22 5 C22 22 42 22 42 32 C42 42 22 42 22 59" fill="none" stroke="{Gr}" stroke-width="7" stroke-linecap="round"/>
<path d="M42 5 C42 22 22 22 22 32 C22 42 42 42 42 59" fill="none" stroke="{K}" stroke-width="7" stroke-linecap="round"/>'''

ICONS['quimica'] = f'''
<path d="M25 10 H39 V25 L52 49 C54.5 53.5 51.5 58 46.5 58 H17.5 C12.5 58 9.5 53.5 12 49 L25 25 Z" fill="{Bl}"/>
<path d="M17.5 40 H46.5 L52 49 C54.5 53.5 51.5 58 46.5 58 H17.5 C12.5 58 9.5 53.5 12 49 Z" fill="{P}"/>
<rect x="22" y="6" width="20" height="7" rx="3.5" fill="{B}"/>
<circle cx="26" cy="49" r="3" fill="{W}" opacity="0.8"/><circle cx="36" cy="45" r="2" fill="{W}" opacity="0.8"/><circle cx="37" cy="31" r="2.5" fill="{P}"/>'''

ICONS['fisica'] = f'''
<g fill="none" stroke-width="4">
<ellipse cx="32" cy="32" rx="25" ry="9.5" stroke="{B}"/>
<ellipse cx="32" cy="32" rx="25" ry="9.5" stroke="{T}" transform="rotate(60 32 32)"/>
<ellipse cx="32" cy="32" rx="25" ry="9.5" stroke="{P}" transform="rotate(-60 32 32)"/></g>
<circle cx="32" cy="32" r="7" fill="{K}"/>'''

ICONS['historia'] = f'''
{rounded_poly("8,23 32,9 56,23", O, 5)}
<rect x="12" y="27" width="10" height="21" rx="4" fill="{G}"/><rect x="27" y="27" width="10" height="21" rx="4" fill="{G}"/><rect x="42" y="27" width="10" height="21" rx="4" fill="{G}"/>
<rect x="7" y="48" width="50" height="9" rx="4.5" fill="{O}"/>'''

ICONS['geografia'] = f'''
<circle cx="32" cy="32" r="25" fill="{B}"/>
<path d="M17 21 C21 13 33 14 31 23 C29.5 30 22 35 17.5 31 C14.5 28 15 24.5 17 21 Z" fill="{Gr}"/>
<path d="M37 34 C43 29 52 35 48 44 C45 50 37 50 35.5 43.5 C34.5 40 35 36.5 37 34 Z" fill="{Gr}"/>
<path d="M38 13 C42 12 46 14 44 18 C42 21 37 19 38 13 Z" fill="{Gr}"/>
<ellipse cx="22" cy="44" rx="4" ry="2.5" fill="{W}" opacity="0.35"/>'''

ICONS['portugues'] = f'''
<path d="M7 17 C15 12 25 12.5 31 17.5 V55 C25 50 15 49.5 7 53 Z" fill="{K}"/>
<path d="M57 17 C49 12 39 12.5 33 17.5 V55 C39 50 49 49.5 57 53 Z" fill="{Kl}"/>
<g stroke="{W}" stroke-width="3" stroke-linecap="round"><line x1="13" y1="25" x2="25" y2="23.5"/><line x1="13" y1="33" x2="25" y2="31.5"/><line x1="13" y1="41" x2="22" y2="40"/>
<line x1="39" y1="23.5" x2="51" y2="25"/><line x1="39" y1="31.5" x2="51" y2="33"/></g>'''

ICONS['literatura'] = f'''
<rect x="13" y="7" width="38" height="50" rx="7" fill="{P}"/>
<rect x="45" y="11" width="6" height="42" rx="2" fill="{W}"/>
<path d="M21 7 H31 V27 L26 23 L21 27 Z" fill="{K}"/>
<rect x="20" y="36" width="19" height="4" rx="2" fill="{W}" opacity="0.8"/><rect x="20" y="44" width="13" height="4" rx="2" fill="{W}" opacity="0.8"/>'''

ICONS['idiomas'] = f'''
<rect x="5" y="9" width="35" height="25" rx="11" fill="{B}"/><polygon points="12,32 12,42 21,33" fill="{B}" stroke="{B}" stroke-width="3" stroke-linejoin="round"/>
<rect x="24" y="27" width="35" height="25" rx="11" fill="{T}"/><polygon points="52,50 52,60 43,51" fill="{T}" stroke="{T}" stroke-width="3" stroke-linejoin="round"/>
<circle cx="15" cy="21.5" r="2.5" fill="{W}"/><circle cx="22.5" cy="21.5" r="2.5" fill="{W}"/><circle cx="30" cy="21.5" r="2.5" fill="{W}"/>
<rect x="32" y="37" width="19" height="4" rx="2" fill="{W}"/>'''

ICONS['filosofia'] = f'''
<circle cx="32" cy="26" r="19" fill="{G}"/>
<rect x="24" y="38" width="16" height="10" rx="3" fill="{G}"/>
<rect x="24" y="48" width="16" height="4.5" rx="2.25" fill="#9AA0B5"/><rect x="26" y="54" width="12" height="4.5" rx="2.25" fill="#9AA0B5"/>
<path d="M26 37 V30 L29 27 L32 30 L35 27 L38 30 V37" fill="none" stroke="{O}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
<circle cx="25" cy="19" r="4" fill="{W}" opacity="0.6"/>'''

ICONS['sociologia'] = f'''
<circle cx="15" cy="25" r="7" fill="{K}"/><path d="M4 50 C4 40 9 35 15 35 C21 35 26 40 26 50 Z" fill="{K}"/>
<circle cx="49" cy="25" r="7" fill="{T}"/><path d="M38 50 C38 40 43 35 49 35 C55 35 60 40 60 50 Z" fill="{T}"/>
<circle cx="32" cy="21" r="9" fill="{B}"/><path d="M17 56 C17 43 24 36 32 36 C40 36 47 43 47 56 Z" fill="{B}"/>'''

ICONS['artes'] = f'''
<path d="M32 7 C48 7 58 17 58 29 C58 37.5 52 40 46 38 C40 36 35.5 40 37.5 46 C39.5 52 36 57 29 57 C15 57 6 46 6 32 C6 18 17 7 32 7 Z" fill="{Gl}"/>
<circle cx="20" cy="22" r="5" fill="{R}"/><circle cx="33" cy="17" r="5" fill="{B}"/><circle cx="45" cy="24" r="5" fill="{Gr}"/><circle cx="17" cy="37" r="5" fill="{P}"/>'''

ICONS['redacao'] = f'''
<g transform="rotate(40 32 32)">
<rect x="25" y="4" width="14" height="10" rx="5" fill="{K}"/>
<rect x="25" y="12" width="14" height="5" fill="{L}"/>
<rect x="25" y="16" width="14" height="28" rx="2" fill="{O}"/>
{rounded_poly("25,44 39,44 32,58", '#FFD9A8', 2)}
{rounded_poly("29.5,52 34.5,52 32,58", I, 1.5)}</g>'''

# ---- missões ----
ICONS['cronometro'] = f'''
<rect x="27" y="4" width="10" height="8" rx="3" fill="{B}"/>
<circle cx="32" cy="36" r="23" fill="{B}"/><circle cx="32" cy="36" r="17" fill="{W}"/>
<line x1="32" y1="36" x2="32" y2="25" stroke="{I}" stroke-width="4" stroke-linecap="round"/>
<line x1="32" y1="36" x2="40" y2="40" stroke="{R}" stroke-width="4" stroke-linecap="round"/>
<circle cx="32" cy="36" r="3" fill="{I}"/>'''
ICONS['raio'] = rounded_poly("38,6 15,36 30,36 25,58 50,26 35,26", G, 5)
ICONS['revisar'] = f'''
<path d="M13 30 A19 19 0 0 1 46 18" fill="none" stroke="{Gr}" stroke-width="7" stroke-linecap="round"/>
{rounded_poly("41,9 53,17 41,24", Gr, 4)}
<path d="M51 34 A19 19 0 0 1 18 46" fill="none" stroke="{T}" stroke-width="7" stroke-linecap="round"/>
{rounded_poly("23,55 11,47 23,40", T, 4)}'''
ICONS['trilha'] = f'''
{rounded_poly("8,15 24,9 40,15 56,9 56,49 40,55 24,49 8,55", T, 4)}
<polygon points="24,9 40,15 40,55 24,49" fill="{Grl}"/>
<path d="M14 44 C20 34 30 40 34 30" fill="none" stroke="{W}" stroke-width="3" stroke-linecap="round" stroke-dasharray="1 6"/>
<path d="M44 16 C38 16 36 21 36 24 C36 30 44 36 44 36 C44 36 52 30 52 24 C52 21 50 16 44 16 Z" fill="{R}"/><circle cx="44" cy="24" r="3" fill="{W}"/>'''

def svg(name, body, size=64):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="{size}" height="{size}">{body}</svg>'

GROUPS = [
    ('Barra de cima', ['prova', 'materias', 'ofensiva', 'diamantes', 'vidas']),
    ('Abas de baixo', ['inicio', 'missoes', 'ranking', 'assinatura', 'perfil']),
    ('Trilha', ['estrela', 'bau', 'guia']),
    ('Matérias', ['matematica', 'biologia', 'quimica', 'fisica', 'historia', 'geografia', 'portugues', 'literatura', 'idiomas', 'filosofia', 'sociologia', 'artes', 'redacao']),
    ('Missões', ['cronometro', 'raio', 'revisar', 'trilha']),
]
LABELS = {'prova': 'Prova', 'materias': 'Matérias', 'ofensiva': 'Ofensiva', 'diamantes': 'Diamantes', 'vidas': 'Vidas',
          'inicio': 'Início', 'missoes': 'Missões', 'ranking': 'Ranking', 'assinatura': 'Assinatura', 'perfil': 'Perfil',
          'estrela': 'Fase', 'bau': 'Baú', 'guia': 'Guia', 'matematica': 'Matemática', 'biologia': 'Biologia', 'quimica': 'Química',
          'fisica': 'Física', 'historia': 'História', 'geografia': 'Geografia', 'portugues': 'Português', 'literatura': 'Literatura',
          'idiomas': 'Idiomas', 'filosofia': 'Filosofia', 'sociologia': 'Sociologia', 'artes': 'Artes', 'redacao': 'Redação',
          'cronometro': 'No tempo', 'raio': 'XP', 'revisar': 'Revisar', 'trilha': 'Fases'}

ts = ['// Gerado por scripts/ilustracoes.py. Não edite à mão.', 'export const ART = {']
for n, body in ICONS.items():
    xml = ' '.join(svg(n, body).split())
    ts.append(f'  {n}: {json.dumps(xml, ensure_ascii=False)},')
ts += ['} as const;', '', 'export type ArtName = keyof typeof ART;', '']
os.makedirs(os.path.join(ROOT, 'src', 'illustrations'), exist_ok=True)
open(os.path.join(ROOT, 'src', 'illustrations', 'data.ts'), 'w').write('\n'.join(ts))

cells = []
for title, names in GROUPS:
    items = ''.join(f'<figure>{svg(n, ICONS[n], 72)}<figcaption>{LABELS[n]}</figcaption></figure>' for n in names)
    cells.append(f'<section><h2>{title}</h2><div class="grid">{items}</div></section>')
html = f'''<!doctype html><html><head><meta charset="utf-8"><style>
body{{margin:0;padding:32px 36px;background:#fff;font-family:system-ui,sans-serif;color:#2B2D42;width:720px}}
h1{{font-size:26px;margin:0 0 4px}} p{{margin:0 0 20px;color:#6E7387}}
h2{{font-size:17px;margin:22px 0 10px;color:#6E7387}}
.grid{{display:flex;flex-wrap:wrap;gap:14px}}
figure{{margin:0;width:118px;padding:14px 0 10px;border-radius:16px;background:#F5F6FA;display:flex;flex-direction:column;align-items:center;gap:8px}}
figcaption{{font-size:13px;font-weight:600}}
.row{{display:flex;gap:26px;align-items:center;margin-top:8px;padding:12px 18px;border-bottom:2px solid #E3E5EE}}
.row span{{display:flex;align-items:center;gap:4px;font-weight:800;font-size:17px}}
</style></head><body><h1>Ilustrações do app</h1><p>Prévia: vetoriais, geométricas, arredondadas e com cores vivas.</p>
<h2>Como fica a barra de cima</h2><div class="row">
<span>{svg('', ICONS['prova'], 26)}ENEM</span><span style="color:#3D7BFF">{svg('', ICONS['materias'], 26)}6</span>
<span style="color:#FF8A1F">{svg('', ICONS['ofensiva'], 26)}3</span><span style="color:#2EB8E6">{svg('', ICONS['diamantes'], 26)}120</span>
<span style="color:#FF4B6E">{svg('', ICONS['vidas'], 26)}5</span></div>
{''.join(cells)}</body></html>'''
open(os.path.join(OUT, 'previa.html'), 'w').write(html)
print(len(ICONS), 'ilustrações geradas')
