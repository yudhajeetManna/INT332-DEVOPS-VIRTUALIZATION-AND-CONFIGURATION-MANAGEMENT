import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Topbar({ title, onNotifClick, unreadCount }) {
  const { user } = useAuth();
  return (
    <header className="topbar">
      <div className="topbar-title">{title}</div>
      <div className="topbar-actions">
        <button className="notif-btn" onClick={onNotifClick} title="Notifications">
          🔔
          {unreadCount > 0 && <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
        </button>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Hi, <strong style={{ color: 'var(--text-primary)' }}>{user?.name?.split(' ')[0]}</strong>
        </span>
      </div>
    </header>
  );
}
