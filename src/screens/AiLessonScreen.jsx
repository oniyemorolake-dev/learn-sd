import { useState } from 'react';
import ScreenHeader from '../components/ScreenHeader.jsx';
import CodeBlock from '../components/CodeBlock.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import PrimaryButton from '../components/PrimaryButton.jsx';
import Celebrate from '../components/Celebrate.jsx';
import ComingSoon from '../components/ComingSoon.jsx';
import Footer from '../components/Footer.jsx';
import { useApp } from '../context/AppContext.jsx';
import { findAiLesson } from '../lib/content.js';

export default function AiLessonScreen() {
  const { view, go, completeTrackLesson } = useApp();
  const lesson = findAiLesson(view.params.lessonId);
  const from = view.params?.from;
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [done, setDone] = useState(false);

  if (!lesson) {
    return (
      <div>
        <ScreenHeader title="AI Prompting" onBack={() => go('ai-track', { from })} />
        <ComingSoon title="Lesson missing" onContinue={() => go('ai-track', { from })} />
      </div>
    );
  }

  const screens = lesson.screens || [];
  const hasCheckIn = Boolean(lesson.checkIn);
  const totalSteps = screens.length + (hasCheckIn ? 1 : 0);
  const onCheckIn = hasCheckIn && index >= screens.length;

  if (done) {
    return (
      <div>
        <Celebrate
          title="Lesson complete"
          body="Next: another bite-sized idea, or a practice prompt."
          actionLabel="Continue"
          onContinue={() => go('ai-track', { from })}
        />
        <Footer />
      </div>
    );
  }

  return (
    <div className="stack">
      <ScreenHeader
        title={lesson.title}
        kicker={onCheckIn ? 'Check-in' : `Screen ${index + 1} of ${screens.length}`}
        onBack={() => go('ai-track', { from })}
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
              <button key={option} type="button" className={cls} onClick={() => !revealed && setPicked(i)}>
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
              completeTrackLesson('ai-prompting', lesson.id);
              setDone(true);
              return;
            }
            setIndex((n) => n + 1);
          }}
        >
          Continue
        </PrimaryButton>
      ) : revealed ? (
        <PrimaryButton
          onClick={() => {
            completeTrackLesson('ai-prompting', lesson.id, picked === lesson.checkIn.answer);
            setDone(true);
          }}
        >
          Finish lesson
        </PrimaryButton>
      ) : (
        <PrimaryButton disabled={picked === null} onClick={() => setRevealed(true)}>
          Check answer
        </PrimaryButton>
      )}
      <Footer />
    </div>
  );
}
