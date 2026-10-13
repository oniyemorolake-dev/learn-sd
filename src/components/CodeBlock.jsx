export default function CodeBlock({ language, snippet }) {
  if (!snippet) return null;
  return (
    <div className="code-block">
      {language ? <div className="kicker">{language}</div> : null}
      <pre>
        <code>{snippet}</code>
      </pre>
    </div>
  );
}
