'use client';
import React from 'react';
import { useJobMatchStore } from '@/store/useJobMatchStore';

export default function RecommendationsPage() {
  const { githubResult, history } = useJobMatchStore();
  const missing: any[] = (githubResult && githubResult.missing) || [];

  return (
    <div className="container">
      <h1 className="text-2xl font-bold">Recommendations</h1>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <main className="md:col-span-2 p-4 bg-slate-900/30 rounded-xl border border-white/5">
          <h3 className="font-semibold">Actionable Suggestions</h3>
          <p className="mt-2 text-slate-300">Personalized recommendations to close skill gaps and improve placement readiness.</p>

          <div className="mt-4 space-y-3">
            {missing.length === 0 ? (
              <div className="p-3 bg-white/3 rounded">All detected skills look good — focus on polishing and tests.</div>
            ) : (
              missing.map((m: any) => (
                <div key={m.key || m.skill || m.title} className="p-3 bg-white/3 rounded">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{m.title || m.skill}</div>
                    <div className="text-xs text-slate-300">{m.priority || 'Medium'}</div>
                  </div>
                  <div className="text-sm text-slate-300 mt-2">{m.recommendation || m.suggestion || 'No recommendation available.'}</div>
                  <div className="mt-3 flex gap-2">
                    <a className="auth-button" href={`https://google.com/search?q=${encodeURIComponent((m.title || m.skill) + ' tutorial')}`} target="_blank" rel="noreferrer">Learn</a>
                    <button className="auth-button">Add to Roadmap</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>

        <aside className="p-4 bg-slate-900/30 rounded-xl border border-white/5">
          <h3 className="font-semibold">Priority Skills</h3>
          <div className="mt-3 space-y-2">
            {(missing.slice(0,5)).map((m: any) => (
              <div key={m.key || m.skill || m.title} className="p-2 bg-white/4 rounded">
                <div className="font-medium">{m.title || m.skill}</div>
                <div className="text-xs text-slate-300">{m.priority || 'Medium'}</div>
              </div>
            ))}
            {missing.length === 0 && <div className="text-sm text-slate-300">No high priority skills detected.</div>}
          </div>

          <h4 className="mt-4 font-medium">Recent Analyses</h4>
          <div className="mt-2 space-y-2 text-sm text-slate-300">
            {(history || []).slice(-5).reverse().map((h: any, idx: number) => (
              <div key={idx} className="p-2 bg-white/3 rounded">
                <div className="font-medium">{h.repo || h.url || 'Repository'}</div>
                <div className="text-xs">{h.result?.scores?.placement ? `Placement ${h.result.scores.placement}%` : ''}</div>
              </div>
            ))}
            {(history || []).length === 0 && <div className="text-sm text-slate-300">No recent analyses</div>}
          </div>
        </aside>
      </div>
    </div>
  );
}
