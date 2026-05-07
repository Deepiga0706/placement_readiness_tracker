import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const file = path.join(process.cwd(), 'src', 'data', 'questions.json');
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    return NextResponse.json({ questions: data });
  } catch (err) {
    console.error('Failed to read questions', err);
    return NextResponse.json({ error: 'Unable to load questions' }, { status: 500 });
  }
}
