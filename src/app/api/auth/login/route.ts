import { NextResponse } from 'next/server';
import { verifyUser, createJwt } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });

    const user = await verifyUser(email, password);
    if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

    const token = createJwt({ id: user.id, email: user.email });
    const res = NextResponse.json({ user });
    res.headers.set('Set-Cookie', `token=${token}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=Lax`);
    return res;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Login failed' }, { status: 500 });
  }
}
