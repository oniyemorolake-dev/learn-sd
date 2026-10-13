import ScreenHeader from '../components/ScreenHeader.jsx';
import Footer from '../components/Footer.jsx';
import { useApp } from '../context/AppContext.jsx';
import { aiPromptingTrack } from '../lib/content.js';

export default function AiTrackScreen() {
  const { go, view, state } = useApp();
  const track = aiPromptingTrack;
  const progress = { lessons: {}, practice: {}, ...state.tracks?.[track.id] };
  const backTo = view.params?.from === 'setup' ? 'setup' : 'path';

  return (
    <div className="stack">
      <ScreenHeader title={track.title} kicker="Standalone track" onBack={() => go(backTo)} />
      <p className="lede">{track.description}</p>

      <p className="kicker">Lessons</p>
      {track.lessons.map((lesson, i) => {
        const done = Boolean(progress.lessons?.[lesson.id]?.completed);
        return (
          <button
            key={lesson.id}
            type="button"
            className="list-row"
            onClick={() => go('ai-lesson', { lessonId: lesson.id, from: view.params?.from })}
          >
            <span>
              <strong>
                {i + 1}. {lesson.title}
              </strong>
              <div className="muted">{lesson.description}</div>
            </span>
            <span className={`badge ${done ? 'done' : ''}`}>{done ? 'Done' : 'Start'}</span>
          </button>
        );
      })}

      <p className="kicker">Practice</p>
      {track.practice.map((item) => {
        const done = Boolean(progress.practice?.[item.id]?.completed);
        return (
          <button
            key={item.id}
            type="button"
            className="list-row"
            onClick={() => go('ai-practice', { practiceId: item.id, from: view.params?.from })}
          >
            <span>
              <strong>{item.task}</strong>
              <div className="muted">Write a prompt, then compare</div>
            </span>
            <span className={`badge ${done ? 'done' : ''}`}>{done ? 'Done' : 'Try'}</span>
          </button>
        );
      })}
      <Footer />
    </div>
  );
}
