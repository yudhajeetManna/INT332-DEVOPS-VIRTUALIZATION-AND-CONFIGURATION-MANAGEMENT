import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import NotifDrawer from '../components/NotifDrawer';
import api from '../api/axios';

const categoryIcons = { Technology: '💻', Arts: '🎨', Sports: '⚽', Music: '🎵', Science: '🔬', Other: '🏛️' };
const categoryColors = { Technology: '#6c63ff', Arts: '#f59e0b', Sports: '#10b981', Music: '#06b6d4', Science: '#8b5cf6', Other: '#64748b' };

export default function ClubsPage() {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [joining, setJoining] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [clubsRes, notifRes] = await Promise.all([api.get('/clubs'), api.get('/notifications')]);
        setClubs(clubsRes.data);
        setNotifications(notifRes.data);
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  const handleJoin = async (club_id) => {
    setJoining(prev => ({ ...prev, [club_id]: true }));
    setMessage({ type: '', text: '' });
    try {
      await api.post('/clubs/join', { club_id });
      setMessage({ type: 'success', text: 'Join request submitted! Awaiting approval.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to join club' });
    } finally {
      setJoining(prev => ({ ...prev, [club_id]: false }));
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const filtered = clubs.filter(c => c.club_name.toLowerCase().includes(search.toLowerCase()) || c.category.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="app-layout">
      <Sidebar unreadCount={unreadCount} />
      <div className="main-content">
        <Topbar title="Browse Clubs" onNotifClick={() => setNotifOpen(true)} unreadCount={unreadCount} />
        <div className="page-content">
          <div className="page-header">
            <div>
              <h2>College Clubs 🏛️</h2>
              <p>Discover and join clubs that match your interests</p>
            </div>
          </div>

          {message.text && (
            <div className={`alert alert-${message.type === 'success' ? 'success' : 'error'}`}>
              {message.text}
            </div>
          )}

          <div style={{ marginBottom: '1.5rem' }}>
            <input
              type="text"
              placeholder="🔍 Search clubs by name or category..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ padding: '0.75rem 1rem', background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', width: '100%', maxWidth: '400px', fontFamily: 'inherit', fontSize: '0.9rem', outline: 'none' }}
            />
          </div>

          {loading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">🔍</div><p>No clubs found</p></div>
          ) : (
            <div className="clubs-grid">
              {filtered.map(club => {
                const icon = categoryIcons[club.category] || '🏛️';
                const color = categoryColors[club.category] || '#64748b';
                return (
                  <div key={club.club_id} className="club-card">
                    <div className="club-icon" style={{ background: `${color}20` }}>
                      {icon}
                    </div>
                    <div className="club-name">{club.club_name}</div>
                    <div className="club-category">{club.category}</div>
                    <div className="club-desc">{club.description || 'No description provided.'}</div>
                    {club.leader && (
                      <div className="club-leader">👤 Led by {club.leader.name}</div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className={`badge badge-${club.status === 'active' ? 'success' : 'danger'}`}>{club.status}</span>
                      <button
                        className="btn btn-primary btn-sm"
                        style={{ width: 'auto' }}
                        onClick={() => handleJoin(club.club_id)}
                        disabled={joining[club.club_id] || club.status !== 'active'}
                      >
                        {joining[club.club_id] ? '⏳' : '+ Join'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <NotifDrawer
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        notifications={notifications}
        onMarkRead={(id) => setNotifications(prev => prev.map(n => n.notif_id === id ? { ...n, is_read: true } : n))}
      />
    </div>
  );
}
