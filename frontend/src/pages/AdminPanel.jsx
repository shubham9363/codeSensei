import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { getUsers, getProblems, getBugs, resetUser, deleteUser as apiDeleteUser, deleteProblem, deleteBug } from '../api';

export default function AdminPanel() {
  const { user, logout } = useAuth();
  const showToast = useToast();
  const [tab, setTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [problems, setProblems] = useState([]);
  const [bugs, setBugs] = useState([]);
  const [showResetAll, setShowResetAll] = useState(false);
  const [resetConfirm, setResetConfirm] = useState('');

  const refresh = () => {
    getUsers().then(r => setUsers(r.data)).catch(() => {});
    getProblems().then(r => setProblems(r.data)).catch(() => {});
    getBugs().then(r => setBugs(r.data)).catch(() => {});
  };

  useEffect(() => { refresh(); }, []);

  if (user?.role !== 'admin') {
    return <div className="admin-page page-enter"><p style={{ color: 'var(--muted)' }}>Admin access required.</p></div>;
  }

  const handleResetUser = async (uid) => {
    const u = users.find(x => x.id === uid);
    if (!u || !confirm(`Reset all progress for ${u.name}?`)) return;
    try {
      await resetUser(uid);
      showToast?.('🔄', 'Progress Reset', `${u.name}'s progress cleared`);
      refresh();
    } catch (e) { showToast?.('❌', 'Failed', e.message); }
  };

  const handleDeleteUser = async (uid) => {
    const u = users.find(x => x.id === uid);
    if (!u || !confirm(`Permanently delete ${u.name}?`)) return;
    try {
      await apiDeleteUser(uid);
      showToast?.('🗑️', 'User Deleted', `${u.name} removed`);
      refresh();
    } catch (e) { showToast?.('❌', 'Failed', e.message); }
  };

  const handleDeleteProblem = async (pid) => {
    if (!confirm('Delete this problem?')) return;
    try { await deleteProblem(pid); showToast?.('🗑️', 'Problem Deleted', ''); refresh(); }
    catch (e) { showToast?.('❌', 'Failed', e.message); }
  };

  const handleDeleteBug = async (bid) => {
    if (!confirm('Delete this bug challenge?')) return;
    try { await deleteBug(bid); showToast?.('🗑️', 'Bug Deleted', ''); refresh(); }
    catch (e) { showToast?.('❌', 'Failed', e.message); }
  };

  return (
    <div className="admin-page page-enter">
      <h1>🔧 Admin Panel</h1>
      <p>Manage users, problems, and platform settings.</p>
      <div className="admin-tabs">
        {['users', 'problems', 'danger'].map(t => (
          <div key={t} className={`admin-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t === 'users' ? '👥 Users' : t === 'problems' ? '📋 Problems' : '⚠️ Danger Zone'}
          </div>
        ))}
      </div>

      {tab === 'users' && (
        <div className="admin-card">
          <h3>All Users <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 400 }}>({users.length} total)</span></h3>
          <table className="users-table">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>XP</th><th>Progress</th><th>Actions</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td style={{ color: 'var(--muted)' }}>{u.email}</td>
                  <td><span className={`role-badge role-${u.role}`}>{u.role}</span></td>
                  <td style={{ color: 'var(--accent)', fontWeight: 700 }}>{u.xp} XP</td>
                  <td>{(u.solved || []).length} solved</td>
                  <td>
                    <button className="btn btn-ghost" style={{ fontSize: '11px', padding: '4px 9px' }} onClick={() => handleResetUser(u.id)}>Reset</button>
                    {u.id !== user.id && <button className="btn btn-danger" style={{ fontSize: '11px', padding: '4px 9px', marginLeft: '4px' }} onClick={() => handleDeleteUser(u.id)}>Delete</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'problems' && (
        <>
          <div className="admin-card">
            <h3>Coding Problems ({problems.length})</h3>
            <table className="users-table">
              <thead><tr><th>Title</th><th>Difficulty</th><th>Category</th><th>Pts</th><th>Actions</th></tr></thead>
              <tbody>
                {problems.map(p => (
                  <tr key={p.id}>
                    <td>{p.title}</td>
                    <td><span className={`tag tag-${(p.difficulty || '').toLowerCase()}`}>{p.difficulty}</span></td>
                    <td style={{ color: 'var(--muted)' }}>{p.category}</td>
                    <td style={{ color: 'var(--accent)', fontWeight: 700 }}>+{p.points}</td>
                    <td><button className="btn btn-danger" style={{ fontSize: '11px', padding: '4px 9px' }} onClick={() => handleDeleteProblem(p.id)}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="admin-card">
            <h3>Bug Challenges ({bugs.length})</h3>
            <table className="users-table">
              <thead><tr><th>Title</th><th>Difficulty</th><th>Pts</th><th>Actions</th></tr></thead>
              <tbody>
                {bugs.map(b => (
                  <tr key={b.id}>
                    <td>🐛 {b.title}</td>
                    <td><span className={`tag tag-${(b.difficulty || '').toLowerCase()}`}>{b.difficulty}</span></td>
                    <td style={{ color: 'var(--accent)', fontWeight: 700 }}>+{b.points}</td>
                    <td><button className="btn btn-danger" style={{ fontSize: '11px', padding: '4px 9px' }} onClick={() => handleDeleteBug(b.id)}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'danger' && (
        <div className="danger-zone">
          <h3>⚠️ Danger Zone</h3>
          <p>These actions are irreversible. Proceed with caution.</p>
          <div className="admin-card" style={{ marginBottom: '12px' }}>
            <h3 style={{ fontSize: '13px', color: 'var(--red)' }}>Reset All Student Progress</h3>
            <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '10px' }}>Resets XP, solved, bugs fixed, and streaks for ALL students.</p>
            <button className="btn btn-danger" onClick={() => setShowResetAll(true)}>Reset All Students</button>
            {showResetAll && (
              <div style={{ marginTop: '12px', background: 'var(--surface2)', borderRadius: '10px', padding: '14px' }}>
                <p style={{ fontSize: '13px', color: 'var(--accent3)', marginBottom: '10px' }}>⚠️ Type "RESET" to confirm:</p>
                <input className="form-input-sm" placeholder='Type "RESET"' value={resetConfirm} onChange={e => setResetConfirm(e.target.value)} style={{ marginBottom: '8px' }} />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-danger" onClick={async () => {
                    if (resetConfirm !== 'RESET') return showToast?.('❌', 'Wrong', 'Type exactly "RESET"');
                    const students = users.filter(u => u.role === 'student');
                    for (const s of students) { try { await resetUser(s.id); } catch (e) {} }
                    showToast?.('🔄', 'All Reset', `${students.length} students reset`);
                    setShowResetAll(false); setResetConfirm(''); refresh();
                  }}>⚠️ Yes, Reset All</button>
                  <button className="btn btn-ghost" onClick={() => { setShowResetAll(false); setResetConfirm(''); }}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
