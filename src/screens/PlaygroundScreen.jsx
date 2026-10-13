import { useState } from 'react';
import ScreenHeader from '../components/ScreenHeader.jsx';
import PrimaryButton from '../components/PrimaryButton.jsx';
import { useApp } from '../context/AppContext.jsx';
import { runJavaScript } from '../lib/jsRunner.js';
import { runPython } from '../lib/pythonRunner.js';

const STARTERS = {
  javascript: 'const nums = [1, 2, 3];\nconsole.log(nums.map((n) => n * 2));\n',
  python: 'nums = [1, 2, 3]\nprint([n * 2 for n in nums])\n',
};

export default function PlaygroundScreen() {
  const { go } = useApp();
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState(STARTERS.javascript);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');

  function switchLang(next) {
    setLanguage(next);
    setCode(STARTERS[next]);
    setOutput('');
    setError('');
    setStatus('');
  }

  async function run() {
    setBusy(true);
    setError('');
    try {
      const result = language === 'python' ? await runPython(code, setStatus) : await runJavaScript(code);
      setOutput(result.output);
      setError(result.error || '');
    } catch (err) {
      setError(String(err.message || err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="stack">
      <ScreenHeader title="Playground" kicker="Try anything" onBack={() => go('practice')} />
      <div className="lang-toggle">
        <button type="button" className={language === 'javascript' ? 'active' : ''} onClick={() => switchLang('javascript')}>
          JavaScript
        </button>
        <button type="button" className={language === 'python' ? 'active' : ''} onClick={() => switchLang('python')}>
          Python
        </button>
      </div>
      <textarea
        className="editor"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        spellCheck={false}
        aria-label="Playground code"
      />
      <PrimaryButton disabled={busy} onClick={run}>
        {busy ? 'Running…' : 'Run'}
      </PrimaryButton>
      {status ? <p className="muted">{status}</p> : null}
      <div className="output" style={{ color: error ? 'var(--danger)' : 'var(--text)' }}>
        {error || output || 'Output shows up here.'}
      </div>
    </div>
  );
}
