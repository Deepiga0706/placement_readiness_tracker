import { NextResponse } from 'next/server';

type FetchOpts = { token?: string };

const GITHUB_API = 'https://api.github.com';

async function ghFetch(path: string, opts: FetchOpts = {}) {
  const headers: Record<string,string> = { Accept: 'application/vnd.github.v3+json' };
  if (opts.token) headers.Authorization = `token ${opts.token}`;
  const res = await fetch(`${GITHUB_API}${path}`, { headers });
  if (!res.ok) return null;
  return res.json();
}

function parseGithubRepo(input: string) {
  if (!input) return null;
  const m = input.match(/github\.com\/(?<owner>[^\/]+)\/(?<repo>[^\/]+)(?:\.git|\/|$)/);
  if (m && (m as any).groups) return { owner: (m as any).groups.owner, repo: (m as any).groups.repo.replace(/\.git$/,'') };
  const parts = input.split('/').filter(Boolean);
  if (parts.length === 2) return { owner: parts[0], repo: parts[1] };
  return null;
}

function detectTechFromDeps(deps: Record<string,string> = {}) {
  const keys = Object.keys(deps || {}).map(k => k.toLowerCase());
  const tech: Record<string,string> = {};
  const map: Record<string,string[]> = {
    'Next.js': ['next'],
    'React': ['react'],
    'TypeScript': ['typescript'],
    'Tailwind CSS': ['tailwindcss'],
    'Node.js': ['express','koa','fastify','node'],
    'Prisma': ['prisma'],
    'MongoDB': ['mongoose','mongodb'],
    'Firebase': ['firebase','firebase-admin'],
    'Auth (JWT)': ['jsonwebtoken','bcrypt','passport','next-auth'],
    'Zustand/Redux': ['zustand','redux'],
    'Jest/RTL': ['jest','@testing-library/react','@testing-library/jest-dom']
  };
  for (const [name, probes] of Object.entries(map)) {
    for (const p of probes) {
      if (keys.some(k => k.includes(p))) { tech[name] = 'Verified'; break; }
    }
  }
  return tech;
}

function scoreFromTechs(techObj: Record<string,string>) {
  let frontend = 0, backend = 0, fullstack = 0;
  if (techObj['React'] || techObj['Next.js']) frontend += 40;
  if (techObj['Tailwind CSS']) frontend += 20;
  if (techObj['TypeScript']) frontend += 10;
  if (techObj['Node.js'] || techObj['Prisma'] || techObj['MongoDB'] || techObj['Firebase']) backend += 40;
  if (techObj['Prisma'] || techObj['MongoDB']) backend += 20;
  if (techObj['Auth (JWT)']) backend += 10;
  fullstack = Math.round((frontend + backend) / 2);
  frontend = Math.min(100, frontend);
  backend = Math.min(100, backend);
  const placement = Math.round((frontend * 0.45) + (backend * 0.35) + (fullstack * 0.2));
  return { frontend, backend, fullstack, placement };
}

function qualityLabel(score: number) {
  if (score >= 80) return 'Excellent';
  if (score >= 50) return 'Good';
  return 'Needs Improvement';
}

async function runAnalysis(parsed: {owner:string, repo:string}, token?: string) {
  const repoInfo = await ghFetch(`/repos/${parsed.owner}/${parsed.repo}`, { token });
  if (!repoInfo) return null;

  const languages = await ghFetch(`/repos/${parsed.owner}/${parsed.repo}/languages`, { token }) || {};
  const readme = await ghFetch(`/repos/${parsed.owner}/${parsed.repo}/readme`, { token });
  const defaultBranch = repoInfo.default_branch || 'master';
  const tree = await ghFetch(`/repos/${parsed.owner}/${parsed.repo}/git/trees/${defaultBranch}?recursive=1`, { token });
  const commits = await ghFetch(`/repos/${parsed.owner}/${parsed.repo}/commits?per_page=100`, { token }) || [];

  let pkg = null;
  try {
    const content = await ghFetch(`/repos/${parsed.owner}/${parsed.repo}/contents/package.json`, { token });
    if (content && content.content) {
      const decoded = Buffer.from(content.content, 'base64').toString('utf8');
      pkg = JSON.parse(decoded);
    }
  } catch (e) {
    pkg = null;
  }

  const deps = { ...(pkg?.dependencies || {}), ...(pkg?.devDependencies || {}) };
  const detected = detectTechFromDeps(deps);
  if (languages && Object.keys(languages).length) {
    if (languages['JavaScript'] || languages['TypeScript']) detected['JavaScript/TypeScript'] = 'Verified';
    if (languages['CSS']) detected['CSS'] = 'Partial';
  }

  const scores = scoreFromTechs(detected);

  const files = (tree && tree.tree) || [];
  const hasComponents = files.some((f:any) => f.path.toLowerCase().includes('components/'));
  const hasApi = files.some((f:any) => f.path.includes('api/') || f.path.includes('pages/api/') || f.path.includes('src/app/api'));
  const hasEnv = files.some((f:any) => f.path.includes('.env') || f.path.includes('env') || f.path.includes('process.env'));
  const hasTests = files.some((f:any) => f.path.toLowerCase().includes('__tests__') || f.path.toLowerCase().includes('.test.'));
  const readmeText = readme && readme.content ? Buffer.from(readme.content, 'base64').toString('utf8') : '';

  const qualityScore = Math.round(( (hasComponents?20:0) + (hasApi?20:0) + (hasTests?20:0) + (readmeText.length>200?20:0) + (hasEnv?20:0) ));

  const quality = {
    folderStructure: qualityLabel(qualityScore),
    components: hasComponents ? 'Good' : 'Needs Improvement',
    responsiveness: (detected['Tailwind CSS'] || detected['CSS']) ? 'Good' : 'Needs Improvement',
    apiDesign: hasApi ? 'Good' : 'Needs Improvement',
    auth: detected['Auth (JWT)'] ? 'Good' : 'Missing'
  };

  const now = new Date();
  const daysWindow = 90;
  const since = new Date(now.getTime() - daysWindow * 24 * 60 * 60 * 1000);
  const recentCommits = (commits || []).filter((c:any) => new Date(c.commit.author.date) > since);
  const activityScore = Math.min(100, Math.round((recentCommits.length / (daysWindow/2)) * 10));
  const activityLabel = activityScore > 60 ? 'Active Contributor' : (activityScore > 25 ? 'Moderate Activity' : 'Low Activity');

  const gaps: any[] = [];
  if (!detected['Auth (JWT)']) gaps.push({ skill: 'Authentication', priority: 'High', importance: 'Critical', suggestion: 'Add JWT/NextAuth flows and secure cookie handling.' });
  if (!detected['Prisma'] && !detected['MongoDB'] && !detected['Firebase']) gaps.push({ skill: 'Database Design', priority: 'Medium', importance: 'High', suggestion: 'Add database schema and persistent storage (Postgres/Prisma or MongoDB).' });
  if (!hasTests) gaps.push({ skill: 'Testing', priority: 'High', importance: 'High', suggestion: 'Add unit and integration tests with Jest and React Testing Library.' });

  const recs: string[] = [];
  if (!detected['Node.js']) recs.push('Learn Node.js + Express for backend development');
  if (!detected['Prisma'] && !detected['MongoDB']) recs.push('Learn Prisma + PostgreSQL or MongoDB');
  if (!hasTests) recs.push('Add testing with Jest + React Testing Library');

  const analysis = {
    repo: repoInfo.full_name,
    description: repoInfo.description,
    stars: repoInfo.stargazers_count,
    forks: repoInfo.forks_count,
    languages,
    generatedAt: new Date().toISOString(),
    scores,
    detected,
    technologies: Object.entries(detected).map(([name, status]) => ({ name, status })),
    techs: Object.entries(detected).map(([name, status]) => ({ name, status })),
    quality,
    aiFeedback: `${repoInfo.name} — ${detected['React'] || detected['Next.js'] ? 'Strong frontend architecture detected.' : ''} ${quality.apiDesign === 'Needs Improvement' ? 'APIs need improvement.' : ''}`.trim(),
    skillGaps: gaps,
    roadmap: [ { week: 1, items: ['Improve authentication', 'Add tests'] }, { week: 2, items: ['Add database schema', 'Implement API endpoints'] } ],
    recommendedProjects: recs,
    commitStats: { recentCommits: recentCommits.length, activityScore, activityLabel }
  };

  return analysis;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const url = body.githubRepoUrl || body.repo || body.url || body.github || '';
    const parsed = parseGithubRepo(url) || { owner: body.owner, repo: body.repo };
    if (!parsed || !parsed.owner || !parsed.repo) return NextResponse.json({ error: 'invalid repo url' }, { status: 400 });

    const token = process.env.GITHUB_TOKEN;
    const analysis = await runAnalysis(parsed, token);
    if (!analysis) return NextResponse.json({ error: 'repo not found or rate limited' }, { status: 404 });
    return NextResponse.json({ analysis, ok: true });
  } catch (err: any) {
    console.error('analyze error', err?.message || err);
    return NextResponse.json({ error: err?.message || 'analysis failed' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const repoParam = url.searchParams.get('repo') || url.searchParams.get('githubRepoUrl');
    if (!repoParam) return NextResponse.json({ error: 'Missing repo query param, use ?repo=owner/repo' }, { status: 400 });
    const parsed = parseGithubRepo(repoParam) || { owner: repoParam.split('/')[0], repo: repoParam.split('/')[1] };
    if (!parsed || !parsed.owner || !parsed.repo) return NextResponse.json({ error: 'invalid repo param' }, { status: 400 });
    const token = process.env.GITHUB_TOKEN;
    const analysis = await runAnalysis(parsed, token);
    if (!analysis) return NextResponse.json({ error: 'repo not found or rate limited' }, { status: 404 });
    return NextResponse.json({ analysis, ok: true });
  } catch (err: any) {
    console.error('analyze GET error', err?.message || err);
    return NextResponse.json({ error: err?.message || 'analysis failed' }, { status: 500 });
  }
}
