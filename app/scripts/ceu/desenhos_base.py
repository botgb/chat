import math
W = 390
DEFS2 = """
<linearGradient id="pedra" x1="0" x2="1"><stop offset="0" stop-color="#E8D3B0"/><stop offset=".55" stop-color="#C9A97E"/><stop offset="1" stop-color="#8E6E4C"/></linearGradient>
<linearGradient id="pedraEsc" x1="0" x2="1"><stop offset="0" stop-color="#6B4A3A"/><stop offset="1" stop-color="#3A2230"/></linearGradient>
<linearGradient id="piraL" x1="0" x2="1"><stop offset="0" stop-color="#F2C27A"/><stop offset="1" stop-color="#D9934E"/></linearGradient>
<linearGradient id="piraR" x1="0" x2="1"><stop offset="0" stop-color="#9C5A3C"/><stop offset="1" stop-color="#6E3A2E"/></linearGradient>
<linearGradient id="duna" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C77A4A"/><stop offset="1" stop-color="#7A3E33"/></linearGradient>
<linearGradient id="nuvem" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFB38A" stop-opacity=".9"/><stop offset="1" stop-color="#C46A6A" stop-opacity=".5"/></linearGradient>
<linearGradient id="vidro" x1="0" x2="1"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".55"/><stop offset=".4" stop-color="#FFFFFF" stop-opacity=".12"/><stop offset="1" stop-color="#FFFFFF" stop-opacity=".35"/></linearGradient>
<linearGradient id="areia" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFD98A"/><stop offset="1" stop-color="#E8A23E"/></linearGradient>
<linearGradient id="madeira" x1="0" x2="1"><stop offset="0" stop-color="#9A6238"/><stop offset="1" stop-color="#5E3A22"/></linearGradient>
<linearGradient id="papel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FBEFD3"/><stop offset="1" stop-color="#E3C996"/></linearGradient>
<radialGradient id="planeta" cx=".35" cy=".35" r=".75"><stop offset="0" stop-color="#9FB6FF"/><stop offset=".5" stop-color="#4A63E0"/><stop offset="1" stop-color="#1B2470"/></radialGradient>
<linearGradient id="faixas" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".3" stop-color="#fff" stop-opacity=".18"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset=".62" stop-color="#1B2470" stop-opacity=".35"/><stop offset=".8" stop-color="#fff" stop-opacity=".12"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
<radialGradient id="lua" cx=".35" cy=".35" r=".8"><stop offset="0" stop-color="#F4F4F8"/><stop offset="1" stop-color="#9A9EB8"/></radialGradient>
<radialGradient id="galaxia"><stop offset="0" stop-color="#FFF2D9" stop-opacity=".9"/><stop offset=".3" stop-color="#C39BFF" stop-opacity=".35"/><stop offset="1" stop-color="#C39BFF" stop-opacity="0"/></radialGradient>
<linearGradient id="prisma" x1="0" x2="1"><stop offset="0" stop-color="#E8F6FF" stop-opacity=".55"/><stop offset=".5" stop-color="#9FD8FF" stop-opacity=".2"/><stop offset="1" stop-color="#E8F6FF" stop-opacity=".45"/></linearGradient>
<linearGradient id="raioG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#FFE066"/></linearGradient>
<linearGradient id="metal" x1="0" x2="1"><stop offset="0" stop-color="#C9D1E8"/><stop offset=".5" stop-color="#8790B0"/><stop offset="1" stop-color="#4C5370"/></linearGradient>
<linearGradient id="imaR" x1="0" x2="1"><stop offset="0" stop-color="#FF7A7A"/><stop offset="1" stop-color="#C62F3E"/></linearGradient>
<linearGradient id="fitaA" x1="0" x2="1"><stop offset="0" stop-color="#2DBE60"/><stop offset=".5" stop-color="#9CF5C0"/><stop offset="1" stop-color="#1E9449"/></linearGradient>
<linearGradient id="fitaB" x1="0" x2="1"><stop offset="0" stop-color="#14B8A6"/><stop offset=".5" stop-color="#9BF0E6"/><stop offset="1" stop-color="#0E8C7E"/></linearGradient>
<radialGradient id="celula" cx=".4" cy=".35" r=".75"><stop offset="0" stop-color="#C8FFE4" stop-opacity=".55"/><stop offset="1" stop-color="#2DBE9A" stop-opacity=".25"/></radialGradient>
<radialGradient id="nucleo" cx=".35" cy=".35" r=".8"><stop offset="0" stop-color="#D9B8FF"/><stop offset="1" stop-color="#7A4FD8"/></radialGradient>
<linearGradient id="folha" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9CF07C"/><stop offset="1" stop-color="#2E9E4C"/></linearGradient>
<linearGradient id="asaA" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7AE7FF"/><stop offset="1" stop-color="#3D5AFE"/></linearGradient>
<radialGradient id="chapeu" cx=".4" cy=".3" r=".8"><stop offset="0" stop-color="#FF8A8A"/><stop offset="1" stop-color="#C62F3E"/></radialGradient>
<radialGradient id="agua" cx=".5" cy=".3" r=".8"><stop offset="0" stop-color="#E3B6FF" stop-opacity=".75"/><stop offset="1" stop-color="#9B5CFF" stop-opacity=".15"/></radialGradient>
<linearGradient id="auroraV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4DFFB0" stop-opacity="0"/><stop offset=".55" stop-color="#4DFFB0" stop-opacity=".35"/><stop offset="1" stop-color="#4DFFB0" stop-opacity="0"/></linearGradient>
"""

def templo(x, base, w=150):
    """Templo grego com degraus, colunas caneladas, frontão e sombra."""
    h = w * .9; t = base - h
    s = f'<g>'
    s += f'<rect x="{x-8}" y="{base-10}" width="{w+16}" height="10" fill="url(#pedraEsc)"/><rect x="{x-4}" y="{base-18}" width="{w+8}" height="9" fill="#B89870"/><rect x="{x}" y="{base-25}" width="{w}" height="8" fill="#D8BC93"/>'
    n = 5; cw = w / (n * 1.7)
    for k in range(n):
        cx = x + w * (k + .5) / n - cw / 2
        s += f'<rect x="{cx:.1f}" y="{t+h*.28:.1f}" width="{cw:.1f}" height="{h*.62:.1f}" fill="url(#pedra)"/>'
        for f in range(1, 4):
            s += f'<line x1="{cx+cw*f/4:.1f}" y1="{t+h*.29:.1f}" x2="{cx+cw*f/4:.1f}" y2="{t+h*.89:.1f}" stroke="#8E6E4C" stroke-width=".8" opacity=".6"/>'
        s += f'<rect x="{cx-3:.1f}" y="{t+h*.25:.1f}" width="{cw+6:.1f}" height="6" fill="#E8D3B0"/><rect x="{cx-3:.1f}" y="{t+h*.88:.1f}" width="{cw+6:.1f}" height="5" fill="#C9A97E"/>'
    s += f'<rect x="{x-6}" y="{t+h*.17:.1f}" width="{w+12}" height="{h*.09:.1f}" fill="url(#pedra)"/>'
    s += ''.join(f'<rect x="{x-2+k*12}" y="{t+h*.19:.1f}" width="6" height="{h*.05:.1f}" fill="#8E6E4C" opacity=".55"/>' for k in range(int(w/12)+1))
    s += f'<polygon points="{x-10},{t+h*.17:.1f} {x+w/2},{t} {x+w+10},{t+h*.17:.1f}" fill="url(#pedra)"/><polygon points="{x+8},{t+h*.15:.1f} {x+w/2},{t+h*.04:.1f} {x+w-8},{t+h*.15:.1f}" fill="#B89870"/>'
    s += f'<rect x="{x+w*.62}" y="{t+h*.28:.1f}" width="{w*.38}" height="{h*.62:.1f}" fill="#3A2230" opacity=".28"/>'
    return s + '</g>'

def piramide(cx, base, w, h):
    return (f'<polygon points="{cx-w/2},{base} {cx},{base-h} {cx},{base}" fill="url(#piraL)"/>'
            f'<polygon points="{cx},{base-h} {cx+w/2},{base} {cx},{base}" fill="url(#piraR)"/>'
            + ''.join(f'<line x1="{cx-w/2*(1-k/7):.1f}" y1="{base-h*k/7:.1f}" x2="{cx+w/2*(1-k/7):.1f}" y2="{base-h*k/7:.1f}" stroke="#7A4A30" stroke-width=".7" opacity=".45"/>' for k in range(1, 7)))

def caravela(x, y, s=1):
    g = f'<g transform="translate({x} {y}) scale({s})">'
    g += '<path d="M-48 0 Q-40 18 0 18 Q40 18 52 -2 L40 2 L-40 2 Z" fill="url(#madeira)"/><path d="M-44 4 H46" stroke="#3A2214" stroke-width="1.5"/>'
    g += '<line x1="-8" y1="2" x2="-8" y2="-70" stroke="#4A2E1A" stroke-width="3"/><line x1="22" y1="2" x2="22" y2="-52" stroke="#4A2E1A" stroke-width="2.5"/>'
    g += '<path d="M-34 -62 Q-8 -54 18 -62 L16 -18 Q-8 -10 -32 -18 Z" fill="#F7EBD3"/><path d="M-30 -60 Q-8 -54 14 -60" stroke="#C9A97E" fill="none"/>'
    g += '<path d="M-16 -48 v18 M-24 -40 h16" stroke="#D93030" stroke-width="5"/>'
    g += '<path d="M10 -46 Q22 -42 36 -46 L34 -12 Q22 -8 10 -12 Z" fill="#EFE0C4"/><path d="M22 -52 l12 4 -12 4 z" fill="#D93030"/>'
    return g + '</g>'

def ampulheta(x, y, s=1):
    g = f'<g transform="translate({x} {y}) scale({s})">'
    g += '<rect x="-30" y="-62" width="60" height="9" rx="3" fill="url(#madeira)"/><rect x="-30" y="53" width="60" height="9" rx="3" fill="url(#madeira)"/>'
    g += '<rect x="-27" y="-53" width="5" height="106" fill="#6E4229"/><rect x="22" y="-53" width="5" height="106" fill="#6E4229"/>'
    g += '<path d="M-18 -53 H18 Q18 -15 3 0 Q18 15 18 53 H-18 Q-18 15 -3 0 Q-18 -15 -18 -53 Z" fill="url(#vidro)" stroke="#FFFFFF" stroke-opacity=".6"/>'
    g += '<path d="M-12 -25 H12 Q8 -10 2 -2 H-2 Q-8 -10 -12 -25 Z" fill="url(#areia)"/><path d="M-15 53 Q0 20 15 53 Z" fill="url(#areia)"/><line x1="0" y1="-2" x2="0" y2="35" stroke="#FFD98A" stroke-width="1.5"/>'
    return g + '</g>'

def pergaminho(x, y, s=1):
    g = f'<g transform="translate({x} {y}) scale({s})">'
    g += '<rect x="-50" y="-34" width="100" height="68" fill="url(#papel)"/>'
    g += '<ellipse cx="-50" cy="0" rx="9" ry="38" fill="#D9BE8A"/><ellipse cx="-50" cy="0" rx="4" ry="38" fill="#B8975E"/><ellipse cx="50" cy="0" rx="9" ry="38" fill="#E8D2A2"/><ellipse cx="50" cy="0" rx="4" ry="38" fill="#C2A169"/>'
    g += ''.join(f'<path d="M-36 {-20+k*10} q12 -3 24 0 t24 0 t20 0" stroke="#8E6E4C" stroke-width="1.2" fill="none" opacity=".7"/>' for k in range(5))
    g += '<circle cx="28" cy="18" r="8" fill="#C62F3E"/><circle cx="28" cy="18" r="4" fill="#E86A7A"/>'
    return g + '</g>'

def nuvens(x, y, w):
    return ''.join(f'<ellipse cx="{x+dx}" cy="{y+dy}" rx="{rx}" ry="{ry}" fill="url(#nuvem)"/>' for dx, dy, rx, ry in [(0,0,w*.35,10),(w*.25,-8,w*.3,12),(w*.55,2,w*.35,9)])

def planeta(cx, cy, r):
    g = f'<ellipse cx="{cx}" cy="{cy}" rx="{r*1.9}" ry="{r*.42}" fill="none" stroke="#C9D3FF" stroke-width="{r*.14}" opacity=".35" transform="rotate(-16 {cx} {cy})"/>'
    g += f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="url(#planeta)"/><circle cx="{cx}" cy="{cy}" r="{r}" fill="url(#faixas)"/>'
    g += f'<path d="M{cx-r*1.9:.0f} {cy+r*.15:.0f} A{r*1.9:.0f} {r*.42:.0f} 0 0 0 {cx+r*1.9:.0f} {cy-r*.15:.0f}" fill="none" stroke="#E3E8FF" stroke-width="{r*.16:.1f}" opacity=".75" transform="rotate(-16 {cx} {cy})"/>'
    g += f'<path d="M{cx-r*1.5:.0f} {cy+r*.2:.0f} A{r*1.5:.0f} {r*.3:.0f} 0 0 0 {cx+r*1.5:.0f} {cy-r*.1:.0f}" fill="none" stroke="#9FB3FF" stroke-width="2" opacity=".6" transform="rotate(-16 {cx} {cy})"/>'
    return g

def lua(cx, cy, r):
    return (f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="url(#lua)"/>'
            + ''.join(f'<circle cx="{cx+dx*r}" cy="{cy+dy*r}" r="{rr*r}" fill="#8A8EA8" opacity=".55"/>' for dx, dy, rr in [(-.3,-.2,.22),(.25,.15,.16),(-.05,.4,.12),(.35,-.35,.1)]))

def galaxia(cx, cy, r):
    g = f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="url(#galaxia)"/>'
    for k in range(2):
        pts = []
        for t in range(0, 70):
            a = t / 10 + k * math.pi; rr = 2 + t * r / 75
            pts.append(f'{cx + rr*math.cos(a):.1f},{cy + rr*math.sin(a)*.55:.1f}')
        g += f'<polyline points="{" ".join(pts)}" fill="none" stroke="#E6D3FF" stroke-width="2.4" opacity=".45"/>'
    return g + f'<circle cx="{cx}" cy="{cy}" r="4" fill="#FFF8E8"/>'

def prisma(x, y):
    g = f'<line x1="-10" y1="{y+8}" x2="{x+12}" y2="{y+2}" stroke="#FFFFFF" stroke-width="4" opacity=".75"/>'
    cores = ['#FF4B6E', '#FF8A1F', '#FFC531', '#2DBE60', '#2EB8E6', '#3D5AFE', '#9B5CFF']
    for k, c in enumerate(cores):
        g += f'<polygon points="{x+30},{y+2} {x+30},{y+10} {x+190},{y-30+k*13} {x+190},{y-22+k*13}" fill="{c}" opacity=".55"/>'
    g += f'<polygon points="{x-10},{y+40} {x+30},{y-40} {x+70},{y+40}" fill="url(#prisma)" stroke="#E8F6FF" stroke-width="1.5" stroke-opacity=".8"/>'
    g += f'<polygon points="{x+30},{y-40} {x+70},{y+40} {x+52},{y+40}" fill="#FFFFFF" opacity=".12"/>'
    return g

def bobina(x, base):
    g = f'<rect x="{x-16}" y="{base-18}" width="32" height="18" rx="3" fill="url(#metal)"/>'
    g += f'<rect x="{x-7}" y="{base-110}" width="14" height="92" fill="url(#metal)"/>'
    g += ''.join(f'<line x1="{x-8}" y1="{base-105+k*6}" x2="{x+8}" y2="{base-102+k*6}" stroke="#D98A3A" stroke-width="2"/>' for k in range(14))
    g += f'<ellipse cx="{x}" cy="{base-122}" rx="24" ry="13" fill="url(#metal)"/><ellipse cx="{x-6}" cy="{base-126}" rx="8" ry="3" fill="#fff" opacity=".5"/>'
    g += f'<path d="M{x+18} {base-128} l14 -16 -6 2 12 -18 -7 2 10 -16" fill="none" stroke="url(#raioG)" stroke-width="3" stroke-linejoin="round"/>'
    g += f'<path d="M{x-18} {base-126} l-16 -10 6 -1 -14 -14 6 0 -10 -12" fill="none" stroke="url(#raioG)" stroke-width="2.4" stroke-linejoin="round"/>'
    return g

def ima(x, y):
    return (f'<path d="M{x} {y} v34 a26 26 0 0 0 52 0 v-34 h-15 v34 a11 11 0 0 1 -22 0 v-34 z" fill="url(#imaR)"/>'
            f'<rect x="{x}" y="{y}" width="15" height="12" fill="#E8ECF5"/><rect x="{x+37}" y="{y}" width="15" height="12" fill="#E8ECF5"/>'
            + ''.join(f'<path d="M{x+7} {y-4} q19 {-20-k*10} 38 0" fill="none" stroke="#FF9AA2" stroke-dasharray="3 4" opacity=".55"/>' for k in range(3)))

def foguete(x, y, s=1):
    g = f'<g transform="translate({x} {y}) rotate(35) scale({s})">'
    g += '<path d="M0 -40 Q16 -20 14 20 H-14 Q-16 -20 0 -40 Z" fill="#F4F5F9"/><path d="M0 -40 Q8 -28 9 -18 H-9 Q-8 -28 0 -40 Z" fill="#D93030"/>'
    g += '<circle cx="0" cy="-4" r="6" fill="#2EB8E6" stroke="#8790B0" stroke-width="2"/><path d="M-14 8 L-24 26 L-12 22 Z M14 8 L24 26 L12 22 Z" fill="#D93030"/>'
    g += '<path d="M-9 22 Q0 52 9 22 Z" fill="#FFC531"/><path d="M-5 22 Q0 40 5 22 Z" fill="#FFF3B0"/>'
    return g + '</g>'

def dna(x, top, h):
    g = ''
    n = int(h / 6)
    for k in range(n):
        y = top + k * 6
        a = math.sin(k / 5); b = -a
        front = math.cos(k / 5) > 0
        if k % 3 == 0:
            g += f'<line x1="{x+22*a:.1f}" y1="{y}" x2="{x+22*b:.1f}" y2="{y}" stroke="{["#FF5CA8","#FFC531","#3D7BFF","#FF8A1F"][k//3%4]}" stroke-width="3" stroke-linecap="round" opacity=".8"/>'
    pa = ' '.join(f'{x+22*math.sin(k/5):.1f},{top+k*6}' for k in range(n))
    pb = ' '.join(f'{x-22*math.sin(k/5):.1f},{top+k*6}' for k in range(n))
    g += f'<polyline points="{pb}" fill="none" stroke="url(#fitaB)" stroke-width="7" stroke-linecap="round" opacity=".85"/>'
    g += f'<polyline points="{pa}" fill="none" stroke="url(#fitaA)" stroke-width="7" stroke-linecap="round"/>'
    return g

def celula(cx, cy, r):
    g = f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="url(#celula)" stroke="#9CF5C0" stroke-width="3" opacity=".9"/>'
    g += f'<circle cx="{cx+r*.15}" cy="{cy-r*.1}" r="{r*.32}" fill="url(#nucleo)"/><circle cx="{cx+r*.22}" cy="{cy-r*.16}" r="{r*.1}" fill="#4A2E8C"/>'
    for dx, dy, rot in [(-.45, .35, 30), (.45, .4, -20), (-.5, -.35, 70)]:
        mx, my = cx + dx * r, cy + dy * r
        g += f'<g transform="rotate({rot} {mx:.0f} {my:.0f})"><ellipse cx="{mx:.0f}" cy="{my:.0f}" rx="{r*.2:.0f}" ry="{r*.1:.0f}" fill="#FF8A1F"/><path d="M{mx-r*.14:.0f} {my:.0f} q{r*.05:.0f} -{r*.06:.0f} {r*.09:.0f} 0 t{r*.09:.0f} 0 t{r*.09:.0f} 0" stroke="#FFD0A0" fill="none" stroke-width="1.5"/></g>'
    g += f'<path d="M{cx-r*.1} {cy+r*.45} q{r*.2} -{r*.12} {r*.4} 0 t{r*.3} -{r*.1}" stroke="#7CF0B5" stroke-width="2" fill="none" opacity=".8"/>'
    g += ''.join(f'<circle cx="{cx+r*dx:.0f}" cy="{cy+r*dy:.0f}" r="2.2" fill="#C8FFE4"/>' for dx, dy in [(.1,.65),(-.2,.1),(.6,-.1),(-.25,-.6),(.5,.65)])
    g += f'<ellipse cx="{cx-r*.35:.0f}" cy="{cy-r*.45:.0f}" rx="{r*.25:.0f}" ry="{r*.12:.0f}" fill="#fff" opacity=".25" transform="rotate(-30 {cx-r*.35:.0f} {cy-r*.45:.0f})"/>'
    return g

def folha(x, y, s=1, rot=0):
    g = f'<g transform="translate({x} {y}) rotate({rot}) scale({s})">'
    g += '<path d="M0 50 Q-38 10 0 -50 Q38 10 0 50 Z" fill="url(#folha)"/><path d="M0 50 V-46" stroke="#1E7A3A" stroke-width="2"/>'
    g += ''.join(f'<path d="M0 {30-k*14} q{side*16} -8 {side*24} -22" stroke="#1E7A3A" stroke-width="1.2" fill="none" opacity=".8"/>' for k in range(5) for side in (-1, 1))
    g += '<path d="M0 54 v14" stroke="#1E7A3A" stroke-width="3"/>'
    return g + '</g>'

def borboleta(x, y, s=1):
    g = f'<g transform="translate({x} {y}) scale({s})">'
    g += '<path d="M0 0 C-30 -40 -60 -20 -50 6 C-44 20 -18 14 0 0 Z" fill="url(#asaA)"/><path d="M0 0 C30 -40 60 -20 50 6 C44 20 18 14 0 0 Z" fill="url(#asaA)"/>'
    g += '<path d="M0 2 C-20 30 -38 34 -34 18 C-30 8 -14 6 0 2 Z" fill="#9B5CFF"/><path d="M0 2 C20 30 38 34 34 18 C30 8 14 6 0 2 Z" fill="#9B5CFF"/>'
    g += '<circle cx="-34" cy="-6" r="6" fill="#FFC531"/><circle cx="34" cy="-6" r="6" fill="#FFC531"/><circle cx="-34" cy="-6" r="2.5" fill="#22242F"/><circle cx="34" cy="-6" r="2.5" fill="#22242F"/>'
    g += '<ellipse cx="0" cy="4" rx="3" ry="16" fill="#22242F"/><path d="M-1 -10 q-6 -14 -14 -16 M1 -10 q6 -14 14 -16" stroke="#22242F" fill="none" stroke-width="1.5"/>'
    return g + '</g>'

def cogumelo(x, base):
    g = f'<path d="M{x-8} {base} q-2 -30 3 -40 h10 q5 10 3 40 z" fill="#F2E6D8"/><path d="M{x-3} {base} q-1 -26 2 -38" stroke="#D8C6B0" stroke-width="2" fill="none"/>'
    g += f'<path d="M{x-34} {base-38} q4 -36 34 -38 q30 2 34 38 q-34 8 -68 0 z" fill="url(#chapeu)"/>'
    g += ''.join(f'<ellipse cx="{x+dx}" cy="{base+dy}" rx="{r}" ry="{r*.8}" fill="#FFF3EC"/>' for dx, dy, r in [(-16,-58,5),(6,-66,6),(20,-50,4),(-4,-48,3.5)])
    return g

def agua_viva(x, y):
    g = f'<path d="M{x-28} {y} q0 -34 28 -34 q28 0 28 34 q-28 8 -56 0 z" fill="url(#agua)"/>'
    g += ''.join(f'<path d="M{x+dx} {y+2} q6 14 0 28 t0 28" stroke="#D9B8FF" stroke-width="2" fill="none" opacity=".6"/>' for dx in (-18, -6, 6, 18))
    return g + f'<ellipse cx="{x-8}" cy="{y-20}" rx="8" ry="4" fill="#fff" opacity=".35"/>'

def aurora(T):
    g = ''
    for k, (x, w, op) in enumerate([(-40, 160, .9), (90, 140, .7), (210, 190, .8)]):
        g += f'<path d="M{x} {T+40} q{w/2} -30 {w} 10 l0 230 q-{w/2} -40 -{w} -10 z" fill="url(#auroraV)" opacity="{op}"/>'
    return g

