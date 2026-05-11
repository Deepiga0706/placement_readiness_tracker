import { NextResponse } from 'next/server';
import { verifyJwt, getUserById } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const cookie = req.headers.get('cookie') || '';
    const token = cookie.split(';').map(s => s.trim()).find(s => s.startsWith('token='))?.split('=')[1];
    if (!token) return NextResponse.json({ user: null });

    const payload: any = verifyJwt(token);
    if (!payload?.id) return NextResponse.json({ user: null });

    const user = getUserById(payload.id);
    if (!user) return NextResponse.json({ user: null });

    return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    console.error('auth/me error', err);
    return NextResponse.json({ user: null });
  }
}
