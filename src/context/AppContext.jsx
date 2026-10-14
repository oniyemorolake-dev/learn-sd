import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  addXp,
  applyTheme,
  hasProgress,
  levelFromXp,
  loadTheme,
  persistMessage,
  readProgress,
  saveState,
  saveTheme,
  todayStamp,
  touchStreak,
} from '../lib/storage';
import { applyBackup } from '../lib/backup';
import { scheduleReview } from '../lib/review';
import { appendAttempt, topicFocus } from '../lib/focus';

const AppContext = createContext(null);
const VIEW_KEY = 'learn-sd-view';

function loadView() {
  try {
    return JSON.parse(sessionStorage.getItem(VIEW_KEY)) || { name: 'path', params: {} };
  } catch {
    return { name: 'path', params: {} };
  }
}

export function AppProvider({ children }) {
  const boot = useRef(null);
  if (!boot.current) boot.current = readProgress();
  const [state, setState] = useState(boot.current.state);
  const [persistError, setPersistError] = useState(boot.current.persistError);
  const [view, setView] = useState(loadView);
  const [theme, setTheme] = useState(loadTheme);
  const stateRef = useRef(state);
  const persistErrorRef = useRef(boot.current.persistError);
  stateRef.current = state;

  const commit = useCallback((updater) => {
    setState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      const result = saveState(next);
      persistErrorRef.current = result.ok ? null : result.reason;
      return next;
    });
    queueMicrotask(() => setPersistError(persistErrorRef.current));
  }, []);

  useEffect(() => {
    saveState(state);
  }, [state]);

  useEffect(() => {
    function hydrate() {
      const stored = readProgress();
      if (stored.persistError === 'blocked') {
        setPersistError('blocked');
        return;
      }
      setState((current) => {
        if (hasProgress(current)) return current;
        return hasProgress(stored.state) ? stored.state : current;
      });
      if (stored.persistError) setPersistError(stored.persistError);
    }
    function flush() {
      saveState(stateRef.current);
    }
    function onHidden() {
      if (document.visibilityState === 'hidden') flush();
    }
    window.addEventListener('pageshow', hydrate);
    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', onHidden);
    const timer = window.setTimeout(hydrate, 0);
    return () => {
      window.removeEventListener('pageshow', hydrate);
      window.removeEventListener('pagehide', flush);
      document.removeEventListener('visibilitychange', onHidden);
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    applyTheme(theme);
    saveTheme(theme);
  }, [theme]);

  useEffect(() => {
    sessionStorage.setItem(VIEW_KEY, JSON.stringify(view));
  }, [view]);

  const go = useCallback((name, params = {}) => {
    setView({ name, params });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const patch = useCallback((updater) => {
    commit(updater);
  }, [commit]);

  const earn = useCallback((amount) => {
    commit((prev) => addXp(touchStreak(prev), amount));
  }, [commit]);

  const completeLesson = useCallback((topicId, checkInCorrect) => {
    commit((prev) => {
      if (prev.lessons[topicId]?.completed) return touchStreak(prev);
      return addXp(
        touchStreak({
          ...prev,
          lessons: {
            ...prev.lessons,
            [topicId]: { completed: true, checkInCorrect, at: todayStamp() },
          },
        }),
        15,
      );
    });
  }, [commit]);

  const completeQuiz = useCallback((topicId, score, total, wrongFormats = []) => {
    commit((prev) => {
      const already = prev.quizzes[topicId]?.completed;
      const nextAttempts = appendAttempt(prev.attempts?.[topicId], {
        score,
        total,
        wrongFormats,
        date: todayStamp(),
      });
      const next = {
        ...prev,
        quizzes: {
          ...prev.quizzes,
          [topicId]: { completed: true, score, total, at: todayStamp() },
        },
        attempts: {
          ...prev.attempts,
          [topicId]: nextAttempts,
        },
        reviews: {
          ...prev.reviews,
          [topicId]: scheduleReview(prev.reviews?.[topicId], score, total, Date.now(), {
            pinInterval: Boolean(topicFocus(nextAttempts)),
          }),
        },
      };
      return addXp(touchStreak(next), already ? 5 : 25);
    });
  }, [commit]);

  const completeExam = useCallback((payload) => {
    const topics = Array.isArray(payload?.byTopic) ? payload.byTopic : Object.values(payload?.byTopic || {});
    commit((prev) => {
      const attempts = { ...prev.attempts };
      for (const item of topics) {
        if (!item?.topicId) continue;
        attempts[item.topicId] = appendAttempt(attempts[item.topicId], {
          score: item.correct,
          total: item.total,
          wrongFormats: item.wrongFormats,
          date: todayStamp(),
        });
      }
      return addXp(
        touchStreak({
          ...prev,
          attempts,
          examSeen: [...(payload.questionKeys || []), ...(prev.examSeen || [])].slice(0, 400),
        }),
        payload.xp || 20,
      );
    });
  }, [commit]);

  const completeTrackLesson = useCallback((trackId, lessonId) => {
    commit((prev) => {
      const track = { lessons: {}, practice: {}, ...prev.tracks?.[trackId] };
      if (track.lessons[lessonId]?.completed) return touchStreak(prev);
      return addXp(
        touchStreak({
          ...prev,
          tracks: {
            ...prev.tracks,
            [trackId]: {
              ...track,
              lessons: {
                ...track.lessons,
                [lessonId]: { completed: true, at: todayStamp() },
              },
            },
          },
        }),
        15,
      );
    });
  }, [commit]);

  const completeTrackPractice = useCallback((trackId, practiceId) => {
    commit((prev) => {
      const track = { lessons: {}, practice: {}, ...prev.tracks?.[trackId] };
      if (track.practice[practiceId]?.completed) return touchStreak(prev);
      return addXp(
        touchStreak({
          ...prev,
          tracks: {
            ...prev.tracks,
            [trackId]: {
              ...track,
              practice: {
                ...track.practice,
                [practiceId]: { completed: true, at: todayStamp() },
              },
            },
          },
        }),
        10,
      );
    });
  }, [commit]);

  const completeExercise = useCallback((exerciseId) => {
    commit((prev) => {
      if (prev.exercises[exerciseId]) return touchStreak(prev);
      return addXp(
        touchStreak({
          ...prev,
          exercises: { ...prev.exercises, [exerciseId]: { at: todayStamp() } },
        }),
        10,
      );
    });
  }, [commit]);

  const toggleBookmark = useCallback((entry) => {
    commit((prev) => {
      const exists = prev.bookmarks.find((item) => item.id === entry.id);
      return {
        ...prev,
        bookmarks: exists
          ? prev.bookmarks.filter((item) => item.id !== entry.id)
          : [{ ...entry, savedAt: Date.now() }, ...prev.bookmarks],
      };
    });
  }, [commit]);

  const isBookmarked = useCallback(
    (id) => state.bookmarks.some((item) => item.id === id),
    [state.bookmarks],
  );

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const restoreProgress = useCallback((backup) => {
    const next = applyBackup(backup);
    setState(next);
    const result = saveState(next);
    setPersistError(result.ok ? null : result.reason);
    setTheme(loadTheme());
  }, []);

  const value = useMemo(
    () => ({
      state,
      persistError,
      persistHint: persistMessage(persistError),
      view,
      theme,
      go,
      patch,
      earn,
      completeLesson,
      completeQuiz,
      completeExam,
      completeExercise,
      completeTrackLesson,
      completeTrackPractice,
      toggleBookmark,
      isBookmarked,
      toggleTheme,
      restoreProgress,
      level: levelFromXp(state.xp),
    }),
    [
      state,
      persistError,
      view,
      theme,
      go,
      patch,
      earn,
      completeLesson,
      completeQuiz,
      completeExam,
      completeExercise,
      completeTrackLesson,
      completeTrackPractice,
      toggleBookmark,
      isBookmarked,
      toggleTheme,
      restoreProgress,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}

