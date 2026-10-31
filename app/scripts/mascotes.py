"""Mascotes do app (SVG 120x160, corpo inteiro): o Gabaritatu é o principal; os outros formam o elenco.

Rode `python3 scripts/mascotes.py` para gerar src/illustrations/mascots.ts e a prévia em
scripts/mascotes/previa.html.
Estilo: plano e geométrico, sem contorno, proporções de adolescente, expressões seguras
(olhos semicerrados, sorriso de canto) e roupas de jovem. Pensado para o público de 16 a 19 anos.
"""
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'scripts', 'mascotes')
os.makedirs(OUT, exist_ok=True)

INK = '#22242F'
W = '#FFFFFF'
SNEAKER, SOLE = '#DDE1EC', '#8E95AB'


def eye(cx, cy, lid, w=5.2, h=4.6, brow=None, tilt=0):
    """Olho semicerrado: branco, pupila e pálpebra da cor da pele; sobrancelha opcional."""
    out = (f'<ellipse cx="{cx}" cy="{cy}" rx="{w}" ry="{h}" fill="{W}"/>'
           f'<circle cx="{cx + 0.6}" cy="{cy + 0.8}" r="{h * 0.72:.1f}" fill="{INK}"/>'
           f'<path d="M{cx - w - 1} {cy - h - 1} H{cx + w + 1} V{cy - h * 0.15:.1f} '
           f'Q{cx} {cy - h * 0.55:.1f} {cx - w - 1} {cy - h * 0.15:.1f} Z" fill="{lid}"/>')
    if brow:
        out += (f'<path d="M{cx - w} {cy - h - 3 + tilt} L{cx + w} {cy - h - 3 - tilt}" stroke="{brow}" '
                f'stroke-width="2.6" stroke-linecap="round"/>')
    return out


def smirk(cx, cy, w=6, color=INK):
    """Sorriso de canto, levemente assimétrico."""
    return f'<path d="M{cx - w} {cy} Q{cx + 1} {cy + 3.5} {cx + w} {cy - 2.5}" fill="none" stroke="{color}" stroke-width="2.6" stroke-linecap="round"/>'


def body(top, top_dark, pants, hand, sleeve=None):
    """Corpo de adolescente em pé: tênis, calça, tronco com roupa e braços."""
    sleeve = sleeve or top
    return f'''
<rect x="40" y="148" width="20" height="9" rx="4.5" fill="{SNEAKER}"/><rect x="40" y="154" width="20" height="3" rx="1.5" fill="{SOLE}"/>
<rect x="62" y="148" width="20" height="9" rx="4.5" fill="{SNEAKER}"/><rect x="62" y="154" width="20" height="3" rx="1.5" fill="{SOLE}"/>
<rect x="45" y="122" width="13" height="30" rx="5" fill="{pants}"/><rect x="63" y="122" width="13" height="30" rx="5" fill="{pants}"/>
<rect x="26" y="88" width="13" height="38" rx="6.5" fill="{sleeve}" transform="rotate(8 32 90)"/>
<rect x="81" y="88" width="13" height="38" rx="6.5" fill="{sleeve}" transform="rotate(-8 88 90)"/>
<circle cx="30" cy="127" r="6.5" fill="{hand}"/><circle cx="90" cy="127" r="6.5" fill="{hand}"/>
<rect x="34" y="82" width="52" height="50" rx="15" fill="{top_dark}"/>
<rect x="34" y="82" width="52" height="46" rx="15" fill="{top}"/>'''


MASCOTES = {}

# Gabaritatu (principal): tatu-bola confiante, moletom azul com o casco como capuz e fone no pescoço.
SHELL, SHELLd, SHELLl = '#8B5A3C', '#6E4229', '#A9785A'
SKIN, SKINd = '#E8C3A0', '#D4A57D'
MASCOTES['gabaritatu'] = body('#2F6FE8', '#1F4FB8', '#2B2D42', SKIN) + f'''
<path d="M51 105 L58 112 L70 98" fill="none" stroke="{W}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M22 58 Q22 18 60 16 Q98 18 98 58 Q98 84 80 90 H40 Q22 84 22 58 Z" fill="{SHELLd}"/>
<path d="M24 56 Q24 20 60 18 Q96 20 96 56 Q96 80 80 86 H40 Q24 80 24 56 Z" fill="{SHELL}"/>
<path d="M36 24 Q30 52 34 82 M84 24 Q90 52 86 82 M50 18 Q46 34 47 44 M70 18 Q74 34 73 44" fill="none" stroke="{SHELLl}" stroke-width="5" stroke-linecap="round"/>
<ellipse cx="42" cy="40" rx="5" ry="7" fill="{SKIN}" transform="rotate(-20 42 40)"/><ellipse cx="78" cy="40" rx="5" ry="7" fill="{SKIN}" transform="rotate(20 78 40)"/>
<path d="M41 50 Q41 39 60 39 Q79 39 79 50 V60 Q79 70 70 74 H50 Q41 70 41 60 Z" fill="{SKIN}"/>
<path d="M58 73 Q66 77 73 70" fill="none" stroke="{INK}" stroke-width="2.4" stroke-linecap="round"/>
<path d="M53 62 Q60 59 67 62 L65 84 Q60 88 55 84 Z" fill="{SKINd}"/>
<ellipse cx="60" cy="84" rx="4.2" ry="3" fill="{INK}"/>
{eye(51, 54, SKIN, brow=INK, tilt=0.8)}{eye(69, 54, SKIN, brow=INK, tilt=-1.6)}

'''

# Gabamico: macaco zoeiro, camiseta laranja larga e boné virado para trás.
M, Md, F = '#B86A2A', '#94531C', '#F2CDA3'
MASCOTES['gabamico'] = body('#FF8A1F', '#D96A00', '#3A6FD8', F) + f'''
<rect x="52" y="95" width="16" height="4" rx="2" fill="{W}" opacity="0.85"/>
<circle cx="31" cy="56" r="10" fill="{M}"/><circle cx="31" cy="56" r="5.5" fill="#E7A586"/>
<circle cx="89" cy="56" r="10" fill="{M}"/><circle cx="89" cy="56" r="5.5" fill="#E7A586"/>
<path d="M36 54 Q36 26 60 26 Q84 26 84 54 Q84 82 60 84 Q36 82 36 54 Z" fill="{M}"/>
<path d="M44 52 Q44 42 52 42 Q58 42 60 47 Q62 42 68 42 Q76 42 76 52 Q78 64 72 70 Q66 80 60 80 Q54 80 48 70 Q42 64 44 52 Z" fill="{F}"/>
{eye(52, 54, F, brow=M, tilt=-1.8)}{eye(68, 54, F, brow=M, tilt=1.2)}
<circle cx="57" cy="64" r="1.8" fill="{INK}"/><circle cx="63" cy="64" r="1.8" fill="{INK}"/>
<path d="M51 71 Q60 76 70 69" fill="none" stroke="{INK}" stroke-width="2.6" stroke-linecap="round"/>
<g transform="rotate(-10 96 124)"><rect x="86" y="108" width="20" height="26" rx="4" fill="{W}"/>
<circle cx="91" cy="115" r="2.2" fill="{INK}"/><rect x="95" y="114" width="8" height="2.4" rx="1.2" fill="#C9CDD9"/>
<circle cx="91" cy="122" r="2.2" fill="#C9CDD9"/><rect x="95" y="121" width="8" height="2.4" rx="1.2" fill="#C9CDD9"/>
<circle cx="91" cy="129" r="2.2" fill="{INK}"/><rect x="95" y="128" width="8" height="2.4" rx="1.2" fill="#C9CDD9"/></g>
<circle cx="90" cy="127" r="6.5" fill="{F}"/>'''

# Aprovaca: vaca organizada, blazer, óculos redondos e livro debaixo do braço.
C, Cd, SPOT, MUZ = '#F7F3EE', '#E2DBD2', '#2B2D42', '#EE9AAE'
MASCOTES['aprovaca'] = body('#2B3A67', '#1E2A4D', '#4A4F63', C) + f'''
<path d="M48 82 L60 100 L72 82 Z" fill="{W}"/><path d="M57 92 L60 100 L63 92 Z" fill="#D93030"/>
<rect x="18" y="104" width="16" height="22" rx="3" fill="#9B5CFF" transform="rotate(8 26 115)"/>
<ellipse cx="27" cy="44" rx="11" ry="6" fill="{Cd}" transform="rotate(-20 27 44)"/>
<ellipse cx="93" cy="44" rx="11" ry="6" fill="{Cd}" transform="rotate(20 93 44)"/>
<path d="M42 28 Q38 18 42 14 Q46 22 48 28 Z" fill="#E0B74A"/><path d="M78 28 Q82 18 78 14 Q74 22 72 28 Z" fill="#E0B74A"/>
<rect x="34" y="24" width="52" height="62" rx="22" fill="{C}"/>
<path d="M34 46 Q34 28 50 25 Q54 36 48 46 Q42 52 34 46 Z" fill="{SPOT}"/>
<rect x="38" y="62" width="44" height="22" rx="11" fill="{MUZ}"/>
<ellipse cx="51" cy="72" rx="2.8" ry="3.6" fill="#C8607A"/><ellipse cx="69" cy="72" rx="2.8" ry="3.6" fill="#C8607A"/>
{eye(50, 50, C)}{eye(70, 50, C)}
<circle cx="50" cy="50" r="8" fill="none" stroke="{INK}" stroke-width="2.4"/><circle cx="70" cy="50" r="8" fill="none" stroke="{INK}" stroke-width="2.4"/>
<path d="M58 50 H62" stroke="{INK}" stroke-width="2.4"/>
<path d="M54 79 Q60 82 66 79" fill="none" stroke="#9E3F59" stroke-width="2.4" stroke-linecap="round"/>'''

# Rãdação: rã artista, gola alta preta, gorro mostarda e caneta na mão.
R, Rd, RB = '#3DAA5C', '#2A8A45', '#9AD9AC'
MASCOTES['radacao'] = body('#2B2D42', '#1C1D28', '#5A4A3A', R) + f'''
<rect x="48" y="80" width="24" height="10" rx="5" fill="#1C1D28"/>
<path d="M30 58 Q30 34 60 34 Q90 34 90 58 Q90 82 60 84 Q30 82 30 58 Z" fill="{R}"/>
<ellipse cx="60" cy="70" rx="20" ry="11" fill="{RB}"/>
<circle cx="44" cy="40" r="11" fill="{R}"/><circle cx="76" cy="40" r="11" fill="{R}"/>
{eye(44, 41, R, w=6.4, h=5.6)}{eye(76, 41, R, w=6.4, h=5.6)}
<path d="M38 32 Q38 14 60 14 Q82 14 82 32 Q60 26 38 32 Z" fill="#E0A21F"/>
<rect x="36" y="28" width="48" height="8" rx="4" fill="#C98A10"/><circle cx="60" cy="12" r="4.5" fill="#E0A21F"/>
<circle cx="56" cy="55" r="1.8" fill="{Rd}"/><circle cx="64" cy="55" r="1.8" fill="{Rd}"/>
<path d="M50 62 H70" stroke="{INK}" stroke-width="2.6" stroke-linecap="round"/>
<g transform="rotate(-35 92 118)"><rect x="89" y="96" width="6" height="28" rx="2" fill="#F4F5F9"/>
<rect x="89" y="96" width="6" height="7" rx="2" fill="#2F6FE8"/><polygon points="89,124 95,124 92,131" fill="{INK}"/></g>'''

# Simuláguia: águia treinadora, jaqueta esportiva vermelha e cronômetro no pescoço.
HEAD, BEAK, Ed = '#FFFFFF', '#F2B518', '#6E4229'
MASCOTES['simulaguia'] = body('#D93030', '#A32121', '#2B2D42', '#F2B518', sleeve='#D93030') + f'''
<rect x="38" y="86" width="4" height="40" fill="{W}" opacity="0.9"/><rect x="78" y="86" width="4" height="40" fill="{W}" opacity="0.9"/>
<rect x="58" y="84" width="4" height="44" fill="#A32121"/>
<path d="M50 84 L60 104 L70 84" fill="none" stroke="{INK}" stroke-width="2.4"/>
<circle cx="60" cy="110" r="9" fill="#2F6FE8"/><circle cx="60" cy="110" r="6.5" fill="{W}"/>
<path d="M60 110 V105.5 M60 110 L63 112" stroke="{INK}" stroke-width="2" stroke-linecap="round"/><rect x="57" y="99" width="6" height="3" rx="1.5" fill="#2F6FE8"/>
<path d="M36 54 Q36 26 60 24 Q84 26 84 54 Q84 76 60 80 Q36 76 36 54 Z" fill="{HEAD}"/>
<path d="M44 26 Q50 16 56 24 Q60 14 64 24 Q70 16 76 26" fill="{HEAD}"/>
{eye(50, 50, HEAD, brow=INK, tilt=-2.2)}{eye(70, 50, HEAD, brow=INK, tilt=2.2)}
<path d="M52 60 Q60 54 70 60 Q66 74 58 76 Q55 70 52 60 Z" fill="{BEAK}"/>
<path d="M58 70 Q62 72 65 68" fill="none" stroke="#C48F06" stroke-width="2" stroke-linecap="round"/>'''

# Passarinho: passarinho tranquilo, jaqueta bomber verde-azulada e fone de ouvido.
Y, Yd, O = '#F7C531', '#DDA810', '#F07F1C'
MASCOTES['passarinho'] = body('#14A090', '#0E7A6E', '#2B2D42', Y) + f'''
<rect x="34" y="122" width="52" height="7" rx="3.5" fill="#0E7A6E"/><rect x="46" y="82" width="28" height="8" rx="4" fill="#0E7A6E"/>
<path d="M36 56 Q36 28 60 28 Q84 28 84 56 Q84 82 60 84 Q36 82 36 56 Z" fill="{Y}"/>
<ellipse cx="60" cy="70" rx="15" ry="11" fill="#FCE7A4"/>
<path d="M54 30 Q52 18 60 16 Q58 24 62 28 Q66 20 72 22 Q66 26 66 32 Z" fill="{O}"/>
{eye(51, 53, Y, brow='#B9860A', tilt=0.6)}{eye(69, 53, Y, brow='#B9860A', tilt=-0.6)}
<path d="M55 61 L65 61 L60 69 Z" fill="{O}" stroke="{O}" stroke-width="2.4" stroke-linejoin="round"/>
<path d="M38 56 Q38 30 60 30 Q82 30 82 56" fill="none" stroke="{INK}" stroke-width="3.4"/>
<rect x="31" y="50" width="9" height="14" rx="4" fill="{INK}"/><rect x="80" y="50" width="9" height="14" rx="4" fill="{INK}"/>'''

# Quadros de fala: a mesma figura com a boca aberta. O app alterna entre os dois enquanto o
# personagem fala. Cada par troca o trecho da boca fechada pelo da boca aberta.
TONGUE = '#E86A7A'
FALA = {
    'gabaritatu': [(
        f'<path d="M58 73 Q66 77 73 70" fill="none" stroke="{INK}" stroke-width="2.4" stroke-linecap="round"/>',
        f'<path d="M57 71 Q66 84 74 69 Q66 74 57 71 Z" fill="{INK}"/><path d="M62 77 Q66 80 70 76 Q66 75 62 77 Z" fill="{TONGUE}"/>',
    )],
    'gabamico': [(
        f'<path d="M51 71 Q60 76 70 69" fill="none" stroke="{INK}" stroke-width="2.6" stroke-linecap="round"/>',
        f'<path d="M50 69 Q60 84 71 68 Q60 72 50 69 Z" fill="{INK}"/><path d="M55 76 Q60 80 66 75 Q60 74 55 76 Z" fill="{TONGUE}"/>',
    )],
    'aprovaca': [(
        '<path d="M54 79 Q60 82 66 79" fill="none" stroke="#9E3F59" stroke-width="2.4" stroke-linecap="round"/>',
        '<ellipse cx="60" cy="79.5" rx="5.5" ry="3.6" fill="#7A2C42"/>',
    )],
    'radacao': [(
        f'<path d="M50 62 H70" stroke="{INK}" stroke-width="2.6" stroke-linecap="round"/>',
        f'<path d="M49 61 Q60 74 71 61 Q60 63 49 61 Z" fill="{INK}"/><path d="M55 66 Q60 70 65 66 Q60 65 55 66 Z" fill="{TONGUE}"/>',
    )],
    'simulaguia': [(
        f'<path d="M52 60 Q60 54 70 60 Q66 74 58 76 Q55 70 52 60 Z" fill="{BEAK}"/>',
        f'<path d="M55 64 Q62 66 68 62 Q65 76 58 79 Q56 72 55 64 Z" fill="#B87F05"/>'
        f'<path d="M52 60 Q60 54 70 60 Q66 66 58 67 Q55 65 52 60 Z" fill="{BEAK}"/>',
    ), (
        '<path d="M58 70 Q62 72 65 68" fill="none" stroke="#C48F06" stroke-width="2" stroke-linecap="round"/>',
        '',
    )],
    'passarinho': [(
        f'<path d="M55 61 L65 61 L60 69 Z" fill="{O}" stroke="{O}" stroke-width="2.4" stroke-linejoin="round"/>',
        f'<path d="M57 66 L63 66 L60 72 Z" fill="#C25E0C" stroke="#C25E0C" stroke-width="2.4" stroke-linejoin="round"/>'
        f'<path d="M55 60 L65 60 L60 64 Z" fill="{O}" stroke="{O}" stroke-width="2.4" stroke-linejoin="round"/>',
    )],
}
FALANDO = {}
for k, trocas in FALA.items():
    b = MASCOTES[k]
    for fechada, aberta in trocas:
        assert fechada in b, (k, fechada)
        b = b.replace(fechada, aberta)
    FALANDO[k] = b

NOMES = {
    'gabaritatu': ('Gabaritatu', 'O confiante', 'Gabarito + tatu'),
    'gabamico': ('Gabamico', 'O zoeiro', 'Gabarito + mico'),
    'aprovaca': ('Aprovaca', 'A organizada', 'Aprovação + vaca'),
    'radacao': ('Rãdação', 'O artista', 'Redação + rã'),
    'simulaguia': ('Simuláguia', 'A treinadora', 'Simulado + águia'),
    'passarinho': ('Passarinho', 'O tranquilo', 'Passar + passarinho'),
}


def svg(body, size=120):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 160" width="{size}" height="{size * 4 // 3}">{body}</svg>'


if __name__ == '__main__':
    for k, b in MASCOTES.items():
        open(os.path.join(OUT, f'{k}.svg'), 'w').write(svg(b))
    # Dados para o app: um SVG por mascote, usado pelo componente <Mascot>.
    import json
    ts = ['// Gerado por scripts/mascotes.py. Não edite à mão.', 'export const MASCOTS = {']
    for k, body_ in MASCOTES.items():
        ts.append(f'  {k}: {json.dumps(" ".join(svg(body_).split()), ensure_ascii=False)},')
    ts += ['} as const;', '', '/** Mesma figura com a boca aberta, para animar a fala. */',
           'export const MASCOTS_TALK: Record<keyof typeof MASCOTS, string> = {']
    for k, body_ in FALANDO.items():
        ts.append(f'  {k}: {json.dumps(" ".join(svg(body_).split()), ensure_ascii=False)},')
    ts += ['};', '', 'export type MascotName = keyof typeof MASCOTS;', '',
           'export const MASCOT_NAMES: Record<MascotName, string> = {']
    ts += [f"  {k}: '{NOMES[k][0]}'," for k in MASCOTES]
    ts += ['};', '']
    open(os.path.join(ROOT, 'src', 'illustrations', 'mascots.ts'), 'w').write('\n'.join(ts))
    main = 'gabaritatu'
    cards = ''.join(
        f'<figure class="{"main" if k == main else ""}">{svg(MASCOTES[k], 190 if k == main else 140)}'
        f'<figcaption><b>{NOMES[k][0]}</b><i>{NOMES[k][1]}</i><span>{NOMES[k][2]}</span></figcaption></figure>'
        for k in MASCOTES
    )
    fala = ''.join(f'<span>{svg(MASCOTES[k], 90)}{svg(FALANDO[k], 90)}</span>' for k in MASCOTES)
    dark = ''.join(f'<span>{svg(MASCOTES[k], 64)}</span>' for k in MASCOTES)
    html = f'''<!doctype html><html><head><meta charset="utf-8"><style>
body{{margin:0;padding:32px 36px;background:#fff;font-family:system-ui,sans-serif;color:#2B2D42;width:760px}}
h1{{font-size:26px;margin:0 0 4px}} p{{margin:0 0 22px;color:#6E7387}}
.grid{{display:flex;flex-wrap:wrap;gap:16px;align-items:stretch}}
figure{{margin:0;width:230px;padding:16px 0 14px;border-radius:20px;background:#F5F6FA;display:flex;flex-direction:column;align-items:center;gap:8px}}
figure.main{{width:100%;background:#EAF1FF;flex-direction:row;justify-content:center;gap:28px}}
figcaption{{display:flex;flex-direction:column;align-items:center;gap:2px}} figcaption b{{font-size:19px}}
figcaption i{{font-style:normal;font-size:14px;font-weight:600;color:#2F6FE8}} figcaption span{{font-size:13px;color:#6E7387}}
figure.main figcaption b{{font-size:30px}} figure.main figcaption{{align-items:flex-start}}
.dark{{margin-top:22px;background:#141826;border-radius:20px;padding:16px;display:flex;justify-content:space-around}}
</style></head><body><h1>Mascotes, versão 2</h1><p>Mais adultos: corpo inteiro, expressões seguras e roupas de jovem. Prévia, ainda não estão no app.</p>
<div class="grid">{cards}</div><div class="dark">{dark}</div><h1 style="margin-top:22px">Falando</h1><div class="grid">{fala}</div></body></html>'''
    open(os.path.join(OUT, 'previa.html'), 'w').write(html)
    print(len(MASCOTES), 'mascotes')
