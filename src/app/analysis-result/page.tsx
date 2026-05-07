"use client";
import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';

function Circular({ label, value, color = 'from-blue-400' }: { label: string; value: number; color?: string }) {
  const r = 54;
  const c = 2 * Math.PI * r;
  const progress = useMotionValue(c);

  useEffect(() => {
    const target = c - (Math.max(0, Math.min(100, value)) / 100) * c;
    const controls = animate(progress, target, { duration: 0.9, ease: [0.22, 1, 0.36, 1] });
    return () => controls.stop();
  }, [value]);

  const gradientId = `g-${label.replace(/\s+/g, '-')}`;

  return (
    <div className="flex flex-col items-center">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <g transform="translate(60,60)">
          <circle r={r} stroke="rgba(255,255,255,0.06)" strokeWidth="12" fill="none" />
          <motion.circle r={r} strokeWidth="12" stroke={`url(#${gradientId})`} strokeLinecap="round" fill="none" strokeDasharray={c} style={{ rotate: -90, strokeDashoffset: progress }} />
          <defs>
            <linearGradient id={gradientId} x1="0" x2="1">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
          </defs>
          <text x="0" y="6" fill="#fff" fontSize="18" fontWeight={700} textAnchor="middle">{Math.round(value ?? 0)}%</text>
        </g>
      </svg>
      <div className="mt-2 text-sm text-slate-300">{label}</div>
    </div>
  );
}

export default function AnalysisResultPage() {
  const [analysis, setAnalysis] = useState<any>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('latestAnalysis');
      if (raw) {
        const parsed = JSON.parse(raw);
        // support server response wrapper { analysis, ok } or direct analysis object
        const payload = parsed?.analysis ? parsed.analysis : parsed;
        setAnalysis(payload);
        return;
      }
    } catch (e) {}

    // fallback synthetic data
    setAnalysis({
      repo: 'https://github.com/example/repo',
      scores: { frontend: 82, backend: 46, fullstack: 64, placement: 58 },
      technologies: [
        { name: 'Next.js', status: 'Verified' },
        { name: 'React', status: 'Verified' },
        { name: 'TypeScript', status: 'Verified' },
        { name: 'Tailwind CSS', status: 'Partial' },
        { name: 'Prisma', status: 'Missing' }
      ],
      quality: { folderStructure: 'Good', components: 'Good', responsiveness: 'Needs Improvement', apiDesign: 'Needs Improvement', auth: 'Partial' },
      aiFeedback: 'Solid frontend skills. Improve backend API design, testing, and authentication.',
      skillGaps: [
        { skill: 'Authentication', priority: 'High', importance: 'Critical', suggestion: 'Implement secure JWT flows and refresh tokens.' },
        { skill: 'Testing', priority: 'Medium', importance: 'High', suggestion: 'Add unit/integration tests with Jest.' }
      ],
      roadmap: [ { week: 1, items: ['Learn JWT Authentication', 'Build login system'] }, { week: 2, items: ['Learn Zustand/Redux', 'Add state persistence'] } ],
      recommendedProjects: ['Chat App', 'E-Commerce Platform']
    });
  }, []);
    // derive scores heuristically if API didn't provide meaningful values
    function deriveScores(a: any) {
      if (!a) return { frontend: 0, backend: 0, fullstack: 0, placement: 0 };
      const techArr = a.detected ? Object.keys(a.detected) : ((a.technologies || a.techs || []).map((t:any) => t.name));
      const techSet = new Set(techArr.map((t: string) => String(t).toLowerCase()));
      const quality = a.quality || {};
      const qualityScore = (quality.folderStructure === 'Excellent' ? 100 : (quality.folderStructure === 'Good' ? 75 : 40));
      const activity = a.commitStats?.activityScore ?? 50;

      let fe = 0;
      if (techSet.has('react')) fe += 35;
      if (techSet.has('next.js') || techSet.has('next')) fe += 30;
      if (techSet.has('tailwind css') || techSet.has('tailwindcss')) fe += 15;
      if (techSet.has('typescript')) fe += 10;
      if (quality.components === 'Good') fe += 10;

      let be = 0;
      if (techSet.has('node.js') || techSet.has('node')) be += 30;
      if (techSet.has('prisma') || techSet.has('mongodb')) be += 30;
      if (techSet.has('auth (jwt)') || techSet.has('next-auth') || techSet.has('jsonwebtoken')) be += 20;
      if (quality.apiDesign === 'Good') be += 10;

      fe = Math.min(100, Math.round(fe));
      be = Math.min(100, Math.round(be));
      const fs = Math.min(100, Math.round((fe + be) / 2 + (techSet.has('prisma') || techSet.has('mongodb') ? 5 : 0)));
      const placement = Math.round((fe * 0.4) + (be * 0.3) + (qualityScore * 0.2) + (activity * 0.1));
      return { frontend: fe, backend: be, fullstack: fs, placement };
    }

    // animated display scores (start at 0 then animate to target to avoid 0% flash)
    const [displayScores, setDisplayScores] = useState({ frontend: 0, backend: 0, fullstack: 0, placement: 0 });

    useEffect(() => {
      if (!analysis) return;
      const scores = analysis.scores || analysis.score || { frontend: 0, backend: 0, fullstack: 0, placement: 0 };
      // ensure numbers
      const frontendScore = Number(scores.frontend ?? 0);
      const backendScore = Number(scores.backend ?? 0);
      const fullstackScore = Number(scores.fullstack ?? 0);
      const placementScore = Number(scores.placement ?? 0);

      // choose source: API scores if non-zero else derived
      const hasApiScores = (frontendScore || backendScore || fullstackScore || placementScore) > 0;
      const derived = deriveScores(analysis);
      const target = hasApiScores ? { frontend: frontendScore, backend: backendScore, fullstack: fullstackScore, placement: placementScore } : derived;
      // small delay to allow skeleton/transition
      const t = setTimeout(() => setDisplayScores({ frontend: Number(target.frontend), backend: Number(target.backend), fullstack: Number(target.fullstack), placement: Number(target.placement) }), 180);
      return () => clearTimeout(t);
    }, [analysis]);

    if (!analysis) return <div className="container">Loading analysis...</div>;

    const scores = analysis.scores || analysis.score || { frontend: 0, backend: 0, fullstack: 0, placement: 0 };
    // ensure numbers
    const frontendScore = Number(scores.frontend ?? 0);
    const backendScore = Number(scores.backend ?? 0);
    const fullstackScore = Number(scores.fullstack ?? 0);
    const placementScore = Number(scores.placement ?? 0);

  return (
    <div className="container">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analysis Result</h1>
          <div className="text-sm text-slate-400">Repository: <span className="font-mono">{analysis.repo}</span></div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 p-4 bg-slate-900/30 rounded-lg border border-white/5">
          <div className="grid grid-cols-2 gap-4">
            <Circular label="Frontend" value={displayScores.frontend} />
            <Circular label="Backend" value={displayScores.backend} />
            <Circular label="Fullstack" value={displayScores.fullstack} />
            <Circular label="Placement" value={displayScores.placement} />
          </div>
        </div>

        <aside className="p-4 bg-slate-900/30 rounded-lg border border-white/5">
          <h3 className="font-semibold">AI Recruiter Feedback</h3>
          <p className="mt-2 text-slate-300">{analysis.aiFeedback}</p>
          <div className="mt-4">
            <h4 className="text-sm font-medium">Placement Probability</h4>
            <div className="mt-2 space-y-2 text-sm text-slate-300">
              <div>Service Company Ready — <strong>88%</strong></div>
              <div>Product Company Ready — <strong>45%</strong></div>
              <div>Startup Ready — <strong>71%</strong></div>
            </div>
          </div>
        </aside>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-900/30 rounded-lg border border-white/5 md:col-span-2">
          <h3 className="font-semibold">Detected Technologies</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {(analysis.technologies || analysis.techs || []).map((t: any) => (
              <span key={t.name} className={`px-3 py-1 rounded-full text-xs ${t.status==='Verified' ? 'bg-green-600/30 text-green-300' : (t.status==='Partial' ? 'bg-yellow-700/20 text-yellow-300' : 'bg-red-700/20 text-rose-300')}`}>{t.name} — {t.status}</span>
            ))}
          </div>

          <h4 className="mt-4 font-medium">Project Quality</h4>
          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
            {Object.entries(analysis.quality).map(([k, v]: any) => (
              <div key={k} className="p-3 bg-white/3 rounded">
                <div className="text-sm font-medium">{k.replace(/([A-Z])/g, ' $1')}</div>
                <div className="text-xs text-slate-300 mt-1">{v}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 bg-slate-900/30 rounded-lg border border-white/5">
          <h3 className="font-semibold">Skill Gaps</h3>
          <div className="mt-3 space-y-2">
            {analysis.skillGaps.map((s: any) => (
              <div key={s.skill} className="p-2 bg-white/3 rounded">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{s.skill}</div>
                  <div className="text-xs text-slate-300">{s.priority}</div>
                </div>
                <div className="text-xs text-slate-300 mt-1">{s.suggestion}</div>
              </div>
            ))}
          </div>

          <h4 className="mt-4 font-medium">Learning Roadmap</h4>
          <div className="mt-2 space-y-2 text-sm text-slate-300">
            {analysis.roadmap.map((r: any, idx: number) => (
              <div key={idx} className="p-2 bg-white/3 rounded">
                <div className="font-medium">{r.week || `Week ${idx+1}`}</div>
                <ul className="mt-1 list-disc list-inside text-xs">
                  {(r.items || r.tasks || []).map((it: string) => <li key={it}>{it}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-slate-900/30 rounded-lg border border-white/5">
        <h3 className="font-semibold">Recommended Projects</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {analysis.recommendedProjects.map((p: string) => (
            <div key={p} className="px-3 py-2 bg-white/3 rounded">{p}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
