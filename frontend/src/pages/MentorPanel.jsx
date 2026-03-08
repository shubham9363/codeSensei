import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { getSubmissions, getUsers, getProblems, getBugs, addFeedback, createProblem, createBug } from '../api';

export default function MentorPanel() {
  const { user } = useAuth();
  const showToast = useToast();
  const [tab, setTab] = useState('reviews');
  const [submissions, setSubmissions] = useState([]);
  const [users, setUsers] = useState([]);
  const [problems, setProblems] = useState([]);
  const [bugs, setBugs] = useState([]);
  const [newProb, setNewProb] = useState({ title: '', difficulty: 'Medium', category: '', points: 20, description: '', starter_code: '', logic_keywords: '', example: '' });
  const [newBug, setNewBug] = useState({ title: '', difficulty: 'Medium', points: 25, description: '', buggy_code: '', hint: '', fix_keyword: '' });

  useEffect(() => {
    getSubmissions().then(r => setSubmissions(r.data)).catch(() => {});
    getUsers().then(r => setUsers(r.data)).catch(() => {});
    getProblems().then(r => setProblems(r.data)).catch(() => {});
    getBugs().then(r => setBugs(r.data)).catch(() => {});
  }, []);

  const sendFeedback = async (subId, textarea) => {
    const text = textarea.value.trim();
    if (!text) return showToast?.('❌', 'Empty feedback', 'Write something first');
    try {
      await addFeedback(subId, text);
      showToast?.('📨', 'Feedback Sent!', 'Student has been notified');
      textarea.value = '';
    } catch (e) { showToast?.('❌', 'Failed', e.message); }
  };

  const handleAddProblem = async () => {
    if (!newProb.title || !newProb.description) return showToast?.('❌', 'Missing fields', 'Title and description required');
    try {
      const keywords = newProb.logic_keywords.split(',').map(k => k.trim()).filter(Boolean);
      const exParts = newProb.example.split('→').map(s => s.trim());
      await createProblem({
        ...newProb, points: parseInt(newProb.points) || 20,
        logic_keywords: keywords,
        examples: newProb.example ? [{ in: exParts[0] || '', out: exParts[1] || '' }] : [],
      });
      showToast?.('✅', 'Problem Added!', `"${newProb.title}" is now live`);
      setNewProb({ title: '', difficulty: 'Medium', category: '', points: 20, description: '', starter_code: '', logic_keywords: '', example: '' });
      getProblems().then(r => setProblems(r.data));
    } catch (e) { showToast?.('❌', 'Failed', e.message); }
  };

  const handleAddBug = async () => {
    if (!newBug.title || !newBug.buggy_code) return showToast?.('❌', 'Missing fields', 'Title and code required');
    try {
      await createBug({ ...newBug, points: parseInt(newBug.points) || 25 });
      showToast?.('🐛', 'Bug Challenge Added!', `"${newBug.title}" is now live`);
      setNewBug({ title: '', difficulty: 'Medium', points: 25, description: '', buggy_code: '', hint: '', fix_keyword: '' });
      getBugs().then(r => setBugs(r.data));
    } catch (e) { showToast?.('❌', 'Failed', e.message); }
  };

  if (user?.role !== 'mentor' && user?.role !== 'admin') {
    return <div className="mentor-page page-enter"><p style={{ color: 'var(--muted)' }}>Mentor access required.</p></div>;
  }

  return (
    <div className="mentor-page page-enter">
      <h1>👨‍🏫 Mentor Panel</h1>
      <p>Review student submissions, check logic, provide feedback, and add new problems.</p>
      <div className="mentor-tabs">
        {['reviews', 'addproblem', 'addbug'].map(t => (
          <div key={t} className={`mentor-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t === 'reviews' ? '📋 Review' : t === 'addproblem' ? '➕ Add Problem' : '🐛 Add Bug'}
          </div>
        ))}
      </div>

      {tab === 'reviews' && (
        <div>
          {submissions.length === 0 ? <div style={{ color: 'var(--muted)', textAlign: 'center', padding: '30px', fontSize: '13px' }}>No submissions yet.</div> :
            submissions.slice(0, 20).map(s => {
              const student = users.find(u => u.id === s.user_id);
              const prob = problems.find(p => p.id === s.problem_id) || bugs.find(b => b.id === s.problem_id);
              return (
                <div key={s.id} className="submission-card">
                  <div className="submission-header">
                    <div><div className="sub-student">👤 {student?.name || 'Unknown'}</div><div className="sub-problem">{prob?.title || `Problem #${s.problem_id}`}</div></div>
                    <div className="sub-time">{s.submitted_at ? new Date(s.submitted_at).toLocaleString() : 'Recently'}</div>
                  </div>
                  <div className="sub-code">{s.code}</div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                    <span className={`tag ${s.passed ? 'tag-easy' : 'tag-hard'}`}>{s.passed ? '✅ Passed' : '❌ Failed'}</span>
                    {s.feedback && <span style={{ fontSize: '11px', color: 'var(--accent2)' }}>📝 Feedback sent</span>}
                  </div>
                  <textarea className="mentor-feedback" placeholder={`Add feedback for ${student?.name || 'student'}...`} id={`fb-${s.id}`}></textarea>
                  <button className="btn btn-success" onClick={() => sendFeedback(s.id, document.getElementById(`fb-${s.id}`))}>✓ Send Feedback</button>
                </div>
              );
            })}
        </div>
      )}

      {tab === 'addproblem' && (
        <div className="add-problem-form">
          <h3>➕ Add New Problem</h3>
          <div className="form-row">
            <div className="form-group"><label>Title</label><input className="form-input-sm" value={newProb.title} onChange={e => setNewProb({...newProb, title: e.target.value})} placeholder="e.g. Longest Common Subsequence" /></div>
            <div className="form-group"><label>Difficulty</label><select className="select-sm" value={newProb.difficulty} onChange={e => setNewProb({...newProb, difficulty: e.target.value})}><option>Easy</option><option>Medium</option><option>Hard</option></select></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Category</label><input className="form-input-sm" value={newProb.category} onChange={e => setNewProb({...newProb, category: e.target.value})} placeholder="e.g. Dynamic Programming" /></div>
            <div className="form-group"><label>Points</label><input className="form-input-sm" type="number" value={newProb.points} onChange={e => setNewProb({...newProb, points: e.target.value})} /></div>
          </div>
          <div className="form-group"><label>Description</label><textarea className="form-input-sm" value={newProb.description} onChange={e => setNewProb({...newProb, description: e.target.value})} placeholder="Describe the problem..." /></div>
          <div className="form-group"><label>Starter Code</label><textarea className="form-input-sm" value={newProb.starter_code} onChange={e => setNewProb({...newProb, starter_code: e.target.value})} placeholder="def solution():&#10;    pass" /></div>
          <div className="form-group"><label>Logic Keywords (comma-separated)</label><input className="form-input-sm" value={newProb.logic_keywords} onChange={e => setNewProb({...newProb, logic_keywords: e.target.value})} placeholder="dict, hash, enumerate" /></div>
          <div className="form-group"><label>Example (Input → Output)</label><input className="form-input-sm" value={newProb.example} onChange={e => setNewProb({...newProb, example: e.target.value})} placeholder="[1,2,3] → 6" /></div>
          <button className="btn btn-success" onClick={handleAddProblem} style={{ marginTop: '4px' }}>➕ Add Problem</button>
        </div>
      )}

      {tab === 'addbug' && (
        <div className="add-problem-form">
          <h3>🐛 Add New Bug Challenge</h3>
          <div className="form-row">
            <div className="form-group"><label>Title</label><input className="form-input-sm" value={newBug.title} onChange={e => setNewBug({...newBug, title: e.target.value})} /></div>
            <div className="form-group"><label>Difficulty</label><select className="select-sm" value={newBug.difficulty} onChange={e => setNewBug({...newBug, difficulty: e.target.value})}><option>Easy</option><option>Medium</option><option>Hard</option></select></div>
          </div>
          <div className="form-group"><label>Description</label><input className="form-input-sm" value={newBug.description} onChange={e => setNewBug({...newBug, description: e.target.value})} /></div>
          <div className="form-group"><label>Buggy Code</label><textarea className="form-input-sm" style={{ minHeight: '140px' }} value={newBug.buggy_code} onChange={e => setNewBug({...newBug, buggy_code: e.target.value})} /></div>
          <div className="form-group"><label>Hint</label><textarea className="form-input-sm" value={newBug.hint} onChange={e => setNewBug({...newBug, hint: e.target.value})} /></div>
          <div className="form-row">
            <div className="form-group"><label>Fix Keyword</label><input className="form-input-sm" value={newBug.fix_keyword} onChange={e => setNewBug({...newBug, fix_keyword: e.target.value})} /></div>
            <div className="form-group"><label>Points</label><input className="form-input-sm" type="number" value={newBug.points} onChange={e => setNewBug({...newBug, points: e.target.value})} /></div>
          </div>
          <button className="btn btn-success" onClick={handleAddBug} style={{ marginTop: '4px' }}>🐛 Add Bug Challenge</button>
        </div>
      )}
    </div>
  );
}
