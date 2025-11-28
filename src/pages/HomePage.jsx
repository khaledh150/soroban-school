// src/pages/HomePage.jsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useLanguage, chapterTitlesTH } from "../LanguageContext";
import logoImg from "../assets/logo.png"; 

// --- IMPORT LOCAL SLIDESHOW IMAGES ---
import imgAA from "../assets/images/AA.jpg";
import imgBB from "../assets/images/BB.jpg";
import imgCC from "../assets/images/CC.jpg";
import imgDD from "../assets/images/DD.jpg";

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

// English Titles
const titleMap = {
  1: [
    "Lower",
    "Lower 2 digit",
    "Upper",
    "Mix lower upper",
    "Mix lower upper 2 digit",
    "Five buddy +4",
    "Five buddy +3",
    "Five buddy +2",
    "Five buddy +1",
    "Five buddy (+)",
    "Five buddy -4",
    "Five buddy -3",
    "Five buddy -2",
    "Five buddy -1",
    "Five buddy (-)",
    "Mix Five buddy",
    "Mix Five buddy 2 digit"
  ],
  2: [
    "Ten buddy +9",
    "Ten buddy +8",
    "Ten buddy +7",
    "Ten buddy +6",
    "Ten buddy +5",
    "Ten buddy +4",
    "Ten buddy +3",
    "Ten buddy +2",
    "Ten buddy +1",
    "Ten buddy (+)",
    "Ten buddy -9",
    "Ten buddy -8",
    "Ten buddy -7",
    "Ten buddy -6",
    "Ten buddy -5",
    "Ten buddy -4",
    "Ten buddy -3",
    "Ten buddy -2",
    "Ten buddy -1",
    "Ten buddy (-)",
    "Mix Ten buddy"
  ],
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

const slides = [imgAA, imgBB, imgCC, imgDD];

const VIDEO_BASE = "https://soroban-wonder-kids.b-cdn.net/videos";

function checkSvg() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <circle cx="9" cy="9" r="8.5" fill="#16c878" stroke="#16c878" />
      <path d="M5.5 9.5l2 2 5-5" stroke="#fff" strokeWidth="2.1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const { lang, toggleLang, t } = useLanguage();

  const [fontScale, setFontScale] = useState(() => {
    if (typeof window === "undefined") return 1;
    const stored = localStorage.getItem("wk_fontScale");
    return stored ? parseFloat(stored) : 1;
  });

  const [showingChapter, setShowingChapter] = useState(false);
  const [slideIdx, setSlideIdx] = useState(0);
  const [selected, setSelected] = useState({ level: 0, chapter: 0 });
  const [levels, setLevels] = useState([]); // We keep variable name 'levels' internally, but display "Book"
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [videoWatched, setVideoWatched] = useState(false);

  const restoredRef = useRef(false);

  function haptic() {
    if (window.navigator.vibrate) window.navigator.vibrate(20);
  }

  const getLevelTitles = (levelIndex) => {
    // Fallback to English titleMap for Book 2 if Thai translations missing
    return lang === 'th' && chapterTitlesTH[levelIndex + 1]
      ? chapterTitlesTH[levelIndex + 1]
      : (titleMap[levelIndex + 1] || []);
  };

  useEffect(() => {
    const initialLevels = [];
    for (let i = 1; i <= 5; i++) {
      // Book 1 has 17 chapters, Book 2 has 21 chapters, others default to 5
      let nCh = 5;
      if (i === 1) nCh = 17;
      if (i === 2) nCh = 21;

      initialLevels.push({
        name: "Book " + i,
        chapters: Array.from({ length: nCh }, (_, j) => ({
          title: `Ch. ${j + 1}`, 
          completed: false,
          exerciseCompleted: false,
          unlocked: true,
        })),
        progress: 0,
        open: i === 1,
      });
    }

    const sessionProgress = JSON.parse(sessionStorage.getItem("wk_progress") || "null");
    if (sessionProgress) {
      for (let i = 0; i < initialLevels.length; i++) {
        for (let j = 0; j < initialLevels[i].chapters.length; j++) {
          const stored = sessionProgress[i]?.[j];
          if (stored) {
            initialLevels[i].chapters[j].completed = !!stored.completed;
            initialLevels[i].chapters[j].exerciseCompleted = !!stored.exerciseCompleted;
          }
        }
      }
    }
    setLevels(initialLevels);
  }, []);

  useEffect(() => {
    if (showingChapter) return;
    setSlideIdx(0);
    
    const id = setInterval(() => {
      setSlideIdx((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(id);
  }, [showingChapter]);

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

  useEffect(() => {
    if (!levels.length || restoredRef.current) return;
    restoredRef.current = true;
    const url = new URL(window.location.href);
    const lvl = parseInt(url.searchParams.get("level"), 10);
    const chap = parseInt(url.searchParams.get("chapter"), 10);

    if (lvl && chap && lvl >= 1 && lvl <= levels.length && chap >= 1 && chap <= levels[lvl - 1].chapters.length) {
      const levelIndex = lvl - 1;
      const chapterIndex = chap - 1;
      setSelected({ level: levelIndex, chapter: chapterIndex });
      setShowingChapter(true);
      setVideoWatched(false);
      setLevels((prev) => prev.map((l, idx) => idx === levelIndex ? { ...l, open: true } : { ...l, open: false }));
      sessionStorage.setItem("wk_lastSelection", JSON.stringify({ level: levelIndex, chapter: chapterIndex }));
      setTimeout(() => {
        const list = document.querySelector(`[data-level-index="${levelIndex}"]`);
        const btn = list?.querySelector(`[data-chapter-index="${chapterIndex}"]`);
        if (btn && btn.scrollIntoView) { btn.scrollIntoView({ behavior: "auto", block: "center" }); }
      }, 0);
      return;
    }

    const lastSelRaw = sessionStorage.getItem("wk_lastSelection");
    if (!lastSelRaw) return;
    try {
      const lastSel = JSON.parse(lastSelRaw);
      const { level, chapter } = lastSel;
      if (typeof level === "number" && typeof chapter === "number" && level >= 0 && level < levels.length && chapter >= 0 && chapter < levels[level].chapters.length) {
        setSelected({ level, chapter });
        setShowingChapter(true);
        setVideoWatched(false);
        setLevels((prev) => prev.map((l, idx) => idx === level ? { ...l, open: true } : { ...l, open: false }));
        setTimeout(() => {
          const list = document.querySelector(`[data-level-index="${level}"]`);
          const btn = list?.querySelector(`[data-chapter-index="${chapter}"]`);
          if (btn && btn.scrollIntoView) { btn.scrollIntoView({ behavior: "auto", block: "center" }); }
        }, 0);
      }
    } catch (e) { console.error(e); }
  }, [levels]);

  function handleSelectChapter(levelIndex, chapterIndex) {
    setSelected({ level: levelIndex, chapter: chapterIndex });
    setShowingChapter(true);
    setVideoWatched(false);
    sessionStorage.setItem("wk_lastSelection", JSON.stringify({ level: levelIndex, chapter: chapterIndex }));
    setLevels((prev) => prev.map((lvl, i) => i === levelIndex ? { ...lvl, open: true } : { ...lvl, open: false }));
    haptic();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleToggleLevel(index) {
    setLevels((prev) => prev.map((lvl, i) => i === index ? { ...lvl, open: !lvl.open } : { ...lvl, open: false }));
    haptic();
  }

  function handleExercise() {
    setLevels((prev) => {
      const copy = prev.map((lvl) => ({ ...lvl, chapters: [...lvl.chapters] }));
      const { level, chapter } = selected;
      copy[level].chapters[chapter].exerciseCompleted = true;
      copy[level].chapters[chapter].completed = true;
      saveProgress(copy);
      return copy;
    });
    haptic();
    const lvlNum = selected.level + 1;
    const chapNum = selected.chapter + 1;
    navigate(`/quiz?level=${lvlNum}&chapter=${chapNum}`, { state: { from: location.pathname } });
  }

  function handleNextChapter() {
    setLevels((prev) => {
      const { level, chapter } = selected;
      if (!prev[level].chapters[chapter + 1]) return prev;
      const newSelected = { level, chapter: chapter + 1 };
      setSelected(newSelected);
      setShowingChapter(true);
      setVideoWatched(false);
      sessionStorage.setItem("wk_lastSelection", JSON.stringify(newSelected));
      setTimeout(() => {
        const list = document.querySelector(`[data-level-index="${level}"]`);
        if (list) {
          const btn = list.querySelector(`[data-chapter-index="${chapter + 1}"]`);
          if (btn && btn.scrollIntoView) { btn.scrollIntoView({ behavior: "smooth", block: "center" }); }
        }
      }, 0);
      return prev;
    });
    haptic();
  }

  async function handleLogout() {
    sessionStorage.removeItem("wk_progress");
    sessionStorage.removeItem("wk_lastSelection");
    await supabase.auth.signOut();
    navigate("/login");
  }

  function handleFullscreen() {
    if (!isIOS()) {
      const el = document.documentElement;
      if (document.fullscreenElement) { document.exitFullscreen(); } 
      else if (el.requestFullscreen) { el.requestFullscreen(); }
    } else {
      alert("Fullscreen mode is not supported on iPhone/iPad. Please rotate your device manually.");
    }
    haptic();
  }

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontScale}rem`;
    if (typeof window !== "undefined") {
      localStorage.setItem("wk_fontScale", String(fontScale));
    }
  }, [fontScale]);

  function handleLogoClick() {
    setShowingChapter(false);
    setVideoWatched(false);
    haptic();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderTop() {
    if (!showingChapter || !levels.length) {
      const namePart = "Welcome to Soroban for School!";
      const subtitle = "Choose your Soroban book below, or enjoy the slideshow while you decide.";

      return (
        <div className="w-full max-w-5xl px-3">
          <div className="bg-white/95 rounded-3xl shadow-2xl px-4 py-4 md:px-8 md:py-6 border border-violet-100">
            <h1 className="text-left text-lg md:text-2xl font-bold text-violet-500 mb-2">
              {namePart}
            </h1>
            <p className="text-slate-500 text-sm md:text-base">{subtitle}</p>

            <div className="mt-4 flex flex-col md:flex-row gap-4 md:gap-6 items-center">
              <div className="w-full md:w-[520px] rounded-3xl shadow-xl border-2 border-violet-200 overflow-hidden bg-white">
                <img
                  src={slides[slideIdx]}
                  alt="Wonder Kids"
                  className="w-full h-[220px] md:h-80 object-cover transition-transform duration-700 ease-out scale-105"
                />
              </div>
              <div className="w-full md:flex-1 bg-violet-50 rounded-2xl shadow-inner px-4 py-3 text-sm md:text-base text-slate-600">
                <p className="font-semibold text-violet-600 mb-1">
                  Soroban Mastery Path
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Start from Book 1 for basics.</li>
                  <li>Each chapter unlocks new Soroban skills.</li>
                  <li>Progress is saved automatically on this device.</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-center gap-2 mt-3">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSlideIdx(i)}
                  className={`w-3 h-3 rounded-full border border-violet-300 shadow-sm transition ${
                    i === slideIdx ? "bg-pink-400 opacity-100" : "bg-blue-200 opacity-60"
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
    const titles = getLevelTitles(lvl);
    const customTitle = titles[chapIdx] || levels[lvl].chapters[chapIdx].title;
    const completed = levels[lvl].chapters[chapIdx].exerciseCompleted;

    const levelNum = lvl + 1;
    const chapterNum = chapIdx + 1;
    const videoUrl = `${VIDEO_BASE}/level${levelNum}-chapter${chapterNum}.mp4`;

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
               disablePictureInPicture
               className="w-full h-60 md:h-80 object-cover"
               onContextMenu={(e) => e.preventDefault()}
               onError={(e) => {
                 if (chapterNum > 21) return; // adjusted max chapter check
                 if (!e.target._tries) e.target._tries=0;
                 e.target._tries++;
                 if(e.target._tries >= 3) alert(lang==='th'?"ไม่พบวิดีโอ":"Video unavailable");
               }}
               onTimeUpdate={(e) => {
                if (e.target.currentTime >= 5) setVideoWatched(true);
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
              <span className="material-icons-outlined text-base md:text-lg mr-1">play_arrow</span>
              <span>{t.exercise}</span>
              {completed && <span className="ml-2">{checkSvg()}</span>}
            </button>
            
            <button
              onClick={handleNextChapter}
              className="inline-flex items-center justify-center px-5 py-2 rounded-2xl text-sm md:text-base font-bold shadow-md bg-blue-200 text-violet-700 transition active:scale-95"
            >
              <span className="material-icons-outlined text-base md:text-lg mr-1">navigate_next</span>
              <span>{t.next}</span>
              {completed && <span className="ml-2">{checkSvg()}</span>}
            </button>
          </div>
        </div>
      </div>
    );
  }

  function renderLevels() {
    if (!levels.length) return null;
    return (
      <div className="w-full flex justify-center mt-4 pb-8">
        <div className="w-full max-w-3xl px-3">
          <div className="rounded-3xl bg-white/80 shadow-xl border border-violet-100 pt-3 pb-3 space-y-3">
            {levels.map((lvl, i) => {
              const n = lvl.chapters.length;
              const done = lvl.chapters.filter((c) => c.exerciseCompleted).length;
              const progress = n > 0 ? Math.round((done / n) * 100) : 0;
              const book = bookIcons[i % bookIcons.length];
              const levelTitles = getLevelTitles(i);

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
                    <span className={`w-8 h-8 mr-3 rounded-lg flex items-center justify-center shadow-sm text-lg ${book.color}`}>
                      {book.icon}
                    </span>
                    <span className="font-bold mr-3">{lvl.name}</span>
                    <div className="flex-1 h-2 rounded-full bg-blue-100/60 relative mr-3 max-w-[110px]">
                      <div
                        className="h-full rounded-full bg-linear-to-r from-yellow-300 to-blue-300 shadow"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="text-xl">{lvl.open ? "▴" : "▾"}</span>
                  </button>

                  {lvl.open && (
                    <div className="flex flex-col gap-2 px-3 pb-3 pt-1 max-h-64 overflow-y-auto" data-level-index={i}>
                      {lvl.chapters.map((ch, j) => {
                        const isActive = showingChapter && selected.level === i && selected.chapter === j;
                        const displayTitle = levelTitles[j] || ch.title;
                        const baseClasses = "w-full flex items-center justify-between px-3 py-2 text-sm md:text-base font-semibold rounded-xl border shadow-sm cursor-pointer transition";
                        
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
                            <span className="text-left">{j+1}. {displayTitle.replace(/^Ch\.\s\d+\s/, '')}</span>
                            {ch.exerciseCompleted && (
                              <span className="ml-3 text-emerald-500">{checkSvg()}</span>
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

  function renderSettingsModal() {
    if (!settingsOpen) return null;
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <div className="relative bg-white w-[320px] flex flex-col gap-4 rounded-2xl shadow-2xl px-6 py-5 animate-scale-in">
          <button
            className="absolute top-2 right-2 w-9 h-9 rounded-full flex items-center justify-center text-2xl text-violet-400 hover:bg-violet-100"
            onClick={() => setSettingsOpen(false)}
          >
            ×
          </button>

          <div className="flex items-center justify-between mt-4">
            <label className="font-semibold mr-2 text-slate-700">{t.fontSize}</label>
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
            {t.logout}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#d8e9fa] font-[Nunito]">
      <div className="fixed top-3 left-4 right-4 z-20 flex items-center justify-between">
        <button onClick={handleLogoClick} className="flex items-center gap-2 bg-white/80 rounded-full px-3 py-1 shadow-md active:scale-95">
          <img src={logoImg} alt="Wonder Kids" className="w-7 h-7 rounded-full object-contain" />
          <span className="text-sm font-bold text-violet-600">{t ? t.appTitle : "Wonder Kids"}</span>
        </button>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => { toggleLang(); haptic(); }} 
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 shadow-sm border border-indigo-100 text-indigo-600 font-bold text-sm hover:scale-105 transition active:scale-95"
          >
            <span className="text-lg">{lang === 'en' ? '🇺🇸' : '🇹🇭'}</span>
            <span>{lang === 'en' ? 'EN' : 'TH'}</span>
          </button>

          <button onClick={() => { setSettingsOpen(true); haptic(); }} className="w-10 h-10 rounded-full bg-indigo-50 shadow flex items-center justify-center active:bg-pink-400 active:text-white">
            <span className="material-icons-outlined text-[22px] text-violet-500">settings</span>
          </button>
          <button onClick={handleFullscreen} className="w-10 h-10 rounded-full bg-indigo-50 shadow flex items-center justify-center active:bg-pink-400 active:text-white">
            <span className="material-icons-outlined text-[22px] text-violet-500">fullscreen</span>
          </button>
        </div>
      </div>

      <div className="pt-20 flex flex-col items-center">
        {renderTop()}
        {renderLevels()}
      </div>

      {renderSettingsModal()}
    </div>
  );
}

export default HomePage;