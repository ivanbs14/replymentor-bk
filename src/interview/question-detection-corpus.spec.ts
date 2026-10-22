import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

type CorpusCase = {
  id: string;
  category: string;
  description: string;
  chunks: string[];
  expectedQuestion: string | null;
};

const corpus = JSON.parse(
  readFileSync(
    resolve(process.cwd(), 'test/fixtures/question-detection-corpus.json'),
    'utf8',
  ),
) as CorpusCase[];

describe('FEAT-012 question detection corpus', () => {
  it('contains at least 100 valid, uniquely identified cases', () => {
    expect(corpus.length).toBeGreaterThanOrEqual(100);
    expect(new Set(corpus.map((item) => item.id)).size).toBe(corpus.length);
    for (const item of corpus) {
      expect(item.id).toMatch(/^[a-z_]+-\d{3}$/);
      expect(item.description.trim()).not.toHaveLength(0);
      expect(item.chunks.length).toBeGreaterThan(0);
      expect(item.chunks.every((chunk) => chunk.trim().length > 0)).toBe(true);
      expect(
        item.expectedQuestion === null ||
          item.expectedQuestion.trim().length > 0,
      ).toBe(true);
    }
  });

  it('covers every category approved for the initial corpus', () => {
    expect(new Set(corpus.map((item) => item.category))).toEqual(
      new Set([
        'explicit_question_mark',
        'without_punctuation',
        'implicit_question',
        'multiple_questions',
        'candidate_after_question',
        'noise',
        'no_question',
      ]),
    );
  });

  it('covers unlabeled speech and multiple questions in one chunk without duplicate inputs', () => {
    const serializedChunks = corpus.map((item) => JSON.stringify(item.chunks));
    expect(new Set(serializedChunks).size).toBe(corpus.length);
    expect(
      corpus.some((item) =>
        item.chunks.every(
          (chunk) => !/^(Entrevistador|Candidato):/i.test(chunk),
        ),
      ),
    ).toBe(true);
    expect(
      corpus.some((item) =>
        item.chunks.some((chunk) => (chunk.match(/\?/g) ?? []).length >= 2),
      ),
    ).toBe(true);
  });

  it('contains no obvious personal identifiers', () => {
    const serialized = JSON.stringify(corpus);
    expect(serialized).not.toMatch(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/i);
    expect(serialized).not.toMatch(/\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/);
    expect(serialized).not.toMatch(
      /\b(?:\+?55\s*)?\(?\d{2}\)?\s*9?\d{4}[-\s]?\d{4}\b/,
    );
  });
});
