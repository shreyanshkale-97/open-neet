import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, Target, Sparkles, BookOpen, BarChart3, ShieldCheck, ArrowRight } from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-dark)' }}>
      {/* Hero Section */}
      <section style={{
        padding: '6rem 2rem 4rem 2rem',
        maxWidth: '1200px',
        margin: '0 auto',
        textAlign: 'center',
        position: 'relative'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'var(--primary-light)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          color: '#6366F1',
          padding: '0.5rem 1rem',
          borderRadius: '30px',
          fontSize: '0.85rem',
          fontWeight: 600,
          marginBottom: '1.5rem'
        }}>
          <Sparkles size={16} /> Powered by Gemini 1.5 Flash & NCERT RAG Pipeline
        </div>

        <h1 style={{
          fontSize: '3.5rem',
          fontWeight: 800,
          lineHeight: 1.15,
          marginBottom: '1.5rem',
        }}>
          Master NEET-UG with <br />
          <span className="gradient-text">12-Step AI Precision Question Generation</span>
        </h1>

        <p style={{
          fontSize: '1.2rem',
          color: 'var(--text-muted)',
          maxWidth: '750px',
          margin: '0 auto 2.5rem auto',
          lineHeight: 1.6
        }}>
          The ultimate NEET preparation suite. Experience real NTA exam simulations, upload your own papers for instant AI auto-matching, and pinpoint weak topics with NCERT RAG insights.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/register" style={{
            background: 'linear-gradient(135deg, #6366F1, #4F46E5)',
            color: '#FFF',
            padding: '0.875rem 2rem',
            borderRadius: '12px',
            fontSize: '1.05rem',
            fontWeight: 700,
            boxShadow: '0 8px 25px rgba(99, 102, 241, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            Start Free Practice Test <ArrowRight size={18} />
          </Link>
          <Link to="/login" className="glass-card" style={{
            color: '#FFF',
            padding: '0.875rem 2rem',
            borderRadius: '12px',
            fontSize: '1.05rem',
            fontWeight: 600,
          }}>
            Student Login
          </Link>
        </div>
      </section>

      {/* Core Features Grid */}
      <section style={{ maxWidth: '1200px', margin: '3rem auto 6rem auto', padding: '0 2rem' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '3rem' }}>
          Engineered Specially for <span className="gradient-text">720/720 Target</span>
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2rem'
        }}>
          <div className="glass-card" style={{ padding: '2rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(99, 102, 241, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6366F1',
              marginBottom: '1.25rem'
            }}>
              <Brain size={26} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>12-Step RAG AI Pipeline</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Extracts context from NCERT textbooks using pgvector embeddings. Generates authentic NEET 4-option MCQs with step-by-step NCERT explanations.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '2rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#10B981',
              marginBottom: '1.25rem'
            }}>
              <BookOpen size={26} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Own Paper Mode</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Upload any Coaching/State paper PDF. Tesseract OCR extracts questions & official answer keys, auto-matches answers, scores (+4, -1), and builds analytics.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '2rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(245, 158, 11, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#F59E0B',
              marginBottom: '1.25rem'
            }}>
              <Target size={26} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Authentic NTA Engine</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
              3-Hour countdown timer, 180-question palette with Green/Red/Purple status colors, Mark for Review, and server-side anti-cheat submission timers.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '2rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(139, 92, 246, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#8B5CF6',
              marginBottom: '1.25rem'
            }}>
              <BarChart3 size={26} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Weak Topic Diagnostics</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Instant subject breakdown (Physics, Chemistry, Botany, Zoology) with top 3 weak topics identified for targeted revision.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '2rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(239, 68, 68, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#EF4444',
              marginBottom: '1.25rem'
            }}>
              <ShieldCheck size={26} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Strict Governance</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Prisma RLS security policies, audit logging for admin actions, feature flag controls, and isolated worker queues for smooth scalability.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};