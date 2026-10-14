import { useState } from 'react';
import CodeBlock from './CodeBlock.jsx';

const CODE_LANGUAGES = new Set([
  'javascript',
  'js',
  'java',
  'python',
  'sql',
  'plsql',
  'pl/sql',
  'jsx',
  'bash',
  'html',
  'css',
  'json',
  'text',
  'typescript',
  'tsx',
]);

function blockLanguage(question) {
  const raw = question.language || question.from;
  if (!raw) return undefined;
  return CODE_LANGUAGES.has(String(raw).toLowerCase()) ? raw : undefined;
}

export default function QuestionCard({ question, picked, setPicked, revealed, onMoveItems, onMatch }) {
  if (question.format === 'arrange-order') {
    return <ArrangeQuestion question={question} revealed={revealed} onMoveItems={onMoveItems} />;
  }
  if (question.format === 'matching') {
    return <MatchingQuestion question={question} revealed={revealed} onMatch={onMatch} />;
  }

  return (
    <article className="card stack">
      <p className="kicker">{String(question.format || 'question').replace(/-/g, ' ')}</p>
      <h2 style={{ margin: 0 }}>{question.prompt}</h2>
      {question.from && question.to ? (
        <p className="muted">
          {question.from} → {question.to}
        </p>
      ) : null}
      <CodeBlock language={blockLanguage(question)} snippet={question.code} />
      {(question.options || []).map((option, i) => {
        const correctIndex = Number(question.answer);
        let cls = 'choice';
        if (picked === i) cls += ' selected';
        if (revealed && i === correctIndex) cls += ' correct';
        if (revealed && picked === i && i !== correctIndex) cls += ' wrong';
        return (
          <button key={i} type="button" className={cls} onClick={() => !revealed && setPicked(i)}>
            <pre style={{ margin: 0, fontFamily: 'inherit', whiteSpace: 'pre-wrap' }}>{option}</pre>
          </button>
        );
      })}
    </article>
  );
}

function ArrangeQuestion({ question, revealed, onMoveItems }) {
  function move(from, to) {
    if (revealed) return;
    if (to < 0 || to >= question.items.length) return;
    const next = [...question.items];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onMoveItems(next);
  }

  return (
    <article className="card">
      <p className="kicker">arrange order</p>
      <h2 style={{ marginTop: 0 }}>{question.prompt}</h2>
      {question.items.map((item, i) => (
        <div className="arrange-line" key={`${item.originalIndex}-${i}`}>
          <button type="button" className="icon-btn" aria-label="Move up" onClick={() => move(i, i - 1)}>
            ↑
          </button>
          <code>{item.text}</code>
          <button type="button" className="icon-btn" aria-label="Move down" onClick={() => move(i, i + 1)}>
            ↓
          </button>
        </div>
      ))}
    </article>
  );
}

function MatchingQuestion({ question, revealed, onMatch }) {
  const [term, setTerm] = useState(null);

  function pickDef(definition) {
    if (revealed || term === null) return;
    onMatch({ ...question.matches, [term]: definition });
    setTerm(null);
  }

  return (
    <article className="card">
      <p className="kicker">matching</p>
      <h2 style={{ marginTop: 0 }}>{question.prompt}</h2>
      <p className="muted">Tap a term, then tap its meaning.</p>
      <div className="match-grid">
        <div className="stack">
          {question.terms.map((item) => (
            <button
              key={item.term}
              type="button"
              className={`choice ${term === item.i ? 'selected' : ''} ${
                revealed && question.matches[item.i] === item.definition ? 'correct' : ''
              }`}
              onClick={() => !revealed && setTerm(item.i)}
            >
              <strong>{item.term}</strong>
              {question.matches[item.i] ? <div className="muted">{question.matches[item.i]}</div> : null}
            </button>
          ))}
        </div>
        <div className="stack">
          {question.defs.map((definition) => (
            <button key={definition} type="button" className="choice" onClick={() => pickDef(definition)}>
              {definition}
            </button>
          ))}
        </div>
      </div>
    </article>
  );
}
