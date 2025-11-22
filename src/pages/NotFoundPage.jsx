import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const nav = useNavigate();
  return (
    <div className="app-root">
      <div className="card">
        <h2>404</h2>
        <p>Page not found.</p>
        <button className="primary" onClick={() => nav('/')}>
          Go Home
        </button>
      </div>
    </div>
  );
}
