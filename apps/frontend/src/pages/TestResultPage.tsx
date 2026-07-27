import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { testsApi } from '../services/api';
import { Award, Target, AlertTriangle, CheckCircle2, XCircle, MinusCircle, ArrowRight } from 'lucide-react';

export const TestResultPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [result, setResult] = useState<any>(null);
  const [report, setReport] = useState<any>(null);
  const [test, setTest] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      testsApi.getResult(id),
      testsApi.getReport(id).catch(() => null),
      testsApi.getTest(id)
    ]).then(([resData, reportData, testData]) => {
      setResult(resData);
      setReport(reportData);
      setTest(testData);
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>Calculating score & generating analytics report...</div>;
  }

  if (!result) {
    return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>Result not available yet.</div>;
  }

  const weakTopics = report?.weakTopics || [];

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800 }}>NEET Exam Performance Scorecard</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Official NTA NEET 2024 Evaluation (+4 Correct, -1 Wrong, 0 Skipped)
        </p>
      </div>

      {/* Main Scorecard Banner */}
      <div className="glass-card" style={{
        padding: '2.5rem',
        marginBottom: '2.5rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
        textAlign: 'center'
      }}>
        <div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Total Score</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#6366F1' }}>
            {result.score} <span style={{ fontSize: '1.25rem', color: 'var(--text-muted)' }}>/ {result.maxScore}</span>
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Accuracy</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: result.accuracy >= 75 ? 'var(--emerald)' : 'var(--amber)' }}>
            {result.accuracy}%
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Correct / Wrong</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#FFF' }}>
            <span style={{ color: 'var(--emerald)' }}>{result.correct}</span> / <span style={{ color: 'var(--rose)' }}>{result.wrong}</span>
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Negative Marks Lost</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--rose)' }}>
            -{result.negativeMarks}
          </div>
        </div>
      </div>

      {/* Weak Topics Diagnostic Alert */}
      {weakTopics.length > 0 && (
        <div style={{
          background: 'rgba(245, 158, 11, 0.15)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '2.5rem'
        }}>
          <h3 style={{ fontSize: '1.1rem', color: '#F59E0B', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <AlertTriangle size={20} /> Targeted Weak Topics Identified
          </h3>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {weakTopics.map((wt: any, idx: number) => (
              <span key={idx} style={{ background: '#0B0F17', padding: '0.4rem 0.875rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600, color: '#FFF' }}>
                {wt.name} ({wt.accuracy}% acc)
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Answer Key Review */}
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Detailed Answer Key Review</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {test?.testQuestions?.map((tq: any, idx: number) => {
          const q = tq.question;
          const ans = test.studentAnswers?.find((a: any) => a.questionId === q.id);
          const selectedOption = ans?.selectedOption;
          const isCorrect = selectedOption === q.correctOption;
          const isSkipped = !selectedOption;

          return (
            <div key={q.id || idx} className="glass-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontWeight: 700, color: '#6366F1' }}>Question {idx + 1}</span>
                {isCorrect ? (
                  <span style={{ color: 'var(--emerald)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <CheckCircle2 size={16} /> +4 Marks
                  </span>
                ) : isSkipped ? (
                  <span style={{ color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <MinusCircle size={16} /> 0 Marks (Skipped)
                  </span>
                ) : (
                  <span style={{ color: 'var(--rose)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <XCircle size={16} /> -1 Mark
                  </span>
                )}
              </div>

              <p style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>{q.questionText}</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.9rem' }}>
                {['A', 'B', 'C', 'D'].map((letter) => {
                  const isChoice = selectedOption === letter;
                  const isRightChoice = q.correctOption === letter;
                  let bg = '#0B0F17';
                  let border = '1px solid var(--border-color)';

                  if (isRightChoice) {
                    bg = 'var(--emerald-light)';
                    border = '1px solid var(--emerald)';
                  } else if (isChoice && !isRightChoice) {
                    bg = 'var(--rose-light)';
                    border = '1px solid var(--rose)';
                  }

                  return (
                    <div key={letter} style={{ padding: '0.6rem 0.875rem', borderRadius: '6px', background: bg, border }}>
                      <strong>({letter})</strong> {q[`option${letter}`]}
                    </div>
                  );
                })}
              </div>

              {q.explanation && (
                <div style={{ background: '#0B0F17', padding: '0.75rem 1rem', borderRadius: '6px', borderLeft: '3px solid #6366F1', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <strong style={{ color: '#FFF' }}>Explanation:</strong> {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
        <Link to="/dashboard" style={{
          background: 'linear-gradient(135deg, #6366F1, #4F46E5)',
          color: '#FFF',
          padding: '0.875rem 2rem',
          borderRadius: '10px',
          fontWeight: 700,
          textDecoration: 'none',
          display: 'inline-block'
        }}>
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};