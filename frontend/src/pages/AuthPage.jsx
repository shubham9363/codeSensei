import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { signup as apiSignup, verifyOtp, resendOtp } from '../api';

export default function AuthPage() {
  const { login } = useAuth();
  const [tab, setTab] = useState('login');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });

  // OTP verification state
  const [showOtp, setShowOtp] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpRefs = useRef([]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const handleLogin = async () => {
    setError(''); setSuccess('');
    try {
      await login(form.email, form.password);
    } catch (e) {
      const data = e.response?.data;
      if (data?.requiresVerification) {
        setOtpEmail(data.email || form.email);
        setShowOtp(true);
        setSuccess('Email not verified. A new OTP has been sent.');
        setResendCooldown(30);
      } else {
        setError(data?.message || 'Login failed');
      }
    }
  };

  const handleSignup = async () => {
    setError(''); setSuccess('');
    if (!form.name || !form.email || !form.password) return setError('Please fill all fields.');
    if (form.password.length < 6) return setError('Password must be at least 6 characters.');
    try {
      const res = await apiSignup({ name: form.name, email: form.email, password: form.password, role: form.role });
      if (res.data.requiresVerification) {
        setOtpEmail(form.email);
        setShowOtp(true);
        setSuccess('Check your email for the 6-digit OTP!');
        setResendCooldown(30);
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Signup failed');
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value.slice(-1);
    if (value && !/^\d$/.test(value)) return;
    const updated = [...otp];
    updated[index] = value;
    setOtp(updated);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const chars = pasted.split('');
    const updated = [...otp];
    chars.forEach((ch, i) => { updated[i] = ch; });
    setOtp(updated);
    const focusIdx = Math.min(chars.length, 5);
    otpRefs.current[focusIdx]?.focus();
  };

  const handleVerify = async () => {
    setError(''); setSuccess(''); setOtpLoading(true);
    const code = otp.join('');
    if (code.length < 6) { setError('Please enter the complete 6-digit OTP.'); setOtpLoading(false); return; }
    try {
      const res = await verifyOtp({ email: otpEmail, otp: code });
      localStorage.setItem('codesensei_token', res.data.token);
      window.location.reload(); // Reload to pick up auth context
    } catch (e) {
      setError(e.response?.data?.message || 'Verification failed');
      setOtpLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError(''); setSuccess('');
    try {
      await resendOtp({ email: otpEmail });
      setSuccess('New OTP sent to your email!');
      setOtp(['', '', '', '', '', '']);
      setResendCooldown(30);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to resend');
    }
  };

  const demoLogin = async (role) => {
    const emails = { student: 'student@codesensei.com', mentor: 'mentor@codesensei.com', admin: 'admin@codesensei.com' };
    const pass = role === 'admin' ? 'admin123' : role === 'mentor' ? 'mentor123' : 'student123';
    setError(''); setSuccess('');
    try { await login(emails[role], pass); }
    catch (e) {
      const data = e.response?.data;
      if (data?.requiresVerification) {
        setOtpEmail(data.email || emails[role]);
        setShowOtp(true);
        setSuccess('A new OTP has been sent.');
        setResendCooldown(30);
      } else {
        setError(data?.message || 'Demo login failed. Run seed first.');
      }
    }
  };

  // OTP VERIFICATION SCREEN
  if (showOtp) {
    return (
      <div className="auth-screen">
        <div className="auth-box" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📧</div>
          <div className="auth-logo">Verify Your <span>Email</span></div>
          <div className="auth-tagline">We sent a 6-digit code to <strong style={{ color: 'var(--accent2)' }}>{otpEmail}</strong></div>

          {error && <div className="auth-error">{error}</div>}
          {success && <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: 'var(--green)', marginBottom: '12px' }}>{success}</div>}

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', margin: '24px 0' }} onPaste={handleOtpPaste}>
            {otp.map((digit, i) => (
              <input key={i} ref={el => otpRefs.current[i] = el}
                type="text" inputMode="numeric" maxLength={1}
                value={digit} onChange={e => handleOtpChange(i, e.target.value)}
                onKeyDown={e => handleOtpKeyDown(i, e)}
                style={{
                  width: '48px', height: '56px', textAlign: 'center',
                  fontSize: '22px', fontWeight: 800, fontFamily: "'JetBrains Mono',monospace",
                  background: 'var(--surface2)', border: digit ? '2px solid var(--accent)' : '1px solid var(--border)',
                  borderRadius: '12px', color: 'var(--text)', outline: 'none',
                  transition: 'border-color 0.2s'
                }}
              />
            ))}
          </div>

          <button className="auth-btn" onClick={handleVerify} disabled={otpLoading} style={otpLoading ? { opacity: 0.6 } : {}}>
            {otpLoading ? 'Verifying...' : '✓ Verify Email'}
          </button>

          <div style={{ marginTop: '18px', fontSize: '13px', color: 'var(--muted)' }}>
            Didn't receive the code?{' '}
            {resendCooldown > 0 ? (
              <span style={{ color: 'var(--accent3)' }}>Resend in {resendCooldown}s</span>
            ) : (
              <span style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 700 }} onClick={handleResend}>Resend OTP</span>
            )}
          </div>
          <div style={{ marginTop: '12px' }}>
            <span style={{ fontSize: '12px', color: 'var(--muted)', cursor: 'pointer' }} onClick={() => { setShowOtp(false); setOtp(['', '', '', '', '', '']); setError(''); setSuccess(''); }}>
              ← Back to login
            </span>
          </div>
        </div>
      </div>
    );
  }

  // LOGIN / SIGNUP SCREEN
  return (
    <div className="auth-screen">
      <div className="auth-box">
        <div className="auth-logo">Code<span>Sensei</span></div>
        <div className="auth-tagline">Debug. Trace. Level up your coding skills.</div>
        <div className="auth-tabs">
          <button className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => { setTab('login'); setError(''); setSuccess(''); }}>Sign In</button>
          <button className={`auth-tab ${tab === 'signup' ? 'active' : ''}`} onClick={() => { setTab('signup'); setError(''); setSuccess(''); }}>Sign Up</button>
        </div>
        {error && <div className="auth-error">{error}</div>}
        {success && <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: 'var(--green)', marginBottom: '12px' }}>{success}</div>}

        {tab === 'login' ? (
          <div>
            <div className="form-group">
              <label>Email</label>
              <input className="form-input" type="email" placeholder="you@example.com" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input className="form-input" type="password" placeholder="••••••••" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
            </div>
            <button className="auth-btn" onClick={handleLogin}>Sign In →</button>
          </div>
        ) : (
          <div>
            <div className="form-group">
              <label>Full Name</label>
              <input className="form-input" type="text" placeholder="Your name" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input className="form-input" type="email" placeholder="you@example.com" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input className="form-input" type="password" placeholder="min 6 characters" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })} onKeyDown={e => e.key === 'Enter' && handleSignup()} />
            </div>
            <div className="form-group">
              <label>I am a...</label>
              <div className="role-select-group">
                {['student', 'mentor', 'admin'].map(r => (
                  <div key={r} className={`role-opt ${form.role === r ? 'selected' : ''}`} onClick={() => setForm({ ...form, role: r })}>
                    <span className="role-icon">{r === 'student' ? '🎓' : r === 'mentor' ? '👨‍🏫' : '🔧'}</span>{r.charAt(0).toUpperCase() + r.slice(1)}
                  </div>
                ))}
              </div>
            </div>
            <button className="auth-btn" onClick={handleSignup}>Create Account →</button>
          </div>
        )}

        <div className="demo-accounts">
          <div className="demo-title">Quick Demo Access</div>
          <div className="demo-btns">
            <button className="demo-btn" onClick={() => demoLogin('student')}>🎓 Student Demo</button>
            <button className="demo-btn" onClick={() => demoLogin('mentor')}>👨‍🏫 Mentor Demo</button>
            <button className="demo-btn" onClick={() => demoLogin('admin')}>🔧 Admin Demo</button>
          </div>
        </div>
      </div>
    </div>
  );
}
