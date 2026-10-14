import { courseDisplayName, findTopic, interviewPrepTrack, quizzes, topicTitle } from './content.js';
import { prepareQuizQuestions } from './quiz.js';
import { shuffle } from './shuffle.js';

export const EXAM_LENGTHS = [10, 20, 30];
export const EXAM_TIMERS = [
  { label: 'Off', minutes: 0 },
  { label: '15 min', minutes: 15 },
  { label: '30 min', minutes: 30 },
];
export const EXAM_SESSION_KEY = 'learn-sd-exam-session';

export function examQuestionKey(question) {
  return `${question.topicId}::${question.id}`;
}

export function examPool() {
  const pool = [];
  for (const [topicId, quiz] of Object.entries(quizzes)) {
    for (const question of quiz.questions || []) {
      if (!question?.id) continue;
      pool.push({ ...question, topicId });
    }
  }
  return pool;
}

export function pickExamQuestions(count, recentKeys = []) {
  const pool = examPool();
  const size = Math.min(Math.max(1, Number(count) || 10), pool.length);
  const recent = new Set(recentKeys);
  const fresh = pool.filter((question) => !recent.has(examQuestionKey(question)));
  const source = fresh.length >= size ? fresh : pool;
  const selected = shuffle(source).slice(0, size);
  return prepareQuizQuestions(selected).map((question) => ({
    ...question,
    picked: null,
    visited: false,
    touched: false,
  }));
}

export function isQuestionAnswered(question) {
  if (!question) return false;
  if (question.format === 'arrange-order') return Boolean(question.visited || question.touched);
  if (question.format === 'matching') {
    return (question.terms || []).every((term) => question.matches?.[term.i]);
  }
  return typeof question.picked === 'number';
}

export function isQuestionCorrect(question, picked = question?.picked) {
  if (!question) return false;
  if (question.format === 'arrange-order') {
    return (question.items || []).map((item) => item.originalIndex).join() === (question.answer || []).join();
  }
  if (question.format === 'matching') {
    return (question.terms || []).every((term) => question.matches?.[term.i] === term.definition);
  }
  return picked === question.answer;
}

export function examTopicGroup(topicId) {
  const found = findTopic(topicId);
  if (found?.course) return courseDisplayName(found.course);
  if (topicId === 'interview-prep-quiz') return interviewPrepTrack.title || 'Interview Prep';
  return 'Learn SD';
}

export function scoreExam(questions) {
  const byTopic = {};
  let correct = 0;
  const missed = [];
  for (const question of questions) {
    const ok = isQuestionAnswered(question) && isQuestionCorrect(question);
    if (ok) correct += 1;
    else missed.push(question);
    const topicId = question.topicId;
    if (!byTopic[topicId]) {
      byTopic[topicId] = {
        topicId,
        title: topicTitle(topicId),
        group: examTopicGroup(topicId),
        correct: 0,
        total: 0,
        wrongFormats: [],
      };
    }
    byTopic[topicId].total += 1;
    if (ok) byTopic[topicId].correct += 1;
    else byTopic[topicId].wrongFormats.push(question.format || 'multiple-choice');
  }
  return {
    correct,
    total: questions.length,
    percent: questions.length ? Math.round((correct / questions.length) * 100) : 0,
    byTopic: Object.values(byTopic).sort((a, b) => a.group.localeCompare(b.group) || a.title.localeCompare(b.title)),
    missed,
    questionKeys: questions.map(examQuestionKey),
  };
}

export function examXp(total) {
  if (total >= 30) return 50;
  if (total >= 20) return 35;
  return 20;
}

export function groupExamTopics(byTopic) {
  const groups = [];
  const seen = new Map();
  for (const item of byTopic) {
    let group = seen.get(item.group);
    if (!group) {
      group = { group: item.group, items: [] };
      seen.set(item.group, group);
      groups.push(group);
    }
    group.items.push(item);
  }
  return groups;
}

export function loadExamSession() {
  try {
    const raw = sessionStorage.getItem(EXAM_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveExamSession(session) {
  try {
    if (!session) sessionStorage.removeItem(EXAM_SESSION_KEY);
    else sessionStorage.setItem(EXAM_SESSION_KEY, JSON.stringify(session));
  } catch {
    // Private mode — exam still works in memory.
  }
}

export function formatCountdown(ms) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}
