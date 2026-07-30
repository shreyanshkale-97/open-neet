import React, { useState, useEffect } from 'react';
import { aiApi, questionsApi } from '../services/api';
import { Brain, Sparkles, CheckCircle, Loader, ShieldCheck, AlertTriangle, Layers, BookOpen } from 'lucide-react';

interface Chapter {
  id: string;
  name: string;
  classLevel: number;
  highYield: boolean;
  weightagePercent: number;
  keyConcepts: string[];
}

interface Unit {
  id: string;
  unitNumber: number;
  name: string;
  classLevel: number;
  weightagePercent: number;
  chapters: Chapter[];
}

interface SubjectSyllabus {
  subjectId: string;
  subjectName: string;
  totalQuestions: number;
  totalMarks: number;
  deletedTopics: string[];
  units: Unit[];
}

export const AiGeneratorPage: React.FC = () => {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('physics');
  const [syllabusData, setSyllabusData] = useState<Record<string, SubjectSyllabus> | null>(null);
  const [selectedChapter, setSelectedChapter] = useState('');
  const [count, setCount] = useState(5);
  const [difficulty, setDifficulty] = useState(5);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<any>(null);
  const [generating, setGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'generator' | 'syllabus'>('generator');

  useEffect(() => {
    questionsApi.getSubjects().then((data) => {
      if (data && data.length > 0) {
        setSubjects(data);
      }
    });

    // Fetch official NMC NEET 2027 syllabus dataset
    fetch('/api/v1/ai/syllabus/neet-2027')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.subjects) {
          setSyllabusData(data.subjects);
        }
      })
      .catch((err) => console.error('Failed to load NEET 2027 syllabus:', err));
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

  const currentSyllabus = syllabusData ? syllabusData[selectedSubject] : null;

  const handleGenerate = async () => {
    setGenerating(true);
    setGeneratedQuestions([]);
    setJobStatus(null);
    try {
      const res = await aiApi.generateQuestions({
        subjectId: selectedSubject,
        topicId: selectedChapter || undefined,
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
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem' }}>
      {/* Header Badge */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#10B981',
            padding: '0.4rem 1rem',
            borderRadius: '20px',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '1rem',
          }}
        >
          <ShieldCheck size={16} /> NMC NEET UG 2026 / 2027 Official Rationalized Syllabus Compliant
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>AI Exam Paper Generator</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '700px', margin: '0 auto' }}>
          Generate custom NEET practice papers adhering strictly to official NMC weightage, NCERT rationalized topics, Assertion-Reasoning & Statement I/II formats.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button
          onClick={() => setActiveTab('generator')}
          style={{
            padding: '0.6rem 1.5rem',
            borderRadius: '8px',
            border: activeTab === 'generator' ? '2px solid #6366F1' : '1px solid var(--border-color)',
            background: activeTab === 'generator' ? 'rgba(99, 102, 241, 0.15)' : '#0B0F17',
            color: activeTab === 'generator' ? '#6366F1' : 'var(--text-muted)',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Brain size={18} /> Paper Generator
        </button>
        <button
          onClick={() => setActiveTab('syllabus')}
          style={{
            padding: '0.6rem 1.5rem',
            borderRadius: '8px',
            border: activeTab === 'syllabus' ? '2px solid #10B981' : '1px solid var(--border-color)',
            background: activeTab === 'syllabus' ? 'rgba(16, 185, 129, 0.15)' : '#0B0F17',
            color: activeTab === 'syllabus' ? '#10B981' : 'var(--text-muted)',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <BookOpen size={18} /> 2027 NMC Syllabus & Excluded Topics
        </button>
      </div>

      {activeTab === 'generator' && (
        <div className="glass-card" style={{ padding: '2rem', marginBottom: '2.5rem' }}>
          {/* Section A/B Banner */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1rem',
              background: '#0B0F17',
              padding: '1rem 1.25rem',
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
              marginBottom: '1.5rem',
            }}
          >
            <div>
              <span style={{ fontSize: '0.75rem', color: '#6366F1', fontWeight: 700, textTransform: 'uppercase' }}>Section A Format</span>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>35 Compulsory MCQs (140 Marks)</div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 700, textTransform: 'uppercase' }}>Section B Format</span>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>15 Optional (Attempt 10 = 40 Marks)</div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#A855F7', fontWeight: 700, textTransform: 'uppercase' }}>Marking System</span>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>+4 Correct, -1 Incorrect</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                Subject
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => {
                  setSelectedSubject(e.target.value);
                  setSelectedChapter('');
                }}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: '#0B0F17',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: '#FFF',
                  fontSize: '0.95rem',
                }}
              >
                <option value="physics">Physics (45 Qs / 180 Marks)</option>
                <option value="chemistry">Chemistry (45 Qs / 180 Marks)</option>
                <option value="botany">Botany (45 Qs / 180 Marks)</option>
                <option value="zoology">Zoology (45 Qs / 180 Marks)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                NMC Chapter Target (Optional)
              </label>
              <select
                value={selectedChapter}
                onChange={(e) => setSelectedChapter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: '#0B0F17',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: '#FFF',
                  fontSize: '0.95rem',
                }}
              >
                <option value="">Full Subject Mock (All NCERT Units)</option>
                {currentSyllabus?.units.flatMap((u) =>
                  u.chapters.map((c) => (
                    <option key={c.id} value={c.name}>
                      [Class {c.classLevel}] {c.name} ({c.weightagePercent}% weightage)
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                Questions Count ({count})
              </label>
              <input
                type="range"
                min="1"
                max="30"
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
              background: 'linear-gradient(135deg, #10B981, #6366F1)',
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
              opacity: generating ? 0.7 : 1,
            }}
          >
            {generating ? <Loader className="spin" size={20} /> : <Brain size={20} />}
            {generating ? 'Executing NEET 2027 Generator Engine...' : 'Generate NEET 2027 Pattern Questions'}
          </button>

          {jobStatus && (
            <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#0B0F17', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>
                <span>Processing Stage: {jobStatus.currentStep || jobStatus.status}</span>
                <span>{jobStatus.progress}%</span>
              </div>
              <div style={{ height: '6px', background: '#1E293B', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${jobStatus.progress}%`, background: 'linear-gradient(90deg, #6366F1, #10B981)', transition: 'width 0.3s ease' }} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Syllabus Tab */}
      {activeTab === 'syllabus' && currentSyllabus && (
        <div>
          {/* Excluded Topics Alert */}
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              padding: '1.25rem',
              borderRadius: '10px',
              marginBottom: '2rem',
            }}
          >
            <h3 style={{ color: '#EF4444', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 0 }}>
              <AlertTriangle size={20} /> Excluded / Rationalized Topics in NMC NEET UG 2026 / 2027
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              The following topics have been removed from the official NCERT curriculum and will NOT be generated in exams:
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {currentSyllabus.deletedTopics.map((topic, i) => (
                <span
                  key={i}
                  style={{
                    background: '#0B0F17',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    color: '#F87171',
                    fontSize: '0.8rem',
                    padding: '0.25rem 0.6rem',
                    borderRadius: '4px',
                  }}
                >
                  🚫 {topic}
                </span>
              ))}
            </div>
          </div>

          {/* Units and Chapters List */}
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.25rem' }}>
            Official NCERT Curriculum Units — {currentSyllabus.subjectName}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {currentSyllabus.units.map((unit) => (
              <div key={unit.id} className="glass-card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#6366F1' }}>
                    Unit {unit.unitNumber}: {unit.name}
                  </h3>
                  <span style={{ fontSize: '0.8rem', background: 'rgba(99, 102, 241, 0.15)', color: '#A5B4FC', padding: '0.25rem 0.6rem', borderRadius: '12px', fontWeight: 600 }}>
                    Class {unit.classLevel} • ~{unit.weightagePercent}% Weightage
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                  {unit.chapters.map((ch) => (
                    <div
                      key={ch.id}
                      style={{
                        background: '#0B0F17',
                        padding: '1rem',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{ch.name}</span>
                        {ch.highYield && (
                          <span style={{ fontSize: '0.7rem', background: 'rgba(16, 185, 129, 0.2)', color: '#10B981', padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>
                            HIGH YIELD
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <strong>Concepts:</strong> {ch.keyConcepts.join(' • ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generated Questions List */}
      {generatedQuestions.length > 0 && activeTab === 'generator' && (
        <div style={{ marginTop: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle color="#10B981" /> Generated NEET 2027 Questions ({generatedQuestions.length})
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {generatedQuestions.map((q, idx) => (
              <div key={q.id || idx} className="glass-card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontWeight: 700, color: '#6366F1' }}>Question {idx + 1}</span>
                  <span style={{ fontSize: '0.8rem', background: 'rgba(99, 102, 241, 0.15)', color: '#A5B4FC', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                    Diff: {q.difficulty}/10 • {q.questionType || 'SINGLE_CORRECT'}
                  </span>
                </div>

                <p style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '1rem', lineHeight: 1.5 }}>{q.questionText}</p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                  {(q.options || []).map((opt: any, optIdx: number) => {
                    const optionLetter = opt.optionLabel || ['A', 'B', 'C', 'D'][optIdx];
                    const isCorrect = q.correctOption === optionLetter;
                    return (
                      <div
                        key={optIdx}
                        style={{
                          padding: '0.75rem',
                          borderRadius: '8px',
                          background: isCorrect ? 'var(--emerald-light)' : '#0B0F17',
                          border: isCorrect ? '1px solid var(--emerald)' : '1px solid var(--border-color)',
                          fontSize: '0.9rem',
                        }}
                      >
                        <strong>({optionLetter})</strong> {opt.optionText || opt}
                      </div>
                    );
                  })}
                </div>

                {q.explanation && (
                  <div style={{ background: '#0B0F17', padding: '0.875rem', borderRadius: '8px', borderLeft: '3px solid #10B981', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
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