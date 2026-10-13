import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { askByte, hasGeminiKey } from '../lib/gemini.js';
import { aiLessonContextText, lessonContextText } from '../lib/content.js';
import ByteMark from './ByteMark.jsx';

export default function Byte() {
  const { view } = useApp();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'byte', text: 'Hey — I am Byte. Ask me about this lesson, or any coding snag.' },
  ]);

  const topicId = view.params?.topicId;
  const lessonId = view.params?.lessonId;
  const lessonContext = useMemo(() => {
    if (view.name === 'ai-lesson' && lessonId) return aiLessonContextText(lessonId);
    if (topicId) return lessonContextText(topicId);
    return '';
  }, [view.name, topicId, lessonId]);

  async function send(event) {
    event.preventDefault();
    const question = input.trim();
    if (!question || busy) return;
    setInput('');
    const next = [...messages, { role: 'user', text: question }];
    setMessages(next);
    setBusy(true);
    try {
      const reply = await askByte({
        question,
        lessonContext,
        history: next,
      });
      setMessages([...next, { role: 'byte', text: reply.text }]);
    } catch {
      setMessages([
        ...next,
        {
          role: 'byte',
          text: hasGeminiKey()
            ? 'I hit a snag talking to Gemini. Check your key and try a shorter question.'
            : 'I need a Gemini API key to chat. Set VITE_GEMINI_API_KEY for this build. The rest of the app still works.',
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        className="byte-fab"
        aria-label={open ? 'Close Byte' : 'Open Byte the tutor'}
        onClick={() => setOpen((value) => !value)}
      >
        <ByteMark size={40} />
      </button>
      {open ? (
        <section className="byte-panel" aria-label="Byte the tutor">
          <header>
            <div>
              <strong>Byte</strong>
              <div className="muted" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                {hasGeminiKey() ? 'Tutor ready' : 'Needs a Gemini key'}
              </div>
            </div>
            <button type="button" className="icon-btn" onClick={() => setOpen(false)} aria-label="Close chat">
              ×
            </button>
          </header>
          <div className="byte-log">
            {messages.map((msg, i) => (
              <div key={`${msg.role}-${i}`} className={`bubble ${msg.role === 'byte' ? 'byte' : 'user'}`}>
                {msg.text}
              </div>
            ))}
            {busy ? <div className="bubble byte muted">Thinking…</div> : null}
          </div>
          <form className="byte-form" onSubmit={send}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Byte…"
              aria-label="Message Byte"
            />
            <button type="submit" disabled={busy || !input.trim()}>
              Go
            </button>
          </form>
        </section>
      ) : null}
    </>
  );
}
