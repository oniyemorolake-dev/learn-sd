import ScreenHeader from '../components/ScreenHeader.jsx';
import CourseLabel from '../components/CourseLabel.jsx';
import ReviewDue from '../components/ReviewDue.jsx';
import ProgressBadge from '../components/ProgressBadge.jsx';
import { useApp } from '../context/AppContext.jsx';
import { continueTopicId, courses, getNodeState, topicTitle } from '../lib/content.js';
import { focusTopicIds } from '../lib/focus.js';

function nodeGlyph(nodeState) {
  if (nodeState === 'completed') return '✓';
  if (nodeState === 'started') return '◐';
  if (nodeState === 'soon') return '…';
  return '▶';
}

export default function PathScreen() {
  const { state, go, persistHint } = useApp();
  const focusIds = focusTopicIds(state.attempts);
  const continueId = continueTopicId(state);
  const recent = (state.recent || []).slice(0, 5);

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
      <p className="lede">Jump to what you are learning now. Come back to the rest whenever you like.</p>
      {persistHint ? (
        <div className="feedback" role="status">
          {persistHint}
        </div>
      ) : null}

      <div className="stack">
        {continueId ? (
          <button type="button" className="track-entry" onClick={() => go('topic', { topicId: continueId })}>
            <span>
              <strong>Continue</strong>
              <div className="muted">{topicTitle(continueId)}</div>
            </span>
            <ProgressBadge topicId={continueId} />
          </button>
        ) : null}

        {recent.length ? (
          <section className="stack">
            <p className="kicker">Recently viewed</p>
            {recent.map((item) => (
              <button
                key={item.topicId}
                type="button"
                className="list-row"
                onClick={() => go('topic', { topicId: item.topicId })}
              >
                <span>
                  <strong>{topicTitle(item.topicId)}</strong>
                </span>
                <ProgressBadge topicId={item.topicId} />
              </button>
            ))}
          </section>
        ) : null}
      </div>

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
                    const needsLook = focusIds.has(topicId);
                    const glowing = topicId === continueId && nodeState !== 'completed';
                    return (
                      <div className="node-row" key={topicId}>
                        <button
                          type="button"
                          className={`node ${nodeState}${glowing ? ' current' : ''}`}
                          onClick={() => go('topic', { topicId })}
                          aria-label={`${topicTitle(topicId)}, ${nodeState === 'started' ? 'in progress' : nodeState}${needsLook ? ', could use another look' : ''}`}
                        >
                          {nodeGlyph(nodeState)}
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
