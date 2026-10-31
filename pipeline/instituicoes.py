"""Gera o catálogo de provas de entrada e liga cada instituição à prova que usa.

Entrada: microdados de instituições do Censo da Educação Superior (INEP), em pipeline/dados/.
Saída:
  content/dados/provas.json        catálogo de provas
  content/dados/instituicoes.json  instituições com as provas que usam
  content/dados/instituicoes.csv   a mesma lista, para abrir em planilha

Uso: python3 pipeline/instituicoes.py [caminho do CSV do INEP]

As ligações instituição -> prova vêm de conhecimento geral e mudam de ano para ano.
Tudo marcado com "confirmar": true precisa ser checado no edital antes de ir para o app.
"""
import csv
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_CSV = os.path.join(ROOT, 'pipeline', 'dados', 'MICRODADOS_ED_SUP_IES_2024.CSV')
OUT = os.path.join(ROOT, 'content', 'dados')
FONTE = 'INEP, Censo da Educação Superior 2024 (microdados)'

ORGANIZACAO = {'1': 'Universidade', '2': 'Centro Universitário', '3': 'Faculdade', '4': 'Instituto Federal', '5': 'CEFET'}
CATEGORIA = {
    '1': 'Federal', '2': 'Estadual', '3': 'Municipal',
    '4': 'Privada com fins lucrativos', '5': 'Privada sem fins lucrativos', '7': 'Especial',
}

# Catálogo de provas. "confirmar": o processo existe, mas formato/uso precisam de checagem no edital.
PROVAS = [
    ('enem', 'ENEM', 'INEP', 'nacional', None, False, 'Usado no SISU, Prouni, FIES e pela maioria das instituições.'),
    ('provao-paulista', 'Provão Paulista Seriado', 'Governo de SP', 'seriado', 'SP', False, 'Para alunos da rede pública paulista.'),
    ('fuvest', 'Fuvest', 'Fuvest', 'vestibular', 'SP', False, None),
    ('comvest', 'Vestibular Unicamp (Comvest)', 'Comvest', 'vestibular', 'SP', False, None),
    ('vunesp', 'Vunesp', 'Vunesp', 'vestibular', 'SP', True, None),
    ('fatec', 'Vestibular Fatec', 'Centro Paula Souza', 'vestibular', 'SP', True, None),
    ('uerj', 'Vestibular Estadual UERJ', 'UERJ', 'vestibular', 'RJ', False, 'A UEZO foi incorporada à UERJ em 2022.'),
    ('cederj', 'Vestibular Cederj (EaD)', 'Fundação Cecierj', 'vestibular', 'RJ', False, 'Consórcio de graduação a distância.'),
    ('ufpr', 'Vestibular UFPR', 'NC-UFPR', 'vestibular', 'PR', False, None),
    ('ufsc', 'Vestibular UFSC', 'Coperve', 'vestibular', 'SC', False, None),
    ('ufrgs', 'Vestibular UFRGS', 'Coperse', 'vestibular', 'RS', False, None),
    ('udesc', 'Vestibular Udesc', 'Udesc', 'vestibular', 'SC', True, None),
    ('uel', 'Vestibular UEL', 'Cops-UEL', 'vestibular', 'PR', False, None),
    ('uem', 'Vestibular UEM', 'CVU-UEM', 'vestibular', 'PR', False, None),
    ('uepg', 'Vestibular UEPG', 'UEPG', 'vestibular', 'PR', False, None),
    ('unioeste', 'Vestibular Unioeste', 'Unioeste', 'vestibular', 'PR', True, None),
    ('unicentro', 'Vestibular Unicentro', 'Unicentro', 'vestibular', 'PR', True, None),
    ('uneb', 'Vestibular UNEB', 'UNEB', 'vestibular', 'BA', True, None),
    ('uefs', 'Vestibular UEFS', 'UEFS', 'vestibular', 'BA', True, None),
    ('uesb', 'Vestibular UESB', 'UESB', 'vestibular', 'BA', True, None),
    ('uesc', 'Vestibular UESC', 'UESC', 'vestibular', 'BA', True, None),
    ('uece', 'Vestibular UECE', 'CEV-UECE', 'vestibular', 'CE', True, None),
    ('urca', 'Vestibular URCA', 'URCA', 'vestibular', 'CE', True, None),
    ('uva-ce', 'Vestibular UVA', 'UVA', 'vestibular', 'CE', True, None),
    ('uea', 'Vestibular UEA', 'UEA', 'vestibular', 'AM', True, None),
    ('unemat', 'Vestibular Unemat', 'Unemat', 'vestibular', 'MT', False, 'No 2º semestre usa só o SISU.'),
    ('unitins', 'Vestibular Unitins', 'Unitins', 'vestibular', 'TO', False, None),
    ('ueg', 'Vestibular UEG', 'UEG', 'vestibular', 'GO', True, None),
    ('outras-estaduais', 'Vestibular próprio (estaduais diversas)', 'cada instituição', 'vestibular', None, True,
     'Parte dessas instituições já seleciona só pelo ENEM.'),
    ('pas-unb', 'PAS-UnB', 'Cebraspe', 'seriado', 'DF', False, None),
    ('vestibular-unb', 'Vestibular UnB', 'Cebraspe', 'vestibular', 'DF', False, None),
    ('ssa-upe', 'SSA (UPE)', 'UPE', 'seriado', 'PE', True, None),
    ('psc-ufam', 'PSC (UFAM)', 'UFAM', 'seriado', 'AM', True, None),
    ('sis-uea', 'SIS (UEA)', 'UEA', 'seriado', 'AM', True, None),
    ('paes-uema', 'PAES (UEMA)', 'UEMA', 'seriado', 'MA', False, None),
    ('paes-unimontes', 'PAES (Unimontes)', 'Unimontes', 'seriado', 'MG', True, None),
    ('prise-uepa', 'Prise / Prosel (UEPA)', 'UEPA', 'seriado', 'PA', True, None),
    ('pas-uem', 'PAS-UEM', 'CVU-UEM', 'seriado', 'PR', False, None),
    ('pss-uepg', 'PSS-UEPG', 'CPS-UEPG', 'seriado', 'PR', False, None),
    ('ita', 'Vestibular ITA', 'ITA', 'militar', 'SP', False, None),
    ('ime', 'Vestibular IME', 'IME', 'militar', 'RJ', False, None),
    ('espcex', 'EsPCEx', 'Exército', 'militar', None, False, 'Prepara para a AMAN.'),
    ('fgv', 'Vestibular FGV', 'FGV', 'particular', None, True, None),
    ('insper', 'Vestibular Insper', 'Insper', 'particular', 'SP', True, None),
    ('mackenzie', 'Vestibular Mackenzie', 'Mackenzie', 'particular', None, True, None),
    ('puc', 'Vestibular PUC', 'cada PUC', 'particular', None, True, 'Cada PUC tem o seu; várias também aceitam o ENEM.'),
    ('einstein', 'Vestibular Einstein', 'Einstein', 'particular', 'SP', True, None),
    ('santa-casa', 'Vestibular Santa Casa SP', 'Santa Casa', 'particular', 'SP', True, None),
    ('sao-camilo', 'Vestibular São Camilo', 'São Camilo', 'particular', 'SP', True, None),
    ('proprio-particular', 'Vestibular próprio ou ENEM (particulares)', 'cada instituição', 'particular', None, True,
     'Padrão para particulares sem informação específica.'),
]

# Provas por código do INEP (CO_IES). Além delas, quase todas também aceitam o ENEM.
POR_CODIGO = {
    '55': ['fuvest', 'provao-paulista'],  # USP
    '54': ['comvest', 'provao-paulista'],  # Unicamp
    '56': ['vunesp', 'provao-paulista'],  # Unesp
    '149': ['vunesp'],  # Famerp
    '431': ['vunesp'],  # Famema
    '18165': ['provao-paulista'],  # Univesp
    '547': ['uerj', 'cederj'],  # UERJ
    '1027': ['cederj'], '586': ['cederj'], '572': ['cederj'], '574': ['cederj'], '693': ['cederj'], '593': ['cederj'],  # Cederj
    '571': ['ufpr'], '585': ['ufsc'], '581': ['ufrgs'], '43': ['udesc'],
    '9': ['uel'], '57': ['uem', 'pas-uem'], '730': ['uepg', 'pss-uepg'], '609': ['unioeste'], '1126': ['unicentro'],
    '40': ['uneb'], '666': ['uefs'], '688': ['uesb'], '24': ['uesc'],
    '29': ['uece'], '746': ['urca'], '95': ['uva-ce'],
    '3172': ['uea', 'sis-uea'], '2': ['vestibular-unb', 'pas-unb'], '409': ['ssa-upe'], '4': ['psc-ufam'],
    '568': ['paes-uema'], '367': ['paes-unimontes'], '38': ['prise-uepa'],
    '719': ['unemat'], '829': ['unitins'], '47': ['ueg'], '1028': ['outras-estaduais'], '756': ['outras-estaduais'], '71': ['outras-estaduais'],
    '602': ['ita'], '633': ['ime'], '21095': ['espcex'],
    '1161': ['insper'], '22': ['mackenzie'], '195': ['mackenzie'], '19229': ['mackenzie'],
    '546': ['puc'], '528': ['puc'], '19': ['puc'], '10': ['puc'], '21': ['puc'],
    '790': ['einstein'], '415': ['santa-casa'], '737': ['sao-camilo'],
}

CONFIRMAR = {p[0]: p[5] for p in PROVAS}

PAULA_SOUZA = 'CENTRO ESTADUAL DE EDUCACAO TECNOLOGICA PAULA SOUZA'


def provas_da(r):
    """Devolve (lista de provas, precisa_confirmar)."""
    codigo, cat = r['CO_IES'], r['TP_CATEGORIA_ADMINISTRATIVA']
    especificas = list(POR_CODIGO.get(codigo, []))
    if r['NO_MANTENEDORA'].upper().startswith(PAULA_SOUZA[:40]) and r['NO_IES'].upper().startswith('FACULDADE DE TECNOLOGIA'):
        especificas += ['fatec', 'provao-paulista']
    if r['SG_IES'].upper().startswith('FGV'):
        especificas.append('fgv')

    incerta = any(CONFIRMAR[p] for p in especificas)
    if cat == '1':  # federais (inclui IFs, CEFETs e militares): ENEM via SISU
        base = [] if codigo in ('602', '633', '21095') else ['enem']
        return especificas + base, incerta
    if especificas:
        return especificas + ['enem'], incerta or cat not in ('2',)
    if cat in ('4', '5'):
        return ['proprio-particular', 'enem'], True
    # estaduais, municipais e especiais sem informação: provavelmente ENEM, mas sem garantia
    return ['enem'], True


def main():
    path = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_CSV
    rows = list(csv.DictReader(open(path, encoding='latin-1', newline=''), delimiter=';'))
    ano = rows[0]['NU_ANO_CENSO']
    catalogo = {p[0]: p for p in PROVAS}

    instituicoes = []
    for r in sorted(rows, key=lambda r: (r['SG_UF_IES'], r['NO_IES'])):
        provas, confirmar = provas_da(r)
        assert all(p in catalogo for p in provas), (r['CO_IES'], provas)
        instituicoes.append({
            'id': int(r['CO_IES']),
            'nome': r['NO_IES'].strip(),
            'sigla': r['SG_IES'].strip() or None,
            'organizacao': ORGANIZACAO.get(r['TP_ORGANIZACAO_ACADEMICA'], r['TP_ORGANIZACAO_ACADEMICA']),
            'rede': 'Pública' if r['TP_REDE'] == '1' else 'Privada',
            'categoria': CATEGORIA.get(r['TP_CATEGORIA_ADMINISTRATIVA'], r['TP_CATEGORIA_ADMINISTRATIVA']),
            'uf': r['SG_UF_IES'],
            'municipio': r['NO_MUNICIPIO_IES'],
            'mantenedora': r['NO_MANTENEDORA'].strip(),
            'provas': provas,
            'confirmar': confirmar,
        })

    usos = {}
    for i in instituicoes:
        for p in i['provas']:
            usos.setdefault(p, []).append(i['id'])
    provas = [
        {
            'id': pid, 'nome': nome, 'organizadora': org, 'tipo': tipo, 'uf': uf,
            'confirmar': conf, 'observacao': obs, 'instituicoes': len(usos.get(pid, [])),
        }
        for pid, nome, org, tipo, uf, conf, obs in PROVAS
    ]

    os.makedirs(OUT, exist_ok=True)
    meta = {'fonte': f'{FONTE.replace("2024", ano)}', 'ano_censo': int(ano)}
    json.dump({**meta, 'provas': provas}, open(os.path.join(OUT, 'provas.json'), 'w'), ensure_ascii=False, indent=1)
    json.dump({**meta, 'instituicoes': instituicoes}, open(os.path.join(OUT, 'instituicoes.json'), 'w'), ensure_ascii=False, indent=1)
    nomes = {p[0]: p[1] for p in PROVAS}
    with open(os.path.join(OUT, 'instituicoes.csv'), 'w', newline='', encoding='utf-8-sig') as f:
        w = csv.writer(f, delimiter=';')
        w.writerow(['Código INEP', 'Nome', 'Sigla', 'Tipo', 'Rede', 'Categoria', 'UF', 'Município', 'Provas de entrada', 'Confirmar no edital'])
        for i in instituicoes:
            w.writerow([i['id'], i['nome'], i['sigla'] or '', i['organizacao'], i['rede'], i['categoria'], i['uf'], i['municipio'],
                        ' | '.join(nomes[p] for p in i['provas']), 'sim' if i['confirmar'] else 'não'])
    print(f'{len(instituicoes)} instituições, {len(provas)} provas -> {OUT}')


if __name__ == '__main__':
    main()
