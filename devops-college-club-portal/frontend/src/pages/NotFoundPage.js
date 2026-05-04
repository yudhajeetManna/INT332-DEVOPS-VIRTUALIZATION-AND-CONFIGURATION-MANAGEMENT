import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '6rem', marginBottom: '1rem' }}>🎓</div>
        <h1 style={{ fontSize: '5rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.5rem' }}>404</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Oops! This page doesn't exist.</p>
        <Link to="/" className="btn btn-primary" style={{ width: 'auto', display: 'inline-flex' }}>← Go Home</Link>
      </div>
    </div>
  );
}
