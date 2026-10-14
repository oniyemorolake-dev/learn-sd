import { useEffect, useState } from 'react';
import ScreenHeader from '../components/ScreenHeader.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import PrimaryButton from '../components/PrimaryButton.jsx';
import Celebrate from '../components/Celebrate.jsx';
import ComingSoon from '../components/ComingSoon.jsx';
import QuestionCard from '../components/QuestionCard.jsx';
import { useApp } from '../context/AppContext.jsx';
import { codeLabTopicParams, findCodeLabTopic, quizzes, topicTitle } from '../lib/content.js';
import { prepareQuizQuestions } from '../lib/quiz.js';
import { isQuestionCorrect } from '../lib/exam.js';
import { appendAttempt, conqueredLine, topicFocus } from '../lib/focus.js';
import { todayStamp } from '../lib/storage.js';

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

export default function QuizScreen() {
  const { view, go, state, completeQuiz, toggleBookmark, isBookmarked, touchTopic } = useApp();
  const topicId = view.params.topicId;
  const quiz = quizzes[topicId];
  const [attempt, setAttempt] = useState(0);
  const [questions, setQuestions] = useState(() => (quiz ? prepareQuizQuestions(quiz.questions) : []));
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [wrongFormats, setWrongFormats] = useState([]);
  const [finished, setFinished] = useState(false);
  const [clearedFocus, setClearedFocus] = useState(false);

  useEffect(() => {
    if (quiz) touchTopic(topicId, 'quiz');
    else touchTopic(topicId);
  }, [quiz, topicId, touchTopic]);

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

  function check() {
    if (isQuestionCorrect(question, picked)) setScore((n) => n + 1);
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
    setAttempt((n) => n + 1);
    setQuestions(prepareQuizQuestions(quiz.questions));
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
        key={`${topicId}:${attempt}:${question.id}`}
        question={question}
        picked={picked}
        setPicked={setPicked}
        revealed={revealed}
        onMoveItems={(items) => patchQuestion({ items })}
        onMatch={(matches) => patchQuestion({ matches })}
      />
      {revealed ? (
        <div className={`feedback ${isQuestionCorrect(question, picked) ? 'ok' : ''}`}>{question.explanation}</div>
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
