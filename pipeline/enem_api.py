"""Converte questões do ENEM do projeto ENEM API (github.com/yunger7/enem-api) para o formato do app.

Uso: python3 pipeline/enem_api.py <pasta public/ do enem-api> <ano> [<ano> ...]

Gera content/enem/enem-<ano>-d1|d2/pack.json e atualiza content/manifest.json.

Regras desta primeira versão:
- A área vem da numeração oficial de cada ano (ver layout()), mais confiável que a
  classificação do conjunto de dados.
- Questões com imagem ficam de fora até passarem pela checagem de licença das imagens
  (ver docs/estrategias.md e a conversa sobre direitos autorais). Elas são contadas no relatório.
- Texto e gabarito são do INEP; a transcrição é do ENEM API. Ambos aparecem como fonte.
"""
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONTENT = os.path.join(ROOT, 'content')
PACK_VERSION = 1

LANG = {'ingles': 'Inglês', 'espanhol': 'Espanhol'}
NAT, HUM, LIN, MAT = 'Ciências da Natureza', 'Ciências Humanas', 'Linguagens', 'Matemática'


def layout(year: int) -> list[str]:
    """Área de cada bloco de 45 questões; a ordem das provas mudou ao longo dos anos."""
    if year == 2009:
        return [NAT, HUM, LIN, MAT]
    if year <= 2016:
        return [HUM, NAT, LIN, MAT]
    return [LIN, HUM, NAT, MAT]


def area(year: int, index: int, language: str | None) -> str:
    if language:
        return LANG[language]
    if not 1 <= index <= 180:
        raise ValueError(f'índice fora do ENEM: {index}')
    return layout(year)[(index - 1) // 45]


def has_image(q: dict) -> bool:
    return bool(q.get('files')) or '![' in (q.get('context') or '') or any(a.get('file') for a in q['alternatives'])


def clean(text: str) -> str:
    """Remove a marcação Markdown simples, que o app mostra como texto puro."""
    text = re.sub(r'\*\*(.+?)\*\*', r'\1', text, flags=re.S)
    text = re.sub(r'(?<!\w)_(.+?)_(?!\w)', r'\1', text, flags=re.S)
    text = re.sub(r'^#+\s*', '', text, flags=re.M)
    text = text.replace('\\n', '\n')
    text = re.sub(r'\\([\[\]*_#()])', r'\1', text)  # escapes do Markdown: \[…\] vira […]
    return re.sub(r'[ \t]+\n', '\n', text).strip()


def blocks(q: dict) -> list[dict]:
    out = []
    for par in re.split(r'\n\s*\n', clean(q.get('context') or '')):
        if par.strip():
            out.append({'type': 'text', 'text': par.strip()})
    intro = clean(q.get('alternativesIntroduction') or '')
    if intro:
        out.append({'type': 'text', 'text': intro})
    return out


def convert_year(public: str, year: int) -> list[dict]:
    qdir = os.path.join(public, str(year), 'questions')
    days = {1: [], 2: []}
    skipped = {'imagem': 0, 'sem gabarito': 0}
    for name in sorted(os.listdir(qdir)):
        path = os.path.join(qdir, name, 'details.json')
        if not os.path.exists(path):
            continue
        q = json.load(open(path, encoding='utf-8'))
        if not q.get('correctAlternative'):
            skipped['sem gabarito'] += 1
            continue
        if has_image(q):
            skipped['imagem'] += 1
            continue
        idx, lang = q['index'], q.get('language')
        days[1 if idx <= 90 else 2].append({
            'id': f'enem-{year}-q{idx}' + (f'-{lang}' if lang else ''),
            'number': idx,
            'subject': area(year, idx, lang),
            'statement': blocks(q),
            'alternatives': [{'letter': a['letter'], 'text': clean(a['text'] or '')} for a in q['alternatives']],
            'answer': q['correctAlternative'],
        })

    exams = []
    for day, qs in days.items():
        if not qs:
            continue
        pid = f'enem-{year}-d{day}'
        title = f'ENEM {year}, dia {day}'
        pack = {
            'id': pid, 'vestibular': 'enem', 'title': title, 'year': year, 'version': PACK_VERSION,
            'source': f'Questões: INEP, ENEM {year}. Transcrição: ENEM API (enem.dev).',
            'questions': sorted(qs, key=lambda x: (x['number'], x['id'])),
        }
        os.makedirs(os.path.join(CONTENT, 'enem', pid), exist_ok=True)
        json.dump(pack, open(os.path.join(CONTENT, 'enem', pid, 'pack.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
        exams.append({
            'id': pid, 'vestibular': 'enem', 'title': title, 'year': year,
            'packUrl': f'enem/{pid}/pack.json', 'packVersion': PACK_VERSION,
            'questionCount': len(qs), 'subjects': sorted({q['subject'] for q in qs}),
        })
    print(f'ENEM {year}: ' + ', '.join(f'dia {d}: {len(q)}' for d, q in days.items()) + f' | fora por ora: {skipped}')
    return exams


def main():
    public, years = sys.argv[1], [int(y) for y in sys.argv[2:]]
    manifest_path = os.path.join(CONTENT, 'manifest.json')
    manifest = json.load(open(manifest_path, encoding='utf-8'))
    new = [e for y in years for e in convert_year(public, y)]
    ids = {e['id'] for e in new}
    # As questões inventadas de demonstração saem quando há prova real.
    manifest['exams'] = [e for e in manifest['exams'] if e['id'] not in ids and e['vestibular'] != 'demo'] + new
    manifest['vestibulares'] = [v for v in manifest['vestibulares'] if v['id'] != 'demo']
    if not any(v['id'] == 'enem' for v in manifest['vestibulares']):
        manifest['vestibulares'].insert(0, {'id': 'enem', 'name': 'ENEM', 'secondsPerQuestion': 180})
    manifest['version'] += 1
    json.dump(manifest, open(manifest_path, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)


if __name__ == '__main__':
    main()
