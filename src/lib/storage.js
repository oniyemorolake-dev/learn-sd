export const STORAGE_PREFIX = 'learn-sd';
export const STORAGE_KEY = 'learn-sd-v1';
export const THEME_KEY = 'learn-sd-theme';
// New localStorage keys should start with STORAGE_PREFIX so backup/restore picks them up.

export function loadTheme() {
  try {
    return localStorage.getItem(THEME_KEY) === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

export function saveTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme === 'light' ? 'light' : 'dark');
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
    xp: 0,
    streak: { count: 0, lastDate: null, days: {} },
  };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    return { ...emptyState(), ...JSON.parse(raw) };
  } catch {
    return emptyState();
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Private mode or full disk — the session still works in memory.
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
  const days = { ...state.streak.days, [today]: true };
  if (state.streak.lastDate === today) {
    return { ...state, streak: { ...state.streak, days } };
  }
  const yesterday = shiftStamp(today, -1);
  const count = state.streak.lastDate === yesterday ? state.streak.count + 1 : 1;
  return { ...state, streak: { count, lastDate: today, days } };
}

export function addXp(state, amount) {
  return { ...state, xp: state.xp + amount };
}

export function levelFromXp(xp) {
  return Math.floor(xp / 50) + 1;
}

export function xpIntoLevel(xp) {
  return xp % 50;
}
