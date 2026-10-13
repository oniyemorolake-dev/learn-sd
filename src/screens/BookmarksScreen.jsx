import ScreenHeader from '../components/ScreenHeader.jsx';
import { useApp } from '../context/AppContext.jsx';

export default function BookmarksScreen() {
  const { state, go, toggleBookmark } = useApp();

  return (
    <div className="stack">
      <ScreenHeader title="Bookmarks" kicker="Saved for later" onBack={() => go('progress')} />
      {state.bookmarks.length === 0 ? (
        <div className="card empty">
          <p>Nothing saved yet. Tap the star on a lesson or quiz question.</p>
        </div>
      ) : (
        state.bookmarks.map((item) => (
          <div key={item.id} className="list-row" style={{ alignItems: 'flex-start' }}>
            <button
              type="button"
              onClick={() =>
                go(item.type === 'question' ? 'quiz' : 'lesson', { topicId: item.topicId })
              }
              style={{ background: 'none', border: 0, textAlign: 'left', flex: 1, padding: 0 }}
            >
              <strong>{item.title}</strong>
              <div className="muted">{item.type === 'question' ? 'Quiz question' : 'Lesson'}</div>
            </button>
            <button
              type="button"
              className="icon-btn"
              aria-label="Remove bookmark"
              onClick={() => toggleBookmark(item)}
            >
              ★
            </button>
          </div>
        ))
      )}
    </div>
  );
}
