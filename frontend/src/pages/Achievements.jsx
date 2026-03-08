import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getLeaderboard, getProblems, getBugs } from '../api';

const allBadges = [
  { icon: '🔥', name: '7-Day Streak', check: u => (u.streak || 0) >= 7 },
  { icon: '🐛', name: 'First Bug Fix', check: u => (u.bugs_solved || []).length >= 1 },
  { icon: '⚡', name: 'Speed Solver', check: u => (u.solved || []).length >= 1 },
  { icon: '💡', name: 'No Hints', check: u => (u.solved || []).length >= 3 },
  { icon: '🌟', name: '10 Problems', check: u => (u.solved || []).length >= 10 },
  { icon: '👑', name: 'Top Scorer', check: u => (u.xp || 0) >= 2000 },
  { icon: '🔬', name: 'Trace Master', check: u => (u.xp || 0) >= 500 },
  { icon: '🚀', name: '30-Day Streak', check: u => (u.streak || 0) >= 30 },
];

export default function Achievements() {
  const { user } = useAuth();
  const [leaders, setLeaders] = useState([]);
  const [totalProblems, setTotalProblems] = useState(0);
  const [totalBugs, setTotalBugs] = useState(0);

  useEffect(() => {
    getLeaderboard().then(r => setLeaders(r.data));
    getProblems().then(r => setTotalProblems(r.data.length));
    getBugs().then(r => setTotalBugs(r.data.length));
  }, []);

  const solved = (user?.solved || []).length;
  const bugsSolved = (user?.bugs_solved || []).length;
  const medals = ['🥇', '🥈', '🥉'];
  const medalClass = ['gold', 'silver', 'bronze'];

  return (
    <div className="gamification-page page-enter">
      <h1>🏆 Achievements & Progress</h1>
      <div className="gam-grid">
        <div className="gam-card">
          <h3>🎖️ Badges</h3>
          <div className="badges-grid">
            {allBadges.map((b, i) => {
              const earned = b.check(user || {});
              return (
                <div key={i} className={`badge-item ${earned ? 'earned' : 'locked'}`} title={b.name}>
                  <div className="badge-icon">{b.icon}</div>
                  <div className="badge-name">{b.name}</div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="gam-card">
          <h3>📈 Leaderboard</h3>
          <ul className="leaderboard">
            {leaders.slice(0, 8).map((u, i) => {
              const isMe = u.id === user?.id;
              const initials = u.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
              return (
                <li key={u.id} className="lb-item" style={isMe ? { background: 'rgba(124,58,237,0.08)', borderRadius: '8px' } : {}}>
                  <span className={`lb-rank ${medalClass[i] || ''}`}>{medals[i] || i + 1}</span>
                  <div className="lb-avatar">{initials}</div>
                  <span className="lb-name">{u.name}{isMe ? ' (You)' : ''}</span>
                  <span className="lb-pts">{(u.xp || 0).toLocaleString()} XP</span>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="gam-card">
          <h3>🔥 Streak Calendar</h3>
          <div className="streak-display">
            <div className="streak-number">{user?.streak || 0}</div>
            <div className="streak-label">Day Streak 🔥</div>
          </div>
          <div className="streak-calendar">
            {Array.from({ length: 28 }, (_, i) => {
              const dayFromEnd = 27 - i;
              const streak = user?.streak || 0;
              let cls = 'cal-day';
              if (dayFromEnd < streak && dayFromEnd > 0) cls += ' done';
              if (dayFromEnd === 0) cls += ' today';
              return <div key={i} className={cls}></div>;
            })}
          </div>
        </div>
        <div className="gam-card">
          <h3>📊 Your Stats</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '13px', marginTop: '4px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Problems Solved</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent)' }}>{solved}/{totalProblems}</span>
              </div>
              <div style={{ height: '6px', background: 'var(--border)', borderRadius: '99px' }}>
                <div style={{ width: (totalProblems ? Math.round(solved / totalProblems * 100) : 0) + '%', height: '100%', background: 'var(--accent)', borderRadius: '99px' }}></div>
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Bugs Fixed</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent2)' }}>{bugsSolved}/{totalBugs}</span>
              </div>
              <div style={{ height: '6px', background: 'var(--border)', borderRadius: '99px' }}>
                <div style={{ width: (totalBugs ? Math.round(bugsSolved / totalBugs * 100) : 0) + '%', height: '100%', background: 'var(--accent2)', borderRadius: '99px' }}></div>
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Level Progress</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent3)' }}>{Math.min(100, Math.round(((user?.xp || 0) % 1000) / 10))}%</span>
              </div>
              <div style={{ height: '6px', background: 'var(--border)', borderRadius: '99px' }}>
                <div style={{ width: Math.min(100, Math.round(((user?.xp || 0) % 1000) / 10)) + '%', height: '100%', background: 'linear-gradient(90deg,var(--accent),var(--accent2))', borderRadius: '99px' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
