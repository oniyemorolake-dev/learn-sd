import { emptyState, hasProgress, normalizeState, STORAGE_PREFIX, STORAGE_KEY, todayStamp } from './storage.js';

export const BACKUP_APP = 'learn-sd';

function readStore(store) {
  return store || (typeof localStorage !== 'undefined' ? localStorage : null);
}

export function listPrefixedKeys(store = readStore()) {
  if (!store) return [];
  const keys = [];
  for (let i = 0; i < store.length; i += 1) {
    const key = store.key(i);
    if (key && key.startsWith(STORAGE_PREFIX)) keys.push(key);
  }
  return keys;
}

function parseStored(value) {
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

export function collectBackupKeys(store = readStore()) {
  const keys = {};
  for (const key of listPrefixedKeys(store)) {
    keys[key] = parseStored(store.getItem(key));
  }
  return keys;
}

export function buildBackup(store = readStore(), now = new Date()) {
  return {
    app: BACKUP_APP,
    exportedAt: now.toISOString(),
    keys: collectBackupKeys(store),
  };
}

export function backupFilename(date = new Date()) {
  return `learn-sd-backup-${todayStamp(date)}.json`;
}

export function parseBackup(raw) {
  let data;
  try {
    data = typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch {
    return { ok: false };
  }
  if (!data || data.app !== BACKUP_APP || !data.keys || typeof data.keys !== 'object' || Array.isArray(data.keys)) {
    return { ok: false };
  }
  return { ok: true, data };
}

export function hasStoredProgress(state) {
  return hasProgress(state);
}

export function applyBackup(data, store = readStore()) {
  if (!store || !data?.keys) return emptyState();
  for (const key of listPrefixedKeys(store)) {
    store.removeItem(key);
  }
  for (const [key, value] of Object.entries(data.keys)) {
    if (!key.startsWith(STORAGE_PREFIX)) continue;
    const raw = typeof value === 'string' ? value : JSON.stringify(value);
    store.setItem(key, raw);
  }
  try {
    const next = store.getItem(STORAGE_KEY);
    return next ? normalizeState(JSON.parse(next)) : emptyState();
  } catch {
    return emptyState();
  }
}

export function downloadBackup(backup, filename = backupFilename()) {
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
