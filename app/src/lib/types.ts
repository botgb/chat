// Formato do conteúdo publicado (manifest + pacotes de prova).
// O mesmo formato é gerado pelo leitor de provas em /pipeline.

export type Vestibular = {
  id: string; // "enem", "fuvest"...
  name: string;
  secondsPerQuestion: number; // tempo médio oficial por questão
};

export type ExamSummary = {
  id: string; // "enem-2023-d1"
  vestibular: string;
  title: string;
  year: number;
  packUrl: string; // relativo ao contentBaseUrl
  packVersion: number;
  questionCount: number;
  subjects: string[];
};

export type Manifest = {
  version: number;
  vestibulares: Vestibular[];
  exams: ExamSummary[];
};

// Enunciado em blocos para manter a ordem de textos e imagens.
export type Block = { type: 'text'; text: string } | { type: 'image'; src: string; w?: number; h?: number };

export type Alternative = {
  letter: string; // "A".."E"
  text?: string;
  image?: string;
  imageW?: number;
  imageH?: number;
};

export type Question = {
  id: string; // único no conteúdo inteiro: "enem-2023-d1-q12"
  number: number;
  subject: string; // "Matemática", "Biologia"...
  statement: Block[];
  alternatives: Alternative[];
  answer: string | null; // null = questão anulada
};

export type ExamPack = {
  id: string;
  vestibular: string;
  title: string;
  year: number;
  version: number;
  source?: string; // crédito exibido ao aluno, ex.: "Questões: INEP, ENEM 2023"
  questions: Question[];
};
