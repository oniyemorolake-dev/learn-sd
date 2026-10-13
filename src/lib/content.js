import courses from '../content/courses.json';
import aiPromptingTrack from '../content/tracks/ai-prompting.json';

const lessonModules = import.meta.glob('../content/lessons/*.json', {
  eager: true,
  import: 'default',
});
const quizModules = import.meta.glob('../content/quizzes/*.json', {
  eager: true,
  import: 'default',
});
const exerciseModules = import.meta.glob('../content/exercises/*.json', {
  eager: true,
  import: 'default',
});
const setupModules = import.meta.glob('../content/setup/*.json', {
  eager: true,
  import: 'default',
});

function byFileName(modules) {
  const map = {};
  for (const [path, data] of Object.entries(modules)) {
    const id = path.split('/').pop().replace('.json', '');
    map[id] = data;
  }
  return map;
}

export const lessons = byFileName(lessonModules);
export const quizzes = byFileName(quizModules);
export const exercises = byFileName(exerciseModules);
export const setupGuides = byFileName(setupModules);

export { courses, aiPromptingTrack };

export function courseDisplayName(course) {
  if (!course) return '';
  return course.displayName || course.title || course.code || '';
}

export function findCourseByCode(code) {
  if (!code) return null;
  for (const semester of courses.semesters) {
    for (const course of semester.courses) {
      if (course.code === code || course.id === code) return course;
    }
  }
  return null;
}

const TITLE_TWEAKS = {
  'arrays-strings': 'Arrays & Strings',
  'functions-scope': 'Functions & Scope',
  'js-on-the-page': 'JavaScript on the page',
  'css-styling': 'CSS styling',
  'html-pages': 'HTML pages',
  'sql-queries': 'SQL queries',
  'sql-inside-code': 'SQL inside code',
};

export function humanizeId(id) {
  if (TITLE_TWEAKS[id]) return TITLE_TWEAKS[id];
  const spaced = id.replace(/-/g, ' ');
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

export function topicTitle(topicId) {
  return lessons[topicId]?.title || quizzes[topicId]?.title || humanizeId(topicId);
}

export function topicDescription(topicId) {
  return lessons[topicId]?.description || quizzes[topicId]?.description || '';
}

export function hasLesson(topicId) {
  return Boolean(lessons[topicId]);
}

export function hasQuiz(topicId) {
  return Boolean(quizzes[topicId]);
}

export function hasExercises(topicId) {
  return Boolean(exercises[topicId]?.exercises?.length);
}

export function hasTopicContent(topicId) {
  return hasLesson(topicId) || hasQuiz(topicId);
}

export function flattenTopics() {
  const list = [];
  for (const semester of courses.semesters) {
    for (const course of semester.courses) {
      for (const topicId of course.topics) {
        list.push({ topicId, course, semester });
      }
    }
  }
  return list;
}

export function findTopic(topicId) {
  return flattenTopics().find((item) => item.topicId === topicId) || null;
}

export function isTopicComplete(topicId, state) {
  if (!hasTopicContent(topicId)) return false;
  if (hasLesson(topicId) && !state.lessons[topicId]?.completed) return false;
  if (hasQuiz(topicId) && !state.quizzes[topicId]?.completed) return false;
  return true;
}

export function getNodeState(topicId, state) {
  if (isTopicComplete(topicId, state)) return 'completed';

  const ordered = flattenTopics();
  const firstOpenIndex = ordered.findIndex(
    (item) => hasTopicContent(item.topicId) && !isTopicComplete(item.topicId, state),
  );
  const index = ordered.findIndex((item) => item.topicId === topicId);

  if (firstOpenIndex === -1) {
    return hasTopicContent(topicId) ? 'completed' : 'soon';
  }
  if (index > firstOpenIndex) return 'locked';
  if (!hasTopicContent(topicId)) return 'soon';
  return 'current';
}

export const SETUP_ORDER = [
  'vscode-cursor',
  'terminal',
  'first-file',
  'nodejs',
  'python',
  'git',
  'jdk',
  'cprg-213',
];

export function orderedSetupGuides() {
  const remaining = { ...setupGuides };
  const ordered = [];
  for (const id of SETUP_ORDER) {
    if (remaining[id]) {
      ordered.push(remaining[id]);
      delete remaining[id];
    }
  }
  ordered.push(...Object.values(remaining));
  return ordered;
}

function screensToText(title, description, screens) {
  const body = (screens || [])
    .map((screen) => {
      const parts = [screen.heading, screen.body, screen.keyPoint];
      if (screen.code?.snippet) parts.push(screen.code.snippet);
      return parts.filter(Boolean).join('\n');
    })
    .join('\n\n');
  return `Topic: ${title}\n${description || ''}\n\n${body}`;
}

export function findAiLesson(lessonId) {
  return aiPromptingTrack.lessons.find((item) => item.id === lessonId) || null;
}

export function findAiPractice(practiceId) {
  return aiPromptingTrack.practice.find((item) => item.id === practiceId) || null;
}

export function lessonContextText(topicId) {
  const lesson = lessons[topicId];
  if (!lesson) return '';
  return screensToText(lesson.title, lesson.description, lesson.screens);
}

export function aiLessonContextText(lessonId) {
  const lesson = findAiLesson(lessonId);
  if (!lesson) return '';
  return screensToText(lesson.title, lesson.description, lesson.screens);
}
