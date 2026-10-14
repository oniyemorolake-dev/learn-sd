import ScreenHeader from '../components/ScreenHeader.jsx';
import { useApp } from '../context/AppContext.jsx';
import CourseLabel from '../components/CourseLabel.jsx';
import { findCourseByCode, orderedSetupGuides } from '../lib/content.js';
import { formatBuildLabel, reloadApp } from '../lib/version.js';

export default function SetupScreen() {
  const { go } = useApp();
  const guides = orderedSetupGuides();

  return (
    <div className="stack">
      <ScreenHeader
        title="Get set up"
        kicker="Environment"
        extra={
          <button type="button" className="icon-btn" aria-label="Reload app" onClick={reloadApp}>
            ↻
          </button>
        }
      />
      <p className="lede">Short checklists. One command at a time. No extra noise.</p>

      <button type="button" className="track-entry" onClick={() => go('ai-track', { from: 'setup' })}>
        <span>
          <strong>AI Prompting</strong>
          <div className="muted">Lessons + practice on briefing a coding assistant.</div>
        </span>
        <span className="badge">Track</span>
      </button>

      <button type="button" className="track-entry" onClick={() => go('interview-track', { from: 'setup' })}>
        <span>
          <strong>Interview Prep</strong>
          <div className="muted">Lessons, a rapid-fire quiz, and 12 JS problems.</div>
        </span>
        <span className="badge">Track</span>
      </button>

      <div className="card-grid">
        {guides.map((guide) => {
          const course = findCourseByCode(guide.forCourse);
          return (
            <button
              key={guide.id}
              type="button"
              className="list-row"
              onClick={() => go('guide', { guideId: guide.id })}
            >
              <span>
                <strong>{guide.title}</strong>
                {course ? (
                  <CourseLabel course={course} />
                ) : (
                  <div className="muted">Everyone</div>
                )}
                <div className="muted">{guide.steps.length} steps</div>
              </span>
              <span className="badge">Open</span>
            </button>
          );
        })}
      </div>

      <section className="card">
        <p className="kicker">This device</p>
        <p className="muted" style={{ marginTop: 0 }}>
          Home-screen apps hide the browser refresh button. Use this if a lesson looks stuck.
        </p>
        <button type="button" className="btn-secondary" onClick={reloadApp}>
          Reload app
        </button>
        <p className="muted setup-build">{formatBuildLabel()}</p>
      </section>
    </div>
  );
}
