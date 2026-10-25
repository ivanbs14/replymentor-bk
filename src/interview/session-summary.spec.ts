import {
  buildDeterministicSummary,
  buildSessionSummaryContext,
  emptySessionSummary,
  parseSessionSummaryContent,
} from './session-summary';

describe('session summary contract', () => {
  it('builds explicit deterministic fallbacks', () => {
    expect(buildDeterministicSummary([])).toContain('sem respostas');
    expect(
      buildDeterministicSummary([
        { id: 'r1', detectedQuestion: 'Q?', suggestedAnswer: 'A' },
      ]),
    ).toContain('1 resposta sugerida');
  });

  it('limits pairs and distributes the answer budget across the whole chronology', () => {
    const responses = Array.from({ length: 35 }, (_, index) => ({
      id: `r${index}`,
      detectedQuestion: `Pergunta ${index}?`,
      suggestedAnswer: `${index}`.repeat(3_000),
    }));
    const result = buildSessionSummaryContext(
      {
        resumeText: 'R'.repeat(4_000),
        interviewType: 'Técnica',
        jobLevel: 'Sênior',
        jobDescription: 'D'.repeat(3_000),
        companyName: 'Empresa',
        companySegment: null,
      },
      responses,
    );
    expect(result.responses).toHaveLength(30);
    expect(result.responses[0].answer.length).toBe(
      result.responses[29].answer.length,
    );
    expect(result.responses.every((item) => item.answer.length <= 1_500)).toBe(
      true,
    );
    expect(JSON.stringify(result).length).toBeLessThanOrEqual(20_000);
  });

  it('rejects invented evidence and evaluative hiring output', () => {
    const base = {
      overview: 'Síntese.',
      questions: [],
      topics: [],
      strengths: [],
      improvements: [],
      nextSteps: [],
    };
    expect(
      parseSessionSummaryContent(
        JSON.stringify({
          ...base,
          strengths: [{ text: 'Boa clareza.', evidenceResponseId: 'other' }],
        }),
        new Set(['r1']),
      ),
    ).toBeNull();
    expect(
      parseSessionSummaryContent(
        JSON.stringify({ ...base, overview: 'Recomendado contratar.' }),
        new Set(),
      ),
    ).toBeNull();
    expect(
      parseSessionSummaryContent(
        JSON.stringify({
          ...base,
          questions: [
            {
              question: 'Por que devemos contratar você?',
              answerSummary: 'A resposta descreveu experiências relevantes.',
            },
          ],
        }),
        new Set(),
      ),
    ).not.toBeNull();
  });

  it('returns a valid neutral summary for a session without answers', () => {
    expect(emptySessionSummary()).toMatchObject({
      questions: [],
      strengths: [],
      improvements: [],
    });
  });
});
