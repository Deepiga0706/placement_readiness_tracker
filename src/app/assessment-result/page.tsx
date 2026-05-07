"use client";
import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useMotionValue, animate } from 'framer-motion';

function Circular({ label, value }: { label: string; value: number }) {
  const r = 48;
  const c = 2 * Math.PI * r;
  const progress = useMotionValue(c);
  useEffect(() => {
    const target = c - (Math.max(0, Math.min(100, value)) / 100) * c;
    const controls = animate(progress, target, { duration: 0.9 });
    return () => controls.stop();
  }, [value]);
  return (
    <div className="flex flex-col items-center">
      <svg width="110" height="110" viewBox="0 0 120 120">
        <g transform="translate(60,60)">
          <circle r={r} stroke="rgba(255,255,255,0.06)" strokeWidth="10" fill="none" />
          <motion.circle r={r} strokeWidth="10" stroke="url(#g)" strokeLinecap="round" fill="none" strokeDasharray={c} style={{ rotate: -90, strokeDashoffset: progress }} />
          <defs>
            <linearGradient id="g" x1="0" x2="1">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
          </defs>
          <text x="0" y="6" fill="#fff" fontSize="16" fontWeight={700} textAnchor="middle">{Math.round(value)}%</text>
        </g>
      </svg>
      <div className="mt-2 text-sm text-slate-300">{label}</div>
    </div>
  );
}

export default function AssessmentResultPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('latestAssessment');
      if (raw) setData(JSON.parse(raw));
    } catch (e) {}
  }, []);

  if (!data) return (
    <div className="container">
      <div className="p-6 bg-slate-900/30 rounded">No recent assessment found. Please take a test.</div>
    </div>
  );

  const res = data.result;
  const strengths = Object.entries(res.byTopic).filter(([k,v]: any) => v.correct / v.total >= 0.7).map(([k]) => k);
  const weaknesses = Object.entries(res.byTopic).filter(([k,v]: any) => v.correct / v.total < 0.7).map(([k]) => k);
  const totalEstimated = (data.questions || []).reduce((s:any, q:any) => s + (q.estTime || 90), 0);
  const timeEfficiency = Math.max(0, Math.min(100, Math.round((1 - (data.duration / Math.max(1, totalEstimated))) * 100)));

  return (
    <div className="container">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Assessment Result</h1>
          <div className="text-sm text-slate-400">Mode: <strong>{data.mode}</strong></div>
        </div>
        <div>
          <button className="auth-button" onClick={() => router.push('/assessment-dashboard')}>View Dashboard</button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 p-4 bg-slate-900/30 rounded-lg border border-white/5">
          <div className="grid grid-cols-2 gap-4">
            <Circular label="Overall" value={res.percent} />
            <div className="p-3">
              <div className="text-sm text-slate-300">Correct</div>
              <div className="text-2xl font-bold">{res.correct}</div>
              <div className="mt-2 text-sm text-slate-300">Wrong: {res.wrong}</div>
              <div className="mt-1 text-sm text-slate-300">Unanswered: {res.unanswered}</div>
            </div>
            <Circular label="Time Efficiency" value={timeEfficiency} />
            <div className="p-3">
              <div className="text-sm text-slate-300">Duration</div>
              <div className="text-lg">{Math.round(data.duration)}s</div>
              <div className="mt-2 text-sm text-slate-300">Questions: {res.total}</div>
            </div>
          </div>
        </div>

        <aside className="p-4 bg-slate-900/30 rounded-lg border border-white/5">
          <h3 className="font-semibold">AI Feedback</h3>
          <p className="mt-2 text-slate-300">You scored <strong>{res.percent}%</strong>. {strengths.length ? `Strong in ${strengths.join(', ')}.` : ''} {weaknesses.length ? `Needs improvement in ${weaknesses.join(', ')}.` : ''}</p>
          <div className="mt-4">
            <h4 className="font-medium">Improvement Suggestions</h4>
            <ul className="mt-2 list-disc list-inside text-sm text-slate-300">
              {weaknesses.slice(0,5).map(w => <li key={w}>Practice topics in {w} — recommended problems and tutorials.</li>)}
            </ul>
          </div>
        </aside>
      </div>

      <div className="mt-6 p-4 bg-slate-900/30 rounded-lg border border-white/5">
        <h3 className="font-semibold">Strengths & Weaknesses</h3>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium">Strengths</h4>
            <ul className="mt-2 text-slate-300 list-disc list-inside">{strengths.length ? strengths.map(s => <li key={s}>{s}</li>) : <li>None detected</li>}</ul>
          </div>
          <div>
            <h4 className="font-medium">Weaknesses</h4>
            <ul className="mt-2 text-slate-300 list-disc list-inside">{weaknesses.length ? weaknesses.map(s => <li key={s}>{s}</li>) : <li>None detected</li>}</ul>
          </div>
        </div>
      </div>
    </div>
  );
}
