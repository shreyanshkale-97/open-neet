import React, { useEffect, useState } from 'react';
import { adminApi } from '../services/api';
import { Shield, Users, Database, FileCheck, DollarSign, ToggleLeft, ToggleRight, AlertOctagon } from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [featureFlags, setFeatureFlags] = useState<Record<string, boolean>>({});
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [analyticsRes, usersRes, flagsRes, auditRes] = await Promise.all([
        adminApi.getAnalytics(),
        adminApi.getUsers(),
        adminApi.getFeatureFlags(),
        adminApi.getAuditLogs(),
      ]);
      setAnalytics(analyticsRes);
      setUsers(usersRes.users || []);
      setFeatureFlags(flagsRes || {});
      setAuditLogs(auditRes.logs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleFlag = async (flagKey: string, currentVal: boolean) => {
    try {
      await adminApi.updateFeatureFlag(flagKey, !currentVal);
      setFeatureFlags((prev) => ({ ...prev, [flagKey]: !currentVal }));
    } catch (err: any) {
      alert(err.message || 'Failed to update feature flag');
    }
  };

  const handleToggleSuspend = async (userId: string, currentSuspended: boolean) => {
    try {
      await adminApi.suspendUser(userId, !currentSuspended);
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, isSuspended: !currentSuspended } : u));
    } catch (err: any) {
      alert(err.message || 'Failed to suspend/unsuspend user');
    }
  };

  if (loading) {
    return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading Admin Governance Panel...</div>;
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <Shield size={32} color="#EF4444" />
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Admin Governance Dashboard</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            System Analytics, RBAC Control, Feature Flags & Audit Logs
          </p>
        </div>
      </div>

      {/* Analytics Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Total Users</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFF' }}>{analytics?.totalUsers || 0}</div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Approved Questions</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--emerald)' }}>{analytics?.approvedQuestions || 0}</div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Total Tests Taken</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#6366F1' }}>{analytics?.totalTests || 0}</div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Total AI Cost</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--amber)' }}>${analytics?.totalAiCostUsd || '0.00'}</div>
        </div>
      </div>

      {/* Feature Flags Section */}
      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Feature Flags Control</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          {Object.entries(featureFlags).map(([flag, enabled]) => (
            <div key={flag} style={{
              background: '#0B0F17',
              padding: '0.875rem',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{flag}</span>
              <button
                onClick={() => handleToggleFlag(flag, enabled)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: enabled ? 'var(--emerald)' : '#64748B' }}
              >
                {enabled ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* User Management Table */}
      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>User Profiles & Governance</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '0.75rem' }}>Name</th>
              <th style={{ padding: '0.75rem' }}>Email</th>
              <th style={{ padding: '0.75rem' }}>Role</th>
              <th style={{ padding: '0.75rem' }}>Status</th>
              <th style={{ padding: '0.75rem' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <td style={{ padding: '0.75rem', fontWeight: 600 }}>{u.fullName}</td>
                <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</td>
                <td style={{ padding: '0.75rem' }}>
                  <span style={{ background: '#1E293B', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                    {u.role}
                  </span>
                </td>
                <td style={{ padding: '0.75rem' }}>
                  <span style={{ color: u.isSuspended ? 'var(--rose)' : 'var(--emerald)', fontWeight: 700 }}>
                    {u.isSuspended ? 'SUSPENDED' : 'ACTIVE'}
                  </span>
                </td>
                <td style={{ padding: '0.75rem' }}>
                  <button
                    onClick={() => handleToggleSuspend(u.id, u.isSuspended)}
                    style={{
                      background: u.isSuspended ? 'var(--emerald-light)' : 'var(--rose-light)',
                      border: 'none',
                      color: u.isSuspended ? 'var(--emerald)' : 'var(--rose)',
                      padding: '0.35rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {u.isSuspended ? 'Unsuspend' : 'Suspend'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Audit Logs */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>System Audit Logs</h2>
        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {auditLogs.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No audit log entries recorded yet.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.5rem' }}>Action</th>
                  <th style={{ padding: '0.5rem' }}>Admin</th>
                  <th style={{ padding: '0.5rem' }}>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '0.5rem', fontWeight: 600, color: '#6366F1' }}>{log.action}</td>
                    <td style={{ padding: '0.5rem' }}>{log.admin?.fullName || 'System'}</td>
                    <td style={{ padding: '0.5rem', color: 'var(--text-muted)' }}>{new Date(log.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};