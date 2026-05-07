import { NextResponse } from 'next/server';
import { createUser, createJwt } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();
    if (!email || !password) return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });

    const user = await createUser(email, password, name);

    const token = createJwt({ id: user.id, email: user.email });

    const res = NextResponse.json({ user: { id: user.id, email: user.email, name: user.name } });
    // set cookie
    res.headers.set('Set-Cookie', `token=${token}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=Lax`);
    return res;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Signup failed' }, { status: 400 });
  }
}
