import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProblems } from '../api';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);

  useEffect(() => {
    getProblems().then(r => setProblems(r.data)).catch(() => {});
  }, []);

  const solved = user?.solved || [];
  const bugsSolved = user?.bugs_solved || [];

  return (
    <div className="dashboard page-enter">
      <div className="dash-header">
        <h1>Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
        <p>You're on a {user?.streak || 0}-day streak! {(user?.streak || 0) >= 7 ? '🔥 Keep it up!' : 'Keep coding daily to build your streak!'}</p>
      </div>
      <div className="dash-grid">
        <div className="dash-card" onClick={() => navigate('/problems')}>
          <div className="dash-card-icon">💻</div>
          <div className="dash-card-title">Code Editor</div>
          <div className="dash-card-desc">Solve problems with real-time execution and test case validation.</div>
          <div className="dash-card-stat purple">{solved.length} solved</div>
        </div>
        <div className="dash-card" onClick={() => navigate('/bughunt')}>
          <div className="dash-card-icon">🐛</div>
          <div className="dash-card-title">Bug-Hunt Mode</div>
          <div className="dash-card-desc">Find and fix intentional bugs. Sharpen your debugging instincts.</div>
          <div className="dash-card-stat cyan">{bugsSolved.length} fixed</div>
        </div>
        <div className="dash-card" onClick={() => navigate('/tracer')}>
          <div className="dash-card-icon">🔍</div>
          <div className="dash-card-title">Visual Tracer</div>
          <div className="dash-card-desc">Step through your code line by line and watch variables change.</div>
          <div className="dash-card-stat gold">Interactive</div>
        </div>
      </div>
      <div className="section-title">
        Recent Problems
        <button className="btn btn-ghost" style={{ fontSize: '11px', padding: '5px 10px' }} onClick={() => navigate('/problems')}>View All →</button>
      </div>
      <div className="problem-list">
        {problems.slice(0, 6).map(p => (
          <div key={p.id} className="problem-item" onClick={() => navigate(`/editor/${p.id}`)}>
            <div className={`diff-dot diff-${(p.difficulty || '').toLowerCase()}`}></div>
            <span className="problem-name">{p.title}</span>
            <span className="problem-tag">{p.category}</span>
            <span className="problem-tag">{p.difficulty}</span>
            {solved.includes(p.id) && <span className="solved-check">✓</span>}
            <span className="problem-pts">+{p.points} pts</span>
          </div>
        ))}
      </div>
    </div>
  );
}
