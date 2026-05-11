'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface AnalysisSnapshot {
  repo: string;
  scores: { frontend: number; backend: number; fullstack: number; placement: number };
  techs: { name: string; status: string }[];
  quality: Record<string, string>;
  aiFeedback: string;
  skillGaps: { skill: string; priority: string; importance: string; suggestion: string }[];
  roadmap: { week: string | number; items?: string[]; tasks?: string[] }[];
  recommendedProjects: string[];
  date: string;
}

export interface AssessmentEntry {
  id: string;
  subject: string;   // DSA | DBMS | OS | CN
  score: number;      // percentage 0-100
  total: number;      // total questions
  correct: number;
  date: string;
  strengths: string[];
  weaknesses: string[];
}

export interface ActivityEntry {
  id: string;
  type: 'analysis' | 'assessment' | 'recommendation' | 'login';
  label: string;
  detail: string;
  date: string;
}

/* ------------------------------------------------------------------ */
/*  Store Interface                                                    */
/* ------------------------------------------------------------------ */

interface DashboardState {
  /* --- data --- */
  latestAnalysis: AnalysisSnapshot | null;
  assessments: AssessmentEntry[];
  activities: ActivityEntry[];

  /* --- derived scores (cached) --- */
  readinessScore: number;
  githubQuality: number;
  dsaProgress: number;
  activityScore: number;

  /* --- actions --- */
  setAnalysis: (a: AnalysisSnapshot) => void;
  addAssessment: (a: AssessmentEntry) => void;
  addActivity: (a: Omit<ActivityEntry, 'id' | 'date'>) => void;
  recalculate: () => void;
  clearAll: () => void;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function calcActivityScore(activities: ActivityEntry[]): number {
  if (activities.length === 0) return 0;
  // score based on recency & frequency (last 30 days)
  const now = Date.now();
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;
  const recent = activities.filter(a => now - new Date(a.date).getTime() < thirtyDays);
  // base: 1 activity = 20, clamp at 100
  return Math.min(100, recent.length * 20);
}

/* ------------------------------------------------------------------ */
/*  Store                                                              */
/* ------------------------------------------------------------------ */

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      latestAnalysis: null,
      assessments: [],
      activities: [],
      readinessScore: 0,
      githubQuality: 0,
      dsaProgress: 0,
      activityScore: 0,

      setAnalysis: (a) => {
        set({ latestAnalysis: a });
        get().addActivity({ type: 'analysis', label: 'Repository Analyzed', detail: a.repo });
        get().recalculate();
      },

      addAssessment: (a) => {
        set(s => ({
          assessments: [a, ...s.assessments].slice(0, 50),
        }));
        get().addActivity({
          type: 'assessment',
          label: 'Assessment Completed',
          detail: `${a.subject} — ${a.score}%`,
        });
        get().recalculate();
      },

      addActivity: (a) => {
        const entry: ActivityEntry = { ...a, id: uid(), date: new Date().toISOString() };
        set(s => ({
          activities: [entry, ...s.activities].slice(0, 100),
        }));
      },

      recalculate: () => {
        const { latestAnalysis, assessments, activities } = get();

        // GitHub quality = placement score from latest analysis
        const githubQuality = latestAnalysis?.scores?.placement ?? 0;

        // DSA progress = average of all assessment percentages
        const dsaProgress = assessments.length > 0
          ? Math.round(assessments.reduce((s, a) => s + a.score, 0) / assessments.length)
          : 0;

        // Activity score
        const activityScore = calcActivityScore(activities);

        // Final readiness = 40% GitHub + 40% Assessment + 20% Activity
        const readinessScore = Math.round(
          githubQuality * 0.4 + dsaProgress * 0.4 + activityScore * 0.2
        );

        set({ readinessScore, githubQuality, dsaProgress, activityScore });
      },

      clearAll: () => {
        set({
          latestAnalysis: null,
          assessments: [],
          activities: [],
          readinessScore: 0,
          githubQuality: 0,
          dsaProgress: 0,
          activityScore: 0,
        });
      },
    }),
    { name: 'dashboard-storage' }
  )
);
