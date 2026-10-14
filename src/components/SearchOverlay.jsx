import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { codeLabTopicParams, courseDisplayName, findCodeLabTopic } from '../lib/content.js';
import { groupSearchResults, SEARCH_SUGGESTIONS, searchTopics } from '../lib/search.js';
import ProgressBadge from './ProgressBadge.jsx';

const SearchContext = createContext(null);

export function SearchProvider({ children }) {
  const [open, setOpen] = useState(false);
  const value = useMemo(
    () => ({
      searchOpen: open,
      openSearch: () => setOpen(true),
      closeSearch: () => setOpen(false),
    }),
    [open],
  );

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

export function SearchHost() {
  const { searchOpen } = useSearch();
  return searchOpen ? <SearchOverlay /> : null;
}

export function useSearch() {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error('useSearch must be used inside SearchProvider');
  return ctx;
}

function SearchOverlay() {
  const { go } = useApp();
  const { closeSearch } = useSearch();
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    function onKey(event) {
      if (event.key === 'Escape') closeSearch();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [closeSearch]);

  const results = useMemo(() => searchTopics(query), [query]);
  const groups = useMemo(() => groupSearchResults(results), [results]);
  const trimmed = query.trim();

  const openTopic = useCallback(
    (topicId) => {
      closeSearch();
      go('topic', findCodeLabTopic(topicId) ? codeLabTopicParams(topicId) : { topicId });
    },
    [closeSearch, go],
  );

  return (
    <div className="search-overlay" role="dialog" aria-modal="true" aria-label="Search topics">
      <div className="search-bar">
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Find a topic, lesson, or quiz"
          aria-label="Search topics"
        />
        <button type="button" className="icon-btn" onClick={closeSearch} aria-label="Close search">
          ×
        </button>
      </div>

      {!trimmed ? (
        <Suggestions onPick={setQuery} caption="Try a topic or course name." />
      ) : groups.length === 0 ? (
        <div className="search-empty">
          <p className="search-empty-line">No topics match — try &apos;recursion&apos; or &apos;SQL&apos;.</p>
          <Suggestions onPick={setQuery} />
        </div>
      ) : (
        <div className="search-results">
          {groups.map((group) => (
            <section key={group.course.id}>
              <p className="kicker">
                {courseDisplayName(group.course)}
                {group.course.code ? ` · ${group.course.code}` : ''}
              </p>
              {group.items.map((item) => (
                  <button
                    key={item.topicId}
                    type="button"
                    className="list-row search-row"
                    onClick={() => openTopic(item.topicId)}
                  >
                    <span>
                      <strong>{item.title}</strong>
                      <div className="muted">{courseDisplayName(item.course)}</div>
                    </span>
                    <ProgressBadge topicId={item.topicId} />
                  </button>
              ))}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function Suggestions({ onPick, caption }) {
  return (
    <div className="search-suggestions">
      {caption ? <p className="muted">{caption}</p> : null}
      <div className="search-chips">
        {SEARCH_SUGGESTIONS.map((hint) => (
          <button key={hint} type="button" className="search-chip" onClick={() => onPick(hint)}>
            {hint}
          </button>
        ))}
      </div>
    </div>
  );
}
