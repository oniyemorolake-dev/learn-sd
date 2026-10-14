import ScreenHeader from '../components/ScreenHeader.jsx';
import ComingSoon from '../components/ComingSoon.jsx';
import { useApp } from '../context/AppContext.jsx';
import {
  findCodeLabLanguage,
  isTopicComplete,
  topicDescription,
  topicTitle,
} from '../lib/content.js';

export default function CodeLanguageScreen() {
  const { view, go, state } = useApp();
  const language = findCodeLabLanguage(view.params.languageId);

  if (!language) {
    return (
      <div>
        <ScreenHeader title="Code Lab" kicker="Languages" onBack={() => go('code-lab')} />
        <ComingSoon title="That language is not in the lab" onContinue={() => go('code-lab')} />
      </div>
    );
  }

  return (
    <div className="stack">
      <ScreenHeader
        title={`${language.emoji} ${language.name}`}
        kicker="Code Lab"
        onBack={() => go('code-lab')}
      />
      <p className="lede">{language.tagline}</p>

      {language.topics.map((topicId, i) => {
        const done = isTopicComplete(topicId, state);
        return (
          <button
            key={topicId}
            type="button"
            className="list-row"
            onClick={() => go('topic', { topicId, from: 'code-lab', languageId: language.id })}
          >
            <span>
              <strong>
                {i + 1}. {topicTitle(topicId)}
              </strong>
              {topicDescription(topicId) ? <div className="muted">{topicDescription(topicId)}</div> : null}
            </span>
            <span className={`badge ${done ? 'done' : ''}`}>{done ? 'Done' : 'Open'}</span>
          </button>
        );
      })}
    </div>
  );
}
