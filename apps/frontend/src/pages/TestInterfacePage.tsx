import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { testsApi } from '../services/api';
import { Clock, CheckCircle, Bookmark, Trash2, ArrowRight, ArrowLeft, Send } from 'lucide-react';

export const TestInterfacePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [test, setTest] = useState<any>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { option?: string; markedForReview?: boolean; visited?: boolean }>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(10800); // 3 hrs default
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  useEffect(() => {
    if (!id) return;
    testsApi.getTest(id).then((data) => {
      setTest(data);
      if (data.status === 'CREATED') {
        testsApi.startTest(id);
      }

      // Initialize answers map
      const initialMap: Record<string, any> = {};
      if (data.studentAnswers) {
        data.studentAnswers.forEach((ans: any) => {
          initialMap[ans.questionId] = {
            option: ans.selectedOption,
            markedForReview: ans.markedForReview,
            visited: ans.visited,
          };
        });
      }
      setAnswers(initialMap);

      // Timer calculation
      if (data.endTime) {
        const remaining = Math.max(0, Math.floor((new Date(data.endTime).getTime() - new Date().getTime()) / 1000));
        setTimeLeftSeconds(remaining);
      }
    });
  }, [id]);

  // Timer Countdown Effect
  useEffect(() => {
    if (timeLeftSeconds <= 0) return;
    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeftSeconds]);

  if (!test) {
    return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading exam session...</div>;
  }

  const questions = test.testQuestions || [];
  const currentTQ = questions[currentIdx];
  const currentQ = currentTQ?.question;
  const currentAns = currentQ ? answers[currentQ.id] || {} : {};

  const handleSelectOption = (option: string) => {
    if (!currentQ || !id) return;
    const newAns = { ...currentAns, option, visited: true };
    setAnswers((prev) => ({ ...prev, [currentQ.id]: newAns }));
    testsApi.saveAnswer(id, {
      questionId: currentQ.id,
      selectedOption: option as any,
      markedForReview: newAns.markedForReview || false,
      visited: true,
    });
  };

  const handleClearResponse = () => {
    if (!currentQ || !id) return;
    const newAns = { ...currentAns, option: undefined, visited: true };
    setAnswers((prev) => ({ ...prev, [currentQ.id]: newAns }));
    testsApi.saveAnswer(id, {
      questionId: currentQ.id,
      selectedOption: null as any,
      markedForReview: newAns.markedForReview || false,
      visited: true,
    });
  };

  const handleToggleMarkReview = () => {
    if (!currentQ || !id) return;
    const isMarked = !currentAns.markedForReview;
    const newAns = { ...currentAns, markedForReview: isMarked, visited: true };
    setAnswers((prev) => ({ ...prev, [currentQ.id]: newAns }));
    testsApi.saveAnswer(id, {
      questionId: currentQ.id,
      selectedOption: (newAns.option as any) || null,
      markedForReview: isMarked,
      visited: true,
    });
  };

  const handleSaveAndNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    }
  };

  const handleSubmitTest = async () => {
    if (!id || submitting) return;
    setSubmitting(true);
    try {
      await testsApi.submitTest(id);
      navigate(`/test/${id}/result`);
    } catch (err: any) {
      alert(err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Status counts
  let answeredCount = 0;
  let markedCount = 0;
  let unansweredCount = 0;
  questions.forEach((tq: any) => {
    const a = answers[tq.questionId];
    if (a?.markedForReview) markedCount++;
    else if (a?.option) answeredCount++;
    else if (a?.visited) unansweredCount++;
  });

  return (
    <div style={{ height: 'calc(100vh - 70px)', display: 'flex', flexDirection: 'column', background: '#0B0F17' }}>
      {/* Top Exam Header */}
      <header style={{
        background: '#131B2A',
        padding: '0.875rem 2rem',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#FFF' }}>NTA NEET Mock Simulation</span>
          <span style={{ marginLeft: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Question {currentIdx + 1} of {questions.length}
          </span>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#EF4444',
          padding: '0.4rem 1rem',
          borderRadius: '20px',
          fontWeight: 700,
          fontSize: '1rem'
        }}>
          <Clock size={18} /> {formatTime(timeLeftSeconds)}
        </div>

        <button
          onClick={() => setShowSubmitModal(true)}
          style={{
            background: 'linear-gradient(135deg, #10B981, #059669)',
            color: '#FFF',
            border: 'none',
            padding: '0.5rem 1.25rem',
            borderRadius: '8px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          Submit Test
        </button>
      </header>

      {/* Main Grid Area */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left Column: Active Question */}
        <div style={{ flex: 1, padding: '2rem', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          {currentQ && (
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '1.15rem', fontWeight: 600, lineHeight: 1.6, marginBottom: '2rem' }}>
                <span style={{ color: '#6366F1', fontWeight: 800, marginRight: '0.5rem' }}>Q{currentIdx + 1}.</span>
                {currentQ.questionText}
              </div>

              {/* Options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
                {['A', 'B', 'C', 'D'].map((optLetter) => {
                  const optText = currentQ[`option${optLetter}`];
                  const isSelected = currentAns.option === optLetter;
                  return (
                    <div
                      key={optLetter}
                      onClick={() => handleSelectOption(optLetter)}
                      style={{
                        padding: '1rem 1.25rem',
                        borderRadius: '10px',
                        background: isSelected ? 'rgba(99, 102, 241, 0.15)' : '#131B2A',
                        border: isSelected ? '2px solid #6366F1' : '1px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: isSelected ? '#6366F1' : '#1E293B',
                        color: isSelected ? '#FFF' : 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.85rem'
                      }}>
                        {optLetter}
                      </div>
                      <span style={{ fontSize: '1rem', color: '#FFF' }}>{optText}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid var(--border-color)',
            paddingTop: '1.25rem'
          }}>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={handleToggleMarkReview}
                style={{
                  background: currentAns.markedForReview ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
                  border: '1px solid #8B5CF6',
                  color: '#8B5CF6',
                  padding: '0.6rem 1rem',
                  borderRadius: '8px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  cursor: 'pointer'
                }}
              >
                <Bookmark size={16} /> {currentAns.markedForReview ? 'Marked for Review' : 'Mark for Review'}
              </button>

              <button
                onClick={handleClearResponse}
                style={{
                  background: 'transparent',
                  border: '1px solid #64748B',
                  color: '#94A3B8',
                  padding: '0.6rem 1rem',
                  borderRadius: '8px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  cursor: 'pointer'
                }}
              >
                <Trash2 size={16} /> Clear Response
              </button>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx((prev) => prev - 1)}
                style={{
                  background: '#1E293B',
                  color: '#FFF',
                  border: 'none',
                  padding: '0.6rem 1.25rem',
                  borderRadius: '8px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  opacity: currentIdx === 0 ? 0.5 : 1
                }}
              >
                <ArrowLeft size={16} /> Previous
              </button>

              <button
                onClick={handleSaveAndNext}
                style={{
                  background: 'linear-gradient(135deg, #6366F1, #4F46E5)',
                  color: '#FFF',
                  border: 'none',
                  padding: '0.6rem 1.5rem',
                  borderRadius: '8px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer'
                }}
              >
                Save & Next <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Question Palette */}
        <div style={{
          width: '320px',
          background: '#131B2A',
          borderLeft: '1px solid var(--border-color)',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Question Palette</h3>

          {/* Palette Legend */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--emerald)' }}></span> Answered ({answeredCount})
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--rose)' }}></span> Unanswered ({unansweredCount})
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--purple)' }}></span> Review ({markedCount})
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#334155' }}></span> Not Visited
            </div>
          </div>

          {/* Question Palette Buttons */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem', alignContent: 'start' }}>
            {questions.map((tq: any, idx: number) => {
              const a = answers[tq.questionId];
              let statusClass = 'q-status-not-visited';
              if (a?.markedForReview) statusClass = 'q-status-review';
              else if (a?.option) statusClass = 'q-status-answered';
              else if (a?.visited) statusClass = 'q-status-unanswered';

              const isCurrent = idx === currentIdx;

              return (
                <button
                  key={tq.id || idx}
                  onClick={() => setCurrentIdx(idx)}
                  className={statusClass}
                  style={{
                    height: '40px',
                    borderRadius: '6px',
                    border: isCurrent ? '2px solid #FFF' : 'none',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 200
        }}>
          <div className="glass-card" style={{ width: '90%', maxWidth: '440px', padding: '2rem', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Submit Exam?</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Are you sure you want to finish and submit your test?
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-around', background: '#0B0F17', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--emerald)' }}>{answeredCount}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Answered</div>
              </div>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--rose)' }}>{unansweredCount}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Unanswered</div>
              </div>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--purple)' }}>{markedCount}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Marked</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => setShowSubmitModal(false)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: '#1E293B',
                  color: '#FFF',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Back to Exam
              </button>
              <button
                onClick={handleSubmitTest}
                disabled={submitting}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: 'linear-gradient(135deg, #10B981, #059669)',
                  color: '#FFF',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {submitting ? 'Submitting...' : 'Confirm Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};