"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AnalyzePage() {
  const [repo, setRepo] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const router = useRouter();

  const simulateAnalysis = async (repoUrl: string) => {
    setLoading(true);
    setProgress(6);
    // Kick off backend analyze when possible, but graceful fallback to simulated analysis
    let remoteResult: any = null;
    try {
      const res = await fetch('/api/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ githubRepoUrl: repoUrl }) });
      if (res.ok) {
        const json = await res.json();
        // API may return { analysis, ok } or direct object
        remoteResult = json?.analysis ? json.analysis : json;
      }
    } catch (e) {
      // ignore — we'll synthesize a result
    }

    // Simulate scanning animation progress
    return new Promise(resolve => {
      const iv = setInterval(() => {
        setProgress(p => {
          const next = Math.min(100, p + Math.floor(Math.random() * 12) + 6);
          if (next >= 100) {
            clearInterval(iv);
            // build final result (use remote if available)
            const final = remoteResult || synthesizeResult(repoUrl);
            resolve(final);
          }
          return next;
        });
      }, 400);
    });
  };

  const synthesizeResult = (repoUrl: string) => {
    // Basic simulated analysis (client-side) — backend can produce richer results
    const techs = ['React', 'Next.js', 'Tailwind CSS', 'TypeScript', 'Node.js', 'Prisma'];
    const detected = techs.map((t, i) => ({ name: t, status: i % 3 === 0 ? 'Verified' : (i % 3 === 1 ? 'Partial' : 'Missing') }));
    const result = {
      repo: repoUrl,
      scores: { frontend: 78, backend: 45, fullstack: 59, placement: 62 },
      techs: detected,
      quality: { structure: 'Good', components: 'Good', responsiveness: 'Needs Improvement', api: 'Needs Improvement', auth: 'Partial' },
      recruiterFeedback: 'The project demonstrates solid frontend skills. Backend APIs and testing require attention.',
      skillGaps: [
        { skill: 'Authentication', priority: 'High', importance: 'Critical', suggestion: 'Implement JWT auth, secure routes and tests' },
        { skill: 'Testing', priority: 'High', importance: 'High', suggestion: 'Add unit and integration tests with Jest/RTL' },
      ],
      roadmap: [
        { week: 'Week 1', tasks: ['Learn JWT Authentication', 'Implement login system'] },
        { week: 'Week 2', tasks: ['State management with Zustand', 'Add persistence'] },
        { week: 'Week 3', tasks: ['Design backend APIs', 'Add tests'] },
      ],
      recommendedProjects: ['Chat Application', 'E-Commerce Platform', 'Blogging Platform'],
    };
    return result;
  };

  const handleAnalyze = async () => {
    if (!repo) return;
    const res = (await simulateAnalysis(repo)) as any;
    // normalize and store result for the Analysis Result page (session-scoped)
    const normalized = res?.analysis ? res.analysis : res;
    try { sessionStorage.setItem('latestAnalysis', JSON.stringify(normalized)); } catch (e) {}
    setLoading(false);
    setProgress(0);
    router.push('/analysis-result');
  };

  return (
    <div className="container">
      <h1 className="text-2xl font-bold">Analyze Repository</h1>
      <p className="mt-2 text-slate-400">Enter a GitHub repository URL to perform an AI-style readiness analysis.</p>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
        <input value={repo} onChange={e => setRepo(e.target.value)} className="auth-input col-span-2" placeholder="https://github.com/owner/repo" />
        <div className="flex items-center gap-2">
          <button disabled={!repo || loading} onClick={handleAnalyze} className="auth-button">{loading ? 'Scanning...' : 'Analyze'}</button>
        </div>
      </div>

      {loading && (
        <div className="mt-6 p-4 bg-slate-900/30 rounded border border-white/5">
          <div className="text-sm text-slate-300">AI scanning repository — this simulates a deep code analysis.</div>
          <div className="w-full h-3 bg-white/5 rounded mt-3 overflow-hidden">
            <div style={{ width: `${progress}%` }} className="h-3 bg-gradient-to-r from-cyan-400 via-purple-500 to-blue-400 transition-all duration-300" />
          </div>
          <div className="mt-2 text-xs text-slate-400">Progress: {progress}%</div>
        </div>
      )}
      </div>
      );
    }
