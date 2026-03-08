import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../api';
import { useToast } from '../components/Toast';

export default function Profile() {
  const { user, login } = useAuth(); // login function or set user function? We don't have a direct setUser, but we can update auth context by reloading or maybe calling getMe. Let's just update local state and rely on next fetch.
  const showToast = useToast();
  
  const [form, setForm] = useState({
    name: '',
    bio: '',
    institution: '',
    github: '',
    linkedin: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        bio: user.bio || '',
        institution: user.institution || '',
        github: user.github || '',
        linkedin: user.linkedin || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateProfile(form);
      showToast?.('✅', 'Profile Updated', 'Your profile has been successfully saved.');
      setIsEditing(false);
      // Ideally we'd update user context here, for now a reload works or we let the next page load handle it, since name usually stays mostly same. Let's force a reload for now.
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      showToast?.('❌', 'Error', err.response?.data?.message || 'Failed to update profile');
    }
    setIsLoading(false);
  };

  if (!user) return null;

  return (
    <div className="page-enter" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1>👤 User Profile</h1>
      <p style={{ color: 'var(--muted)', marginBottom: '24px' }}>Manage your personal details and view your progress.</p>

      <div className="gam-grid" style={{ gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.5fr)' }}>
        
        {/* Left Column: Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="gam-card">
            <h3 style={{ marginBottom: '16px' }}>📊 Your Progress</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), var(--accent2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 800, color: '#fff' }}>
                {user.level}
              </div>
              <div>
                <div style={{ fontSize: '18px', fontWeight: 700 }}>Level {user.level}</div>
                <div style={{ fontSize: '14px', color: 'var(--muted)' }}>{user.xp} XP Total</div>
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', color: 'var(--muted)' }}>Level Progress</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent)' }}>{Math.min(100, Math.round(((user.xp || 0) % 1000) / 10))}%</span>
            </div>
            <div style={{ height: '8px', background: 'var(--border)', borderRadius: '99px', marginBottom: '20px' }}>
              <div style={{ width: Math.min(100, Math.round(((user.xp || 0) % 1000) / 10)) + '%', height: '100%', background: 'linear-gradient(90deg,var(--accent),var(--accent2))', borderRadius: '99px' }}></div>
            </div>

            <div className="stat-row"><span className="stat-label">Problems Solved</span><span className="stat-val purple">{(user.solved || []).length}</span></div>
            <div className="stat-row"><span className="stat-label">Bugs Fixed</span><span className="stat-val cyan">{(user.bugs_solved || []).length}</span></div>
            <div className="stat-row"><span className="stat-label">Current Streak</span><span className="stat-val gold">🔥 {user.streak || 0}</span></div>
            <div className="stat-row"><span className="stat-label">Badges Earned</span><span className="stat-val purple">{(user.badges || []).length}</span></div>
            <div className="stat-row"><span className="stat-label">Role</span><span className={`tag tag-${(user.role || '').toLowerCase()}`}>{user.role}</span></div>
            <div className="stat-row"><span className="stat-label">Verified Email</span><span className={`tag ${user.verified ? 'tag-easy' : 'tag-hard'}`}>{user.verified ? 'Yes' : 'No'}</span></div>
          </div>
        </div>

        {/* Right Column: Personal Details */}
        <div className="gam-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3>📝 Personal Details</h3>
            {!isEditing && (
              <button className="btn btn-primary" onClick={() => setIsEditing(true)}>Edit Profile</button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label>Full Name</label>
              {isEditing ? (
                <input className="form-input" name="name" value={form.name} onChange={handleChange} placeholder="Your name" />
              ) : (
                <div style={{ padding: '12px 16px', background: 'var(--surface)', borderRadius: '12px', color: 'var(--text)', border: '1px solid var(--border)' }}>{form.name || '—'}</div>
              )}
            </div>

            <div className="form-group">
              <label>Bio</label>
              {isEditing ? (
                <textarea className="form-input" name="bio" value={form.bio} onChange={handleChange} placeholder="Tell us about yourself..." style={{ minHeight: '80px', resize: 'vertical' }} />
              ) : (
                <div style={{ padding: '12px 16px', background: 'var(--surface)', borderRadius: '12px', color: 'var(--text)', border: '1px solid var(--border)', minHeight: '80px', whiteSpace: 'pre-wrap' }}>{form.bio || '—'}</div>
              )}
            </div>

            <div className="form-group">
              <label>Institution / Company</label>
              {isEditing ? (
                <input className="form-input" name="institution" value={form.institution} onChange={handleChange} placeholder="E.g. NIT Warangal" />
              ) : (
                <div style={{ padding: '12px 16px', background: 'var(--surface)', borderRadius: '12px', color: 'var(--text)', border: '1px solid var(--border)' }}>{form.institution || '—'}</div>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>GitHub Profile URL</label>
                {isEditing ? (
                  <input className="form-input" name="github" value={form.github} onChange={handleChange} placeholder="https://github.com/username" />
                ) : (
                  <div style={{ padding: '12px 16px', background: 'var(--surface)', borderRadius: '12px', color: 'var(--text)', border: '1px solid var(--border)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {form.github ? <a href={form.github} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none' }}>{form.github}</a> : '—'}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>LinkedIn Profile URL</label>
                {isEditing ? (
                  <input className="form-input" name="linkedin" value={form.linkedin} onChange={handleChange} placeholder="https://linkedin.com/in/username" />
                ) : (
                  <div style={{ padding: '12px 16px', background: 'var(--surface)', borderRadius: '12px', color: 'var(--text)', border: '1px solid var(--border)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {form.linkedin ? <a href={form.linkedin} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none' }}>{form.linkedin}</a> : '—'}
                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <div style={{ padding: '12px 16px', background: 'var(--surface)', borderRadius: '12px', color: 'var(--muted)', border: '1px solid var(--border)', cursor: 'not-allowed' }}>
                {user.email} (Cannot be changed)
              </div>
            </div>

            {isEditing && (
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px', justifyContent: 'flex-end' }}>
                <button className="btn btn-ghost" onClick={() => {
                  setIsEditing(false);
                  setForm({
                    name: user.name || '',
                    bio: user.bio || '',
                    institution: user.institution || '',
                    github: user.github || '',
                    linkedin: user.linkedin || ''
                  });
                }} disabled={isLoading}>Cancel</button>
                <button className="btn btn-success" onClick={handleSave} disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
