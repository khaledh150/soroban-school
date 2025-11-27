// src/pages/QuizPage.jsx

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { generateQuestions } from "../api/questionApi";
import SorobanBoard from "../components/quiz/SorobanBoard.jsx";
import { useLanguage } from "../LanguageContext"; 

// --- IMPORT SOUNDS ---
import sound1 from "../assets/sounds/sound1.wav";
import sound2 from "../assets/sounds/sound2.wav";
import tick from "../assets/sounds/tick.wav";
import readyGo from "../assets/sounds/readyGo.wav";
import correctSound from "../assets/sounds/correctSound.wav";
import wrongAnswer from "../assets/sounds/wronganswer.wav";
import applause from "../assets/sounds/applause.wav";
import losing from "../assets/sounds/losing-horn.wav";

import "../components/quiz/soroban.css";
import "../components/quiz/quiz.css";

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

export default function QuizPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { lang, t } = useLanguage(); 

  const levelParam = parseInt(searchParams.get("level") || "1", 10);
  const chapterParam = parseInt(searchParams.get("chapter") || "1", 10);
  const currentLevel = Math.max(1, Math.min(10, levelParam));
  const currentChapter = Math.max(1, Math.min(20, chapterParam));

  const [view, setView] = useState("start");
  const [questionNum, setQuestionNum] = useState(1);
  const [flashContent, setFlashContent] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [inputLocked, setInputLocked] = useState(true);
  const [timerText, setTimerText] = useState("10:00");
  const [scoreText, setScoreText] = useState("");
  const [resultsData, setResultsData] = useState([]); 
  const [isMascotBouncing, setIsMascotBouncing] = useState(false);

  const [settings, setSettings] = useState({
    numQuestions: 20,
    flashSpeed: 1,
    flashEnabled: true,
    timerMinutes: 10,
    mute: false,
    dictation: true, 
  });

  const gameState = useRef({
    questions: [],
    currentIndex: 0,
    answers: [],
    timeLeft: 600,
    timerInterval: null,
    flashTokenTimer: null,
  });

  const audioRefs = useRef({});
  const confettiBoxRef = useRef(null);
  const rainSparkleRef = useRef(null);
  const sorobanRef = useRef(null);
  
  // Track if component is mounted to stop speech on exit
  const isMounted = useRef(true);

  // --- PLAY SOUND ---
  const playSound = useCallback((name) => {
    if (settings.mute) return;
    const el = audioRefs.current[name];
    if (el) {
      el.currentTime = 0;
      el.play().catch((err) => console.warn("Audio play failed", err));
    }
  }, [settings.mute]);

  // --- STOP ALL AUDIO ---
  const stopAllAudio = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    
    Object.values(audioRefs.current).forEach(el => {
      if (el) {
        el.pause();
        el.currentTime = 0;
      }
    });
  }, []);

  // --- SPEECH (DICTATION) ---
  const speakText = (text, type = 'number') => {
    if (!settings.dictation || settings.mute || !isMounted.current) return;
    
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

    window.speechSynthesis.speak(utterance);
  };

  // Keyboard 
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (view !== 'quiz') return;
      if (e.key === 'Enter') { e.preventDefault(); handleSubmitAnswer(); }
      else if (e.key === 'Backspace') handleAppendDigit('BACK');
      else if (e.key.toLowerCase() === 'c') handleAppendDigit('C');
      else if (e.key.toLowerCase() === 'x') resetBoard();
      else if (/^[0-9]$/.test(e.key)) handleAppendDigit(e.key);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [view, inputLocked, inputValue]);

  // --- GLOBAL CLEANUP ---
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false; 
      if (gameState.current.timerInterval) clearInterval(gameState.current.timerInterval);
      if (gameState.current.flashTokenTimer) clearTimeout(gameState.current.flashTokenTimer);
      stopAllAudio(); 
    };
  }, []);

  const goHome = () => {
    stopAllAudio();
    navigate(`/?level=${currentLevel}&chapter=${currentChapter}`);
  };

  const resetBoard = () => {
    if (sorobanRef.current) sorobanRef.current.reset();
  };

  const toggleFullscreen = () => {
    if (isIOS()) return;
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const launchConfetti = () => { 
    const node = confettiBoxRef.current;
    if (!node) return;
    node.innerHTML = "";
    const colors = ["#ffd700", "#b993d6", "#4d79ff", "#66e6ff", "#ffb3e6", "#fd90d7", "#c8ffb0"];
    for (let i = 0; i < 36; i++) {
      const el = document.createElement("span");
      el.style.left = Math.random() * 96 + 2 + "%";
      el.style.background = colors[Math.floor(Math.random() * colors.length)];
      el.style.animationDuration = 1.1 + Math.random() * 0.5 + "s";
      el.style.opacity = 0.82 + Math.random() * 0.18;
      el.style.transform = `rotate(${Math.random() * 360}deg)`;
      node.appendChild(el);
    }
    setTimeout(() => { if(node) node.innerHTML = ""; }, 1600);
  };
  
  const rainSparkleBurst = (style = "happy") => {
      const rain = rainSparkleRef.current;
    if (!rain) return;
    rain.innerHTML = "";
    rain.style.display = "block";
    let stars = style === "sad" ? ["💫", "💪"] : ["✨", "⭐", "🌟", "🎉", "🦄"];
    const N = 34 + Math.floor(Math.random() * 8);
    for (let i = 0; i < N; i++) {
      const el = document.createElement("span");
      el.innerText = stars[Math.floor(Math.random() * stars.length)];
      el.style.left = Math.random() * 97 + "vw";
      el.style.top = -40 + Math.random() * 12 + "px";
      el.style.fontSize = 1.6 + Math.random() * 2.1 + "rem";
      el.style.opacity = 0.47 + Math.random() * 0.53;
      el.style.animationDelay = Math.random() * 0.5 + "s";
      rain.appendChild(el);
    }
    setTimeout(() => { if(rain) rain.style.display = "none"; }, 2300);
  };

  const updateTimerDisplay = () => {
    const t = gameState.current.timeLeft;
    const m = String(Math.floor(t / 60)).padStart(2, "0");
    const s = String(t % 60).padStart(2, "0");
    setTimerText(`${m}:${s}`);
  };

  const startTimer = () => {
    if (gameState.current.timerInterval) clearInterval(gameState.current.timerInterval);
    gameState.current.timerInterval = setInterval(() => {
      gameState.current.timeLeft -= 1;
      updateTimerDisplay();
      if (gameState.current.timeLeft <= 0) {
        clearInterval(gameState.current.timerInterval);
        finishQuiz(true);
      }
    }, 1000);
  };

  const parseQuestionToTokens = (q) => {
    const arr = q.split(/([+-])/).map((s) => s.trim()).filter(Boolean);
    const tokens = [];
    tokens.push({ type: "first", val: arr[0] });
    for (let i = 1; i < arr.length; i += 2) {
      tokens.push({ type: "op", op: arr[i], val: arr[i + 1] });
    }
    return tokens;
  };

  const flashQuestionTokens = (questionString, cb) => {
    if (gameState.current.flashTokenTimer) clearTimeout(gameState.current.flashTokenTimer);
    const tokens = parseQuestionToTokens(questionString);
    let idx = 0;
    setInputLocked(true);
    function showNext() {
      if (!isMounted.current) return;

      if (idx < tokens.length) {
        let content;
        let textForSpeech = "";
        let typeForSpeech = "number";
        if (tokens[idx].type === "first") {
          content = <div className="flash-token">{tokens[idx].val}</div>;
          textForSpeech = tokens[idx].val;
        } else {
          content = (
            <div className="flash-token">
              <span className="flash-op">{tokens[idx].op}</span>
              <span>{tokens[idx].val}</span>
            </div>
          );
          textForSpeech = `${tokens[idx].op} ${tokens[idx].val}`; 
          typeForSpeech = "op";
        }
        setFlashContent(content);
        playSound("tick");
        speakText(textForSpeech, typeForSpeech);
        const delay = settings.flashSpeed * 1000;
        
        if (idx === tokens.length - 1) {
           gameState.current.flashTokenTimer = setTimeout(() => {
            if (!isMounted.current) return;
            setFlashContent(<div className="flash-qmark">?</div>);
            speakText("equals"); 
            setInputLocked(false);
            cb && cb();
          }, delay);
        } else {
          gameState.current.flashTokenTimer = setTimeout(() => {
            idx++;
            showNext();
          }, delay);
        }
      }
    }
    showNext();
  };

  const loadQuestion = () => {
    const idx = gameState.current.currentIndex;
    const q = gameState.current.questions[idx];
    if (!q) return;
    setQuestionNum(idx + 1);
    setInputValue("");
    setFlashContent(null);
    setInputLocked(true);
    if (settings.flashEnabled) {
      flashQuestionTokens(q.q, () => { setInputLocked(false); });
    } else {
      setFlashContent(
        <div className="static-question">
            {q.q} = <span style={{color: '#ef4444'}}>?</span>
        </div>
      );
      setInputLocked(false);
    }
  };

  const handleAppendDigit = (d) => {
    if (inputLocked) return;
    let newVal = inputValue;
    if (d === "C") newVal = "";
    else if (d === "BACK") newVal = newVal.slice(0, -1);
    else if(newVal.length < 8) newVal += d; 
    setInputValue(newVal);
  };

  const handleSubmitAnswer = () => {
    if (inputLocked || inputValue.length === 0) return;
    setInputLocked(true);
    window.speechSynthesis.cancel();
    const currentQ = gameState.current.questions[gameState.current.currentIndex];
    const isCorrect = inputValue === currentQ.a;
    gameState.current.answers.push({ question: currentQ.q, correct: currentQ.a, user: inputValue });
    resetBoard();
    if (isCorrect) {
      playSound("correct");
      setFlashContent(<div className="feedback-icon correct">✓</div>);
    } else {
      setTimeout(() => playSound("wrong"), 200);
      setFlashContent(
        <div className="feedback-container">
            <div className="feedback-icon wrong">✕</div>
            <div className="correct-answer-text">Ans: {currentQ.a}</div>
        </div>
      );
    }
    setTimeout(() => {
        if (gameState.current.currentIndex < gameState.current.questions.length - 1) {
            gameState.current.currentIndex += 1;
            loadQuestion();
        } else {
            finishQuiz(false);
        }
    }, 1500);
  };

  const startQuiz = async () => {
    stopAllAudio();
    if (!isIOS() && !document.fullscreenElement) {
       document.documentElement.requestFullscreen().catch(() => {});
    }
    try {
      setView("quiz");
      setIsMascotBouncing(false);
      launchConfetti();
      gameState.current.currentIndex = 0;
      gameState.current.answers = [];
      gameState.current.timeLeft = settings.timerMinutes * 60;
      setInputValue("");
      setInputLocked(true);
      setFlashContent(<div style={{fontSize:"2rem", color:"#888"}}>{t.loading}</div>);
      
      const questions = await generateQuestions({
        chapter: currentChapter,
        numQuestions: settings.numQuestions,
        numNumbers: 4,
      });

      if (!Array.isArray(questions) || questions.length === 0) throw new Error("No questions");
      gameState.current.questions = questions;
      
      showReadySetGo(() => { 
          startTimer(); 
          loadQuestion(); 
      });

    } catch (err) {
      alert("Failed to load questions.");
      setView("start");
    }
  };

  // --- UPDATED READY SEQUENCE ---
  const showReadySetGo = (cb) => {
    const seq = ["Get", "Ready", "3", "2", "1"]; 
    let i = 0;
    
    playSound("go"); 
    
    const runSeq = () => {
        if (!isMounted.current) return;
        
        setFlashContent(<div className="ready-go-text">{seq[i]}</div>);
        
        const delays = [800, 800, 800, 800, 800]; 
        
        if (i < seq.length - 1) {
            setTimeout(() => { 
                i++; 
                runSeq(); 
            }, delays[i]);
        } else {
            setTimeout(() => {
                setFlashContent(null); 
                setTimeout(() => { 
                    cb(); 
                }, 1000);
            }, delays[i]);
        }
    };
    runSeq();
  };

  const finishQuiz = (isTimeUp) => {
    if (gameState.current.timerInterval) clearInterval(gameState.current.timerInterval);
    stopAllAudio();
    const answers = gameState.current.answers;
    const correctCount = answers.filter(a => a.user === a.correct).length;
    const total = answers.length;
    setResultsData(answers);
    setScoreText(`${t.score} ${correctCount}/${total}`);
    setView(isTimeUp ? "timeup" : "results");
    setIsMascotBouncing(false);
    setTimeout(() => setIsMascotBouncing(true), 10);
    if (!isTimeUp) {
      const pct = total > 0 ? correctCount / total : 0;
      if (total > 0 && (correctCount === total || pct >= 0.7)) {
        playSound("applause");
        rainSparkleBurst("happy");
      } else if (pct < 0.5) {
        playSound("losing");
        rainSparkleBurst("sad");
      } else {
        rainSparkleBurst("happy");
      }
    }
  };

  return (
    <div className="quiz-root-container">
      <style>{`
        .quiz-root-container { display: flex; flex-direction: row; width: 100vw; height: 100vh; overflow: hidden; background: #d8e9fa; font-family: 'Nunito', sans-serif; transition: background 0.3s; }
        
        .rain-sparkle { pointer-events: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 5000; }
        .quiz-panel { display: flex; flex-direction: column; width: clamp(320px, 30vw, 460px); height: 100%; background: linear-gradient(150deg, #fef5fa 65%, #f6f3fa 100%, #e6eaff 0%); padding: 1rem; box-sizing: border-box; box-shadow: 5px 0 20px rgba(0,0,0,0.08); z-index: 20; position: relative; }
        .soroban-container { position: relative; flex: 1; height: 100%; background: transparent; display: flex; align-items: center; justify-content: center; overflow: hidden; }
        .soroban-container .soroban { transform: scale(1.45); transform-origin: center; }
        .flash-area { flex: 1; display: flex; justify-content: center; align-items: center; text-align: center; width: 100%; overflow: hidden; }
        
        /* Text Sizes (Default) */
        .flash-token { font-size: clamp(6rem, 15vw, 10rem); font-weight: 900; color: #4d79ff; line-height: 1; }
        .flash-op { margin-right: 0.1em; color: #aaa; font-size: 0.6em; }
        .flash-qmark { font-size: clamp(8rem, 20vw, 15rem); color: #ef4444; font-weight: 900; }
        .static-question { font-size: clamp(3rem, 8vw, 6rem); font-weight: bold; color: #4d79ff; }
        
        /* Feedback & Answer */
        .feedback-container { display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .feedback-icon { font-size: clamp(8rem, 20vw, 16rem); font-weight: 900; line-height: 1; }
        .feedback-icon.correct { color: #4ade80; }
        .feedback-icon.wrong { color: #f43f5e; }
        .correct-answer-text { font-size: clamp(2rem, 6vw, 4rem); color: #f43f5e; font-weight: 800; margin-top: -10px; }

        .ready-go-text { font-size: clamp(5rem, 12vw, 9rem); font-weight: 900; color: #fd90d7; }
        
        /* UI Elements */
        .top-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .status-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; }
        .bottom-controls { margin-top: auto; width: 100%; display: flex; flex-direction: column; gap: 10px; }
        .icon-btn { background: #b4d7ff; border: none; border-radius: 50%; width: 42px; height: 42px; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; cursor: pointer; box-shadow: 0 3px 8px rgba(0,0,0,0.1); transition: transform 0.1s; }
        .icon-btn:active { transform: scale(0.95); background: #fd90d7; color: #fff; }
        .back-pill { background: #b4d7ff; color: #3e366b; border: none; border-radius: 999px; padding: 0.5em 1.2em; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 0.5em; box-shadow: 0 3px 8px rgba(0,0,0,0.1); }
        .back-pill:active { transform: scale(0.95); background: #fd90d7; color: #fff; }
        .numpad-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; width: 100%; }
        .num-btn { background: #fff; border: 2px solid #e0e0e0; border-radius: 16px; font-size: 1.6rem; font-weight: 800; color: #4d79ff; padding: 15px 0; cursor: pointer; box-shadow: 0 2px 0px rgba(0,0,0,0.05); transition: background 0.1s; }
        .num-btn:active { background: #f0f0f0; transform: translateY(2px); }
        .input-row { display: flex; gap: 10px; height: 65px; }
        .answer-box { flex: 1; background: #fff; border: 3px solid #fd90d7; border-radius: 16px; display: flex; align-items: center; justify-content: flex-end; padding: 0 1rem; font-size: 2.2rem; font-weight: 800; color: #333; }
        .send-btn { background: linear-gradient(90deg, #ae90fd 0%, #d492ff 100%); color: white; border: none; border-radius: 16px; padding: 0 2rem; font-size: 1.4rem; font-weight: 800; cursor: pointer; box-shadow: 0 4px 10px rgba(174, 144, 253, 0.4); }
        .send-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        
        /* --- MOBILE LANDSCAPE FIX (Screens like your phone) --- */
        @media (max-height: 600px) and (orientation: landscape) {
            /* 1. Increase Soroban size (Requested 0.95) */
            .soroban-container .soroban { transform: scale(0.95); }
            
            /* 2. Make the quiz panel narrower to give space to soroban */
            .quiz-panel { width: 280px; padding: 0.5rem; }

            /* 3. Compact Numpad & Controls */
            .bottom-controls { gap: 2px; }
            .numpad-grid { gap: 2px; }
            .num-btn { padding: 0; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; height: 28px; border-radius: 8px; border-width: 1px; }
            .input-row { height: 32px; gap: 5px; }
            .answer-box { font-size: 1.3rem; border-radius: 8px; border-width: 2px; }
            .send-btn { font-size: 1rem; padding: 0 1rem; border-radius: 8px; }

            /* 4. MAXIMIZED Visuals */
            .flash-area { flex-grow: 1; max-height: 55vh; display: flex; align-items: center; justify-content: center; }
            .flash-token { font-size: 25vh; line-height: 1; }
            .flash-qmark { font-size: 25vh; }
            .feedback-icon { font-size: 25vh; }
            .correct-answer-text { font-size: 5vh; margin-top: 0; }
            
            /* FIX: Make Ready text smaller in landscape so it fits the narrow side panel */
            .ready-go-text { font-size: 5rem; line-height: 1; }
            
            .status-row { font-size: 0.85rem; margin-bottom: 2px; }
            .top-bar { margin-bottom: 2px; }
            .icon-btn { width: 30px; height: 30px; font-size: 0.9rem; }

            /* FIX: Settings overflowing */
            .settings-card { padding: 0.5rem 1rem; gap: 0.5rem; max-height: 90vh; overflow-y: auto; width: 80vw; max-width: 400px; }
            .settings-card label { margin-bottom: 0; font-size: 0.95rem; }
            .settings-card input[type="number"], .settings-card select { font-size: 0.95rem; padding: 0.2rem 0.5rem; width: 3.5em; }
            .settings-card input[type="checkbox"] { width: 1.5em; height: 1.5em; }
            .settings-actions { margin-top: 0.5rem; gap: 0.8rem; }
            .settings-actions button { font-size: 1rem !important; padding: 0.3rem 1rem !important; min-height: 2em; }
        }

        /* === PORTRAIT MODE (COMPACT + HUGE NUMBERS) === */
        @media (max-aspect-ratio: 1/1) { 
            .soroban-container { display: none !important; } 
            .quiz-panel { width: 100vw !important; max-width: 100vw !important; border-radius: 0; padding: 0.5rem; } 
            
            /* Squeezed Numpad */
            .bottom-controls { gap: 4px; margin-top: auto; } 
            .numpad-grid { gap: 4px; height: auto; }
            .num-btn { padding: 0; height: 55px; font-size: 1.4rem; border-radius: 12px; display: flex; align-items: center; justify-content: center; } 
            .input-row { height: 50px; gap: 5px; }
            .answer-box { font-size: 1.6rem; border-radius: 12px; }
            .send-btn { font-size: 1.2rem; border-radius: 12px; }
            
            /* MASSIVE Numbers */
            .flash-area { flex-grow: 1; display: flex; align-items: center; justify-content: center; }
            .flash-token { font-size: clamp(10rem, 55vw, 25rem); line-height: 1; } 
            .flash-qmark { font-size: clamp(12rem, 60vw, 30rem); } 
            .feedback-icon { font-size: clamp(12rem, 60vw, 30rem); } 
            .correct-answer-text { font-size: clamp(3rem, 10vh, 5rem); }
            .static-question { font-size: clamp(4rem, 20vw, 12rem); } 
            
            /* FIX: Match Ready text size to Flash Token size in portrait */
            .ready-go-text { font-size: clamp(10rem, 55vw, 25rem); line-height: 1; }
        }
      `}</style>

      {/* Audio & Effects */}
      <audio ref={el => audioRefs.current['sound1'] = el} src={sound1} />
      <audio ref={el => audioRefs.current['sound2'] = el} src={sound2} />
      <audio ref={el => audioRefs.current['tick'] = el} src={tick} />
      <audio ref={el => audioRefs.current['go'] = el} src={readyGo} />
      <audio ref={el => audioRefs.current['correct'] = el} src={correctSound} />
      <audio ref={el => audioRefs.current['wrong'] = el} src={wrongAnswer} />
      <audio ref={el => audioRefs.current['applause'] = el} src={applause} />
      <audio ref={el => audioRefs.current['losing'] = el} src={losing} />
      <div ref={rainSparkleRef} className="rain-sparkle" style={{ display: "none" }}></div>

      {/* === START SCREEN === */}
      {view === 'start' && (
        <div id="startPanel" style={{display:'flex'}}>
          <div className="start-card">
             <div className={`abacus-mascot ${isMascotBouncing ? 'mascot-bounce-in' : ''}`} id="mainMascot">
                <div className="abacus-body"><div className="abacus-rod"></div><div className="abacus-beads"><div className="abacus-bead"></div><div className="abacus-bead"></div><div className="abacus-bead"></div><div className="abacus-bead"></div></div><div className="abacus-rod"></div></div>
                <div className="mascot-face"><div className="eyes"><div className="eye"></div></div><div className="smile"></div><div className="cheek"></div><div className="cheek right"></div></div>
             </div>
             <div className="start-title">{t.appTitle}</div>
             <button className="start-btn" onClick={startQuiz}>{t.startQuiz}</button>
             <button className="start-settings-btn" onClick={() => setView("settings")}>{t.settings} ⚙️</button>
             <div className="confetti" ref={confettiBoxRef}></div>
             <button style={{marginTop:'1rem', background:'transparent', border:'none', color:'#668cff', fontWeight:'bold', cursor:'pointer'}} onClick={goHome}>
                 ← {t.backHome}
             </button>
          </div>
        </div>
      )}

      {/* === QUIZ PANEL === */}
      {view === 'quiz' && (
        <div className="quiz-panel">
          <div className="top-bar">
              <button className="back-pill" onClick={goHome}><span>←</span> {t.backHome}</button>
              <div style={{display:'flex', gap:'8px'}}>
                  <button className="icon-btn" onClick={() => setView("settings")}>⚙️</button>
                  <button className="icon-btn" onClick={resetBoard}>↻</button>
                  <button className="icon-btn" onClick={toggleFullscreen}>⛶</button>
              </div>
          </div>
          <div className="status-row">
              <div style={{background:'#668cff', color:'#fff', padding:'4px 14px', borderRadius:'12px', fontWeight:'bold'}}>Q{questionNum}</div>
              <div style={{display:'flex', alignItems:'center', gap:'6px', color:'#668cff', fontWeight:'bold', fontSize:'1.2rem'}}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                {timerText}
              </div>
          </div>
          <div className="flash-area">
              {flashContent}
          </div>
          <div className="bottom-controls">
              <div className="input-row">
                  <div className="answer-box">{inputValue}</div>
                  <button className="send-btn" onClick={handleSubmitAnswer} disabled={inputLocked || !inputValue}>{t.send}</button>
              </div>
              <div className="numpad-grid">
                  {["1","2","3","4","5","6","7","8","9","C","0","BACK"].map(key => (
                      <button key={key} className="num-btn" onClick={() => handleAppendDigit(key)}>{key === "BACK" ? "⌫" : key}</button>
                  ))}
              </div>
          </div>
        </div>
      )}

      {/* === SOROBAN PANEL === */}
      <div className="soroban-container">
          <SorobanBoard ref={sorobanRef} />
      </div>

      {/* === SETTINGS OVERLAY === */}
      {view === 'settings' && (
        <div id="settingsPanel" style={{display:'flex'}}>
            <div className="settings-card">
              <h2 style={{color:'#4d79ff', marginBottom:'1rem'}}>{t.settings}</h2>
              <label>
                {t.questions}:
                <input type="number" min="1" max="50" value={settings.numQuestions} onChange={e => setSettings({...settings, numQuestions: Number(e.target.value)})} />
              </label>
              <label>
                {t.speed}:
                <select value={settings.flashSpeed} onChange={e => setSettings({...settings, flashSpeed: Number(e.target.value)})}>
                  {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </label>
              <label>
                {t.flash}:
                <input type="checkbox" checked={settings.flashEnabled} onChange={e => setSettings({...settings, flashEnabled: e.target.checked})} />
              </label>
              <label>
                {t.dictation}:
                <input type="checkbox" checked={settings.dictation} onChange={e => setSettings({...settings, dictation: e.target.checked})} />
              </label>
              <label>
                {t.timer}:
                <select value={settings.timerMinutes} onChange={e => setSettings({...settings, timerMinutes: Number(e.target.value)})}>
                  {Array.from({length: 60}, (_, i) => i + 1).map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </label>
              
              <div className="settings-actions">
                <button onClick={() => setView(gameState.current.questions.length > 0 ? "quiz" : "start")}>{t.cancel}</button>
                <button onClick={() => startQuiz()}>{t.save}</button>
              </div>
            </div>
        </div>
      )}

      {/* === RESULTS / TIMEUP === */}
      {(view === 'results' || view === 'timeup') && (
        <div id={view === 'timeup' ? "timeUpPanel" : "resultsPanel"} style={{display:'flex'}}>
            <div className="results-card">
                <div className={`abacus-mascot ${isMascotBouncing ? 'mascot-bounce-in' : ''}`}>
                    <div className="abacus-body"><div className="abacus-rod"></div><div className="abacus-beads"><div className="abacus-bead"></div><div className="abacus-bead"></div><div className="abacus-bead"></div><div className="abacus-bead"></div></div><div className="abacus-rod"></div></div>
                    <div className="mascot-face"><div className="eyes"><div className="eye"></div></div><div className="smile"></div><div className="cheek"></div><div className="cheek right"></div></div>
                </div>
                <h2 style={{color: view==='timeup'?'#fd90d7':'#4d79ff', textAlign:'center', fontSize:'2rem', fontWeight:'800'}}>
                    {view === 'timeup' ? t.timesUp : (scoreText.includes(`/${gameState.current.questions.length}`) && scoreText.startsWith(`You scored ${gameState.current.questions.length}`) ? t.perfect : t.results)}
                </h2>
                <div className="results-row" style={{width:'100%', overflowY:'auto', maxHeight:'200px'}}>
                    {resultsData.map((a, i) => (
                         <div className="result-item" key={i}>
                            <div className='question-text'>Q{i + 1}: {a.question}</div>
                            <div className='your-answer'>
                                <span className='mark'>{a.user === a.correct ? "✅" : "❌"}</span>
                                <span>Your: {a.user}</span>
                            </div>
                          </div>
                    ))}
                </div>
                <div style={{fontSize:'1.5rem', fontWeight:'bold', color:'#668cff', margin:'10px 0'}}>{scoreText}</div>
                <div className="results-footer">
                    <button onClick={() => startQuiz()}>↺ {t.tryAgain}</button>
                    <button className="back-pill" onClick={goHome}>{t.backHome}</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}