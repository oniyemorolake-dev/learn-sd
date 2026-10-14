import { useEffect } from 'react';
import ScreenHeader from '../components/ScreenHeader.jsx';
import ComingSoon from '../components/ComingSoon.jsx';
import PrimaryButton from '../components/PrimaryButton.jsx';
import { useApp } from '../context/AppContext.jsx';
import {
  codeLabTopicParams,
  exercises,
  findCodeLabTopic,
  findTopic,
  hasExercises,
  hasLesson,
  hasQuiz,
  hasTopicContent,
  topicDescription,
  pieceBadgeText,
  topicTitle,
} from '../lib/content.js';
import ProgressBadge from '../components/ProgressBadge.jsx';

export default function TopicScreen() {
  const { view, go, state, touchTopic } = useApp();
  const topicId = view.params.topicId;
  const meta = findTopic(topicId);
  const lab = findCodeLabTopic(topicId);
  const title = topicTitle(topicId);
  const lessonRecord = state.lessons[topicId];
  const quizRecord = state.quizzes[topicId];
  const lessonDone = Boolean(lessonRecord?.completed);
  const quizDone = Boolean(quizRecord?.completed);

  useEffect(() => {
    touchTopic(topicId);
  }, [topicId, touchTopic]);

  function goBack() {
    if (lab) go('code-language', { languageId: view.params.languageId || lab.language.id });
    else go('path');
  }

  function open(name, extra = {}) {
    go(name, codeLabTopicParams(topicId, extra));
  }

  if (!hasTopicContent(topicId)) {
    return (
      <div>
        <ScreenHeader
          title={title}
          course={meta?.course}
          kicker={meta ? null : 'Topic'}
          onBack={goBack}
        />
        <ComingSoon title={title} onContinue={goBack} />
      </div>
    );
  }

  const lessonReady = hasLesson(topicId);
  const quizReady = hasQuiz(topicId);
  const primary =
    lessonReady && !lessonDone
      ? 'lesson'
      : quizReady && !quizDone
        ? 'quiz'
        : hasExercises(topicId)
          ? 'practice'
          : 'path';

  return (
    <div className="stack">
      <ScreenHeader
        title={title}
        course={meta?.course}
        onBack={goBack}
        extra={<ProgressBadge topicId={topicId} />}
      />
      {topicDescription(topicId) ? <p className="lede">{topicDescription(topicId)}</p> : null}

      {lessonReady ? (
        <button type="button" className="list-row" onClick={() => open('lesson')}>
          <span>
            <strong>Lesson</strong>
            <div className="muted">Bite-sized screens, then a quick check-in</div>
          </span>
          <span className={`badge ${lessonDone ? 'done' : lessonRecord ? 'started' : ''}`}>
            {pieceBadgeText(lessonRecord)}
          </span>
        </button>
      ) : null}

      {quizReady ? (
        <button type="button" className="list-row" onClick={() => open('quiz')}>
          <span>
            <strong>Quiz</strong>
            <div className="muted">Six question styles, instant feedback</div>
          </span>
          <span className={`badge ${quizDone ? 'done' : quizRecord ? 'started' : ''}`}>
            {quizDone ? `${quizRecord.score}/${quizRecord.total}` : pieceBadgeText(quizRecord, 'Quiz')}
          </span>
        </button>
      ) : null}

      {hasExercises(topicId) ? (
        <button type="button" className="list-row" onClick={() => open('exercise')}>
          <span>
            <strong>Practice</strong>
            <div className="muted">{exercises[topicId].exercises.length} try-it exercises</div>
          </span>
          <span className="badge">Try it</span>
        </button>
      ) : null}

      <PrimaryButton
        onClick={() => {
          if (primary === 'lesson') open('lesson');
          else if (primary === 'quiz') open('quiz');
          else if (primary === 'practice') open('exercise');
          else goBack();
        }}
      >
        {primary === 'lesson'
          ? 'Continue'
          : primary === 'quiz'
            ? 'Start quiz'
            : primary === 'practice'
              ? 'Practice'
              : lab
                ? 'Back to Code'
                : 'Back to path'}
      </PrimaryButton>
    </div>
  );
}
