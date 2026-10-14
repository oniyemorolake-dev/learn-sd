import { useEffect, useState } from 'react';
import ScreenHeader from '../components/ScreenHeader.jsx';
import CodeBlock from '../components/CodeBlock.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import PrimaryButton from '../components/PrimaryButton.jsx';
import Celebrate from '../components/Celebrate.jsx';
import ComingSoon from '../components/ComingSoon.jsx';
import { useApp } from '../context/AppContext.jsx';
import { codeLabTopicParams, findCodeLabTopic, findInterviewLesson, lessons, topicTitle } from '../lib/content.js';
import { shuffleAnswerBlock } from '../lib/shuffle.js';

export default function LessonScreen() {
  const { view, go, completeLesson, completeTrackLesson, toggleBookmark, isBookmarked, touchTopic } = useApp();
  const topicId = view.params.topicId;
  const interviewLesson = findInterviewLesson(topicId);
  const lesson = lessons[topicId] || interviewLesson;
  const fromInterview = view.params.from === 'interview-track' || Boolean(interviewLesson);

  function goHome() {
    if (view.params.from === 'focus') go(view.params.returnTo || 'progress');
    else if (fromInterview) go('interview-track', { from: view.params.entryFrom });
    else if (findCodeLabTopic(topicId)) go('topic', codeLabTopicParams(topicId, view.params));
    else go('topic', { topicId });
  }
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [checkPick, setCheckPick] = useState(null);
  const [done, setDone] = useState(false);
  const [shuffledCheckIn] = useState(() => shuffleAnswerBlock(lesson?.checkIn));

  useEffect(() => {
    if (lesson) touchTopic(topicId, 'lesson');
    else touchTopic(topicId);
  }, [lesson, topicId, touchTopic]);

  if (!lesson) {
    return (
      <div>
        <ScreenHeader title={topicTitle(topicId)} onBack={goHome} />
        <ComingSoon title={topicTitle(topicId)} onContinue={goHome} />
      </div>
    );
  }

  const screens = lesson.screens || [];
  const checkIn = shuffledCheckIn || lesson.checkIn;
  const hasCheckIn = Boolean(checkIn);
  const totalSteps = screens.length + (hasCheckIn ? 1 : 0);
  const onCheckIn = hasCheckIn && index >= screens.length;
  const bookmarkId = `lesson:${topicId}`;
  const screen = !onCheckIn ? screens[index] : null;
  const screenCheck = screen?.check;

  if (done) {
    return (
      <Celebrate
        title="Lesson complete"
        body="Small step, real progress. The quiz is waiting when you are ready."
        actionLabel="Continue"
        onContinue={goHome}
      />
    );
  }

  function goNext() {
    if (onCheckIn) {
      if (interviewLesson) completeTrackLesson('interview-prep', topicId);
      else completeLesson(topicId, picked === checkIn.answer);
      setDone(true);
      return;
    }
    if (index + 1 >= screens.length && !hasCheckIn) {
      if (interviewLesson) completeTrackLesson('interview-prep', topicId);
      else completeLesson(topicId, true);
      setDone(true);
      return;
    }
    setIndex((n) => n + 1);
    setPicked(null);
    setRevealed(false);
    setCheckPick(null);
  }

  return (
    <div className="stack">
      <ScreenHeader
        title={lesson.title}
        kicker={onCheckIn ? 'Check-in' : `Screen ${index + 1} of ${screens.length}`}
        onBack={goHome}
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
      <ProgressBar value={index + (onCheckIn && revealed ? 1 : 0)} max={totalSteps} />

      {!onCheckIn ? (
        <>
          <article className="card">
            <h2 style={{ marginTop: 0 }}>{screen.heading}</h2>
            {screen.body.split('\n\n').map((para) => (
              <p key={para}>{para}</p>
            ))}
            <CodeBlock language={screen.code?.language} snippet={screen.code?.snippet} />
            {screen.keyPoint ? <p className="key-point">{screen.keyPoint}</p> : null}
          </article>
          {screenCheck ? (
            <ScreenCheck
              key={screen.heading || index}
              check={screenCheck}
              pick={checkPick}
              onPick={setCheckPick}
            />
          ) : null}
        </>
      ) : (
        <article className="card stack">
          <h2 style={{ marginTop: 0 }}>{checkIn.prompt}</h2>
          <ChoiceButtons
            options={checkIn.options}
            answer={checkIn.answer}
            picked={picked}
            revealed={revealed}
            onPick={setPicked}
          />
          {revealed ? (
            <div className={`feedback ${picked === checkIn.answer ? 'ok' : ''}`}>{checkIn.explanation}</div>
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
        <PrimaryButton disabled={Boolean(screenCheck) && checkPick === null} onClick={goNext}>
          Continue
        </PrimaryButton>
      ) : revealed ? (
        <PrimaryButton onClick={goNext}>Finish lesson</PrimaryButton>
      ) : (
        <PrimaryButton disabled={picked === null} onClick={() => setRevealed(true)}>
          Check answer
        </PrimaryButton>
      )}
    </div>
  );
}

function ChoiceButtons({ options, answer, picked, revealed, onPick }) {
  const correctIndex = Number(answer);
  return (options || []).map((option, i) => {
    let cls = 'choice';
    if (picked === i) cls += ' selected';
    if (revealed && i === correctIndex) cls += ' correct';
    if (revealed && picked === i && i !== correctIndex) cls += ' wrong';
    return (
      <button key={`${i}:${option}`} type="button" className={cls} onClick={() => !revealed && onPick(i)}>
        {option}
      </button>
    );
  });
}

function ScreenCheck({ check, pick, onPick }) {
  const [mixed] = useState(() => shuffleAnswerBlock(check) || check);
  const answered = pick !== null;
  return (
    <article className="card stack">
      <p className="kicker">Quick check</p>
      <p style={{ margin: 0, fontWeight: 800 }}>{mixed.question}</p>
      <ChoiceButtons
        options={mixed.options}
        answer={mixed.answer}
        picked={pick}
        revealed={answered}
        onPick={onPick}
      />
      {answered ? (
        <div className={`feedback ${pick === mixed.answer ? 'ok' : ''}`}>
          {pick === mixed.answer ? 'Yes — that matches.' : 'Not that one. Continue whenever you are ready.'}
        </div>
      ) : null}
    </article>
  );
}
