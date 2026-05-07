import { RoleTemplate, SkillDef } from './roleTemplates';

export type TaskResult = (SkillDef & { verified: boolean });

export function calculateScore(tasks: TaskResult[]) {
  const total = tasks.reduce((s, t) => s + t.weight, 0);
  if (total === 0) return 0;
  const verified = tasks.filter(t => t.verified).reduce((s, t) => s + t.weight, 0);
  return Math.round((verified / total) * 100);
}

export function scoreRole(role: RoleTemplate, detected: Record<string, boolean>) {
  // Ideally, callers will use a mapping of detected -> tasks. For now, this function
  // expects the caller to supply tasks (SkillDef extended with verified). Kept for compatibility.
  const tasks: TaskResult[] = role.skills.map(s => ({ ...s, verified: Boolean((detected as any)[s.key]) }));
  const score = calculateScore(tasks);
  return { score, tasks };
}
