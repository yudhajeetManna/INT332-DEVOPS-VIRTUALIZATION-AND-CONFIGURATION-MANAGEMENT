import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import NotifDrawer from '../components/NotifDrawer';
import api from '../api/axios';

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [registering, setRegistering] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const load = async () => {
      try {
        const [evRes, notifRes] = await Promise.all([api.get('/events'), api.get('/notifications')]);
        setEvents(evRes.data);
        setNotifications(notifRes.data);
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  const handleRegister = async (event_id) => {
    setRegistering(prev => ({ ...prev, [event_id]: true }));
    setMessage({ type: '', text: '' });
    try {
      await api.post('/events/register', { event_id });
      setMessage({ type: 'success', text: 'Registered for event successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Registration failed' });
    } finally {
      setRegistering(prev => ({ ...prev, [event_id]: false }));
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const upcoming = events.filter(e => new Date(e.event_date) >= new Date());
  const past = events.filter(e => new Date(e.event_date) < new Date());

  const EventCard = ({ event }) => {
    const isPast = new Date(event.event_date) < new Date();
    return (
      <div className="club-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
          <div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700 }}>{event.title}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              🏛️ {event.club?.club_name}
            </div>
          </div>
          <span className={`badge ${isPast ? 'badge-secondary' : 'badge-success'}`}>
            {isPast ? 'Past' : 'Upcoming'}
          </span>
        </div>
        {event.description && (
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>{event.description}</p>
        )}
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
          <div>📍 {event.venue || 'TBA'}</div>
          <div>🗓️ {new Date(event.event_date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>
        {!isPast && (
          <button
            className="btn btn-primary btn-sm"
            style={{ width: '100%' }}
            onClick={() => handleRegister(event.event_id)}
            disabled={registering[event.event_id]}
          >
            {registering[event.event_id] ? '⏳ Registering...' : '✅ Register'}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="app-layout">
      <Sidebar unreadCount={unreadCount} />
      <div className="main-content">
        <Topbar title="Events" onNotifClick={() => setNotifOpen(true)} unreadCount={unreadCount} />
        <div className="page-content">
          <div className="page-header">
            <div>
              <h2>College Events 📅</h2>
              <p>Register for upcoming events and track your participation</p>
            </div>
          </div>

          {message.text && (
            <div className={`alert alert-${message.type === 'success' ? 'success' : 'error'}`}>{message.text}</div>
          )}

          {loading ? <div className="loading-center"><div className="spinner" /></div> : (
            <>
              {upcoming.length > 0 && (
                <>
                  <h3 style={{ marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Upcoming Events</h3>
                  <div className="events-grid" style={{ marginBottom: '2rem' }}>
                    {upcoming.map(e => <EventCard key={e.event_id} event={e} />)}
                  </div>
                </>
              )}
              {past.length > 0 && (
                <>
                  <h3 style={{ marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Past Events</h3>
                  <div className="events-grid">
                    {past.map(e => <EventCard key={e.event_id} event={e} />)}
                  </div>
                </>
              )}
              {events.length === 0 && <div className="empty-state"><div className="empty-icon">📅</div><p>No events available yet</p></div>}
            </>
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
