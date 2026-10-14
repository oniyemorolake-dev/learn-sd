export function shuffle(list) {
  const next = [...list];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

export function shuffleChoices(options, answerIndex) {
  const list = Array.isArray(options) ? [...options] : [];
  const source = Number.parseInt(answerIndex, 10);
  const packed = list.map((label, index) => ({ label, index }));
  const mixed = shuffle(packed);
  const answer = mixed.findIndex((item) => item.index === source);
  return {
    options: mixed.map((item) => item.label),
    answer: answer === -1 || !Number.isInteger(source) ? source : answer,
  };
}
