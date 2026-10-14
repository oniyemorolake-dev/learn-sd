import { useSearch } from './SearchOverlay.jsx';

export default function SearchButton() {
  const { openSearch } = useSearch();
  return (
    <button type="button" className="icon-btn" onClick={openSearch} aria-label="Search topics" title="Search">
      <SearchIcon />
    </button>
  );
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="2" />
      <path d="M16 16l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
