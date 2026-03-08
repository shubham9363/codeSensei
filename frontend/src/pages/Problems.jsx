import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProblems } from '../api';

export default function Problems() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    getProblems().then(r => setProblems(r.data)).catch(() => {});
  }, []);

  const solved = user?.solved || [];
  const filtered = problems.filter(p => {
    const matchDiff = filter === 'all' || p.difficulty === filter;
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase());
    return matchDiff && matchSearch;
  });

  return (
    <div className="problems-page page-enter">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 800 }}>All Problems</h1>
        <span style={{ color: 'var(--muted)', fontSize: '13px' }}>{solved.length}/{problems.length} solved</span>
      </div>
      <div className="filter-bar">
        <input className="search-input" placeholder="Search problems..." value={search} onChange={e => setSearch(e.target.value)} />
        {['all', 'Easy', 'Medium', 'Hard'].map(d => (
          <button key={d} className={`filter-btn ${filter === d ? 'active' : ''}`} onClick={() => setFilter(d)}>
            {d === 'all' ? 'All' : d}
          </button>
        ))}
      </div>
      <table className="problems-table">
        <thead><tr><th>Title</th><th>Difficulty</th><th>Category</th><th>Complexity</th><th>Points</th></tr></thead>
        <tbody>
          {filtered.map(p => (
            <tr key={p.id} onClick={() => navigate(`/editor/${p.id}`)}>
              <td>
                <span className={`diff-dot diff-${(p.difficulty || '').toLowerCase()}`} style={{ display: 'inline-block', marginRight: '8px' }}></span>
                {solved.includes(p.id) ? '✅ ' : ''}{p.title}
              </td>
              <td><span className={`tag tag-${(p.difficulty || '').toLowerCase()}`}>{p.difficulty}</span></td>
              <td style={{ color: 'var(--muted)' }}>{p.category}</td>
              <td style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '11px', color: 'var(--muted)' }}>{p.time_complexity || '-'}</td>
              <td style={{ color: 'var(--accent)', fontWeight: 700 }}>+{p.points} pts</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
