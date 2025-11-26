// src/LanguageContext.jsx
import React, { createContext, useState, useContext } from 'react';

const LanguageContext = createContext();

export const translations = {
  en: {
    appTitle: "Soroban For School",
    startQuiz: "Start Quiz",
    settings: "Settings",
    backHome: "Home",
    chapter: "Chapter",
    level: "Book", // Changed from Level
    questions: "Questions",
    speed: "Speed",
    flash: "Flash Tokens",
    dictation: "Voice", 
    timer: "Timer (min)",
    mute: "Mute",
    save: "Save",
    cancel: "Cancel",
    results: "Results",
    perfect: "Perfect! 🎉",
    timesUp: "Time's Up!",
    score: "You scored",
    tryAgain: "Try Again",
    send: "Send",
    loading: "Loading...",
    loginTitle: "Sign In",
    username: "Username",
    password: "Password",
    signingIn: "Signing in...",
    errorFill: "Fill all fields",
    logout: "Log Out",
    voiceVol: "Voice Volume",
    sfxVol: "SFX Volume",
    watchLesson: "Watch Lesson",
    slideshow: "Gallery",
    videoError: "Video not available",
    exercise: "Exercise",
    next: "Next",
    nickname: "Nickname",
    saveNickname: "Save nickname",
    fontSize: "Font Size",
    equals: "Equals",
    plus: "Plus",
    minus: "Minus"
  },
  th: {
    appTitle: "Soroban For School",
    startQuiz: "เริ่มทำแบบทดสอบ",
    settings: "ตั้งค่า",
    backHome: "หน้าหลัก",
    chapter: "บทที่",
    level: "เล่ม", // Changed from ระดับ
    questions: "จำนวนข้อ",
    speed: "ความเร็ว (วิ)",
    flash: "แฟลชตัวเลข",
    dictation: "เสียงอ่าน",
    timer: "เวลา (นาที)",
    mute: "ปิดเสียง",
    save: "บันทึก",
    cancel: "ยกเลิก",
    results: "ผลลัพธ์",
    perfect: "ยอดเยี่ยม! 🎉",
    timesUp: "หมดเวลา!",
    score: "คะแนนของคุณ",
    tryAgain: "ลองอีกครั้ง",
    send: "ส่งคำตอบ",
    loading: "กำลังโหลด...",
    loginTitle: "เข้าสู่ระบบ",
    username: "ชื่อผู้ใช้",
    password: "รหัสผ่าน",
    signingIn: "กำลังเข้าสู่ระบบ...",
    errorFill: "กรุณากรอกข้อมูลให้ครบ",
    logout: "ออกจากระบบ",
    voiceVol: "ความเสียงอ่าน",
    sfxVol: "เสียงเอฟเฟกต์",
    watchLesson: "ดูบทเรียน",
    slideshow: "อัลบั้มภาพ",
    videoError: "ไม่พบวิดีโอ",
    exercise: "แบบฝึกหัด",
    next: "ถัดไป",
    nickname: "ชื่อเล่น",
    saveNickname: "บันทึกชื่อเล่น",
    fontSize: "ขนาดตัวอักษร",
    equals: "เท่ากับ",
    plus: "บวก",
    minus: "ลบ"
  }
};

export const chapterTitlesTH = {
  1: [
    "ปัดเม็ดล่าง (Lower)",
    "ปัดเม็ดล่าง 2 หลัก (Lower 2 digit)",
    "ปัดเม็ดบน (Upper)",
    "ผสม ปัดเม็ดบนล่าง (Mix Lower Upper)",
    "ผสม ปัดเม็ดบนล่าง 2 หลัก (Mix Lower Upper 2 digit)",
    "คู่หู 5 (+4)",
    "คู่หู 5 (+3)",
    "คู่หู 5 (+2)",
    "คู่หู 5 (+1)",
    "คู่หู 5 (บวก)",
    "คู่หู 5 (-4)",
    "คู่หู 5 (-3)",
    "คู่หู 5 (-2)",
    "คู่หู 5 (-1)",
    "คู่หู 5 (ลบ)",
    "ผสม คู่หู 5 (Mix Five buddy)",
    "ผสม คู่หู 5 2 หลัก (Mix Five buddy 2 digit)"
  ]
};

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('en');

  const toggleLang = () => {
    setLang((prev) => (prev === 'en' ? 'th' : 'en'));
  };

  const t = translations[lang];

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}