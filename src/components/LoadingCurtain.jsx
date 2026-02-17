// src/components/LoadingCurtain.jsx
import React from 'react';

export default function LoadingCurtain({ visible, message = "Preparing Your Quiz", messageTH = "กำลังเตรียมแบบฝึกหัด..." }) {
  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        background: '#1e1b4b',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Nunito', sans-serif",
      }}
    >
      {/* Decorative gradient orbs */}
      <div style={{
        position: 'absolute',
        top: '-15%',
        left: '-10%',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.35) 0%, transparent 70%)',
        filter: 'blur(60px)',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-15%',
        right: '-10%',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(236,72,153,0.3) 0%, transparent 70%)',
        filter: 'blur(60px)',
      }} />

      {/* Animated rings */}
      <div style={{ position: 'relative', width: 100, height: 100, marginBottom: '2.5rem' }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          border: '5px solid transparent',
          borderTopColor: '#a78bfa',
          borderRadius: '50%',
          animation: 'lcSpin 1s linear infinite',
        }} />
        <div style={{
          position: 'absolute',
          inset: 10,
          border: '5px solid transparent',
          borderTopColor: '#f472b6',
          borderRadius: '50%',
          animation: 'lcSpin 0.7s linear infinite reverse',
        }} />
        <div style={{
          position: 'absolute',
          inset: 20,
          border: '5px solid transparent',
          borderTopColor: '#38bdf8',
          borderRadius: '50%',
          animation: 'lcSpin 0.5s linear infinite',
        }} />
        {/* Center dot */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 16,
          height: 16,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #a78bfa, #f472b6)',
          animation: 'lcPulse 1s ease-in-out infinite',
        }} />
      </div>

      {/* Text */}
      <div style={{
        color: '#e0e7ff',
        fontSize: 'clamp(1.5rem, 4vw, 2rem)',
        fontWeight: 800,
        letterSpacing: '0.05em',
        animation: 'lcFade 1.5s ease-in-out infinite',
        textAlign: 'center',
        padding: '0 1rem',
      }}>
        {message}
      </div>
      <div style={{
        color: 'rgba(196,181,253,0.7)',
        fontSize: 'clamp(1.1rem, 3vw, 1.4rem)',
        fontWeight: 600,
        marginTop: '0.5rem',
        animation: 'lcFade 1.5s ease-in-out infinite 0.2s',
        textAlign: 'center',
        padding: '0 1rem',
      }}>
        {messageTH}
      </div>

      {/* Bouncing dots */}
      <div style={{ display: 'flex', gap: 12, marginTop: '2rem' }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 14,
            height: 14,
            borderRadius: '50%',
            background: i === 0 ? '#a78bfa' : i === 1 ? '#f472b6' : '#38bdf8',
            animation: `lcBounce 0.6s ease-in-out ${i * 0.15}s infinite alternate`,
          }} />
        ))}
      </div>

      <style>{`
        @keyframes lcSpin {
          to { transform: rotate(360deg); }
        }
        @keyframes lcPulse {
          0%, 100% { opacity: 0.6; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 1; transform: translate(-50%, -50%) scale(1.3); }
        }
        @keyframes lcFade {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
        @keyframes lcBounce {
          from { transform: translateY(0); }
          to { transform: translateY(-14px); }
        }
      `}</style>
    </div>
  );
}
