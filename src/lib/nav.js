import { findCodeLabTopic } from './content.js';

export function tabForView(view) {
  const name = typeof view === 'string' ? view : view?.name;
  const params = typeof view === 'object' && view ? view.params || {} : {};

  if (['code-lab', 'code-language'].includes(name)) return 'code';
  if (params.from === 'code-lab') return 'code';
  if (
    params.topicId &&
    findCodeLabTopic(params.topicId) &&
    params.from !== 'review' &&
    params.from !== 'focus'
  ) {
    return 'code';
  }

  if (['practice', 'exercise', 'playground', 'exam-setup', 'exam'].includes(name)) return 'practice';
  if (['setup', 'guide', 'ai-track', 'ai-lesson', 'ai-practice', 'interview-track'].includes(name)) {
    return 'setup';
  }
  if (['progress', 'bookmarks'].includes(name)) return 'progress';
  return 'path';
}
