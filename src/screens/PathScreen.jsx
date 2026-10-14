import ScreenHeader from '../components/ScreenHeader.jsx';
import CourseLabel from '../components/CourseLabel.jsx';
import ReviewDue from '../components/ReviewDue.jsx';
import { useApp } from '../context/AppContext.jsx';
import { courses, getNodeState, topicTitle } from '../lib/content.js';
import { focusTopicIds } from '../lib/focus.js';

export default function PathScreen() {
  const { state, go, persistHint } = useApp();
  const focusIds = focusTopicIds(state.attempts);

  return (
    <div>
      <ScreenHeader
        title="Your path"
        kicker="Learn SD"
        extra={
          <div className="streak-chip" title="Daily streak">
            <span aria-hidden="true">🔥</span> {state.streak.count}
          </div>
        }
      />
      <p className="lede">One topic at a time. Follow the glowing node.</p>
      {persistHint ? (
        <div className="feedback" role="status">
          {persistHint}
        </div>
      ) : null}

      <ReviewDue
        reviews={state.reviews}
        onReview={(topicId) => go('quiz', { topicId, from: 'review', returnTo: 'path' })}
      />

      <button type="button" className="track-entry" onClick={() => go('ai-track', { from: 'path' })}>
        <span>
          <strong>AI Prompting</strong>
          <div className="muted">How to brief a coding assistant so it actually helps.</div>
        </span>
        <span className="badge">Track</span>
      </button>

      <button type="button" className="track-entry" onClick={() => go('interview-track', { from: 'path' })}>
        <span>
          <strong>Interview Prep</strong>
          <div className="muted">Talk through problems, then solve 12 JS warmups.</div>
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
                    const needsLook = focusIds.has(topicId);
                    return (
                      <div className="node-row" key={topicId}>
                        <button
                          type="button"
                          className={`node ${nodeState}`}
                          disabled={locked}
                          onClick={() => go('topic', { topicId })}
                          aria-label={`${topicTitle(topicId)}, ${nodeState}${needsLook ? ', could use another look' : ''}`}
                        >
                          {nodeState === 'completed' ? '✓' : nodeState === 'locked' ? '🔒' : nodeState === 'soon' ? '…' : '▶'}
                          {needsLook ? <span className="node-focus-dot" aria-hidden="true" /> : null}
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
    </div>
  );
}
