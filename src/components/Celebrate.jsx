import { useMemo } from 'react';
import PrimaryButton from './PrimaryButton.jsx';
import SearchButton from './SearchButton.jsx';
import ThemeToggle from './ThemeToggle.jsx';

const COLORS = ['#2DD4BF', '#A855F7', '#F59E0B', '#7C3AED', '#ffffff'];

export default function Celebrate({ title, body, actionLabel = 'Continue', onContinue }) {
  const bits = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        left: `${6 + i * 6.5}%`,
        delay: `${i * 40}ms`,
        color: COLORS[i % COLORS.length],
      })),
    [],
  );

  return (
    <div className="celebrate">
      <header className="screen-header">
        <div style={{ flex: 1 }} />
        <div className="screen-header-actions">
          <SearchButton />
          <ThemeToggle />
        </div>
      </header>
      <div className="confetti" aria-hidden="true">
        {bits.map((bit) => (
          <i
            key={bit.left}
            style={{ left: bit.left, animationDelay: bit.delay, background: bit.color }}
          />
        ))}
      </div>
      <p className="kicker">Nice</p>
      <h2>{title}</h2>
      <p className="muted">{body}</p>
      <div style={{ marginTop: 20 }}>
        <PrimaryButton onClick={onContinue}>{actionLabel}</PrimaryButton>
      </div>
    </div>
  );
}
