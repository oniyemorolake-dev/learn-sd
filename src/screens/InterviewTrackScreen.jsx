import ScreenHeader from '../components/ScreenHeader.jsx';
import { useApp } from '../context/AppContext.jsx';
import {
  exercises,
  interviewPrepLessons,
  interviewPrepTrack,
  INTERVIEW_EXERCISE_IDS,
  quizzes,
  topicTitle,
} from '../lib/content.js';

export default function InterviewTrackScreen() {
  const { go, view, state } = useApp();
  const track = interviewPrepTrack;
  const progress = { lessons: {}, practice: {}, ...state.tracks?.[track.trackId || track.id] };
  const backTo = view.params?.from === 'setup' ? 'setup' : 'path';
  const lessons = interviewPrepLessons();
  const quiz = quizzes['interview-prep-quiz'];
  const quizDone = Boolean(state.quizzes['interview-prep-quiz']?.completed);

  function open(name, params) {
    go(name, { ...params, from: 'interview-track', entryFrom: view.params?.from });
  }

  return (
    <div className="stack">
      <ScreenHeader title={track.title} kicker="Standalone track" onBack={() => go(backTo)} />
      <p className="lede">{track.description}</p>

      <p className="kicker">Lessons</p>
      {lessons.map((lesson, i) => {
        const done = Boolean(progress.lessons?.[lesson.id]?.completed);
        return (
          <button
            key={lesson.id}
            type="button"
            className="list-row"
            onClick={() => open('lesson', { topicId: lesson.id })}
          >
            <span>
              <strong>
                {i + 1}. {lesson.title}
              </strong>
              <div className="muted">{lesson.description}</div>
            </span>
            <span className={`badge ${done ? 'done' : ''}`}>{done ? 'Done' : 'Start'}</span>
          </button>
        );
      })}

      <p className="kicker">Quiz</p>
      <button
        type="button"
        className="list-row"
        onClick={() => open('quiz', { topicId: 'interview-prep-quiz' })}
      >
        <span>
          <strong>{quiz?.title || 'Interview Rapid-Fire'}</strong>
          <div className="muted">{quiz?.description || '10 questions, six formats'}</div>
        </span>
        <span className={`badge ${quizDone ? 'done' : ''}`}>
          {quizDone
            ? `${state.quizzes['interview-prep-quiz'].score}/${state.quizzes['interview-prep-quiz'].total}`
            : 'Quiz'}
        </span>
      </button>

      <p className="kicker">Problems</p>
      {INTERVIEW_EXERCISE_IDS.map((topicId) => {
        const pack = exercises[topicId];
        const list = pack?.exercises || [];
        const done = list.filter((ex) => state.exercises[ex.id]).length;
        return (
          <button
            key={topicId}
            type="button"
            className="list-row"
            onClick={() => open('exercise', { topicId })}
          >
            <span>
              <strong>{pack?.title || topicTitle(topicId)}</strong>
              <div className="muted">{list.length} JS playground problems</div>
            </span>
            <span className={`badge ${done === list.length && list.length ? 'done' : ''}`}>
              {done}/{list.length}
            </span>
          </button>
        );
      })}
    </div>
  );
}
