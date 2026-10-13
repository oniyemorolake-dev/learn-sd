import Footer from '../components/Footer.jsx';
import CourseLabel from '../components/CourseLabel.jsx';
import { useApp } from '../context/AppContext.jsx';
import { courses, getNodeState, topicTitle } from '../lib/content.js';

export default function PathScreen() {
  const { state, go } = useApp();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p className="kicker">Learn SD</p>
          <h1>Your path</h1>
          <p className="lede">One topic at a time. Follow the glowing node.</p>
        </div>
        <div className="streak-chip" title="Daily streak">
          <span aria-hidden="true">🔥</span> {state.streak.count}
        </div>
      </div>

      <button type="button" className="track-entry" onClick={() => go('ai-track', { from: 'path' })}>
        <span>
          <strong>AI Prompting</strong>
          <div className="muted">How to brief a coding assistant so it actually helps.</div>
        </span>
        <span className="badge">Track</span>
      </button>

      <div className="path-wrap">
        {courses.semesters.map((semester) => (
          <section key={semester.id} className="semester-block">
            <p className="kicker">{semester.label}</p>
            {semester.courses.map((course) => (
              <div key={course.id}>
                <div className="course-label">
                  <CourseLabel course={course} />
                </div>
                <div className="path-list">
                  {course.topics.map((topicId) => {
                    const nodeState = getNodeState(topicId, state);
                    const locked = nodeState === 'locked';
                    return (
                      <div className="node-row" key={topicId}>
                        <button
                          type="button"
                          className={`node ${nodeState}`}
                          disabled={locked}
                          onClick={() => go('topic', { topicId })}
                          aria-label={`${topicTitle(topicId)}, ${nodeState}`}
                        >
                          {nodeState === 'completed' ? '✓' : nodeState === 'locked' ? '🔒' : nodeState === 'soon' ? '…' : '▶'}
                          <span className="node-caption">{topicTitle(topicId)}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </section>
        ))}
      </div>
      <Footer />
    </div>
  );
}
