import { useEffect, useState } from 'react';
import { fetchRemoteBuild, isRemoteNewer, reloadApp } from '../lib/version.js';

export default function UpdateBanner() {
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      if (document.visibilityState === 'hidden') return;
      const remote = await fetchRemoteBuild();
      if (!cancelled && isRemoteNewer(remote)) setAvailable(true);
    }

    check();
    window.addEventListener('pageshow', check);
    window.addEventListener('focus', check);
    document.addEventListener('visibilitychange', check);
    const timer = window.setInterval(check, 5 * 60 * 1000);
    return () => {
      cancelled = true;
      window.removeEventListener('pageshow', check);
      window.removeEventListener('focus', check);
      document.removeEventListener('visibilitychange', check);
      window.clearInterval(timer);
    };
  }, []);

  if (!available) return null;

  return (
    <div className="update-banner" role="status">
      <p>A new version is available.</p>
      <button type="button" className="btn-secondary" onClick={reloadApp}>
        Update
      </button>
    </div>
  );
}
