import React, { useState, useEffect } from 'react';
import { Key, CheckCircle, X, Download, BookOpen } from 'lucide-react';
import { ownPaperApi } from '../services/api';

interface AnswerKeyItem {
  questionNumber: number;
  correctOption: string;
  correctOptionIndex: number;
  subject: string;
  questionText: string;
  options?: string[];
  explanation: string;
  ncertReference?: string;
}

interface AnswerKeyModalProps {
  testId: string;
  onClose: () => void;
}

export const AnswerKeyModal: React.FC<AnswerKeyModalProps> = ({ testId, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const fetchKey = async () => {
      try {
        setLoading(true);
        const res = await ownPaperApi.getAnswerKey(testId);
        setData(res?.data || res);
      } catch (err) {
        console.error('Failed to load answer key:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchKey();
  }, [testId]);

  const items: AnswerKeyItem[] = data?.answerKey || [];

  const filteredItems = items.filter((item) => {
    const matchesSub = selectedSubject === 'ALL' || item.subject.toUpperCase() === selectedSubject.toUpperCase();
    const matchesSearch =
      !searchQuery ||
      item.questionNumber.toString().includes(searchQuery) ||
      item.questionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.explanation.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSub && matchesSearch;
  });

  const subjects = ['ALL', ...Array.from(new Set(items.map((i) => i.subject)))];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(5, 7, 13, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
    >
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: '900px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          background: '#0D131F',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          borderRadius: '16px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(90deg, #131B2A, #0D131F)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(16, 185, 129, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10B981',
                border: '1px solid rgba(16, 185, 129, 0.3)',
              }}
            >
              <Key size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFF', margin: 0 }}>
                Official Answer Key & NCERT Solutions
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                {data?.title || 'NEET 2027 Practice Test'} — {items.length} Questions Verified
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={handlePrint}
              style={{
                padding: '0.5rem 0.875rem',
                background: '#1E293B',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#CBD5E1',
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <Download size={15} /> Export Key
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '0.4rem',
                borderRadius: '6px',
              }}
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Toolbar & Filters */}
        <div
          style={{
            padding: '1rem 1.5rem',
            background: '#0B0F17',
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Subject Pills */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {subjects.map((sub) => (
              <button
                key={sub}
                onClick={() => setSelectedSubject(sub)}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  background:
                    selectedSubject === sub
                      ? 'linear-gradient(135deg, #6366F1, #4F46E5)'
                      : 'rgba(255, 255, 255, 0.05)',
                  color: selectedSubject === sub ? '#FFF' : '#94A3B8',
                  transition: 'all 0.2s ease',
                }}
              >
                {sub}
              </button>
            ))}
          </div>

          {/* Quick Search */}
          <input
            type="text"
            placeholder="Search Q# or text..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: '0.4rem 0.75rem',
              background: '#161F30',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              color: '#FFF',
              fontSize: '0.85rem',
              width: '180px',
            }}
          />
        </div>

        {/* Content Body */}
        <div
          style={{
            padding: '1.5rem',
            overflowY: 'auto',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              Loading official answer key & NCERT explanations...
            </div>
          ) : filteredItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              No questions found matching selected filter.
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.questionNumber}
                style={{
                  background: '#131B2A',
                  border: '1px solid rgba(255, 255, 255, 0.07)',
                  borderRadius: '10px',
                  padding: '1.1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.6rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span
                      style={{
                        background: '#1E293B',
                        color: '#6366F1',
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '6px',
                        border: '1px solid rgba(99, 102, 241, 0.25)',
                      }}
                    >
                      Q{item.questionNumber}
                    </span>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        color: '#94A3B8',
                        background: 'rgba(255,255,255,0.04)',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px',
                      }}
                    >
                      {item.subject}
                    </span>
                  </div>

                  {/* Correct Answer Badge */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      background: 'rgba(16, 185, 129, 0.15)',
                      border: '1px solid rgba(16, 185, 129, 0.4)',
                      color: '#10B981',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '20px',
                      fontWeight: 800,
                      fontSize: '0.9rem',
                    }}
                  >
                    <CheckCircle size={16} /> Correct: Option ({item.correctOption})
                  </div>
                </div>

                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#F1F5F9' }}>
                  {item.questionText}
                </div>

                {/* Step-by-Step Explanation */}
                {item.explanation && (
                  <div
                    style={{
                      background: '#0B0F17',
                      borderLeft: '3px solid #10B981',
                      padding: '0.75rem 1rem',
                      borderRadius: '0 6px 6px 0',
                      fontSize: '0.85rem',
                      color: '#CBD5E1',
                      lineHeight: '1.5',
                    }}
                  >
                    <div style={{ fontWeight: 700, color: '#10B981', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <BookOpen size={14} /> NCERT Step-by-Step Explanation:
                    </div>
                    {item.explanation}
                    {item.ncertReference && (
                      <div style={{ marginTop: '0.4rem', fontSize: '0.75rem', color: '#64748B' }}>
                        Ref: {item.ncertReference}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
