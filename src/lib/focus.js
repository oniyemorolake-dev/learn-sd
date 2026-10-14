const ATTEMPT_KEEP = 5;
const MIN_ATTEMPTS = 2;
const AVG_WINDOW = 3;
const AVG_THRESHOLD = 0.7;
const FORMAT_MISSES = 3;
const CLEAR_THRESHOLD = 0.8;

const FORMAT_LABELS = {
  'predict-output': 'Predict-output',
  'spot-the-bug': 'Spot-the-bug',
  'arrange-order': 'Arrange-order',
  'fill-blanks': 'Fill-in-the-blank',
  matching: 'Matching',
  'translate-code': 'Translate-code',
  'big-o': 'Big O',
  'multiple-choice': 'Multiple-choice',
};

export function formatLabel(formatId) {
  if (!formatId) return 'These';
  if (FORMAT_LABELS[formatId]) return FORMAT_LABELS[formatId];
  const spaced = String(formatId).replace(/-/g, ' ');
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

export function attemptPct(attempt) {
  if (!attempt) return 0;
  if (typeof attempt.total === 'number' && attempt.total > 0 && typeof attempt.score === 'number') {
    if (attempt.score > 1) return attempt.score / attempt.total;
    if (attempt.score <= 1 && attempt.total === 1) return attempt.score;
  }
  if (typeof attempt.score === 'number') {
    return attempt.score > 1 ? attempt.score / 100 : attempt.score;
  }
  return 0;
}

export function appendAttempt(existing, { score, total, wrongFormats, date }) {
  const pct =
    typeof total === 'number' && total > 0 ? score / total : score > 1 ? score / 100 : Number(score) || 0;
  const attempt = {
    score: pct,
    wrongFormats: Array.isArray(wrongFormats) ? wrongFormats.filter(Boolean) : [],
    date: date || new Date().toISOString().slice(0, 10),
  };
  return [...(existing || []), attempt].slice(-ATTEMPT_KEEP);
}

function formatMissCounts(attempts) {
  const counts = {};
  for (const attempt of attempts) {
    for (const format of attempt.wrongFormats || []) {
      counts[format] = (counts[format] || 0) + 1;
    }
  }
  return counts;
}

export function topicFocus(attempts) {
  const recent = (attempts || []).slice(-ATTEMPT_KEEP);
  if (recent.length < MIN_ATTEMPTS) return null;

  const lastPct = attemptPct(recent[recent.length - 1]);
  if (lastPct >= CLEAR_THRESHOLD) return null;

  const window = recent.slice(-AVG_WINDOW);
  const avg = window.reduce((sum, item) => sum + attemptPct(item), 0) / window.length;
  const stubborn = Object.entries(formatMissCounts(recent))
    .filter(([, count]) => count >= FORMAT_MISSES)
    .sort((a, b) => b[1] - a[1]);

  const lowAvg = avg < AVG_THRESHOLD;
  if (!lowAvg && stubborn.length === 0) return null;

  return {
    avg,
    format: stubborn[0]?.[0] || null,
    reason: stubborn[0]
      ? `${formatLabel(stubborn[0][0])} questions tripping you up`
      : 'These could use another look',
  };
}

export function listFocusAreas(attemptsMap) {
  return Object.entries(attemptsMap || {})
    .map(([topicId, attempts]) => {
      const focus = topicFocus(attempts);
      return focus ? { topicId, ...focus } : null;
    })
    .filter(Boolean)
    .sort((a, b) => a.avg - b.avg || a.topicId.localeCompare(b.topicId));
}

export function focusTopicIds(attemptsMap) {
  return new Set(listFocusAreas(attemptsMap).map((item) => item.topicId));
}

export function conqueredLine(title) {
  const short = String(title || 'This topic')
    .split(/\s*[&:—–]\s*/)[0]
    .trim();
  return `${short}: conquered.`;
}
