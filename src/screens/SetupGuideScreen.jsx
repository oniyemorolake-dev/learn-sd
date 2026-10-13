import { useState } from 'react';
import ScreenHeader from '../components/ScreenHeader.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import PrimaryButton from '../components/PrimaryButton.jsx';
import ComingSoon from '../components/ComingSoon.jsx';
import Footer from '../components/Footer.jsx';
import { useApp } from '../context/AppContext.jsx';
import { findCourseByCode, setupGuides } from '../lib/content.js';

export default function SetupGuideScreen() {
  const { view, go } = useApp();
  const guide = setupGuides[view.params.guideId];
  const [step, setStep] = useState(0);

  if (!guide) {
    return (
      <div>
        <ScreenHeader title="Setup" onBack={() => go('setup')} />
        <ComingSoon title="Guide not found" onContinue={() => go('setup')} />
      </div>
    );
  }

  const current = guide.steps[step];
  const last = step === guide.steps.length - 1;
  const course = findCourseByCode(guide.forCourse);

  return (
    <div className="stack">
      <ScreenHeader
        title={guide.title}
        course={course}
        kicker={course ? null : `Step ${step + 1} of ${guide.steps.length}`}
        onBack={() => go('setup')}
      />
      <ProgressBar value={step + 1} max={guide.steps.length} />
      <article className="card">
        <p className="kicker">Step {step + 1}</p>
        <p>{current.instruction}</p>
        {current.command ? <pre className="output">{current.command}</pre> : null}
        {current.expectedResult ? (
          <p className="key-point">Success looks like: {current.expectedResult}</p>
        ) : null}
      </article>
      {last ? (
        <PrimaryButton onClick={() => go('setup')}>Done</PrimaryButton>
      ) : (
        <PrimaryButton onClick={() => setStep((n) => n + 1)}>Continue</PrimaryButton>
      )}
      <Footer />
    </div>
  );
}
