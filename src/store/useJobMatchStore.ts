import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface LocalTask {
  id: string;
  title: string;
  status: string; // 'TODO' | 'DONE'
  weight: number;
  verified: boolean;
}

export interface LocalRole {
  id: string;
  name: string;
  description: string;
  masterSkills: string[];
}

interface JobMatchState {
  currentRole: LocalRole | null;
  tasks: LocalTask[];
  readinessScore: number;
  // Repo and scores
  repoUrl?: string | null;
  githubResult?: any;
  dsaScore?: number;
  finalScore?: number;
  user?: { id: string; email: string } | null;
  setRole: (role: LocalRole, tasks: LocalTask[]) => void;
  updateTaskVerification: (taskId: string, verified: boolean) => void;
  recalculateScore: () => void;
  setRepoResult: (repoUrl: string, result: any) => void;
  setDsaScore: (score: number) => void;
  calculateFinalScore: (githubWeight?: number, dsaWeight?: number) => void;
  history: Array<{ date: string; repo?: string; githubScore?: number; dsaScore?: number; finalScore?: number }>;
  pushHistory: (entry: { repo?: string; githubScore?: number; dsaScore?: number; finalScore?: number }) => void;
  setUser: (user: { id: string; email: string } | null) => void;
}

export const useJobMatchStore = create<JobMatchState>()(
  persist(
    (set, get) => ({
      currentRole: null,
      tasks: [],
      readinessScore: 0,

      setRole: (role, tasks) => {
        set({ currentRole: role, tasks });
        get().recalculateScore();
      },

      updateTaskVerification: (taskId, verified) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId ? { ...task, verified, status: verified ? 'DONE' : task.status } : task
          )
        }));
        get().recalculateScore();
      },

      recalculateScore: () => {
        const { tasks } = get();
        if (tasks.length === 0) {
          set({ readinessScore: 0 });
          return;
        }

        const totalWeight = tasks.reduce((sum, task) => sum + task.weight, 0);
        const verifiedWeight = tasks
          .filter((t) => t.verified)
          .reduce((sum, task) => sum + task.weight, 0);

        const score = totalWeight === 0 ? 0 : Math.round((verifiedWeight / totalWeight) * 100);
        set({ readinessScore: score });
      }
      ,

      setRepoResult: (repoUrl, result) => {
        set({ repoUrl, githubResult: result });
        // If analysis contains score, update readinessScore for tasks mapping
        if (result?.score && Array.isArray(result.tasks)) {
          // map result tasks to local tasks
          set((state) => ({ tasks: state.tasks.map(t => {
            const match = result.tasks.find((rt: any) => `SK_${rt.key}` === t.id || rt.title === t.title);
            return match ? { ...t, verified: !!match.verified, status: match.verified ? 'DONE' : t.status } : t;
          }) }));
          get().recalculateScore();
        }
        // update history entry with github score
        if (result?.score) {
          get().pushHistory({ repo: repoUrl, githubScore: result.score, dsaScore: get().dsaScore, finalScore: get().finalScore });
        }
      },

      setDsaScore: (score) => {
        set({ dsaScore: score });
      },

      calculateFinalScore: (githubWeight = 0.6, dsaWeight = 0.4) => {
        const github = get().githubResult?.score ?? get().readinessScore ?? 0;
        const dsa = get().dsaScore ?? 0;
        const finalScore = Math.round(github * githubWeight + dsa * dsaWeight);
        set({ finalScore });
        // push to history
        get().pushHistory({ repo: get().repoUrl, githubScore: github, dsaScore: dsa, finalScore });
      },

      history: [],
      pushHistory: (entry) => {
        set((state) => ({ history: [{ date: new Date().toISOString(), ...entry }, ...state.history].slice(0, 50) }));
      }
      ,
      setUser: (user) => set({ user })
    }),
    {
      name: 'job-match-storage',
    }
  )
);
