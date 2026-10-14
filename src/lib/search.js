import {
  courseDisplayName,
  flattenTopics,
  isTopicComplete,
  lessons,
  quizzes,
  topicDescription,
  topicTitle,
} from './content.js';

export const SEARCH_SUGGESTIONS = ['recursion', 'SQL', 'security'];

function buildSearchIndex() {
  return flattenTopics().map(({ topicId, course }) => {
    const title = topicTitle(topicId);
    const description = topicDescription(topicId);
    const lessonTitle = lessons[topicId]?.title || '';
    const quizTitle = quizzes[topicId]?.title || '';
    const courseName = courseDisplayName(course);
    const haystack = [title, lessonTitle, quizTitle, description, courseName, course.code, course.id, topicId]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return { topicId, title, description, course, haystack };
  });
}

export const SEARCH_INDEX = buildSearchIndex();

export function searchTopics(query, index = SEARCH_INDEX) {
  const q = String(query || '')
    .trim()
    .toLowerCase();
  if (!q) return [];
  return index.filter((item) => item.haystack.includes(q));
}

export function groupSearchResults(results) {
  const groups = [];
  const seen = new Map();
  for (const item of results) {
    const id = item.course.id;
    let group = seen.get(id);
    if (!group) {
      group = { course: item.course, items: [] };
      seen.set(id, group);
      groups.push(group);
    }
    group.items.push(item);
  }
  return groups;
}

export function topicProgressLabel(topicId, state) {
  if (isTopicComplete(topicId, state)) return 'done';
  if (state?.lessons?.[topicId] || state?.quizzes?.[topicId]) {
    return 'in progress';
  }
  return 'not started';
}
