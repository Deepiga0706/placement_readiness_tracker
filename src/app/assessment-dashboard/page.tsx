"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AssessmentDashboard() {
  const [history, setHistory] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    try { const h = JSON.parse(localStorage.getItem('assessmentsHistory')||'[]'); setHistory(h); } catch (e) {}
  }, []);

  const avg = history.length ? Math.round(history.reduce((s,h)=> s + (h.result?.percent||0),0)/history.length) : 0;

  return (
    <div className="container">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Assessments Dashboard</h1>
        <div className="text-sm text-slate-400">Average Score: <strong>{avg}%</strong></div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 p-4 bg-slate-900/30 rounded border">
          <h3 className="font-semibold">Recent Tests</h3>
          <div className="mt-3 space-y-2">
            {history.length === 0 && <div className="text-slate-400">No tests taken yet.</div>}
            {history.map(h => (
              <div key={h.id} className="p-3 bg-white/3 rounded flex items-center justify-between">
                <div>
                  <div className="font-medium">{h.mode} — {h.result?.percent}%</div>
                  <div className="text-sm text-slate-400">Taken: {new Date(h.startedAt).toLocaleString()}</div>
                </div>
                <div className="flex gap-2">
                  <button className="auth-button" onClick={() => { sessionStorage.setItem('latestAssessment', JSON.stringify(h)); router.push('/assessment-result'); }}>View</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="p-4 bg-slate-900/30 rounded border">
          <h3 className="font-semibold">Summary</h3>
          <div className="mt-3 text-slate-300">Total tests: {history.length}</div>
          <div className="mt-2 text-slate-300">Average score: {avg}%</div>
          <div className="mt-2">
            <button className="auth-button" onClick={() => { localStorage.removeItem('assessmentsHistory'); setHistory([]); }}>Clear History</button>
          </div>
        </aside>
      </div>
    </div>
  );
}
