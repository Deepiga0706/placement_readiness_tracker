'use client';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import { Bell, Menu, User, LogOut, X, LayoutDashboard, Search, FileText, Compass, Settings } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/components/ui/ToastProvider';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const toast = useToast();
  const [open, setOpen] = useState(false);

  const isAuthPage = pathname === '/login' || pathname === '/signup';

  const handleLogout = async () => {
    await logout();
    toast.push({ message: 'Logged out successfully', type: 'success' });
    router.push('/login');
    setOpen(false);
  };

  const navLinks = user ? [
    { name: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={18} /> },
    { name: 'Analyze', href: '/analyze', icon: <Search size={18} /> },
    { name: 'Assessment', href: '/assessment', icon: <FileText size={18} /> },
    { name: 'Recommendations', href: '/recommendations', icon: <Compass size={18} /> },
    { name: 'Profile', href: '/profile', icon: <User size={18} /> },
  ] : [
    { name: 'Home', href: '/' },
    { name: 'Features', href: '/#features' },
    { name: 'About', href: '/#about' },
  ];

  return (
    <header className="w-full sticky top-0 z-50 backdrop-blur-md bg-black/60 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-cyan-400 flex items-center justify-center text-white font-bold shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
                SG
              </div>
              <div className="text-xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent hidden sm:block">
                Skill Gap
              </div>
            </Link>

            {!isAuthPage && (
              <nav className="hidden md:flex items-center gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      pathname === link.href
                        ? 'bg-white/10 text-white'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>
            )}
          </div>

          <div className="flex items-center gap-4">
            {!isAuthPage && (
              <>
                {user ? (
                  <div className="flex items-center gap-4">
                    <button 
                      aria-label="notifications" 
                      className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all relative"
                    >
                      <Bell size={20} />
                      <span className="absolute top-2 right-2 w-2 h-2 bg-purple-500 rounded-full border-2 border-black" />
                    </button>
                    
                    <div className="h-8 w-[1px] bg-white/10 hidden sm:block" />

                    <div className="flex items-center gap-3">
                      <div className="hidden lg:block text-right">
                        <div className="text-sm font-medium text-white">{user.name || 'User'}</div>
                        <div className="text-xs text-slate-500">{user.email}</div>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600/20 to-cyan-400/20 border border-white/10 flex items-center justify-center text-purple-400 font-semibold">
                        {user.email[0].toUpperCase()}
                      </div>
                      <button 
                        onClick={handleLogout}
                        className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                        title="Logout"
                      >
                        <LogOut size={20} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Link 
                      href="/login" 
                      className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-all"
                    >
                      Login
                    </Link>
                    <Link 
                      href="/signup" 
                      className="px-5 py-2.5 rounded-xl bg-white text-black text-sm font-bold hover:bg-slate-200 transition-all shadow-lg shadow-white/5"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}

                <button 
                  className="md:hidden p-2 rounded-xl bg-white/5 text-white" 
                  onClick={() => setOpen(!open)}
                >
                  {open ? <X /> : <Menu />}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && !isAuthPage && (
        <div className="md:hidden bg-[#0a0a0a] border-t border-white/10 animate-in slide-in-from-top duration-300">
          <div className="px-4 py-6 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all ${
                  pathname === link.href
                    ? 'bg-gradient-to-r from-purple-600/20 to-cyan-400/20 text-white border border-white/10'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {/* @ts-ignore */}
                {link.icon || null}
                {link.name}
              </Link>
            ))}
            
            {user && (
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-red-400 hover:bg-red-500/10 transition-all"
              >
                <LogOut size={18} /> Logout
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
