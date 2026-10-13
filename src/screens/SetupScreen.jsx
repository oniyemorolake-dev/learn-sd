import ScreenHeader from '../components/ScreenHeader.jsx';
import Footer from '../components/Footer.jsx';
import { useApp } from '../context/AppContext.jsx';
import CourseLabel from '../components/CourseLabel.jsx';
import { findCourseByCode, orderedSetupGuides } from '../lib/content.js';

export default function SetupScreen() {
  const { go } = useApp();
  const guides = orderedSetupGuides();

  return (
    <div className="stack">
      <ScreenHeader title="Get set up" kicker="Environment" />
      <p className="lede">Short checklists. One command at a time. No extra noise.</p>

      <button type="button" className="track-entry" onClick={() => go('ai-track', { from: 'setup' })}>
        <span>
          <strong>AI Prompting</strong>
          <div className="muted">Lessons + practice on briefing a coding assistant.</div>
        </span>
        <span className="badge">Track</span>
      </button>

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
      <Footer />
    </div>
  );
}
