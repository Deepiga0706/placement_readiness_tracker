'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { ArrowRight, BarChart2, CheckCircle, Target, Zap, Shield, Cpu, BookOpen } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    } else {
      setIsLoaded(true);
    }
  }, [user, router]);

  if (!isLoaded || user) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-purple-500/30">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-purple-900/20 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm font-medium mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            AI-Powered Career Optimization
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-r from-white via-white to-white/40 bg-clip-text text-transparent italic">
            Bridge Your Skill Gaps with <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">Precision.</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-10">
            The ultimate AI-driven platform designed to analyze your current skills, identify critical gaps, and provide actionable roadmaps to make you placement-ready.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="group px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-400 font-semibold text-lg flex items-center justify-center gap-2 transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(168,85,247,0.4)]">
              Get Started Free <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="/login" className="px-8 py-4 rounded-xl bg-white/5 border border-white/10 font-semibold text-lg hover:bg-white/10 transition-all">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-4 bg-black/40">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Master Your Career Journey</h2>
            <p className="text-slate-400">Everything you need to land your dream role in one powerful platform.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard 
              icon={<Cpu className="text-purple-400" />}
              title="AI Analysis"
              description="Deep-dive analysis of your GitHub repositories and projects using LLMs to gauge technical proficiency."
            />
            <FeatureCard 
              icon={<Target className="text-cyan-400" />}
              title="Gap Detection"
              description="Precisely identify missing skills required for your target roles like SDE, DevOps, or Data Science."
            />
            <FeatureCard 
              icon={<BookOpen className="text-purple-400" />}
              title="Smart Learning"
              description="Curated learning paths and resources tailored to bridge your specific technical gaps."
            />
            <FeatureCard 
              icon={<CheckCircle className="text-cyan-400" />}
              title="Mock Assessments"
              description="Practice with AI-generated mock tests that simulate real interview scenarios."
            />
          </div>
        </div>
      </section>

      {/* AI Intelligence Section */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-6">
              <Zap className="text-purple-400" />
            </div>
            <h2 className="text-4xl font-bold mb-6">Analyze Your Codebase Like Never Before</h2>
            <p className="text-lg text-slate-400 mb-8 leading-relaxed">
              Our advanced AI doesn't just check for keywords. It understands your code quality, architecture patterns, and problem-solving approach.
            </p>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-slate-300">
                <CheckCircle size={20} className="text-cyan-400" /> GitHub Repository Integration
              </li>
              <li className="flex items-center gap-3 text-slate-300">
                <CheckCircle size={20} className="text-cyan-400" /> Automated Readiness Scoring
              </li>
              <li className="flex items-center gap-3 text-slate-300">
                <CheckCircle size={20} className="text-cyan-400" /> Real-time Industry Benchmarking
              </li>
            </ul>
          </div>
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-cyan-400/20 blur-3xl rounded-3xl" />
            <div className="relative bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-8">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="text-xs text-slate-500 font-mono">analysis_report.json</div>
              </div>
              <div className="space-y-4 font-mono text-sm">
                <div className="text-purple-400">"technical_stack": ["React", "TypeScript", "Node.js"]</div>
                <div className="text-cyan-400">"readiness_score": 84.5</div>
                <div className="text-slate-400">"identified_gaps": [
                  "Distributed Systems",
                  "Advanced PostgreSQL"
                ]</div>
                <div className="pt-4 border-t border-white/5">
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-600 to-cyan-400 w-[84%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-[2rem] p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[100px]" />
          <h2 className="text-4xl font-bold mb-6">Ready to Accelerate Your Career?</h2>
          <p className="text-slate-400 mb-10">Join thousands of students who have already identified their path to success.</p>
          <Link href="/signup" className="inline-flex px-10 py-5 rounded-2xl bg-white text-black font-bold text-xl hover:bg-slate-200 transition-all hover:scale-105">
            Start Free Assessment
          </Link>
        </div>
      </section>

      <footer className="py-12 border-t border-white/5 px-4 text-center text-slate-500 text-sm">
        © 2024 Skill Gap Analyzer. Built for the future of recruitment.
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all hover:bg-white/[0.07] group">
      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-slate-400 leading-relaxed">{description}</p>
    </div>
  );
}
