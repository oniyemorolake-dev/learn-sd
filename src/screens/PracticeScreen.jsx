import ScreenHeader from '../components/ScreenHeader.jsx';
import CourseLabel from '../components/CourseLabel.jsx';
import { useApp } from '../context/AppContext.jsx';
import { exercises, flattenTopics, topicTitle } from '../lib/content.js';

export default function PracticeScreen() {
  const { go, state } = useApp();
  const topics = flattenTopics().filter((item) => exercises[item.topicId]);

  return (
    <div className="stack">
      <ScreenHeader title="Practice" kicker="Hands-on" />
      <p className="lede">Run real code. Compare it to the expected output.</p>

      <button type="button" className="track-entry" onClick={() => go('exam-setup')}>
        <span>
          <strong>Mock Exam</strong>
          <div className="muted">A mixed exam from every quiz you have. 10, 20, or 30 questions.</div>
        </span>
        <span className="badge">Exam</span>
      </button>

      <button type="button" className="list-row" onClick={() => go('playground')}>
        <span>
          <strong>Code Playground</strong>
          <div className="muted">JavaScript now. Python loads when you need it.</div>
        </span>
        <span className="badge">Open</span>
      </button>

      <div className="card-grid">
        {topics.map((item) => {
          const list = exercises[item.topicId].exercises;
          const done = list.filter((ex) => state.exercises[ex.id]).length;
          return (
            <button
              key={item.topicId}
              type="button"
              className="list-row"
              onClick={() => go('exercise', { topicId: item.topicId })}
            >
              <span>
                <strong>{topicTitle(item.topicId)}</strong>
                <CourseLabel course={item.course} />
              </span>
              <span className={`badge ${done === list.length ? 'done' : ''}`}>
                {done}/{list.length}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
