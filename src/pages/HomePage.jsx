import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../supabaseClient";

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

const titleMap = {
  1: [
    "Lower Upper",
    "Mix Lower Upper",
    "Five buddy (+) ",
    "Five buddy (-) ",
    "Mix five buddy(+)Five buddy(-)",
    "Ten buddy (+) ",
    "Ten buddy (-)",
    "Mix Ten (+) Ten (-)",
    "Five & Ten buddy (+9)",
    "Five & Ten buddy (+8)",
    "Five & Ten buddy (+7)",
    "Five & Ten buddy (+6)",
    "Five & Ten buddy (-9)",
    "Five & Ten buddy (-8)",
    "Five & Ten buddy (-7)",
    "Five & Ten buddy (-6)",
    "Simple addition & sub",
    "Two digit add & sub",
    "Three digit add & sub",
    "Four digit add & sub",
  ],
  2: ["", ""],
};

const bookIcons = [
  { color: "bg-sky-400", icon: "📘" },
  { color: "bg-emerald-400", icon: "📗" },
  { color: "bg-rose-400", icon: "📕" },
  { color: "bg-amber-300", icon: "📙" },
  { color: "bg-pink-400", icon: "📒" },
  { color: "bg-violet-400", icon: "📚" },
  { color: "bg-orange-400", icon: "📔" },
  { color: "bg-cyan-400", icon: "📖" },
  { color: "bg-purple-400", icon: "📓" },
  { color: "bg-yellow-400", icon: "📙" },
];

const slides = [
  "https://soroban-wonder-kids.b-cdn.net/images/AA.jpg",
  "https://soroban-wonder-kids.b-cdn.net/images/BB.jpg",
  "https://soroban-wonder-kids.b-cdn.net/images/CC.jpg",
  "https://soroban-wonder-kids.b-cdn.net/images/DD.jpg",
];

function checkSvg() {
  return (
    <svg
      className="w-5 h-5"
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="9" cy="9" r="8.5" fill="#16c878" stroke="#16c878" />
      <path
        d="M5.5 9.5l2 2 5-5"
        stroke="#fff"
        strokeWidth="2.1"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();

  // ---- THEME & FONT SCALE (with localStorage) ----
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "light";
    return localStorage.getItem("wk_theme") || "light";
  });

  const [fontScale, setFontScale] = useState(() => {
    if (typeof window === "undefined") return 1;
    const stored = localStorage.getItem("wk_fontScale");
    return stored ? parseFloat(stored) : 1;
  });

  const [showingChapter, setShowingChapter] = useState(false);
  const [slideIdx, setSlideIdx] = useState(0);
  const [selected, setSelected] = useState({ level: 0, chapter: 0 });
  const [levels, setLevels] = useState([]);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [nickname, setNickname] = useState("");
  const [nicknameInput, setNicknameInput] = useState("");
  const [profileLoading, setProfileLoading] = useState(true);

  const [videoWatched, setVideoWatched] = useState(false);

  // to avoid constantly re-centering scroll
  const restoredRef = useRef(false);

  function haptic() {
    if (window.navigator.vibrate) window.navigator.vibrate(20);
  }

  // ----- INIT LEVELS -----
  useEffect(() => {
    const initialLevels = [];
    for (let i = 1; i <= 5; i++) {
      const nCh = i === 1 ? 20 : 5;
      initialLevels.push({
        name: "Level " + i,
        chapters: Array.from({ length: nCh }, (_, j) => ({
          title: `Ch. ${j + 1}${
            titleMap[i] && titleMap[i][j] ? " . " + titleMap[i][j] : ""
          }`,
          completed: false,
          exerciseCompleted: false,
          unlocked: true,
        })),
        progress: 0,
        open: i === 1,
      });
    }

    const sessionProgress = JSON.parse(
      sessionStorage.getItem("wk_progress") || "null"
    );
    if (sessionProgress) {
      for (let i = 0; i < initialLevels.length; i++) {
        for (let j = 0; j < initialLevels[i].chapters.length; j++) {
          const stored = sessionProgress[i]?.[j];
          if (stored) {
            initialLevels[i].chapters[j].completed = !!stored.completed;
            initialLevels[i].chapters[j].exerciseCompleted =
              !!stored.exerciseCompleted;
          }
        }
      }
    }

    setLevels(initialLevels);
  }, []);

  // ----- LOAD NICKNAME FROM SUPABASE -----
  useEffect(() => {
    async function loadProfile() {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError || !user) {
          setProfileLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("profiles")
          .select("nickname")
          .eq("id", user.id)
          .single();

        if (error && error.code !== "PGRST116") {
          console.error("Error loading profile:", error);
          setProfileLoading(false);
          return;
        }

        if (data && data.nickname) {
          setNickname(data.nickname);
          setNicknameInput(data.nickname);
        } else {
          setSettingsOpen(true);
        }
      } catch (err) {
        console.error("Profile load error:", err);
      } finally {
        setProfileLoading(false);
      }
    }

    loadProfile();
  }, []);

  async function saveNickname() {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) return;

      const newNick = nicknameInput.trim() || null;

      const { error } = await supabase.from("profiles").upsert(
        {
          id: user.id,
          nickname: newNick,
        },
        { onConflict: "id" }
      );

      if (error) {
        alert("Failed to save nickname. Please try again.");
        console.error("Nickname save error:", error);
        return;
      }

      setNickname(newNick || "");
      if (newNick) {
        alert("Nickname saved!");
      }
    } catch (err) {
      console.error("Nickname save error:", err);
      alert("Failed to save nickname. Please try again.");
    }
  }

  // ----- SLIDESHOW -----
  useEffect(() => {
    if (showingChapter) return;
    const id = setInterval(() => {
      setSlideIdx((prev) => (prev + 1) % slides.length);
    }, 2000);
    return () => clearInterval(id);
  }, [showingChapter]);

  // ----- SAVE PROGRESS -----
  function saveProgress(updatedLevels) {
    const arr = [];
    for (let i = 0; i < updatedLevels.length; i++) {
      arr[i] = [];
      for (let j = 0; j < updatedLevels[i].chapters.length; j++) {
        arr[i][j] = {
          completed: !!updatedLevels[i].chapters[j].completed,
          exerciseCompleted: !!updatedLevels[i].chapters[j].exerciseCompleted,
        };
      }
    }
    sessionStorage.setItem("wk_progress", JSON.stringify(arr));
  }

  // ----- RESTORE ONCE (URL OR LAST SELECTION) -----
  useEffect(() => {
    if (!levels.length || restoredRef.current) return;

    restoredRef.current = true;

    const url = new URL(window.location.href);
    const lvl = parseInt(url.searchParams.get("level"), 10);
    const chap = parseInt(url.searchParams.get("chapter"), 10);

    // URL params first
    if (
      lvl &&
      chap &&
      lvl >= 1 &&
      lvl <= levels.length &&
      chap >= 1 &&
      chap <= levels[lvl - 1].chapters.length
    ) {
      const levelIndex = lvl - 1;
      const chapterIndex = chap - 1;

      setSelected({ level: levelIndex, chapter: chapterIndex });
      setShowingChapter(true);
      setVideoWatched(false);

      setLevels((prev) =>
        prev.map((l, idx) =>
          idx === levelIndex ? { ...l, open: true } : { ...l, open: false }
        )
      );

      sessionStorage.setItem(
        "wk_lastSelection",
        JSON.stringify({ level: levelIndex, chapter: chapterIndex })
      );

      setTimeout(() => {
        const list = document.querySelector(
          `[data-level-index="${levelIndex}"]`
        );
        const btn = list?.querySelector(
          `[data-chapter-index="${chapterIndex}"]`
        );
        if (btn && btn.scrollIntoView) {
          btn.scrollIntoView({ behavior: "auto", block: "center" });
        }
      }, 0);

      return;
    }

    // Fallback: last selection from session
    const lastSelRaw = sessionStorage.getItem("wk_lastSelection");
    if (!lastSelRaw) return;

    try {
      const lastSel = JSON.parse(lastSelRaw);
      const { level, chapter } = lastSel;

      if (
        typeof level === "number" &&
        typeof chapter === "number" &&
        level >= 0 &&
        level < levels.length &&
        chapter >= 0 &&
        chapter < levels[level].chapters.length
      ) {
        setSelected({ level, chapter });
        setShowingChapter(true);
        setVideoWatched(false);

        setLevels((prev) =>
          prev.map((l, idx) =>
            idx === level ? { ...l, open: true } : { ...l, open: false }
          )
        );

        setTimeout(() => {
          const list = document.querySelector(
            `[data-level-index="${level}"]`
          );
          const btn = list?.querySelector(
            `[data-chapter-index="${chapter}"]`
          );
          if (btn && btn.scrollIntoView) {
            btn.scrollIntoView({ behavior: "auto", block: "center" });
          }
        }, 0);
      }
    } catch (e) {
      console.error("Invalid wk_lastSelection:", e);
    }
  }, [levels]);

  // ----- CHAPTER SELECT -----
  function handleSelectChapter(levelIndex, chapterIndex) {
    setSelected({ level: levelIndex, chapter: chapterIndex });
    setShowingChapter(true);
    setVideoWatched(false);

    sessionStorage.setItem(
      "wk_lastSelection",
      JSON.stringify({ level: levelIndex, chapter: chapterIndex })
    );

    setLevels((prev) =>
      prev.map((lvl, i) =>
        i === levelIndex ? { ...lvl, open: true } : { ...lvl, open: false }
      )
    );
    haptic();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ----- LEVEL TOGGLE -----
  function handleToggleLevel(index) {
    setLevels((prev) =>
      prev.map((lvl, i) =>
        i === index ? { ...lvl, open: !lvl.open } : { ...lvl, open: false }
      )
    );
    haptic();
  }

  // ----- EXERCISE BUTTON -----
  function handleExercise() {
    // no gating: user can do exercise anytime
    setLevels((prev) => {
      const copy = prev.map((lvl) => ({
        ...lvl,
        chapters: [...lvl.chapters],
      }));
      const { level, chapter } = selected;
      copy[level].chapters[chapter].exerciseCompleted = true;
      copy[level].chapters[chapter].completed = true;
      saveProgress(copy);
      return copy;
    });

    haptic();

    const lvlNum = selected.level + 1;
    const chapNum = selected.chapter + 1;

    // simple direct navigate
    navigate(`/quiz?level=${lvlNum}&chapter=${chapNum}`, {
      state: { from: location.pathname },
    });
  }

  // ----- NEXT CHAPTER BUTTON -----
  function handleNextChapter() {
    setLevels((prev) => {
      const { level, chapter } = selected;
      if (!prev[level].chapters[chapter + 1]) return prev;

      const newSelected = { level, chapter: chapter + 1 };
      setSelected(newSelected);
      setShowingChapter(true);
      setVideoWatched(false);

      sessionStorage.setItem(
        "wk_lastSelection",
        JSON.stringify(newSelected)
      );

      // ONLY scroll chapter list, not the whole page
      setTimeout(() => {
        const list = document.querySelector(
          `[data-level-index="${level}"]`
        );
        if (list) {
          const btn = list.querySelector(
            `[data-chapter-index="${chapter + 1}"]`
          );
          if (btn && btn.scrollIntoView) {
            btn.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }
      }, 0);

      return prev;
    });
    haptic();
  }

  // ----- LOGOUT -----
  async function handleLogout() {
    sessionStorage.removeItem("wk_progress");
    sessionStorage.removeItem("wk_lastSelection");
    await supabase.auth.signOut();
    navigate("/login");
  }

  // ----- FULLSCREEN -----
  function handleFullscreen() {
    if (!isIOS()) {
      const el = document.documentElement;
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else if (el.requestFullscreen) {
        el.requestFullscreen();
      }
    } else {
      alert(
        "Fullscreen mode is not supported on iPhone/iPad. Please rotate your device manually."
      );
    }
    haptic();
  }

  // ----- TOP AREA CONTENT (WELCOME / CHAPTER) -----
  function renderTop() {
    if (!showingChapter || !levels.length) {
      const namePart = nickname
        ? `Welcome to Wonder Kids, ${nickname}!`
        : "Welcome to Wonder Kids!";
      const subtitle = nickname
        ? "Choose your Soroban level and chapter below, or enjoy the slideshow while you decide."
        : "Choose your Soroban level below or enjoy the slideshow while you decide.";

      return (
        <div className="w-full max-w-5xl px-3">
          <div className="bg-white/95 rounded-3xl shadow-2xl px-4 py-4 md:px-8 md:py-6 border border-violet-100">
            <h1 className="text-left text-lg md:text-2xl font-bold text-violet-500 mb-2">
              {namePart}
            </h1>
            <p className="text-slate-500 text-sm md:text-base">{subtitle}</p>

            <div className="mt-4 flex flex-col md:flex-row gap-4 md:gap-6 items-center">
              {/* Slideshow */}
              <div className="w-full md:w-[520px] rounded-3xl shadow-xl border-2 border-violet-200 overflow-hidden bg-white">
                <img
                  src={slides[slideIdx]}
                  alt="Wonder Kids"
                  className="w-full h-[220px] md:h-[320px] object-cover transition-transform duration-700 ease-out scale-105"
                />
              </div>

              {/* Small overview card */}
              <div className="w-full md:flex-1 bg-violet-50 rounded-2xl shadow-inner px-4 py-3 text-sm md:text-base text-slate-600">
                <p className="font-semibold text-violet-600 mb-1">
                  Soroban Mastery Path
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Start from Level 1 for basics.</li>
                  <li>Each chapter unlocks new Soroban skills.</li>
                  <li>Progress is saved automatically on this device.</li>
                </ul>
              </div>
            </div>

            {/* Dots */}
            <div className="flex justify-center gap-2 mt-3">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSlideIdx(i)}
                  className={`w-3 h-3 rounded-full border border-violet-300 shadow-sm transition ${
                    i === slideIdx
                      ? "bg-pink-400 opacity-100"
                      : "bg-blue-200 opacity-60"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      );
    }

    const lvl = selected.level;
    const chapIdx = selected.chapter;
    const titles = titleMap[lvl + 1] || [];
    const customTitle =
      titles[chapIdx] || levels[lvl].chapters[chapIdx].title;
    const completed = levels[lvl].chapters[chapIdx].exerciseCompleted;

    const levelNum = lvl + 1;
    const chapterNum = chapIdx + 1;
    const videoUrl = `https://soroban-wonder-kids.b-cdn.net/videos/level${levelNum}-chapter${chapterNum}.mp4`;

    return (
      <div className="w-full max-w-5xl px-3">
        <div className="bg-white/95 rounded-3xl shadow-2xl px-4 py-4 md:px-8 md:py-6 border border-violet-100">
          <h2 className="text-left text-lg md:text-2xl font-bold text-violet-500 mb-1">
            Ch.{chapIdx + 1} {customTitle}
          </h2>

          <div className="relative w-full max-w-xl mx-auto mt-3 rounded-3xl border-4 border-violet-300 shadow-[0_12px_40px_rgba(140,110,255,0.3)] overflow-hidden bg-black">
            <video
              key={videoUrl}
              src={videoUrl}
              controls
              controlsList="nodownload"
              preload="metadata"
              className="w-full h-[220px] md:h-[260px] bg-black"
              onContextMenu={(e) => e.preventDefault()}
              onError={(e) => {
                if (!e.target._tries) e.target._tries = 0;
                e.target._tries++;
                if (e.target._tries >= 3) {
                  alert(
                    "Video could not be loaded. Please check your internet."
                  );
                }
              }}
              onTimeUpdate={(e) => {
                if (e.target.currentTime >= 5) {
                  setVideoWatched(true);
                }
              }}
              onEnded={() => setVideoWatched(true)}
            />
          </div>

          <div className="flex justify-center gap-4 mt-4 flex-wrap">
            <button
              onClick={handleExercise}
              className={`inline-flex items-center justify-center px-5 py-2 rounded-2xl text-sm md:text-base font-bold shadow-md transition active:scale-95 ${
                completed
                  ? "bg-pink-400 text-white"
                  : "bg-blue-200 text-violet-700"
              }`}
            >
              <span className="material-icons-outlined text-base md:text-lg mr-1">
                play_arrow
              </span>
              <span>Exercise</span>
              {completed && <span className="ml-2">{checkSvg()}</span>}
            </button>
            <button
              onClick={handleNextChapter}
              className="inline-flex items-center justify-center px-5 py-2 rounded-2xl text-sm md:text-base font-bold shadow-md bg-blue-200 text-violet-700 transition active:scale-95"
            >
              <span className="material-icons-outlined text-base md:text-lg mr-1">
                navigate_next
              </span>
              <span>Next</span>
              {completed && <span className="ml-2">{checkSvg()}</span>}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ----- LEVELS LIST -----
  function renderLevels() {
    if (!levels.length) return null;
    return (
      <div className="w-full flex justify-center mt-4 pb-8">
        <div className="w-full max-w-3xl px-3">
          {/* removed max-h + overflow here so full page can scroll as needed */}
          <div className="rounded-3xl bg-white/80 shadow-xl border border-violet-100 pt-3 pb-3 space-y-3">
            {levels.map((lvl, i) => {
              const n = lvl.chapters.length;
              const done = lvl.chapters.filter(
                (c) => c.exerciseCompleted
              ).length;
              const progress = n > 0 ? Math.round((done / n) * 100) : 0;
              const book = bookIcons[i % bookIcons.length];

              return (
                <div
                  key={i}
                  className={`rounded-2xl mx-2 shadow-sm transition ${
                    lvl.open ? "bg-blue-400/95" : "bg-blue-100"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleToggleLevel(i)}
                    className={`w-full flex items-center px-4 py-3 rounded-t-2xl text-left select-none ${
                      lvl.open ? "text-white" : "text-blue-700"
                    }`}
                  >
                    <span
                      className={`w-8 h-8 mr-3 rounded-lg flex items-center justify-center shadow-sm text-lg ${book.color}`}
                    >
                      {book.icon}
                    </span>
                    <span className="font-bold mr-3">{lvl.name}</span>
                    <div className="flex-1 h-2 rounded-full bg-blue-100/60 relative mr-3 max-w-[110px]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-yellow-300 to-blue-300 shadow"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="text-xl">{lvl.open ? "▴" : "▾"}</span>
                  </button>

                  {lvl.open && (
                    <div
                      className="flex flex-col gap-2 px-3 pb-3 pt-1 max-h-64 overflow-y-auto"
                      data-level-index={i}
                    >
                      {lvl.chapters.map((ch, j) => {
                        const isActive =
                          showingChapter &&
                          selected.level === i &&
                          selected.chapter === j;
                        const baseClasses =
                          "w-full flex items-center justify-between px-3 py-2 text-sm md:text-base font-semibold rounded-xl border shadow-sm cursor-pointer transition";
                        const stateClasses = ch.exerciseCompleted
                          ? "border-emerald-500 text-emerald-500 bg-white"
                          : isActive
                          ? "border-pink-400 bg-pink-50 text-pink-500 scale-[1.02]"
                          : "border-blue-200 bg-white text-blue-600 hover:bg-pink-50 hover:border-pink-400 hover:text-pink-500";
                        return (
                          <button
                            key={j}
                            type="button"
                            onClick={() => handleSelectChapter(i, j)}
                            className={`${baseClasses} ${stateClasses}`}
                            data-chapter-index={j}
                          >
                            <span className="text-left">{ch.title}</span>
                            {ch.exerciseCompleted && (
                              <span className="ml-3 text-emerald-500">
                                {checkSvg()}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ----- SETTINGS MODAL -----
  function renderSettingsModal() {
    if (!settingsOpen) return null;
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <div className="relative bg-white rounded-2xl shadow-2xl px-6 py-5 w-[320px] flex flex-col gap-4">
          <button
            className="absolute top-2 right-2 w-9 h-9 rounded-full flex items-center justify-center text-2xl text-violet-400 hover:bg-violet-100"
            onClick={() => setSettingsOpen(false)}
          >
            ×
          </button>

          <div className="flex flex-col gap-2">
            <label className="font-semibold">Nickname</label>
            <input
              type="text"
              value={nicknameInput}
              onChange={(e) => setNicknameInput(e.target.value)}
              placeholder="Enter your nickname"
              className="w-full rounded-xl border border-violet-100 px-3 py-2 text-sm bg-indigo-50/60"
              disabled={profileLoading}
            />
            <button
              onClick={saveNickname}
              className="self-end mt-1 px-3 py-1 rounded-lg bg-blue-200 text-violet-700 text-xs font-semibold shadow-sm active:scale-95"
            >
              Save nickname
            </button>
          </div>

          <div className="flex items-center justify-between">
            <label className="font-semibold mr-2">Mode</label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="rounded-full border-0 px-4 py-1.5 bg-indigo-50 text-indigo-700 text-sm font-semibold shadow-sm"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <label className="font-semibold mr-2">Font Size</label>
            <input
              type="range"
              min="0.92"
              max="1.22"
              step="0.01"
              value={fontScale}
              onChange={(e) => setFontScale(parseFloat(e.target.value))}
              className="w-32 accent-violet-400"
            />
          </div>

          <button
            onClick={handleLogout}
            className="mt-2 w-full rounded-xl bg-rose-400 text-white font-bold py-2.5 shadow-md active:bg-pink-400"
          >
            Log Out
          </button>
        </div>
      </div>
    );
  }

  // ----- APPLY THEME + FONT SCALE + PERSIST -----
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    if (typeof window !== "undefined") {
      localStorage.setItem("wk_theme", theme);
    }
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontScale}rem`;
    if (typeof window !== "undefined") {
      localStorage.setItem("wk_fontScale", String(fontScale));
    }
  }, [fontScale]);

  // ----- CLICKABLE LOGO TO GO HOME -----
  function handleLogoClick() {
    setShowingChapter(false);
    setVideoWatched(false);
    haptic();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ----- RENDER ROOT -----
  return (
    <div
      className={`min-h-screen w-full font-[Nunito] ${
        theme === "dark"
          ? "bg-slate-900"
          : "bg-gradient-to-b from-violet-100 via-slate-50 to-slate-200"
      }`}
    >
      {/* Top bar: logo left, buttons right */}
      <div className="fixed top-3 left-4 right-4 z-20 flex items-center justify-between">
        {/* Wonder Kids logo (clickable) */}
        <button
          onClick={handleLogoClick}
          className="flex items-center gap-2 bg-white/80 rounded-full px-3 py-1 shadow-md active:scale-95"
        >
          <img
            src="/logo.png"
            alt="Wonder Kids"
            className="w-7 h-7 rounded-full object-contain"
          />
          <span className="text-sm font-bold text-violet-600">
            Wonder Kids
          </span>
        </button>

        {/* Settings + Fullscreen */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setSettingsOpen(true);
              haptic();
            }}
            className="w-10 h-10 rounded-full bg-indigo-50 shadow flex items-center justify-center active:bg-pink-400 active:text-white"
          >
            <span className="material-icons-outlined text-[22px] text-violet-500">
              settings
            </span>
          </button>
          <button
            onClick={handleFullscreen}
            className="w-10 h-10 rounded-full bg-indigo-50 shadow flex items-center justify-center active:bg-pink-400 active:text-white"
          >
            <span className="material-icons-outlined text-[22px] text-violet-500">
              fullscreen
            </span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="pt-20 flex flex-col items-center">
        {renderTop()}
        {renderLevels()}
      </div>

      {renderSettingsModal()}
    </div>
  );
}

export default HomePage;
