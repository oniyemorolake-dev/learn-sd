import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  addXp,
  applyTheme,
  levelFromXp,
  loadState,
  loadTheme,
  saveState,
  saveTheme,
  todayStamp,
  touchStreak,
} from '../lib/storage';
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
  const [state, setState] = useState(loadState);
  const [view, setView] = useState(loadView);
  const [theme, setTheme] = useState(loadTheme);

  useEffect(() => {
    saveState(state);
  }, [state]);

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
    setState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      return next;
    });
  }, []);

  const earn = useCallback((amount) => {
    setState((prev) => addXp(touchStreak(prev), amount));
  }, []);

  const completeLesson = useCallback((topicId, checkInCorrect) => {
    setState((prev) => {
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
  }, []);

  const completeQuiz = useCallback((topicId, score, total, wrongFormats = []) => {
    setState((prev) => {
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
  }, []);

  const completeTrackLesson = useCallback((trackId, lessonId) => {
    setState((prev) => {
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
  }, []);

  const completeTrackPractice = useCallback((trackId, practiceId) => {
    setState((prev) => {
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
  }, []);

  const completeExercise = useCallback((exerciseId) => {
    setState((prev) => {
      if (prev.exercises[exerciseId]) return touchStreak(prev);
      return addXp(
        touchStreak({
          ...prev,
          exercises: { ...prev.exercises, [exerciseId]: { at: todayStamp() } },
        }),
        10,
      );
    });
  }, []);

  const toggleBookmark = useCallback((entry) => {
    setState((prev) => {
      const exists = prev.bookmarks.find((item) => item.id === entry.id);
      return {
        ...prev,
        bookmarks: exists
          ? prev.bookmarks.filter((item) => item.id !== entry.id)
          : [{ ...entry, savedAt: Date.now() }, ...prev.bookmarks],
      };
    });
  }, []);

  const isBookmarked = useCallback(
    (id) => state.bookmarks.some((item) => item.id === id),
    [state.bookmarks],
  );

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const value = useMemo(
    () => ({
      state,
      view,
      theme,
      go,
      patch,
      earn,
      completeLesson,
      completeQuiz,
      completeExercise,
      completeTrackLesson,
      completeTrackPractice,
      toggleBookmark,
      isBookmarked,
      toggleTheme,
      level: levelFromXp(state.xp),
    }),
    [
      state,
      view,
      theme,
      go,
      patch,
      earn,
      completeLesson,
      completeQuiz,
      completeExercise,
      completeTrackLesson,
      completeTrackPractice,
      toggleBookmark,
      isBookmarked,
      toggleTheme,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}

