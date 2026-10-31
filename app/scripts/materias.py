"""Mascotes por matéria (prévia). Mesmo estilo de scripts/mascotes.py: plano, geométrico,
proporções de adolescente, 120 x 160. Rode `python3 scripts/materias.py` para gerar
scripts/materias/previa.html.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mascotes import INK, MASCOTES, W, body, eye, smirk, svg  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'scripts', 'materias')
os.makedirs(OUT, exist_ok=True)


def whiskers(y, color=INK, x0=46, x1=74):
    return (f'<path d="M{x0} {y} L{x0 - 12} {y - 3} M{x0} {y + 4} L{x0 - 12} {y + 5} M{x1} {y} L{x1 + 12} {y - 3} '
            f'M{x1} {y + 4} L{x1 + 12} {y + 5}" stroke="{color}" stroke-width="1.6" stroke-linecap="round" opacity="0.7"/>')


M = {}

# Gatemática: gato competitivo, moletom roxo com π.
C, Cd, Cl, PK = '#8E95A8', '#6E758A', '#E3E6EE', '#F2A0B5'
M['gatematica'] = body('#7A4FD8', '#5C35B3', '#2B2D42', C) + f'''
<path d="M49 99 H71 M55 99 V115 M65 99 Q64 111 69 115" fill="none" stroke="{W}" stroke-width="4" stroke-linecap="round"/>
<path d="M36 42 L40 14 L58 32 Z" fill="{C}"/><path d="M84 42 L80 14 L62 32 Z" fill="{C}"/>
<path d="M41 36 L43 22 L52 31 Z" fill="{PK}"/><path d="M79 36 L77 22 L68 31 Z" fill="{PK}"/>
<ellipse cx="60" cy="54" rx="26" ry="23" fill="{C}"/>
<path d="M54 32 L56 40 M60 31 V40 M66 32 L64 40" stroke="{Cd}" stroke-width="2.6" stroke-linecap="round"/>
<ellipse cx="60" cy="67" rx="13" ry="9" fill="{Cl}"/>
{eye(50, 53, C, brow=INK, tilt=-1.6)}{eye(70, 53, C, brow=INK, tilt=1.6)}
<path d="M56 61 H64 L60 65 Z" fill="{PK}" stroke="{PK}" stroke-width="1.5" stroke-linejoin="round"/>
{smirk(62, 70, w=5)}{whiskers(66, Cd, 47, 73)}'''

# Fisicobra: cobra gênio distraída, óculos redondos e onda no suéter.
G, Gd, Gl = '#4CAF6A', '#2E8A4C', '#CDEB9A'
M['fisicobra'] = body('#2B3A67', '#1E2A4D', '#4A4F63', G) + f'''
<path d="M42 106 Q47 97 52 106 T62 106 T72 106 T80 104" fill="none" stroke="#F2B518" stroke-width="3.4" stroke-linecap="round"/>
<ellipse cx="60" cy="52" rx="25" ry="23" fill="{G}"/>
<path d="M52 33 L56 37 L52 41 L48 37 Z M68 33 L72 37 L68 41 L64 37 Z M60 29 L63 32 L60 35 L57 32 Z" fill="{Gd}"/>
<ellipse cx="60" cy="66" rx="15" ry="9" fill="{Gl}"/>
{eye(50, 52, G)}{eye(70, 52, G)}
<circle cx="50" cy="52" r="8.5" fill="none" stroke="{INK}" stroke-width="2.2"/><circle cx="70" cy="52" r="8.5" fill="none" stroke="{INK}" stroke-width="2.2"/>
<path d="M58.5 52 H61.5" stroke="{INK}" stroke-width="2.2"/>
<path d="M51 69 Q60 74 69 69" fill="none" stroke="{INK}" stroke-width="2.4" stroke-linecap="round"/>
<path d="M60 72 V79 L57 83 M60 79 L63 83" fill="none" stroke="#D93030" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<circle cx="56" cy="62" r="1.3" fill="{Gd}"/><circle cx="64" cy="62" r="1.3" fill="{Gd}"/>'''

# Quimicoala: coala cientista maluco, jaleco, óculos de proteção e frasco borbulhando.
K, Kd, Kf = '#9AA0AE', '#7A8090', '#E8EAF0'
M['quimicoala'] = body('#F4F5F9', '#D5D9E4', '#2B2D42', K) + f'''
<path d="M52 82 L60 100 L68 82 Z" fill="#3DAA5C"/><path d="M52 82 L48 128 M68 82 L72 128" stroke="#C3C8D6" stroke-width="2"/>
<rect x="40" y="104" width="10" height="3" rx="1.5" fill="#2F6FE8"/>
<circle cx="33" cy="40" r="14" fill="{K}"/><circle cx="33" cy="40" r="8" fill="{Kf}"/>
<circle cx="87" cy="40" r="14" fill="{K}"/><circle cx="87" cy="40" r="8" fill="{Kf}"/>
<ellipse cx="60" cy="56" rx="25" ry="23" fill="{K}"/>
<path d="M48 36 L50 26 L55 33 L59 23 L63 33 L69 25 L70 35" fill="{K}"/>
<rect x="36" y="34" width="48" height="5" fill="#5A4A3A"/>
<circle cx="50" cy="37" r="7" fill="#9FD3F0" stroke="#5A4A3A" stroke-width="2.5"/><circle cx="70" cy="37" r="7" fill="#9FD3F0" stroke="#5A4A3A" stroke-width="2.5"/>
{eye(49, 54, K, w=5.6, h=5.2, brow=INK, tilt=-2.4)}{eye(71, 54, K, w=5.6, h=5.2, brow=INK, tilt=2.4)}
<ellipse cx="60" cy="64" rx="7" ry="9" fill="#3A3D4A"/>
<path d="M51 74 Q60 82 69 74 Q60 77 51 74 Z" fill="{INK}"/>
<g transform="rotate(12 94 118)"><path d="M90 100 H98 V108 L105 124 Q106 128 102 128 H86 Q82 128 83 124 L90 108 Z" fill="{W}" opacity="0.9"/>
<path d="M85 118 H103 L105 124 Q106 128 102 128 H86 Q82 128 83 124 Z" fill="#7CE36B"/>
<circle cx="93" cy="96" r="2.5" fill="#7CE36B"/><circle cx="98" cy="91" r="1.8" fill="#7CE36B"/></g>
<circle cx="90" cy="127" r="6.5" fill="{K}"/>'''

# Biolobo: lobo curioso, colete de explorador e lupa.
L, Ld, Ll = '#7D8BA6', '#5E6B85', '#E4E8F0'
M['biolobo'] = body('#3DAA5C', '#2A8A45', '#6B5A3E', L) + f'''
<path d="M34 86 Q36 84 46 84 L48 128 H40 Q34 126 34 118 Z M86 86 Q84 84 74 84 L72 128 H80 Q86 126 86 118 Z" fill="#C9A66B"/>
<rect x="38" y="100" width="7" height="6" rx="1.5" fill="#A88350"/><rect x="75" y="100" width="7" height="6" rx="1.5" fill="#A88350"/>
<path d="M36 40 L38 10 L56 28 Z" fill="{L}"/><path d="M84 40 L82 10 L64 28 Z" fill="{L}"/>
<path d="M41 34 L42 20 L51 29 Z" fill="{Ld}"/><path d="M79 34 L78 20 L69 29 Z" fill="{Ld}"/>
<ellipse cx="60" cy="52" rx="25" ry="22" fill="{L}"/>
<path d="M35 56 L30 66 L42 64 Z M85 56 L90 66 L78 64 Z" fill="{L}"/>
<ellipse cx="60" cy="66" rx="14" ry="11" fill="{Ll}"/>
{eye(50, 50, L, brow=Ld, tilt=0.8)}{eye(70, 50, L, brow=Ld, tilt=-1.2)}
<ellipse cx="60" cy="61" rx="5.5" ry="3.8" fill="{INK}"/>
{smirk(61, 70, w=5)}
<circle cx="97" cy="113" r="7" fill="#BDEBFF" fill-opacity="0.6" stroke="{INK}" stroke-width="2.5"/><path d="M93 119 L90 126" stroke="#8B5A3C" stroke-width="4" stroke-linecap="round"/>'''

# Histopótamo: hipopótamo calmo e erudito, blazer de tweed, gravata-borboleta e livro.
H, Hd, Hs = '#9B8FB8', '#7C6F9C', '#B9AED3'
M['histopotamo'] = body('#8B5A3C', '#6E4229', '#4A4F63', H) + f'''
<path d="M50 82 L60 98 L70 82 Z" fill="{W}"/><path d="M54 86 L60 89 L66 86 L66 92 L60 89 L54 92 Z" fill="#D93030"/>
<rect x="18" y="104" width="16" height="22" rx="3" fill="#2F6FE8" transform="rotate(8 26 115)"/><rect x="21" y="107" width="10" height="2.5" fill="#F2B518" transform="rotate(8 26 115)"/>
<ellipse cx="40" cy="31" rx="6" ry="5" fill="{Hd}"/><ellipse cx="80" cy="31" rx="6" ry="5" fill="{Hd}"/>
<ellipse cx="60" cy="48" rx="25" ry="20" fill="{H}"/>
<ellipse cx="60" cy="68" rx="29" ry="15" fill="{Hs}"/>
<ellipse cx="51" cy="64" rx="3" ry="2.2" fill="{Hd}"/><ellipse cx="69" cy="64" rx="3" ry="2.2" fill="{Hd}"/>
{eye(50, 45, H, w=4.6, h=4)}{eye(70, 45, H, w=4.6, h=4)}
<circle cx="50" cy="45" r="7" fill="none" stroke="#C9A24A" stroke-width="1.8"/><circle cx="70" cy="45" r="7" fill="none" stroke="#C9A24A" stroke-width="1.8"/>
<path d="M57 45 H63" stroke="#C9A24A" stroke-width="1.8"/>
<path d="M48 74 Q60 80 72 74" fill="none" stroke="{Hd}" stroke-width="2.4" stroke-linecap="round"/>'''

# Georafa: girafa aventureira, jaqueta de explorador e mochila.
Y, Yd, SP, Yl = '#F2C14E', '#D9A531', '#B9772E', '#F7DFA0'
M['georafa'] = body('#14A090', '#0E7A6E', '#6B5A3E', Y) + f'''
<rect x="52" y="56" width="16" height="34" rx="6" fill="{Y}"/>
<circle cx="57" cy="66" r="3" fill="{SP}"/><circle cx="64" cy="76" r="3.4" fill="{SP}"/><circle cx="56" cy="84" r="2.6" fill="{SP}"/>
<rect x="42" y="86" width="5" height="40" rx="2" fill="#8B5A3C"/><rect x="73" y="86" width="5" height="40" rx="2" fill="#8B5A3C"/>
<path d="M50 26 L47 12 M70 26 L73 12" stroke="{Y}" stroke-width="4" stroke-linecap="round"/>
<circle cx="47" cy="11" r="3.6" fill="{SP}"/><circle cx="73" cy="11" r="3.6" fill="{SP}"/>
<ellipse cx="37" cy="32" rx="9" ry="4.5" fill="{Y}" transform="rotate(-20 37 32)"/><ellipse cx="83" cy="32" rx="9" ry="4.5" fill="{Y}" transform="rotate(20 83 32)"/>
<ellipse cx="60" cy="38" rx="21" ry="18" fill="{Y}"/>
<circle cx="47" cy="30" r="3" fill="{SP}"/><circle cx="72" cy="28" r="2.6" fill="{SP}"/>
<ellipse cx="60" cy="51" rx="15" ry="9" fill="{Yl}"/>
{eye(52, 36, Y, w=4.8, h=4.4, brow='#8B5A3C', tilt=0.6)}{eye(68, 36, Y, w=4.8, h=4.4, brow='#8B5A3C', tilt=-0.6)}
<circle cx="56" cy="49" r="1.5" fill="{SP}"/><circle cx="64" cy="49" r="1.5" fill="{SP}"/>
{smirk(60, 55, w=4.5)}'''

# Filosofoca: foca contemplativa, gola alta preta.
F, Fd, Fl = '#8D98A8', '#6F7A8C', '#C8D0DC'
M['filosofoca'] = body('#22242F', '#14151C', '#5A4A3A', F) + f'''
<rect x="46" y="78" width="28" height="12" rx="6" fill="#14151C"/>
<ellipse cx="60" cy="52" rx="25" ry="25" fill="{F}"/>
<circle cx="54" cy="64" r="7.5" fill="{Fl}"/><circle cx="66" cy="64" r="7.5" fill="{Fl}"/>
<circle cx="51" cy="63" r="0.9" fill="{Fd}"/><circle cx="54" cy="66" r="0.9" fill="{Fd}"/><circle cx="66" cy="66" r="0.9" fill="{Fd}"/><circle cx="69" cy="63" r="0.9" fill="{Fd}"/>
<ellipse cx="60" cy="58" rx="4.6" ry="3.4" fill="{INK}"/>
{eye(49, 48, F, w=6, h=5.6)}{eye(71, 48, F, w=6, h=5.6)}
<path d="M43 39 Q49 37 55 40 M65 40 Q71 37 77 39" fill="none" stroke="{Fd}" stroke-width="2.4" stroke-linecap="round"/>
<path d="M56 73 H64" stroke="{INK}" stroke-width="2.4" stroke-linecap="round"/>
{whiskers(64, Fd, 47, 73)}'''

# Sociolontra: lontra engajada, moletom vermelho e megafone.
O, Od, Ol = '#9C6B43', '#7A5230', '#E9D2B4'
M['sociolontra'] = body('#D93030', '#A32121', '#2B2D42', O) + f'''
<path d="M46 84 Q60 94 74 84" fill="none" stroke="{W}" stroke-width="2.5"/><path d="M52 88 V100 M68 88 V100" stroke="{W}" stroke-width="2" stroke-linecap="round"/>
<circle cx="37" cy="44" r="4.5" fill="{Od}"/><circle cx="83" cy="44" r="4.5" fill="{Od}"/>
<path d="M34 56 Q34 34 60 33 Q86 34 86 56 Q86 76 60 78 Q34 76 34 56 Z" fill="{O}"/>
<path d="M40 60 Q42 52 52 54 Q60 50 68 54 Q78 52 80 60 Q80 76 60 77 Q40 76 40 60 Z" fill="{Ol}"/>
{eye(50, 50, O, brow=Od, tilt=-1.2)}{eye(70, 50, O, brow=Od, tilt=1.2)}
<path d="M55 59 H65 Q63 64 60 64 Q57 64 55 59 Z" fill="{INK}"/>
<path d="M53 69 Q60 76 67 69" fill="none" stroke="{INK}" stroke-width="2.4" stroke-linecap="round"/>
{whiskers(63, Od, 46, 74)}
<g transform="rotate(-25 98 112)"><path d="M92 106 L108 98 V124 L92 116 Z" fill="#F2B518"/><rect x="86" y="106" width="8" height="10" rx="2" fill="#F2B518"/>
<rect x="88" y="115" width="4" height="9" rx="2" fill="{INK}"/></g>
<circle cx="90" cy="127" r="6.5" fill="{O}"/>'''

# Porcoguês: porco certinho, camisa, colete, gravata e caneta vermelha.
P, Pd, Ps, Pn = '#F4A7B9', '#E08AA0', '#F7C3CF', '#C0627A'
M['porcogues'] = body('#2B3A67', '#1E2A4D', '#4A4F63', P, sleeve='#F4F5F9') + f'''
<path d="M48 82 L60 96 L72 82 Z" fill="{W}"/><path d="M58 88 L62 88 L63 104 L60 108 L57 104 Z" fill="#D93030"/>
<path d="M38 36 L36 22 L52 30 Z" fill="{Pd}"/><path d="M82 36 L84 22 L68 30 Z" fill="{Pd}"/>
<ellipse cx="60" cy="54" rx="25" ry="23" fill="{P}"/>
<ellipse cx="60" cy="64" rx="10.5" ry="7.5" fill="{Ps}"/>
<ellipse cx="56.5" cy="64" rx="2" ry="3" fill="{Pn}"/><ellipse cx="63.5" cy="64" rx="2" ry="3" fill="{Pn}"/>
{eye(50, 49, P, brow=Pd, tilt=1.6)}{eye(70, 49, P, brow=Pd, tilt=-0.4)}
{smirk(61, 75, w=4.5)}
<g transform="rotate(-35 92 118)"><rect x="89" y="96" width="6" height="28" rx="2" fill="#D93030"/>
<rect x="89" y="96" width="6" height="7" rx="2" fill="#A32121"/><polygon points="89,124 95,124 92,131" fill="{INK}"/></g>'''

# Literatucano: tucano dramático, cachecol e pena de escrever.
T, Tb = '#2E3140', '#22242F'
M['literatucano'] = body('#7A4FD8', '#5C35B3', '#2B2D42', T) + f'''
<path d="M42 84 Q60 94 78 84 L78 90 Q60 100 42 90 Z" fill="#F2B518"/><path d="M70 90 L76 112 L68 110 Z" fill="#F2B518"/>
<ellipse cx="56" cy="52" rx="24" ry="24" fill="{T}"/>
<ellipse cx="56" cy="66" rx="14" ry="10" fill="{W}"/>
<circle cx="47" cy="47" r="8" fill="#3D8BD9"/><circle cx="64" cy="46" r="7" fill="#3D8BD9"/>
{eye(47, 47, '#3D8BD9', w=4.6, h=4.2, brow='#F2B518', tilt=2)}{eye(64, 46, '#3D8BD9', w=4.2, h=4, brow='#F2B518', tilt=-1)}
<path d="M64 52 Q86 46 104 58 Q100 64 90 62 L66 62 Q62 58 64 52 Z" fill="#F7C531"/>
<path d="M66 60 L90 62 Q100 64 104 58 Q104 66 96 68 Q80 70 66 64 Z" fill="#F28C1F"/>
<path d="M98 56 Q104 57 104 60 Q102 66 97 67 Z" fill="{Tb}"/>
<path d="M88 102 Q100 92 108 96 Q100 104 92 114 Z" fill="{W}"/><path d="M91 112 L100 99" stroke="#C3C8D6" stroke-width="1.2"/>'''

# Inglesma: lesma calma e britânica, olhos nas antenas, casco nas costas e xícara de chá.
S, Sd, SH = '#B8D86B', '#96B84A', '#C98A4E'
M['inglesma'] = f'''<circle cx="60" cy="98" r="40" fill="#A86E38"/><circle cx="60" cy="98" r="36" fill="{SH}"/>
<path d="M60 98 m-6 0 a6 6 0 1 1 12 0 a12 12 0 1 1 -24 0 a18 18 0 1 1 36 0 a24 24 0 1 1 -48 0" fill="none" stroke="#A86E38" stroke-width="3"/>''' + body('#2B3A67', '#1E2A4D', '#4A4F63', S) + f'''
<path d="M50 82 L60 96 L70 82 Z" fill="{W}"/><path d="M58 88 L62 88 L63 102 L60 106 L57 102 Z" fill="#D93030"/>
<path d="M52 42 L46 16 M68 42 L74 16" stroke="{S}" stroke-width="6" stroke-linecap="round"/>
<circle cx="46" cy="15" r="8" fill="{S}"/><circle cx="74" cy="15" r="8" fill="{S}"/>
<circle cx="46" cy="15" r="6" fill="{W}"/><circle cx="74" cy="15" r="6" fill="{W}"/>
<circle cx="46.5" cy="16.5" r="3.2" fill="{INK}"/><circle cx="74.5" cy="16.5" r="3.2" fill="{INK}"/>
<path d="M39 15 A7 7 0 0 1 53 15 Q46 12.5 39 15 Z M67 15 A7 7 0 0 1 81 15 Q74 12.5 67 15 Z" fill="{S}"/>
<ellipse cx="60" cy="58" rx="23" ry="21" fill="{S}"/>
<ellipse cx="48" cy="62" rx="4" ry="2.4" fill="#F2A0B5" opacity="0.6"/><ellipse cx="72" cy="62" rx="4" ry="2.4" fill="#F2A0B5" opacity="0.6"/>
{smirk(61, 64, w=6)}
<path d="M84 110 H100 V116 Q100 124 92 124 Q84 124 84 116 Z" fill="{W}"/><path d="M100 112 Q106 113 103 119 Q101 120 100 118" fill="none" stroke="{W}" stroke-width="2"/>
<ellipse cx="92" cy="125" rx="11" ry="2.5" fill="{W}"/><path d="M89 104 Q91 100 89 96 M95 104 Q97 100 95 96" fill="none" stroke="{W}" stroke-width="1.5" opacity="0.7"/>'''

# Espanhonça: onça festiva, camisa vermelha de bolinhas e flor na orelha.
N, Nd, Nl, NS = '#F2A93B', '#D98A1F', '#FBE3B8', '#3A2A1E'
M['espanhonca'] = body('#D93030', '#A32121', '#2B2D42', N) + f'''
<circle cx="44" cy="96" r="2.4" fill="{W}"/><circle cx="56" cy="104" r="2.4" fill="{W}"/><circle cx="70" cy="96" r="2.4" fill="{W}"/><circle cx="76" cy="110" r="2.4" fill="{W}"/><circle cx="48" cy="114" r="2.4" fill="{W}"/><circle cx="64" cy="118" r="2.4" fill="{W}"/>
<path d="M44 82 Q52 92 60 84 Q68 92 76 82" fill="none" stroke="{W}" stroke-width="3"/>
<circle cx="38" cy="34" r="8" fill="{N}"/><circle cx="82" cy="34" r="8" fill="{N}"/><circle cx="38" cy="34" r="4" fill="{NS}"/><circle cx="82" cy="34" r="4" fill="{NS}"/>
<ellipse cx="60" cy="54" rx="25" ry="23" fill="{N}"/>
<circle cx="46" cy="38" r="3" fill="none" stroke="{NS}" stroke-width="2"/><circle cx="60" cy="34" r="2.6" fill="none" stroke="{NS}" stroke-width="2"/><circle cx="74" cy="38" r="3" fill="none" stroke="{NS}" stroke-width="2"/>
<circle cx="40" cy="58" r="2.4" fill="none" stroke="{NS}" stroke-width="1.8"/><circle cx="80" cy="58" r="2.4" fill="none" stroke="{NS}" stroke-width="1.8"/>
<ellipse cx="60" cy="66" rx="14" ry="10" fill="{Nl}"/>
{eye(50, 51, N, brow=NS, tilt=-1)}{eye(70, 51, N, brow=NS, tilt=1.6)}
<path d="M56 60 H64 L60 64 Z" fill="{NS}" stroke="{NS}" stroke-width="1.5" stroke-linejoin="round"/>
<path d="M51 69 Q60 77 70 68" fill="none" stroke="{INK}" stroke-width="2.6" stroke-linecap="round"/>
<circle cx="86" cy="26" r="5" fill="#E8304A"/><circle cx="81" cy="22" r="4" fill="#E8304A"/><circle cx="90" cy="21" r="4" fill="#E8304A"/><circle cx="86" cy="25" r="2.5" fill="#A31A2E"/>'''

M['radacao'] = MASCOTES['radacao']

INFO = [
    ('gatematica', 'Gatemática', 'Matemática', 'competitivo e preciso'),
    ('fisicobra', 'Fisicobra', 'Física', 'gênio distraído'),
    ('quimicoala', 'Quimicoala', 'Química', 'cientista maluco'),
    ('biolobo', 'Biolobo', 'Biologia', 'explorador curioso'),
    ('histopotamo', 'Histopótamo', 'História', 'calmo e erudito'),
    ('georafa', 'Georafa', 'Geografia', 'aventureira'),
    ('filosofoca', 'Filosofoca', 'Filosofia', 'contemplativa'),
    ('sociolontra', 'Sociolontra', 'Sociologia', 'engajada'),
    ('porcogues', 'Porcoguês', 'Português', 'certinho'),
    ('literatucano', 'Literatucano', 'Literatura', 'dramático'),
    ('radacao', 'Rãdação', 'Redação', 'perfeccionista'),
    ('inglesma', 'Inglesma', 'Inglês', 'calma e britânica'),
    ('espanhonca', 'Espanhonça', 'Espanhol', 'festiva'),
]

if __name__ == '__main__':
    cards = ''.join(
        f'<figure>{svg(M[k], 150)}<figcaption><b>{n}</b><i>{m}</i><span>{p}</span></figcaption></figure>' for k, n, m, p in INFO)
    html = f'''<!doctype html><html><head><meta charset="utf-8"><style>
body{{margin:0;padding:28px;background:#fff;font-family:system-ui,sans-serif;color:#2B2D42;width:1000px}}
h1{{font-size:26px;margin:0 0 4px}} p{{margin:0 0 20px;color:#6E7387}}
.grid{{display:flex;flex-wrap:wrap;gap:14px}}
figure{{margin:0;width:184px;padding:14px 0 12px;border-radius:20px;background:#F5F6FA;display:flex;flex-direction:column;align-items:center;gap:6px}}
figcaption{{display:flex;flex-direction:column;align-items:center;gap:1px}} figcaption b{{font-size:18px}}
figcaption i{{font-style:normal;font-size:13px;font-weight:700;color:#2F6FE8}} figcaption span{{font-size:12px;color:#6E7387}}
</style></head><body><h1>Mascotes por matéria</h1><p>Prévia. Ainda não estão no app.</p><div class="grid">{cards}</div></body></html>'''
    open(os.path.join(OUT, 'previa.html'), 'w').write(html)
    print(len(INFO), 'mascotes')
