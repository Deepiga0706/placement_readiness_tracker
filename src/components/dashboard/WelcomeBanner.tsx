'use client';
import React from 'react';

export default function WelcomeBanner({ name }: { name?: string }) {
  return (
    <div className="w-full p-6 rounded-2xl bg-gradient-to-r from-purple-900/30 to-cyan-900/20 border border-white/4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xl font-semibold">Welcome back{ name ? `, ${name}` : '' } 👋</div>
          <div className="text-sm text-slate-300 mt-1">Here's your placement readiness snapshot for this week.</div>
        </div>
      </div>
    </div>
  );
}
