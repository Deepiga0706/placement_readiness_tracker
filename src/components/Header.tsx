'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Bell, Menu, User, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/components/ui/ToastProvider';

export default function Header() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const toast = useToast();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.push({ message: 'Logged out', type: 'success' });
    router.push('/login');
  };

  return (
    <header className="w-full sticky top-0 z-40 backdrop-blur bg-gradient-to-r from-black/40 to-transparent border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-400 flex items-center justify-center text-white font-bold">SG</div>
              <div className="text-lg font-semibold">Skill Gap Analyzer</div>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-3">
            <Link href="/dashboard" className="px-3 py-2 rounded-md hover:bg-white/3">Dashboard</Link>
            <Link href="/analyze" className="px-3 py-2 rounded-md hover:bg-white/3">Analyze</Link>
            <Link href="/assessment" className="px-3 py-2 rounded-md hover:bg-white/3">Assessment</Link>
            <Link href="/recommendations" className="px-3 py-2 rounded-md hover:bg-white/3">Recommendations</Link>
            <Link href="/profile" className="px-3 py-2 rounded-md hover:bg-white/3">Profile</Link>
          </nav>

          <div className="flex items-center gap-3">
            <button aria-label="notifications" className="p-2 rounded-md hover:bg-white/3"><Bell size={18} /></button>

            {user ? (
              <div className="hidden md:flex items-center gap-3">
                <div className="text-sm text-slate-300">{user.email}</div>
                <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-400 text-white"><LogOut size={16} /> Logout</button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/login" className="px-3 py-2 rounded-md hover:bg-white/3">Login</Link>
                <Link href="/signup" className="px-3 py-2 rounded-md bg-white/5 rounded-lg">Sign Up</Link>
              </div>
            )}

            <button className="md:hidden p-2" onClick={() => setOpen(!open)}><Menu /></button>
          </div>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-black/60 px-4 py-3 border-t border-white/5">
          <div className="flex flex-col gap-2">
            <Link href="/dashboard" className="px-3 py-2 rounded-md">Dashboard</Link>
            <Link href="/analyze" className="px-3 py-2 rounded-md">Analyze</Link>
            <Link href="/assessment" className="px-3 py-2 rounded-md">Assessment</Link>
            <Link href="/recommendations" className="px-3 py-2 rounded-md">Recommendations</Link>
            <Link href="/profile" className="px-3 py-2 rounded-md">Profile</Link>
            {user ? (
              <button onClick={handleLogout} className="mt-2 px-3 py-2 rounded-md bg-gradient-to-r from-purple-600 to-cyan-400 text-white">Logout</button>
            ) : (
              <div className="flex gap-2">
                <Link href="/login" className="px-3 py-2 rounded-md">Login</Link>
                <Link href="/signup" className="px-3 py-2 rounded-md bg-white/5">Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
