export type SkillDef = {
  key: string;
  label: string;
  weight: number; // percent weight
  recommendation?: string;
};

export type RoleTemplate = {
  id: string;
  name: string;
  description: string;
  skills: SkillDef[];
};

export const FRONTEND: RoleTemplate = {
  id: 'ROLE_FRONTEND',
  name: 'Frontend Engineer',
  description: 'Build scalable UIs with modern frameworks',
  skills: [
    { key: 'react', label: 'React', weight: 25, recommendation: 'Build interactive UIs with React components' },
    { key: 'next', label: 'Next.js', weight: 25, recommendation: 'Use Next.js App Router and SSR features' },
    { key: 'tailwind', label: 'Tailwind / CSS', weight: 15, recommendation: 'Style with Tailwind or modern CSS' },
    { key: 'state', label: 'State Management (Zustand/Redux)', weight: 20, recommendation: 'Manage app state with Zustand or Redux' },
    { key: 'responsive', label: 'Responsive UI', weight: 15, recommendation: 'Ensure responsive layouts and accessibility' }
  ]
};

export const BACKEND: RoleTemplate = {
  id: 'ROLE_BACKEND',
  name: 'Backend Developer',
  description: 'Server-side logic, DB, and APIs',
  skills: [
    { key: 'node', label: 'Node.js / Express', weight: 25, recommendation: 'Build REST endpoints with Express or Fastify' },
    { key: 'database', label: 'Database / Prisma', weight: 25, recommendation: 'Design schema with Prisma or use PostgreSQL/MongoDB' },
    { key: 'jwt', label: 'Authentication (JWT)', weight: 20, recommendation: 'Implement JWT-based auth for APIs' },
    { key: 'rest', label: 'REST API Design', weight: 15, recommendation: 'Design and implement RESTful endpoints' },
    { key: 'testing', label: 'Testing / CI', weight: 15, recommendation: 'Add tests and CI for reliability' }
  ]
};

export const FULLSTACK: RoleTemplate = {
  id: 'ROLE_FULLSTACK',
  name: 'Fullstack Engineer',
  description: 'Both frontend and backend responsibilities',
  skills: [
    ...FRONTEND.skills.map(s => ({ ...s, weight: Math.round(s.weight * 0.6) })),
    ...BACKEND.skills.map(s => ({ ...s, weight: Math.round(s.weight * 0.6) }))
  ]
};

export const ROLE_TEMPLATES: RoleTemplate[] = [FRONTEND, BACKEND, FULLSTACK];
