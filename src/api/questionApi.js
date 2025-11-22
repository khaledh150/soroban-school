// src/api/questionApi.js

const SUPABASE_URL = "https://avuqbouaiwfdpnbzqwgu.supabase.co"; // your URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ""; 
// OR hardcode it if you want (not recommended for public repo):
// const SUPABASE_ANON_KEY = "paste-your-supabase-anon-key-here";

export async function generateQuestions({ chapter, numQuestions = 20, numNumbers = 4 }) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/quiz-generator`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(SUPABASE_ANON_KEY
        ? { Authorization: `Bearer ${SUPABASE_ANON_KEY}` }
        : {}),
    },
    body: JSON.stringify({ chapter, numQuestions, numNumbers }),
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
