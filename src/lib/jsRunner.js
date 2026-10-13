export function runJavaScript(code, timeoutMs = 2500) {
  return new Promise((resolve) => {
    const iframe = document.createElement('iframe');
    iframe.setAttribute('sandbox', 'allow-scripts');
    iframe.setAttribute('aria-hidden', 'true');
    iframe.style.cssText = 'position:absolute;width:0;height:0;border:0;overflow:hidden;';
    const channel = `js-run-${Math.random().toString(36).slice(2)}`;
    let settled = false;

    const finish = (payload) => {
      if (settled) return;
      settled = true;
      window.removeEventListener('message', onMessage);
      clearTimeout(timer);
      iframe.remove();
      resolve(payload);
    };

    const onMessage = (event) => {
      if (event.data?.channel !== channel) return;
      finish(event.data.payload);
    };

    window.addEventListener('message', onMessage);
    const timer = setTimeout(() => {
      finish({ output: '', error: 'This took too long, so I stopped it.' });
    }, timeoutMs);

    iframe.srcdoc = `<!doctype html><script>
      const channel = ${JSON.stringify(channel)};
      const logs = [];
      const format = (value) => {
        if (typeof value === 'string') return value;
        try { return JSON.stringify(value); } catch { return String(value); }
      };
      const console = {
        log: (...args) => logs.push(args.map(format).join(' ')),
        info: (...args) => logs.push(args.map(format).join(' ')),
        warn: (...args) => logs.push(args.map(format).join(' ')),
        error: (...args) => logs.push(args.map(format).join(' ')),
      };
      try {
        const fn = new Function('console', ${JSON.stringify(code)});
        const result = fn(console);
        if (result !== undefined) logs.push(format(result));
        parent.postMessage({ channel, payload: { output: logs.join('\\n') || '(no output)', error: null } }, '*');
      } catch (err) {
        parent.postMessage({
          channel,
          payload: { output: logs.join('\\n'), error: String(err && err.message ? err.message : err) },
        }, '*');
      }
    </${'script'}>`;

    document.body.appendChild(iframe);
  });
}

export function normalizeOutput(text) {
  return String(text ?? '')
    .replace(/\r\n/g, '\n')
    .replace(/\s+$/g, '')
    .trim();
}

export function outputsMatch(actual, expected) {
  return normalizeOutput(actual) === normalizeOutput(expected);
}
