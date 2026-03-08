import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Nav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;

  const tabs = [
    { to: '/', label: 'Dashboard' },
    { to: '/problems', label: 'Problems' },
    { to: '/editor', label: 'Editor' },
    { to: '/bughunt', label: 'Bug Hunt' },
    { to: '/tracer', label: 'Tracer' },
    { to: '/achievements', label: 'Achievements' },
  ];
  if (user.role === 'mentor' || user.role === 'admin') {
    tabs.push({ to: '/mentor', label: '👨‍🏫 Mentor' });
  }
  if (user.role === 'admin') {
    tabs.push({ to: '/admin', label: '🔧 Admin' });
  }

  const initials = user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const xpPct = Math.min(100, (user.xp % 1000) / 10);

  return (
    <nav>
      <div className="logo" onClick={() => navigate('/')}>Code<span>Sensei</span></div>
      <div className="nav-tabs">
        {tabs.map(t => (
          <NavLink key={t.to} to={t.to} end={t.to === '/'} className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}>
            {t.label}
          </NavLink>
        ))}
      </div>
      <div className="user-info">
        <div className="streak-badge">🔥 {user.streak || 0}</div>
        <div>
          <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '3px' }}>
            Level {user.level} · {user.xp} XP
          </div>
          <div className="xp-bar-mini"><div className="xp-fill" style={{ width: xpPct + '%' }}></div></div>
        </div>
        <span className={`role-badge role-${user.role}`}>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</span>
        <div className="avatar" onClick={() => navigate('/profile')} title="My Profile">{initials}</div>
        <div style={{ cursor: 'pointer', marginLeft: '8px', fontSize: '18px' }} onClick={() => { if (confirm('Log out?')) logout(); }} title="Logout">🚪</div>
      </div>
    </nav>
  );
}
