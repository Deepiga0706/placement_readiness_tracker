import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyJwt } from '@/lib/auth';

export default function Home() {
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;
  if (token) {
    const payload = verifyJwt(token as string);
    if (payload) {
      redirect('/dashboard');
    }
  }
  redirect('/login');
}
