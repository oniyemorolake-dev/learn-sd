import { useState } from 'react';
import ScreenHeader from '../components/ScreenHeader.jsx';
import PrimaryButton from '../components/PrimaryButton.jsx';
import { useApp } from '../context/AppContext.jsx';
import {
  EXAM_LENGTHS,
  EXAM_TIMERS,
  examPool,
  loadExamSession,
  pickExamQuestions,
  saveExamSession,
} from '../lib/exam.js';

export default function ExamSetupScreen() {
  const { go, state } = useApp();
  const session = loadExamSession();
  const [length, setLength] = useState(session?.length || 20);
  const [minutes, setMinutes] = useState(session?.minutes ?? 0);
  const poolSize = examPool().length;
  const canResume = Boolean(session?.questions?.length) && !session.finished;

  function start() {
    const questions = pickExamQuestions(length, state.examSeen);
    saveExamSession({
      questions,
      index: 0,
      length: questions.length,
      minutes,
      deadline: minutes ? Date.now() + minutes * 60 * 1000 : null,
      finished: false,
    });
    go('exam');
  }

  return (
    <div className="stack">
      <ScreenHeader title="Mock Exam" kicker="Practice" onBack={() => go('practice')} />
      <p className="lede">
        A mixed exam from every quiz in the app — courses, Code Lab, and Interview Prep. One question at a
        time.
      </p>
      <p className="muted">{poolSize} questions in the pool.</p>

      {canResume ? (
        <button type="button" className="track-entry" onClick={() => go('exam')}>
          <span>
            <strong>Resume exam</strong>
            <div className="muted">
              Question {(session.index || 0) + 1} of {session.length}
            </div>
          </span>
          <span className="badge">Open</span>
        </button>
      ) : null}

      <p className="kicker">How many questions?</p>
      <div className="exam-options">
        {EXAM_LENGTHS.map((value) => (
          <button
            key={value}
            type="button"
            className={`exam-chip ${length === value ? 'selected' : ''}`}
            onClick={() => setLength(value)}
          >
            {value}
          </button>
        ))}
      </div>

      <p className="kicker">Timer</p>
      <div className="exam-options">
        {EXAM_TIMERS.map((item) => (
          <button
            key={item.minutes}
            type="button"
            className={`exam-chip ${minutes === item.minutes ? 'selected' : ''}`}
            onClick={() => setMinutes(item.minutes)}
          >
            {item.label}
          </button>
        ))}
      </div>
      {minutes ? (
        <p className="muted">The timer keeps going if you leave this tab. It will submit when it hits zero.</p>
      ) : null}

      <PrimaryButton onClick={start}>{canResume ? 'Start a new exam' : 'Start exam'}</PrimaryButton>
    </div>
  );
}
