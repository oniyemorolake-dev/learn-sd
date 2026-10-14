import { shuffle, shuffleChoices } from './shuffle.js';

const SKIP_OPTION_SHUFFLE = new Set(['matching', 'arrange-order']);

function answerIndex(question) {
  if (Array.isArray(question?.answer)) return NaN;
  const index = Number.parseInt(question?.answer, 10);
  return Number.isInteger(index) ? index : NaN;
}

export function shuffleQuestionOptions(question) {
  if (!question || SKIP_OPTION_SHUFFLE.has(question.format)) return question;
  const options = Array.isArray(question.options) ? [...question.options] : [];
  const source = answerIndex(question);
  if (options.length < 2 || source < 0 || source >= options.length) {
    return { ...question, options };
  }
  const mixed = shuffleChoices(options, source);
  return { ...question, options: mixed.options, answer: mixed.answer };
}

function prepareQuestion(question) {
  if (!question) return question;
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
  return shuffleQuestionOptions(question);
}

export function prepareQuizQuestions(raw) {
  return shuffle(raw || []).map((question) => prepareQuestion(question));
}
