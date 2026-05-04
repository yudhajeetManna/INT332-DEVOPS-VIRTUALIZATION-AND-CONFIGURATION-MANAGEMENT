import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import NotifDrawer from '../components/NotifDrawer';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

function useNotifications() {
  const [notifications, setNotifications] = useState([]);

  const fetchNotifs = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch {}
  };

  useEffect(() => { fetchNotifs(); }, []);

  const markRead = (id) => setNotifications(prev => prev.map(n => n.notif_id === id ? { ...n, is_read: true } : n));
  const unreadCount = notifications.filter(n => !n.is_read).length;

  return { notifications, markRead, unreadCount };
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const { notifications, markRead, unreadCount } = useNotifications();
  const [notifOpen, setNotifOpen] = useState(false);
  const [history, setHistory] = useState({ memberships: [], attendance: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/history');
        setHistory(res.data);
      } catch {}
      setLoading(false);
    };
    fetchHistory();
  }, []);

  const stats = [
    { icon: '🏛️', label: 'Clubs Joined', value: history.memberships.filter(m => m.status === 'approved').length, color: '#6c63ff', bg: 'rgba(108,99,255,0.1)' },
    { icon: '📅', label: 'Events Attended', value: history.attendance.filter(a => a.status === 'present').length, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    { icon: '⏳', label: 'Pending Requests', value: history.memberships.filter(m => m.status === 'pending').length, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    { icon: '🔔', label: 'Notifications', value: unreadCount, color: '#06b6d4', bg: 'rgba(6,182,212,0.1)' },
  ];

  return (
    <div className="app-layout">
      <Sidebar notifOpen={notifOpen} setNotifOpen={setNotifOpen} unreadCount={unreadCount} />
      <div className="main-content">
        <Topbar title="Student Dashboard" onNotifClick={() => setNotifOpen(true)} unreadCount={unreadCount} />
        <div className="page-content">
          <div className="page-header">
            <div>
              <h2>Welcome back, {user?.name?.split(' ')[0]}! 👋</h2>
              <p>Here's your activity summary</p>
            </div>
          </div>

          <div className="stats-grid">
            {stats.map(s => (
              <div key={s.label} className="stat-card">
                <div className="stat-icon" style={{ background: s.bg }}>
                  <span style={{ fontSize: '1.3rem' }}>{s.icon}</span>
                </div>
                <div>
                  <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {/* My Clubs */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">🏛️ My Clubs</span>
              </div>
              {loading ? <div className="spinner" /> : (
                history.memberships.length === 0 ? (
                  <div className="empty-state"><div className="empty-icon">🏛️</div><p>No clubs joined yet. <a href="/clubs">Browse clubs →</a></p></div>
                ) : (
                  <div>
                    {history.memberships.map(m => (
                      <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid var(--border-glass)' }}>
                        <span style={{ fontSize: '0.875rem' }}>🏛️ {m.club?.club_name}</span>
                        <span className={`badge badge-${m.status === 'approved' ? 'success' : m.status === 'pending' ? 'warning' : 'danger'}`}>{m.status}</span>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>

            {/* Event History */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">📅 Event History</span>
              </div>
              {loading ? <div className="spinner" /> : (
                history.attendance.length === 0 ? (
                  <div className="empty-state"><div className="empty-icon">📅</div><p>No events attended yet. <a href="/events">Browse events →</a></p></div>
                ) : (
                  <div>
                    {history.attendance.map(a => (
                      <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid var(--border-glass)' }}>
                        <div>
                          <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{a.event?.title}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{a.event?.club?.club_name}</div>
                        </div>
                        <span className={`badge badge-${a.status === 'present' ? 'success' : 'danger'}`}>{a.status}</span>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
      <NotifDrawer open={notifOpen} onClose={() => setNotifOpen(false)} notifications={notifications} onMarkRead={markRead} />
    </div>
  );
}
