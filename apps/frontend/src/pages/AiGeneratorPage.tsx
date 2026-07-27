import React, { useState, useEffect } from 'react';
import { aiApi, questionsApi } from '../services/api';
import { Brain, Sparkles, CheckCircle, Loader, ArrowRight } from 'lucide-react';

export const AiGeneratorPage: React.FC = () => {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [count, setCount] = useState(5);
  const [difficulty, setDifficulty] = useState(5);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<any>(null);
  const [generating, setGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([]);

  useEffect(() => {
    questionsApi.getSubjects().then((data) => {
      if (data && data.length > 0) {
        setSubjects(data);
        setSelectedSubject(data[0].id);
      }
    });
  }, []);

  useEffect(() => {
    if (!jobId) return;

    const interval = setInterval(async () => {
      try {
        const res = await aiApi.getJobStatus(jobId);
        setJobStatus(res);
        if (res.status === 'COMPLETED') {
          setGenerating(false);
          setGeneratedQuestions(res.questions || []);
          clearInterval(interval);
        } else if (res.status === 'FAILED') {
          setGenerating(false);
          alert(`AI Generation Failed: ${res.error || 'Unknown error'}`);
          clearInterval(interval);
        }
      } catch (err) {
        console.error(err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [jobId]);

  const handleGenerate = async () => {
    setGenerating(true);
    setGeneratedQuestions([]);
    setJobStatus(null);
    try {
      const res = await aiApi.generateQuestions({
        subjectId: selectedSubject,
        count: Number(count),
        difficulty: Number(difficulty),
      });
      setJobId(res.jobId);
    } catch (err: any) {
      alert(err.message || 'Failed to start AI generation job');
      setGenerating(false);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'rgba(168, 85, 247, 0.15)',
          border: '1px solid rgba(168, 85, 247, 0.3)',
          color: '#A855F7',
          padding: '0.4rem 0.875rem',
          borderRadius: '20px',
          fontSize: '0.85rem',
          fontWeight: 600,
          marginBottom: '1rem'
        }}>
          <Sparkles size={16} /> 12-Step RAG NCERT Pipeline
        </div>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800 }}>AI Question Generator</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Generate high-yield NEET MCQs validated against NCERT syllabus
        </p>
      </div>

      <div className="glass-card" style={{ padding: '2rem', marginBottom: '2.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Subject
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: '#0B0F17',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: '#FFF',
                fontSize: '0.95rem'
              }}
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Number of Questions ({count})
            </label>
            <input
              type="range"
              min="1"
              max="20"
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#6366F1' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Difficulty Level ({difficulty}/10)
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={difficulty}
              onChange={(e) => setDifficulty(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#6366F1' }}
            />
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={generating}
          style={{
            width: '100%',
            padding: '0.875rem',
            background: 'linear-gradient(135deg, #6366F1, #A855F7)',
            border: 'none',
            borderRadius: '10px',
            color: '#FFF',
            fontSize: '1rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            cursor: 'pointer',
            opacity: generating ? 0.7 : 1
          }}
        >
          {generating ? <Loader className="spin" size={20} /> : <Brain size={20} />}
          {generating ? 'Executing 12-Step RAG Pipeline...' : 'Generate Questions with AI'}
        </button>

        {jobStatus && (
          <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#0B0F17', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>
              <span>Job Progress: {jobStatus.status}</span>
              <span>{jobStatus.progress}%</span>
            </div>
            <div style={{ height: '6px', background: '#1E293B', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${jobStatus.progress}%`, background: 'linear-gradient(90deg, #6366F1, #10B981)', transition: 'width 0.3s ease' }} />
            </div>
          </div>
        )}
      </div>

      {/* Generated Questions List */}
      {generatedQuestions.length > 0 && (
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle color="#10B981" /> Generated NCERT Questions ({generatedQuestions.length})
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {generatedQuestions.map((q, idx) => (
              <div key={q.id || idx} className="glass-card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontWeight: 700, color: '#6366F1' }}>Question {idx + 1}</span>
                  <span style={{ fontSize: '0.8rem', background: 'var(--primary-light)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                    Diff: {q.difficulty}/10
                  </span>
                </div>

                <p style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '1rem' }}>{q.questionText}</p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                  {['optionA', 'optionB', 'optionC', 'optionD'].map((optKey, optIdx) => {
                    const optionLetter = ['A', 'B', 'C', 'D'][optIdx];
                    const isCorrect = q.correctOption === optionLetter;
                    return (
                      <div
                        key={optKey}
                        style={{
                          padding: '0.75rem',
                          borderRadius: '8px',
                          background: isCorrect ? 'var(--emerald-light)' : '#0B0F17',
                          border: isCorrect ? '1px solid var(--emerald)' : '1px solid var(--border-color)',
                          fontSize: '0.9rem'
                        }}
                      >
                        <strong>({optionLetter})</strong> {q[optKey]}
                      </div>
                    );
                  })}
                </div>

                {q.explanation && (
                  <div style={{ background: '#0B0F17', padding: '0.875rem', borderRadius: '8px', borderLeft: '3px solid #6366F1', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    <strong style={{ color: '#FFF' }}>NCERT Explanation:</strong> {q.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};