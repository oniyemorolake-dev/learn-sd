import { useState } from 'react';
import ScreenHeader from '../components/ScreenHeader.jsx';
import CodeBlock from '../components/CodeBlock.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import PrimaryButton from '../components/PrimaryButton.jsx';
import Celebrate from '../components/Celebrate.jsx';
import ComingSoon from '../components/ComingSoon.jsx';
import { useApp } from '../context/AppContext.jsx';
import { lessons, topicTitle } from '../lib/content.js';

export default function LessonScreen() {
  const { view, go, completeLesson, toggleBookmark, isBookmarked } = useApp();
  const topicId = view.params.topicId;
  const lesson = lessons[topicId];
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [done, setDone] = useState(false);

  if (!lesson) {
    return (
      <div>
        <ScreenHeader title={topicTitle(topicId)} onBack={() => go('topic', { topicId })} />
        <ComingSoon title={topicTitle(topicId)} onContinue={() => go('topic', { topicId })} />
      </div>
    );
  }

  const screens = lesson.screens || [];
  const hasCheckIn = Boolean(lesson.checkIn);
  const totalSteps = screens.length + (hasCheckIn ? 1 : 0);
  const onCheckIn = hasCheckIn && index >= screens.length;
  const bookmarkId = `lesson:${topicId}`;

  if (done) {
    return (
      <Celebrate
        title="Lesson complete"
        body="Small step, real progress. The quiz is waiting when you are ready."
        actionLabel="Continue"
        onContinue={() => go('topic', { topicId })}
      />
    );
  }

  function finish() {
    const correct = picked === lesson.checkIn.answer;
    completeLesson(topicId, correct);
    setDone(true);
  }

  return (
    <div className="stack">
      <ScreenHeader
        title={lesson.title}
        kicker={onCheckIn ? 'Check-in' : `Screen ${index + 1} of ${screens.length}`}
        onBack={() => go('topic', { topicId })}
        extra={
          <button
            type="button"
            className="icon-btn"
            aria-label={isBookmarked(bookmarkId) ? 'Remove bookmark' : 'Bookmark lesson'}
            onClick={() =>
              toggleBookmark({
                id: bookmarkId,
                type: 'lesson',
                topicId,
                title: lesson.title,
              })
            }
          >
            {isBookmarked(bookmarkId) ? '★' : '☆'}
          </button>
        }
      />
      <ProgressBar value={index + (revealed ? 1 : 0)} max={totalSteps} />

      {!onCheckIn ? (
        <article className="card">
          <h2 style={{ marginTop: 0 }}>{screens[index].heading}</h2>
          {screens[index].body.split('\n\n').map((para) => (
            <p key={para}>{para}</p>
          ))}
          <CodeBlock language={screens[index].code?.language} snippet={screens[index].code?.snippet} />
          {screens[index].keyPoint ? <p className="key-point">{screens[index].keyPoint}</p> : null}
        </article>
      ) : (
        <article className="card stack">
          <h2 style={{ marginTop: 0 }}>{lesson.checkIn.prompt}</h2>
          {lesson.checkIn.options.map((option, i) => {
            let cls = 'choice';
            if (picked === i) cls += ' selected';
            if (revealed && i === lesson.checkIn.answer) cls += ' correct';
            if (revealed && picked === i && i !== lesson.checkIn.answer) cls += ' wrong';
            return (
              <button
                key={option}
                type="button"
                className={cls}
                onClick={() => !revealed && setPicked(i)}
              >
                {option}
              </button>
            );
          })}
          {revealed ? (
            <div className={`feedback ${picked === lesson.checkIn.answer ? 'ok' : ''}`}>
              {lesson.checkIn.explanation}
            </div>
          ) : null}
          {revealed && lesson.goDeeper?.length ? (
            <div className="go-deeper">
              <p className="kicker">Go deeper</p>
              {lesson.goDeeper.map((link) => (
                <a key={link.url} href={link.url} target="_blank" rel="noreferrer">
                  {link.label}
                </a>
              ))}
            </div>
          ) : null}
        </article>
      )}

      {!onCheckIn ? (
        <PrimaryButton
          onClick={() => {
            if (index + 1 >= screens.length && !hasCheckIn) {
              completeLesson(topicId, true);
              setDone(true);
              return;
            }
            setIndex((n) => n + 1);
          }}
        >
          Continue
        </PrimaryButton>
      ) : revealed ? (
        <PrimaryButton onClick={finish}>Finish lesson</PrimaryButton>
      ) : (
        <PrimaryButton disabled={picked === null} onClick={() => setRevealed(true)}>
          Check answer
        </PrimaryButton>
      )}
    </div>
  );
}
