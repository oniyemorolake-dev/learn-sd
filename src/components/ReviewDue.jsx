import { useState } from 'react';
import CourseLabel from './CourseLabel.jsx';
import { dueLabel, dueReviews } from '../lib/review.js';
import { findTopic, interviewPrepTrack, topicTitle } from '../lib/content.js';

const VISIBLE_CAP = 5;

function reviewCourse(topicId) {
  const found = findTopic(topicId);
  if (found?.course) return found.course;
  if (topicId === 'interview-prep-quiz') {
    return { displayName: interviewPrepTrack.title, code: '' };
  }
  return null;
}

export default function ReviewDue({ reviews, onReview }) {
  const [showAll, setShowAll] = useState(false);
  const due = dueReviews(reviews);
  const visible = showAll ? due : due.slice(0, VISIBLE_CAP);

  if (due.length === 0) {
    return (
      <div className="review-caught-up">
        <p className="review-caught-up-line">All caught up — nice.</p>
        <p className="muted">Byte says: nothing to juggle today. Come back when a card pops up.</p>
      </div>
    );
  }

  return (
    <section className="review-due">
      <p className="kicker">Review due</p>
      <p className="muted" style={{ marginTop: 0 }}>
        A short quiz. One tap. No guilt.
      </p>
      {visible.map((item) => {
        const course = reviewCourse(item.topicId);
        return (
          <div key={item.topicId} className="review-row">
            <div>
              <strong>{topicTitle(item.topicId)}</strong>
              {course?.code && course.code !== 'Track' ? (
                <CourseLabel course={course} />
              ) : course ? (
                <div className="muted">{course.displayName}</div>
              ) : null}
              <div className="muted">{dueLabel(item.nextReview)}</div>
            </div>
            <button type="button" className="btn-secondary review-btn" onClick={() => onReview(item.topicId)}>
              Review
            </button>
          </div>
        );
      })}
      {due.length > VISIBLE_CAP && !showAll ? (
        <button type="button" className="btn-secondary" onClick={() => setShowAll(true)}>
          Show all {due.length}
        </button>
      ) : null}
    </section>
  );
}
