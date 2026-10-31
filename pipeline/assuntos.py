"""Motor de assuntos: classifica cada questão das provas em matéria e assunto.

Uso (na raiz do repositório):
    python3 pipeline/assuntos.py            # classifica todos os pacotes em content/
    python3 pipeline/assuntos.py --relatorio # mostra a distribuição e exemplos, sem gravar

Como funciona:
  1. A área da prova (Ciências Humanas, Natureza, Linguagens, Matemática, Inglês, Espanhol)
     limita as matérias possíveis.
  2. Cada assunto tem palavras-chave (sem acento, em minúsculas, podem ser começos de
     palavra). A questão ganha pontos por palavra encontrada no enunciado e nas alternativas;
     palavras do enunciado valem mais.
  3. Vence o assunto com mais pontos. Sem nenhum ponto, a questão vai para o assunto
     "geral" da área (por exemplo, Interpretação de texto em Linguagens).
É determinístico e roda no computador, sem servidor e sem IA. Para melhorar a precisão,
basta acrescentar palavras-chave na TAXONOMIA e rodar de novo.

Grava em cada questão os campos "materia" e "assunto", sobe a versão dos pacotes (o app
mostra "Atualizar prova") e gera content/assuntos.json com a lista de matérias e assuntos.
"""
import json
import os
import re
import sys
import unicodedata
from collections import Counter, defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONTENT = os.path.join(ROOT, 'content')
PACK_VERSION = 2

# área da prova -> matéria -> assunto -> palavras-chave
TAXONOMIA = {
    'Matemática': {
        'Matemática': {
            'Porcentagem e proporção': ['porcent', '%', 'razao', 'proporc', 'regra de tres', 'desconto', 'aumento de', 'reajust', 'diretamente', 'inversamente'],
            'Matemática financeira': ['juro', 'montante', 'capital', 'parcela', 'prestac', 'financiament', 'investiment', 'taxa de', 'rendiment'],
            'Estatística': ['media', 'mediana', 'moda', 'desvio padrao', 'grafico', 'tabela', 'frequencia', 'pesquisa', 'amostra', 'variancia'],
            'Probabilidade e contagem': ['probabilidade', 'chance', 'sorte', 'aleatori', 'combinac', 'arranjo', 'permutac', 'maneiras', 'possibilidades', 'sorteio', 'dado '],
            'Geometria plana': ['triangul', 'quadrado', 'retangul', 'circulo', 'circunfer', 'area ', 'perimetro', 'angulo', 'poligon', 'hexagon', 'trapezio', 'losango', 'raio'],
            'Geometria espacial': ['volume', 'cubo', 'cilindr', 'cone', 'esfera', 'prisma', 'piramide', 'paralelepiped', 'capacidade', 'litros', 'reservatorio', 'caixa d'],
            'Funções e gráficos': ['funcao', 'grafico de', 'parabola', 'exponencial', 'logaritm', 'crescente', 'decrescente', 'f(x)', 'eixo', 'reta '],
            'Grandezas, medidas e escalas': ['escala', 'unidade', 'metro', 'quilometr', 'centimetr', 'velocidade media', 'tempo gasto', 'conversao', 'polegada', 'mapa'],
            'Aritmética e números': ['numero', 'fracao', 'decimal', 'divisor', 'multiplo', 'primo', 'potencia', 'raiz', 'sequencia', 'progressao', 'mmc', 'mdc'],
            'Trigonometria': ['seno', 'cosseno', 'tangente', 'trigonometr', 'radiano'],
        },
    },
    'Ciências da Natureza': {
        'Física': {
            'Mecânica': ['velocidade', 'aceleracao', 'forca', 'atrito', 'newton', 'movimento', 'queda', 'massa', 'peso', 'impulso', 'colisao', 'inercia', 'gravit', 'trajetoria', 'pressao'],
            'Energia e trabalho': ['energia cinetica', 'energia potencial', 'trabalho', 'potencia', 'rendimento', 'conservacao da energia', 'usina', 'watt', 'kwh', 'consumo de energia'],
            'Termologia': ['temperatura', 'calor', 'termic', 'dilatac', 'termodinam', 'caloria', 'ebulic', 'fusao', 'isolante', 'condução', 'conducao', 'conveccao', 'irradiac'],
            'Óptica': ['luz', 'espelho', 'lente', 'refrac', 'reflex', 'optic', 'imagem', 'foco', 'arco-iris', 'cor '],
            'Ondas e som': ['onda', 'frequencia', 'som', 'acustic', 'ressonan', 'comprimento de onda', 'decibel', 'eco', 'vibrac', 'radiacao', 'micro-ondas'],
            'Eletricidade e magnetismo': ['eletric', 'corrente', 'tensao', 'resistor', 'resistencia', 'circuito', 'voltagem', 'ohm', 'magnet', 'ima ', 'campo eletrico', 'lampada', 'chuveiro', 'pilha', 'bateria'],
        },
        'Química': {
            'Química orgânica': ['organic', 'carbono', 'hidrocarboneto', 'alcool', 'etanol', 'polimer', 'plastico', 'ester', 'acido carboxil', 'isomer', 'cadeia', 'benzeno', 'metano', 'combustivel'],
            'Estequiometria e mol': ['mol', 'massa molar', 'estequiometr', 'gramas de', 'rendimento da reacao', 'avogadro'],
            'Soluções e concentração': ['concentrac', 'solucao', 'soluto', 'solvente', 'diluic', 'mg/l', 'g/l', 'solubilidade'],
            'Ácidos, bases e pH': ['acido', 'base', 'ph', 'neutraliz', 'alcalin', 'sal ', 'indicador'],
            'Eletroquímica': ['eletrolis', 'oxidac', 'reducao', 'pilha', 'eletrodo', 'galvaniz', 'corrosao', 'ferrugem', 'nox'],
            'Termoquímica, cinética e equilíbrio': ['entalpia', 'exotermic', 'endotermic', 'velocidade da reacao', 'catalis', 'equilibrio quimico', 'le chatelier', 'combustao'],
            'Átomos, ligações e tabela periódica': ['atomo', 'eletron', 'proton', 'neutron', 'isotop', 'ligacao', 'tabela periodica', 'radioativ', 'meia-vida', 'molecula'],
            'Química ambiental': ['poluic', 'chuva acida', 'efeito estufa', 'ozonio', 'tratamento de agua', 'lixo', 'reciclag', 'contamina', 'esgoto', 'metais pesados'],
        },
        'Biologia': {
            'Ecologia': ['ecossistema', 'cadeia alimentar', 'teia alimentar', 'populac', 'comunidade', 'bioma', 'habitat', 'nicho', 'predad', 'biodiversidade', 'desmatament', 'ciclo do', 'sucessao ecolog', 'especie invasora'],
            'Genética': ['gene', 'genetic', 'dna', 'cromossomo', 'heranca', 'alelo', 'mendel', 'mutac', 'genotipo', 'fenotipo', 'heredit'],
            'Evolução': ['evoluc', 'selecao natural', 'darwin', 'lamarck', 'adaptac', 'especiac', 'ancestral', 'fossil'],
            'Citologia': ['celula', 'celular', 'membrana', 'mitocondri', 'organela', 'citoplasma', 'nucleo', 'mitose', 'meiose', 'ribossomo'],
            'Fisiologia humana e saúde': ['sangue', 'coracao', 'hormonio', 'digest', 'respirac', 'rim ', 'renal', 'sistema imun', 'vacina', 'anticorpo', 'neuronio', 'saude', 'nutric', 'vitamina', 'obesidade', 'diabete'],
            'Microbiologia e doenças': ['bacteria', 'virus', 'fungo', 'protozoar', 'parasit', 'doenca', 'infecc', 'dengue', 'malaria', 'antibiotico', 'epidemi', 'transmiss', 'mosquito', 'verme'],
            'Botânica': ['planta', 'vegetal', 'fotossintese', 'folha', 'raiz', 'flor', 'semente', 'fruto', 'clorofila', 'polinizac'],
            'Biotecnologia': ['transgenic', 'clonagem', 'biotecnolog', 'celula-tronco', 'engenharia genetica', 'pcr', 'crispr'],
        },
    },
    'Ciências Humanas': {
        'História': {
            'Brasil Colônia': ['colonia', 'colonial', 'capitania', 'jesuit', 'bandeirant', 'engenho', 'cana-de-acucar', 'ciclo do ouro', 'minas gerais', 'inconfidencia', 'portugues', 'metropole'],
            'Brasil Império': ['imperio', 'imperial', 'dom pedro', 'regencia', 'abolicao', 'lei aurea', 'escravidao', 'escravizad', 'cafe', 'independencia do brasil'],
            'Brasil República': ['republica', 'vargas', 'estado novo', 'ditadura', 'militar', 'golpe de 1964', 'redemocratiz', 'constituicao de 1988', 'diretas', 'ai-5', 'coronelismo', 'oligarqui', 'tenentismo', 'canudos'],
            'Antiguidade': ['grecia', 'grego', 'roma', 'romano', 'egito', 'mesopotamia', 'antiguidade', 'atenas', 'esparta', 'democracia atenien', 'faraó', 'farao'],
            'Idade Média': ['medieval', 'feudal', 'feudo', 'igreja catolica', 'cruzada', 'idade media', 'servo', 'senhor feudal', 'monarquia medieval'],
            'Idade Moderna': ['renascimento', 'reforma protestante', 'absolutismo', 'mercantilismo', 'iluminismo', 'grandes navegac', 'revolucao francesa', 'revolucao industrial', 'burguesia'],
            'Idade Contemporânea': ['guerra mundial', 'guerra fria', 'nazismo', 'fascismo', 'socialismo', 'capitalismo', 'imperialismo', 'descoloniz', 'totalitar', 'holocausto', 'urss', 'revolucao russa'],
            'Povos indígenas e africanos': ['indigena', 'indio', 'afric', 'quilombo', 'tupi', 'etnia', 'afro-brasileir', 'diaspora'],
        },
        'Geografia': {
            'Cartografia': ['mapa', 'escala', 'projecao', 'latitude', 'longitude', 'fuso horario', 'coordenad', 'cartograf', 'satelite', 'gps'],
            'Clima e atmosfera': ['clima', 'chuva', 'massa de ar', 'temperatura', 'umidade', 'el nino', 'aquecimento global', 'efeito estufa', 'precipitac', 'seca'],
            'Relevo, solos e hidrografia': ['relevo', 'solo', 'erosao', 'rocha', 'placa tectonica', 'terremoto', 'vulcao', 'bacia hidrografica', 'rio ', 'aquifero', 'planalto', 'planicie', 'intemperismo'],
            'Urbanização': ['cidade', 'urban', 'metropole', 'favela', 'periferia', 'segregac', 'mobilidade', 'transporte', 'moradia', 'conurbac'],
            'Agropecuária e questão agrária': ['agricultura', 'agropecuar', 'agronegocio', 'latifundio', 'reforma agraria', 'campo', 'rural', 'soja', 'pecuaria', 'agrotoxico', 'monocultura'],
            'Economia, indústria e globalização': ['globaliz', 'industria', 'comercio', 'multinacional', 'economia', 'mercado', 'exporta', 'importa', 'blocos economicos', 'mercosul', 'tecnologia', 'trabalho'],
            'População e migração': ['populac', 'migrac', 'migrante', 'imigra', 'emigra', 'refugiad', 'demograf', 'natalidade', 'envelhecimento', 'fecundidade'],
            'Meio ambiente e energia': ['meio ambiente', 'ambiental', 'desmatament', 'energia', 'hidreletric', 'petroleo', 'renovav', 'sustentab', 'queimada', 'amazonia', 'biocombustivel', 'mineracao'],
            'Geopolítica': ['geopolit', 'conflito', 'fronteira', 'territorio', 'onu', 'otan', 'soberania', 'estado-nacao', 'terrorismo'],
        },
        'Filosofia': {
            'Filosofia antiga': ['socrates', 'platao', 'aristoteles', 'pre-socratic', 'sofist', 'mito', 'logos', 'virtude', 'caverna', 'epicur', 'estoic'],
            'Filosofia moderna': ['descartes', 'kant', 'hume', 'locke', 'hobbes', 'rousseau', 'maquiavel', 'espinosa', 'bacon', 'racionalismo', 'empirismo', 'contrato social'],
            'Ética e política': ['etica', 'moral', 'justica', 'liberdade', 'dever', 'virtude', 'poder', 'politica', 'estado de natureza'],
            'Filosofia contemporânea': ['nietzsche', 'marx', 'sartre', 'foucault', 'arendt', 'existencial', 'hegel', 'adorno', 'habermas', 'beauvoir', 'industria cultural'],
            'Conhecimento e ciência': ['conhecimento', 'verdade', 'razao', 'ciencia', 'metodo', 'epistemolog', 'duvida', 'experiencia'],
        },
        'Sociologia': {
            'Trabalho e sociedade': ['trabalho', 'trabalhador', 'emprego', 'fordismo', 'toyotismo', 'precariz', 'divisao do trabalho', 'classe operaria', 'sindicato'],
            'Cultura e identidade': ['cultura', 'identidade', 'etnocentr', 'diversidade', 'religiao', 'tradicao', 'costume', 'patrimonio', 'cultura de massa'],
            'Cidadania e movimentos sociais': ['cidadania', 'direitos', 'movimento social', 'movimentos sociais', 'democracia', 'participac', 'protesto', 'feminis', 'voto'],
            'Desigualdade e exclusão': ['desigualdade', 'pobreza', 'racismo', 'preconceito', 'discrimina', 'exclusao', 'genero', 'violencia', 'minoria'],
            'Estado, poder e instituições': ['estado', 'poder', 'instituic', 'burocracia', 'weber', 'durkheim', 'fato social', 'dominacao', 'ideologia'],
        },
    },
    'Linguagens': {
        'Português': {
            'Interpretação de texto': ['texto', 'autor', 'leitor', 'argument', 'tese', 'sentido', 'objetivo', 'finalidade', 'informac'],
            'Gramática e uso da língua': ['verbo', 'pronome', 'sujeito', 'concordancia', 'regencia', 'crase', 'pontuac', 'virgula', 'conjuncao', 'coesao', 'conectivo', 'adjetivo', 'substantivo', 'adverbio', 'termo'],
            'Variação linguística': ['variac', 'variedade', 'norma-padrao', 'norma padrao', 'coloquial', 'regional', 'dialeto', 'sotaque', 'girias', 'giria', 'preconceito linguistic'],
            'Gêneros textuais': ['genero', 'cronica', 'charge', 'tirinha', 'anuncio', 'propaganda', 'reportagem', 'noticia', 'carta', 'editorial', 'campanha', 'publicidade', 'infografico'],
            'Funções e figuras de linguagem': ['funcao da linguagem', 'funcao referencial', 'funcao poetica', 'funcao metalinguistica', 'funcao conativa', 'funcao emotiva', 'funcao fatica', 'metafora', 'metonimia', 'ironia', 'hiperbole', 'figura de linguagem', 'intertext'],
        },
        'Literatura': {
            'Escolas literárias': ['romantismo', 'realismo', 'naturalismo', 'parnasian', 'simbolismo', 'modernismo', 'modernista', 'barroco', 'arcadismo', 'pre-modernismo', 'semana de arte moderna', 'machado de assis', 'drummond', 'guimaraes rosa', 'clarice'],
            'Poesia e prosa': ['poema', 'poeta', 'verso', 'estrofe', 'rima', 'soneto', 'romance', 'conto', 'narrador', 'personagem', 'eu lirico', 'lirico'],
        },
        'Artes': {
            'Artes visuais': ['pintura', 'escultura', 'obra de arte', 'artista', 'museu', 'instalacao', 'fotografia', 'grafite', 'vanguarda', 'tela', 'performance'],
            'Música, dança e teatro': ['musica', 'cancao', 'danca', 'teatro', 'ritmo', 'samba', 'cinema', 'espetaculo', 'melodia'],
        },
        'Educação Física': {
            'Corpo, esporte e saúde': ['esporte', 'corpo', 'atividade fisica', 'exercicio', 'futebol', 'jogo', 'atleta', 'olimpi', 'ginastica', 'capoeira', 'lazer'],
        },
        'Tecnologias e comunicação': {
            'Mídias e tecnologia': ['internet', 'rede social', 'redes sociais', 'digital', 'tecnologia', 'virtual', 'celular', 'midia', 'aplicativo', 'computador', 'fake news'],
        },
    },
    'Inglês': {'Inglês': {'Interpretação de texto em inglês': []}},
    'Espanhol': {'Espanhol': {'Interpretação de texto em espanhol': []}},
}

# Quando nenhuma palavra-chave aparece.
PADRAO = {
    'Matemática': ('Matemática', 'Aritmética e números'),
    'Ciências da Natureza': ('Biologia', 'Ecologia'),
    'Ciências Humanas': ('História', 'Idade Contemporânea'),
    'Linguagens': ('Português', 'Interpretação de texto'),
    'Inglês': ('Inglês', 'Interpretação de texto em inglês'),
    'Espanhol': ('Espanhol', 'Interpretação de texto em espanhol'),
}
# Assuntos "genéricos" valem menos, para não engolirem os específicos.
PESO_ASSUNTO = {('Português', 'Interpretação de texto'): 0.35}


def norm(s: str) -> str:
    s = unicodedata.normalize('NFD', s.lower())
    return ''.join(c for c in s if unicodedata.category(c) != 'Mn')


def text_of(q: dict) -> tuple[str, str]:
    st = ' '.join(b.get('text', '') for b in q.get('statement', []) if b.get('type') == 'text')
    alts = ' '.join(a.get('text', '') for a in q.get('alternatives', []))
    return ' ' + norm(st) + ' ', ' ' + norm(alts) + ' '


def hits(text: str, kw: str) -> int:
    # Palavra-chave casa no começo de uma palavra (ou em qualquer lugar, se tiver símbolos).
    if re.match(r'^[a-z]', kw):
        return len(re.findall(r'(?<![a-z])' + re.escape(kw), text))
    return text.count(kw)


def classify(q: dict) -> tuple[str, str, float]:
    area = q['subject']
    st, alts = text_of(q)
    best = (None, None, 0.0)
    for materia, assuntos in TAXONOMIA.get(area, {}).items():
        for assunto, kws in assuntos.items():
            score = sum(2 * min(hits(st, k), 3) + min(hits(alts, k), 2) for k in kws)
            score *= PESO_ASSUNTO.get((materia, assunto), 1)
            if score > best[2]:
                best = (materia, assunto, score)
    if best[0] is None:
        m, a = PADRAO[area]
        return m, a, 0.0
    return best


def packs():
    for root, _, files in os.walk(CONTENT):
        for f in files:
            if f == 'pack.json':
                yield os.path.join(root, f)


def main():
    report = '--relatorio' in sys.argv
    dist = Counter()
    fallback = Counter()
    examples = defaultdict(list)
    taxo_counts = defaultdict(Counter)
    for path in sorted(packs()):
        pack = json.load(open(path, encoding='utf-8'))
        for q in pack['questions']:
            if q['subject'] not in TAXONOMIA:
                continue
            materia, assunto, score = classify(q)
            q['materia'], q['assunto'] = materia, assunto
            dist[(q['subject'], materia, assunto)] += 1
            taxo_counts[materia][assunto] += 1
            if score == 0:
                fallback[q['subject']] += 1
            if len(examples[(materia, assunto)]) < 2:
                first = next((b['text'] for b in q['statement'] if b.get('type') == 'text'), '')
                examples[(materia, assunto)].append(f"{q['id']}: {first[:110]}")
        if not report:
            pack['version'] = max(pack.get('version', 1), PACK_VERSION)
            json.dump(pack, open(path, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

    total = sum(dist.values())
    print(f'{total} questões classificadas; sem palavra-chave (assunto padrão): {sum(fallback.values())} {dict(fallback)}')
    for (area, m, a), n in sorted(dist.items()):
        print(f'  {area:22} {m:26} {a:40} {n}')
    if report:
        for k, ex in sorted(examples.items()):
            print(k, *ex, sep='\n    ')
        return

    # Lista de matérias e assuntos para o app (ordem da taxonomia).
    out = []
    for area, materias in TAXONOMIA.items():
        for materia, assuntos in materias.items():
            out.append({'area': area, 'materia': materia,
                        'assuntos': [{'nome': a, 'questoes': taxo_counts[materia][a]} for a in assuntos]})
    json.dump({'version': 1, 'materias': out}, open(os.path.join(CONTENT, 'assuntos.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

    manifest_path = os.path.join(CONTENT, 'manifest.json')
    manifest = json.load(open(manifest_path, encoding='utf-8'))
    for e in manifest['exams']:
        e['packVersion'] = max(e.get('packVersion', 1), PACK_VERSION)
    manifest['version'] = manifest.get('version', 1) + 1
    json.dump(manifest, open(manifest_path, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('pacotes, manifest e content/assuntos.json atualizados')


if __name__ == '__main__':
    main()
