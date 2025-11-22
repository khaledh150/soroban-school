import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function login(e) {
    e.preventDefault();
    setErrorMsg("");

    if (!username || !password) {
      setErrorMsg("Fill all fields");
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
      console.error("Supabase login error", error);
      setErrorMsg(error.message);
      return;
    }

    navigate(from, { replace: true });
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-violet-200 via-slate-50 to-blue-100 flex items-center justify-center px-4">
      {/* Subtle background orb */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-24 -left-10 w-72 h-72 rounded-full bg-pink-300/30 blur-3xl" />
        <div className="absolute bottom-[-80px] right-[-40px] w-80 h-80 rounded-full bg-sky-300/30 blur-3xl" />
      </div>

      <div className="w-full max-w-md">
        {/* Logo + title */}
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/80 shadow-md flex items-center justify-center overflow-hidden">
              <img
                src="/logo.png"
                alt="Wonder Kids"
                className="w-10 h-10 object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xs tracking-[0.2em] font-semibold text-violet-500 uppercase">
                Wonder Kids
              </span>
              <span className="text-xl font-extrabold text-slate-800">
                Soroban Quiz Portal
              </span>
            </div>
          </div>
          <p className="mt-3 text-xs sm:text-sm text-slate-500 text-center max-w-sm">
            Sign in with your Wonder Kids Soroban account to continue your
            training and track your progress.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-violet-100 px-6 py-6 sm:px-8 sm:py-7">
          <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-1 text-center">
            Soroban Quiz Login
          </h2>


          <form onSubmit={login} className="space-y-4">
            {/* Username */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-600">
                Username
              </label>
              <div className="relative">
                <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base">
                  person
                </span>
                <input
                  type="text"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-violet-100 bg-slate-50/80 text-sm text-slate-800 shadow-sm outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-300 transition"
                  placeholder="yourusername"
                  value={username}
                  autoComplete="username"
                  onChange={(e) => setUsername(e.target.value.trim())}
                />
              </div>
                    </div>

            {/* Password */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-600">
                Password
              </label>
              <div className="relative">
                <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base">
                  lock
                </span>
                <input
                  type="password"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-violet-100 bg-slate-50/80 text-sm text-slate-800 shadow-sm outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-300 transition"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Error */}
            {errorMsg && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 px-3 py-2 text-xs text-rose-600 flex items-start gap-2">
                <span className="material-icons-outlined text-[16px] mt-[1px]">
                  error_outline
                </span>
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full mt-2 inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-bold shadow-md transition active:scale-95 ${
                loading
                  ? "bg-violet-300 text-white cursor-wait"
                  : "bg-gradient-to-r from-violet-500 to-pink-400 text-white hover:from-violet-600 hover:to-pink-500"
              }`}
            >
              {loading && (
                <span className="material-icons-outlined mr-2 animate-spin text-[18px]">
                  autorenew
                </span>
              )}
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Small footer hint */}
          <div className="mt-4 text-[11px] text-slate-400 text-center">
            <p>
                        </p>
          </div>
        </div>
      </div>
    </div>
  );
}
