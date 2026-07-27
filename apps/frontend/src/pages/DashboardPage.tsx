import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { userApi, testsApi } from '../services/api';
import { Flame, Award, Clock, Target, Plus, Brain, BookOpen, ArrowRight, Play } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [creatingTest, setCreatingTest] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    userApi.getDashboard()
      .then((data) => setDashboard(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleQuickTest = async (testType: string) => {
    setCreatingTest(true);
    try {
      const newTest = await testsApi.createTest({
        testType,
        totalQuestions: 15,
        durationMinutes: 30,
      });
      navigate(`/test/${newTest.id}`);
    } catch (err: any) {
      alert(err.message || 'Failed to create test session');
    } finally {
      setCreatingTest(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading student dashboard...
      </div>
    );
  }

  const stats = dashboard?.stats || {};
  const history = dashboard?.recentHistory || [];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Student Dashboard</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Target: NEET {dashboard?.profile?.targetYear || 2025}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={() => handleQuickTest('CUSTOM')}
            disabled={creatingTest}
            style={{
              background: 'linear-gradient(135deg, #6366F1, #4F46E5)',
              color: '#FFF',
              border: 'none',
              padding: '0.75rem 1.25rem',
              borderRadius: '10px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer'
            }}
          >
            <Play size={18} /> Quick Practice Test
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2.5rem'
      }}>
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--amber-light)', display: 'flex', alignItems: 'center', justifyCenter: 'center', color: 'var(--amber)' }}>
            <Flame size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{stats.currentStreak || 0} Days</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Study Streak</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyCenter: 'center', color: 'var(--primary)' }}>
            <Award size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{stats.totalTestsTaken || 0}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Tests Attempted</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--emerald-light)', display: 'flex', alignItems: 'center', justifyCenter: 'center', color: 'var(--emerald)' }}>
            <Target size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{stats.averageAccuracy || 0}%</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Avg Accuracy</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--purple-light)', display: 'flex', alignItems: 'center', justifyCenter: 'center', color: 'var(--purple)' }}>
            <Clock size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{stats.totalStudyHours || 0} hrs</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Study Hours</div>
          </div>
        </div>
      </div>

      {/* Action Cards */}
      <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Prep Modes</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <Link to="/ai-generator" className="glass-card" style={{ padding: '1.5rem', display: 'block' }}>
          <Brain size={32} color="#A855F7" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>AI Question Generator</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Generate 12-step NCERT questions tailored to your exact subject, unit, or difficulty level.
          </p>
        </Link>

        <Link to="/own-paper" className="glass-card" style={{ padding: '1.5rem', display: 'block' }}>
          <BookOpen size={32} color="#10B981" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Own Paper Mode</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Upload PDF question papers or answer keys for instant OCR auto-matching and score evaluation.
          </p>
        </Link>
      </div>

      {/* Recent History Table */}
      <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Recent Test History</h2>
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        {history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            No tests attempted yet. Click "Quick Practice Test" above to start your first session!
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <th style={{ padding: '0.75rem' }}>Test Type</th>
                <th style={{ padding: '0.75rem' }}>Questions</th>
                <th style={{ padding: '0.75rem' }}>Status</th>
                <th style={{ padding: '0.75rem' }}>Score</th>
                <th style={{ padding: '0.75rem' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {history.map((t: any) => (
                <tr key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '0.75rem', fontWeight: 600 }}>{t.testType}</td>
                  <td style={{ padding: '0.75rem' }}>{t.totalQuestions} Qs</td>
                  <td style={{ padding: '0.75rem' }}>
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      background: t.status === 'EVALUATED' ? 'var(--emerald-light)' : 'var(--amber-light)',
                      color: t.status === 'EVALUATED' ? 'var(--emerald)' : 'var(--amber)'
                    }}>
                      {t.status}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem', fontWeight: 700 }}>
                    {t.result ? `${t.result.score} / ${t.result.maxScore}` : '-'}
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    {t.result ? (
                      <Link to={`/test/${t.id}/result`} style={{ color: '#6366F1', fontWeight: 600, fontSize: '0.85rem' }}>
                        View Result
                      </Link>
                    ) : (
                      <Link to={`/test/${t.id}`} style={{ color: '#10B981', fontWeight: 600, fontSize: '0.85rem' }}>
                        Resume Test
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};