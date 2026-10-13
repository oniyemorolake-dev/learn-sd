import ScreenHeader from '../components/ScreenHeader.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import Footer from '../components/Footer.jsx';
import CourseLabel from '../components/CourseLabel.jsx';
import { useApp } from '../context/AppContext.jsx';
import { flattenTopics, isTopicComplete } from '../lib/content.js';
import { shiftStamp, todayStamp, xpIntoLevel } from '../lib/storage.js';

export default function ProgressScreen() {
  const { state, go, level } = useApp();
  const topics = flattenTopics();
  const done = topics.filter((item) => isTopicComplete(item.topicId, state)).length;
  const byCourse = [];
  for (const item of topics) {
    let group = byCourse.find((entry) => entry.course.id === item.course.id);
    if (!group) {
      group = { course: item.course, total: 0, complete: 0 };
      byCourse.push(group);
    }
    group.total += 1;
    if (isTopicComplete(item.topicId, state)) group.complete += 1;
  }
  const today = todayStamp();
  const days = Array.from({ length: 14 }, (_, i) => shiftStamp(today, i - 13));

  return (
    <div className="stack">
      <ScreenHeader title="Progress" kicker="Keep going" />

      <section className="card">
        <p className="kicker">Level {level}</p>
        <h2 style={{ margin: '4px 0 12px' }}>{state.xp} XP</h2>
        <ProgressBar value={xpIntoLevel(state.xp)} max={50} />
        <p className="muted">{50 - xpIntoLevel(state.xp)} XP to the next level</p>
      </section>

      <section className="card">
        <div className="streak-chip">
          <span aria-hidden="true">🔥</span> {state.streak.count} day streak
        </div>
        <p className="muted">Show up once a day. That is the whole game.</p>
        <div className="calendar" style={{ marginTop: 12 }} aria-label="Last 14 days">
          {days.map((day) => (
            <div key={day} className={`day ${state.streak.days[day] ? 'lit' : ''}`} title={day}>
              {Number(day.slice(-2))}
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <p className="kicker">Topics</p>
        <h2 style={{ margin: '4px 0' }}>
          {done} completed
        </h2>
        <p className="muted">{topics.length} on the full path. Content-ready topics unlock first.</p>
      </section>

      <section className="stack">
        <p className="kicker">By course</p>
        {byCourse.map((group) => (
          <div key={group.course.id} className="list-row">
            <CourseLabel course={group.course} />
            <span className={`badge ${group.complete === group.total ? 'done' : ''}`}>
              {group.complete}/{group.total}
            </span>
          </div>
        ))}
      </section>

      <button type="button" className="list-row" onClick={() => go('bookmarks')}>
        <span>
          <strong>Bookmarks</strong>
          <div className="muted">{state.bookmarks.length} saved</div>
        </span>
        <span className="badge">Open</span>
      </button>
      <Footer />
    </div>
  );
}
