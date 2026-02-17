// src/App.jsx
import React, { useEffect, useState, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { supabase } from './supabaseClient';
import InAppBrowserGuard from './components/InAppBrowserGuard';

// Retry wrapper for lazy imports - handles chunk load errors after deployment
function lazyWithRetry(importFn) {
  return lazy(() =>
    importFn().catch((error) => {
      // Check if it's a chunk load error (happens when old chunks are deleted after deploy)
      if (
        error.name === 'ChunkLoadError' ||
        error.message?.includes('Loading chunk') ||
        error.message?.includes('Failed to fetch dynamically imported module')
      ) {
        // Force reload to get fresh chunks
        window.location.reload();
        return { default: () => null }; // Return empty component while reloading
      }
      throw error;
    })
  );
}

// Lazy load pages with retry logic
const LoginPage = lazyWithRetry(() => import('./pages/LoginPage.jsx'));
const HomePage = lazyWithRetry(() => import('./pages/HomePage.jsx'));
const QuizPage = lazyWithRetry(() => import('./pages/QuizPage.jsx'));
const FlashcardGame = lazyWithRetry(() => import('./components/games/FlashcardGame.jsx'));
const CalendarGame = lazyWithRetry(() => import('./components/games/CalendarGame.jsx'));

// Loading fallback component
function PageLoader() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: '#d8e9fa'
    }}>
      <div style={{ fontSize: '1.5rem', color: '#4a5568' }}>Loading...</div>
    </div>
  );
}

function Protected({ children }) {
  const [session, setSession] = useState(null);
  const [checking, setChecking] = useState(true);
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChecking(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setChecking(false);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  if (checking) return null;

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

export default function App() {
  return (
    <>
    <InAppBrowserGuard />
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/"
          element={
            <Protected>
              <HomePage />
            </Protected>
          }
        />

        <Route
          path="/quiz"
          element={
            <Protected>
              <QuizPage />
            </Protected>
          }
        />

        <Route
          path="/games/flashcard"
          element={
            <Protected>
              <FlashcardGame />
            </Protected>
          }
        />

        <Route
          path="/games/calendar"
          element={
            <Protected>
              <CalendarGame />
            </Protected>
          }
        />

        {/* Redirect unknown pages to Login/Home instead of 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
    </>
  );
}