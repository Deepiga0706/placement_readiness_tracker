import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { answers } = body || {};
    if (!Array.isArray(answers)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // Load questions
    const qpath = `${process.cwd()}/src/data/questions.json`;
    const questions = JSON.parse(require('fs').readFileSync(qpath, 'utf8'));
    const flat: any[] = [];
    Object.values(questions).forEach((arr: any) => arr.forEach((q: any) => flat.push(q)));

    const total = flat.length;
    let correct = 0;
    const details: any[] = [];

    answers.forEach((a: any) => {
      const q = flat.find(item => item.id === a.id);
      if (q) {
        const ok = q.answer === a.answer;
        if (ok) correct++;
        details.push({ id: q.id, ok });
      }
    });

    const score = total === 0 ? 0 : Math.round((correct / total) * 100);

    return NextResponse.json({ score, total, correct, details });
  } catch (err) {
    console.error('Quiz submit error', err);
    return NextResponse.json({ error: 'Internal' }, { status: 500 });
  }
}
