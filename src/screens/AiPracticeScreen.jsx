import { useState } from 'react';
import ScreenHeader from '../components/ScreenHeader.jsx';
import CodeBlock from '../components/CodeBlock.jsx';
import PrimaryButton from '../components/PrimaryButton.jsx';
import ComingSoon from '../components/ComingSoon.jsx';
import Footer from '../components/Footer.jsx';
import { useApp } from '../context/AppContext.jsx';
import { findAiPractice } from '../lib/content.js';

export default function AiPracticeScreen() {
  const { view, go, completeTrackPractice } = useApp();
  const item = findAiPractice(view.params.practiceId);
  const from = view.params?.from;
  const [draft, setDraft] = useState('');
  const [compared, setCompared] = useState(false);

  if (!item) {
    return (
      <div>
        <ScreenHeader title="Practice" onBack={() => go('ai-track', { from })} />
        <ComingSoon title="Exercise missing" onContinue={() => go('ai-track', { from })} />
      </div>
    );
  }

  function compare() {
    setCompared(true);
    completeTrackPractice('ai-prompting', item.id);
  }

  return (
    <div className="stack">
      <ScreenHeader title="Write a prompt" kicker="Compare with a strong example" onBack={() => go('ai-track', { from })} />
      <article className="card">
        <h2 style={{ marginTop: 0 }}>{item.task}</h2>
        <p className="muted">{item.goal}</p>
        <CodeBlock language={item.language} snippet={item.context} />
      </article>
      <label className="kicker" htmlFor="prompt-draft">
        Your prompt
      </label>
      <textarea
        id="prompt-draft"
        className="editor"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={item.placeholder}
        spellCheck={false}
      />
      {!compared ? (
        <PrimaryButton disabled={draft.trim().length < 8} onClick={compare}>
          Compare with example
        </PrimaryButton>
      ) : (
        <>
          <article className="card">
            <p className="kicker">A strong example</p>
            <pre className="output">{item.examplePrompt}</pre>
            <p className="key-point">{item.whyItWorks}</p>
          </article>
          <PrimaryButton onClick={() => go('ai-track', { from })}>Continue</PrimaryButton>
        </>
      )}
      <Footer />
    </div>
  );
}
