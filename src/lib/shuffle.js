export function shuffle(list) {
  const next = [...list];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

export function shuffleChoices(options, answerIndex) {
  const packed = options.map((label, index) => ({ label, index }));
  const mixed = shuffle(packed);
  return {
    options: mixed.map((item) => item.label),
    answer: mixed.findIndex((item) => item.index === answerIndex),
  };
}
