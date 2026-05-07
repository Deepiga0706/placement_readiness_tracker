'use client';
import { useJobMatchStore } from '@/store/useJobMatchStore';

export default function ReadinessGauge() {
  const { readinessScore } = useJobMatchStore();

  return (
    <div className="card" style={{ display: 'flex', justifyContent: 'center' }}>
      <div className="gauge-container">
        <div 
          className="gauge"
          style={{ backgroundImage: `conic-gradient(var(--success) ${readinessScore}%, var(--background) ${readinessScore}%)` }}
        >
          <div className="gauge-value">{readinessScore}%</div>
        </div>
        <div className="gauge-label">Match Readiness</div>
      </div>
    </div>
  );
}
