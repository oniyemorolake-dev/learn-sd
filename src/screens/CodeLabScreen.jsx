import ScreenHeader from '../components/ScreenHeader.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import { useApp } from '../context/AppContext.jsx';
import { codeLab, isTopicComplete } from '../lib/content.js';

export default function CodeLabScreen() {
  const { go, state } = useApp();

  return (
    <div className="stack">
      <ScreenHeader title="Code Lab" kicker="Languages" />
      <p className="lede">Pick a group. Five topics. Same lesson → quiz → practice flow.</p>

      {codeLab.languages.map((language) => {
        const done = language.topics.filter((topicId) => isTopicComplete(topicId, state)).length;
        return (
          <button
            key={language.id}
            type="button"
            className="list-row code-lang-card"
            onClick={() => go('code-language', { languageId: language.id })}
          >
            <span>
              <strong>
                {language.emoji} {language.name}
              </strong>
              <div className="muted">{language.tagline}</div>
              <ProgressBar value={done} max={language.topics.length} />
            </span>
            <span className={`badge ${done === language.topics.length ? 'done' : ''}`}>
              {done}/{language.topics.length}
            </span>
          </button>
        );
      })}
    </div>
  );
}
