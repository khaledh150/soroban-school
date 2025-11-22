// src/pages/QuizPage.jsx

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { generateQuestions } from "../api/questionApi";
import SorobanBoard from "../components/quiz/SorobanBoard.jsx";

import "../components/quiz/soroban.css";
import "../components/quiz/quiz.css";

// --- Helpers ---
function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

export default function QuizPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // --- URL Params ---
  const levelParam = parseInt(searchParams.get("level") || "1", 10);
  const chapterParam = parseInt(searchParams.get("chapter") || "1", 10);
  const currentLevel = Math.max(1, Math.min(10, levelParam));
  const currentChapter = Math.max(1, Math.min(20, chapterParam));

  // --- View State ---
  const [view, setView] = useState("start");

  // --- Quiz State ---
  const [questionNum, setQuestionNum] = useState(1);
  const [flashContent, setFlashContent] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [inputLocked, setInputLocked] = useState(true);
  const [timerText, setTimerText] = useState("10:00");
  const [scoreText, setScoreText] = useState("");
  const [resultsData, setResultsData] = useState([]); 
  const [isMascotBouncing, setIsMascotBouncing] = useState(false);

  // --- Settings State ---
  const [settings, setSettings] = useState({
    numQuestions: 20,
    flashSpeed: 1,
    flashEnabled: true,
    timerMinutes: 10,
    mute: false,
  });

  // --- Refs ---
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
  const sorobanRef = useRef(null); // Direct link to SorobanBoard

  // --- Sound Helper ---
  const playSound = useCallback((name) => {
    if (settings.mute) return;
    const el = audioRefs.current[name];
    if (el) {
      el.currentTime = 0;
      el.play().catch((err) => console.warn("Audio play failed", err));
    }
  }, [settings.mute]);

  // --- Cleanup ---
  useEffect(() => {
    return () => {
      if (gameState.current.timerInterval) clearInterval(gameState.current.timerInterval);
      if (gameState.current.flashTokenTimer) clearTimeout(gameState.current.flashTokenTimer);
    };
  }, []);

  // --- Actions ---
  const goHome = () => {
    navigate(`/?level=${currentLevel}&chapter=${currentChapter}`);
  };

  const resetBoard = () => {
    if (sorobanRef.current) {
      sorobanRef.current.reset();
    }
  };

  // --- Visual Effects ---
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
    let stars = style === "sad" 
      ? ["💫", "💪", "💪", "💪", "💪", "💪", "💪", "👏"]
      : ["✨", "⭐", "🌟", "✦", "✺", "✧", "🟡", "💫", "🎊", "🎉", "🦄", "🍭", "🎈", "👏", "😺"];
    
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

  // --- Timer ---
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

  // --- Logic ---
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
      if (idx < tokens.length) {
        let content;
        if (tokens[idx].type === "first") {
          content = <div className="flash-token">{tokens[idx].val}</div>;
        } else {
          content = (
            <div className="flash-token">
              <span className="flash-op">{tokens[idx].op}</span>
              <span>{tokens[idx].val}</span>
            </div>
          );
        }
        
        setFlashContent(content);
        playSound("tick");
        const delay = settings.flashSpeed * 1000;
        
        if (idx === tokens.length - 1) {
           gameState.current.flashTokenTimer = setTimeout(() => {
            // RED QUESTION MARK
            setFlashContent(<div className="flash-qmark">?</div>);
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
      flashQuestionTokens(q.q, () => {
         setInputLocked(false);
      });
    } else {
      // FLASH OFF: Show static question text
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
    if (d === "C") {
      newVal = "";
    } else if (d === "BACK") {
      newVal = newVal.slice(0, -1);
    } else {
      if(newVal.length < 8) newVal += d; 
    }
    setInputValue(newVal);
  };

  const handleSubmitAnswer = () => {
    if (inputLocked || inputValue.length === 0) return;
    setInputLocked(true);

    const currentQ = gameState.current.questions[gameState.current.currentIndex];
    const isCorrect = inputValue === currentQ.a;

    gameState.current.answers.push({
      question: currentQ.q,
      correct: currentQ.a,
      user: inputValue,
    });

    // AUTO CLEAR BOARD
    resetBoard();

    // FEEDBACK
    if (isCorrect) {
      playSound("correct");
      setFlashContent(<div className="feedback-icon correct">✓</div>);
    } else {
      setTimeout(() => playSound("wrong"), 200);
      setFlashContent(<div className="feedback-icon wrong">✕</div>);
    }

    // NEXT QUESTION
    setTimeout(() => {
        if (gameState.current.currentIndex < gameState.current.questions.length - 1) {
            gameState.current.currentIndex += 1;
            loadQuestion();
        } else {
            finishQuiz(false);
        }
    }, 1000);
  };

  const toggleFullscreen = () => {
    if (isIOS()) {
      alert("Fullscreen mode is not supported on iPhone/iPad.");
      return;
    }
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const startQuiz = async () => {
    try {
      setView("quiz");
      setIsMascotBouncing(false);
      launchConfetti();
      
      gameState.current.currentIndex = 0;
      gameState.current.answers = [];
      gameState.current.timeLeft = settings.timerMinutes * 60;
      
      setInputValue("");
      setInputLocked(true);
      setFlashContent(<div style={{fontSize:"2rem", color:"#888"}}>Loading...</div>);
      
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
      console.error(err);
      setView("start");
    }
  };

  const showReadySetGo = (cb) => {
    const seq = ["Get", "Ready", "3", "2", "1"];
    let i = 0;
    playSound("go");
    const runSeq = () => {
        setFlashContent(<div className="ready-go-text">{seq[i]}</div>);
        if (i < seq.length - 1) {
            setTimeout(() => { i++; runSeq(); }, 650);
        } else {
            setTimeout(() => { cb(); }, 1000);
        }
    };
    runSeq();
  };

  const finishQuiz = (isTimeUp) => {
    if (gameState.current.timerInterval) clearInterval(gameState.current.timerInterval);
    const answers = gameState.current.answers;
    const correctCount = answers.filter(a => a.user === a.correct).length;
    const total = answers.length;
    setResultsData(answers);
    setScoreText(`You scored ${correctCount}/${total}`);
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
        /* --- LAYOUT & BASE --- */
        .quiz-root-container {
            display: flex; flex-direction: row; width: 100vw; height: 100vh;
            overflow: hidden; background: #d8e9fa; font-family: 'Nunito', sans-serif;
        }
        .rain-sparkle { pointer-events: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 5000; }
        
        /* --- PANELS --- */
        .quiz-panel {
            display: flex; flex-direction: column; width: clamp(320px, 30vw, 460px); height: 100%;
            background: linear-gradient(150deg, #fef5fa 65%, #f6f3fa 100%, #e6eaff 0%);
            padding: 1rem; box-sizing: border-box; box-shadow: 5px 0 20px rgba(0,0,0,0.08);
            z-index: 20; position: relative;
        }
        .soroban-container {
            position: relative; flex: 1; height: 100%; background: transparent;
            display: flex; align-items: center; justify-content: center; overflow: hidden;
        }
        /* Soroban Scaling */
        .soroban-container .soroban { transform: scale(1.45); transform-origin: center; }

        /* --- FLASH & TEXT SIZES --- */
        .flash-area { 
            flex: 1; display: flex; justify-content: center; align-items: center; 
            text-align: center; width: 100%; overflow: hidden;
        }
        
        /* Landscape Defaults */
        .flash-token { font-size: clamp(6rem, 15vw, 10rem); font-weight: 900; color: #4d79ff; line-height: 1; }
        .flash-op { margin-right: 0.1em; color: #aaa; font-size: 0.6em; }
        .flash-qmark { font-size: clamp(8rem, 20vw, 15rem); color: #ef4444; font-weight: 900; }
        .static-question { font-size: clamp(3rem, 8vw, 6rem); font-weight: bold; color: #4d79ff; }
        .feedback-icon { font-size: clamp(8rem, 20vw, 16rem); font-weight: 900; line-height: 1; }
        .feedback-icon.correct { color: #4ade80; }
        .feedback-icon.wrong { color: #f43f5e; }
        .ready-go-text { font-size: clamp(5rem, 12vw, 9rem); font-weight: 900; color: #fd90d7; }

        /* --- CONTROLS --- */
        .top-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .status-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; }
        .bottom-controls { margin-top: auto; width: 100%; display: flex; flex-direction: column; gap: 10px; }
        
        .icon-btn {
             background: #b4d7ff; border: none; border-radius: 50%; width: 42px; height: 42px;
             display: flex; align-items: center; justify-content: center; font-size: 1.3rem;
             cursor: pointer; box-shadow: 0 3px 8px rgba(0,0,0,0.1); transition: transform 0.1s;
        }
        .icon-btn:active { transform: scale(0.95); background: #fd90d7; color: #fff; }

        .back-pill {
             background: #b4d7ff; color: #3e366b; border: none; border-radius: 999px;
             padding: 0.5em 1.2em; font-weight: 700; cursor: pointer;
             display: flex; align-items: center; gap: 0.5em; box-shadow: 0 3px 8px rgba(0,0,0,0.1);
        }
        .back-pill:active { transform: scale(0.95); background: #fd90d7; color: #fff; }

        .numpad-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; width: 100%; }
        .num-btn {
            background: #fff; border: 2px solid #e0e0e0; border-radius: 16px;
            font-size: 1.6rem; font-weight: 800; color: #4d79ff; padding: 15px 0;
            cursor: pointer; box-shadow: 0 2px 0px rgba(0,0,0,0.05); transition: background 0.1s;
        }
        .num-btn:active { background: #f0f0f0; transform: translateY(2px); }

        .input-row { display: flex; gap: 10px; height: 65px; }
        .answer-box {
            flex: 1; background: #fff; border: 3px solid #fd90d7; border-radius: 16px;
            display: flex; align-items: center; justify-content: flex-end; padding: 0 1rem;
            font-size: 2.2rem; font-weight: 800; color: #333;
        }
        .send-btn {
            background: linear-gradient(90deg, #ae90fd 0%, #d492ff 100%); color: white;
            border: none; border-radius: 16px; padding: 0 2rem; font-size: 1.4rem; font-weight: 800;
            cursor: pointer; box-shadow: 0 4px 10px rgba(174, 144, 253, 0.4);
        }
        .send-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        /* === PORTRAIT / VERTICAL MODE OVERRIDES === */
        @media (max-aspect-ratio: 1/1) {
            .soroban-container { display: none !important; }
            .quiz-panel { width: 100vw !important; max-width: 100vw !important; border-radius: 0; padding: 1rem; }
            
            /* Compact Controls to leave room for Huge Numbers */
            .bottom-controls { gap: 8px; }
            .numpad-grid { height: 35vh; max-height: 320px; min-height: 250px; }
            .num-btn { padding: 0; height: 100%; font-size: 1.8rem; }
            .input-row { height: 60px; }
            
            /* MASSIVE FONTS for Portrait */
            .flash-token { font-size: clamp(10rem, 35vw, 18rem); }
            .flash-qmark { font-size: clamp(12rem, 40vw, 20rem); }
            .feedback-icon { font-size: clamp(12rem, 40vw, 20rem); }
            .static-question { font-size: clamp(4rem, 15vw, 8rem); }
        }
      `}</style>

      {/* AUDIO */}
      <audio ref={el => audioRefs.current['sound1'] = el} src="https://soroban-wonder-kids.b-cdn.net/sounds/sound1.wav" />
      <audio ref={el => audioRefs.current['sound2'] = el} src="https://soroban-wonder-kids.b-cdn.net/sounds/sound2.wav" />
      <audio ref={el => audioRefs.current['tick'] = el} src="https://soroban-wonder-kids.b-cdn.net/sounds/tick.wav" />
      <audio ref={el => audioRefs.current['go'] = el} src="https://soroban-wonder-kids.b-cdn.net/sounds/readyGo.wav" />
      <audio ref={el => audioRefs.current['correct'] = el} src="https://soroban-wonder-kids.b-cdn.net/sounds/correctSound.wav" />
      <audio ref={el => audioRefs.current['wrong'] = el} src="https://soroban-wonder-kids.b-cdn.net/sounds/wronganswer.wav" />
      <audio ref={el => audioRefs.current['applause'] = el} src="https://soroban-wonder-kids.b-cdn.net/sounds/applause.wav" />
      <audio ref={el => audioRefs.current['losing'] = el} src="https://soroban-wonder-kids.b-cdn.net/sounds/losing-horn.wav" />

      <div ref={rainSparkleRef} className="rain-sparkle" style={{ display: "none" }}></div>

      {/* === START SCREEN === */}
      {view === 'start' && (
        <div id="startPanel" style={{display:'flex'}}>
          <div className="start-card">
             <div className={`abacus-mascot ${isMascotBouncing ? 'mascot-bounce-in' : ''}`} id="mainMascot">
                <div className="abacus-body"><div className="abacus-rod"></div><div className="abacus-beads"><div className="abacus-bead"></div><div className="abacus-bead"></div><div className="abacus-bead"></div><div className="abacus-bead"></div></div><div className="abacus-rod"></div></div>
                <div className="mascot-face"><div className="eyes"><div className="eye"></div></div><div className="smile"></div><div className="cheek"></div><div className="cheek right"></div></div>
             </div>
             <div className="start-title">Soroban Quiz!</div>
             <button className="start-btn" onClick={startQuiz}>Start Quiz!</button>
             <button className="start-settings-btn" onClick={() => setView("settings")}>Settings ⚙️</button>
             <div className="confetti" ref={confettiBoxRef}></div>
             <button style={{marginTop:'1rem', background:'transparent', border:'none', color:'#668cff', fontWeight:'bold', cursor:'pointer'}} onClick={goHome}>
                 ← Back Home
             </button>
          </div>
        </div>
      )}

      {/* === QUIZ PANEL === */}
      {view === 'quiz' && (
        <div className="quiz-panel">
          <div className="top-bar">
              <button className="back-pill" onClick={goHome}>
                  <span>←</span> Home
              </button>
              <div style={{display:'flex', gap:'8px'}}>
                  <button className="icon-btn" onClick={() => setView("settings")}>⚙️</button>
                  <button className="icon-btn" onClick={resetBoard}>↻</button>
                  <button className="icon-btn" onClick={toggleFullscreen}>⛶</button>
              </div>
          </div>

          <div className="status-row">
              <div style={{background:'#668cff', color:'#fff', padding:'4px 14px', borderRadius:'12px', fontWeight:'bold'}}>Q{questionNum}</div>
              <div style={{display:'flex', alignItems:'center', gap:'6px', color:'#668cff', fontWeight:'bold', fontSize:'1.2rem'}}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                {timerText}
              </div>
          </div>

          <div className="flash-area">
              {flashContent}
          </div>

          <div className="bottom-controls">
              <div className="input-row">
                  <div className="answer-box">{inputValue}</div>
                  <button 
                      className="send-btn"
                      onClick={handleSubmitAnswer}
                      disabled={inputLocked || !inputValue}
                  >
                      Send
                  </button>
              </div>
              <div className="numpad-grid">
                  {["1","2","3","4","5","6","7","8","9","C","0","BACK"].map(key => (
                      <button 
                        key={key} 
                        className="num-btn"
                        onClick={() => handleAppendDigit(key)}
                      >
                          {key === "BACK" ? "⌫" : key}
                      </button>
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
              <h2 style={{color:'#4d79ff', marginBottom:'1rem'}}>Settings</h2>
              <label>
                Questions:
                <input type="number" min="1" max="50" value={settings.numQuestions} onChange={e => setSettings({...settings, numQuestions: Number(e.target.value)})} />
              </label>
              <label>
                Speed (sec):
                <select value={settings.flashSpeed} onChange={e => setSettings({...settings, flashSpeed: Number(e.target.value)})}>
                  {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </label>
              <label>
                Flash Tokens:
                <input type="checkbox" checked={settings.flashEnabled} onChange={e => setSettings({...settings, flashEnabled: e.target.checked})} />
              </label>
              <label>
                Timer (min):
                <select value={settings.timerMinutes} onChange={e => setSettings({...settings, timerMinutes: Number(e.target.value)})}>
                  {Array.from({length: 60}, (_, i) => i + 1).map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </label>
              <label>
                Mute:
                <input type="checkbox" checked={settings.mute} onChange={e => setSettings({...settings, mute: e.target.checked})} />
              </label>
              <div className="settings-actions">
                <button onClick={() => setView(gameState.current.questions.length > 0 ? "quiz" : "start")}>Cancel</button>
                <button onClick={() => setView("start")}>Save</button>
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
                    {view === 'timeup' ? "Time's Up!" : (scoreText.includes(`/${gameState.current.questions.length}`) && scoreText.startsWith(`You scored ${gameState.current.questions.length}`) ? "Perfect! 🎉" : "Results")}
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
                    <button onClick={() => startQuiz()}>↺ Try Again</button>
                    <button className="back-pill" onClick={goHome}>Home</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}