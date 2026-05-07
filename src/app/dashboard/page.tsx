"use client";
import React, { useEffect } from "react";
import WelcomeBanner from "@/components/dashboard/WelcomeBanner";
import StatCard from "@/components/dashboard/StatCard";
import FinalGauge from "@/components/FinalGauge";
import { useJobMatchStore } from "@/store/useJobMatchStore";

export default function DashboardPage() {
  const { githubResult, dsaScore, finalScore, calculateFinalScore, readinessScore, history } = useJobMatchStore();

  useEffect(() => {
    calculateFinalScore();
  }, [githubResult, dsaScore, calculateFinalScore]);

  const githubScore = githubResult?.score ?? readinessScore ?? 0;

  return (
    <div className="container">
      <WelcomeBanner name={useJobMatchStore.getState().user?.email} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <StatCard title="Readiness Score" value={`${readinessScore ?? 0}%`} hint="Final combined score" />
        <StatCard title="DSA Progress" value={`${dsaScore ?? 0}%`} hint="Practice & assessments" />
        <StatCard title="GitHub Quality" value={`${githubScore}%`} hint="Repo analysis" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 p-4 bg-slate-900/30 rounded-xl border border-white/5">
          <h3 className="text-lg font-semibold">Skill Verification Progress</h3>
          <div className="mt-4 text-slate-300">Placeholder for progress list and verification UI.</div>
          <div className="mt-6">
            <h4 className="font-semibold">Final Readiness</h4>
            <div className="mt-3" style={{ width: 180 }}>
              <FinalGauge value={finalScore ?? Math.round((githubScore * 0.6) + ((dsaScore ?? 0) * 0.4))} />
            </div>
          </div>
        </div>

        <aside className="p-4 bg-slate-900/30 rounded-xl border border-white/5">
          <h3 className="text-lg font-semibold">Recent Assessments</h3>
          <div className="mt-3 text-slate-300">
            {history.length === 0 ? (
              "No assessments yet"
            ) : (
              history.map((h, i) => (
                <div key={i} className="py-2 border-b border-white/3">
                  {new Date(h.date).toLocaleDateString()} — {h.finalScore ?? '-'}%
                </div>
              ))
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
