import { useEffect, useRef, useState } from 'react';
import ScreenHeader from '../components/ScreenHeader.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import PrimaryButton from '../components/PrimaryButton.jsx';
import QuestionCard from '../components/QuestionCard.jsx';
import { useApp } from '../context/AppContext.jsx';
import { hasLesson, hasQuiz } from '../lib/content.js';
import {
  examXp,
  formatCountdown,
  groupExamTopics,
  isQuestionAnswered,
  loadExamSession,
  saveExamSession,
  scoreExam,
} from '../lib/exam.js';

export default function ExamScreen() {
  const { go, completeExam } = useApp();
  const [session, setSession] = useState(() => loadExamSession());
  const [now, setNow] = useState(Date.now());
  const [confirmFinish, setConfirmFinish] = useState(false);
  const [reviewId, setReviewId] = useState(null);
  const submitted = useRef(false);

  useEffect(() => {
    if (!session) go('exam-setup');
  }, [session, go]);

  useEffect(() => {
    if (!session || session.finished || !session.deadline) return undefined;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [session]);

  function persist(next) {
    setSession(next);
    saveExamSession(next);
  }

  function patchCurrent(partial, current = session) {
    const questions = current.questions.map((item, i) =>
      i === current.index ? { ...item, ...partial } : item,
    );
    const next = { ...current, questions };
    persist(next);
    return next;
  }

  function finish(current = session, auto = false) {
    if (!current || submitted.current || current.finished) return;
    submitted.current = true;
    const questions = current.questions.map((item, i) =>
      i === current.index ? { ...item, visited: true } : item,
    );
    const scored = scoreExam(questions);
    persist({ ...current, questions, finished: true, scored, auto });
    completeExam({
      byTopic: scored.byTopic,
      questionKeys: scored.questionKeys,
      xp: examXp(scored.total),
    });
  }

  useEffect(() => {
    if (!session?.deadline || session.finished) return;
    if (session.deadline - now <= 0) finish(session, true);
  }, [now, session]);

  if (!session?.questions?.length) return null;

  if (session.finished && session.scored) {
    return (
      <ExamResults
        scored={session.scored}
        auto={session.auto}
        reviewId={reviewId}
        setReviewId={setReviewId}
        onRetake={() => {
          saveExamSession(null);
          go('exam-setup');
        }}
        onWeak={() => go('progress')}
        onStudy={(topicId) => {
          const screen = hasLesson(topicId) ? 'lesson' : hasQuiz(topicId) ? 'quiz' : 'topic';
          go(screen, { topicId, from: 'focus', returnTo: 'practice' });
        }}
      />
    );
  }

  const question = session.questions[session.index];
  const remaining = session.deadline ? session.deadline - now : null;
  const unanswered = session.questions.filter((item) => !isQuestionAnswered(item)).length;

  function goTo(nextIndex) {
    const marked = patchCurrent({ visited: true });
    persist({ ...marked, index: nextIndex });
    setConfirmFinish(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="stack">
      <ScreenHeader
        title="Mock Exam"
        kicker={`Question ${session.index + 1} of ${session.questions.length}`}
        onBack={() => go('exam-setup')}
        extra={
          remaining !== null ? (
            <span className={`exam-timer ${remaining <= 60_000 ? 'low' : ''}`}>
              {formatCountdown(remaining)}
            </span>
          ) : null
        }
      />
      {session.deadline ? (
        <p className="muted" style={{ marginTop: 0 }}>
          Timer keeps going if you leave this tab.
        </p>
      ) : null}
      <ProgressBar value={session.index} max={session.questions.length} />
      <QuestionCard
        question={question}
        picked={question.picked}
        setPicked={(picked) => patchCurrent({ picked })}
        revealed={false}
        onMoveItems={(items) => patchCurrent({ items, touched: true })}
        onMatch={(matches) => patchCurrent({ matches })}
      />

      <div className="exam-nav">
        <button
          type="button"
          className="btn-secondary"
          disabled={session.index === 0}
          onClick={() => goTo(session.index - 1)}
        >
          Previous
        </button>
        {session.index + 1 < session.questions.length ? (
          <PrimaryButton onClick={() => goTo(session.index + 1)}>Next</PrimaryButton>
        ) : (
          <PrimaryButton onClick={() => setConfirmFinish(true)}>Finish exam</PrimaryButton>
        )}
      </div>

      <p className="kicker">Overview</p>
      <div className="exam-overview" role="navigation" aria-label="Question overview">
        {session.questions.map((item, i) => (
          <button
            key={examQuestionKeySafe(item, i)}
            type="button"
            className={`exam-dot ${i === session.index ? 'current' : ''} ${
              isQuestionAnswered(item) ? 'answered' : ''
            }`}
            onClick={() => goTo(i)}
            aria-label={`Question ${i + 1}${isQuestionAnswered(item) ? ', answered' : ', unanswered'}`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {confirmFinish ? (
        <div className="card">
          <p style={{ marginTop: 0, fontWeight: 800 }}>
            {unanswered
              ? `${unanswered} unanswered — finish anyway?`
              : 'Submit this exam?'}
          </p>
          <p className="muted">You can still go back until you confirm.</p>
          <div className="backup-confirm">
            <button type="button" className="btn-secondary" onClick={() => setConfirmFinish(false)}>
              Keep going
            </button>
            <PrimaryButton onClick={() => finish(session)}>Finish</PrimaryButton>
          </div>
        </div>
      ) : (
        <button type="button" className="btn-secondary" onClick={() => setConfirmFinish(true)}>
          Finish exam
        </button>
      )}
    </div>
  );
}

function examQuestionKeySafe(question, index) {
  return `${question.topicId || 'q'}:${question.id || index}`;
}

function ExamResults({ scored, auto, reviewId, setReviewId, onRetake, onWeak, onStudy }) {
  const groups = groupExamTopics(scored.byTopic);
  const weak = scored.byTopic.filter((item) => item.correct < item.total);

  return (
    <div className="stack">
      <ScreenHeader title="Exam results" kicker="Here's what to review next" onBack={() => onRetake()} />
      {auto ? <p className="muted">Time ran out — we submitted what you had.</p> : null}
      <section className="card">
        <p className="kicker">Score</p>
        <h2 style={{ margin: '4px 0 8px' }}>{scored.percent}%</h2>
        <p className="muted">
          {scored.correct} of {scored.total} correct. Not a verdict — a map.
        </p>
      </section>

      {groups.map((group) => (
        <section key={group.group} className="stack">
          <p className="kicker">{group.group}</p>
          {group.items.map((item) => (
            <div key={item.topicId} className="list-row">
              <span>
                <strong>{item.title}</strong>
                <div className="muted">
                  {item.correct}/{item.total}
                </div>
              </span>
              <span className={`badge ${item.correct === item.total ? 'done' : ''}`}>
                {item.correct}/{item.total}
              </span>
            </div>
          ))}
        </section>
      ))}

      {scored.missed.length ? (
        <section className="stack">
          <p className="kicker">Look again</p>
          {scored.missed.map((question, i) => {
            const id = examQuestionKeySafe(question, i);
            const open = reviewId === id;
            return (
              <div key={id} className="stack">
                <button type="button" className="list-row" onClick={() => setReviewId(open ? null : id)}>
                  <span>
                    <strong>{question.prompt}</strong>
                    <div className="muted">{String(question.format || '').replace(/-/g, ' ')}</div>
                  </span>
                  <span className="badge">{open ? 'Hide' : 'Why'}</span>
                </button>
                {open ? (
                  <div>
                    <QuestionCard
                      question={question}
                      picked={question.picked}
                      setPicked={() => {}}
                      revealed
                      onMoveItems={() => {}}
                      onMatch={() => {}}
                    />
                    <div className="feedback">{question.explanation}</div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </section>
      ) : (
        <p className="key-point">Clean sweep. That knowledge is yours.</p>
      )}

      <PrimaryButton onClick={onRetake}>Retake</PrimaryButton>
      {weak.length ? (
        <>
          <button type="button" className="btn-secondary" onClick={onWeak}>
            Review weak topics
          </button>
          <div className="card-grid">
            {weak.map((item) => (
              <button
                key={item.topicId}
                type="button"
                className="list-row"
                onClick={() => onStudy(item.topicId)}
              >
                <span>
                  <strong>{item.title}</strong>
                  <div className="muted">
                    {item.correct}/{item.total} · {item.group}
                  </div>
                </span>
                <span className="badge">Study</span>
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
