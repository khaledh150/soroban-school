import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../LanguageContext";

// Assets from shared sounds folder
import rouletteSoundFile from "../../assets/sounds/roulettewheel.mp3";
import winSoundFile from "../../assets/sounds/slot-machine-win-alert.wav";
import getReadySoundFile from "../../assets/sounds/readyGo.wav";
import buzzSoundFile from "../../assets/sounds/startbuzz.wav";
import beepSoundFile from "../../assets/sounds/Arcade-Attention-Beep.wav";

/* ------------------------------------------------------------------ */
/* CONSTANTS & UTILS                                                 */
/* ------------------------------------------------------------------ */

// Physics / Sizing Constants
const ITEM_HEIGHT = 220;
const REEL_VISIBLE_HEIGHT = 220;

function randomDate() {
  const year = 2000 + Math.floor(Math.random() * 25);
  const month = 1 + Math.floor(Math.random() * 12);
  let day = 1 + Math.floor(Math.random() * 28);

  if ([4, 6, 9, 11].includes(month)) day = Math.min(day, 30);
  if (month === 2) {
    const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
    day = Math.min(day, leap ? 29 : 28);
  } else if ([1, 3, 5, 7, 8, 10, 12].includes(month)) {
    day = Math.min(day, 31);
  }
  return { year, month, day };
}

function buildCalendar(year, month, day) {
  const firstDay = new Date(year, month - 1, 1).getDay();
  const lastDate = new Date(year, month, 0).getDate();
  const weeks = [];
  let d = 1;
  const firstRow = [];
  for (let i = 0; i < 7; i++) {
    if (i < firstDay) firstRow.push(null);
    else firstRow.push(d++);
  }
  weeks.push(firstRow);
  while (d <= lastDate) {
    const row = [];
    for (let i = 0; i < 7; i++) {
      if (d <= lastDate) row.push(d++);
      else row.push(null);
    }
    weeks.push(row);
  }
  return weeks;
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

/* ------------------------------------------------------------------ */
/* CONFETTI COMPONENT                                                */
/* ------------------------------------------------------------------ */
function Confetti({ active }) {
  if (!active) return null;
  return (
    <div className="absolute inset-0 pointer-events-none z-100 overflow-hidden">
      {Array.from({ length: 50 }).map((_, i) => {
        const left = Math.random() * 100 + "%";
        const delay = Math.random() * 0.5 + "s";
        const bg = ["#FF5733", "#33FF57", "#3357FF", "#F333FF", "#FF33A8"][Math.floor(Math.random() * 5)];
        return (
          <div
            key={i}
            className="absolute -top-2.5 w-3 h-3 rounded-sm animate-confetti"
            style={{
              left,
              backgroundColor: bg,
              animationDelay: delay,
              animationDuration: Math.random() * 2 + 2 + "s",
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
          />
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* REEL COMPONENT                                                    */
/* ------------------------------------------------------------------ */
function Reel({ items, targetValue, duration, loops, spinId }) {
  const [offset, setOffset] = useState(0);
  const [blur, setBlur] = useState(0);

  useEffect(() => {
    if (!targetValue) return;
    const baseIndex = items.findIndex((v) => v === targetValue);
    if (baseIndex === -1) return;

    const targetIndex = baseIndex + loops * items.length;
    const totalDistance = targetIndex * ITEM_HEIGHT;
    const start = performance.now();
    let frameId;

    const step = (now) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(t);
      let currentOffset = totalDistance * eased;

      if (t > 0.95) {
        const localT = (t - 0.95) / 0.05;
        const bounce = Math.sin(localT * Math.PI) * 15;
        currentOffset += bounce;
      }
      setOffset(currentOffset);

      if (t < 0.8) setBlur(4);
      else if (t < 0.95) setBlur((1 - (t - 0.8) / 0.15) * 4);
      else setBlur(0);

      if (t < 1) {
        frameId = requestAnimationFrame(step);
      } else {
        setOffset(totalDistance);
        setBlur(0);
      }
    };
    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [spinId, targetValue, items, duration, loops]);

  const repeated = useMemo(
    () => Array.from({ length: 30 }).map(() => items).flat(),
    [items]
  );

  return (
    <div
      className="relative w-full overflow-hidden bg-white shadow-[inset_0_0_40px_rgba(0,0,0,0.1)]"
      style={{ height: REEL_VISIBLE_HEIGHT }}
    >
      <div className="absolute inset-0 bg-linear-to-b from-black/20 via-transparent to-black/20 pointer-events-none z-20" />
      <div
        className="absolute left-0 w-full z-10 will-change-transform"
        style={{
          transform: `translateY(${-offset}px)`,
          filter: `blur(${blur}px)`,
        }}
      >
        {repeated.map((val, idx) => (
          <div
            key={`${idx}`}
            style={{ height: ITEM_HEIGHT }}
            className="flex items-center justify-center border-b border-slate-100"
          >
            <span
              className="text-8xl sm:text-9xl font-black text-slate-800"
              style={{
                fontFamily: "Inter, sans-serif",
                letterSpacing: "-0.05em",
                background: "-webkit-linear-gradient(top, #334155, #0f172a)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {val}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* MAIN COMPONENT                                                    */
/* ------------------------------------------------------------------ */

const CalendarGame = forwardRef(function CalendarGame(props, ref) {
  const navigate = useNavigate();
  const { lang, t } = useLanguage();

  const [yearType, setYearType] = useState("normal");
  const [phase, setPhase] = useState("settings");
  const [date, setDate] = useState(null);

  // Get Ready State
  const [readyText, setReadyText] = useState("");
  const [isReadyWord, setIsReadyWord] = useState(false);

  const [spinId, setSpinId] = useState(0);
  const [canShowAnswer, setCanShowAnswer] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [leverPulled, setLeverPulled] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Responsive / Rotation gate (Phone & Tablet only; never blocks desktop)
  const [isCoarsePointer, setIsCoarsePointer] = useState(false);
  const [isLandscape, setIsLandscape] = useState(true);
  const [vw, setVw] = useState(typeof window !== "undefined" ? window.innerWidth : 9999);
  const [rotateBlocked, setRotateBlocked] = useState(false);
  const [pendingStart, setPendingStart] = useState(false);

  // Audio Refs
  const audioRefs = useRef({
    roulette: new Audio(rouletteSoundFile),
    win: new Audio(winSoundFile),
    ready: new Audio(getReadySoundFile),
    buzz: new Audio(buzzSoundFile),
    beep: new Audio(beepSoundFile),
  });

  const timeoutsRef = useRef([]);
  const isMounted = useRef(true);

  useEffect(() => {
    const update = () => {
      const coarse =
        typeof window !== "undefined" &&
        window.matchMedia &&
        window.matchMedia("(pointer: coarse)").matches;

      setIsCoarsePointer(!!coarse);

      if (typeof window !== "undefined") {
        setIsLandscape(window.innerWidth >= window.innerHeight);
        setVw(window.innerWidth);
      }
    };

    update();
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  // Only require landscape on touch devices with small/medium screens (not PC)
  const isMobileOrTablet = isCoarsePointer && vw <= 1024;
  const landscapeRequiredNow = isMobileOrTablet && !isLandscape;

  const stopAllSounds = () => {
    Object.values(audioRefs.current).forEach(audio => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    });
  };

  const unlockAudio = () => {
    // Unlock HTML5 Audio elements
    Object.values(audioRefs.current).forEach(audio => {
      if (audio) {
        audio.play().then(() => audio.pause()).catch(() => {});
      }
    });

    // Unlock Web Speech API
    try {
      const unlock = new SpeechSynthesisUtterance(" ");
      unlock.volume = 0.01;
      window.speechSynthesis.speak(unlock);
    } catch (e) {
      // Silently fail if speech API not available
    }
  };

  // If user rotates to portrait during gameplay on mobile/tablet, stop and return to settings.
  useEffect(() => {
    if (!isMobileOrTablet) return;
    if (phase !== "settings" && !isLandscape) {
      clearTimers();
      stopAllSounds();
      setIsSpinning(false);
      setCanShowAnswer(false);
      setShowConfetti(false);
      setLeverPulled(false);
      setReadyText("");
      setDate(null);
      setPhase("settings");
      setRotateBlocked(true);
      setPendingStart(false);
    }
  }, [isMobileOrTablet, isLandscape, phase]);

  useEffect(() => {
    // Load all audio assets on mount to prevent PC playback delays
    Object.values(audioRefs.current).forEach(audio => {
      if (audio) audio.load();
    });
    audioRefs.current.roulette.volume = 0.6;
    audioRefs.current.roulette.loop = true;
  }, []);

  const clearTimers = () => {
    timeoutsRef.current.forEach((t) => clearTimeout(t));
    timeoutsRef.current = [];
  };
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      clearTimers();
    };
  }, []);

  const playSound = (key) => {
    try {
      const audio = audioRefs.current[key];
      if (!audio) return;
      audio.currentTime = 0;
      audio.play().catch(() => {});
    } catch { /* ignore */ }
  };

  const stopSound = (key) => {
    try {
      const audio = audioRefs.current[key];
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    } catch { /* ignore */ }
  };

  /* Logic */
  const displayYear = useMemo(() => {
    if (!date) return "";
    return yearType === "thai" ? date.year + 543 : date.year;
  }, [date, yearType]);

  const weekdayName = useMemo(() => {
    if (!date) return "";
    const d = new Date(date.year, date.month - 1, date.day);
    return t.weekdayFull[d.getDay()];
  }, [date, t]);

  const calendarWeeks = useMemo(() => {
    if (!date) return [];
    return buildCalendar(date.year, date.month, date.day);
  }, [date]);

  const pad2 = (n) => n.toString().padStart(2, "0");

  const dayItems = useMemo(() => Array.from({ length: 31 }, (_, i) => pad2(i + 1)), []);
  const monthItems = useMemo(() => Array.from({ length: 12 }, (_, i) => pad2(i + 1)), []);
  const yearItems = useMemo(() => Array.from({ length: 25 }, (_, i) => String((yearType === "thai" ? 543 : 0) + 2000 + i)), [yearType]);

  /* Flow */
  const triggerSpinSequence = () => {
     // Pull Lever first
     setLeverPulled(true);

     // Lever Animation is 300ms total.
     // At 50% (150ms), we start the spin logic.
     setTimeout(() => {
         setPhase("slot");
         setSpinId((prev) => prev + 1);
         setIsSpinning(true);
         setCanShowAnswer(false);
         setShowConfetti(false);
         playSound("roulette");

         const maxDuration = 5600;
         const id = setTimeout(() => {
           stopSound("roulette");
           playSound("beep");
           setCanShowAnswer(true);
           setIsSpinning(false);
         }, maxDuration + 200);
         timeoutsRef.current.push(id);

     }, 150); // 50% of lever pull

     // Snap back lever after animation
     setTimeout(() => setLeverPulled(false), 300);
  }


  const startRound = () => {
    // Unlock audio on user interaction
    unlockAudio();

    // Always request fullscreen on any device when clicking spin
    requestFullscreen();

    // Gate: On phone/tablet, require landscape BEFORE starting any sounds/logic
    if (landscapeRequiredNow) {
      setRotateBlocked(true);
      setPendingStart(true);
      return;
    }
    startRoundActual();
  };

  const resumeAfterRotate = () => {
    // User tap to continue (required to reliably unlock audio on mobile browsers)
    unlockAudio();
    setRotateBlocked(false);
    setPendingStart(false);
    startRoundActual();
  };


  // If user pressed start while blocked, do NOT auto-start on rotate (audio can be blocked without a tap).
  // We keep the rotate overlay up and require one user tap to continue so sounds reliably work.
  useEffect(() => {
    if (!rotateBlocked) return;
    if (!landscapeRequiredNow && !pendingStart) {
      setRotateBlocked(false);
    }
  }, [rotateBlocked, landscapeRequiredNow, pendingStart]);

  // Request fullscreen
  const requestFullscreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch(() => {});
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    }
  };

  const startRoundActual = () => {
    clearTimers();
    requestFullscreen();
    const d = randomDate();
    setDate(d);

    setPhase("getready");

    // EXACT clone from QuizPage showReadySetGo
    const seq = ["Get", "Ready", "3", "2", "1"];
    let i = 0;

    // Play sound FIRST (exactly like QuizPage)
    playSound("ready");

    const runSeq = () => {
        if (!isMounted.current) return;

        const text = seq[i];
        const isWord = text.length > 1;
        setReadyText(text);
        setIsReadyWord(isWord);

        const delays = [800, 800, 800, 800, 800];

        if (i < seq.length - 1) {
            const id = setTimeout(() => {
                i++;
                runSeq();
            }, delays[i]);
            timeoutsRef.current.push(id);
        } else {
            const id = setTimeout(() => {
                setReadyText("");
                // Wait 1000ms before triggering spin (exactly like QuizPage)
                const pauseId = setTimeout(() => {
                    playSound("buzz");
                    triggerSpinSequence();
                }, 1000);
                timeoutsRef.current.push(pauseId);
            }, delays[i]);
            timeoutsRef.current.push(id);
        }
    };
    runSeq();
  };

  const handleShowAnswer = () => {
    if (!canShowAnswer) return;
    playSound("win");
    setPhase("answer");
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };


  // Exit fullscreen helper
  const exitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else if (document.webkitFullscreenElement) {
      document.webkitExitFullscreen?.();
    }
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (document.fullscreenElement || document.webkitFullscreenElement) {
      exitFullscreen();
    } else {
      requestFullscreen();
    }
  };

  const handleExitToHome = () => {
    clearTimers();
    stopAllSounds();
    setIsSpinning(false);
    setCanShowAnswer(false);
    setShowConfetti(false);
    setLeverPulled(false);
    setReadyText("");
    setDate(null);
    setRotateBlocked(false);
    setPendingStart(false);

    // If in settings, go back to homepage; otherwise go to settings
    // Don't exit fullscreen when navigating - user can manually exit if needed
    if (phase === "settings") {
      navigate(-1);
    } else {
      setPhase("settings");
    }
  };

  const handleBackSettings = () => {
    clearTimers();
    stopSound("roulette");
    setPhase("settings");
    setIsSpinning(false);
    setShowConfetti(false);
  };

  useImperativeHandle(ref, () => ({
    openSettings: handleBackSettings,
  }));

  /* ------------------------------------------------------------------ */
  /* RENDER                                                            */
  /* ------------------------------------------------------------------ */

  return (
    <div className="w-full h-full flex flex-col items-center overflow-hidden relative">

      {/* BACK BUTTON (ALWAYS VISIBLE) */}
      <button
        onClick={handleExitToHome}
        className="
          fixed top-3 left-3 sm:top-5 sm:left-5 z-[999]
          w-12 h-12 sm:w-14 sm:h-14 rounded-full
          bg-white/90 backdrop-blur-md border border-white/70
          shadow-[0_12px_30px_rgba(0,0,0,0.18)]
          flex items-center justify-center
          hover:scale-105 active:scale-95 transition-all
        "
        aria-label="Back"
      >
        <span className="text-2xl sm:text-3xl font-black text-slate-900">←</span>
      </button>

      {/* Fullscreen Toggle Button - Top Right */}
      <button
        onClick={toggleFullscreen}
        className="
          fixed top-3 right-3 sm:top-5 sm:right-5 z-[999]
          w-12 h-12 sm:w-14 sm:h-14 rounded-full
          bg-white/90 backdrop-blur-md border border-white/70
          shadow-[0_12px_30px_rgba(0,0,0,0.18)]
          flex items-center justify-center
          hover:scale-105 active:scale-95 transition-all
        "
        aria-label="Fullscreen"
      >
        <span className="text-xl sm:text-2xl">⛶</span>
      </button>

      {/* ROTATE OVERLAY (Phone/Tablet only; blocks starting the game) */}
      {rotateBlocked && (
        <div className="fixed inset-0 z-[950] flex items-center justify-center bg-slate-900/90 backdrop-blur-md">
          <div className="text-center px-8">
            <div className="text-6xl sm:text-7xl mb-6">📱↻</div>
            <div className="text-3xl sm:text-4xl font-black text-white tracking-widest uppercase">
              {t.rotateDevice}
            </div>
            <div className="text-lg sm:text-xl text-slate-200 font-bold mt-3">
              {t.rotateHint}
            </div>
            <div className="text-sm sm:text-base text-slate-300 font-semibold mt-4 uppercase tracking-widest">
              {t.rotateCta}
            </div>
            {!landscapeRequiredNow && pendingStart && (
              <button
                onClick={resumeAfterRotate}
                className="
                  mt-6 px-10 py-4 rounded-full
                  bg-white text-slate-900 font-black text-lg sm:text-xl uppercase tracking-widest
                  shadow-[0_12px_30px_rgba(255,255,255,0.15)]
                  hover:scale-105 active:scale-95 transition-all
                "
              >
                {t.tapToStart}
              </button>
            )}
          </div>
        </div>
      )}



      <Confetti active={showConfetti} />

      {/* --- PHASE: SETTINGS --- */}
      {phase === "settings" && (
        <div className="flex-1 w-full flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500 pt-16">

          {/* Game Title - ABOVE Settings Panel */}
          <div className="mb-6 text-center">
            <h1 className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 bg-clip-text text-transparent drop-shadow-lg tracking-tight">
              📅 NADA CALENDAR
            </h1>
            <p className="text-lg sm:text-xl font-bold text-slate-500 mt-1 tracking-widest uppercase">
              Weekday Challenge
            </p>
          </div>

          <div className="
            bg-white/60 backdrop-blur-xl p-6 sm:p-8 rounded-[2.5rem]
            shadow-[0_20px_70px_rgba(0,0,0,0.15)] border border-white/50
            max-w-md w-full text-center flex flex-col gap-4
          ">

            <div className="flex flex-col items-center gap-2">
               <span className="text-slate-500 font-bold uppercase tracking-widest text-sm">
                 {t.yearFormat}
               </span>
               <div className="flex gap-4">
                 {['normal', 'thai'].map((type) => (
                   <button
                     key={type}
                     onClick={() => setYearType(type)}
                     className={`
                       px-8 py-3 rounded-2xl font-bold text-xl transition-all duration-300
                       ${yearType === type
                         ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30 scale-105'
                         : 'bg-white text-slate-400 hover:bg-slate-50'}
                     `}
                   >
                     {type === 'normal' ? t.normalYear : t.thaiYear}
                   </button>
                 ))}
               </div>
            </div>

            <button
              onClick={startRound}
              className="
                w-full py-5 rounded-2xl text-2xl font-black text-violet-700 uppercase tracking-widest
                bg-blue-200
                shadow-md
                hover:bg-blue-300
                hover:scale-[1.02] active:scale-95
                transition-all duration-300
              "
            >
              {t.spin}
            </button>
          </div>
        </div>
      )}

      {/* --- PHASE: GET READY (Same styling as QuizPage) --- */}
      {phase === "getready" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-md">
          <div
            className={`font-black text-pink-400 leading-none drop-shadow-[0_0_30px_rgba(253,144,215,0.6)] text-center ${isReadyWord ? 'ready-word' : 'ready-number'}`}
          >
            {readyText}
          </div>
        </div>
      )}

      {/* --- PHASE: SLOT MACHINE --- */}
      {(phase === "slot" || (phase === "answer" && date)) && (
        <div className="slot-container flex-1 w-full flex flex-col items-center justify-center gap-4 animate-in fade-in duration-500 pt-16">

          <div className="slot-label bg-white/80 backdrop-blur-sm px-8 py-3 rounded-full shadow-sm border border-white">
             <h2 className="text-2xl font-black text-slate-800 tracking-widest uppercase flex items-center gap-3">
               <span className="text-blue-500">❖</span>
               {phase === 'answer' ? t.complete : "NADA CALENDAR"}
               <span className="text-blue-500">❖</span>
             </h2>
          </div>

          {/* THE MACHINE */}
          <div className={`
             slot-machine-wrapper relative w-full max-w-6xl px-4 transition-transform duration-100
             ${isSpinning ? 'vibrate' : ''}
          `}>
             <div className="
               relative bg-slate-900 p-6 rounded-[3rem]
               shadow-[0_30px_80px_rgba(0,0,0,0.4),inset_0_2px_10px_rgba(255,255,255,0.1)]
               border-b-8 border-slate-950
             ">
                {/* Labels */}
                <div className="flex text-white font-bold text-sm tracking-widest mb-2 px-6">
                    <span className="flex-1 text-center text-blue-300">{t.day}</span>
                    <span className="flex-1 text-center text-blue-300">{t.month}</span>
                    <span className="flex-1 text-center text-blue-300">{t.year}</span>
                </div>

                <div className="bg-slate-800 p-4 rounded-[2.5rem] relative overflow-hidden ring-1 ring-white/5">
                   <div className="
                      bg-white relative rounded-4xl overflow-hidden
                      flex gap-1 shadow-[inset_0_0_50px_rgba(0,0,0,0.2)]
                      h-60
                   ">
                      <div className="absolute top-1/2 left-0 w-full h-24 -translate-y-1/2 bg-blue-500/5 pointer-events-none border-y border-blue-500/20 z-10" />

                      <div className="flex-1 relative border-r border-slate-100">
                         <Reel items={dayItems} targetValue={pad2(date.day)} duration={4000} loops={12} spinId={spinId} />
                      </div>
                      <div className="flex-1 relative border-r border-slate-100">
                         <Reel items={monthItems} targetValue={pad2(date.month)} duration={4800} loops={13} spinId={spinId} />
                      </div>
                      <div className="flex-1 relative">
                         <Reel items={yearItems} targetValue={String(displayYear)} duration={5600} loops={14} spinId={spinId} />
                      </div>
                   </div>
                </div>

                {/* LEVER */}
                <div className="absolute -right-4 sm:-right-12 top-1/2 -translate-y-1/2 h-64 w-16 pointer-events-none sm:pointer-events-auto flex flex-col items-center justify-center">
                    <div
                      className="w-4 h-48 bg-slate-700 rounded-full shadow-xl transition-all duration-300 ease-in-out origin-bottom relative"
                      style={{ transform: leverPulled ? 'rotateX(150deg) scaleY(0.9)' : 'rotateX(0deg)' }}
                    >
                       <div className="absolute -top-6 -left-4 w-12 h-12 rounded-full bg-linear-to-br from-blue-400 to-indigo-600 shadow-[0_0_20px_rgba(59,130,246,0.6)] ring-2 ring-white/30" />
                    </div>
                </div>
             </div>
          </div>

          <div className="reveal-btn-container flex items-center justify-center w-full py-2 sm:py-4">
            {phase === "slot" && (
                <button
                  onClick={handleShowAnswer}
                  disabled={!canShowAnswer}
                  className={`
                    px-10 sm:px-16 py-3 sm:py-5 rounded-2xl font-black text-xl sm:text-2xl tracking-widest uppercase transition-all duration-300
                    ${canShowAnswer
                      ? 'bg-pink-400 text-white shadow-md hover:scale-105 hover:bg-pink-500 animate-pulse-slow'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed scale-95 opacity-50'}
                  `}
                >
                  {t.reveal}
                </button>
            )}
          </div>
        </div>
      )}

      {/* --- PHASE: ANSWER REVEAL --- */}
      {phase === "answer" && date && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-lg p-4 sm:p-6 animate-in fade-in duration-500 pt-20 sm:pt-24 overflow-y-auto">

           <div className="
             answer-panel
             relative bg-white w-full max-w-2xl rounded-[2rem] sm:rounded-[3rem]
             shadow-[0_0_100px_rgba(59,130,246,0.2)]
             overflow-hidden flex flex-col items-center p-5 sm:p-10 gap-3 sm:gap-5 max-h-[calc(100vh-140px)] sm:max-h-[calc(100vh-190px)]
             animate-in zoom-in-95 duration-500 mb-4 sm:mb-8
           ">
              <div className="absolute top-0 left-0 w-full h-1 sm:h-2 bg-linear-to-r from-blue-500 via-purple-500 to-pink-500" />

              <div className="flex flex-col items-center">
                <span className="text-slate-400 font-bold uppercase tracking-widest text-xs sm:text-sm mb-1 sm:mb-2">{t.winningDate}</span>
                <h2 className="weekday-title text-2xl sm:text-5xl font-black text-slate-800 uppercase tracking-tight">
                  {weekdayName}
                </h2>
                <div className="date-display text-lg sm:text-2xl font-medium text-blue-600 mt-1 sm:mt-2 font-mono bg-blue-50 px-3 sm:px-4 py-1 rounded-lg">
                  {pad2(date.day)} / {pad2(date.month)} / {displayYear}
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="calendar-grid w-full bg-slate-50 rounded-2xl sm:rounded-3xl p-2 sm:p-5">
                 <table className="w-full text-center border-collapse">
                    <thead>
                       <tr>{t.weekdayShort.map(d => <th key={d} className="text-slate-400 text-[0.6rem] sm:text-base uppercase font-bold pb-1 sm:pb-3">{d}</th>)}</tr>
                    </thead>
                    <tbody>
                       {calendarWeeks.map((week, i) => (
                          <tr key={i}>
                             {week.map((cell, ci) => {
                                const isTarget = cell === date.day;
                                return (
                                   <td key={ci} className="p-0.5 sm:p-2">
                                      {cell && (
                                         <div
                                           className={`
                                             day-cell
                                             w-8 h-8 sm:w-14 sm:h-14 mx-auto flex items-center justify-center rounded-xl sm:rounded-2xl text-sm sm:text-2xl font-bold transition-all duration-500
                                             ${isTarget
                                               ? 'target bg-red-600 text-white shadow-xl shadow-red-600/40 scale-110 sm:scale-125 ring-2 sm:ring-4 ring-red-200 z-10 relative font-black animate-bounce'
                                               : 'text-slate-500 hover:bg-white hover:shadow-sm'}
                                           `}
                                           style={{
                                             animation: isTarget ? 'bounce 1s infinite' : 'popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
                                             animationDelay: isTarget ? '0s' : `${(i * 7 + ci) * 0.03}s`,
                                             opacity: isTarget ? 1 : 0,
                                             transform: isTarget ? 'scale(1.1)' : 'scale(0.5)'
                                           }}
                                         >
                                            {cell}
                                         </div>
                                      )}
                                   </td>
                                )
                             })}
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>

           {/* Play Again Button - Floating on phone landscape */}
           <button
              onClick={startRound}
              className="
                play-again-float
                mb-4 sm:mb-8 px-8 sm:px-10 py-3 sm:py-4 rounded-2xl bg-blue-200 text-violet-700 font-black text-lg sm:text-xl
                shadow-md
                hover:scale-105 hover:bg-blue-300 transition-all flex items-center gap-2 sm:gap-3
              "
           >
              <span>🔄</span> {t.playAgain}
           </button>
        </div>
      )}

      <style jsx>{`
        @keyframes vibrate {
          0% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(-2px, -2px); }
          60% { transform: translate(2px, 2px); }
          80% { transform: translate(2px, -2px); }
          100% { transform: translate(0); }
        }
        .vibrate {
          animation: vibrate 0.05s linear infinite;
        }
        @keyframes popIn {
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes confetti {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .animate-confetti {
          animation-name: confetti;
          animation-timing-function: linear;
          animation-fill-mode: forwards;
        }
        .animate-pulse-slow {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        /* Ready overlay - same sizing as QuizPage */
        .ready-number {
          font-size: clamp(10rem, 55vw, 25rem);
        }
        .ready-word {
          font-size: clamp(5rem, 20vw, 10rem);
        }
        @media (max-height: 600px) and (orientation: landscape) {
          .ready-number { font-size: 5rem; }
          .ready-word { font-size: 4rem; }
        }

        /* Phone landscape mode - slot machine must fit viewport */
        @media (max-height: 500px) and (orientation: landscape) {
          .slot-container {
            padding-top: 3.5rem !important;
            gap: 0 !important;
            justify-content: flex-start !important;
          }
          .slot-label {
            display: none !important;
          }
          .slot-machine-wrapper {
            transform: scale(0.75) scaleX(1.15) !important;
            transform-origin: top center !important;
            margin-top: 0.5rem !important;
            transition: none !important;
            max-width: 100vw !important;
            width: 95vw !important;
          }
          /* Floating reveal button - fixed bottom right, doesn't affect layout */
          .reveal-btn-container {
            position: fixed !important;
            bottom: 0.75rem !important;
            right: 0.75rem !important;
            width: auto !important;
            padding: 0 !important;
            margin: 0 !important;
            z-index: 100 !important;
          }
          .reveal-btn-container button {
            padding: 0.6rem 1.25rem !important;
            font-size: 0.8rem !important;
            border-radius: 9999px !important;
          }
          /* Results panel for phone landscape - compact to fit */
          .answer-panel {
            max-height: 90vh !important;
            height: auto !important;
            padding: 0.5rem 0.75rem !important;
            gap: 0.25rem !important;
            margin-top: 0 !important;
            padding-top: 3.5rem !important;
            background: transparent !important;
            box-shadow: none !important;
            border-radius: 0 !important;
          }
          .answer-panel .calendar-grid {
            padding: 0.25rem !important;
            background: white !important;
            border-radius: 1rem !important;
          }
          .answer-panel .calendar-grid td {
            padding: 0.1rem !important;
          }
          .answer-panel .calendar-grid .day-cell {
            width: 1.6rem !important;
            height: 1.6rem !important;
            font-size: 0.7rem !important;
            border-radius: 0.375rem !important;
          }
          .answer-panel .calendar-grid .day-cell.target {
            transform: scale(1.1) !important;
          }
          .answer-panel .weekday-title {
            font-size: 1.5rem !important;
            color: white !important;
            text-shadow: 0 2px 10px rgba(0,0,0,0.3) !important;
          }
          .answer-panel .date-display {
            font-size: 1rem !important;
            padding: 0.25rem 0.75rem !important;
            background: white !important;
            border-radius: 0.5rem !important;
          }
          /* Floating play again button */
          .play-again-float {
            position: fixed !important;
            bottom: 0.75rem !important;
            right: 0.75rem !important;
            z-index: 100 !important;
            margin: 0 !important;
            padding: 0.6rem 1.25rem !important;
            font-size: 0.8rem !important;
            border-radius: 9999px !important;
          }
          /* Bigger ready countdown for phone landscape */
          .ready-number {
            font-size: 8rem !important;
          }
          .ready-word {
            font-size: 6rem !important;
          }
        }

        /* Tablet landscape mode - move buttons to bottom-right */
        @media (min-width: 768px) and (max-width: 1024px) and (orientation: landscape) {
          .reveal-btn-container {
            position: fixed !important;
            bottom: 1.5rem !important;
            right: 1.5rem !important;
            width: auto !important;
            padding: 0 !important;
            margin: 0 !important;
            z-index: 100 !important;
          }
          .play-again-float {
            position: fixed !important;
            bottom: 1.5rem !important;
            right: 1.5rem !important;
            z-index: 100 !important;
            margin: 0 !important;
          }
        }
      `}</style>
    </div>
  );
});

export default CalendarGame;
