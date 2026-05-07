'use client';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useJobMatchStore } from '@/store/useJobMatchStore';

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const history = useJobMatchStore((s) => s.history);

  useEffect(() => {
    // placeholder: ensure protected via middleware
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1 className="text-2xl font-bold">Profile</h1>
      <div className="mt-4">
        <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/30">
          <div className="font-semibold">{user?.email}</div>
          <div className="text-sm text-slate-400">Member since: --</div>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="font-semibold">Readiness History</h2>
        <div className="mt-2 space-y-2">
          {history.length === 0 && <div className="text-slate-400">No history yet</div>}
          {history.map((h, idx) => (
            <div key={idx} className="p-3 bg-slate-800/40 rounded flex justify-between">
              <div>{new Date(h.date).toLocaleString()}</div>
              <div className="font-semibold">{h.finalScore ?? '-'}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
