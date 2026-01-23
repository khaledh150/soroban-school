import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../LanguageContext";

// Import Audio Assets from shared sounds folder
import tickSound from "../../assets/sounds/tick.wav";
import dingSound from "../../assets/sounds/ding.wav";
import getReadySound from "../../assets/sounds/readyGo.wav";
import wrongSoundFile from "../../assets/sounds/wronganswer.wav";

/**
 * LOGIC: Generates random sets
 */
function generateRandomSets(numSets = 30, numbersPerSet = 9) {
  const sets = [];
  for (let i = 0; i < numSets; i++) {
    const set = [];
    let runningTotal = 0;

    for (let j = 0; j < numbersPerSet; j++) {
      let num;
      if (j === 0) {
        num = Math.floor(Math.random() * 90) + 10;
        runningTotal += num;
        set.push(num);
        continue;
      }
      const canSubtract = runningTotal > 20;
      if (Math.random() < 0.5 && canSubtract) {
        const maxSub = Math.min(89, runningTotal - 1);
        num = -(Math.floor(Math.random() * (maxSub - 10 + 1)) + 10);
      } else {
        num = Math.floor(Math.random() * 90) + 10;
      }
      runningTotal += num;
      set.push(num);
    }
    sets.push(set);
  }
  return sets;
}

const FlashcardGame = forwardRef(function FlashcardGame(props, ref) {
  const navigate = useNavigate();
  const { lang, t } = useLanguage();

  // --- SETTINGS ---
  const [speed, setSpeed] = useState(1.0);
  const [numbersPerSet, setNumbersPerSet] = useState(5);
  const [totalRounds, setTotalRounds] = useState(5);
  const [revealMode, setRevealMode] = useState("each");
  const [ttsEnabled, setTtsEnabled] = useState(true);

  // Voice State for Android Fix
  const [voices, setVoices] = useState([]);

  // --- GAME STATE ---
  const [phase, setPhase] = useState("settings");
  const [sets, setSets] = useState([]);
  const gameSetsRef = useRef([]);

  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [currentNumberIndex, setCurrentNumberIndex] = useState(0);
  const [readyText, setReadyText] = useState("");
  const [isReadyWord, setIsReadyWord] = useState(false);
  const [actualAnswer, setActualAnswer] = useState(null);

  // --- INPUT & SCORE ---
  const [userInput, setUserInput] = useState("");
  const [feedbackStatus, setFeedbackStatus] = useState(null);
  const [practiceHistory, setPracticeHistory] = useState([]);
  const [revealedSummaryCount, setRevealedSummaryCount] = useState(0);

  // --- AUDIO & REFS ---
  const audioRefs = useRef({
    tick: new Audio(tickSound),
    ding: new Audio(dingSound),
    wrong: new Audio(wrongSoundFile),
    ready: new Audio(getReadySound),
  });

  const intervalRef = useRef(null);
  const timeoutsRef = useRef([]);
  const isMounted = useRef(true);

  // GC FIX: Hold reference to current utterance
  const currentUtteranceRef = useRef(null);

  useEffect(() => {
    // Load all audio assets on mount to prevent PC playback delays
    Object.values(audioRefs.current).forEach(audio => {
      if (audio) audio.load();
    });
    // Volume adjustments
    if (audioRefs.current.tick) audioRefs.current.tick.volume = 0.7;
    if (audioRefs.current.ding) audioRefs.current.ding.volume = 1.0;
  }, []);

  const clearTimers = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    timeoutsRef.current.forEach((id) => clearTimeout(id));
    timeoutsRef.current = [];
  };

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      clearTimers();
      window.speechSynthesis.cancel();
    };
  }, []);

  // --- FORCE ANDROID VOICE LOADING ---
  useEffect(() => {
    const loadVoices = () => {
      const vs = window.speechSynthesis.getVoices();
      if (vs.length > 0) {
        setVoices(vs);
      }
    };

    // Try to load immediately
    loadVoices();

    // Android Chrome loads voices asynchronously, so we must listen for this event
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // --- TTS ENGINE (Optimized for sync with flashing numbers) ---
  const speakNumber = useCallback((num, onComplete) => {
    if (!ttsEnabled || !isMounted.current) {
      // If TTS is disabled, call the callback immediately
      onComplete && onComplete();
      return;
    }

    window.speechSynthesis.cancel();

    // Build speech text - just the number with plus/minus
    let spokenText;
    if (lang === 'th') {
      if (num >= 0) spokenText = `บวก ${Math.abs(num)}`;
      else spokenText = `ลบ ${Math.abs(num)}`;
    } else {
      if (num >= 0) spokenText = `Plus ${Math.abs(num)}`;
      else spokenText = `Minus ${Math.abs(num)}`;
    }

    const utterance = new SpeechSynthesisUtterance(spokenText);
    utterance.rate = 1.3; // Faster rate to keep up with flashing
    utterance.lang = lang === 'th' ? 'th-TH' : 'en-US';

    // Find preferred voice
    const preferredVoice = voices.find(v =>
      lang === 'th'
        ? (v.lang === "th-TH" || v.lang === "th_TH")
        : (v.name.includes("Google US English") || v.lang === "en-US" || v.lang === "en_US")
    );

    if (preferredVoice) {
      utterance.voice = preferredVoice;
      utterance.lang = preferredVoice.lang;
    }

    // Bind ref to prevent Garbage Collection
    currentUtteranceRef.current = utterance;
    utterance.onend = () => {
      currentUtteranceRef.current = null;
      onComplete && onComplete();
    };
    utterance.onerror = () => {
      currentUtteranceRef.current = null;
      onComplete && onComplete();
    };

    // Speak immediately
    window.speechSynthesis.speak(utterance);
  }, [ttsEnabled, lang, voices]);

  // Speak "equals" at the end of flashing
  const speakEquals = useCallback(() => {
    if (!ttsEnabled || !isMounted.current) return;

    window.speechSynthesis.cancel();

    const spokenText = lang === 'th' ? 'เท่ากับ' : 'Equals';
    const utterance = new SpeechSynthesisUtterance(spokenText);
    utterance.rate = 1.2;
    utterance.lang = lang === 'th' ? 'th-TH' : 'en-US';

    const preferredVoice = voices.find(v =>
      lang === 'th'
        ? (v.lang === "th-TH" || v.lang === "th_TH")
        : (v.name.includes("Google US English") || v.lang === "en-US" || v.lang === "en_US")
    );

    if (preferredVoice) {
      utterance.voice = preferredVoice;
      utterance.lang = preferredVoice.lang;
    }

    currentUtteranceRef.current = utterance;
    utterance.onend = () => { currentUtteranceRef.current = null; };
    window.speechSynthesis.speak(utterance);
  }, [ttsEnabled, lang, voices]);


  const playSound = useCallback((name) => {
    try {
      const audio = audioRefs.current[name];
      if (audio) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      }
    } catch (e) { console.error(e); }
  }, []);

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

  // --- GAME LOGIC ---

  const startSequenceForSet = (targetIndex) => {
    clearTimers();

    setCurrentSetIndex(targetIndex);
    setCurrentNumberIndex(0);
    setActualAnswer(null);
    setUserInput("");
    setFeedbackStatus(null);
    setPhase("getready");

    const nps = Math.max(1, Math.min(numbersPerSet, 20));
    const currentSetNumbers = gameSetsRef.current[targetIndex];

    if (currentSetNumbers) {
       const ans = currentSetNumbers.slice(0, nps).reduce((a, b) => a + b, 0);
       setActualAnswer(ans);
    }

    // EXACT clone from QuizPage showReadySetGo
    const seq = ["Get", "Ready", "3", "2", "1"];
    let i = 0;

    // Play sound after a tiny delay to avoid race condition with unlockAudio's pause callback
    const soundId = setTimeout(() => playSound("ready"), 50);
    timeoutsRef.current.push(soundId);

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
                // Wait 1000ms before starting flash (exactly like QuizPage)
                const pauseId = setTimeout(() => {
                    startFlashing(targetIndex);
                }, 1000);
                timeoutsRef.current.push(pauseId);
            }, delays[i]);
            timeoutsRef.current.push(id);
        }
    };
    runSeq();
  };

  const startFlashing = (forcedIndex) => {
    setPhase("playing");
    const nps = Math.max(1, Math.min(numbersPerSet, 20));

    if (!gameSetsRef.current[forcedIndex]) return;

    let currentIdx = 0;

    const flashNext = () => {
      if (!isMounted.current) return;

      if (currentIdx >= nps) {
        // END OF SET - Speak "equals" after flashing numbers
        speakEquals();

        // Transition to input immediately to show the "?" in the input box
        const id = setTimeout(() => {
          if (isMounted.current) setPhase("input");
        }, 200);
        timeoutsRef.current.push(id);
        return;
      }

      const num = gameSetsRef.current[forcedIndex][currentIdx];
      const flashStartTime = performance.now();
      const targetDelay = Math.max(speed, 0.4) * 1000;

      // Update display
      setCurrentNumberIndex(currentIdx);

      // Play tick sound
      playSound("tick");

      // Speak number and wait for speech to finish before continuing
      speakNumber(num, () => {
        if (!isMounted.current) return;

        // Calculate remaining time based on speed setting
        const elapsed = performance.now() - flashStartTime;
        const remainingDelay = Math.max(0, targetDelay - elapsed);

        currentIdx++;
        const id = setTimeout(flashNext, remainingDelay);
        timeoutsRef.current.push(id);
      });
    };

    // Start flashing sequence
    flashNext();
  };

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

  const handleStart = () => {
    // Unlock audio on user interaction
    unlockAudio();

    // Request fullscreen
    requestFullscreen();

    const nps = Math.max(1, Math.min(numbersPerSet, 20));
    const generated = generateRandomSets(totalRounds + 5, nps);

    setSets(generated);
    gameSetsRef.current = generated;

    setPracticeHistory([]);
    startSequenceForSet(0);
  };

  // --- INPUT LOGIC ---

  const handleKeypadPress = (val) => {
    if (val === "DEL") {
      setUserInput(prev => prev.slice(0, -1));
    } else if (val === "ENTER") {
      handleSubmitAnswer();
    } else {
      if (userInput.length < 6) setUserInput(prev => prev + val);
    }
  };

  const handleKeyDown = (e) => {
    if (phase !== "input") return;
    const key = e.key;
    if (!isNaN(key)) {
        if (userInput.length < 6) setUserInput(prev => prev + key);
    } else if (key === "Backspace") {
        setUserInput(prev => prev.slice(0, -1));
    } else if (key === "Enter") {
        handleSubmitAnswer();
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [phase, userInput]);

  const handleSubmitAnswer = () => {
    if (userInput === "" && revealMode === "each") return; // Only require input in practice mode

    const userInt = userInput ? parseInt(userInput, 10) : null;
    const isCorrect = userInt === actualAnswer;

    setPracticeHistory(prev => [...prev, {
        setIndex: currentSetIndex,
        userAnswer: userInt,
        correctAnswer: actualAnswer,
        isCorrect: isCorrect
    }]);

    if (revealMode === "each") {
        if (isCorrect) {
            setFeedbackStatus("correct");
            playSound("ding");
            // No speech for correct/wrong - dictation only for numbers
        } else {
            setFeedbackStatus("wrong");
            playSound("wrong");
            // No speech for correct/wrong - dictation only for numbers
        }
        setPhase("feedback");
        // Auto-advance after showing feedback (like quiz logic)
        const feedbackDelay = isCorrect ? 1200 : 2000; // Longer delay for wrong to show correct answer
        const autoAdvanceId = setTimeout(() => {
            handleNextRound(true);
        }, feedbackDelay);
        timeoutsRef.current.push(autoAdvanceId);
    }
    // Competition mode doesn't auto-advance - user clicks Next/Results button
  };

  // Handle competition mode next/results navigation
  const handleCompetitionNext = () => {
    // Record current round (no user answer in competition mode)
    setPracticeHistory(prev => [...prev, {
        setIndex: currentSetIndex,
        userAnswer: null,
        correctAnswer: actualAnswer,
        isCorrect: false // Not applicable in competition
    }]);

    const nextIdx = currentSetIndex + 1;
    if (nextIdx < totalRounds) {
        startSequenceForSet(nextIdx);
    } else {
        startSummarySequence();
    }
  };

  // --- NAVIGATION ---

  // Start next round without the ready overlay (for practice mode auto-advance)
  const startNextRoundDirectly = (targetIndex) => {
    clearTimers();
    setPhase("playing"); // Set phase immediately to prevent feedback from showing new answer
    setCurrentSetIndex(targetIndex);
    setCurrentNumberIndex(0);
    setActualAnswer(null);
    setUserInput("");
    setFeedbackStatus(null);

    const nps = Math.max(1, Math.min(numbersPerSet, 20));
    const currentSetNumbers = gameSetsRef.current[targetIndex];

    if (currentSetNumbers) {
       const ans = currentSetNumbers.slice(0, nps).reduce((a, b) => a + b, 0);
       setActualAnswer(ans);
    }

    // Small delay then start flashing directly
    const id = setTimeout(() => {
      startFlashing(targetIndex);
    }, 500);
    timeoutsRef.current.push(id);
  };

  const handleNextRound = (autoAdvance = false) => {
    const nextIdx = currentSetIndex + 1;
    if (nextIdx < totalRounds) {
        // In practice mode, skip the ready overlay for subsequent rounds
        if (revealMode === "each" && autoAdvance) {
            startNextRoundDirectly(nextIdx);
        } else {
            startSequenceForSet(nextIdx);
        }
    } else {
        startSummarySequence();
    }
  };

  const startSummarySequence = () => {
    setPhase("summary");
    setRevealedSummaryCount(0);

    sets.slice(0, totalRounds).forEach((_, idx) => {
        setTimeout(() => {
            setRevealedSummaryCount(prev => prev + 1);
            playSound("ding");
        }, (idx + 1) * 600);
    });
  };

  const handleBackToSettings = () => {
    clearTimers();
    setPhase("settings");
    setActualAnswer(null);
    setCurrentNumberIndex(0);
    setRevealedSummaryCount(0);
    gameSetsRef.current = [];
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

  const goToMainMenu = () => {
    clearTimers();
    window.speechSynthesis.cancel();
    // If in settings, go back to homepage; otherwise go to settings
    // Don't exit fullscreen when navigating - user can manually exit if needed
    if (phase === "settings") {
      navigate(-1);
    } else {
      handleBackToSettings();
    }
  }

  useImperativeHandle(ref, () => ({
    openSettings: handleBackToSettings,
  }));

  // --- RENDER HELPERS ---
  const currentSet = gameSetsRef.current[currentSetIndex] || [];

  const renderDisplayContent = () => {
    if (phase === "settings" || phase === "getready" || !currentSet.length) return null;

    const val = currentSet[currentNumberIndex];

    const numberSize = { fontSize: 'clamp(18rem, 40vw, 20rem)' };
    const minusSize = { fontSize: 'clamp(10rem, 15vw, 8rem)' };

    return (
      <div
        key={`${currentSetIndex}-${currentNumberIndex}`}
        className="flex flex-col items-center justify-center relative w-full h-full"
      >
        <div className="flex items-center justify-center w-[90vw] h-full text-center">
            {val < 0 && (
              <span className="font-black text-red-500 mr-2 self-center leading-none" style={minusSize}>
                 −
              </span>
            )}

            <span
              className={`
                font-black tracking-tighter leading-none
                ${val < 0 ? 'text-red-500' : 'text-slate-800'}
                drop-shadow-2xl filter
              `}
              style={numberSize}
            >
              {Math.abs(val)}
            </span>
        </div>
      </div>
    );
  };

  // --- JSX RENDER ---
  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative select-none bg-slate-50 overflow-hidden">

      {/* Back Button - Always Visible */}
      <button
        onClick={goToMainMenu}
        className="fixed top-3 left-3 sm:top-5 sm:left-5 z-[999] w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/90 backdrop-blur-md border border-white/70 shadow-[0_12px_30px_rgba(0,0,0,0.18)] flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
        aria-label="Back"
      >
        <span className="text-2xl sm:text-3xl font-black text-slate-900">←</span>
      </button>

      {/* Fullscreen Toggle Button - Top Right */}
      <button
        onClick={toggleFullscreen}
        className="fixed top-3 right-3 sm:top-5 sm:right-5 z-[999] w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/90 backdrop-blur-md border border-white/70 shadow-[0_12px_30px_rgba(0,0,0,0.18)] flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
        aria-label="Fullscreen"
      >
        <span className="text-xl sm:text-2xl">⛶</span>
      </button>

      {/* Title / Round Indicator - MOVED TO BOTTOM */}
      {phase !== "settings" && phase !== "summary" && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-2 bg-white/80 backdrop-blur-md rounded-full border border-slate-200 shadow-md z-30">
          <h2 className="text-sm sm:text-lg font-black text-slate-700 tracking-widest uppercase flex items-center gap-2 whitespace-nowrap">
            {`${t.rounds} ${currentSetIndex + 1} / ${totalRounds}`}
          </h2>
        </div>
      )}

      {/* --- PHASE: SETTINGS --- */}
      {phase === "settings" && (
        <div className="flex-1 w-full flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300 px-4 pt-16 pb-4 overflow-y-auto">

          {/* Game Title - ABOVE Settings Panel */}
          <div className="mb-6 text-center">
            <h1 className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-pink-500 via-violet-500 to-blue-500 bg-clip-text text-transparent drop-shadow-lg tracking-tight">
              ⚡ FLASHCARD
            </h1>
            <p className="text-lg sm:text-xl font-bold text-slate-500 mt-1 tracking-widest uppercase">
              {t.modePractice}
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur-xl p-6 sm:p-8 rounded-[2.5rem] shadow-xl border border-white max-w-lg w-full flex flex-col gap-4">

            <div className="grid grid-cols-2 gap-4">
                {/* Speed */}
                <div className="bg-slate-50 p-3 rounded-2xl">
                   <label className="text-slate-400 font-bold text-xs uppercase ml-1 block mb-1">{t.speedSec}</label>
                   <div className="flex items-center justify-center">
                      <input
                         type="number" min={0.3} max={5} step={0.1}
                         value={speed} onChange={(e) => setSpeed(Number(e.target.value))}
                         className="w-full bg-transparent text-center text-2xl font-black text-slate-800 focus:outline-none"
                      />
                   </div>
                </div>
                {/* Rounds */}
                <div className="bg-slate-50 p-3 rounded-2xl">
                   <label className="text-slate-400 font-bold text-xs uppercase ml-1 block mb-1">{t.rounds}</label>
                   <div className="flex items-center justify-between">
                      <button onClick={() => setTotalRounds(Math.max(1, totalRounds - 1))} className="w-8 h-8 rounded-lg bg-white text-violet-600 font-bold shadow-sm">-</button>
                      <span className="text-2xl font-black text-slate-800">{totalRounds}</span>
                      <button onClick={() => setTotalRounds(Math.min(50, totalRounds + 1))} className="w-8 h-8 rounded-lg bg-white text-violet-600 font-bold shadow-sm">+</button>
                   </div>
                </div>
            </div>

            {/* Num Per Set */}
            <div className="bg-slate-50 p-3 rounded-2xl">
               <label className="text-slate-400 font-bold text-xs uppercase ml-1 block mb-1">{t.numbersPerSet}</label>
               <div className="flex items-center justify-between px-4">
                  <button onClick={() => setNumbersPerSet(Math.max(1, numbersPerSet - 1))} className="w-10 h-10 rounded-xl bg-white text-xl font-bold text-violet-600 shadow-sm">-</button>
                  <span className="text-3xl font-black text-slate-800">{numbersPerSet}</span>
                  <button onClick={() => setNumbersPerSet(Math.min(20, numbersPerSet + 1))} className="w-10 h-10 rounded-xl bg-white text-xl font-bold text-violet-600 shadow-sm">+</button>
               </div>
            </div>

            {/* Mode & TTS */}
            <div className="flex gap-3">
               <div className="flex-1 bg-slate-50 p-3 rounded-2xl flex flex-col gap-2">
                  <label className="text-slate-400 font-bold text-xs uppercase ml-1">{t.mode}</label>
                  <button onClick={() => setRevealMode(revealMode === 'each' ? 'end' : 'each')} className="flex-1 bg-white rounded-xl font-bold text-violet-700 shadow-sm py-2 text-sm border-2 border-violet-100">
                      {revealMode === 'each' ? t.modePractice : t.modeCompetition}
                  </button>
               </div>
               <div className="w-1/3 bg-slate-50 p-3 rounded-2xl flex flex-col gap-2">
                  <label className="text-slate-400 font-bold text-xs uppercase ml-1">{t.voice}</label>
                  <button onClick={() => setTtsEnabled(!ttsEnabled)} className={`flex-1 rounded-xl font-bold shadow-sm py-2 text-xl ${ttsEnabled ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-400'}`}>
                      {ttsEnabled ? '🔊' : '🔇'}
                  </button>
               </div>
            </div>

            <button
              onClick={handleStart}
              className="mt-2 w-full py-4 rounded-2xl text-2xl font-black text-violet-700 uppercase tracking-widest bg-blue-200 shadow-md hover:bg-blue-300 hover:scale-[1.02] active:scale-95 transition-all"
            >
              {t.startGame}
            </button>
          </div>
        </div>
      )}

      {/* --- PHASE: GET READY (Same styling as QuizPage) --- */}
      {phase === "getready" && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-md">
           <div
             className={`font-black text-pink-400 leading-none drop-shadow-[0_0_30px_rgba(253,144,215,0.6)] text-center ${isReadyWord ? 'ready-word' : 'ready-number'}`}
           >
             {readyText}
           </div>
        </div>
      )}

      {/* --- PHASE: SUMMARY --- */}
      {phase === "summary" && (
        <div className="flex-1 w-full h-full flex flex-col items-center justify-center animate-in fade-in duration-500 px-2 overflow-hidden">
            <div className="w-full max-w-4xl bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-2xl p-6 flex flex-col max-h-[90vh]">
                <h3 className="text-center text-2xl font-black text-slate-800 mb-4 uppercase border-b pb-2 shrink-0">{t.summary}</h3>

                <div className="flex-1 overflow-y-auto pr-2 space-y-3 no-scrollbar">
                    {practiceHistory.map((item, idx) => {
                        const setNums = sets[idx];
                        const nps = Math.max(1, Math.min(numbersPerSet, 20));
                        const equationStr = setNums.slice(0, nps).map((n, i) => (n >= 0 && i > 0 ? `+${n}` : n)).join(' ');
                        const isRevealed = revealedSummaryCount > idx;

                        return (
                            <div
                              key={idx}
                              className={`flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 shadow-sm transition-all duration-500 ${isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                              style={{ transitionDelay: `${idx * 100}ms` }}
                            >
                                <div className="flex flex-col gap-1 overflow-hidden">
                                    <div className="flex items-center gap-3">
                                        <span className={`text-white font-black w-8 h-8 flex shrink-0 items-center justify-center rounded-full shadow-md ${revealMode === "each" ? (item.isCorrect ? 'bg-blue-500' : 'bg-red-500') : 'bg-blue-500'}`}>
                                            {idx + 1}
                                        </span>
                                        <span className="font-mono text-sm sm:text-lg text-slate-500 font-bold truncate">
                                           {equationStr} =
                                        </span>
                                    </div>
                                    {revealMode === "each" && item.userAnswer !== null && (
                                      <div className="flex gap-4 ml-11 text-xs sm:text-sm font-bold">
                                          <span className="text-slate-400">YOU: <span className={`${item.isCorrect ? 'text-green-600' : 'text-red-500'}`}>{item.userAnswer}</span></span>
                                      </div>
                                    )}
                                </div>
                                <div className="text-2xl sm:text-3xl font-black w-24 text-right shrink-0">
                                    {isRevealed ? (
                                        <span className="text-emerald-500 animate-pop-in inline-block">
                                            {item.correctAnswer}
                                        </span>
                                    ) : (
                                        <span className="text-slate-200">...</span>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Footer Buttons */}
                {revealedSummaryCount >= practiceHistory.length && (
                    <div className="flex flex-col gap-3 mt-4 shrink-0 animate-in slide-in-from-bottom-4 fade-in duration-500">
                       <button onClick={handleStart} className="w-full py-4 rounded-2xl bg-blue-200 text-violet-700 font-black text-xl shadow-md hover:bg-blue-300 active:scale-95 transition-all">
                          {t.playAgain}
                       </button>
                       <button onClick={handleBackToSettings} className="w-full py-3 rounded-xl bg-blue-100 text-violet-600 font-bold active:scale-95 transition-all">
                          {t.mainMenu}
                       </button>
                    </div>
                )}
            </div>
        </div>
      )}

      {/* --- PHASE: PLAYING (FLASHING) --- */}
      {phase === "playing" && (
        <div className="flex-1 w-full flex flex-col items-center justify-center pb-12">
             <div className="relative z-20 w-full h-full flex justify-center">
                {renderDisplayContent()}
             </div>

             {/* Progress Dots */}
             <div className="absolute bottom-24 sm:bottom-20 left-1/2 -translate-x-1/2 flex gap-3 z-30">
               {Array.from({length: Math.max(1, Math.min(numbersPerSet, 20))}).map((_, i) => (
                 <div
                   key={i}
                   className={`h-3 w-3 sm:h-4 sm:w-4 rounded-full transition-all duration-200 ${i <= currentNumberIndex ? 'bg-violet-500 scale-125' : 'bg-slate-300'}`}
                 />
               ))}
             </div>
        </div>
      )}

      {/* --- PHASE: INPUT (KEYPAD for practice, NEXT/RESULTS for competition) --- */}
      {phase === "input" && (
         <div className="flex-1 w-full h-full flex flex-col items-center justify-center animate-in slide-in-from-bottom-10 fade-in duration-300">
            {revealMode === "each" ? (
              <>
                {/* Practice Mode: Display Input + Keypad */}
                <div className="mb-6 w-full max-w-xs sm:max-w-sm px-4">
                   <div className="bg-white rounded-2xl border-4 border-violet-100 h-20 sm:h-24 flex items-center justify-center shadow-inner">
                      <span className="text-5xl sm:text-6xl font-black text-slate-800">{userInput || <span className="text-slate-200">?</span>}</span>
                   </div>
                </div>

                {/* Keypad */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full max-w-xs sm:max-w-sm px-4">
                   {[7, 8, 9, 4, 5, 6, 1, 2, 3].map(num => (
                      <button key={num} onClick={() => handleKeypadPress(num)} className="h-14 sm:h-16 bg-white rounded-xl shadow-md text-3xl font-bold text-slate-700 active:bg-slate-100 active:scale-95 transition-all">
                         {num}
                      </button>
                   ))}
                   <button onClick={() => handleKeypadPress(0)} className="col-span-2 h-14 sm:h-16 bg-white rounded-xl shadow-md text-3xl font-bold text-slate-700 active:bg-slate-100 active:scale-95 transition-all">0</button>
                   <button onClick={() => handleKeypadPress("DEL")} className="h-14 sm:h-16 bg-red-50 rounded-xl shadow-md text-xl font-bold text-red-500 active:scale-95 transition-all">DEL</button>
                </div>

                <button onClick={handleSubmitAnswer} className="mt-6 w-full max-w-xs sm:max-w-sm px-4 py-4 rounded-2xl bg-pink-400 text-white font-black text-2xl shadow-md hover:bg-pink-500 active:scale-95 transition-all">
                   {t.submit}
                </button>
              </>
            ) : (
              <>
                {/* Competition Mode: Show ? and Next/Results button */}
                <div className="mb-8 w-full max-w-xs sm:max-w-sm px-4">
                   <div className="bg-white rounded-3xl border-4 border-violet-100 h-32 sm:h-40 flex items-center justify-center shadow-inner">
                      <span className="text-8xl sm:text-9xl font-black text-slate-200">?</span>
                   </div>
                </div>

                <button
                  onClick={handleCompetitionNext}
                  className="w-full max-w-xs sm:max-w-sm px-4 py-5 rounded-2xl bg-pink-400 text-white font-black text-2xl shadow-md hover:bg-pink-500 active:scale-95 transition-all uppercase tracking-widest"
                >
                   {currentSetIndex + 1 >= totalRounds ? t.summary : t.nextSet}
                </button>
              </>
            )}
         </div>
      )}

      {/* --- PHASE: FEEDBACK (Practice Result) --- */}
      {phase === "feedback" && (
         <div className="flex-1 w-full flex flex-col items-center justify-center pb-12">
             {/* All elements in ONE container - they all appear/disappear together */}
             <div className="feedback-container flex flex-col items-center justify-center">
                 {feedbackStatus === 'correct' ? (
                   <>
                     {/* CORRECT: Green tick and CORRECT text */}
                     <div className="font-black drop-shadow-2xl text-green-500" style={{ fontSize: 'min(28vh, 45vw)' }}>
                         ✓
                     </div>
                     <h2 className="text-5xl sm:text-6xl font-black text-green-500 mt-2 uppercase tracking-wider">
                         {t.correct}
                     </h2>
                   </>
                 ) : (
                   <>
                     {/* WRONG: Red X, WRONG text, and correct answer */}
                     <div className="font-black drop-shadow-2xl text-red-500" style={{ fontSize: 'min(28vh, 45vw)' }}>
                         ✗
                     </div>
                     <h2 className="text-5xl sm:text-6xl font-black text-red-500 mt-2 uppercase tracking-wider">
                         {t.wrong}
                     </h2>
                     <div className="mt-4 flex flex-col items-center">
                        <span className="text-lg text-slate-400 font-bold uppercase tracking-widest">{t.answerWas}</span>
                        <span className="text-5xl sm:text-6xl font-black text-emerald-500 mt-1">
                           {actualAnswer}
                        </span>
                     </div>
                   </>
                 )}
             </div>
         </div>
      )}

      {/* CSS Utility for hidden scrollbar and ready overlay */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes popIn {
          0% { transform: scale(0.5); opacity: 0; }
          60% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-pop-in {
          animation: popIn 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        /* Feedback container - all elements animate together */
        .feedback-container {
          animation: feedbackIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        @keyframes feedbackIn {
          0% { transform: scale(0.5); opacity: 0; }
          60% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
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
      `}</style>
    </div>
  );
});

export default FlashcardGame;
