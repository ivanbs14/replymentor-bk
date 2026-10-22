import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

type Category =
  | 'explicit_question_mark'
  | 'without_punctuation'
  | 'implicit_question'
  | 'multiple_questions'
  | 'candidate_after_question'
  | 'noise'
  | 'no_question';

type CorpusCase = {
  id: string;
  category: Category;
  description: string;
  chunks: string[];
  expectedQuestion: string | null;
};

const explicitQuestions = [
  'Como você organiza prioridades em uma semana intensa?',
  'Qual foi o principal aprendizado de um projeto difícil?',
  'Como você comunica um risco técnico para outras áreas?',
  'O que você considera ao revisar uma solução?',
  'Como você reage quando uma estimativa muda?',
  'Qual abordagem você usa para investigar uma falha?',
  'Como você garante clareza em decisões técnicas?',
  'O que faz quando recebe requisitos incompletos?',
  'Como você acompanha a qualidade de uma entrega?',
  'Qual é sua forma de colaborar com pessoas de outras áreas?',
  'Como você decide entre velocidade e manutenção?',
  'O que você aprendeu ao trabalhar com sistemas legados?',
  'Como você conduz uma conversa sobre divergências?',
  'Qual foi uma decisão técnica que você reconsiderou?',
  'Como você estrutura uma investigação de desempenho?',
  'O que costuma observar antes de publicar uma mudança?',
  'Como você compartilha conhecimento com a equipe?',
  'Qual é seu processo para entender um domínio novo?',
  'Como você mede se uma solução resolveu o problema?',
  'O que você espera de uma boa revisão de código?',
];

const withoutPunctuation = [
  'como você lida com prioridades concorrentes',
  'me explique sua forma de investigar incidentes',
  'qual foi seu maior aprendizado recente',
  'como você comunica uma decisão impopular',
  'o que você faz diante de um requisito ambíguo',
  'como você reduz riscos antes de uma entrega',
  'qual abordagem usa para estimar tarefas',
  'como você organiza uma revisão técnica',
  'o que considera ao escolher uma ferramenta',
  'como você reage a uma mudança urgente',
  'qual foi uma situação em que precisou negociar escopo',
  'como você identifica a causa de uma regressão',
  'me conte como você melhora um processo da equipe',
  'o que você faria diante de métricas contraditórias',
  'como você documenta uma decisão importante',
  'qual é sua estratégia para aprender um sistema existente',
  'como você atua quando falta contexto',
  'me explique como você valida uma hipótese',
  'o que você busca em uma parceria de trabalho',
  'como você acompanha uma entrega depois da publicação',
];

const implicitQuestions = [
  'Conte sobre uma situação em que você precisou adaptar o plano.',
  'Descreva uma decisão tomada com informações incompletas.',
  'Explique como você prepara uma mudança de alto risco.',
  'Dê um exemplo de colaboração entre áreas.',
  'Fale sobre um aprendizado obtido após um erro.',
  'Mostre como você divide um problema complexo.',
  'Conte como você reage a uma revisão crítica.',
  'Descreva seu processo para priorizar débitos técnicos.',
  'Explique como você valida uma solução antes de entregá-la.',
  'Dê um exemplo de melhoria contínua que você promoveu.',
  'Fale sobre uma ocasião em que mudou de opinião.',
  'Conte como você conduz uma investigação sem evidência inicial.',
  'Descreva como você alinha expectativas com outras pessoas.',
  'Explique como você evita repetir uma falha.',
  'Dê um exemplo de decisão orientada por dados.',
];

const statements = [
  'Eu começaria reunindo os sinais disponíveis.',
  'Nesse caso eu alinharia primeiro o objetivo.',
  'Minha prioridade seria reduzir o risco imediato.',
  'Eu registraria a decisão e os critérios usados.',
  'A primeira etapa seria confirmar o impacto.',
  'Eu buscaria uma alternativa reversível.',
  'Depois eu compartilharia o resultado com a equipe.',
  'Eu separaria fatos, hipóteses e próximos testes.',
  'A experiência me ensinou a validar antes de ampliar.',
  'Eu acompanharia os indicadores após a mudança.',
];

const cases: CorpusCase[] = [];
const add = (
  category: Category,
  index: number,
  description: string,
  chunks: string[],
  expectedQuestion: string | null,
) => {
  cases.push({
    id: `${category}-${String(index + 1).padStart(3, '0')}`,
    category,
    description,
    chunks,
    expectedQuestion,
  });
};

explicitQuestions.forEach((question, index) =>
  add(
    'explicit_question_mark',
    index,
    'Pergunta explícita com pontuação interrogativa.',
    [index % 2 === 0 ? `Entrevistador: ${question}` : question],
    question,
  ),
);

withoutPunctuation.forEach((question, index) => {
  const hasCandidateAfter = index >= 10;
  add(
    'without_punctuation',
    index,
    hasCandidateAfter
      ? 'Pergunta sem pontuação seguida por fala do candidato.'
      : 'Pergunta direta sem pontuação no fim do trecho.',
    hasCandidateAfter
      ? [
          index % 2 === 0 ? `Entrevistador: ${question}` : question,
          index % 2 === 0
            ? `Candidato: ${statements[index % statements.length]}`
            : statements[index % statements.length],
        ]
      : [index % 2 === 0 ? `Entrevistador: ${question}` : question],
    question,
  );
});

implicitQuestions.forEach((question, index) =>
  add(
    'implicit_question',
    index,
    'Solicitação implícita que requer resposta, sem ponto de interrogação.',
    [index % 2 === 0 ? `Entrevistador: ${question}` : question],
    question,
  ),
);

explicitQuestions.slice(0, 15).forEach((question, index) => {
  const earlier = explicitQuestions[(index + 5) % explicitQuestions.length];
  add(
    'multiple_questions',
    index,
    'Duas perguntas no trecho; o rótulo aponta para a mais recente.',
    index % 2 === 0
      ? [`Entrevistador: ${earlier}`, `Entrevistador: ${question}`]
      : [`${earlier} ${question}`],
    question,
  );
});

explicitQuestions.forEach((punctuated, index) => {
  const expected =
    index < 10
      ? punctuated
      : withoutPunctuation[(index + 5) % withoutPunctuation.length];
  add(
    'candidate_after_question',
    index,
    index < 10
      ? 'Pergunta pontuada seguida pela resposta parcial do candidato.'
      : 'Pergunta sem pontuação seguida pela resposta parcial do candidato.',
    [
      index % 2 === 0 ? `Entrevistador: ${expected}` : expected,
      index % 2 === 0
        ? `Candidato: ${statements[index % statements.length]}`
        : statements[index % statements.length],
    ],
    expected,
  );
});

explicitQuestions
  .slice(0, 15)
  .forEach((question, index) =>
    add(
      'noise',
      index,
      'Pergunta acompanhada por ruído ou fragmento de transcrição.',
      index < 5
        ? [
            '[ruído breve]',
            index % 2 === 0 ? `Entrevistador: ${question}` : question,
          ]
        : [
            index % 2 === 0
              ? `Entrevistador: ${question.replace(/\?$/, '')}`
              : question.replace(/\?$/, ''),
            '[inaudível] certo certo',
          ],
      question,
    ),
  );

Array.from({ length: 15 }, (_, index) =>
  add(
    'no_question',
    index,
    'Trecho declarativo sem pergunta ou solicitação ao candidato.',
    index % 2 === 0
      ? [
          `Entrevistador: Vamos seguir para o próximo tópico ${index + 1}.`,
          `Candidato: ${statements[index % statements.length]}`,
        ]
      : [
          `Vamos seguir para o próximo tópico ${index + 1}.`,
          statements[index % statements.length],
        ],
    null,
  ),
);

if (cases.length !== 120) {
  throw new Error(`O corpus deve conter 120 casos; recebeu ${cases.length}.`);
}

const outputPath = resolve(
  process.cwd(),
  'test/fixtures/question-detection-corpus.json',
);
mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(cases, null, 2)}\n`, 'utf8');
console.log(`Corpus gravado em ${outputPath} com ${cases.length} casos.`);
