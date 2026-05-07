'use client';
import React, { useEffect, useState } from 'react';
import { useJobMatchStore } from '@/store/useJobMatchStore';

type Q = { id: string; question: string; options: string[] };

export default function AssessmentPage() {
  const [mode, setMode] = useState('DSA');
  const [questions, setQuestions] = useState<Record<string, Q[]>>({});
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const { setDsaScore } = useJobMatchStore();

  useEffect(() => {
    fetch('/api/quiz').then(r => r.json()).then(d => setQuestions(d.questions || {})).catch(() => {});
  }, []);

  const handleSelect = (id: string, val: string) => setAnswers(prev => ({ ...prev, [id]: val }));

  const handleSubmit = async () => {
    const payload = { answers: Object.keys(answers).map(id => ({ id, answer: answers[id] })) };
    setLoading(true);
    try {
      const res = await fetch('/api/submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (res.ok) {
        alert(`DSA Score: ${data.score}%`);
        setDsaScore(data.score);
      } else alert(data.error || 'Submission failed');
    } catch (e) {
      console.error(e);
      alert('Submission error');
    } finally { setLoading(false); }
  };

  return (
    <div className="container">
      <h1 className="text-2xl font-bold">Assessments</h1>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <aside className="p-4 bg-slate-900/30 rounded-xl border border-white/5">
          <h3 className="font-semibold">Modes</h3>
          <div className="mt-3 flex flex-col gap-2">
            <button className={`px-3 py-2 rounded ${mode==='DSA'?'bg-purple-700':''}`} onClick={()=>setMode('DSA')}>DSA</button>
            <button className={`px-3 py-2 rounded ${mode==='DBMS'?'bg-purple-700':''}`} onClick={()=>setMode('DBMS')}>DBMS</button>
            <button className={`px-3 py-2 rounded ${mode==='OS'?'bg-purple-700':''}`} onClick={()=>setMode('OS')}>OS</button>
            <button className={`px-3 py-2 rounded ${mode==='CN'?'bg-purple-700':''}`} onClick={()=>setMode('CN')}>CN</button>
          </div>
        </aside>

        <main className="md:col-span-2 p-4 bg-slate-900/30 rounded-xl border border-white/5">
          <h3 className="font-semibold">{mode} Practice</h3>

          <div style={{ marginTop: 20, display: 'grid', gap: 12 }}>
            {Object.entries(questions).length === 0 && <div className="card">Loading questions...</div>}
            {Object.entries(questions).map(([section, qs]) => (
              <div key={section} className="card">
                <h3 style={{ textTransform: 'uppercase' }}>{section}</h3>
                <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
                  {qs.map(q => (
                    <div key={q.id} style={{ padding: 12, border: '1px solid var(--border)', borderRadius: 8 }}>
                      <div style={{ fontWeight: 700 }}>{q.question}</div>
                      <div style={{ marginTop: 8, display: 'flex', gap: 8, flexDirection: 'column' }}>
                        {q.options.map(opt => (
                          <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <input type="radio" name={q.id} checked={answers[q.id] === opt} onChange={() => handleSelect(q.id, opt)} />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>{loading ? 'Submitting...' : 'Submit Answers'}</button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
