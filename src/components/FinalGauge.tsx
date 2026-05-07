'use client';
import { useEffect, useState } from 'react';

type Props = { value: number };

export default function FinalGauge({ value }: Props) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let raf: number;
    let start: number | null = null;
    const duration = 700;
    const animate = (ts: number) => {
      if (start === null) start = ts;
      const t = Math.min(1, (ts - start) / duration);
      setDisplay(Math.round(t * value));
      if (t < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return (
    <div className="card" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ width: 140, height: 140, borderRadius: '50%', background: `conic-gradient(var(--primary) ${display}%, var(--muted) ${display}%)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 20, fontWeight: 700 }}>{display}%</div>
      </div>
    </div>
  );
}
