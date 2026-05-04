import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import NotifDrawer from '../components/NotifDrawer';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function LeaderDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState('events');
  const [events, setEvents] = useState([]);
  const [members, setMembers] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [clubs, setClubs] = useState([]);

  // Create Event Form
  const [eventForm, setEventForm] = useState({ title: '', venue: '', event_date: '', club_id: '', description: '' });
  const [eventMsg, setEventMsg] = useState({ type: '', text: '' });
  const [eventLoading, setEventLoading] = useState(false);

  // Notice form
  const [noticeForm, setNoticeForm] = useState({ club_id: '', message: '' });
  const [noticeMsg, setNoticeMsg] = useState({ type: '', text: '' });

  // Attendance
  const [selectedEvent, setSelectedEvent] = useState('');
  const [attendanceData, setAttendanceData] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [evRes, memRes, notifRes, clubsRes] = await Promise.all([
          api.get('/club/events'),
          api.get('/members'),
          api.get('/notifications'),
          api.get('/clubs'),
        ]);
        setEvents(evRes.data);
        setMembers(memRes.data);
        setNotifications(notifRes.data);
        setClubs(clubsRes.data);
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setEventLoading(true);
    setEventMsg({ type: '', text: '' });
    try {
      const res = await api.post('/events/create', eventForm);
      setEventMsg({ type: 'success', text: 'Event created successfully!' });
      setEvents(prev => [res.data.event, ...prev]);
      setEventForm({ title: '', venue: '', event_date: '', club_id: '', description: '' });
    } catch (err) {
      setEventMsg({ type: 'error', text: err.response?.data?.error || 'Failed to create event' });
    } finally { setEventLoading(false); }
  };

  const handleApprove = async (membership_id, action) => {
    try {
      await api.post('/members/approve', { membership_id, action });
      setMembers(prev => prev.filter(m => m.id !== membership_id));
    } catch {}
  };

  const handleSendNotice = async (e) => {
    e.preventDefault();
    setNoticeMsg({ type: '', text: '' });
    try {
      const res = await api.post('/notices', noticeForm);
      setNoticeMsg({ type: 'success', text: res.data.message });
      setNoticeForm({ club_id: '', message: '' });
    } catch (err) {
      setNoticeMsg({ type: 'error', text: err.response?.data?.error || 'Failed to send notice' });
    }
  };

  const fetchEventAttendance = async (event_id) => {
    setSelectedEvent(event_id);
    try {
      const res = await api.get(`/attendance/${event_id}`);
      setAttendanceData(res.data);
    } catch {}
  };

  const markAttendance = async (student_id, event_id, status) => {
    try {
      await api.post('/attendance/mark', { student_id, event_id, status });
      setAttendanceData(prev => prev.map(a => a.student_id === student_id ? { ...a, status } : a));
    } catch {}
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const tabs = [
    { id: 'events', label: '📅 Events' },
    { id: 'create', label: '➕ Create Event' },
    { id: 'members', label: '👥 Members' },
    { id: 'attendance', label: '✅ Attendance' },
    { id: 'notices', label: '📢 Notices' },
  ];

  return (
    <div className="app-layout">
      <Sidebar unreadCount={unreadCount} />
      <div className="main-content">
        <Topbar title="Leader Dashboard" onNotifClick={() => setNotifOpen(true)} unreadCount={unreadCount} />
        <div className="page-content">
          <div className="page-header">
            <div>
              <h2>Leader Dashboard 📊</h2>
              <p>Manage your club events, members and attendance</p>
            </div>
          </div>

          {/* Stats */}
          <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(108,99,255,0.1)' }}>📅</div>
              <div><div className="stat-value" style={{ color: '#6c63ff' }}>{events.length}</div><div className="stat-label">My Events</div></div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.1)' }}>⏳</div>
              <div><div className="stat-value" style={{ color: '#f59e0b' }}>{members.length}</div><div className="stat-label">Pending Approvals</div></div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(6,182,212,0.1)' }}>🔔</div>
              <div><div className="stat-value" style={{ color: '#06b6d4' }}>{unreadCount}</div><div className="stat-label">Notifications</div></div>
            </div>
          </div>

          {/* Tab Bar */}
          <div className="role-tab-bar">
            {tabs.map(t => (
              <button key={t.id} className={`role-tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Events Tab */}
          {tab === 'events' && (
            <div className="card">
              <div className="card-header"><span className="card-title">My Events</span></div>
              {loading ? <div className="spinner" /> : events.length === 0 ? (
                <div className="empty-state"><div className="empty-icon">📅</div><p>No events created yet</p></div>
              ) : (
                <div className="table-container">
                  <table>
                    <thead><tr><th>Title</th><th>Club</th><th>Venue</th><th>Date</th></tr></thead>
                    <tbody>
                      {events.map(e => (
                        <tr key={e.event_id}>
                          <td><strong>{e.title}</strong></td>
                          <td>{e.club?.club_name}</td>
                          <td>{e.venue || '—'}</td>
                          <td>{new Date(e.event_date).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Create Event Tab */}
          {tab === 'create' && (
            <div className="card" style={{ maxWidth: 560 }}>
              <div className="card-header"><span className="card-title">➕ Create New Event</span></div>
              {eventMsg.text && <div className={`alert alert-${eventMsg.type === 'success' ? 'success' : 'error'}`}>{eventMsg.text}</div>}
              <form onSubmit={handleCreateEvent}>
                <div className="form-group">
                  <label>Event Title</label>
                  <input type="text" placeholder="Hackathon 2024" value={eventForm.title} onChange={e => setEventForm({ ...eventForm, title: e.target.value })} required />
                </div>
                <div className="input-row">
                  <div className="form-group">
                    <label>Venue</label>
                    <input type="text" placeholder="Lab Block A" value={eventForm.venue} onChange={e => setEventForm({ ...eventForm, venue: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Date</label>
                    <input type="datetime-local" value={eventForm.event_date} onChange={e => setEventForm({ ...eventForm, event_date: e.target.value })} required />
                  </div>
                </div>
                <div className="form-group">
                  <label>Club</label>
                  <select value={eventForm.club_id} onChange={e => setEventForm({ ...eventForm, club_id: e.target.value })} required>
                    <option value="">Select Club</option>
                    {clubs.filter(c => String(c.leader_id) === String(user?.id) || user?.role === 'admin').map(c => (
                      <option key={c.club_id} value={c.club_id}>{c.club_name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea rows={3} placeholder="Event details..." value={eventForm.description} onChange={e => setEventForm({ ...eventForm, description: e.target.value })} style={{ resize: 'vertical' }} />
                </div>
                <button className="btn btn-primary" type="submit" disabled={eventLoading}>
                  {eventLoading ? '⏳ Creating...' : '🚀 Create Event'}
                </button>
              </form>
            </div>
          )}

          {/* Members Tab */}
          {tab === 'members' && (
            <div className="card">
              <div className="card-header"><span className="card-title">👥 Pending Join Requests</span></div>
              {members.length === 0 ? (
                <div className="empty-state"><div className="empty-icon">✅</div><p>No pending requests</p></div>
              ) : (
                <div className="table-container">
                  <table>
                    <thead><tr><th>Student</th><th>Email</th><th>Club</th><th>Action</th></tr></thead>
                    <tbody>
                      {members.map(m => (
                        <tr key={m.id}>
                          <td><strong>{m.student?.name}</strong></td>
                          <td>{m.student?.email}</td>
                          <td>{m.club?.club_name}</td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button className="btn btn-success btn-sm" onClick={() => handleApprove(m.id, 'approved')}>✓ Approve</button>
                              <button className="btn btn-danger btn-sm" onClick={() => handleApprove(m.id, 'rejected')}>✕ Reject</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Attendance Tab */}
          {tab === 'attendance' && (
            <div>
              <div className="card" style={{ marginBottom: '1rem' }}>
                <div className="card-header"><span className="card-title">✅ Mark Attendance</span></div>
                <div className="form-group">
                  <label>Select Event</label>
                  <select value={selectedEvent} onChange={e => fetchEventAttendance(e.target.value)}>
                    <option value="">Choose an event...</option>
                    {events.map(e => <option key={e.event_id} value={e.event_id}>{e.title}</option>)}
                  </select>
                </div>
              </div>
              {attendanceData.length > 0 && (
                <div className="card">
                  <div className="table-container">
                    <table>
                      <thead><tr><th>Student</th><th>Status</th><th>Action</th></tr></thead>
                      <tbody>
                        {attendanceData.map(a => (
                          <tr key={a.id}>
                            <td><strong>{a.student?.name}</strong></td>
                            <td><span className={`badge badge-${a.status === 'present' ? 'success' : 'danger'}`}>{a.status}</span></td>
                            <td>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button className="btn btn-success btn-sm" onClick={() => markAttendance(a.student_id, selectedEvent, 'present')}>Present</button>
                                <button className="btn btn-danger btn-sm" onClick={() => markAttendance(a.student_id, selectedEvent, 'absent')}>Absent</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Notices Tab */}
          {tab === 'notices' && (
            <div className="card" style={{ maxWidth: 560 }}>
              <div className="card-header"><span className="card-title">📢 Send Notice to Members</span></div>
              {noticeMsg.text && <div className={`alert alert-${noticeMsg.type === 'success' ? 'success' : 'error'}`}>{noticeMsg.text}</div>}
              <form onSubmit={handleSendNotice}>
                <div className="form-group">
                  <label>Club</label>
                  <select value={noticeForm.club_id} onChange={e => setNoticeForm({ ...noticeForm, club_id: e.target.value })} required>
                    <option value="">Select Club</option>
                    {clubs.map(c => <option key={c.club_id} value={c.club_id}>{c.club_name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Notice Message</label>
                  <textarea rows={4} placeholder="Write your notice here..." value={noticeForm.message} onChange={e => setNoticeForm({ ...noticeForm, message: e.target.value })} required style={{ resize: 'vertical' }} />
                </div>
                <button className="btn btn-primary" type="submit">📢 Send Notice</button>
              </form>
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
