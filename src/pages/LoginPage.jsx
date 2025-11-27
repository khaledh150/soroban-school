// src/pages/LoginPage.jsx
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useLanguage } from "../LanguageContext";
import logoImg from "../assets/logo.png"; 

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  const { lang, toggleLang, t } = useLanguage();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function login(e) {
    e.preventDefault();
    setErrorMsg("");

    if (!username || !password) {
      setErrorMsg(t.errorFill);
      return;
    }

    const email = `${username}@sorobanquiz.com`;

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    navigate(from, { replace: true });
  }

  return (
    // FIX 1: Changed min-h-screen to h-screen to prevent unnecessary scroll on mobile
    <div className="h-screen w-full bg-[#d8e9fa] flex flex-col items-center justify-center px-4 relative overflow-hidden">
      
      {/* Background Decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-violet-200/50 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-pink-200/50 rounded-full blur-3xl animate-pulse delay-1000"></div>

      {/* --- MASSIVE LOGO (With Negative Margin to pull card up) --- */}
      {/* FIX 2: Reduced logo size for mobile (w-48) and increased negative margin (-mb-10) to raise card */}
      <div className="relative z-10 -mb-2 md:-mb-7 animate-scale-in shrink-0">
        <img 
          src={logoImg} 
          alt="Wonder Kids Logo" 
          className="w-74 h-74 md:w-[300px] md:h-[300px] object-contain drop-shadow-2xl"
        />
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/50 p-8 flex flex-col items-center relative z-20 animate-scale-in">
        
        <h1 className="text-3xl font-black text-slate-700 mb-2 tracking-tight text-center">
          {t.appTitle}
        </h1>
        <p className="text-slate-500 font-medium mb-6 text-center">
          {t.loginTitle}
        </p>

        <form onSubmit={login} className="w-full space-y-4">
          
          {/* Username Input */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">
              {t.username}
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="material-icons-outlined text-slate-400 group-focus-within:text-violet-500 transition-colors">person</span>
              </div>
              <input
                type="text"
                className="w-full rounded-2xl bg-slate-50 border-2 border-slate-100 px-4 py-3 pl-11 text-slate-700 font-bold placeholder-slate-300 focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all"
                placeholder="student"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">
              {t.password}
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="material-icons-outlined text-slate-400 group-focus-within:text-violet-500 transition-colors">lock</span>
              </div>
              <input
                type={showPassword ? "text" : "password"}
                className="w-full rounded-2xl bg-slate-50 border-2 border-slate-100 px-4 py-3 pl-11 pr-12 text-slate-700 font-bold placeholder-slate-300 focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-violet-600 transition-colors cursor-pointer focus:outline-none"
                tabIndex="-1"
              >
                <span className="material-icons-outlined">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="rounded-2xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm font-bold text-rose-600 flex items-center gap-2 animate-shake">
              <span className="material-icons-outlined">error_outline</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-4 relative overflow-hidden rounded-2xl py-4 text-base font-black uppercase tracking-wide shadow-xl shadow-violet-500/20 transition-all transform active:scale-[0.98] ${
              loading
                ? "bg-slate-200 text-slate-400 cursor-wait"
                : "bg-linear-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white hover:shadow-violet-500/40"
            }`}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loading && <span className="material-icons-outlined animate-spin text-xl">autorenew</span>}
              {loading ? t.signingIn : t.loginTitle}
            </span>
          </button>
        </form>

        {/* Language Switcher (Bottom) */}
        <div className="mt-6 pt-4 border-t border-slate-100 w-full flex justify-center">
          <button 
            onClick={toggleLang}
            className="flex items-center gap-3 px-5 py-2 rounded-full bg-slate-50 hover:bg-white border border-slate-100 shadow-sm transition-all group"
          >
            <span className="text-xl">{lang === 'en' ? '🇹🇭' : '🇺🇸'}</span>
            <span className="text-sm font-bold text-slate-600 group-hover:text-violet-600">
              {lang === 'en' ? 'เปลี่ยนเป็นภาษาไทย' : 'Switch to English'}
            </span>
            <span className="material-icons-outlined text-slate-400 text-sm">swap_horiz</span>
          </button>
        </div>

      </div>
    </div>
  );
}