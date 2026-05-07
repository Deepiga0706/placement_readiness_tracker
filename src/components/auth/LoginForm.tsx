'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/components/ui/ToastProvider';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (!email || !password) { toast.push({ message: 'Please fill all fields', type: 'error' }); setLoading(false); return; }
    const res = await login(email, password, remember);
    setLoading(false);
    if (!res.ok) return toast.push({ message: res.error || 'Invalid credentials', type: 'error' });
    toast.push({ message: 'Logged in', type: 'success' });
    router.push('/dashboard');
  };

  return (
    <motion.form onSubmit={handleSubmit} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="auth-card">
      <div className="auth-logo">
        <div className="logo-badge">SG</div>
        <div>
          <div className="auth-title">Skill Gap Analyzer</div>
          <div className="auth-sub">AI-powered placement readiness tracking</div>
        </div>
      </div>

      <div className="auth-field">
        <label className="small-muted">Email</label>
        <input className="auth-input" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>

      <div className="auth-field">
        <label className="small-muted">Password</label>
        <input type="password" className="auth-input" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>

      <div className="auth-field flex items-center justify-between">
        <label className="flex items-center gap-2 small-muted"><input type="checkbox" className="rounded" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> Remember me</label>
        <a className="link-muted">Forgot?</a>
      </div>

      <div className="auth-actions">
        <button className="auth-button" type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
        <a href="/signup" className="auth-ghost">Sign up</a>
      </div>
    </motion.form>
  );
}
