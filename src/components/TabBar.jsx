import { useApp } from '../context/AppContext.jsx';
import { tabForView } from '../lib/nav.js';

const TABS = [
  { id: 'path', label: 'Path', view: 'path', icon: PathIcon },
  { id: 'practice', label: 'Practice', view: 'practice', icon: PracticeIcon },
  { id: 'code', label: 'Code', view: 'code-lab', icon: CodeIcon },
  { id: 'setup', label: 'Setup', view: 'setup', icon: SetupIcon },
  { id: 'progress', label: 'Progress', view: 'progress', icon: ProgressIcon },
];

export default function TabBar() {
  const { view, go } = useApp();
  const active = tabForView(view);

  return (
    <nav className="tab-bar" aria-label="Main">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`tab-btn ${active === tab.id ? 'active' : ''}`}
          onClick={() => go(tab.view)}
        >
          <tab.icon />
          {tab.label}
        </button>
      ))}
    </nav>
  );
}

function PathIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="5" r="2.2" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="2.2" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="19" r="2.2" stroke="currentColor" strokeWidth="2" />
      <path d="M12 7.2v2.6M12 14.2v2.6" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function PracticeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 7h14v12H5z" stroke="currentColor" strokeWidth="2" />
      <path d="M8 11h8M8 15h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CodeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M8 7L3 12l5 5M16 7l5 5-5 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SetupIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function ProgressIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 18V9l5 3 6-7 5 4v9z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}
