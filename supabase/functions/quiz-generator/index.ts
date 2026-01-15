// supabase/functions/quiz-generator/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Question, GenFn, book1Generators } from "./book1.ts";
import { book2Generators } from "./book2.ts";
import { book3Generators } from "./book3.ts";
import { book4Generators } from "./book4.ts";
import { book5Generators } from "./book5.ts";
import { book6Generators } from "./book6.ts";
import { book7Generators } from "./book7.ts";
import { book8Generators } from "./book8.ts";
import { book9Generators } from "./book9.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

// ---------- generator selector ----------
function getGenerator(book: number, chapter: number): GenFn {
  // Default fallback generator
  const defaultGenerator = book1Generators[1];

  if (book === 1) {
    return book1Generators[chapter] || defaultGenerator;
  }

  if (book === 2) {
    return book2Generators[chapter] || defaultGenerator;
  }

  if (book === 3) {
    return book3Generators[chapter] || defaultGenerator;
  }

  if (book === 4) {
    return book4Generators[chapter] || defaultGenerator;
  }

  if (book === 5) {
    return book5Generators[chapter] || defaultGenerator;
  }

  if (book === 6) {
    return book6Generators[chapter] || defaultGenerator;
  }

  if (book === 7) {
    return book7Generators[chapter] || defaultGenerator;
  }

  if (book === 8) {
    return book8Generators[chapter] || defaultGenerator;
  }

  if (book === 9) {
    return book9Generators[chapter] || defaultGenerator;
  }

  // For any other book number, default to Book 1
  return defaultGenerator;
}

// ---------- HTTP handler ----------
serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    const body = await req.json();
    const book = Number(body.book ?? 1); // Accept book parameter, default to 1
    const chapter = Number(body.chapter ?? 1);
    const numQuestions = Number(body.numQuestions ?? 20);
    const numNumbers = Number(body.numNumbers ?? 4);

    const gen = getGenerator(book, chapter);
    const questions = gen(numQuestions, numNumbers);

    return new Response(JSON.stringify({ questions }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (err) {
    console.error("quiz-generator error:", err);
    return new Response(
      JSON.stringify({
        error: "Failed to generate questions",
        details: String(err),
      }),
      { status: 500, headers: corsHeaders },
    );
  }
});
