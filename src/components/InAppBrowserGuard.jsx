// src/components/InAppBrowserGuard.jsx
import React, { useEffect, useState } from 'react';

const IN_APP_BROWSERS = [
  { name: 'Line', pattern: /\bLine\b/i },
  { name: 'Facebook', pattern: /FBAN|FBAV/i },
  { name: 'Instagram', pattern: /Instagram/i },
  { name: 'TikTok', pattern: /TikTok/i },
];

function detectInAppBrowser() {
  const ua = navigator.userAgent || '';
  for (const browser of IN_APP_BROWSERS) {
    if (browser.pattern.test(ua)) return browser.name;
  }
  return null;
}

function isAndroid() {
  return /Android/i.test(navigator.userAgent || '');
}

export default function InAppBrowserGuard() {
  const [blocked, setBlocked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [intentUrl, setIntentUrl] = useState('');

  useEffect(() => {
    const detected = detectInAppBrowser();
    if (!detected) return;

    // LINE auto-redirect with openExternalBrowser param
    if (detected === 'Line') {
      const url = new URL(window.location.href);
      if (!url.searchParams.has('openExternalBrowser')) {
        url.searchParams.set('openExternalBrowser', '1');
        window.location.href = url.toString();
        return;
      }
    }

    // Android: build intent:// link for Chrome
    if (isAndroid()) {
      const current = window.location.href;
      const withoutScheme = current.replace(/^https?:\/\//, '');
      setIntentUrl(
        `intent://${withoutScheme}#Intent;scheme=https;package=com.android.chrome;end`
      );
    }

    setBlocked(true);
  }, []);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const input = document.createElement('input');
      input.value = window.location.href;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!blocked) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#fff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        textAlign: 'center',
        fontFamily: "'Nunito', sans-serif",
      }}
    >
      <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>
        🌐
      </div>

      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem' }}>
        Open in System Browser
      </h1>
      <p style={{ fontSize: '1.1rem', color: '#64748b', marginBottom: '0.25rem' }}>
        This app requires the full system browser for audio features.
      </p>

      <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1e293b', marginTop: '1.5rem', marginBottom: '0.5rem' }}>
        โปรดเปิดในเบราว์เซอร์หลัก
      </h2>
      <p style={{ fontSize: '1rem', color: '#64748b', marginBottom: '2rem' }}>
        แอปนี้ต้องใช้เบราว์เซอร์หลักเพื่อเสียงที่สมบูรณ์
      </p>

      {intentUrl && (
        <a
          href={intentUrl}
          style={{
            display: 'inline-block',
            padding: '0.8rem 2rem',
            borderRadius: '1rem',
            background: 'linear-gradient(135deg, #4d79ff, #668cff)',
            color: '#fff',
            fontWeight: 800,
            fontSize: '1.1rem',
            textDecoration: 'none',
            marginBottom: '1rem',
            boxShadow: '0 4px 15px rgba(77,121,255,0.4)',
          }}
        >
          Open in Chrome
        </a>
      )}

      <button
        onClick={handleCopyLink}
        style={{
          padding: '0.8rem 2rem',
          borderRadius: '1rem',
          background: copied ? '#22c55e' : '#f1f5f9',
          color: copied ? '#fff' : '#334155',
          fontWeight: 700,
          fontSize: '1rem',
          border: '2px solid ' + (copied ? '#22c55e' : '#e2e8f0'),
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
      >
        {copied ? 'Copied! / คัดลอกแล้ว!' : 'Copy Link / คัดลอกลิงก์'}
      </button>
    </div>
  );
}
