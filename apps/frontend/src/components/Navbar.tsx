import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Flame, Brain, BookOpen, Shield, LogOut, User } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{
      background: 'rgba(11, 15, 23, 0.85)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      padding: '0.875rem 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #6366F1, #A855F7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)'
        }}>
          <Brain size={22} color="#FFF" />
        </div>
        <div>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFF', fontFamily: 'Outfit, sans-serif' }}>
            AIM <span style={{ color: '#6366F1' }}>NEET</span>
          </span>
          <span style={{ fontSize: '0.65rem', display: 'block', color: '#10B981', fontWeight: 600, letterSpacing: '0.5px' }}>
            AI-POWERED PLATFORM
          </span>
        </div>
      </Link>

      {user ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Link to="/dashboard" style={{ color: '#F8FAFC', fontSize: '0.9rem', fontWeight: 500 }}>Dashboard</Link>
          <Link to="/ai-generator" style={{ color: '#F8FAFC', fontSize: '0.9rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Brain size={16} color="#A855F7" /> AI Generator
          </Link>
          <Link to="/own-paper" style={{ color: '#F8FAFC', fontSize: '0.9rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <BookOpen size={16} color="#10B981" /> Own Paper
          </Link>

          {user.role === 'ADMIN' && (
            <Link to="/admin" style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#EF4444',
              padding: '0.35rem 0.75rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}>
              <Shield size={14} /> Admin
            </Link>
          )}

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            color: '#F59E0B',
            padding: '0.35rem 0.75rem',
            borderRadius: '20px',
            fontSize: '0.85rem',
            fontWeight: 700
          }}>
            <Flame size={16} /> {user.studyStats?.currentStreak || 0} Days
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '1rem' }}>
            <div style={{ fontSize: '0.85rem', color: '#94A3B8', textAlign: 'right' }}>
              <div style={{ color: '#FFF', fontWeight: 600 }}>{user.fullName}</div>
              <div style={{ fontSize: '0.75rem' }}>{user.role}</div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748B',
                padding: '0.4rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/login" style={{ color: '#F8FAFC', fontSize: '0.9rem', fontWeight: 500 }}>Login</Link>
          <Link to="/register" style={{
            background: 'linear-gradient(135deg, #6366F1, #4F46E5)',
            color: '#FFF',
            padding: '0.5rem 1.25rem',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: 600,
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)',
          }}>
            Get Started
          </Link>
        </div>
      )}
    </nav>
  );
};