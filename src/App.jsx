// src/App.jsx
import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { supabase } from './supabaseClient';
import LoginPage from './pages/LoginPage.jsx';
import HomePage from './pages/HomePage.jsx';
import QuizPage from './pages/QuizPage.jsx';
// DELETED: import NotFoundPage ...

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

        {/* Redirect unknown pages to Login/Home instead of 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Copyright text section - Changed from <footer> to <div> */}
      <div className="w-full py-6 mt-12 text-center border-t border-gray-800">
        <p className="text-sm text-gray-400">
          © {new Date().getFullYear()} <span className="font-semibold text-gray-200">Wonder Kids Company Limited</span>. All rights reserved.
        </p>
      </div>
    </>
  );
}