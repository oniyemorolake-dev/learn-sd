const PYODIDE_VERSION = '0.27.5';
const PYODIDE_BASE = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

let pyodidePromise = null;

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing && window.loadPyodide) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error('Could not load Python runtime.'));
    document.head.appendChild(script);
  });
}

export function pythonRuntimePending() {
  return Boolean(pyodidePromise);
}

export async function getPyodide(onStatus) {
  if (pyodidePromise) return pyodidePromise;

  pyodidePromise = (async () => {
    onStatus?.('Loading Python in the browser…');
    await loadScript(`${PYODIDE_BASE}pyodide.js`);
    const pyodide = await window.loadPyodide({ indexURL: PYODIDE_BASE });
    onStatus?.('Python is ready.');
    return pyodide;
  })();

  try {
    return await pyodidePromise;
  } catch (err) {
    pyodidePromise = null;
    throw err;
  }
}

export async function runPython(code, onStatus) {
  const pyodide = await getPyodide(onStatus);
  const chunks = [];
  pyodide.setStdout({ batched: (text) => chunks.push(text) });
  pyodide.setStderr({ batched: (text) => chunks.push(text) });
  try {
    await pyodide.runPythonAsync(code);
    const output = chunks.join('').replace(/\s+$/g, '') || '(no output)';
    return { output, error: null };
  } catch (err) {
    return {
      output: chunks.join('').replace(/\s+$/g, ''),
      error: String(err.message || err),
    };
  }
}
