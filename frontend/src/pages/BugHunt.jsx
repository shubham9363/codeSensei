import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { getBugs, createSubmission, updateProgress } from '../api';

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export default function BugHunt() {
  const { user, refreshUser } = useAuth();
  const showToast = useToast();
  const [bugs, setBugs] = useState([]);
  const [idx, setIdx] = useState(0);
  const [fixCode, setFixCode] = useState('');
  const [timer, setTimer] = useState(300);
  const [showHint, setShowHint] = useState(false);
  const [hintsLeft, setHintsLeft] = useState(2);
  const [language, setLanguage] = useState('python');
  const timerRef = useRef(null);

  useEffect(() => {
    getBugs().then(r => {
      setBugs(r.data);
      if (r.data.length) setFixCode(r.data[0].buggy_code || '');
    });
  }, []);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimer(300);
    timerRef.current = setInterval(() => {
      setTimer(t => {
        if (t <= 1) { clearInterval(timerRef.current); showToast?.('⏰', "Time's up!", 'Try the next challenge'); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [idx]);

  const bug = bugs[idx % (bugs.length || 1)];
  if (!bugs.length) return <div className="bughunt-page page-enter"><p style={{ color: 'var(--muted)' }}>Loading bug challenges...</p></div>;

  const lines = (bug.buggy_code || '').split('\n');
  const bugLines = bug.bug_lines || [];
  const m = Math.floor(timer / 60);
  const s = timer % 60;

  const checkFix = () => {
    const keyword = bug.fix_keyword || '';
    return keyword ? fixCode.includes(keyword) : true;
  };

  const testFix = () => {
    if (checkFix()) showToast?.('✅', 'Bug appears fixed!', 'Submit to earn points');
    else showToast?.('❌', 'Bug still present', 'Read the hint for guidance');
  };

  const submitFix = async () => {
    if (!checkFix()) return showToast?.('💡', 'Not quite right', 'The fix is incomplete');
    clearInterval(timerRef.current);
    const bugsSolved = [...(user.bugs_solved || [])];
    if (!bugsSolved.includes(bug.id)) {
      bugsSolved.push(bug.id);
      const newXp = (user.xp || 0) + bug.points;
      const newLevel = Math.floor(newXp / 1000) + 1;
      try {
        await createSubmission({ problem_id: bug.id, code: fixCode, status: 'passed', type: 'bug', passed: true });
        await updateProgress({ xp: newXp, level: newLevel, bugs_solved: bugsSolved });
        await refreshUser();
      } catch (e) { /* ignore */ }
      showToast?.('🏆', 'Bug Hunt Complete!', `+${bug.points} XP earned!`);
    } else {
      showToast?.('✅', 'Already solved!', 'Move to the next challenge');
    }
  };

  const goTo = (i) => {
    const newIdx = Math.max(0, Math.min(bugs.length - 1, i));
    setIdx(newIdx);
    setFixCode(bugs[newIdx].buggy_code || '');
    setShowHint(false);
  };

  return (
    <div className="bughunt-page page-enter">
      <div className="bughunt-header">
        <div>
          <h1>🐛 Bug-Hunt Mode</h1>
          <p style={{ color: 'var(--muted)', fontSize: '13px', marginTop: '3px' }}>Find and fix the bug to earn points!</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div className="timer-box">⏱ {String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}</div>
          <button className="btn btn-ghost" onClick={() => { if (hintsLeft <= 0) return showToast?.('💡', 'No hints left!', ''); setHintsLeft(h => h - 1); setShowHint(true); }}>
            💡 Hint ({hintsLeft} left)
          </button>
        </div>
      </div>
      <div className="bug-nav">
        <button className="btn btn-ghost" onClick={() => goTo(idx - 1)}>← Prev</button>
        <button className="btn btn-ghost" onClick={() => goTo(idx + 1)}>Next →</button>
        <span className="bug-progress">{idx + 1} / {bugs.length} | +{bug.points} pts</span>
      </div>
      <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '10px', padding: '12px 16px', marginBottom: '14px' }}>
        <strong style={{ color: 'var(--accent3)' }}>{bug.title}</strong>
        <span style={{ fontSize: '13px', color: '#d0c080', marginLeft: '8px' }}>{bug.description}</span>
      </div>
      <div className="bughunt-grid">
        <div className="code-panel">
          <div className="panel-header"><span className="panel-title">🐛 Buggy Code</span><span className="panel-badge badge-bug">Contains Bug(s)</span></div>
          <div className="line-num-code">
            <div className="line-nums">
              {lines.map((_, i) => <div key={i} className={`line-num ${bugLines.includes(i + 1) ? 'bug-line' : ''}`}>{i + 1}</div>)}
            </div>
            <div className="buggy-code">
              {lines.map((line, i) => <div key={i} className={`code-line ${bugLines.includes(i + 1) ? 'highlighted' : ''}`} dangerouslySetInnerHTML={{ __html: escapeHtml(line) || '&nbsp;' }}></div>)}
            </div>
          </div>
        </div>
        <div className="code-panel">
          <div className="panel-header">
            <span className="panel-title">✏️ Your Fix</span>
            <select className="lang-select" value={language} onChange={e => setLanguage(e.target.value)} style={{ padding: '2px 8px', fontSize: '11px', height: 'auto' }}>
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="c">C</option>
              <option value="rust">Rust</option>
              <option value="go">Go</option>
            </select>
            <span className="panel-badge badge-fix">Edit Here</span>
          </div>
          <textarea className="fix-textarea" value={fixCode} onChange={e => setFixCode(e.target.value)} spellCheck={false}></textarea>
          <div className="bug-actions">
            <button className="btn btn-ghost" onClick={testFix}>▶ Test</button>
            <button className="btn btn-success" onClick={submitFix}>✓ Submit Fix</button>
            <span style={{ marginLeft: 'auto', fontSize: '12px', fontWeight: 700, color: 'var(--accent)' }}>+{bug.points} pts</span>
          </div>
        </div>
      </div>
      {showHint && (
        <div className="hint-box" style={{ display: 'block' }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent3)' }}>💡 Hint: </span>
          <span className="hint-text">{bug.hint}</span>
        </div>
      )}
      <div style={{ marginTop: '20px' }}>
        <div className="section-title">Bug Hunt History</div>
        <div className="problem-list">
          {bugs.map((b, i) => {
            const solved = (user.bugs_solved || []).includes(b.id);
            return (
              <div key={b.id} className="problem-item" onClick={() => goTo(i)}>
                <div className={`diff-dot diff-${(b.difficulty || '').toLowerCase()}`}></div>
                <span className="problem-name">{b.title}</span>
                <span className="problem-tag">{b.difficulty}</span>
                {solved && <span className="solved-check">✓ Fixed</span>}
                <span className="problem-pts">+{b.points} pts</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
