'use client';
import React from 'react';

export default function StatCard({ title, value, hint }: { title: string; value: string | number; hint?: string }) {
  return (
    <div className="p-4 bg-gradient-to-br from-black/30 to-white/2 border border-white/5 rounded-xl shadow-md">
      <div className="text-sm text-slate-300">{title}</div>
      <div className="mt-2 text-2xl font-bold">{value}</div>
      {hint && <div className="text-sm text-slate-400 mt-1">{hint}</div>}
    </div>
  );
}
