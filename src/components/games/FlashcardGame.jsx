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

  // --- TTS ENGINE (Using same pattern as QuizPage for smooth dictation) ---
  const speakText = useCallback((text, type = 'number') => {
    if (!ttsEnabled || !isMounted.current) return;

    window.speechSynthesis.cancel();

    let spokenText = text;

    if (text === 'equals') {
      spokenText = lang === 'th' ? 'เท่ากับ' : 'Equals';
    } else if (lang === 'th') {
      if (type === 'op') {
        spokenText = text.replace('+', 'บวก ').replace('-', 'ลบ ');
      }
    } else {
      if (type === 'op') {
        spokenText = text.replace('+', 'Plus ').replace('-', 'Minus ');
      }
    }

    const utterance = new SpeechSynthesisUtterance(spokenText);
    utterance.rate = 1.1;
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
    utterance.onend = () => { currentUtteranceRef.current = null; };
    utterance.onerror = (e) => { console.error("TTS Error:", e); };

    // Small delay helps Android clear the previous audio buffer
    setTimeout(() => window.speechSynthesis.speak(utterance), 10);
  }, [ttsEnabled, lang, voices]);

  const speakNumber = useCallback((num) => {
    let text = "";
    if (num >= 0) text = `+ ${Math.abs(num)}`;
    else text = `- ${Math.abs(num)}`;
    speakText(text, 'op');
  }, [speakText]);

  const playSound = (name) => {
    try {
      const audio = audioRefs.current[name];
      if (audio) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      }
    } catch (e) { console.error(e); }
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

    // 1. Play the long audio file ONCE. This keeps the engine awake.
    playSound("ready");

    // 2. Visual Sequence Logic
    const seq = ["GET", "READY", "3", "2", "1", "GO!"];
    let i = 0;

    const runSeq = () => {
        if (!isMounted.current) return;

        const text = seq[i];
        setReadyText(text);

        const isGo = i === seq.length - 1;
        const duration = isGo ? 900 : 700;

        if (!isGo) {
            const id = setTimeout(() => {
                i++;
                runSeq();
            }, duration);
            timeoutsRef.current.push(id);
        } else {
            const id = setTimeout(() => {
                setReadyText("");

                // EXTRA PAUSE: 1 Second before flashing starts
                const pauseId = setTimeout(() => {
                    startFlashing(targetIndex);
                }, 1000);
                timeoutsRef.current.push(pauseId);

            }, duration);
            timeoutsRef.current.push(id);
        }
    };

    runSeq();
  };

  const startFlashing = (forcedIndex) => {
    setPhase("playing");
    const nps = Math.max(1, Math.min(numbersPerSet, 20));

    if (!gameSetsRef.current[forcedIndex]) return;

    // Speak First Number Immediately
    const firstNum = gameSetsRef.current[forcedIndex][0];
    playSound("tick");
    speakNumber(firstNum);

    intervalRef.current = setInterval(() => {
      setCurrentNumberIndex((prev) => {
        const next = prev + 1;

        if (next >= nps) {
          // END OF SET
          clearInterval(intervalRef.current);
          intervalRef.current = null;

          // Speak EQUALS immediately upon finishing the sequence
          speakText("equals");

          // Transition to input immediately to show the "?" in the input box
          setTimeout(() => {
              setPhase("input");
          }, 200);

          return prev;
        }

        const num = gameSetsRef.current[forcedIndex][next];

        playSound("tick");
        speakNumber(num);

        return next;
      });
    }, Math.max(speed, 0.4) * 1000);
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
    // Request fullscreen
    requestFullscreen();

    // TTS UNLOCK: Must speak a REAL word to wake up Android engine
    if (ttsEnabled) {
        window.speechSynthesis.cancel();
        const unlock = new SpeechSynthesisUtterance("Ready");
        unlock.rate = 1.5;
        unlock.volume = 0.1;
        window.speechSynthesis.speak(unlock);
    }

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
    if (userInput === "") return;

    const userInt = parseInt(userInput, 10);
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
            speakText(lang === 'th' ? 'ถูกต้อง' : 'Correct');
        } else {
            setFeedbackStatus("wrong");
            playSound("wrong");
            speakText(lang === 'th' ? `ผิด คำตอบคือ ${actualAnswer}` : `Wrong, answer is ${actualAnswer}`);
        }
        setPhase("feedback");
        // Auto-advance after showing feedback (like quiz logic)
        const feedbackDelay = isCorrect ? 1200 : 2000; // Longer delay for wrong to show correct answer
        const autoAdvanceId = setTimeout(() => {
            handleNextRound(true);
        }, feedbackDelay);
        timeoutsRef.current.push(autoAdvanceId);
    } else {
        setTimeout(() => {
            handleNextRound(true);
        }, 150);
    }
  };

  // --- NAVIGATION ---

  const handleNextRound = (autoAdvance = false) => {
    const nextIdx = currentSetIndex + 1;
    if (nextIdx < totalRounds) {
        startSequenceForSet(nextIdx);
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

  const goToMainMenu = () => {
    clearTimers();
    window.speechSynthesis.cancel();
    navigate(-1); // Navigate back instead of page reload
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
        <div className="flex-1 w-full flex items-center justify-center animate-in fade-in zoom-in duration-300 px-4 pt-16 pb-4 overflow-y-auto">
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

      {/* --- PHASE: GET READY --- */}
      {phase === "getready" && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-md">
           <div className="font-black text-white leading-none drop-shadow-[0_0_50px_rgba(6,182,212,0.8)] animate-bounce text-center" style={{ fontSize: 'min(15vh, 25vw)' }}>
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
                                        <span className={`text-white font-black w-8 h-8 flex shrink-0 items-center justify-center rounded-full shadow-md ${item.isCorrect ? 'bg-blue-500' : 'bg-red-500'}`}>
                                            {idx + 1}
                                        </span>
                                        <span className="font-mono text-sm sm:text-lg text-slate-500 font-bold truncate">
                                           {equationStr} =
                                        </span>
                                    </div>
                                    <div className="flex gap-4 ml-11 text-xs sm:text-sm font-bold">
                                        <span className="text-slate-400">YOU: <span className={`${item.isCorrect ? 'text-green-600' : 'text-red-500'}`}>{item.userAnswer}</span></span>
                                    </div>
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
                       <div className="flex gap-3">
                          <button onClick={handleBackToSettings} className="flex-1 py-3 rounded-xl bg-blue-100 text-violet-600 font-bold active:scale-95 transition-all">
                             {t.settings}
                          </button>
                          <button onClick={goToMainMenu} className="flex-1 py-3 rounded-xl bg-blue-100 text-violet-600 font-bold active:scale-95 transition-all">
                             {t.mainMenu}
                          </button>
                       </div>
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
             <div className="absolute bottom-20 sm:bottom-12 flex gap-3 z-30">
               {Array.from({length: Math.max(1, Math.min(numbersPerSet, 20))}).map((_, i) => (
                 <div
                   key={i}
                   className={`h-3 w-3 sm:h-4 sm:w-4 rounded-full transition-all duration-200 ${i <= currentNumberIndex ? 'bg-violet-500 scale-125' : 'bg-slate-300'}`}
                 />
               ))}
             </div>
        </div>
      )}

      {/* --- PHASE: INPUT (KEYPAD) --- */}
      {phase === "input" && (
         <div className="flex-1 w-full h-full flex flex-col items-center justify-center animate-in slide-in-from-bottom-10 fade-in duration-300">
            {/* Display Input */}
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
         </div>
      )}

      {/* --- PHASE: FEEDBACK (Practice Result) --- */}
      {phase === "feedback" && (
         <div className="flex-1 w-full flex flex-col items-center justify-center animate-in zoom-in duration-300 pb-12">
             <div className="font-black drop-shadow-2xl" style={{ fontSize: 'min(15vh, 25vw)', color: feedbackStatus === 'correct' ? '#22c55e' : '#ef4444' }}>
                 {feedbackStatus === 'correct' ? '✓' : '✗'}
             </div>
             <h2 className="text-4xl font-black text-slate-800 mt-4 mb-2">
                 {feedbackStatus === 'correct' ? t.correct : t.wrong}
             </h2>
             {feedbackStatus === 'wrong' && (
                 <div className="text-3xl font-black text-violet-600 mt-2">
                    {actualAnswer}
                 </div>
             )}
         </div>
      )}

      {/* CSS Utility for hidden scrollbar */}
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
      `}</style>
    </div>
  );
});

export default FlashcardGame;
