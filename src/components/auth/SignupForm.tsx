'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/components/ui/ToastProvider';

const ROLES = ['Frontend Engineer', 'Backend Developer', 'Fullstack Engineer'];

export default function SignupForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [role, setRole] = useState(ROLES[0]);
  const [loading, setLoading] = useState(false);
  const signup = useAuthStore((s) => s.signup);
  const router = useRouter();
  const toast = useToast();

  const passwordStrength = (p: string) => {
    let score = 0;
    if (p.length >= 8) score += 1;
    if (/[A-Z]/.test(p)) score += 1;
    if (/[0-9]/.test(p)) score += 1;
    if (/[^A-Za-z0-9]/.test(p)) score += 1;
    return score;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (!name || !email || !password || !confirm) { toast.push({ message: 'Please fill all fields', type: 'error' }); setLoading(false); return; }
    if (password !== confirm) { toast.push({ message: 'Passwords do not match', type: 'error' }); setLoading(false); return; }
    if (passwordStrength(password) < 2) { toast.push({ message: 'Password too weak', type: 'error' }); setLoading(false); return; }

    const res = await signup(name, email, password);
    setLoading(false);
    if (!res.ok) return toast.push({ message: res.error || 'Signup failed', type: 'error' });
    toast.push({ message: 'Account created', type: 'success' });
    router.push('/dashboard');
  };

  const strength = passwordStrength(password);

  return (
    <motion.form onSubmit={handleSubmit} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="auth-card">
      <div className="auth-logo">
        <div className="logo-badge">SG</div>
        <div>
          <div className="auth-title">Create your account</div>
          <div className="auth-sub">Track your skills and boost placement readiness</div>
        </div>
      </div>

      <div className="auth-field">
        <label className="small-muted">Full name</label>
        <input className="auth-input" placeholder="Jane Doe" value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div className="auth-field">
        <label className="small-muted">Email</label>
        <input className="auth-input" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>

      <div className="auth-field">
        <label className="small-muted">Password</label>
        <input type="password" className="auth-input" placeholder="Strong password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>

      <div className="auth-field">
        <label className="small-muted">Confirm Password</label>
        <input type="password" className="auth-input" placeholder="Confirm password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
      </div>

      <div className="auth-field">
        <label className="small-muted">Role</label>
        <select className="auth-input" value={role} onChange={(e) => setRole(e.target.value)}>
          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      <div className="auth-field flex items-center justify-between">
        <div className="small-muted">Password strength:</div>
        <div className={`w-28 h-2 rounded ${strength >= 3 ? 'bg-emerald-400' : strength === 2 ? 'bg-yellow-400' : 'bg-rose-400'}`} />
      </div>

      <div className="auth-actions">
        <button className="auth-button" type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create account'}</button>
        <a href="/login" className="auth-ghost">Back</a>
      </div>
    </motion.form>
  );
}
