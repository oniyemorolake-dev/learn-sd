export const BUILD_ID = String(import.meta.env.VITE_BUILD_ID || 'dev');
export const BUILT_AT = String(import.meta.env.VITE_BUILT_AT || '');
export const APP_VERSION = String(import.meta.env.VITE_APP_VERSION || '1.2.0');

export function formatBuildLabel(builtAt = BUILT_AT, version = APP_VERSION) {
  const date = builtAt ? new Date(builtAt) : new Date();
  const stamp = Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return stamp ? `v${version} · ${stamp}` : `v${version}`;
}

export function isRemoteNewer(remote, localId = BUILD_ID) {
  return Boolean(remote?.id) && remote.id !== localId;
}

export async function fetchRemoteBuild() {
  try {
    const response = await fetch(`/version.json?t=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) return null;
    const data = await response.json();
    return data?.id ? data : null;
  } catch {
    return null;
  }
}

export function reloadApp() {
  window.location.reload();
}
