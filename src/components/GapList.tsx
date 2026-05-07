'use client';
import { useJobMatchStore } from '@/store/useJobMatchStore';
import { CheckCircle2, GitPullRequest, Loader2 } from 'lucide-react';
import { useState } from 'react';

export default function GapList() {
  const { tasks, updateTaskVerification } = useJobMatchStore();
  const [repoUrl, setRepoUrl] = useState('');
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!repoUrl) {
      alert('Please enter a GitHub repository URL first.');
      return;
    }
    setVerifyingId('ANALYZE');
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ githubRepoUrl: repoUrl })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Analysis failed');
        return;
      }

      // Map analysis results to existing tasks by skill key (task id = SK_<key>)
      if (Array.isArray(data.tasks)) {
        data.tasks.forEach((t: any) => {
          const expectedId = `SK_${t.key}`;
          const matching = tasks.find(task => task.id === expectedId || task.title === t.title);
          if (matching) {
            updateTaskVerification(matching.id, Boolean(t.verified));
          }
        });
      }

      alert(`Analysis complete for ${data.repo}`);
    } catch (err) {
      console.error(err);
      alert('An error occurred during analysis.');
    } finally {
      setVerifyingId(null);
    }
  };

  const handleVerify = async (taskId: string, taskTitle: string) => {
    if (!repoUrl) {
      alert("Please enter a GitHub repository URL first.");
      return;
    }
    setVerifyingId(taskId);
    
    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ githubRepoUrl: repoUrl, taskId, taskTitle })
      });
      const data = await res.json();
      
      if (res.ok) {
        updateTaskVerification(taskId, data.verified);
        if (!data.verified) {
          alert(`Verification Failed: ${data.message}`);
        }
      } else {
        alert(data.error || 'Verification failed unexpectedly');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred during verification.');
    } finally {
      setVerifyingId(null);
    }
  };

  return (
    <div className="card" style={{ gridColumn: '1 / -1' }}>
      <div className="section-title">
        <CheckCircle2 size={24} style={{ color: 'var(--success)' }} />
        <h2>Readiness Gaps & Tasks</h2>
      </div>
      
      <input 
        type="text" 
        className="input" 
        placeholder="Enter your Project GitHub URL to verify (e.g., https://github.com/user/project)" 
        value={repoUrl}
        onChange={(e) => setRepoUrl(e.target.value)}
      />

      <div className="task-list" style={{ marginTop: '1rem' }}>
        {tasks.map(task => (
          <div key={task.id} className="task-card">
            <div className="task-info">
              <span className="task-title">{task.title}</span>
              <div className="task-meta">
                <span className={`badge ${task.verified ? 'badge-done' : 'badge-todo'}`}>
                  {task.verified ? 'VERIFIED' : 'PENDING'}
                </span>
                <span className="task-weight">Weight: {task.weight}%</span>
              </div>
            </div>
            
            <button 
              className={`btn ${task.verified ? 'btn-outline' : 'btn-primary'}`}
              disabled={task.verified || verifyingId === task.id}
              onClick={() => handleVerify(task.id, task.title)}
            >
              {verifyingId === task.id ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Loader2 size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                  Verifying...
                </div>
              ) : task.verified ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
                  Verified
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <GitPullRequest size={16} />
                  Verify via GitHub
                </div>
              )}
            </button>
          </div>
        ))}
        {tasks.length === 0 && (
          <p>No tasks available for this role.</p>
        )}
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}} />
    </div>
  );
}
