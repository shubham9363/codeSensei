import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <aside className="sidebar">
      <div className="sidebar-section">Practice</div>
      <NavLink to="/" end className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
        <span className="icon">🏠</span> Dashboard
      </NavLink>
      <NavLink to="/problems" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
        <span className="icon">📋</span> All Problems
      </NavLink>
      <NavLink to="/editor" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
        <span className="icon">💻</span> Code Editor
      </NavLink>
      <NavLink to="/bughunt" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
        <span className="icon">🐛</span> Bug Hunt
      </NavLink>
      <NavLink to="/tracer" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
        <span className="icon">👁️</span> Visual Tracer
      </NavLink>
      <div className="sidebar-section">Progress</div>
      <NavLink to="/achievements" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
        <span className="icon">🏆</span> Achievements
      </NavLink>
      <NavLink to="/profile" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
        <span className="icon">👤</span> My Profile
      </NavLink>

      {(user.role === 'mentor' || user.role === 'admin') && (
        <>
          <div className="sidebar-section">Teaching</div>
          <NavLink to="/mentor" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <span className="icon">👨‍🏫</span> Mentor Panel
          </NavLink>
        </>
      )}

      {user.role === 'admin' && (
        <>
          <div className="sidebar-section">Administration</div>
          <NavLink to="/admin" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <span className="icon">🔧</span> Admin Panel
          </NavLink>
        </>
      )}

      <div className="stats-card">
        <div className="stat-row"><span className="stat-label">Solved</span><span className="stat-val purple">{(user.solved || []).length}</span></div>
        <div className="stat-row"><span className="stat-label">Bugs Fixed</span><span className="stat-val cyan">{(user.bugs_solved || []).length}</span></div>
        <div className="stat-row"><span className="stat-label">Total XP</span><span className="stat-val gold">{(user.xp || 0).toLocaleString()}</span></div>
        <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>Level {user.level} Progress</div>
        <div className="level-bar"><div className="level-fill" style={{ width: Math.min(100, (user.xp % 1000) / 10) + '%' }}></div></div>
      </div>
    </aside>
  );
}
