import { topicProgress } from '../lib/content.js';
import { useApp } from '../context/AppContext.jsx';

export function badgeClass(label) {
  if (label === 'done') return 'badge done';
  if (label === 'in progress') return 'badge started';
  return 'badge';
}

export default function ProgressBadge({ topicId }) {
  const { state } = useApp();
  const label = topicProgress(topicId, state);
  return <span className={badgeClass(label)}>{label}</span>;
}
