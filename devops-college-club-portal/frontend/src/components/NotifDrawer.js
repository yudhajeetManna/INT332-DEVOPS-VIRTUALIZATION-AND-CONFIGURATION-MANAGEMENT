import React from 'react';
import api from '../api/axios';

export default function NotifDrawer({ open, onClose, notifications, onMarkRead }) {
  const unread = notifications.filter(n => !n.is_read);

  const handleMarkRead = async (notif) => {
    if (!notif.is_read) {
      try {
        await api.put(`/notifications/${notif.notif_id}/read`);
        onMarkRead(notif.notif_id);
      } catch {}
    }
  };

  return (
    <>
      {open && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 199, background: 'transparent' }}
          onClick={onClose}
        />
      )}
      <div className={`notif-drawer ${open ? 'open' : ''}`}>
        <div className="notif-drawer-header">
          <h3>🔔 Notifications {unread.length > 0 && <span className="badge badge-primary">{unread.length} new</span>}</h3>
          <button className="notif-close" onClick={onClose}>✕</button>
        </div>
        <div className="notif-list">
          {notifications.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔕</div>
              <p>No notifications yet</p>
            </div>
          ) : (
            notifications.map(n => (
              <div
                key={n.notif_id}
                className={`notif-item ${!n.is_read ? 'unread' : ''}`}
                onClick={() => handleMarkRead(n)}
              >
                <p>{n.message}</p>
                <time>{new Date(n.created_at).toLocaleDateString()}</time>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
