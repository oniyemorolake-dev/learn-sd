export function tabForView(name) {
  if (['practice', 'exercise', 'playground'].includes(name)) return 'practice';
  if (['setup', 'guide', 'ai-track', 'ai-lesson', 'ai-practice'].includes(name)) return 'setup';
  if (['progress', 'bookmarks'].includes(name)) return 'progress';
  return 'path';
}
