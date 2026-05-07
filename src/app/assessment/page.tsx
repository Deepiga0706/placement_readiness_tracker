"use client";
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import BANK, { Question } from '@/lib/assessmentBank';

type ModeKey = keyof typeof BANK;

function shuffle<T>(arr: T[]) { return arr.slice().sort(() => Math.random() - 0.5); }

export default function AssessmentPage() {
  const router = useRouter();
  const modes = Object.keys(BANK) as ModeKey[];
  const [mode, setMode] = useState<ModeKey>('DSA');
  const [numQuestions, setNumQuestions] = useState(5);
  const [running, setRunning] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string,string>>({});
  const [marked, setMarked] = useState<Record<string,boolean>>({});
  const [reviewLater, setReviewLater] = useState<Record<string,boolean>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => { if (timerRef.current) window.clearInterval(timerRef.current); };
  }, []);

  function startTest() {
    const pool = BANK[mode] || [];
    const pick = shuffle(pool).slice(0, Math.min(numQuestions, pool.length));
    setQuestions(pick);
    setIndex(0);
    setAnswers({});
    setMarked({});
    setReviewLater({});
    const totalTime = pick.reduce((s,q) => s + (q.estTime || 90), 0);
    setTimeLeft(totalTime);
    setRunning(true);

    timerRef.current = window.setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          if (timerRef.current) { window.clearInterval(timerRef.current); timerRef.current = null; }
          handleSubmit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }

  function selectOption(qid: string, opt: string) {
    setAnswers(a => ({ ...a, [qid]: opt }));
  }

  function toggleMark(qid: string) { setMarked(m => ({ ...m, [qid]: !m[qid] })); }
  function toggleReview(qid: string) { setReviewLater(r => ({ ...r, [qid]: !r[qid] })); }

  function navigateTo(i: number) { if (i >=0 && i < questions.length) setIndex(i); }

  function computeResults(qs: Question[], ans: Record<string,string>) {
    const details = qs.map(q => ({ id: q.id, correct: q.answer === (ans[q.id] || null), topic: q.topic, difficulty: q.difficulty, marks: q.marks || 1 }));
    const correct = details.filter(d => d.correct).length;
    const wrong = details.filter(d => d.correct === false && (ans[d.id] !== undefined)).length;
    const unanswered = details.length - correct - wrong;
    const totalMarks = details.reduce((s,d) => s + (d.marks||1),0);
    const earned = details.reduce((s,d) => s + ((d.correct) ? (d.marks||1) : 0),0);
    const percent = totalMarks === 0 ? 0 : Math.round((earned / totalMarks) * 100);

    // subject breakdown
    const byTopic: Record<string,{ correct:number,total:number }> = {};
    details.forEach(d => { byTopic[d.topic] = byTopic[d.topic] || { correct:0, total:0 }; byTopic[d.topic].total++; if (d.correct) byTopic[d.topic].correct++; });

    return { percent, total: details.length, correct, wrong, unanswered, details, byTopic };
  }

  function handleSubmit() {
    if (timerRef.current) { window.clearInterval(timerRef.current); timerRef.current = null; }
    const res = computeResults(questions, answers);
    const record = {
      id: `run-${Date.now()}`,
      mode,
      startedAt: Date.now(),
      duration: questions.reduce((s,q)=> s + (q.estTime||90),0) - timeLeft,
      result: res,
      questions,
      answers
    };
    // save history
    try {
      const hist = JSON.parse(localStorage.getItem('assessmentsHistory')||'[]');
      hist.unshift(record);
      localStorage.setItem('assessmentsHistory', JSON.stringify(hist.slice(0,50)));
      sessionStorage.setItem('latestAssessment', JSON.stringify(record));
    } catch (e) {}
    setRunning(false);
    router.push('/assessment-result');
  }

  const palette = useMemo(() => questions.map((q, i) => ({ id: q.id, idx: i, status: answers[q.id] ? 'answered' : 'unanswered', review: !!reviewLater[q.id] })), [questions, answers, reviewLater]);

  return (
    <div className="container">
      <h1 className="text-2xl font-bold">Assessments</h1>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        <aside className="p-4 bg-slate-900/30 rounded-xl border border-white/5">
          <h3 className="font-semibold">Mode</h3>
          <div className="mt-3 flex flex-col gap-2">
            {modes.map(m => <button key={m} className={`px-3 py-2 rounded ${m===mode ? 'bg-purple-700' : ''}`} onClick={() => setMode(m)}>{m}</button>)}
          </div>
          {!running && (
            <div className="mt-4">
              <label className="text-sm">Questions</label>
              <input type="number" value={numQuestions} min={1} max={20} onChange={e => setNumQuestions(Math.max(1, Math.min(20, Number(e.target.value||5))))} className="w-full mt-2 p-2 rounded bg-slate-800" />
              <button className="mt-4 w-full auth-button" onClick={startTest}>Start Test</button>
            </div>
          )}
          {running && (
            <div className="mt-4">
              <div className="text-sm">Time Left</div>
              <div className="font-mono mt-1">{Math.floor(timeLeft/60).toString().padStart(2,'0')}:{(timeLeft%60).toString().padStart(2,'0')}</div>
              <button className="mt-4 w-full auth-button" onClick={handleSubmit}>Submit Now</button>
            </div>
          )}
        </aside>

        <main className="md:col-span-3 p-4 bg-slate-900/30 rounded-xl border border-white/5">
          {!running && (
            <div className="text-center text-slate-300">Select mode and start the test. Questions will be randomized.</div>
          )}

          {running && questions.length > 0 && (
            <div>
              <div className="flex items-center justify-between">
                <div className="font-semibold">Question {index+1} / {questions.length}</div>
                <div className="text-sm text-slate-400">Topic: {questions[index].topic} • {questions[index].difficulty}</div>
              </div>

              <div className="mt-4 p-4 bg-slate-800 rounded">
                <div className="font-medium">{questions[index].prompt}</div>
                <div className="mt-3 grid gap-2">
                  {questions[index].options.map(opt => (
                    <label key={opt} className={`p-2 rounded border ${answers[questions[index].id] === opt ? 'bg-purple-700' : 'bg-transparent'}`}>
                      <input type="radio" name={questions[index].id} checked={answers[questions[index].id] === opt} onChange={() => selectOption(questions[index].id, opt)} />
                      <span className="ml-2">{opt}</span>
                    </label>
                  ))}
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <button className="auth-button" onClick={() => navigateTo(Math.max(0, index-1))}>Previous</button>
                  <button className="auth-button" onClick={() => navigateTo(Math.min(questions.length-1, index+1))}>Next</button>
                  <button className="auth-button" onClick={() => toggleMark(questions[index].id)}>{marked[questions[index].id] ? 'Unmark' : 'Mark'}</button>
                  <button className="auth-button" onClick={() => toggleReview(questions[index].id)}>{reviewLater[questions[index].id] ? 'Unflag' : 'Review Later'}</button>
                </div>

                <div className="mt-4">
                  <div className="text-sm">Question Palette</div>
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {palette.map(p => (
                      <button key={p.id} onClick={() => navigateTo(p.idx)} className={`w-10 h-10 rounded ${p.status==='answered'?'bg-green-600':'bg-white/5'} ${p.review?'ring-2 ring-yellow-400':''}`}>{p.idx+1}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
