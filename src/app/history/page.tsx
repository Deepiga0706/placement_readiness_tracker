'use client';
import { useJobMatchStore } from '@/store/useJobMatchStore';

export default function HistoryPage() {
  const { history } = useJobMatchStore();

  return (
    <div className="container">
      <h1>Analysis History</h1>
      <p>Past repository analyses and scores.</p>

      <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {history.length === 0 && <div className="card">No history yet. Run an analysis to populate history.</div>}
        {history.map((h, idx) => (
          <div key={idx} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700 }}>{h.repo || '—'}</div>
              <div style={{ color: 'var(--text-muted)' }}>{new Date(h.date).toLocaleString()}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div>GitHub: {h.githubScore ?? '—'}%</div>
              <div>DSA: {h.dsaScore ?? '—'}%</div>
              <div style={{ fontWeight: 700 }}>Final: {h.finalScore ?? '—'}%</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
