import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import NotifDrawer from '../components/NotifDrawer';
import api from '../api/axios';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const COLORS = ['#6c63ff', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AdminDashboard() {
  const [tab, setTab] = useState('dashboard');
  const [dashboard, setDashboard] = useState(null);
  const [users, setUsers] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Create club form
  const [clubForm, setClubForm] = useState({ club_name: '', category: '', description: '', leader_id: '' });
  const [clubMsg, setClubMsg] = useState({ type: '', text: '' });

  // Assign leader form
  const [assignForm, setAssignForm] = useState({ club_id: '', user_id: '' });
  const [assignMsg, setAssignMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    const load = async () => {
      try {
        const [dashRes, usersRes, clubsRes, notifRes] = await Promise.all([
          api.get('/admin/dashboard'),
          api.get('/admin/users'),
          api.get('/admin/clubs'),
          api.get('/notifications'),
        ]);
        setDashboard(dashRes.data);
        setUsers(usersRes.data);
        setClubs(clubsRes.data);
        setNotifications(notifRes.data);
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await api.delete(`/admin/user/${id}`);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete user');
    }
  };

  const handleCreateClub = async (e) => {
    e.preventDefault();
    setClubMsg({ type: '', text: '' });
    try {
      const res = await api.post('/admin/create-club', clubForm);
      setClubMsg({ type: 'success', text: 'Club created successfully!' });
      setClubs(prev => [...prev, res.data.club]);
      setClubForm({ club_name: '', category: '', description: '', leader_id: '' });
    } catch (err) {
      setClubMsg({ type: 'error', text: err.response?.data?.error || 'Failed to create club' });
    }
  };

  const handleAssignLeader = async (e) => {
    e.preventDefault();
    setAssignMsg({ type: '', text: '' });
    try {
      await api.put('/admin/assign-leader', assignForm);
      setAssignMsg({ type: 'success', text: 'Leader assigned successfully!' });
      setAssignForm({ club_id: '', user_id: '' });
    } catch (err) {
      setAssignMsg({ type: 'error', text: err.response?.data?.error || 'Failed to assign leader' });
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const roleData = [
    { name: 'Students', value: users.filter(u => u.role === 'student').length },
    { name: 'Leaders', value: users.filter(u => u.role === 'leader').length },
    { name: 'Admins', value: users.filter(u => u.role === 'admin').length },
  ];

  const tabs = [
    { id: 'dashboard', label: '📊 Dashboard' },
    { id: 'users', label: '👥 Users' },
    { id: 'clubs', label: '🏛️ Clubs' },
    { id: 'create-club', label: '➕ New Club' },
    { id: 'assign', label: '🎯 Assign Leader' },
  ];

  return (
    <div className="app-layout">
      <Sidebar unreadCount={unreadCount} />
      <div className="main-content">
        <Topbar title="Admin Dashboard" onNotifClick={() => setNotifOpen(true)} unreadCount={unreadCount} />
        <div className="page-content">
          <div className="page-header">
            <div>
              <h2>Admin Control Panel ⚙️</h2>
              <p>Manage users, clubs, and system analytics</p>
            </div>
          </div>

          {/* Tab Bar */}
          <div className="role-tab-bar" style={{ flexWrap: 'wrap' }}>
            {tabs.map(t => (
              <button key={t.id} className={`role-tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
                {t.label}
              </button>
            ))}
          </div>

          {loading && <div className="loading-center"><div className="spinner" /></div>}

          {/* Dashboard Tab */}
          {!loading && tab === 'dashboard' && dashboard && (
            <>
              <div className="stats-grid">
                {[
                  { icon: '👥', label: 'Total Users', value: dashboard.stats.totalUsers, color: '#6c63ff', bg: 'rgba(108,99,255,0.1)' },
                  { icon: '🏛️', label: 'Total Clubs', value: dashboard.stats.totalClubs, color: '#06b6d4', bg: 'rgba(6,182,212,0.1)' },
                  { icon: '📅', label: 'Total Events', value: dashboard.stats.totalEvents, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
                  { icon: '✅', label: 'Active Members', value: dashboard.stats.totalMemberships, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
                  { icon: '⏳', label: 'Pending Requests', value: dashboard.stats.pendingApprovals, color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
                ].map(s => (
                  <div key={s.label} className="stat-card">
                    <div className="stat-icon" style={{ background: s.bg }}>{s.icon}</div>
                    <div>
                      <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                      <div className="stat-label">{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {/* Pie Chart */}
                <div className="card">
                  <div className="card-header"><span className="card-title">User Distribution</span></div>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={roleData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                        {roleData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Recent Users */}
                <div className="card">
                  <div className="card-header"><span className="card-title">Recent Users</span></div>
                  {dashboard.recentUsers.map(u => (
                    <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--border-glass)' }}>
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{u.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
                      </div>
                      <span className={`badge badge-${u.role === 'admin' ? 'warning' : u.role === 'leader' ? 'secondary' : 'primary'}`}>{u.role}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Users Tab */}
          {!loading && tab === 'users' && (
            <div className="card">
              <div className="card-header">
                <span className="card-title">All Users ({users.length})</span>
              </div>
              <div className="table-container">
                <table>
                  <thead>
                    <tr><th>#</th><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Action</th></tr>
                  </thead>
                  <tbody>
                    {users.map((u, i) => (
                      <tr key={u.id}>
                        <td>{i + 1}</td>
                        <td><strong>{u.name}</strong></td>
                        <td>{u.email}</td>
                        <td><span className={`badge badge-${u.role === 'admin' ? 'warning' : u.role === 'leader' ? 'secondary' : 'primary'}`}>{u.role}</span></td>
                        <td>{u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}</td>
                        <td>
                          {u.role !== 'admin' && (
                            <button className="btn btn-danger btn-sm" onClick={() => handleDeleteUser(u.id)}>🗑️ Delete</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Clubs Tab */}
          {!loading && tab === 'clubs' && (
            <div className="card">
              <div className="card-header">
                <span className="card-title">All Clubs ({clubs.length})</span>
              </div>
              <div className="table-container">
                <table>
                  <thead>
                    <tr><th>Name</th><th>Category</th><th>Leader</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {clubs.map(c => (
                      <tr key={c.club_id}>
                        <td><strong>{c.club_name}</strong></td>
                        <td>{c.category}</td>
                        <td>{c.leader?.name || <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>}</td>
                        <td><span className={`badge badge-${c.status === 'active' ? 'success' : 'danger'}`}>{c.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Create Club Tab */}
          {!loading && tab === 'create-club' && (
            <div className="card" style={{ maxWidth: 520 }}>
              <div className="card-header"><span className="card-title">➕ Create New Club</span></div>
              {clubMsg.text && <div className={`alert alert-${clubMsg.type === 'success' ? 'success' : 'error'}`}>{clubMsg.text}</div>}
              <form onSubmit={handleCreateClub}>
                <div className="form-group">
                  <label>Club Name</label>
                  <input type="text" placeholder="Tech Innovators" value={clubForm.club_name} onChange={e => setClubForm({ ...clubForm, club_name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select value={clubForm.category} onChange={e => setClubForm({ ...clubForm, category: e.target.value })} required>
                    <option value="">Select Category</option>
                    {['Technology', 'Arts', 'Sports', 'Music', 'Science', 'Other'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea rows={3} value={clubForm.description} onChange={e => setClubForm({ ...clubForm, description: e.target.value })} placeholder="About this club..." style={{ resize: 'vertical' }} />
                </div>
                <div className="form-group">
                  <label>Assign Leader (optional)</label>
                  <select value={clubForm.leader_id} onChange={e => setClubForm({ ...clubForm, leader_id: e.target.value })}>
                    <option value="">None</option>
                    {users.filter(u => u.role === 'leader').map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
                <button className="btn btn-primary" type="submit">🏛️ Create Club</button>
              </form>
            </div>
          )}

          {/* Assign Leader Tab */}
          {!loading && tab === 'assign' && (
            <div className="card" style={{ maxWidth: 480 }}>
              <div className="card-header"><span className="card-title">🎯 Assign Leader to Club</span></div>
              {assignMsg.text && <div className={`alert alert-${assignMsg.type === 'success' ? 'success' : 'error'}`}>{assignMsg.text}</div>}
              <form onSubmit={handleAssignLeader}>
                <div className="form-group">
                  <label>Select Club</label>
                  <select value={assignForm.club_id} onChange={e => setAssignForm({ ...assignForm, club_id: e.target.value })} required>
                    <option value="">Choose a club...</option>
                    {clubs.map(c => <option key={c.club_id} value={c.club_id}>{c.club_name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Select User</label>
                  <select value={assignForm.user_id} onChange={e => setAssignForm({ ...assignForm, user_id: e.target.value })} required>
                    <option value="">Choose a user...</option>
                    {users.filter(u => u.role !== 'admin').map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
                  </select>
                </div>
                <button className="btn btn-primary" type="submit">🎯 Assign Leader</button>
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
