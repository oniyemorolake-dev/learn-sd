import ScreenHeader from '../components/ScreenHeader.jsx';
import ComingSoon from '../components/ComingSoon.jsx';
import { useApp } from '../context/AppContext.jsx';
import { findCodeLabLanguage, topicDescription, topicTitle } from '../lib/content.js';
import ProgressBadge from '../components/ProgressBadge.jsx';

export default function CodeLanguageScreen() {
  const { view, go } = useApp();
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

      <div className="card-grid">
        {language.topics.map((topicId, i) => (
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
              <ProgressBadge topicId={topicId} />
            </button>
        ))}
      </div>
    </div>
  );
}
