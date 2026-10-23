import {
  DETERMINISTIC_QUESTION_DETECTOR_VERSION,
  detectLatestQuestion,
} from './deterministic-question-detector';

const chunks = (...content: string[]) =>
  content.map((value, index) => ({
    id: `chunk-${index + 1}`,
    sequence: index + 1,
    content: value,
  }));

describe('deterministic question detector', () => {
  it.each([
    [
      'Entrevistador: Como você investiga incidentes?',
      'Como você investiga incidentes?',
    ],
    [
      'qual foi seu maior aprendizado recente',
      'qual foi seu maior aprendizado recente',
    ],
    [
      'Conte sobre uma situação em que você adaptou o plano.',
      'Conte sobre uma situação em que você adaptou o plano.',
    ],
  ])('detects explicit and implicit questions from %s', (content, expected) => {
    const result = detectLatestQuestion(chunks(content));

    expect(result).toMatchObject({
      status: 'DETECTED',
      question: expected,
      detectorVersion: DETERMINISTIC_QUESTION_DETECTOR_VERSION,
    });
    expect(result.confidence).toBeGreaterThanOrEqual(0.5);
  });

  it('selects the latest question when one chunk contains multiple questions', () => {
    const result = detectLatestQuestion(
      chunks('Como você prioriza tarefas? O que faz quando o prazo muda?'),
    );

    expect(result.question).toBe('O que faz quando o prazo muda?');
  });

  it('segments sentences and speaker changes inside the same chunk', () => {
    const result = detectLatestQuestion(
      chunks(
        'Entrevistador: Conte sobre o projeto. Como você mediu o resultado? Candidato: Como líder, acompanhei métricas.',
      ),
    );

    expect(result.question).toBe('Como você mediu o resultado?');
    expect(result.confidence).toBeGreaterThanOrEqual(0.85);
  });

  it('keeps a stronger explicit question over weaker unlabeled trailing speech', () => {
    const result = detectLatestQuestion(
      chunks(
        'Entrevistador: Como você organiza prioridades?',
        'como líder eu costumo começar pelo impacto',
      ),
    );

    expect(result.question).toBe('Como você organiza prioridades?');
  });

  it('selects a later direct question even when an earlier speaker marker scores higher', () => {
    const result = detectLatestQuestion(
      chunks(
        'Entrevistador: Como você organiza prioridades?',
        'O que você faz quando o prazo muda?',
      ),
    );

    expect(result.question).toBe('O que você faz quando o prazo muda?');
  });

  it('keeps the interviewer question when candidate speech follows it', () => {
    const result = detectLatestQuestion(
      chunks(
        'Entrevistador: como você reduz riscos antes de uma entrega',
        'Candidato: Eu começo validando as hipóteses mais críticas.',
      ),
    );

    expect(result).toMatchObject({
      status: 'DETECTED',
      question: 'como você reduz riscos antes de uma entrega',
    });
    expect(result.evidence).toEqual([
      expect.objectContaining({ chunkId: 'chunk-1', sequence: 1 }),
    ]);
  });

  it('ignores trailing noise and preserves traceable evidence', () => {
    const result = detectLatestQuestion(
      chunks(
        'Entrevistador: Qual abordagem você usa para investigar uma falha',
        '[inaudível] certo certo',
      ),
    );

    expect(result.question).toBe(
      'Qual abordagem você usa para investigar uma falha',
    );
    expect(result.evidence[0]?.excerpt).toContain(result.question!);
    expect(result.evidence[0]?.excerpt.length).toBeLessThanOrEqual(240);
  });

  it('returns NOT_FOUND conservatively without fabricating a question', () => {
    const result = detectLatestQuestion(
      chunks(
        'Entrevistador: Vamos seguir para o próximo tópico.',
        'Candidato: Eu registraria a decisão e os critérios usados.',
      ),
    );

    expect(result).toEqual({
      status: 'NOT_FOUND',
      question: null,
      confidence: 0,
      evidence: [],
      detectorVersion: DETERMINISTIC_QUESTION_DETECTOR_VERSION,
    });
  });

  it('is deterministic and clamps confidence to the 0..1 interval', () => {
    const input = chunks('Entrevistador: Como você testa mudanças?');
    const first = detectLatestQuestion(input);
    const second = detectLatestQuestion(input);

    expect(second).toEqual(first);
    expect(first.confidence).toBeGreaterThanOrEqual(0);
    expect(first.confidence).toBeLessThanOrEqual(1);
  });
});
