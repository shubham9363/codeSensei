import { useState } from 'react';

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const defaultCode = `def factorial(n):
    result = 1
    for i in range(1, n + 1):
        result = result * i
    return result

x = factorial(5)
print(x)`;

const defaultSteps = [
  { line: 7, desc: "Call factorial(5)", vars: { x: "..." }, stack: ["<module>"] },
  { line: 1, desc: "Enter factorial(n=5)", vars: { n: 5, result: "..." }, stack: ["<module>", "factorial(5)"] },
  { line: 2, desc: "result = 1", vars: { n: 5, result: 1 }, stack: ["<module>", "factorial(5)"] },
  { line: 3, desc: "Loop: i=1", vars: { n: 5, result: 1, i: 1 }, stack: ["<module>", "factorial(5)"] },
  { line: 4, desc: "result = 1*1 = 1", vars: { n: 5, result: 1, i: 1 }, stack: ["<module>", "factorial(5)"] },
  { line: 3, desc: "Loop: i=2", vars: { n: 5, result: 1, i: 2 }, stack: ["<module>", "factorial(5)"] },
  { line: 4, desc: "result = 1*2 = 2", vars: { n: 5, result: 2, i: 2 }, stack: ["<module>", "factorial(5)"] },
  { line: 3, desc: "Loop: i=3", vars: { n: 5, result: 2, i: 3 }, stack: ["<module>", "factorial(5)"] },
  { line: 4, desc: "result = 2*3 = 6", vars: { n: 5, result: 6, i: 3 }, stack: ["<module>", "factorial(5)"] },
  { line: 3, desc: "Loop: i=4", vars: { n: 5, result: 6, i: 4 }, stack: ["<module>", "factorial(5)"] },
  { line: 4, desc: "result = 6*4 = 24", vars: { n: 5, result: 24, i: 4 }, stack: ["<module>", "factorial(5)"] },
  { line: 3, desc: "Loop: i=5", vars: { n: 5, result: 24, i: 5 }, stack: ["<module>", "factorial(5)"] },
  { line: 4, desc: "result = 24*5 = 120", vars: { n: 5, result: 120, i: 5 }, stack: ["<module>", "factorial(5)"] },
  { line: 5, desc: "return 120", vars: { n: 5, result: 120, i: 5 }, stack: ["<module>"] },
  { line: 7, desc: "x = 120", vars: { x: 120 }, stack: ["<module>"] },
  { line: 8, desc: "print(120) → Output: 120", vars: { x: 120 }, stack: ["<module>"] },
];

export default function Tracer() {
  const [code, setCode] = useState(defaultCode);
  const [steps] = useState(defaultSteps);
  const [idx, setIdx] = useState(-1);
  const codeLines = code.split('\n');

  const startTrace = () => setIdx(0);
  const stepTrace = (dir) => setIdx(i => Math.max(0, Math.min(steps.length - 1, i + dir)));
  const resetTrace = () => setIdx(-1);

  const step = idx >= 0 && idx < steps.length ? steps[idx] : null;

  return (
    <div className="tracer-page page-enter">
      <h1>👁️ Visual Code Tracer</h1>
      <p>Step through your code line-by-line and watch variables change in real time.</p>
      <div className="tracer-layout">
        <div className="tracer-left">
          <div className="tracer-code-box">
            <div className="panel-header"><span className="panel-title">Code Input</span><span style={{ fontSize: '11px', color: 'var(--muted)' }}>Python 3</span></div>
            <textarea className="tracer-editor" value={code} onChange={e => setCode(e.target.value)} spellCheck={false}></textarea>
            <div className="tracer-controls">
              <button className="btn btn-trace" onClick={startTrace}>▶ Start Trace</button>
              <button className="step-btn" onClick={() => stepTrace(-1)} disabled={idx <= 0}>← Prev</button>
              <button className="step-btn" onClick={() => stepTrace(1)} disabled={idx < 0 || idx >= steps.length - 1}>Next →</button>
              <button className="step-btn" onClick={resetTrace}>↺ Reset</button>
              <span className="step-count">Step: {idx < 0 ? 0 : idx + 1} / {steps.length}</span>
            </div>
          </div>
          <div className="tracer-code-box">
            <div className="panel-header"><span className="panel-title">Execution Trace</span></div>
            <div className="trace-lines">
              {step ? codeLines.map((line, i) => {
                const ln = i + 1;
                const isCurr = ln === step.line;
                const wasExec = steps.slice(0, idx).some(s => s.line === ln);
                return (
                  <div key={i} className={`trace-line ${isCurr ? 'current' : wasExec ? 'executed' : ''}`}>
                    <span className="trace-ln">{ln}</span>
                    <span className="trace-code" dangerouslySetInnerHTML={{ __html: escapeHtml(line) || '&nbsp;' }}></span>
                  </div>
                );
              }) : <div style={{ color: 'var(--muted)', fontSize: '13px', padding: '20px', textAlign: 'center' }}>Click "Start Trace" to begin.</div>}
            </div>
          </div>
        </div>
        <div className="trace-right">
          <div className="vars-box">
            <h3>📦 Variables</h3>
            {step ? Object.entries(step.vars).map(([k, v]) => (
              <div key={k} className="var-row var-changed"><span className="var-name">{k}</span><span className="var-val">{JSON.stringify(v)}</span></div>
            )) : <div style={{ color: 'var(--muted)', fontSize: '12px', textAlign: 'center', padding: '16px 0' }}>No variables yet</div>}
          </div>
          <div className="call-stack">
            <h3>📚 Call Stack</h3>
            {step ? [...step.stack].reverse().map((f, i) => (
              <div key={i} className={`stack-frame ${i === 0 ? 'top' : ''}`}>{f}</div>
            )) : <div style={{ color: 'var(--muted)', fontSize: '12px', textAlign: 'center', padding: '8px 0' }}>Empty</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
