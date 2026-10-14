const DAY_MS = 24 * 60 * 60 * 1000;
const STEPS = [1, 3, 7, 14, 30];

export function startOfDay(timestamp) {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

export function growInterval(prevInterval) {
  if (!prevInterval || prevInterval <= 0) return 1;
  const next = STEPS.find((step) => step > prevInterval);
  return next || 30;
}

export function scheduleReview(existing, score, total, now = Date.now(), options = {}) {
  if (now && typeof now === 'object') {
    options = now;
    now = options.now || Date.now();
  }
  const pct = total > 0 ? score / total : 0;
  const prevInterval = existing?.intervalDays || 0;
  const prevEase = typeof existing?.ease === 'number' ? existing.ease : 2;
  const pinInterval = Boolean(options.pinInterval);

  if (pct < 0.8 || pinInterval) {
    return {
      lastReviewed: now,
      intervalDays: 1,
      ease: pinInterval ? Math.min(prevEase, 1.3) : 1.3,
      nextReview: now + DAY_MS,
    };
  }

  const intervalDays = growInterval(prevInterval);
  return {
    lastReviewed: now,
    intervalDays,
    ease: Math.min(2.5, prevEase + 0.1),
    nextReview: now + intervalDays * DAY_MS,
  };
}

export function dueLabel(nextReview, now = Date.now()) {
  const days = Math.round((startOfDay(now) - startOfDay(nextReview)) / DAY_MS);
  if (days <= 0) return 'due today';
  if (days === 1) return 'due 1 day ago';
  return `due ${days} days ago`;
}

export function dueReviews(reviews, now = Date.now()) {
  return Object.entries(reviews || {})
    .filter(([, entry]) => entry && typeof entry.nextReview === 'number' && entry.nextReview <= now)
    .map(([topicId, entry]) => ({ topicId, ...entry }))
    .sort((a, b) => a.nextReview - b.nextReview);
}
