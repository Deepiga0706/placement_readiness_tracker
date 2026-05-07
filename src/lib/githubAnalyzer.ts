// Lightweight GitHub analyzer using REST API (no octokit required)
import { RoleTemplate } from './roleTemplates';

type AnalysisResult = {
  repo: string;
  detected: Record<string, boolean>;
  files: string[];
};

async function fetchJson(url: string, token?: string) {
  const headers: Record<string, string> = { 'Accept': 'application/vnd.github.v3+json' };
  if (token) headers['Authorization'] = `token ${token}`;
  const res = await fetch(url, { headers });
  if (!res.ok) return null;
  return res.json();
}

function parseOwnerRepo(url: string) {
  try {
    if (url.startsWith('git@')) {
      const parts = url.split(':')[1].replace(/\.git$/, '').split('/');
      return { owner: parts[0], repo: parts[1] };
    }
    const u = new URL(url);
    const parts = u.pathname.replace(/^\//, '').replace(/\.git$/, '').split('/');
    return { owner: parts[0], repo: parts[1] };
  } catch (e) {
    return null;
  }
}

export async function analyzeRepo(githubRepoUrl: string) : Promise<AnalysisResult | null> {
  const parsed = parseOwnerRepo(githubRepoUrl);
  if (!parsed) return null;
  const { owner, repo } = parsed;
  const token = process.env.GITHUB_TOKEN;

  const repoMeta = await fetchJson(`https://api.github.com/repos/${owner}/${repo}`, token);
  if (!repoMeta) return null;
  const defaultBranch = repoMeta.default_branch || 'main';

  // Try package.json
  const pkg = await fetchJson(`https://api.github.com/repos/${owner}/${repo}/contents/package.json`, token);
  let packageJson: any = null;
  if (pkg && pkg.content) {
    try {
      const decoded = Buffer.from(pkg.content, 'base64').toString('utf8');
      packageJson = JSON.parse(decoded);
    } catch (e) {
      packageJson = null;
    }
  }

  // Tree listing
  const treeRes = await fetchJson(`https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`, token);
  const files: string[] = Array.isArray(treeRes?.tree) ? treeRes.tree.map((t: any) => t.path) : [];

  const deps = { ...(packageJson?.dependencies || {}), ...(packageJson?.devDependencies || {}) };

  const detected: Record<string, boolean> = {
    react: Boolean(deps['react']),
    next: Boolean(deps['next']),
    tailwind: Boolean(deps['tailwindcss']) || files.some(f => f.endsWith('tailwind.config.js')),
    zustand: Boolean(deps['zustand']),
    prisma: files.some(f => f.endsWith('schema.prisma')) || Boolean(deps['prisma'] || deps['@prisma/client']),
    jwt: Boolean(deps['jsonwebtoken']),
    express: Boolean(deps['express']) || files.some(f => f.toLowerCase().includes('express')),
    rest_api: files.some(f => f.toLowerCase().includes('routes') || f.toLowerCase().includes('controllers') || deps['express']),
    app_router: files.some(f => f === 'app' || f.startsWith('app/') || f.startsWith('src/app/'))
  };

  return {
    repo: `${owner}/${repo}`,
    detected,
    files,
  };
}

export function mapDetectionToRole(detected: Record<string, boolean>, role: RoleTemplate) {
  // Map role skills to detected keys heuristically
  return role.skills.map(s => {
    const key = s.key;
    let verified = false;
    if (key === 'react') verified = !!detected.react;
    else if (key === 'next') verified = !!detected.next || !!detected.app_router;
    else if (key === 'tailwind') verified = !!detected.tailwind;
    else if (key === 'state') verified = !!detected.zustand;
    else if (key === 'responsive') verified = filesHaveResponsiveIndicators(detected);
    else if (key === 'node') verified = !!detected.express || !!detected.node;
    else if (key === 'database') verified = !!detected.prisma;
    else if (key === 'jwt') verified = !!detected.jwt;
    else if (key === 'rest') verified = !!detected.rest_api;
    else if (key === 'testing') verified = filesHaveTestIndicators(detected);
    else verified = Boolean((detected as any)[key]);

    return { ...s, verified };
  });
}

function filesHaveResponsiveIndicators(detected: Record<string, boolean>) {
  // heuristic: presence of tailwind or css implies responsive work
  return Boolean(detected.tailwind || detected.next || detected.react);
}

function filesHaveTestIndicators(detected: Record<string, boolean>) {
  return false; // placeholder — could check for jest/playwright files in tree
}
