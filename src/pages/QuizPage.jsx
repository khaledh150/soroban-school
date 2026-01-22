// src/pages/QuizPage.jsx

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { generateQuestions } from "../api/questionApi";
import SorobanBoard from "../components/quiz/SorobanBoard.jsx";
import { useLanguage, chapterTitlesTH } from "../LanguageContext"; 

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

// English Titles (same as HomePage)
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
  3: [
    "Five & Ten buddy +9",
    "Five & Ten buddy +8",
    "Five & Ten buddy +7",
    "Five & Ten buddy +6",
    "Five & Ten buddy -9",
    "Five & Ten buddy -8",
    "Five & Ten buddy -7",
    "Five & Ten buddy -6",
    "Multiplication Table of 2",
    "Multiplication Table of 3",
    "Multiplication Table of 4",
    "Multiplication Table of 5",
    "Multiplication Table of 6",
    "Multiplication Table of 7",
    "Multiplication Table of 8",
    "Multiplication Table of 9",
    "Multiplication Table of 2 to 9"
  ],
  4: [
    "Lower Upper (2 Digit)", "Five Buddy +4 (2 Digit)", "Five Buddy +3 (2 Digit)", "Five Buddy +2 (2 Digit)", "Five Buddy +1 (2 Digit)",
    "Five Buddy -4 (2 Digit)", "Five Buddy -3 (2 Digit)", "Five Buddy -2 (2 Digit)", "Five Buddy -1 (2 Digit)", "Ten Buddy +9 (2 Digit)",
    "Ten Buddy +8 (2 Digit)", "Ten Buddy +7 (2 Digit)", "Ten Buddy +6 (2 Digit)", "Ten Buddy +5 (2 Digit)", "Ten Buddy +4 (2 Digit)",
    "Ten Buddy +3 (2 Digit)", "Ten Buddy +2 (2 Digit)", "Ten Buddy +1 (2 Digit)", "Ten Buddy -9 (2 Digit)", "Ten Buddy -8 (2 Digit)",
    "Ten Buddy -7 (2 Digit)", "Ten Buddy -6 (2 Digit)", "Ten Buddy -5 (2 Digit)", "Ten Buddy -4 (2 Digit)", "Ten Buddy -3 (2 Digit)",
    "Ten Buddy -2 (2 Digit)", "Ten Buddy -1 (2 Digit)", "Five & Ten Buddy +9 (2 Digit)", "Five & Ten Buddy +8 (2 Digit)", "Five & Ten Buddy +7 (2 Digit)",
    "Five & Ten Buddy +6 (2 Digit)", "Five & Ten Buddy -9 (2 Digit)", "Five & Ten Buddy -8 (2 Digit)", "Five & Ten Buddy -7 (2 Digit)", "Five & Ten Buddy -6 (2 Digit)"
  ],
  5: [
    "Lower Upper 2 Digit",
    "2 Digit ±",
    "2 Digit × 1 Digit",
    "Multiply Missing Number",
    "Five Buddy 2 Digit"
  ],
  6: [
    "Lower Upper 2 Digit",
    "2 Digit × 1 Digit",
    "Five Buddy 2 Digit",
    "3 Digit × 1 Digit"
  ],
  7: [
    "Multiply 3 Digit",
    "Divide 2 Digit",
    "Divide 3 Digit",
    "Multiply 4 Digit",
    "2 Digit ±"
  ],
  8: [
    "2 Digit ±",
    "3 Digit ±",
    "3 Digit × 1 Digit",
    "4 Digit × 1 Digit",
    "2 Digit × 2 Digit",
    "3 Digit ÷ 1 Digit",
    "4 Digit ÷ 1 Digit",
    "3 Digit ÷ 2 Digit",
    "2 Digit ÷ 2 Digit"
  ],
  9: [
    "± Decimals < 1",
    "± Decimal > 1",
    "3 Digit × 1 Digit",
    "4 Digit × 1 Digit",
    "5 Digit × 1 Digit",
    "2 Digit × 2 Digit",
    "3 Digit ±",
    "3 Digit ÷ 1 Digit",
    "4 Digit ÷ 1 Digit",
    "5 Digit ÷ 1 Digit",
    "3 Digit ÷ 2 Digit",
    "4 Digit ÷ 2 Digit"
  ]
};

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

export default function QuizPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { lang, t } = useLanguage(); 

  const levelParam = parseInt(searchParams.get("level") || "1", 10);
  const chapterParam = parseInt(searchParams.get("chapter") || "1", 10);
  
  // Book = Level. We allow up to 10 books.
  const currentLevel = Math.max(1, Math.min(10, levelParam));
  // Allow up to 21 chapters for Book 2
  const currentChapter = Math.max(1, Math.min(35, chapterParam));

  // Get chapter title based on language
  const getChapterTitle = () => {
    const chapterIndex = currentChapter - 1;
    const titles = lang === 'th' && chapterTitlesTH[currentLevel]
      ? chapterTitlesTH[currentLevel]
      : (titleMap[currentLevel] || []);
    return titles[chapterIndex] || `Ch. ${currentChapter}`;
  };

  const [view, setView] = useState("start");
  const [questionNum, setQuestionNum] = useState(1);
  const [flashContent, setFlashContent] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [inputLocked, setInputLocked] = useState(true);
  const [timerText, setTimerText] = useState("10:00");
  const [scoreText, setScoreText] = useState("");
  const [resultsData, setResultsData] = useState([]);
  const [isMascotBouncing, setIsMascotBouncing] = useState(false);

  // PC Focus Mode
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isPC, setIsPC] = useState(false);
  const answerInputRef = useRef(null);

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

  // --- UNLOCK AUDIO ---
  const unlockAudio = useCallback(() => {
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
  }, []);

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
        // Replace underscore with "ช่องว่าง" (blank) in Thai
        spokenText = spokenText.replace(/_/g, 'ช่องว่าง');
        // Replace "?" with "เท่ากับ" (equals) in Thai
        spokenText = spokenText.replace(/\?/g, 'เท่ากับ');
        // Replace "×" with "คูณ" (times) in Thai
        spokenText = spokenText.replace(/×/g, 'คูณ');
        // Replace "=" with "เท่ากับ" (equals) in Thai
        spokenText = spokenText.replace(/=/g, 'เท่ากับ');
    } else {
        if (type === 'op') {
            spokenText = text.replace('+', 'Plus ').replace('-', 'Minus ');
        }
        // Replace underscore with "blank" in English
        spokenText = spokenText.replace(/_/g, 'blank');
        // Replace "?" with "equals" in English
        spokenText = spokenText.replace(/\?/g, 'equals');
        // Replace "×" with "times" in English
        spokenText = spokenText.replace(/×/g, 'times');
        // Replace "=" with "equals" in English
        spokenText = spokenText.replace(/=/g, 'equals');
    }

    const utterance = new SpeechSynthesisUtterance(spokenText);
    utterance.rate = 1.1;
    utterance.lang = lang === 'th' ? 'th-TH' : 'en-US';

    window.speechSynthesis.speak(utterance);
  };

  // Speech with callback when complete (for blank questions)
  const speakTextWithCallback = (text, type = 'number', onEnd) => {
    if (!settings.dictation || settings.mute || !isMounted.current) {
      onEnd && onEnd();
      return;
    }

    window.speechSynthesis.cancel();

    let spokenText = text;

    if (text === 'equals') {
        spokenText = lang === 'th' ? 'เท่ากับ' : 'Equals';
    } else if (lang === 'th') {
        if (type === 'op') {
            spokenText = text.replace('+', 'บวก ').replace('-', 'ลบ ');
        }
        spokenText = spokenText.replace(/_/g, 'ช่องว่าง');
        spokenText = spokenText.replace(/\?/g, 'เท่ากับ');
        spokenText = spokenText.replace(/×/g, 'คูณ');
        spokenText = spokenText.replace(/=/g, 'เท่ากับ');
    } else {
        if (type === 'op') {
            spokenText = text.replace('+', 'Plus ').replace('-', 'Minus ');
        }
        spokenText = spokenText.replace(/_/g, 'blank');
        spokenText = spokenText.replace(/\?/g, 'equals');
        spokenText = spokenText.replace(/×/g, 'times');
        spokenText = spokenText.replace(/=/g, 'equals');
    }

    const utterance = new SpeechSynthesisUtterance(spokenText);
    utterance.rate = 1.1;
    utterance.lang = lang === 'th' ? 'th-TH' : 'en-US';
    utterance.onend = () => {
      onEnd && onEnd();
    };
    utterance.onerror = () => {
      onEnd && onEnd();
    };

    window.speechSynthesis.speak(utterance);
  };

  // PC Detection
  useEffect(() => {
    const checkPC = () => {
      const hasFinePointer = window.matchMedia && window.matchMedia('(pointer: fine)').matches;
      setIsPC(hasFinePointer);
    };
    checkPC();
    window.addEventListener('resize', checkPC);
    return () => window.removeEventListener('resize', checkPC);
  }, []);

  // Auto-focus answer input in Focus Mode
  useEffect(() => {
    if (isFocusMode && isPC && answerInputRef.current && view === 'quiz') {
      answerInputRef.current.focus();
    }
  }, [isFocusMode, isPC, view, inputLocked]);

  // Keyboard
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (view !== 'quiz') return;

      // ESC key exits focus mode on PC
      if (e.key === 'Escape' && isPC && isFocusMode) {
        setIsFocusMode(false);
        return;
      }

      // In focus mode, let the input field handle typing - only handle Enter and X
      if (isFocusMode && isPC) {
        if (e.key === 'Enter') { e.preventDefault(); handleSubmitAnswer(); }
        else if (e.key.toLowerCase() === 'x') resetBoard();
        return;
      }

      // Normal mode keyboard handling (for on-screen keypad)
      if (e.key === 'Enter') { e.preventDefault(); handleSubmitAnswer(); }
      else if (e.key === 'Backspace') handleAppendDigit('BACK');
      else if (e.key === '.') handleAppendDigit('.');
      else if (e.key.toLowerCase() === 'x') resetBoard();
      else if (/^[0-9]$/.test(e.key)) handleAppendDigit(e.key);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [view, inputLocked, inputValue, isPC, isFocusMode]);

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
    setIsFocusMode(false);
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

  // Get size class based on question length for responsive sizing
  const getQuestionSizeClass = (text) => {
    const len = text.length;
    if (len <= 5) return "size-s";   // "3 × 5"
    if (len <= 8) return "size-m";   // "12 × 8" or "3 × 5 = ?"
    if (len <= 12) return "size-l";  // "12 × 12 = ?"
    return "size-xl";                // longer questions
  };

  const flashQuestionTokens = (questionString, cb) => {
    if (gameState.current.flashTokenTimer) clearTimeout(gameState.current.flashTokenTimer);
    const tokens = parseQuestionToTokens(questionString);
    const hasBlank = questionString.includes('_');
    let idx = 0;
    setInputLocked(true);
    function showNext() {
      if (!isMounted.current) return;

      if (idx < tokens.length) {
        let content;
        let textForSpeech = "";
        let typeForSpeech = "number";
        const tokenVal = tokens[idx].val || '';
        const hasBlankInToken = tokenVal.includes('_');
        const isMultiplicationToken = tokenVal.includes('×') || tokenVal.includes('÷');

        if (tokens[idx].type === "first") {
          // Use different classes: blank questions smaller, multiplication/division larger, decimals dedicated
          let tokenClass = "flash-token";
          const isDecimalToken = tokenVal.includes('.');
          if (hasBlankInToken) {
            tokenClass = `flash-blank ${getQuestionSizeClass(tokenVal)}`;
          } else if (isMultiplicationToken) {
            tokenClass = `flash-multiplication ${getQuestionSizeClass(tokenVal)}`;
          } else if (isDecimalToken) {
            tokenClass = "flash-decimal";
          }
          content = <div className={tokenClass}>{tokenVal}</div>;
          textForSpeech = tokenVal;
        } else {
          // Check if this token has a decimal value
          const isDecimalVal = tokens[idx].val && tokens[idx].val.includes('.');
          const tokenClass = isDecimalVal ? "flash-decimal" : "flash-token";
          content = (
            <div className={tokenClass}>
              <span className="flash-op">{tokens[idx].op}</span>
              <span>{tokens[idx].val}</span>
            </div>
          );
          textForSpeech = `${tokens[idx].op} ${tokens[idx].val}`;
          typeForSpeech = "op";
        }
        setFlashContent(content);
        playSound("tick");

        // For questions with blanks, use speech synthesis onend to wait for dictation
        if (hasBlank && settings.dictation && !settings.mute) {
          speakTextWithCallback(textForSpeech, typeForSpeech, () => {
            if (!isMounted.current) return;
            if (idx === tokens.length - 1) {
              // For blank questions, don't show extra "?" - go straight to input
              setInputLocked(false);
              cb && cb();
            } else {
              idx++;
              showNext();
            }
          });
        } else {
          speakText(textForSpeech, typeForSpeech);
          // Add extra time for longer numbers (3+ digits need more time for dictation)
          const digitCount = (tokens[idx].val || tokenVal).replace(/\D/g, '').length;
          let delayMultiplier = 1;
          if (digitCount >= 4) delayMultiplier = 2;
          else if (digitCount >= 3) delayMultiplier = 1.5;
          const delay = settings.flashSpeed * 1000 * delayMultiplier;

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
      // For Book 3 multiplication questions, handle display differently
      const hasBlank = q.q.includes('_'); // Questions like "3 × _ = 9"
      const isMultiplication = q.q.includes('×') || q.q.includes('÷');
      // Use different classes: blank questions smaller, multiplication/division larger
      let questionClass = "static-question";
      let displayText = q.q;
      if (hasBlank) {
        questionClass = `static-blank ${getQuestionSizeClass(q.q)}`;
      } else if (isMultiplication) {
        // For multiplication/division like "3 × 5" or "12 ÷ 3", add "= ?"
        displayText = `${q.q} = ?`;
        questionClass = `static-multiplication ${getQuestionSizeClass(displayText)}`;
      }
      setFlashContent(
        <div className={questionClass}>
            {hasBlank ? q.q : (isMultiplication ? displayText : <>{q.q} = <span style={{color: '#ef4444'}}>?</span></>)}
        </div>
      );
      setInputLocked(false);
    }
  };

  const handleAppendDigit = (d) => {
    if (inputLocked) return;
    let newVal = inputValue;
    if (d === "BACK") newVal = newVal.slice(0, -1);
    else if (d === ".") {
      // Only add decimal if not already present and not at start
      if (!newVal.includes(".") && newVal.length > 0 && newVal.length < 8) {
        newVal += d;
      }
    }
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

    // Unlock audio on user interaction
    unlockAudio();

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
      
      // Sending book (level) AND chapter to the API
      // FIX: Ensure 'book' is passed correctly
      const questions = await generateQuestions({
        book: currentLevel,
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
      console.error(err);
      alert("Failed to load questions. Check console.");
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
        
        const text = seq[i];
        const isWord = text.length > 1;

        setFlashContent(
            <div className={`ready-go-text ${isWord ? 'word-mode' : ''}`}>
                {text}
            </div>
        );
        
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
    setIsFocusMode(false);
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
        .quiz-panel { display: flex; flex-direction: column; width: clamp(320px, 30vw, 460px); height: 100%; background: linear-gradient(150deg, #fef5fa 65%, #f6f3fa 100%, #e6eaff 0%); padding: 1rem; box-sizing: border-box; box-shadow: 5px 0 20px rgba(0,0,0,0.08); z-index: 20; position: relative; transition: all 0.3s ease; }
        .soroban-container { position: relative; flex: 1; height: 100%; background: transparent; display: flex; align-items: center; justify-content: center; overflow: hidden; transition: all 0.3s ease; }
        .soroban-container .soroban { transform: scale(1.45); transform-origin: center; }
        .flash-area { flex: 1; display: flex; justify-content: center; align-items: center; text-align: center; width: 100%; overflow: hidden; }

        /* PC Focus Mode - Only applies when (pointer: fine) is true */
        @media (pointer: fine) {
          .quiz-panel.focus-mode {
            width: 100vw !important;
            max-width: 100vw !important;
            height: 100vh !important;
            box-shadow: none !important;
            padding: 1.5rem 2rem !important;
          }
          .soroban-container.hidden-focus { display: none !important; }
          .flash-area.focus-mode {
            flex: 1;
            height: auto;
            min-height: 65vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 3rem;
          }
          .numpad-grid.hidden-focus { display: none !important; }
          .focus-mode-input-wrapper {
            position: fixed;
            bottom: 2rem;
            left: 50%;
            transform: translateX(-50%);
            width: 90%;
            max-width: 600px;
            z-index: 30;
          }
          .focus-mode-input-wrapper .answer-box::placeholder {
            color: #cbd5e1;
            font-weight: 600;
            font-size: 1.2rem;
          }
          .bottom-controls.hidden-focus { display: none !important; }

          /* Focus Mode - Substantially Larger Text Sizes */
          .focus-mode .flash-token {
            font-size: clamp(12rem, 25vw, 20rem) !important;
          }
          .focus-mode .flash-op {
            font-size: 0.5em !important;
          }
          .focus-mode .flash-qmark {
            font-size: clamp(14rem, 30vw, 24rem) !important;
          }
          .focus-mode .flash-multiplication,
          .focus-mode .static-multiplication {
            font-size: clamp(8rem, 18vw, 14rem) !important;
            letter-spacing: -0.02em !important;
          }
          .focus-mode .flash-blank,
          .focus-mode .static-blank {
            font-size: clamp(6rem, 14vw, 11rem) !important;
          }
          .focus-mode .flash-decimal {
            font-size: clamp(10rem, 20vw, 16rem) !important;
          }
          .focus-mode .feedback-icon {
            font-size: clamp(14rem, 30vw, 24rem) !important;
          }
          .focus-mode .correct-answer-text {
            font-size: clamp(4rem, 10vw, 8rem) !important;
            margin-top: 1rem !important;
          }
          .focus-mode .static-question {
            font-size: clamp(6rem, 14vw, 12rem) !important;
          }
          .focus-mode .ready-go-text {
            font-size: clamp(12rem, 25vw, 20rem) !important;
          }

          .focus-btn {
            background: linear-gradient(135deg, #22d3ee 0%, #2563eb 100%);
            color: white;
            border: none;
            border-radius: 50%;
            width: 42px;
            height: 42px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.3rem;
            cursor: pointer;
            box-shadow: 0 3px 12px rgba(37, 99, 235, 0.4);
            transition: transform 0.1s, box-shadow 0.2s;
            flex-shrink: 0;
          }
          .focus-btn:hover { box-shadow: 0 5px 18px rgba(37, 99, 235, 0.6); }
          .focus-btn:active { transform: scale(0.95); }
          .focus-btn.active {
            background: linear-gradient(135deg, #f472b6 0%, #ec4899 100%);
            box-shadow: 0 3px 12px rgba(236, 72, 153, 0.4);
          }

          .fullscreen-btn-pc {
            position: fixed;
            top: 1rem;
            right: 1rem;
            z-index: 999;
            background: #b4d7ff;
            border: none;
            border-radius: 50%;
            width: 42px;
            height: 42px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.3rem;
            cursor: pointer;
            box-shadow: 0 3px 8px rgba(0,0,0,0.1);
            transition: transform 0.1s;
          }
          .fullscreen-btn-pc:hover { transform: scale(1.05); }
          .fullscreen-btn-pc:active { transform: scale(0.95); background: #fd90d7; color: #fff; }
        }
        
        /* Text Sizes (Default) */
        .flash-token { font-size: clamp(6rem, 15vw, 10rem); font-weight: 900; color: #4d79ff; line-height: 1; }
        .flash-op { margin-right: 0.1em; color: #aaa; font-size: 0.6em; }
        .flash-qmark { font-size: clamp(8rem, 20vw, 15rem); color: #ef4444; font-weight: 900; }
        .static-question { font-size: clamp(3rem, 8vw, 6rem); font-weight: bold; color: #4d79ff; }

        /* Decimal questions - dedicated size (desktop) */
        .flash-decimal { font-size: 6rem; font-weight: 900; color: #4d79ff; line-height: 1; white-space: nowrap; }

        /* Multiplication & Blank questions - base styles */
        .flash-multiplication, .static-multiplication, .flash-blank, .static-blank {
            font-weight: 900;
            color: #4d79ff;
            line-height: 1;
            white-space: nowrap;
            text-align: center;
            letter-spacing: -0.03em;
            max-width: 100%;
        }
        .flash-blank, .static-blank {
            letter-spacing: -0.07em;
        }
        .static-multiplication, .static-blank { font-weight: bold; }

        /* Size variants - default (desktop) */
        .flash-multiplication.size-s, .static-multiplication.size-s { font-size: 7rem; }
        .flash-multiplication.size-m, .static-multiplication.size-m { font-size: 5.5rem; }
        .flash-multiplication.size-l, .static-multiplication.size-l { font-size: 4.2rem; }
        .flash-multiplication.size-xl, .static-multiplication.size-xl { font-size: 3.2rem; }

        .flash-blank.size-s, .static-blank.size-s { font-size: 4.5rem; }
        .flash-blank.size-m, .static-blank.size-m { font-size: 3.5rem; }
        .flash-blank.size-l, .static-blank.size-l { font-size: 2.8rem; }
        .flash-blank.size-xl, .static-blank.size-xl { font-size: 2.2rem; }
        
        /* Feedback & Answer */
        .feedback-container { display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .feedback-icon { font-size: clamp(8rem, 20vw, 16rem); font-weight: 900; line-height: 1; }
        .feedback-icon.correct { color: #4ade80; }
        .feedback-icon.wrong { color: #f43f5e; }
        .correct-answer-text { font-size: clamp(2rem, 6vw, 4rem); color: #f43f5e; font-weight: 800; margin-top: -10px; }

        .ready-go-text { font-size: clamp(5rem, 12vw, 9rem); font-weight: 900; color: #fd90d7; }
        
        /* UI Elements */
        .top-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .top-bar-left { display: flex; align-items: center; gap: 8px; min-width: 0; flex: 1; }
        .chapter-title { font-size: 0.85rem; font-weight: 700; color: #4a4a6a; background: linear-gradient(135deg, #e0e8ff 0%, #f0e6ff 100%); padding: 6px 14px; border-radius: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: calc(100% - 50px); box-shadow: 0 2px 8px rgba(102, 140, 255, 0.15); }
        .status-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; }
        .bottom-controls { margin-top: auto; width: 100%; display: flex; flex-direction: column; gap: 10px; }
        .icon-btn { background: #b4d7ff; border: none; border-radius: 50%; width: 42px; height: 42px; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; cursor: pointer; box-shadow: 0 3px 8px rgba(0,0,0,0.1); transition: transform 0.1s; flex-shrink: 0; }
        .icon-btn:active { transform: scale(0.95); background: #fd90d7; color: #fff; }
        .back-pill { background: #b4d7ff; color: #3e366b; border: none; border-radius: 50%; width: 42px; height: 42px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 8px rgba(0,0,0,0.1); flex-shrink: 0; }
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
            .quiz-panel { width: 280px; padding: 0.25rem 0.4rem; }

            /* 3. Compact Numpad & Controls */
            .bottom-controls { gap: 2px; }
            .numpad-grid { gap: 2px; }
            .num-btn { padding: 0; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; height: 28px; border-radius: 8px; border-width: 1px; }
            .input-row { height: 32px; gap: 5px; }
            .answer-box { font-size: 1.3rem; border-radius: 8px; border-width: 2px; }
            .send-btn { font-size: 1rem; padding: 0 1rem; border-radius: 8px; }

            /* 4. MAXIMIZED Visuals */
            .flash-area { flex-grow: 1; max-height: 55vh; display: flex; align-items: center; justify-content: center; overflow: hidden; }
            .flash-token { font-size: 25vh; line-height: 1; }
            .flash-qmark { font-size: 25vh; }
            .feedback-icon { font-size: 25vh; }
            .correct-answer-text { font-size: 5vh; margin-top: 0; }

            /* Multiplication questions in landscape - large for 280px panel */
            .flash-multiplication.size-s, .static-multiplication.size-s { font-size: 4.5rem; }
            .flash-multiplication.size-m, .static-multiplication.size-m { font-size: 3.5rem; }
            .flash-multiplication.size-l, .static-multiplication.size-l { font-size: 2.8rem; }
            .flash-multiplication.size-xl, .static-multiplication.size-xl { font-size: 2rem; }

            .flash-blank.size-s, .static-blank.size-s { font-size: 4.2rem; }
            .flash-blank.size-m, .static-blank.size-m { font-size: 3.2rem; }
            .flash-blank.size-l, .static-blank.size-l { font-size: 2.4rem; }
            .flash-blank.size-xl, .static-blank.size-xl { font-size: 1.8rem; }

            /* Decimal questions in landscape - slightly smaller than desktop */
            .flash-decimal { font-size: 5rem; }

            /* FIX: Make Ready text smaller in landscape so it fits the narrow side panel */
            .ready-go-text { font-size: 5rem; line-height: 1; }
            
            .status-row { font-size: 0.85rem; margin-bottom: 2px; }
            .top-bar { margin-bottom: 2px; }
            .icon-btn { width: 30px; height: 30px; font-size: 0.9rem; }
            .back-pill { width: 30px; height: 30px; }
            .chapter-title { font-size: 0.65rem; max-width: 110px; padding: 4px 10px; border-radius: 8px; }

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
            .quiz-panel { width: 100vw !important; max-width: 100vw !important; border-radius: 0; padding: 0.25rem 0.5rem; }

            /* Chapter title in portrait - more space available */
            .chapter-title { font-size: 0.85rem; max-width: calc(100vw - 200px); }

            /* Squeezed Numpad */
            .bottom-controls { gap: 4px; margin-top: auto; } 
            .numpad-grid { gap: 4px; height: auto; }
            .num-btn { padding: 0; height: 55px; font-size: 1.4rem; border-radius: 12px; display: flex; align-items: center; justify-content: center; } 
            .input-row { height: 50px; gap: 5px; }
            .answer-box { font-size: 1.6rem; border-radius: 12px; }
            .send-btn { font-size: 1.2rem; border-radius: 12px; }
            
            /* MASSIVE Numbers */
            .flash-area { flex-grow: 1; display: flex; align-items: center; justify-content: center; padding: 0; overflow: hidden; }
            .flash-token { font-size: clamp(10rem, 55vw, 25rem); line-height: 1; }
            .flash-qmark { font-size: clamp(12rem, 60vw, 30rem); }
            .feedback-icon { font-size: clamp(12rem, 60vw, 30rem); }

            /* Multiplication questions in portrait - large, scaled by length */
            .flash-multiplication.size-s, .static-multiplication.size-s { font-size: min(28vw, 9rem); }
            .flash-multiplication.size-m, .static-multiplication.size-m { font-size: min(22vw, 7rem); }
            .flash-multiplication.size-l, .static-multiplication.size-l { font-size: min(16vw, 5rem); }
            .flash-multiplication.size-xl, .static-multiplication.size-xl { font-size: min(11vw, 3.5rem); }

            /* Blank questions in portrait - large, scaled by length */
            .flash-blank.size-s, .static-blank.size-s { font-size: min(42vw, 14rem); }
            .flash-blank.size-m, .static-blank.size-m { font-size: min(32vw, 11rem); }
            .flash-blank.size-l, .static-blank.size-l { font-size: min(22vw, 8rem); }
            .flash-blank.size-xl, .static-blank.size-xl { font-size: min(17vw, 6rem); }

            /* Decimal questions in portrait - larger but still fits */
            .flash-decimal { font-size: min(28vw, 8rem); }

            .correct-answer-text { font-size: clamp(3rem, 10vh, 5rem); }
            .static-question { font-size: clamp(4rem, 20vw, 12rem); } 
            
            /* FIX: Match Ready numbers size to Flash Token, but shrink WORDS (Get, Ready) */
            .ready-go-text { font-size: clamp(10rem, 55vw, 25rem); line-height: 1; }
            .ready-go-text.word-mode { font-size: clamp(6rem, 25vw, 12rem); }
        }

        /* === RESULTS GRID === */
        .results-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
            gap: 10px;
            width: 100%;
            max-height: 250px;
            overflow-y: auto;
            padding: 5px;
        }
        .result-card {
            background: #f8faff;
            border-radius: 12px;
            padding: 10px;
            border: 2px solid #e0e7ff;
            transition: transform 0.1s;
        }
        .result-card.correct { border-color: #86efac; background: #f0fdf4; }
        .result-card.wrong { border-color: #fca5a5; background: #fef2f2; }
        .result-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 6px;
        }
        .result-qnum {
            background: #668cff;
            color: white;
            padding: 2px 8px;
            border-radius: 8px;
            font-size: 0.75rem;
            font-weight: 700;
        }
        .result-question {
            font-size: 0.9rem;
            font-weight: 600;
            color: #4d79ff;
            margin-bottom: 6px;
            word-break: break-word;
        }
        .result-answers {
            display: flex;
            align-items: center;
            gap: 6px;
            flex-wrap: wrap;
        }
        .your-ans {
            font-weight: 700;
            color: #22c55e;
            font-size: 1rem;
        }
        .your-ans.wrong-ans { color: #ef4444; text-decoration: line-through; }
        .correct-ans {
            color: #22c55e;
            font-weight: 600;
            font-size: 0.9rem;
        }
        .mark { font-size: 1rem; }

        /* PC Focus Mode - Larger Results Panel */
        @media (pointer: fine) {
          .results-card.focus-results {
            max-width: 90vw !important;
            width: 90vw !important;
            padding: 2rem 3rem !important;
          }
          .results-card.focus-results h2 {
            font-size: 3rem !important;
            margin-bottom: 2rem !important;
          }
          .results-card.focus-results .results-grid {
            grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)) !important;
            gap: 16px !important;
            max-height: 60vh !important;
            padding: 1rem !important;
          }
          .results-card.focus-results .result-card {
            padding: 16px !important;
            border-radius: 16px !important;
          }
          .results-card.focus-results .result-qnum {
            font-size: 1rem !important;
            padding: 4px 12px !important;
          }
          .results-card.focus-results .result-question {
            font-size: 1.3rem !important;
            margin-bottom: 10px !important;
          }
          .results-card.focus-results .your-ans {
            font-size: 1.5rem !important;
          }
          .results-card.focus-results .correct-ans {
            font-size: 1.3rem !important;
          }
          .results-card.focus-results .mark {
            font-size: 1.5rem !important;
          }
          .results-card.focus-results > div:nth-child(3) {
            font-size: 2rem !important;
            margin: 1.5rem 0 !important;
          }
          .results-card.focus-results .results-footer button {
            font-size: 1.5rem !important;
            padding: 1rem 2.5rem !important;
          }
        }

        @media (max-width: 400px) {
            .results-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; }
            .result-card { padding: 8px; }
            .result-question { font-size: 0.8rem; }
        }
        @media (min-width: 600px) {
            .results-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (min-width: 800px) {
            .results-grid { grid-template-columns: repeat(4, 1fr); }
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

      {/* === FULLSCREEN BUTTON (PC ONLY) === */}
      {view === 'quiz' && isPC && !isIOS() && (
        <button className="fullscreen-btn-pc" onClick={toggleFullscreen} aria-label="Toggle Fullscreen">
          ⛶
        </button>
      )}

      {/* === QUIZ PANEL === */}
      {view === 'quiz' && (
        <div className={`quiz-panel ${isFocusMode && isPC ? 'focus-mode' : ''}`}>
          <div className="top-bar">
              <div className="top-bar-left">
                  <button className="back-pill" onClick={goHome}><span>←</span></button>
                  <span className="chapter-title">{getChapterTitle()}</span>
              </div>
              <div style={{display:'flex', gap:'8px'}}>
                  <button className="icon-btn" onClick={() => setView("settings")}>⚙️</button>
                  {!isFocusMode && <button className="icon-btn" onClick={resetBoard}>↻</button>}
                  {isPC && (
                    <button
                      className={`focus-btn ${isFocusMode ? 'active' : ''}`}
                      onClick={() => setIsFocusMode(!isFocusMode)}
                      aria-label="Toggle Focus Mode"
                      title={isFocusMode ? "Exit Focus Mode (ESC)" : "Enter Focus Mode"}
                    >
                      {isFocusMode ? '⊠' : '◉'}
                    </button>
                  )}
                  {!isPC && <button className="icon-btn" onClick={toggleFullscreen}>⛶</button>}
              </div>
          </div>
          <div className="status-row">
              <div style={{background:'#668cff', color:'#fff', padding:'4px 14px', borderRadius:'12px', fontWeight:'bold'}}>Q{questionNum}</div>
              <div style={{display:'flex', alignItems:'center', gap:'6px', color:'#668cff', fontWeight:'bold', fontSize:'1.2rem'}}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                {timerText}
              </div>
          </div>
          <div className={`flash-area ${isFocusMode && isPC ? 'focus-mode' : ''}`}>
              {flashContent}
          </div>

          {/* Focus Mode Input (Fixed at bottom in focus mode) */}
          {isFocusMode && isPC ? (
            <div className="focus-mode-input-wrapper">
              <div className="input-row">
                  <input
                    ref={answerInputRef}
                    type="text"
                    inputMode="decimal"
                    value={inputValue}
                    onChange={(e) => {
                      if (inputLocked) return;
                      const val = e.target.value;
                      // Allow only numbers and decimal point, max 8 chars
                      if (/^[0-9.]*$/.test(val) && val.length <= 8) {
                        setInputValue(val);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSubmitAnswer();
                      }
                    }}
                    disabled={inputLocked}
                    className="answer-box"
                    style={{textAlign: 'right', outline: 'none', border: 'none', background: '#fff', cursor: inputLocked ? 'not-allowed' : 'text'}}
                    placeholder={inputLocked ? '' : 'Enter your answer here...'}
                  />
                  <button className="send-btn" onClick={handleSubmitAnswer} disabled={inputLocked || !inputValue}>{t.send}</button>
              </div>
            </div>
          ) : (
            <div className="bottom-controls">
              <div className="input-row">
                  <div className="answer-box">{inputValue}</div>
                  <button className="send-btn" onClick={handleSubmitAnswer} disabled={inputLocked || !inputValue}>{t.send}</button>
              </div>
              <div className={`numpad-grid ${isFocusMode && isPC ? 'hidden-focus' : ''}`}>
                  {["1","2","3","4","5","6","7","8","9",".","0","BACK"].map(key => (
                      <button key={key} className="num-btn" onClick={() => handleAppendDigit(key)}>{key === "BACK" ? "⌫" : key}</button>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* === SOROBAN PANEL === */}
      <div className={`soroban-container ${isFocusMode && isPC ? 'hidden-focus' : ''}`}>
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
            <div className={`results-card ${isPC ? 'focus-results' : ''}`}>
                <div className={`abacus-mascot ${isMascotBouncing ? 'mascot-bounce-in' : ''}`}>
                    <div className="abacus-body"><div className="abacus-rod"></div><div className="abacus-beads"><div className="abacus-bead"></div><div className="abacus-bead"></div><div className="abacus-bead"></div><div className="abacus-bead"></div></div><div className="abacus-rod"></div></div>
                    <div className="mascot-face"><div className="eyes"><div className="eye"></div></div><div className="smile"></div><div className="cheek"></div><div className="cheek right"></div></div>
                </div>
                <h2 style={{color: view==='timeup'?'#fd90d7':'#4d79ff', textAlign:'center', fontSize:'2rem', fontWeight:'800'}}>
                    {view === 'timeup' ? t.timesUp : (scoreText.includes(`/${gameState.current.questions.length}`) && scoreText.startsWith(`You scored ${gameState.current.questions.length}`) ? t.perfect : t.results)}
                </h2>
                <div className="results-grid">
                    {resultsData.map((a, i) => (
                         <div className={`result-card ${a.user === a.correct ? 'correct' : 'wrong'}`} key={i}>
                            <div className='result-header'>
                                <span className='result-qnum'>Q{i + 1}</span>
                                <span className='mark'>{a.user === a.correct ? "✅" : "❌"}</span>
                            </div>
                            <div className='result-question'>{a.question}</div>
                            <div className='result-answers'>
                                <span className={`your-ans ${a.user === a.correct ? '' : 'wrong-ans'}`}>{a.user}</span>
                                {a.user !== a.correct && (
                                    <span className='correct-ans'>({a.correct})</span>
                                )}
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