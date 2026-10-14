export const STORAGE_PREFIX = 'learn-sd';
export const STORAGE_KEY = 'learn-sd-v1';
export const THEME_KEY = 'learn-sd-theme';
export const CORRUPT_KEY = 'learn-sd-v1-corrupt';
// New localStorage keys should start with STORAGE_PREFIX so backup/restore picks them up.

export function getStore() {
  try {
    if (typeof localStorage === 'undefined') return null;
    return localStorage;
  } catch {
    return null;
  }
}

export function loadTheme(store = getStore()) {
  try {
    return store?.getItem(THEME_KEY) === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

export function saveTheme(theme, store = getStore()) {
  try {
    store?.setItem(THEME_KEY, theme === 'light' ? 'light' : 'dark');
  } catch {
    // Private mode — theme still applies for this session.
  }
}

export function applyTheme(theme) {
  const next = theme === 'light' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  document.querySelector('meta[name="theme-color"]')?.setAttribute(
    'content',
    next === 'light' ? '#f6f2fb' : '#0F0B1E',
  );
}

export function emptyState() {
  return {
    lessons: {},
    quizzes: {},
    exercises: {},
    bookmarks: [],
    tracks: {},
    reviews: {},
    attempts: {},
    examSeen: [],
    recent: [],
    xp: 0,
    streak: { count: 0, lastDate: null, days: {} },
  };
}

export function hasProgress(state) {
  if (!state || typeof state !== 'object') return false;
  if (Number(state.xp) > 0) return true;
  if (state.streak?.count > 0) return true;
  if (state.bookmarks?.length) return true;
  if (state.examSeen?.length) return true;
  if (state.recent?.length) return true;
  for (const key of ['lessons', 'quizzes', 'exercises', 'tracks', 'reviews', 'attempts']) {
    if (state[key] && typeof state[key] === 'object' && Object.keys(state[key]).length) return true;
  }
  return false;
}

export function normalizeState(raw) {
  const empty = emptyState();
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return empty;
  const streak = raw.streak && typeof raw.streak === 'object' ? raw.streak : {};
  return {
    ...empty,
    ...raw,
    lessons: asMap(raw.lessons),
    quizzes: asMap(raw.quizzes),
    exercises: asMap(raw.exercises),
    bookmarks: Array.isArray(raw.bookmarks) ? raw.bookmarks : [],
    tracks: asMap(raw.tracks),
    reviews: asMap(raw.reviews),
    attempts: asMap(raw.attempts),
    examSeen: Array.isArray(raw.examSeen) ? raw.examSeen : [],
    recent: Array.isArray(raw.recent) ? raw.recent.filter((item) => item && item.topicId) : [],
    xp: Number(raw.xp) || 0,
    streak: {
      count: Number(streak.count) || 0,
      lastDate: streak.lastDate || null,
      days: asMap(streak.days),
    },
  };
}

function asMap(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? { ...value } : {};
}

export const RECENT_CAP = 8;

export function pushRecent(recent, topicId) {
  if (!topicId) return Array.isArray(recent) ? recent : [];
  return [{ topicId, at: Date.now() }, ...(recent || []).filter((item) => item.topicId !== topicId)].slice(
    0,
    RECENT_CAP,
  );
}

export function persistMessage(reason) {
  if (reason === 'blocked') {
    return 'This browser is not saving your progress. Export a backup, and avoid Private mode.';
  }
  if (reason === 'quota') {
    return 'Storage is full, so new progress may not save. Export a backup.';
  }
  if (reason === 'corrupt') {
    return 'A saved copy was damaged. We kept it aside and started clean — restore a backup if you have one.';
  }
  return null;
}

export function readProgress(store = getStore()) {
  if (!store) return { state: emptyState(), persistError: 'blocked' };
  let raw;
  try {
    raw = store.getItem(STORAGE_KEY);
  } catch {
    return { state: emptyState(), persistError: 'blocked' };
  }
  if (!raw) return { state: emptyState(), persistError: null };
  try {
    return { state: normalizeState(JSON.parse(raw)), persistError: null };
  } catch {
    stashCorrupt(store, raw);
    return { state: emptyState(), persistError: 'corrupt' };
  }
}

export function loadState(store = getStore()) {
  return readProgress(store).state;
}

function stashCorrupt(store, raw) {
  if (!store || raw == null) return;
  try {
    store.setItem(CORRUPT_KEY, raw);
  } catch {
    // Keep going — we still must not crash the app.
  }
}

export function saveState(state, store = getStore()) {
  if (!store) return { ok: false, reason: 'blocked' };
  const normalized = normalizeState(state);
  try {
    const existingRaw = store.getItem(STORAGE_KEY);
    if (!hasProgress(normalized)) {
      if (existingRaw) {
        try {
          JSON.parse(existingRaw);
        } catch {
          stashCorrupt(store, existingRaw);
        }
      }
      // Never write an empty snapshot — that is how reloads were wiping XP.
      return { ok: true, skipped: true };
    }
    store.setItem(STORAGE_KEY, JSON.stringify(normalized));
    return { ok: true };
  } catch (err) {
    const quota = err && (err.name === 'QuotaExceededError' || err.code === 22);
    return { ok: false, reason: quota ? 'quota' : 'blocked' };
  }
}

export function todayStamp(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function shiftStamp(stamp, days) {
  const [y, m, d] = stamp.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return todayStamp(date);
}

export function touchStreak(state) {
  const today = todayStamp();
  const days = { ...(state.streak?.days || {}), [today]: true };
  if (state.streak?.lastDate === today) {
    return { ...state, streak: { ...state.streak, days } };
  }
  const yesterday = shiftStamp(today, -1);
  const count = state.streak?.lastDate === yesterday ? state.streak.count + 1 : 1;
  return { ...state, streak: { count, lastDate: today, days } };
}

export function addXp(state, amount) {
  return { ...state, xp: (Number(state.xp) || 0) + amount };
}

export function levelFromXp(xp) {
  return Math.floor(xp / 50) + 1;
}

export function xpIntoLevel(xp) {
  return xp % 50;
}
