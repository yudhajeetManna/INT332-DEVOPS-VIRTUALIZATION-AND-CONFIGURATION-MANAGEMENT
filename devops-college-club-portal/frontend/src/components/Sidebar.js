import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const roleNavItems = {
  student: [
    { to: '/dashboard', icon: '🏠', label: 'Dashboard' },
    { to: '/clubs', icon: '🏛️', label: 'Browse Clubs' },
    { to: '/events', icon: '📅', label: 'Events' },
  ],
  leader: [
    { to: '/leader', icon: '📊', label: 'Leader Dashboard' },
    { to: '/clubs', icon: '🏛️', label: 'Clubs' },
    { to: '/events', icon: '📅', label: 'Events' },
  ],
  admin: [
    { to: '/admin', icon: '⚙️', label: 'Admin Dashboard' },
    { to: '/clubs', icon: '🏛️', label: 'Clubs' },
    { to: '/events', icon: '📅', label: 'Events' },
  ],
};

const roleColors = { student: '#6c63ff', leader: '#06b6d4', admin: '#f59e0b' };

export default function Sidebar({ notifOpen, setNotifOpen, unreadCount }) {
  const { user, logout } = useAuth();
  const navItems = roleNavItems[user?.role] || roleNavItems.student;
  const color = roleColors[user?.role] || '#6c63ff';
  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">🎓</div>
        <span>Club<br />Portal</span>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Navigation</div>
        {navItems.map(item => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) => isActive ? 'active' : ''}>
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar" style={{ background: `linear-gradient(135deg, ${color}, #06b6d4)` }}>
            {initials}
          </div>
          <div className="user-info-text">
            <div className="name">{user?.name}</div>
            <div className="role">{user?.role}</div>
          </div>
        </div>
        <button className="btn btn-secondary" style={{ width: '100%', fontSize: '0.85rem', padding: '0.5rem 1rem' }} onClick={logout}>
          🚪 Sign Out
        </button>
      </div>
    </aside>
  );
}
