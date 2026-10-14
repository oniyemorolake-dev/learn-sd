import { useState } from 'react';
import ScreenHeader from '../components/ScreenHeader.jsx';
import CodeBlock from '../components/CodeBlock.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import PrimaryButton from '../components/PrimaryButton.jsx';
import Celebrate from '../components/Celebrate.jsx';
import ComingSoon from '../components/ComingSoon.jsx';
import { useApp } from '../context/AppContext.jsx';
import { codeLabTopicParams, findCodeLabTopic, quizzes, topicTitle } from '../lib/content.js';
import { shuffle, shuffleChoices } from '../lib/shuffle.js';
import { appendAttempt, conqueredLine, topicFocus } from '../lib/focus.js';
import { todayStamp } from '../lib/storage.js';

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
]);

function reviewCelebrateBody(isReview, score, total, clearedFocus) {
  if (clearedFocus) {
    return `${score} / ${total}. That one just left Focus Areas.`;
  }
  if (!isReview) {
    return score === total
      ? 'Clean sweep. That knowledge is yours.'
      : 'Every miss is a map. Retry whenever you like.';
  }
  const pct = total > 0 ? score / total : 0;
  if (pct < 0.8) return "Let's see this one again tomorrow.";
  return 'Nice review. This one can rest a little longer.';
}

function blockLanguage(question) {
  const raw = question.language || question.from;
  if (!raw) return undefined;
  return CODE_LANGUAGES.has(String(raw).toLowerCase()) ? raw : undefined;
}

function prepareQuestions(raw) {
  return shuffle(raw).map((question) => {
    if (question.format === 'arrange-order') {
      const items = question.lines.map((text, originalIndex) => ({ text, originalIndex }));
      return { ...question, items: shuffle(items) };
    }
    if (question.format === 'matching') {
      return {
        ...question,
        terms: shuffle(question.pairs.map((pair, i) => ({ ...pair, i }))),
        defs: shuffle(question.pairs.map((pair) => pair.definition)),
        matches: {},
      };
    }
    if (Array.isArray(question.options) && typeof question.answer === 'number') {
      const mixed = shuffleChoices(question.options, question.answer);
      return { ...question, options: mixed.options, answer: mixed.answer };
    }
    return { ...question };
  });
}

export default function QuizScreen() {
  const { view, go, state, completeQuiz, toggleBookmark, isBookmarked } = useApp();
  const topicId = view.params.topicId;
  const quiz = quizzes[topicId];
  const [questions, setQuestions] = useState(() => (quiz ? prepareQuestions(quiz.questions) : []));
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [wrongFormats, setWrongFormats] = useState([]);
  const [finished, setFinished] = useState(false);
  const [clearedFocus, setClearedFocus] = useState(false);

  function goHome() {
    if (view.params.from === 'review' || view.params.from === 'focus') go(view.params.returnTo || 'path');
    else if (view.params.from === 'interview-track') go('interview-track', { from: view.params.entryFrom });
    else if (findCodeLabTopic(topicId)) go('topic', codeLabTopicParams(topicId, view.params));
    else go('topic', { topicId });
  }

  if (!quiz) {
    return (
      <div>
        <ScreenHeader title={topicTitle(topicId)} onBack={goHome} />
        <ComingSoon title="Quiz coming soon" onContinue={goHome} />
      </div>
    );
  }

  const question = questions[index];
  if (!question && !finished) return null;

  const bookmarkId = question ? `quiz:${topicId}:${question.id}` : '';

  function patchQuestion(partial) {
    setQuestions((current) =>
      current.map((item, i) => (i === index ? { ...item, ...partial } : item)),
    );
  }

  function isCorrect() {
    if (question.format === 'arrange-order') {
      return question.items.map((item) => item.originalIndex).join() === question.answer.join();
    }
    if (question.format === 'matching') {
      return question.terms.every((term) => question.matches[term.i] === term.definition);
    }
    return picked === question.answer;
  }

  function check() {
    if (isCorrect()) setScore((n) => n + 1);
    else setWrongFormats((list) => [...list, question.format || 'multiple-choice']);
    setRevealed(true);
  }

  function next() {
    if (index + 1 >= questions.length) {
      const nextAttempts = appendAttempt(state.attempts?.[topicId], {
        score,
        total: questions.length,
        wrongFormats,
        date: todayStamp(),
      });
      setClearedFocus(Boolean(topicFocus(state.attempts?.[topicId])) && !topicFocus(nextAttempts));
      completeQuiz(topicId, score, questions.length, wrongFormats);
      setFinished(true);
      return;
    }
    setIndex((n) => n + 1);
    setPicked(null);
    setRevealed(false);
  }

  function retry() {
    setQuestions(prepareQuestions(quiz.questions));
    setIndex(0);
    setPicked(null);
    setRevealed(false);
    setScore(0);
    setWrongFormats([]);
    setFinished(false);
    setClearedFocus(false);
  }

  if (finished) {
    return (
      <div className="stack">
        <Celebrate
          title={clearedFocus ? conqueredLine(topicTitle(topicId)) : `${score} / ${questions.length}`}
          body={reviewCelebrateBody(
            view.params.from === 'review',
            score,
            questions.length,
            clearedFocus,
          )}
          actionLabel={view.params.from === 'review' || view.params.from === 'focus' ? 'Done' : 'Back to topic'}
          onContinue={goHome}
        />
        <button type="button" className="btn-secondary" onClick={retry}>
          Retry quiz
        </button>
      </div>
    );
  }

  const canCheck =
    question.format === 'matching'
      ? question.terms.every((term) => question.matches[term.i])
      : question.format === 'arrange-order'
        ? true
        : picked !== null;

  return (
    <div className="stack">
      <ScreenHeader
        title={quiz.title}
        kicker={`Question ${index + 1} of ${questions.length}`}
        onBack={goHome}
        extra={
          <button
            type="button"
            className="icon-btn"
            aria-label="Bookmark this question"
            onClick={() =>
              toggleBookmark({
                id: bookmarkId,
                type: 'question',
                topicId,
                questionId: question.id,
                title: question.prompt,
              })
            }
          >
            {isBookmarked(bookmarkId) ? '★' : '☆'}
          </button>
        }
      />
      <ProgressBar value={index} max={questions.length} />
      <QuestionCard
        question={question}
        picked={picked}
        setPicked={setPicked}
        revealed={revealed}
        onMoveItems={(items) => patchQuestion({ items })}
        onMatch={(matches) => patchQuestion({ matches })}
      />
      {revealed ? (
        <div className={`feedback ${isCorrect() ? 'ok' : ''}`}>{question.explanation}</div>
      ) : null}
      {revealed ? (
        <PrimaryButton onClick={next}>{index + 1 >= questions.length ? 'See score' : 'Next'}</PrimaryButton>
      ) : (
        <PrimaryButton disabled={!canCheck} onClick={check}>
          Check answer
        </PrimaryButton>
      )}
    </div>
  );
}

function QuestionCard({ question, picked, setPicked, revealed, onMoveItems, onMatch }) {
  if (question.format === 'arrange-order') {
    return <ArrangeQuestion question={question} revealed={revealed} onMoveItems={onMoveItems} />;
  }
  if (question.format === 'matching') {
    return <MatchingQuestion question={question} revealed={revealed} onMatch={onMatch} />;
  }

  return (
    <article className="card stack">
      <p className="kicker">{question.format.replace(/-/g, ' ')}</p>
      <h2 style={{ margin: 0 }}>{question.prompt}</h2>
      {question.from && question.to ? (
        <p className="muted">
          {question.from} → {question.to}
        </p>
      ) : null}
      <CodeBlock language={blockLanguage(question)} snippet={question.code} />
      {question.options.map((option, i) => {
        let cls = 'choice';
        if (picked === i) cls += ' selected';
        if (revealed && i === question.answer) cls += ' correct';
        if (revealed && picked === i && i !== question.answer) cls += ' wrong';
        return (
          <button key={option} type="button" className={cls} onClick={() => !revealed && setPicked(i)}>
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
              {question.matches[item.i] ? (
                <div className="muted">{question.matches[item.i]}</div>
              ) : null}
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
