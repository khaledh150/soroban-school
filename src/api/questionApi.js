// src/api/questionApi.js

// Use the environment variable for the URL (or fallback to the string if env is missing)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://kbozsagzrrxssooacupw.supabase.co";

// Use the environment variable for the KEY
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export async function generateQuestions({ book = 1, chapter, numQuestions = 20, numNumbers = 4 }) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/quiz-generator`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(SUPABASE_ANON_KEY
        ? { Authorization: `Bearer ${SUPABASE_ANON_KEY}` }
        : {}),
    },
    // FIX: Added 'book' to the payload here
    body: JSON.stringify({ book, chapter, numQuestions, numNumbers }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Quiz generator error: ${res.status} ${text}`);
  }

  const data = await res.json();
  if (!data || !Array.isArray(data.questions)) {
    throw new Error("Invalid response from quiz generator");
  }
  return data.questions;
}