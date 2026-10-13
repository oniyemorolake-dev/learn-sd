import PrimaryButton from './PrimaryButton.jsx';

export default function ComingSoon({ title, onContinue }) {
  return (
    <div className="card empty">
      <p className="kicker">Coming soon</p>
      <h2 style={{ margin: '8px 0 0' }}>{title}</h2>
      <p>This topic is on the path. Original lessons will land here — nothing copied from course slides.</p>
      {onContinue ? <PrimaryButton onClick={onContinue}>Back to path</PrimaryButton> : null}
    </div>
  );
}
