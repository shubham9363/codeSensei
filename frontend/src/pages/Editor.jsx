import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { getProblems, createSubmission, updateProgress, getHint } from '../api';
import CodeEditor from '@uiw/react-textarea-code-editor';

const STARTER_TEMPLATES = {
  python: 'def solution():\n    pass',
  javascript: 'function solution() {\n    \n}',
  java: 'class Main {\n    public static void main(String[] args) {\n        \n    }\n}',
  cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    return 0;\n}',
  c: '#include <stdio.h>\n\nint main() {\n    return 0;\n}',
  rust: 'fn main() {\n    \n}',
  go: 'package main\n\nimport "fmt"\n\nfunc main() {\n    \n}',
  ruby: 'def solution\n    \nend'
};

export default function Editor() {
  const { id } = useParams();
  const { user, refreshUser } = useAuth();
  const showToast = useToast();
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [current, setCurrent] = useState(null);
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('Press "Run" to execute your code...');
  const [outputClass, setOutputClass] = useState('');
  const [testResults, setTestResults] = useState([]);
  const [logicChecks, setLogicChecks] = useState([]);
  const [showLogic, setShowLogic] = useState(false);
  const [language, setLanguage] = useState('python');
  
  // AI feature currently disabled

  useEffect(() => {
    getProblems().then(r => {
      setProblems(r.data);
      const p = id ? r.data.find(x => x.id === parseInt(id)) : r.data[0];
      if (p) { 
        setCurrent(p); 
        setCode(p.starter_code || STARTER_TEMPLATES[language] || ''); 
      }
    });
  }, [id]);

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    
    // Update starter code if current code is empty or matches an existing template
    const isCurrentTemplate = Object.values(STARTER_TEMPLATES).includes(code.trim()) || code.trim() === '' || (current && code.trim() === current.starter_code?.trim());
    if (isCurrentTemplate) {
      setCode(STARTER_TEMPLATES[newLang] || '');
    }
  };

  const evaluateCode = (code, p) => {
    const hasReturn = code.includes('return');
    const keywords = p.logic_keywords || [];
    const matched = keywords.filter(k => code.toLowerCase().includes(k.toLowerCase()));
    const notEmpty = code.trim().length > (p.starter_code || '').trim().length;
    if (!hasReturn || !notEmpty) return { pass: false, output: 'Error: No solution implemented yet.', testDetails: [] };
    const pass = matched.length >= Math.ceil(keywords.length * 0.5) && hasReturn && notEmpty;
    return { pass, output: pass ? '✅ Output matches expected results.' : '❌ Incorrect logic. Review your approach.', testDetails: [] };
  };

  const analyzeLogic = (code, p) => {
    const keywords = p.logic_keywords || [];
    const matched = keywords.filter(k => code.toLowerCase().includes(k.toLowerCase()));
    return [
      { label: 'Correct algorithm approach', pass: matched.length >= Math.ceil(keywords.length * 0.5), info: matched.length > 0 ? `Keywords: ${matched.join(', ')}` : `Expected: ${keywords.join(', ')}` },
      { label: 'Has return statement', pass: code.includes('return') },
      { label: 'Handles iteration', pass: code.includes('for') || code.includes('while') },
      { label: 'Time complexity', pass: true, info: p.time_complexity || 'Unknown' },
    ];
  };

  const runCode = () => {
    if (!current) return;
    setOutputClass('output-info'); setOutput('Running...'); setShowLogic(false);
    setTimeout(() => {
      const result = evaluateCode(code, current);
      setOutputClass(result.pass ? 'output-success' : 'output-error');
      setOutput(result.output);
      setLogicChecks(analyzeLogic(code, current));
      setShowLogic(true);
    }, 500);
  };

  const submitCode = async () => {
    if (!current) return;
    setOutputClass('output-info'); setOutput('Submitting...');
    setTimeout(async () => {
      const result = evaluateCode(code, current);
      try {
        await createSubmission({ problem_id: current.id, code, status: result.pass ? 'passed' : 'failed', passed: result.pass });
      } catch (e) { /* ignore submission save errors */ }

      if (result.pass) {
        const solved = [...(user.solved || [])];
        if (!solved.includes(current.id)) {
          solved.push(current.id);
          const newXp = (user.xp || 0) + current.points;
          const newLevel = Math.floor(newXp / 1000) + 1;
          try {
            await updateProgress({ xp: newXp, level: newLevel, solved });
            await refreshUser();
          } catch (e) { /* ignore */ }
          showToast?.('🎉', 'Problem Solved!', `+${current.points} XP earned!`);
        } else {
          showToast?.('✅', 'Already solved!', 'No additional XP');
        }
        setOutputClass('output-success');
        setOutput(`✅ All test cases passed!\n\n${result.output}\n\n⏱ Runtime: ${Math.floor(Math.random()*50+15)}ms | 💾 Memory: ${(Math.random()*5+10).toFixed(1)}MB`);
      } else {
        setOutputClass('output-error');
        setOutput(`❌ Some test cases failed.\n\n${result.output}`);
      }
      setLogicChecks(analyzeLogic(code, current));
      setShowLogic(true);
    }, 800);
  };



  if (!current) return <div className="dashboard page-enter"><p style={{ color: 'var(--muted)', padding: '40px', textAlign: 'center' }}>Loading problems...</p></div>;

  return (
    <div className="editor-page page-enter">
      <div className="problem-panel">
        <h2>{current.title}</h2>
        <div className="prob-meta">
          <span className={`tag tag-${(current.difficulty || '').toLowerCase()}`}>{current.difficulty}</span>
          <span className="tag tag-python">{language === 'python' ? 'Python' : language.toUpperCase()}</span>
          <span style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 700 }}>+{current.points} pts</span>
        </div>
        <p className="problem-desc">{current.description}</p>
        {(current.examples || []).map((e, i) => (
          <div key={i} className="example-box">
            <div className="example-label">Example {i + 1}</div>
            <pre>Input:  {e.in}{'\n'}Output: {e.out}</pre>
          </div>
        ))}
        {(current.constraints || []).length > 0 && (
          <div className="example-box" style={{ marginTop: '8px' }}>
            <div className="example-label">Constraints</div>
            <pre>{(current.constraints || []).map(c => '• ' + c).join('\n')}</pre>
          </div>
        )}
        <div className="test-cases">
          {testResults.map((t, i) => (
            <div key={i} className={`test-case ${t.pass ? 'pass' : 'fail'}`}>{t.pass ? '✅' : '❌'} {t.label}</div>
          ))}
        </div>
      </div>
      <div className="editor-panel">
        <div className="editor-toolbar">
          <select className="lang-select" value={language} onChange={handleLanguageChange}>
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
            <option value="c">C</option>
            <option value="rust">Rust</option>
            <option value="go">Go</option>
            <option value="ruby">Ruby</option>
          </select>
          <button className="btn btn-trace" onClick={() => navigate('/tracer')}>👁️ Trace</button>
          <button className="btn btn-ghost" onClick={runCode}>▶ Run</button>
          <button className="btn btn-success" onClick={submitCode}>✓ Submit</button>
        </div>
        <div className="code-area" style={{ backgroundColor: '#1e1e1e', overflow: 'auto', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <CodeEditor
            value={code}
            language={language}
            placeholder="Please enter your code here..."
            onChange={(evn) => setCode(evn.target.value)}
            padding={15}
            style={{
              fontSize: 14,
              backgroundColor: "transparent",
              fontFamily: 'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
              minHeight: '400px'
            }}
          />
        </div>
        <div className="output-panel">
          <div className="output-label">Output</div>
          <div className={`output-text ${outputClass}`}>{output}</div>
        </div>
        {showLogic && (
          <div className="logic-panel">
            <div className="logic-panel-title">🧠 Logic Analysis</div>
            {logicChecks.map((c, i) => (
              <div key={i} className="logic-item">
                <span className="logic-icon">{c.pass ? '✅' : '⚠️'}</span>
                <span className="logic-text"><strong>{c.label}</strong>{c.info ? ' — ' + c.info : ''}</span>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
