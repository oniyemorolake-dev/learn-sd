import ScreenHeader from '../components/ScreenHeader.jsx';
import ComingSoon from '../components/ComingSoon.jsx';
import PrimaryButton from '../components/PrimaryButton.jsx';
import { useApp } from '../context/AppContext.jsx';
import {
  exercises,
  findTopic,
  hasExercises,
  hasLesson,
  hasQuiz,
  hasTopicContent,
  topicDescription,
  topicTitle,
} from '../lib/content.js';

export default function TopicScreen() {
  const { view, go, state } = useApp();
  const topicId = view.params.topicId;
  const meta = findTopic(topicId);
  const title = topicTitle(topicId);
  const lessonDone = Boolean(state.lessons[topicId]?.completed);
  const quizDone = Boolean(state.quizzes[topicId]?.completed);

  if (!hasTopicContent(topicId)) {
    return (
      <div>
        <ScreenHeader
          title={title}
          course={meta?.course}
          kicker={meta ? null : 'Topic'}
          onBack={() => go('path')}
        />
        <ComingSoon title={title} onContinue={() => go('path')} />
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
      <ScreenHeader title={title} course={meta?.course} onBack={() => go('path')} />
      {topicDescription(topicId) ? <p className="lede">{topicDescription(topicId)}</p> : null}

      {lessonReady ? (
        <button type="button" className="list-row" onClick={() => go('lesson', { topicId })}>
          <span>
            <strong>Lesson</strong>
            <div className="muted">Bite-sized screens, then a quick check-in</div>
          </span>
          <span className={`badge ${lessonDone ? 'done' : ''}`}>{lessonDone ? 'Done' : 'Start'}</span>
        </button>
      ) : null}

      {quizReady ? (
        <button type="button" className="list-row" onClick={() => go('quiz', { topicId })}>
          <span>
            <strong>Quiz</strong>
            <div className="muted">Six question styles, instant feedback</div>
          </span>
          <span className={`badge ${quizDone ? 'done' : ''}`}>
            {quizDone ? `${state.quizzes[topicId].score}/${state.quizzes[topicId].total}` : 'Quiz'}
          </span>
        </button>
      ) : null}

      {hasExercises(topicId) ? (
        <button type="button" className="list-row" onClick={() => go('exercise', { topicId })}>
          <span>
            <strong>Practice</strong>
            <div className="muted">{exercises[topicId].exercises.length} try-it exercises</div>
          </span>
          <span className="badge">Try it</span>
        </button>
      ) : null}

      <PrimaryButton
        onClick={() => {
          if (primary === 'lesson') go('lesson', { topicId });
          else if (primary === 'quiz') go('quiz', { topicId });
          else if (primary === 'practice') go('exercise', { topicId });
          else go('path');
        }}
      >
        {primary === 'lesson'
          ? 'Continue'
          : primary === 'quiz'
            ? 'Start quiz'
            : primary === 'practice'
              ? 'Practice'
              : 'Back to path'}
      </PrimaryButton>
    </div>
  );
}
