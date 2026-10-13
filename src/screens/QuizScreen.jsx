import { useState } from 'react';
import ScreenHeader from '../components/ScreenHeader.jsx';
import CodeBlock from '../components/CodeBlock.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import PrimaryButton from '../components/PrimaryButton.jsx';
import Celebrate from '../components/Celebrate.jsx';
import ComingSoon from '../components/ComingSoon.jsx';
import { useApp } from '../context/AppContext.jsx';
import { quizzes, topicTitle } from '../lib/content.js';
import { shuffle, shuffleChoices } from '../lib/shuffle.js';

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
  const { view, go, completeQuiz, toggleBookmark, isBookmarked } = useApp();
  const topicId = view.params.topicId;
  const quiz = quizzes[topicId];
  const [questions, setQuestions] = useState(() => (quiz ? prepareQuestions(quiz.questions) : []));
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  if (!quiz) {
    return (
      <div>
        <ScreenHeader title={topicTitle(topicId)} onBack={() => go('topic', { topicId })} />
        <ComingSoon title="Quiz coming soon" onContinue={() => go('topic', { topicId })} />
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
    setRevealed(true);
  }

  function next() {
    if (index + 1 >= questions.length) {
      completeQuiz(topicId, score, questions.length);
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
    setFinished(false);
  }

  if (finished) {
    return (
      <div className="stack">
        <Celebrate
          title={`${score} / ${questions.length}`}
          body={
            score === questions.length
              ? 'Clean sweep. That knowledge is yours.'
              : 'Every miss is a map. Retry whenever you like.'
          }
          actionLabel="Back to topic"
          onContinue={() => go('topic', { topicId })}
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
        onBack={() => go('topic', { topicId })}
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
      <CodeBlock language={question.language} snippet={question.code} />
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
