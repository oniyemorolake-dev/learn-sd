import { useRef, useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { backupFilename, buildBackup, downloadBackup, hasStoredProgress, parseBackup } from '../lib/backup.js';

const FAIL = "That file doesn't look like a Learn SD backup.";
const OK = 'Progress restored — welcome back.';
const ASK = 'Replace your current progress with this backup?';

export default function ProgressBackup() {
  const { state, restoreProgress } = useApp();
  const fileRef = useRef(null);
  const [pending, setPending] = useState(null);
  const [notice, setNotice] = useState(null);

  function backup() {
    downloadBackup(buildBackup(), backupFilename());
    setPending(null);
    setNotice({ ok: true, text: 'Saved a copy. Keep that file somewhere you can find it.' });
  }

  function onPick(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const parsed = parseBackup(String(reader.result || ''));
      if (!parsed.ok) {
        setPending(null);
        setNotice({ ok: false, text: FAIL });
        return;
      }
      if (hasStoredProgress(state)) {
        setPending(parsed.data);
        setNotice({ ok: true, text: ASK });
        return;
      }
      restoreProgress(parsed.data);
      setPending(null);
      setNotice({ ok: true, text: OK });
    };
    reader.onerror = () => {
      setPending(null);
      setNotice({ ok: false, text: FAIL });
    };
    reader.readAsText(file);
  }

  function confirmReplace() {
    if (!pending) return;
    restoreProgress(pending);
    setPending(null);
    setNotice({ ok: true, text: OK });
  }

  return (
    <section className="card backup-card">
      <p className="kicker">Your backup</p>
      <p className="muted" style={{ marginTop: 0 }}>
        Save a copy of your progress. If this browser forgets you, that file brings you back.
      </p>
      <div className="backup-actions">
        <button type="button" className="btn-secondary" onClick={backup}>
          Back up my progress
        </button>
        <button type="button" className="btn-secondary" onClick={() => fileRef.current?.click()}>
          Restore from backup
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".json,application/json"
          hidden
          aria-label="Choose a Learn SD backup file"
          onChange={onPick}
        />
      </div>
      {notice ? (
        <div className={`feedback ${notice.ok ? 'ok' : ''}`} style={{ marginTop: 14 }}>
          {notice.text}
          {pending ? (
            <div className="backup-confirm">
              <button type="button" className="btn-primary" onClick={confirmReplace}>
                Replace
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setPending(null);
                  setNotice(null);
                }}
              >
                Cancel
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
