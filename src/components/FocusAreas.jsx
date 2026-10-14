import { useState } from 'react';
import { listFocusAreas } from '../lib/focus.js';
import { hasLesson, hasQuiz, topicTitle } from '../lib/content.js';

const VISIBLE_CAP = 5;

function studyTarget(topicId) {
  if (hasLesson(topicId)) return 'lesson';
  if (hasQuiz(topicId)) return 'quiz';
  return 'topic';
}

export default function FocusAreas({ attempts, onStudy }) {
  const [showAll, setShowAll] = useState(false);
  const areas = listFocusAreas(attempts);
  if (areas.length === 0) return null;

  const visible = showAll ? areas : areas.slice(0, VISIBLE_CAP);

  return (
    <section className="focus-areas">
      <p className="kicker">Focus areas</p>
      <p className="muted" style={{ marginTop: 0 }}>
        These could use another look. No rush — just a nudge.
      </p>
      {visible.map((item) => (
        <div key={item.topicId} className="focus-row">
          <div>
            <strong>{topicTitle(item.topicId)}</strong>
            <div className="muted">{item.reason}</div>
          </div>
          <button type="button" className="btn-secondary focus-btn" onClick={() => onStudy(item.topicId, studyTarget(item.topicId))}>
            Study
          </button>
        </div>
      ))}
      {areas.length > VISIBLE_CAP && !showAll ? (
        <button type="button" className="btn-secondary" onClick={() => setShowAll(true)}>
          Show all {areas.length}
        </button>
      ) : null}
    </section>
  );
}
