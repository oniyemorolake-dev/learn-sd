import CourseLabel from './CourseLabel.jsx';

export default function ScreenHeader({ title, kicker, course, onBack, extra }) {
  return (
    <header className="screen-header">
      {onBack ? (
        <button type="button" className="icon-btn" onClick={onBack} aria-label="Back">
          ←
        </button>
      ) : null}
      <div style={{ flex: 1 }}>
        {course ? <CourseLabel course={course} /> : kicker ? <p className="kicker">{kicker}</p> : null}
        <h1>{title}</h1>
      </div>
      {extra}
    </header>
  );
}
