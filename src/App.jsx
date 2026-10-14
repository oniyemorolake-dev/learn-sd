import { AppProvider, useApp } from './context/AppContext.jsx';
import TabBar from './components/TabBar.jsx';
import Byte from './components/Byte.jsx';
import PathScreen from './screens/PathScreen.jsx';
import TopicScreen from './screens/TopicScreen.jsx';
import LessonScreen from './screens/LessonScreen.jsx';
import QuizScreen from './screens/QuizScreen.jsx';
import PracticeScreen from './screens/PracticeScreen.jsx';
import ExerciseScreen from './screens/ExerciseScreen.jsx';
import PlaygroundScreen from './screens/PlaygroundScreen.jsx';
import SetupScreen from './screens/SetupScreen.jsx';
import SetupGuideScreen from './screens/SetupGuideScreen.jsx';
import ProgressScreen from './screens/ProgressScreen.jsx';
import BookmarksScreen from './screens/BookmarksScreen.jsx';
import AiTrackScreen from './screens/AiTrackScreen.jsx';
import AiLessonScreen from './screens/AiLessonScreen.jsx';
import AiPracticeScreen from './screens/AiPracticeScreen.jsx';
import InterviewTrackScreen from './screens/InterviewTrackScreen.jsx';
import Footer from './components/Footer.jsx';
import { SearchHost, SearchProvider } from './components/SearchOverlay.jsx';

function ScreenRouter() {
  const { view } = useApp();
  switch (view.name) {
    case 'topic':
      return <TopicScreen />;
    case 'lesson':
      return <LessonScreen />;
    case 'quiz':
      return <QuizScreen />;
    case 'practice':
      return <PracticeScreen />;
    case 'exercise':
      return <ExerciseScreen />;
    case 'playground':
      return <PlaygroundScreen />;
    case 'setup':
      return <SetupScreen />;
    case 'guide':
      return <SetupGuideScreen />;
    case 'progress':
      return <ProgressScreen />;
    case 'bookmarks':
      return <BookmarksScreen />;
    case 'ai-track':
      return <AiTrackScreen />;
    case 'ai-lesson':
      return <AiLessonScreen />;
    case 'ai-practice':
      return <AiPracticeScreen />;
    case 'interview-track':
      return <InterviewTrackScreen />;
    default:
      return <PathScreen />;
  }
}

export default function App() {
  return (
    <AppProvider>
      <SearchProvider>
        <div className="app-shell">
          <main className="app-main">
            <ScreenRouter />
            <Footer />
          </main>
          <Byte />
          <TabBar />
          <SearchHost />
        </div>
      </SearchProvider>
    </AppProvider>
  );
}
