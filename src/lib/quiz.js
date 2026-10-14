import { shuffle, shuffleChoices } from './shuffle.js';

export function prepareQuizQuestions(raw) {
  return shuffle(raw || []).map((question) => {
    if (question.format === 'arrange-order') {
      const items = (question.lines || []).map((text, originalIndex) => ({ text, originalIndex }));
      return { ...question, items: shuffle(items) };
    }
    if (question.format === 'matching') {
      return {
        ...question,
        terms: shuffle((question.pairs || []).map((pair, i) => ({ ...pair, i }))),
        defs: shuffle((question.pairs || []).map((pair) => pair.definition)),
        matches: {},
      };
    }
    if (Array.isArray(question.options) && Number.isInteger(Number(question.answer))) {
      const mixed = shuffleChoices(question.options, Number(question.answer));
      return { ...question, options: mixed.options, answer: mixed.answer };
    }
    return { ...question };
  });
}
