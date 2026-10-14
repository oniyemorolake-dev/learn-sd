import { useState } from 'react';
import ScreenHeader from '../components/ScreenHeader.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import PrimaryButton from '../components/PrimaryButton.jsx';
import ComingSoon from '../components/ComingSoon.jsx';
import { useApp } from '../context/AppContext.jsx';
import { exercises, topicTitle } from '../lib/content.js';
import { outputsMatch, runJavaScript } from '../lib/jsRunner.js';
import { runPython } from '../lib/pythonRunner.js';

export default function ExerciseScreen() {
  const { view, go, state, completeExercise } = useApp();
  const topicId = view.params.topicId;
  const pack = exercises[topicId];
  const startIndex = view.params.exerciseIndex || 0;
  const [index, setIndex] = useState(startIndex);
  const [code, setCode] = useState(pack?.exercises[startIndex]?.starterCode || '');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [matched, setMatched] = useState(false);

  function goHome() {
    if (view.params.from === 'interview-track') go('interview-track', { from: view.params.entryFrom });
    else go('practice');
  }

  if (!pack) {
    return (
      <div>
        <ScreenHeader title={topicTitle(topicId)} onBack={goHome} />
        <ComingSoon title="Exercises coming soon" onContinue={goHome} />
      </div>
    );
  }

  const list = pack.exercises;
  const exercise = list[index];

  function load(nextIndex) {
    const next = list[nextIndex];
    setIndex(nextIndex);
    setCode(next.starterCode);
    setOutput('');
    setError('');
    setShowHint(false);
    setShowSolution(false);
    setMatched(false);
    setStatus('');
  }

  async function run() {
    setBusy(true);
    setError('');
    setMatched(false);
    try {
      const lang = (exercise.language || '').toLowerCase();
      if (lang === 'sql' || lang === 'plsql' || lang === 'pl/sql') {
        setOutput('');
        setError('SQL and PL/SQL are display-only here. These exercises run in Python.');
        return;
      }
      const result =
        lang === 'python' ? await runPython(code, setStatus) : await runJavaScript(code);
      setOutput(result.output);
      setError(result.error || '');
      if (!result.error && outputsMatch(result.output, exercise.expectedOutput)) {
        setMatched(true);
        completeExercise(exercise.id);
      }
    } catch (err) {
      setError(String(err.message || err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="stack">
      <ScreenHeader
        title={pack.title || topicTitle(topicId)}
        kicker={`Exercise ${index + 1} of ${list.length}`}
        onBack={goHome}
      />
      <ProgressBar value={index} max={list.length} />
      <article className="card">
        <p className="kicker">{exercise.language}</p>
        <h2 style={{ marginTop: 0 }}>{exercise.task}</h2>
      </article>
      <textarea
        className="editor"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        spellCheck={false}
        aria-label="Exercise code"
      />
      <PrimaryButton disabled={busy} onClick={run}>
        {busy ? 'Running…' : 'Run'}
      </PrimaryButton>
      {status ? <p className="muted">{status}</p> : null}
      <div>
        <p className="kicker">Output</p>
        <div className="output">{error || output || 'Run to see output.'}</div>
      </div>
      <div>
        <p className="kicker">Expected</p>
        <div className="output">{exercise.expectedOutput}</div>
      </div>
      {matched ? <p className="key-point">That matches. Nice.</p> : null}
      <button type="button" className="btn-secondary" onClick={() => setShowHint(true)}>
        Hint
      </button>
      {showHint ? <p className="card">{exercise.hint}</p> : null}
      <button type="button" className="btn-secondary" onClick={() => setShowSolution(true)}>
        Reveal solution
      </button>
      {showSolution ? (
        <pre className="output">{exercise.solution}</pre>
      ) : null}
      {index + 1 < list.length ? (
        <PrimaryButton onClick={() => load(index + 1)}>Next exercise</PrimaryButton>
      ) : (
        <PrimaryButton onClick={goHome}>Done for now</PrimaryButton>
      )}
      {state.exercises[exercise.id] ? (
        <p className="muted" style={{ textAlign: 'center' }}>
          Saved to your progress
        </p>
      ) : null}
    </div>
  );
}
