// supabase/functions/quiz-generator/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

type Question = { q: string; a: string };
type GenFn = (numQuestions?: number, numNumbers?: number) => Question[];

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

// ================= BOOK 1 FUNCTIONS =================

function randomChapter1Lower(numQuestions = 10, numNumbers = 4): Question[] {
  const out: Question[] = [];
  function r14() { return Math.floor(Math.random() * 4) + 1; }
  function rOp() { return Math.random() < 0.5 ? "+" : "-"; }
  let attempts = 0;
  while (out.length < numQuestions && attempts < 5000) {
    attempts++;
    const A = r14();
    const op1 = rOp();
    let validBs: number[] = [];
    for (let b = 1; b <= 4; b++) {
      if (op1 === "+") { if (b < 5 - A) validBs.push(b); } 
      else { if (b <= A) validBs.push(b); }
    }
    if (validBs.length === 0) continue;
    const B = validBs[Math.floor(Math.random() * validBs.length)];
    const stage1 = op1 === "+" ? A + B : A - B;
    const op2 = rOp();
    let validCs: number[] = [];
    for (let c = 1; c <= 4; c++) {
      if (op2 === "+") { if (c < 5 - stage1) validCs.push(c); } 
      else { if (c <= stage1) validCs.push(c); }
    }
    if (validCs.length === 0) continue;
    const C = validCs[Math.floor(Math.random() * validCs.length)];
    const D = op2 === "+" ? stage1 + C : stage1 - C;
    if (D >= 0 && D <= 4) out.push({ q: `${A} ${op1} ${B} ${op2} ${C}`, a: D.toString() });
  }
  return out;
}

function randomChapter2Lower2Digits(numQuestions = 10): Question[] {
  const out: Question[] = [];
  function r14() { return Math.floor(Math.random() * 4) + 1; }
  function r04() { return Math.floor(Math.random() * 5); }
  function rOp() { return Math.random() < 0.5 ? "+" : "-"; }
  function evalOp(x: number, o: string, y: number) { return o === "+" ? x + y : x - y; }
  function getDigitSequence(op1: string, op2: string, aGen: () => number): number[] | null {
    const A = aGen();
    if (A === 0 && op1 === "-") return null;
    let validBs: number[] = [];
    for (let b = 1; b <= 4; b++) {
      if (op1 === "+") { if (b < 5 - A) validBs.push(b); } 
      else { if (b <= A) validBs.push(b); }
    }
    if (validBs.length === 0) return null;
    const B = validBs[Math.floor(Math.random() * validBs.length)];
    const stage1 = evalOp(A, op1, B);
    if (stage1 < 0 || stage1 > 4) return null;
    let validCs: number[] = [];
    for (let c = 1; c <= 4; c++) {
      if (op2 === "+") { if (c < 5 - stage1) validCs.push(c); } 
      else { if (c <= stage1) validCs.push(c); }
    }
    if (validCs.length === 0) return null;
    const C = validCs[Math.floor(Math.random() * validCs.length)];
    const D = evalOp(stage1, op2, C);
    if (D < 0 || D > 4) return null;
    return [A, B, C];
  }
  let attempts = 0;
  while (out.length < numQuestions && attempts < 5000) {
    attempts++;
    const op1 = rOp(); const op2 = rOp();
    const tensSeq = getDigitSequence(op1, op2, r14); if (!tensSeq) continue;
    const unitsSeq = getDigitSequence(op1, op2, r04); if (!unitsSeq) continue;
    const valM = (tensSeq[0] * 10) + unitsSeq[0];
    const valN = (tensSeq[1] * 10) + unitsSeq[1];
    const valO = (tensSeq[2] * 10) + unitsSeq[2];
    const stage1 = evalOp(valM, op1, valN);
    const valP = evalOp(stage1, op2, valO);
    if (valP >= 0 && valP <= 49) out.push({ q: `${valM} ${op1} ${valN} ${op2} ${valO}`, a: valP.toString() });
  }
  return out;
}

function randomChapterChapter3Upper(numQuestions = 10): Question[] {
    const out: Question[] = [];
    function r15() { return Math.floor(Math.random() * 5) + 1; }
    function rOp() { return Math.random() < 0.5 ? "+" : "-"; }
    function evalOp(x: number, o: string, y: number) { return o === "+" ? x + y : x - y; }
    while (out.length < numQuestions) {
        const A = r15(); const B = r15(); const C = r15(); const op1 = rOp();
        if (A === 5 && op1 === "-" && B !== 5) continue;
        if (A === 5 && op1 === "+" && B === 5) continue;
        if (A === 4 && op1 === "-" && !(B >= 1 && B <= 4)) continue;
        if (A === 4 && op1 === "+" && B !== 5) continue;
        if (A <= 4 && Math.abs(evalOp(A, op1, B)) > 4) continue;
        const AB = evalOp(A, op1, B);
        if (AB < 0 || AB > 9 || AB === 5) continue;
        let op2 = AB === 0 ? "+" : rOp();
        if (AB === 4 && C !== 5) continue;
        if (A === 5 && op2 === "+" && !(AB + C >= 5 && AB + C <= 9)) continue;
        if (A === 5 && op2 === "-" && !(B > C)) continue;
        const D = evalOp(AB, op2, C);
        if (D < 0 || D > 9 || D === 5) continue;
        if (AB < 4 && !(D < 4 || C === 5)) continue;
        if (A + B === 5 || A + C === 5 || B + C === 5) continue;
        out.push({ q: `${A} ${op1} ${B} ${op2} ${C}`, a: D.toString() });
    }
    return out;
}

function randomChapter4MixLowerUpper(numQuestions = 10): Question[] {
    const out: Question[] = [];
    function r19() { return Math.floor(Math.random() * 9) + 1; }
    function rOp() { return Math.random() < 0.5 ? "+" : "-"; }
    function evalOp(x: number, o: string, y: number) { return o === "+" ? x + y : x - y; }
    function choose(generator: any, ok: any, tries = 60) {
        while (tries--) { const v = generator(); if (ok(v)) return v; } return null;
    }
    function validB_plus(A: number, B: number) {
        if (A <= 4) return !(B >= 10 - A || (B >= 5 - A && B < 5));
        if (A === 5) return B < 5; return B < 10 - A;
    }
    function validB_minus(A: number, B: number) {
        if (A <= 4) return B <= A;
        if (A === 5) return B === 5; return B <= A - 5 || B === 5;
    }
    function validC_plusplus(S: number, C: number) {
        if (S <= 4) return !(C >= 10 - S || (C >= 5 - S && C < 5));
        if (S === 5) return C < 5; return C < 10 - S;
    }
    function validC_plusminus(S: number, C: number) {
        if (2 <= S && S <= 4) return C < S;
        if (S === 5) return C === 5; return C <= S - 5 || C === 5;
    }
    function validC_minusplus(S: number, C: number) {
        if (S <= 4) return !(C >= 10 - S || (C >= 5 - S && C < 5));
        if (S === 5) return C < 5; return C < 10 - S;
    }
    function validC_minusminus(S: number, C: number) {
        if (S <= 4) return C < S;
        if (S === 5) return C === 5; return C <= S - 5 || C === 5;
    }
    while (out.length < numQuestions) {
        const A = r19(); const op1 = rOp();
        let B = choose(r19, (b: number) => (op1 === "+" ? validB_plus(A, b) : validB_minus(A, b)));
        if (B == null) continue;
        const stage1 = evalOp(A, op1, B);
        if (stage1 < 0 || stage1 > 9) continue;
        const op2 = rOp();
        let C = choose(r19, (c: number) => {
            if (op1 === "+" && op2 === "+") return validC_plusplus(stage1, c);
            if (op1 === "+" && op2 === "-") return validC_plusminus(stage1, c);
            if (op1 === "-" && op2 === "+") return validC_minusplus(stage1, c);
            return validC_minusminus(stage1, c);
        });
        if (C == null) continue;
        const D = evalOp(stage1, op2, C);
        if (D < 0 || D > 9) continue;
        out.push({ q: `${A} ${op1} ${B} ${op2} ${C}`, a: D.toString() });
    }
    return out;
}

function randomChapter5MixUpperLower2Digits(numQuestions = 10): Question[] {
  const out: Question[] = [];
  function r19() { return Math.floor(Math.random() * 9) + 1; }
  function r09() { return Math.floor(Math.random() * 10); }
  function rOp() { return Math.random() < 0.5 ? "+" : "-"; }
  function evalOp(x: number, o: string, y: number) { return o === "+" ? x + y : x - y; }
  function choose(generator: () => number, ok: (v: number) => boolean, tries = 100): number | null {
    while (tries--) { const v = generator(); if (ok(v)) return v; } return null;
  }
  function validB_plus(A: number, B: number) {
    if (A <= 4) return !(B >= 10 - A || (B >= 5 - A && B < 5));
    if (A === 5) return B < 5; return B < 10 - A;
  }
  function validB_minus(A: number, B: number) {
    if (A <= 4) return B <= A;
    if (A === 5) return B === 5; return B <= A - 5 || B === 5;
  }
  function validC_plusplus(S: number, C: number) {
    if (S <= 4) return !(C >= 10 - S || (C >= 5 - S && C < 5));
    if (S === 5) return C < 5; return C < 10 - S;
  }
  function validC_plusminus(S: number, C: number) {
    if (2 <= S && S <= 4) return C < S;
    if (S === 5) return C === 5; return C <= S - 5 || C === 5;
  }
  function validC_minusplus(S: number, C: number) {
    if (S <= 4) return !(C >= 10 - S || (C >= 5 - S && C < 5));
    if (S === 5) return C < 5; return C < 10 - S;
  }
  function validC_minusminus(S: number, C: number) {
    if (S <= 4) return C < S;
    if (S === 5) return C === 5; return C <= S - 5 || C === 5;
  }
  function getDigitSequence(op1: string, op2: string, aGen: () => number): number[] | null {
    const A = aGen();
    let B = op1 === "+" ? choose(r19, (b) => validB_plus(A, b)) : choose(r19, (b) => validB_minus(A, b));
    if (B == null) return null;
    const stage1 = evalOp(A, op1, B);
    if (stage1 < 0 || stage1 > 9) return null;
    let C = choose(r19, (c) => {
      if (op1 === "+" && op2 === "+") return validC_plusplus(stage1, c);
      if (op1 === "+" && op2 === "-") return validC_plusminus(stage1, c);
      if (op1 === "-" && op2 === "+") return validC_minusplus(stage1, c);
      return validC_minusminus(stage1, c);
    });
    if (C == null) return null;
    const D = evalOp(stage1, op2, C);
    if (D < 0 || D > 9) return null;
    return [A, B, C];
  }
  let safetyCounter = 0;
  while (out.length < numQuestions && safetyCounter < 5000) {
    safetyCounter++;
    const op1 = rOp(); const op2 = rOp();
    const tensSeq = getDigitSequence(op1, op2, r19); if (!tensSeq) continue;
    const unitsSeq = getDigitSequence(op1, op2, r09); if (!unitsSeq) continue;
    const valA = (tensSeq[0] * 10) + unitsSeq[0];
    const valB = (tensSeq[1] * 10) + unitsSeq[1];
    const valC = (tensSeq[2] * 10) + unitsSeq[2];
    const stage1 = evalOp(valA, op1, valB);
    const valD = evalOp(stage1, op2, valC);
    out.push({ q: `${valA} ${op1} ${valB} ${op2} ${valC}`, a: valD.toString() });
  }
  return out;
}

function randomChapter6FivebuddyPlus4(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  while (questions.length < numQuestions) {
    let A = 0, B = 0, C = 0, op1 = "+", op2 = "+";
    const startWithPlus = Math.random() < 0.5;
    if (startWithPlus) {
      op1 = "+"; A = Math.floor(Math.random() * 4) + 1; B = 4;
      const step1 = A + B;
      op2 = Math.random() < 0.5 ? "+" : "-";
      if (op2 === "+") {
        const limit = 10 - step1; const maxC = limit - 1;
        if (maxC < 1) continue; 
        C = Math.floor(Math.random() * maxC) + 1;
      } else {
        if (step1 === 5) { C = Math.random() < 0.5 ? 5 : 0; } 
        else { const o1 = step1 - 1; const o2 = step1 - 5; C = Math.random() < 0.5 ? o1 : o2; }
      }
    } else {
      op1 = "-"; A = Math.floor(Math.random() * 4) + 6; B = 5;
      const step1 = A - B;
      op2 = Math.random() < 0.5 ? "+" : "-";
      if (op2 === "+") { C = 4; } else { C = Math.floor(Math.random() * step1) + 1; }
    }
    let result = op1 === "+" ? A + B : A - B;
    result = op2 === "+" ? result + C : result - C;
    const isCValid = (C >= 1 && C <= 9) || (C === 0);
    if (A >= 1 && A <= 9 && B >= 4 && B <= 5 && isCValid && result >= 0 && result <= 9) {
      questions.push({ q: `${A} ${op1} ${B} ${op2} ${C}`, a: result.toString() });
    }
  }
  return questions;
}

function randomChapter7FivebuddyPlus3(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  let attempts = 0;
  while (questions.length < numQuestions && attempts < 5000) {
    attempts++;
    let A = 0, B = 0, C = 0, op1: "+" | "-" = "+", op2: "+" | "-" = "+";
    let isValidQuestion = true;
    const startWithPlus = Math.random() < 0.5;
    if (startWithPlus) {
      op1 = "+"; A = Math.floor(Math.random() * 4) + 1; B = 3;
      const step1 = A + B;
      op2 = Math.random() < 0.5 ? "+" : "-";
      if (op2 === "+") {
        if (step1 === 4) { C = 3; } 
        else { const limit = 10 - step1; const maxC = limit - 1; if (maxC < 1) { isValidQuestion = false; continue; } C = Math.floor(Math.random() * maxC) + 1; }
      } else {
        if (step1 === 4) { C = Math.floor(Math.random() * 3) + 1; } 
        else if (step1 === 5) { C = Math.random() < 0.5 ? 5 : 0; } 
        else { const o1 = step1 - 1; const o2 = step1 - 5; C = Math.random() < 0.5 ? o1 : o2; }
      }
    } else {
      op1 = "-"; A = Math.floor(Math.random() * 4) + 6; B = 5;
      const step1 = A - B; op2 = Math.random() < 0.5 ? "+" : "-";
      if (op2 === "+") { C = 3; } else { C = Math.floor(Math.random() * step1) + 1; }
    }
    let result = op1 === "+" ? A + B : A - B;
    result = op2 === "+" ? result + C : result - C;
    const isCValid = (C >= 1 && C <= 9) || (C === 0 && op1 === "+" && op2 === "-" && A + B === 5); 
    if (isValidQuestion && A >= 1 && A <= 9 && B >= 3 && B <= 5 && B !== 4 && isCValid && result >= 0 && result <= 9) {
      questions.push({ q: `${A} ${op1} ${B} ${op2} ${C}`, a: result.toString() });
    }
  }
  return questions;
}  

function randomChapter8FivebuddyPlus2(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  let attempts = 0;
  while (questions.length < numQuestions && attempts < 5000) {
    attempts++;
    let A = 0, B = 0, C = 0, op1: "+" | "-" = "+", op2: "+" | "-" = "+";
    let isValidQuestion = true;
    const startWithPlus = Math.random() < 0.7; 
    if (startWithPlus) {
      op1 = "+"; A = Math.floor(Math.random() * 4) + 1; B = 2;
      const step1 = A + B; op2 = Math.random() < 0.5 ? "+" : "-";
      if (op2 === "+") {
        if (step1 === 3 || step1 === 4) { C = 2; } 
        else { const limit = 10 - step1; const maxC = limit - 1; if (maxC < 1) { isValidQuestion = false; continue; } C = Math.floor(Math.random() * maxC) + 1; }
      } else {
        if (step1 === 3 || step1 === 4) { C = Math.floor(Math.random() * (step1 - 1)) + 1; } 
        else if (step1 === 5) { C = Math.random() < 0.5 ? 5 : 0; } 
        else { const o1 = step1 - 1; const o2 = step1 - 5; C = Math.random() < 0.5 ? o1 : o2; }
      }
    } else {
      op1 = "-"; A = Math.floor(Math.random() * 4) + 6; B = 5;
      const step1 = A - B; op2 = "+"; C = 2;
    }
    let result = op1 === "+" ? A + B : A - B;
    result = op2 === "+" ? result + C : result - C;
    const isCValid = (C >= 1 && C <= 9) || (C === 0 && op1 === "+" && op2 === "-" && A + B === 5); 
    if (isValidQuestion && A >= 1 && A <= 9 && (B === 2 || B === 5) && isCValid && result >= 0 && result <= 9) {
      questions.push({ q: `${A} ${op1} ${B} ${op2} ${C}`, a: result.toString() });
    }
  }
  return questions;
}

function randomChapter9FivebuddyPlus1(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  let attempts = 0;
  while (questions.length < numQuestions && attempts < 5000) {
    attempts++;
    let A = 0, B = 0, C = 0, op1 = "+", op2 = "+", D = 0;
    const caseType = Math.random() < 0.5 ? 1 : 2;
    if (caseType === 1) {
      op1 = "+"; A = 4; B = 1; const step1 = A + B; op2 = Math.random() < 0.5 ? "+" : "-";
      if (op2 === "+") { C = Math.floor(Math.random() * 4) + 1; D = step1 + C; } else { C = 5; D = step1 - C; }
    } else {
      op1 = "-"; A = 9; B = 5; const step1 = A - B; op2 = "+"; C = 1; D = step1 + C;
    }
    if (A >= 1 && A <= 9 && C >= 1 && C <= 9 && D >= 0 && D <= 9) {
      questions.push({ q: `${A} ${op1} ${B} ${op2} ${C}`, a: D.toString() });
    }
  }
  return questions;
}

function randomChapter10FiveBuddyPlus(numQuestions = 10): Question[] {
    const out: Question[] = [];
    while (out.length < numQuestions) {
        const op1 = Math.random() < 0.5 ? "+" : "-";
        const op2 = Math.random() < 0.5 ? "+" : "-";
        let A, B, C;
        if (op1 === "+") {
            A = Math.floor(Math.random() * 4) + 1; const pivot = 5 - A;
            switch (Math.floor(Math.random() * 6) + 1) {
                case 1: B = pivot; C = op2 === "+" ? Math.floor(Math.random() * 4) + 1 : 5; break;
                case 2: if (pivot <= 1 || op2 !== "+") continue; B = Math.floor(Math.random() * (pivot - 1)) + 1; C = 5 - (A + B); break;
                case 3: if (pivot >= 5 || op2 !== "+") continue; B = Math.floor(Math.random() * (5 - pivot)) + (pivot + 1); C = Math.floor(Math.random() * (A + B - 1)) + 1; break;
                case 4: if (op2 !== "-") continue; B = pivot; C = 5; break;
                case 5: if (pivot <= 1 || op2 !== "-") continue; B = Math.floor(Math.random() * (pivot - 1)) + 1; C = Math.floor(Math.random() * (A + B)) + 1; break;
                case 6: if (pivot >= 5 || op2 !== "-") continue; B = Math.floor(Math.random() * (5 - pivot)) + (pivot + 1); C = [A + B - 5, 5][Math.random() < 0.5 ? 0 : 1]; break;
            }
        } else {
            A = Math.floor(Math.random() * 9) + 1;
            if (A >= 1 && A <= 4) { if (A <= 1 || op2 !== "+") continue; B = Math.floor(Math.random() * (A - 1)) + 1; C = 5 - (A - B); } 
            else if (A >= 6 && A <= 9) { if (op2 !== "+") continue; if (Math.random() < 0.5 && A - 5 >= 1) { B = Math.floor(Math.random() * (A - 5)) + 1; C = Math.floor(Math.random() * 4) + 1; } else { B = 5; C = 5 - (A - B); } } 
            else { continue; }
        }
        // @ts-ignore
        if (A === undefined || B === undefined || C === undefined) continue;
        const stage1 = op1 === "+" ? A + B : A - B;
        const D = op2 === "+" ? stage1 + C : stage1 - C;
        if (D < 0 || D > 9) continue;
        out.push({ q: `${A} ${op1} ${B} ${op2} ${C}`, a: D.toString() });
    }
    return out;
}

function randomChapter11FiveBuddyMinus4(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  let attempts = 0;
  while (questions.length < numQuestions && attempts < 5000) {
    attempts++;
    let A = 0, B = 0, C = 4, op1 = "+", op2 = "-", D = 0;
    const caseType = Math.random() < 0.5 ? 1 : 2;
    if (caseType === 1) { op1 = "+"; A = Math.floor(Math.random() * 4) + 1; const o1 = 5; const o2 = 5 - A; B = Math.random() < 0.5 ? o1 : o2; C = 4; D = A + B - C; } 
    else { op1 = "-"; const aOpt = [6, 7, 8, 9]; A = aOpt[Math.floor(Math.random() * aOpt.length)]; B = A - 5; C = 4; D = A - B - C; }
    if (A >= 1 && A <= 9 && B >= 1 && B <= 9 && C === 4 && D >= 0 && D <= 9) {
      questions.push({ q: `${A} ${op1} ${B} ${op2} ${C}`, a: D.toString() });
    }
  }
  return questions;
}

function randomChapter12FivebuddyMinus3(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  let attempts = 0;
  while (questions.length < numQuestions && attempts < 5000) {
    attempts++;
    let A = 0, B = 0, C = 3, op1 = "+", op2 = "-", D = 0;
    const caseType = Math.random() < 0.5 ? 1 : 2;
    if (caseType === 1) { op1 = "+"; A = Math.floor(Math.random() * 4) + 1; const o1 = 5; const o2 = 5 - A; B = Math.random() < 0.5 ? o1 : o2; C = 3; D = A + B - C; } 
    else { op1 = "-"; const aOpt = [6, 7, 8, 9]; A = aOpt[Math.floor(Math.random() * aOpt.length)]; B = A - 5; C = 3; D = A - B - C; }
    if (A >= 1 && A <= 9 && B >= 1 && B <= 9 && C === 3 && D >= 0 && D <= 9) {
      questions.push({ q: `${A} ${op1} ${B} ${op2} ${C}`, a: D.toString() });
    }
  }
  return questions;
}

function randomChapter13FivebuddyMinus2(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  let attempts = 0;
  while (questions.length < numQuestions && attempts < 5000) {
    attempts++;
    let A = 0, B = 0, C = 2, op1 = "+", op2 = "-", D = 0;
    const caseType = Math.random() < 0.5 ? 1 : 2;
    if (caseType === 1) { op1 = "+"; A = Math.floor(Math.random() * 4) + 1; B = 5 - A; C = 2; D = A + B - C; } 
    else { op1 = "-"; const aOpt = [6, 7, 8, 9]; A = aOpt[Math.floor(Math.random() * aOpt.length)]; B = A - 5; C = 2; D = A - B - C; }
    if (A >= 1 && A <= 9 && B >= 1 && B <= 9 && C === 2 && D >= 0 && D <= 9) {
      questions.push({ q: `${A} ${op1} ${B} ${op2} ${C}`, a: D.toString() });
    }
  }
  return questions;
}

function randomChapter14FivebuddyMinus1(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  let attempts = 0;
  while (questions.length < numQuestions && attempts < 5000) {
    attempts++;
    let A = 0, B = 0, C = 1, op1 = "+", op2 = "-", D = 0;
    const caseType = Math.random() < 0.5 ? 1 : 2;
    if (caseType === 1) { op1 = "+"; A = Math.floor(Math.random() * 4) + 1; B = 5 - A; C = 1; D = A + B - C; } 
    else { op1 = "-"; const aOpt = [6, 7, 8, 9]; A = aOpt[Math.floor(Math.random() * aOpt.length)]; B = A - 5; C = 1; D = A - B - C; }
    if (A >= 1 && A <= 9 && B >= 1 && B <= 9 && C === 1 && D >= 0 && D <= 9) {
      questions.push({ q: `${A} ${op1} ${B} ${op2} ${C}`, a: D.toString() });
    }
  }
  return questions;
}

function randomChapter15FiveBuddyMinus(numQuestions = 10): Question[] {
    let A, B, C, op2, D, expr;
    const questions: Question[] = [];
    while (questions.length < numQuestions) {
        let caseType = Math.random() < 0.5 ? 1 : 2;
        if (caseType === 1) {
            A = 5; B = [1, 2, 3, 4][Math.floor(Math.random() * 4)]; let AB = A - B; op2 = Math.random() < 0.5 ? "+" : "-";
            if (op2 === "+") { if (AB === 4) { C = Math.floor(Math.random() * 5) + 1; } else if (AB < 4) { let cMin = 5, cMax = 10 - AB; let cOptions = []; for (let x = cMin; x < cMax; x++) cOptions.push(x); if (cOptions.length === 0) continue; C = cOptions[Math.floor(Math.random() * cOptions.length)]; } else { C = Math.floor(Math.random() * 5) + 1; } D = AB + C; } 
            else { if (AB < 1) continue; C = Math.floor(Math.random() * AB) + 1; D = AB - C; }
            expr = `${A} - ${B} ${op2} ${C}`;
        } else {
            A = [6, 7, 8][Math.floor(Math.random() * 3)]; let bMin = A - 5 + 1, bMax = 4; let bOptions = []; for (let x = bMin; x < bMax; x++) bOptions.push(x); if (bOptions.length === 0) continue; B = bOptions[Math.floor(Math.random() * bOptions.length)]; let AB = A - B; op2 = Math.random() < 0.5 ? "+" : "-";
            if (op2 === "+") { C = Math.floor(Math.random() * 5) + 1; D = AB + C; } else { if (AB < 1) continue; C = Math.floor(Math.random() * AB) + 1; D = AB - C; }
            expr = `${A} - ${B} ${op2} ${C}`;
        }
        if ([A, B, C].every((v) => v >= 1 && v <= 9) && D >= 0 && D <= 9) { questions.push({ q: expr, a: D.toString() }); }
    }
    return questions;
}

function randomChapter16FiveBuddyPlusMinus(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const uniqueQuestions = new Set<string>();
  let attempts = 0;
  while (questions.length < numQuestions && attempts < 5000) {
    attempts++;
    let A = 0, B = 0, C = 0, op1: "+" | "-" = "+", op2: "+" | "-" = "+";
    let isValidQuestion = true;
    const startWithPlus = Math.random() < 0.5;
    if (startWithPlus) {
      op1 = "+"; A = Math.floor(Math.random() * 4) + 1;
      const B_small_min = 5 - A; const B_small_max = 4; const use_B_small = Math.random() < 0.5;
      if (use_B_small && B_small_min <= B_small_max) {
        B = Math.floor(Math.random() * (B_small_max - B_small_min + 1)) + B_small_min; const step1 = A + B; op2 = Math.random() < 0.5 ? "+" : "-";
        if (op2 === "+") { const C_max = 9 - step1; if (C_max < 1) { isValidQuestion = false; continue; } const C_options: number[] = [1, 2, 3, 4, 5].filter(c => c <= C_max); if (C_options.length === 0) { isValidQuestion = false; continue; } C = C_options[Math.floor(Math.random() * C_options.length)]; } else { const C_max = Math.min(9, step1); C = Math.floor(Math.random() * C_max) + 1; }
      } else {
        B = 5; const step1 = A + B; op2 = "-"; const C_min = step1 - 5; const C_max = 4; C = Math.floor(Math.random() * (C_max - C_min + 1)) + C_min; 
      }
    } else {
      op1 = "-"; A = Math.floor(Math.random() * 4) + 6;
      const B_min = A - 4; const B_max = 4; if (A === 9) { isValidQuestion = false; continue; }
      B = Math.floor(Math.random() * (B_max - B_min + 1)) + B_min; const step1 = A - B; op2 = "+"; C = 5 - step1; 
    }
    let result = op1 === "+" ? A + B : A - B;
    result = op2 === "+" ? result + C : result - C;
    const questionString = `${A} ${op1} ${B} ${op2} ${C}`;
    if (isValidQuestion && C >= 1 && C <= 9 && result >= 0 && result <= 9 && !uniqueQuestions.has(questionString)) {
      questions.push({ q: questionString, a: result.toString() });
      uniqueQuestions.add(questionString); 
    }
  }
  return questions;
}

function randomChapter17Mix5buddy2digits(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  let attempts = 0;
  function getDigitComponents(op1: string, op2: string): { A: number; B: number; C: number; D: number } | null {
    let A = 0, B = 0, C = 0, D = 0;
    if (op1 === "+") {
      A = Math.floor(Math.random() * 4) + 1; B = 5 - A; const step1 = A + B;
      if (op2 === "+") { C = Math.floor(Math.random() * 4) + 1; D = step1 + C; } else { C = 5; D = step1 - C; }
    } else {
      const aOptions = [6, 7, 8, 9]; A = aOptions[Math.floor(Math.random() * aOptions.length)];
      const bOptions: number[] = [5]; const maxValForOption1 = A - 5; for (let x = 1; x <= maxValForOption1; x++) bOptions.push(x);
      B = bOptions[Math.floor(Math.random() * bOptions.length)]; const step1 = A - B;
      if (op2 === "+") { if (step1 === 5) { C = Math.floor(Math.random() * 4) + 1; } else { C = 5 - step1; } D = step1 + C; } 
      else { if (step1 === 5) { C = 5; } else { C = Math.floor(Math.random() * step1) + 1; } D = step1 - C; }
    }
    if (A >= 1 && A <= 9 && B >= 1 && B <= 9 && C >= 1 && C <= 9 && D >= 0 && D <= 9) return { A, B, C, D };
    return null;
  }
  while (questions.length < numQuestions && attempts < 5000) {
    attempts++;
    const op1 = Math.random() < 0.5 ? "+" : "-"; const op2 = Math.random() < 0.5 ? "+" : "-";
    const tens = getDigitComponents(op1, op2); if (!tens) continue;
    const units = getDigitComponents(op1, op2); if (!units) continue;
    const M = (tens.A * 10) + units.A; const N = (tens.B * 10) + units.B; const O = (tens.C * 10) + units.C;
    let step1 = 0; if (op1 === "+") step1 = M + N; else step1 = M - N;
    let P = 0; if (op2 === "+") P = step1 + O; else P = step1 - O;
    if (P >= 0 && P <= 99) questions.push({ q: `${M} ${op1} ${N} ${op2} ${O}`, a: P.toString() });
  }
  return questions;
}

// ================= BOOK 2 FUNCTIONS (TEN BUDDY) =================

function randomBook2Chapter1TenBuddyPlus9(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const uniqueQuestions = new Set<string>();
  let attempts = 0;
  while (questions.length < numQuestions && attempts < 5000) {
    attempts++;
    let A = 0, B = 0, C = 0;
    let op1: "+" | "-" = "+", op2: "+" | "-" = "+";
    let isValidQuestion = true;
    const startWithPlus = Math.random() < 0.65;
    if (startWithPlus) {
      op1 = "+";
      const use_A_small = Math.random() < 0.5;
      if (use_A_small) {
        A = Math.floor(Math.random() * 4) + 1; B = 9; const step1 = A + B; 
        op2 = Math.random() < 0.5 ? "+" : "-";
        if (op2 === "+") {
            const C_not_allowed = 20 - step1; const C_max_allowed = Math.min(9, step1 - 1); 
            const C_options: number[] = [];
            for (let i = 1; i <= C_max_allowed; i++) { if (i !== C_not_allowed) C_options.push(i); }
            if (C_options.length === 0) { isValidQuestion = false; continue; }
            C = C_options[Math.floor(Math.random() * C_options.length)];
        } else {
            const C_max = step1 - 10; if (C_max < 1) { isValidQuestion = false; continue; } 
            C = Math.floor(Math.random() * C_max) + 1;
        }
      } else {
        A = Math.floor(Math.random() * 4) + 6; B = 9; const step1 = A + B; 
        op2 = "+"; 
        if (step1 === 15) { C = 0; } else { C = 9; }
      }
    } else {
      op1 = "-"; A = Math.floor(Math.random() * 4) + 6; B = 5;
      const step1 = A - B; op2 = "+"; C = 9; 
    }
    let result = op1 === "+" ? A + B : A - B;
    result = op2 === "+" ? result + C : result - C;
    const questionString = `${A} ${op1} ${B} ${op2} ${C}`;
    const isCValid = (C >= 1 && C <= 9) || (C === 0 && A === 6 && B === 9); 
    if (isValidQuestion && A >= 1 && A <= 9 && B >= 1 && B <= 9 && isCValid && result >= 0 && result <= 50 && !uniqueQuestions.has(questionString)) {
      questions.push({ q: questionString, a: result.toString() });
      uniqueQuestions.add(questionString); 
    }
  }
  return questions;
}

function randomBook2Chapter2TenBuddyPlus8(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const uniqueQuestions = new Set<string>();
  let attempts = 0;
  while (questions.length < numQuestions && attempts < 5000) {
    attempts++;
    let A = 0, B = 0, C = 0;
    let op1: "+" | "-" = "+", op2: "+" | "-" = "+";
    let isValidQuestion = true;
    const startWithPlus = Math.random() < 0.65; 
    if (startWithPlus) {
      op1 = "+";
      const A_options = [1, 2, 3, 4, 7, 8, 9];
      A = A_options[Math.floor(Math.random() * A_options.length)];
      if (A <= 4) {
        B = 8; const step1 = A + B; op2 = Math.random() < 0.5 ? "+" : "-";
        if (op2 === "+") {
            if (step1 === 9) { C = Math.random() < 0.5 ? 8 : 9; } else { C = Math.floor(Math.random() * 9) + 1; }
        } else {
            if (step1 < 10) { const C_max = step1 - 1; C = Math.floor(Math.random() * C_max) + 1; } 
            else { isValidQuestion = false; continue; }
        }
      } else { 
        B = 8; const step1 = A + B; op2 = "+"; 
        if (step1 === 15 || step1 === 16) { C = 0; } else { C = 8; }
      }
    } else {
      op1 = "-"; A = Math.floor(Math.random() * 4) + 6; B = 5;
      const step1 = A - B; op2 = "+"; C = 8; 
    }
    let result = op1 === "+" ? A + B : A - B;
    result = op2 === "+" ? result + C : result - C;
    const questionString = `${A} ${op1} ${B} ${op2} ${C}`;
    const isCValid = (C >= 1 && C <= 9) || (C === 0 && B === 8 && (A === 7 || A === 8)); 
    if (isValidQuestion && A >= 1 && A <= 9 && B >= 1 && B <= 9 && isCValid && result >= 0 && result <= 50 && !uniqueQuestions.has(questionString)) {
      questions.push({ q: questionString, a: result.toString() });
      uniqueQuestions.add(questionString); 
    }
  }
  return questions;
}

function randomBook2Chapter3TenBuddyPlus7(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  let attempts = 0;
  while (questions.length < numQuestions && attempts < 5000) {
    attempts++;
    let A = 0, B = 0, C = 0, op1 = "+", op2 = "+", D = 0;
    const op1Type = Math.random() < 0.6 ? "+" : "-"; 
    if (op1Type === "+") {
      op1 = "+";
      const subType = Math.random() < 0.7 ? 1 : 2; 
      if (subType === 1) {
        A = Math.floor(Math.random() * 4) + 1; B = 7; const step1 = A + B;
        op2 = Math.random() < 0.5 ? "+" : "-";
        if (op2 === "+") {
          if (step1 < 10) { const cOptions = [7, 8, 9]; C = cOptions[Math.floor(Math.random() * cOptions.length)]; } 
          else { C = Math.floor(Math.random() * 9) + 1; }
          D = step1 + C;
        } else {
          if (step1 <= 9) { const maxC = step1 - 1; if (maxC < 1) continue; C = Math.floor(Math.random() * maxC) + 1; } 
          else { const maxC = step1 - 10; if (maxC < 1) continue; C = Math.floor(Math.random() * maxC) + 1; }
          D = step1 - C;
        }
      } else {
        const aOptions = [8, 9]; A = aOptions[Math.floor(Math.random() * aOptions.length)]; B = 7; op2 = "+"; 
        const step1 = A + B; C = 0; D = step1 + C;
      }
    } else {
      op1 = "-"; const aOptions = [6, 7, 8, 9]; A = aOptions[Math.floor(Math.random() * aOptions.length)];
      B = 5; op2 = "+"; C = 7; const step1 = A - B; D = step1 + C;
    }
    if (A >= 1 && A <= 9 && B >= 1 && B <= 9 && C >= 0 && C <= 9 && D >= 0 && D <= 50) {
      questions.push({ q: `${A} ${op1} ${B} ${op2} ${C}`, a: D.toString() });
    }
  }
  return questions;
}

function randomBook2Chapter4TenBuddyPlus6(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const uniqueQuestions = new Set<string>();
  let attempts = 0;
  while (questions.length < numQuestions && attempts < 5000) {
    attempts++;
    let A = 0, B = 0, C = 0, op1: "+" | "-" = "+", op2: "+" | "-" = "+";
    const scenario = Math.floor(Math.random() * 4);
    if (scenario === 0) {
      op1 = "+"; A = Math.floor(Math.random() * 4) + 1; op2 = "+";
      const option1 = 2; const option2 = 8 - A;
      const bOptions = [option1]; if (option2 >= 1 && option2 <= 9 && option2 !== 2) { bOptions.push(option2); }
      B = bOptions[Math.floor(Math.random() * bOptions.length)]; C = 2;
    } else if (scenario === 1) {
      op1 = "+"; A = 5; B = 8 - A; if (B < 1 || B > 9) continue;
      op2 = "+"; C = 2;
    } else if (scenario === 2) {
      op1 = "+"; A = Math.floor(Math.random() * 4) + 6; op2 = "+";
      const optB1 = 2; const optB2 = 18 - A;
      const bOptions: number[] = []; if (optB1 >= 1 && optB1 <= 9) bOptions.push(optB1); if (optB2 >= 1 && optB2 <= 9 && optB2 !== optB1) bOptions.push(optB2);
      if (bOptions.length === 0) continue; B = bOptions[Math.floor(Math.random() * bOptions.length)];
      C = 2;
    } else {
      op1 = "-"; A = Math.floor(Math.random() * 2) + 8; B = A - 8; if (B < 1 || B > 9) continue;
      op2 = "+"; C = 2;
    }
    let result = op1 === "+" ? A + B : A - B;
    result = op2 === "+" ? result + C : result - C;
    const questionString = `${A} ${op1} ${B} ${op2} ${C}`;
    if (A >= 1 && A <= 9 && B >= 1 && B <= 9 && C >= 1 && C <= 9 && result >= 0 && result <= 50 && !uniqueQuestions.has(questionString)) {
       questions.push({ q: questionString, a: result.toString() });
       uniqueQuestions.add(questionString);
    }
  }
  return questions;
}

function randomBook2Chapter5TenBuddyPlus5(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const uniqueQuestions = new Set<string>();
  let attempts = 0;
  while (questions.length < numQuestions && attempts < 5000) {
    attempts++;
    let A = 0, B = 0, C = 0, op1: "+" | "-" = "+", op2: "+" | "-" = "+";
    let isValidQuestion = true;
    const startWithPlus = Math.random() < 0.7; 
    if (startWithPlus) {
      op1 = "+"; A = Math.floor(Math.random() * 9) + 1;
      if (A <= 4) {
        op2 = "+"; const optionB1 = 5; const optionB2 = 5 - A; B = Math.random() < 0.5 ? optionB1 : optionB2; C = 5;
      } else if (A === 5) {
        B = Math.floor(Math.random() * 4) + 1; op2 = "+"; C = 5;
      } else { 
        op2 = "+"; const optionB1 = 5; const optionB2 = 15 - A; B = Math.random() < 0.5 ? optionB1 : optionB2;
        const sumAB = A + B;
        if (sumAB === 15) { C = 5; } 
        else { const limit = sumAB - 10; if (limit >= 1) { if (Math.random() < 0.5) { C = 5; } else { C = Math.floor(Math.random() * limit) + 1; } } else { C = 5; } }
      }
    } else {
      op1 = "-"; A = Math.floor(Math.random() * 4) + 6; B = A - 5; op2 = "+"; C = 5;
    }
    let result = op1 === "+" ? A + B : A - B;
    result = op2 === "+" ? result + C : result - C;
    const questionString = `${A} ${op1} ${B} ${op2} ${C}`;
    if (isValidQuestion && A >= 1 && A <= 9 && B >= 1 && B <= 9 && C >= 1 && C <= 9 && result >= 0 && result <= 50 && !uniqueQuestions.has(questionString)) {
      questions.push({ q: questionString, a: result.toString() });
      uniqueQuestions.add(questionString); 
    }
  }
  return questions;
}

function randomBook2Chapter6TenBuddyPlus4(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const uniqueQuestions = new Set<string>();
  let attempts = 0;
  while (questions.length < numQuestions && attempts < 5000) {
    attempts++;
    let A = 0, B = 0, C = 0, op1: "+" | "-" = "+", op2: "+" | "-" = "+";
    let isValidQuestion = true;
    const startWithPlus = Math.random() < 0.7; 
    if (startWithPlus) {
      op1 = "+"; A = Math.floor(Math.random() * 9) + 1;
      if (A <= 4) {
        op2 = "+"; const optionB1 = 4; const optionB2 = 6 - A; B = Math.random() < 0.5 ? optionB1 : optionB2; C = 4;
      } else if (A === 5) {
        B = Math.floor(Math.random() * 4) + 1; op2 = "+"; C = 4;
      } else { 
        op2 = "+"; const valB1 = 4; const valB2 = 16 - A;
        const validBs: number[] = [valB1]; if (valB2 >= 1 && valB2 <= 9) { validBs.push(valB2); }
        B = validBs[Math.floor(Math.random() * validBs.length)];
        const sumAB = A + B;
        if (sumAB === 16) { C = 4; } 
        else { const limit = sumAB - 10; if (limit >= 1) { if (Math.random() < 0.5) { C = 5; } else { C = Math.floor(Math.random() * limit) + 1; } } else { C = 5; } }
      }
    } else {
      op1 = "-"; const validAs = [7, 8, 9]; A = validAs[Math.floor(Math.random() * validAs.length)];
      B = A - 6; op2 = "+"; C = 4;
    }
    let result = op1 === "+" ? A + B : A - B;
    result = op2 === "+" ? result + C : result - C;
    const questionString = `${A} ${op1} ${B} ${op2} ${C}`;
    if (isValidQuestion && A >= 1 && A <= 9 && B >= 1 && B <= 9 && C >= 1 && C <= 9 && result >= 0 && result <= 50 && !uniqueQuestions.has(questionString)) {
      questions.push({ q: questionString, a: result.toString() });
      uniqueQuestions.add(questionString); 
    }
  }
  return questions;
}

function randomBook2Chapter7TenBuddyPlus3(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const uniqueQuestions = new Set<string>();
  let attempts = 0;
  while (questions.length < numQuestions && attempts < 5000) {
    attempts++;
    let A = 0, B = 0, C = 0, op1: "+" | "-" = "+", op2: "+" | "-" = "+";
    const scenario = Math.floor(Math.random() * 4);
    if (scenario === 0) {
      op1 = "+"; A = Math.floor(Math.random() * 4) + 1; op2 = "+";
      const option1 = 3; const option2 = 7 - A;
      const bOptions = [option1]; if (option2 >= 1 && option2 <= 9 && option2 !== 3) { bOptions.push(option2); }
      B = bOptions[Math.floor(Math.random() * bOptions.length)]; C = 3;
    } else if (scenario === 1) {
      op1 = "+"; A = 5; B = Math.floor(Math.random() * 4) + 1; op2 = "+"; C = 3;
    } else if (scenario === 2) {
      op1 = "+"; A = Math.floor(Math.random() * 4) + 6; op2 = "+";
      const optB1 = 3; const optB2 = 17 - A;
      const bOptions: number[] = []; if (optB1 >= 1 && optB1 <= 9) bOptions.push(optB1); if (optB2 >= 1 && optB2 <= 9 && optB2 !== optB1) bOptions.push(optB2);
      if (bOptions.length === 0) continue; B = bOptions[Math.floor(Math.random() * bOptions.length)];
      const sumAB = A + B;
      if (sumAB === 17) { C = 3; } else { const cOptions = [5]; const limit = sumAB - 10; if (limit >= 1) { for (let k = 1; k <= limit; k++) { if (k !== 5) cOptions.push(k); } } C = cOptions[Math.floor(Math.random() * cOptions.length)]; }
    } else {
      op1 = "-"; A = Math.floor(Math.random() * 3) + 7; B = A - 7; if (B < 1 || B > 9) continue;
      op2 = "+"; C = 3;
    }
    let result = op1 === "+" ? A + B : A - B;
    result = op2 === "+" ? result + C : result - C;
    const questionString = `${A} ${op1} ${B} ${op2} ${C}`;
    if (A >= 1 && A <= 9 && B >= 1 && B <= 9 && C >= 1 && C <= 9 && result >= 0 && result <= 50 && !uniqueQuestions.has(questionString)) {
        questions.push({ q: questionString, a: result.toString() });
        uniqueQuestions.add(questionString);
    }
  }
  return questions;
}

function randomBook2Chapter8TenBuddyPlus2(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const uniqueQuestions = new Set<string>();
  let attempts = 0;
  while (questions.length < numQuestions && attempts < 5000) {
    attempts++;
    let A = 0, B = 0, C = 0, op1: "+" | "-" = "+", op2: "+" | "-" = "+";
    const scenario = Math.floor(Math.random() * 4);
    if (scenario === 0) {
      op1 = "+"; A = Math.floor(Math.random() * 4) + 1; op2 = "+";
      const option1 = 2; const option2 = 8 - A;
      const bOptions = [option1]; if (option2 >= 1 && option2 <= 9 && option2 !== 2) { bOptions.push(option2); }
      B = bOptions[Math.floor(Math.random() * bOptions.length)]; C = 2;
    } else if (scenario === 1) {
      op1 = "+"; A = 5; B = 8 - A; if (B < 1 || B > 9) continue; op2 = "+"; C = 2;
    } else if (scenario === 2) {
      op1 = "+"; A = Math.floor(Math.random() * 4) + 6; op2 = "+";
      const optB1 = 2; const optB2 = 18 - A;
      const bOptions: number[] = []; if (optB1 >= 1 && optB1 <= 9) bOptions.push(optB1); if (optB2 >= 1 && optB2 <= 9 && optB2 !== optB1) bOptions.push(optB2);
      if (bOptions.length === 0) continue; B = bOptions[Math.floor(Math.random() * bOptions.length)];
      const sumAB = A + B;
      if (sumAB === 18) { C = 2; } else { C = 2; }
    } else {
      op1 = "-"; A = Math.floor(Math.random() * 2) + 8; B = A - 8; if (B < 1 || B > 9) continue;
      op2 = "+"; C = 2;
    }
    let result = op1 === "+" ? A + B : A - B;
    result = op2 === "+" ? result + C : result - C;
    const questionString = `${A} ${op1} ${B} ${op2} ${C}`;
    if (A >= 1 && A <= 9 && B >= 1 && B <= 9 && C >= 1 && C <= 9 && result >= 0 && result <= 50 && !uniqueQuestions.has(questionString)) {
        questions.push({ q: questionString, a: result.toString() });
        uniqueQuestions.add(questionString);
    }
  }
  return questions;
}

function randomBook2Chapter9TenBuddyPlus1(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const allUniqueQuestions: { q: string, a: string }[] = [];
  const uniqueKeys = new Set<string>();
  let attempts = 0;
  const randRange = (min: number, max: number): number => {
    const actualMin = Math.max(1, min); const actualMax = Math.min(max, 50); return Math.floor(Math.random() * (actualMax - actualMin + 1)) + actualMin;
  };
  const MAX_UNIQUE_ATTEMPTS = 5000;
  while (attempts < MAX_UNIQUE_ATTEMPTS) {
    attempts++;
    let A = 0, B = 0, C = 0, op1: "+" | "-" = "+", op2: "+" | "-" = "+";
    const scenario = randRange(0, 2);
    if (scenario === 0) {
      A = randRange(1, 4); op1 = "+"; op2 = "+";
      const minB = 9 - A; B = randRange(minB, 50); C = 1;
    } else if (scenario === 1) {
      A = 5; op1 = "+"; op2 = "+"; B = 9 - A; C = 1;
    } else {
      A = randRange(6, 9); op1 = "+"; op2 = "+";
      const B1 = 9 - A; const B2 = 19 - A; const validB: number[] = [];
      if (B1 >= 1 && B1 <= 50) validB.push(B1); if (B2 >= 1 && B2 <= 50) validB.push(B2);
      if (validB.length === 0) continue; B = validB[Math.floor(Math.random() * validB.length)]; C = 1;
    }
    const result = A + B + C;
    const questionString = `${A} + ${B} + ${C}`;
    if (A >= 1 && A <= 9 && B >= 1 && B <= 50 && C >= 1 && C <= 9 && result >= 0 && result <= 50 && !uniqueKeys.has(questionString)) {
        allUniqueQuestions.push({ q: questionString, a: result.toString() });
        uniqueKeys.add(questionString);
    }
  }
  const uniqueCount = allUniqueQuestions.length;
  if (uniqueCount === 0) return [];
  for (let i = 0; i < numQuestions; i++) {
    questions.push(allUniqueQuestions[i % uniqueCount]);
  }
  return questions;
}

function randomBook2Chapter10TenBuddyPlus(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const allUniqueQuestions: { q: string, a: string }[] = [];
  const uniqueKeys = new Set<string>();
  let attempts = 0;
  const randRange = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;
  const MAX_UNIQUE_ATTEMPTS = 5000;
  while (attempts < MAX_UNIQUE_ATTEMPTS) {
    attempts++;
    let A = 0, B = 0, C = 0, op1: "+" | "-" = "+", op2: "+" | "-" = "+";
    const scenario = randRange(0, 3);
    A = randRange(1, 9); 
    if (scenario === 0) {
      op1 = "+"; op2 = "+"; B = 10 - A; C = randRange(1, 9); 
    } else if (scenario === 1) {
      op1 = "+"; op2 = "+"; const maxB = (10 - A) - 1; if (maxB < 1) continue; 
      B = randRange(1, maxB); C = 10 - (A + B);
    } else if (scenario === 2) {
      op1 = "+"; op2 = "-"; const maxB = (10 - A) - 1; if (maxB < 1) continue;
      B = randRange(1, maxB); const maxC = A + B; const finalMaxC = Math.min(9, maxC);
      if (finalMaxC < 1) continue; C = randRange(1, finalMaxC);
    } else {
      op1 = "-"; op2 = "+"; if (A === 1) continue; 
      B = randRange(1, A - 1); const D_intermediate = A - B;
      const C_required = 10 - D_intermediate; if (C_required < 1 || C_required > 9) continue;
      C = 10 - (A + B); if (C < 1 || C > 9) continue; 
    }
    let result = op1 === "+" ? A + B : A - B;
    result = op2 === "+" ? result + C : result - C;
    const questionString = `${A} ${op1} ${B} ${op2} ${C}`;
    if (A >= 1 && A <= 9 && B >= 1 && B <= 9 && C >= 1 && C <= 9 && result >= 0 && result <= 30 && !uniqueKeys.has(questionString)) {
        allUniqueQuestions.push({ q: questionString, a: result.toString() });
        uniqueKeys.add(questionString);
    }
  }
  const uniqueCount = allUniqueQuestions.length;
  if (uniqueCount === 0) return [];
  for (let i = 0; i < numQuestions; i++) { questions.push(allUniqueQuestions[i % uniqueCount]); }
  return questions;
}

function randomBook2Chapter11TenBuddyMinus9(numQuestions = 10): Question[] {
  const out: Question[] = [];
  let attempts = 0;
  while (out.length < numQuestions && attempts < 5000) {
    attempts++;
    const scenario = Math.floor(Math.random() * 3);
    let A = 0, B = 0, C = 0, op1 = "+", op2 = "+";
    if (scenario === 0) {
        op1 = "+"; op2 = "-"; A = Math.floor(Math.random() * 4) + 1; 
        const minB = 10 - A; const validBs: number[] = []; for (let k = minB; k <= 9; k++) validBs.push(k);
        if (validBs.length === 0) continue; B = validBs[Math.floor(Math.random() * validBs.length)]; C = 9;
    } else if (scenario === 1) {
        op1 = "-"; op2 = "+"; const aOptions = [10, 11, 12, 13, 15, 16, 17, 18]; A = aOptions[Math.floor(Math.random() * aOptions.length)]; B = 9;
        const intermediate = A - B; const invalidCs = new Set<number>();
        if (intermediate === 6) { invalidCs.add(6); invalidCs.add(7); invalidCs.add(8); } 
        else if (intermediate === 7) { invalidCs.add(6); invalidCs.add(7); } 
        else if (intermediate === 8) { invalidCs.add(6); }
        const validCs: number[] = []; for (let k = 1; k <= 9; k++) { if (!invalidCs.has(k)) validCs.push(k); }
        if (validCs.length === 0) continue; C = validCs[Math.floor(Math.random() * validCs.length)];
    } else {
        op1 = "+"; op2 = "-"; A = 9; B = Math.floor(Math.random() * 9) + 1; C = 9;
    }
    const step1 = op1 === "+" ? A + B : A - B;
    const D = op2 === "+" ? step1 + C : step1 - C;
    if (D >= 0 && D <= 50) { out.push({ q: `${A} ${op1} ${B} ${op2} ${C}`, a: D.toString() }); }
  }
  return out;
}

function randomBook2Chapter12TenBuddyMinus8(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const uniqueQuestions = new Set<string>();
  let attempts = 0;
  const randRange = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;
  while (questions.length < numQuestions && attempts < 5000) {
    attempts++;
    let A = 0, B = 0, C = 0, op1: "+" | "-" = "+", op2: "+" | "-" = "-";
    const scenario = randRange(0, 2);
    if (scenario === 0) {
      op1 = "+"; op2 = "-"; A = randRange(1, 4);
      const minB = 10 - A; const excl1 = 4 - A; const excl2 = 14 - A; const excl3 = 3 - A; const excl4 = 13 - A;
      const validB: number[] = [];
      for (let x = minB; x <= 9; x++) { if (x < 1) continue; if (x !== excl1 && x !== excl2 && x !== excl3 && x !== excl4) { validB.push(x); } }
      if (validB.length === 0) continue; B = validB[Math.floor(Math.random() * validB.length)]; C = 8;
    } else if (scenario === 1) {
      op1 = "-"; op2 = "+"; const validA = [10, 11, 12, 15, 16, 17, 18]; A = validA[Math.floor(Math.random() * validA.length)]; B = 8;
      const diffAB = A - B; const excludedC: number[] = [];
      if (diffAB === 7) { excludedC.push(6, 7); } else if (diffAB === 8) { excludedC.push(6); }
      const validC: number[] = []; for (let c = 1; c <= 9; c++) { if (!excludedC.includes(c)) { validC.push(c); } }
      if (validC.length === 0) continue; C = validC[Math.floor(Math.random() * validC.length)];
    } else {
      op1 = "+"; op2 = "-"; A = 9; const validB = [1, 2, 3, 6, 7, 8]; B = validB[Math.floor(Math.random() * validB.length)]; C = 8;
    }
    let result = op1 === "+" ? A + B : A - B;
    result = op2 === "+" ? result + C : result - C;
    const questionString = `${A} ${op1} ${B} ${op2} ${C}`;
    if (A >= 1 && A <= 50 && B >= 1 && B <= 9 && C >= 1 && C <= 9 && result >= 0 && result <= 50 && !uniqueQuestions.has(questionString)) {
        questions.push({ q: questionString, a: result.toString() });
        uniqueQuestions.add(questionString);
    }
  }
  return questions;
}

function randomBook2Chapter13TenBuddyMinus7(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const uniqueQuestions = new Set<string>();
  let attempts = 0;
  const randRange = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;
  while (questions.length < numQuestions && attempts < 5000) {
    attempts++;
    let A = 0, B = 0, C = 0, op1: "+" | "-" = "+", op2: "+" | "-" = "-";
    const scenario = randRange(0, 2);
    if (scenario === 0) {
      op1 = "+"; op2 = "-"; A = randRange(1, 4);
      const minB = 10 - A; const excl1 = 2 - A; const excl2 = 3 - A; const excl3 = 4 - A;
      const validB: number[] = [];
      for (let x = minB; x <= 9; x++) { if (x < 1) continue; if (x !== excl1 && x !== excl2 && x !== excl3) { validB.push(x); } }
      if (validB.length === 0) continue; B = validB[Math.floor(Math.random() * validB.length)]; C = 7;
    } else if (scenario === 1) {
      op1 = "+"; op2 = "-"; A = randRange(5, 9);
      const minB = 10 - A; const excl1 = 12 - A; const excl2 = 13 - A; const excl3 = 14 - A;
      const validB: number[] = [];
      for (let x = minB; x <= 9; x++) { if (x < 1) continue; if (x !== excl1 && x !== excl2 && x !== excl3) { validB.push(x); } }
      if (validB.length === 0) continue; B = validB[Math.floor(Math.random() * validB.length)]; C = 7;
    } else {
      op1 = "-"; op2 = "+"; const validA = [10, 11, 15, 16, 17, 18]; A = validA[Math.floor(Math.random() * validA.length)]; B = 7;
      const diffAB = A - B; const excludedC: number[] = [];
      if (diffAB === 8) { excludedC.push(6); }
      const validC: number[] = []; for (let c = 1; c <= 9; c++) { if (!excludedC.includes(c)) { validC.push(c); } }
      if (validC.length === 0) continue; C = validC[Math.floor(Math.random() * validC.length)];
    }
    let result = op1 === "+" ? A + B : A - B;
    result = op2 === "+" ? result + C : result - C;
    const questionString = `${A} ${op1} ${B} ${op2} ${C}`;
    if (A >= 1 && A <= 50 && B >= 1 && B <= 9 && C >= 1 && C <= 9 && result >= 0 && result <= 50 && !uniqueQuestions.has(questionString)) {
        questions.push({ q: questionString, a: result.toString() });
        uniqueQuestions.add(questionString);
    }
  }
  return questions;
}

function randomBook2Chapter14TenBuddyMinus6(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const uniqueQuestions = new Set<string>();
  let attempts = 0;
  const randRange = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;
  while (questions.length < numQuestions && attempts < 5000) {
    attempts++;
    let A = 0, B = 0, C = 0, op1: "+" | "-" = "+", op2: "+" | "-" = "-";
    const scenario = randRange(0, 2);
    if (scenario === 0) {
      op1 = "+"; op2 = "-"; A = randRange(1, 4);
      const minB = 10 - A; const excl1 = 1 - A; const excl2 = 2 - A; const excl3 = 3 - A; const excl4 = 4 - A;
      const validB: number[] = [];
      for (let x = minB; x <= 9; x++) { if (x < 1) continue; if (x !== excl1 && x !== excl2 && x !== excl3 && x !== excl4) { validB.push(x); } }
      if (validB.length === 0) continue; B = validB[Math.floor(Math.random() * validB.length)]; C = 6;
    } else if (scenario === 1) {
      op1 = "+"; op2 = "-"; A = randRange(5, 9);
      const minB = 10 - A; const excl1 = 11 - A; const excl2 = 12 - A; const excl3 = 13 - A; const excl4 = 14 - A;
      const validB: number[] = [];
      for (let x = minB; x <= 9; x++) { if (x < 1) continue; if (x !== excl1 && x !== excl2 && x !== excl3 && x !== excl4) { validB.push(x); } }
      if (validB.length === 0) continue; B = validB[Math.floor(Math.random() * validB.length)]; C = 6;
    } else {
      op1 = "-"; op2 = "+"; const validA = [10, 15, 20, 25, 30, 35, 40, 45]; A = validA[Math.floor(Math.random() * validA.length)]; B = 6;
      C = randRange(1, 9);
    }
    let result = op1 === "+" ? A + B : A - B;
    result = op2 === "+" ? result + C : result - C;
    const questionString = `${A} ${op1} ${B} ${op2} ${C}`;
    if (A >= 1 && A <= 50 && B >= 1 && B <= 9 && C >= 1 && C <= 9 && result >= 0 && result <= 50 && !uniqueQuestions.has(questionString)) {
        questions.push({ q: questionString, a: result.toString() });
        uniqueQuestions.add(questionString);
    }
  }
  return questions;
}

function randomBook2Chapter15TenBuddyMinus5(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const uniqueQuestions = new Set<string>();
  let attempts = 0;
  const randRange = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;
  while (questions.length < numQuestions && attempts < 5000) {
    attempts++;
    let A = 0, B = 0, C = 0, op1: "+" | "-" = "+", op2: "+" | "-" = "-";
    const scenario = randRange(0, 3);
    if (scenario === 0) {
      op1 = "+"; op2 = "-"; A = randRange(1, 4);
      const minB = 10 - A; const validB: number[] = [];
      for (let x = minB; x <= 9; x++) { if (x >= 1) { validB.push(x); } }
      if (validB.length === 0) continue; B = validB[Math.floor(Math.random() * validB.length)]; C = 5;
    } else if (scenario === 1) {
      op1 = "+"; op2 = "-"; A = 5; const minB = 10 - A; const validB: number[] = [];
      for (let x = minB; x <= 9; x++) { if (x >= 1 && ![6, 7, 8, 9].includes(x)) { validB.push(x); } }
      if (validB.length === 0) continue; B = validB[Math.floor(Math.random() * validB.length)]; C = 5;
    } else if (scenario === 2) {
      op1 = "+"; op2 = "-"; A = randRange(6, 9); const minB = 10 - A; const validB: number[] = [];
      for (let x = minB; x <= 9; x++) { if (x >= 1) { validB.push(x); } }
      if (validB.length === 0) continue; B = validB[Math.floor(Math.random() * validB.length)]; C = 5;
    } else {
      op1 = "-"; op2 = "+"; const validA = [10, 11, 12, 13, 14, 20, 21, 22, 23, 24]; A = validA[Math.floor(Math.random() * validA.length)]; B = 5;
      const diffAB = A - B; const excludedC: number[] = [];
      if (diffAB === 5) { excludedC.push(6, 7, 8, 9); } else if (diffAB === 6) { excludedC.push(6, 7, 8); } else if (diffAB === 7) { excludedC.push(6, 7); } else if (diffAB === 8) { excludedC.push(6); }
      const validC: number[] = []; for (let c = 1; c <= 9; c++) { if (!excludedC.includes(c)) { validC.push(c); } }
      if (validC.length === 0) continue; C = validC[Math.floor(Math.random() * validC.length)];
    }
    let result = op1 === "+" ? A + B : A - B;
    result = op2 === "+" ? result + C : result - C;
    const questionString = `${A} ${op1} ${B} ${op2} ${C}`;
    if (A >= 1 && A <= 50 && B >= 1 && B <= 9 && C >= 1 && C <= 9 && result >= 0 && result <= 50 && !uniqueQuestions.has(questionString)) {
        questions.push({ q: questionString, a: result.toString() });
        uniqueQuestions.add(questionString);
    }
  }
  return questions;
}

function randomBook2Chapter16TenBuddyMinus4(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const uniqueQuestions = new Set<string>();
  let attempts = 0;
  const randRange = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;
  while (questions.length < numQuestions && attempts < 5000) {
    attempts++;
    let A = 0, B = 0, C = 0, op1: "+" | "-" = "+", op2: "+" | "-" = "-";
    const scenario = randRange(0, 2);
    if (scenario === 0) {
      op1 = "+"; op2 = "-"; A = randRange(1, 4); const minB = 10 - A; 
      const validB: number[] = []; for (let x = minB; x <= 9; x++) { if (x >= 1) { validB.push(x); } }
      if (validB.length === 0) continue; B = validB[Math.floor(Math.random() * validB.length)]; C = 4;
    } else if (scenario === 1) {
      op1 = "+"; op2 = "-"; A = randRange(5, 9); const minB = 10 - A; 
      const validB: number[] = []; for (let x = minB; x <= 9; x++) { if (x >= 1) { validB.push(x); } }
      if (validB.length === 0) continue; B = validB[Math.floor(Math.random() * validB.length)]; C = 4;
    } else {
      op1 = "-"; op2 = "+"; const validA = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19]; A = validA[Math.floor(Math.random() * validA.length)]; B = 4;
      const diffAB = A - B; const excludedC: number[] = [];
      if (diffAB === 5) { excludedC.push(6, 7, 8, 9); } else if (diffAB === 6) { excludedC.push(6, 7, 8); } else if (diffAB === 7) { excludedC.push(6, 7); } else if (diffAB === 8) { excludedC.push(6); }
      const validC: number[] = []; for (let c = 1; c <= 9; c++) { if (!excludedC.includes(c)) { validC.push(c); } }
      if (validC.length === 0) continue; C = validC[Math.floor(Math.random() * validC.length)];
    }
    let result = op1 === "+" ? A + B : A - B;
    result = op2 === "+" ? result + C : result - C;
    const questionString = `${A} ${op1} ${B} ${op2} ${C}`;
    if (A >= 1 && A <= 50 && B >= 1 && B <= 9 && C >= 1 && C <= 9 && result >= 0 && result <= 50 && !uniqueQuestions.has(questionString)) {
        questions.push({ q: questionString, a: result.toString() });
        uniqueQuestions.add(questionString);
    }
  }
  return questions;
}

function randomBook2Chapter17TenBuddyMinus3(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const uniqueQuestions = new Set<string>();
  let attempts = 0;
  const randRange = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;
  const getValidB = (minB: number, exclusions: number[]): number[] => {
    const validB: number[] = []; for (let x = minB; x <= 9; x++) { if (x >= 1 && !exclusions.includes(x)) { validB.push(x); } } return validB;
  };
  while (questions.length < numQuestions && attempts < 5000) {
    attempts++;
    let A = 0, B = 0, C = 0, op1: "+" | "-" = "+", op2: "+" | "-" = "-";
    const scenario = randRange(0, 5);
    if (scenario === 0) {
      op1 = "+"; op2 = "-"; A = randRange(1, 4); const minB = 10 - A; const validB = getValidB(minB, []);
      if (validB.length === 0) continue; B = validB[Math.floor(Math.random() * validB.length)]; C = 3;
    } else if (scenario === 1) {
      op1 = "+"; op2 = "-"; A = 5; const minB = 10 - A; const exclusions = [6, 7, 8, 9];
      const validB = getValidB(minB, exclusions); if (validB.length === 0) continue; B = validB[Math.floor(Math.random() * validB.length)]; C = 3;
    } else if (scenario === 2) {
      op1 = "+"; op2 = "-"; A = 6; const minB = 10 - A; const exclusions = [6, 7, 8];
      const validB = getValidB(minB, exclusions); if (validB.length === 0) continue; B = validB[Math.floor(Math.random() * validB.length)]; C = 3;
    } else if (scenario === 3) {
      op1 = "+"; op2 = "-"; A = 7; const minB = 10 - A; const exclusions = [6, 7];
      const validB = getValidB(minB, exclusions); if (validB.length === 0) continue; B = validB[Math.floor(Math.random() * validB.length)]; C = 3;
    } else if (scenario === 4) {
      op1 = "+"; op2 = "-"; A = 8; const minB = 10 - A; const exclusions = [6];
      const validB = getValidB(minB, exclusions); if (validB.length === 0) continue; B = validB[Math.floor(Math.random() * validB.length)]; C = 3;
    } else {
      op1 = "-"; op2 = "+"; const validA = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19]; A = validA[Math.floor(Math.random() * validA.length)]; B = 3;
      const diffAB = A - B; const excludedC: number[] = [];
      if (diffAB === 5) { excludedC.push(6, 7, 8, 9); } else if (diffAB === 6) { excludedC.push(6, 7, 8); } else if (diffAB === 7) { excludedC.push(6, 7); } else if (diffAB === 8) { excludedC.push(6); }
      const validC: number[] = []; for (let c = 1; c <= 9; c++) { if (!excludedC.includes(c)) { validC.push(c); } }
      if (validC.length === 0) continue; C = validC[Math.floor(Math.random() * validC.length)];
    }
    let result = op1 === "+" ? A + B : A - B;
    result = op2 === "+" ? result + C : result - C;
    const questionString = `${A} ${op1} ${B} ${op2} ${C}`;
    if (A >= 1 && A <= 50 && B >= 1 && B <= 9 && C >= 1 && C <= 9 && result >= 0 && result <= 50 && !uniqueQuestions.has(questionString)) {
        questions.push({ q: questionString, a: result.toString() });
        uniqueQuestions.add(questionString);
    }
  }
  return questions;
}

function randomBook2Chapter18TenBuddyMinus2(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const uniqueQuestions = new Set<string>();
  let attempts = 0;
  const randRange = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;
  const getValidB = (minB: number, exclusions: number[]): number[] => {
    const validB: number[] = []; for (let x = minB; x <= 9; x++) { if (x >= 1 && !exclusions.includes(x)) { validB.push(x); } } return validB;
  };
  while (questions.length < numQuestions && attempts < 5000) {
    attempts++;
    let A = 0, B = 0, C = 0, op1: "+" | "-" = "+", op2: "+" | "-" = "-";
    const scenario = randRange(0, 5);
    if (scenario === 0) {
      op1 = "+"; op2 = "-"; A = randRange(1, 4); const minB = 10 - A; const validB = getValidB(minB, []);
      if (validB.length === 0) continue; B = validB[Math.floor(Math.random() * validB.length)]; C = 2;
    } else if (scenario === 1) {
      op1 = "+"; op2 = "-"; A = 5; const minB = 10 - A; const exclusions = [6, 7, 8, 9];
      const validB = getValidB(minB, exclusions); if (validB.length === 0) continue; B = validB[Math.floor(Math.random() * validB.length)]; C = 2;
    } else if (scenario === 2) {
      op1 = "+"; op2 = "-"; A = 6; const minB = 10 - A; const exclusions = [6, 7, 8];
      const validB = getValidB(minB, exclusions); if (validB.length === 0) continue; B = validB[Math.floor(Math.random() * validB.length)]; C = 2;
    } else if (scenario === 3) {
      op1 = "+"; op2 = "-"; A = 7; const minB = 10 - A; const exclusions = [6, 7];
      const validB = getValidB(minB, exclusions); if (validB.length === 0) continue; B = validB[Math.floor(Math.random() * validB.length)]; C = 2;
    } else if (scenario === 4) {
      op1 = "+"; op2 = "-"; A = 8; const minB = 10 - A; const exclusions = [6];
      const validB = getValidB(minB, exclusions); if (validB.length === 0) continue; B = validB[Math.floor(Math.random() * validB.length)]; C = 2;
    } else {
      op1 = "-"; op2 = "+"; const validA = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19]; A = validA[Math.floor(Math.random() * validA.length)]; B = 2;
      const diffAB = A - B; const excludedC: number[] = [];
      if (diffAB === 5) { excludedC.push(6, 7, 8, 9); } else if (diffAB === 6) { excludedC.push(6, 7, 8); } else if (diffAB === 7) { excludedC.push(6, 7); } else if (diffAB === 8) { excludedC.push(6); }
      const validC: number[] = []; for (let c = 1; c <= 9; c++) { if (!excludedC.includes(c)) { validC.push(c); } }
      if (validC.length === 0) continue; C = validC[Math.floor(Math.random() * validC.length)];
    }
    let result = op1 === "+" ? A + B : A - B;
    result = op2 === "+" ? result + C : result - C;
    const questionString = `${A} ${op1} ${B} ${op2} ${C}`;
    if (A >= 1 && A <= 50 && B >= 1 && B <= 9 && C >= 1 && C <= 9 && result >= 0 && result <= 50 && !uniqueQuestions.has(questionString)) {
        questions.push({ q: questionString, a: result.toString() });
        uniqueQuestions.add(questionString);
    }
  }
  return questions;
}

function randomBook2Chapter19TenBuddyMinus1(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const uniqueQuestions = new Set<string>();
  let attempts = 0;
  const randRange = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;
  const getValidB = (minB: number, exclusions: number[]): number[] => {
    const validB: number[] = []; for (let x = minB; x <= 9; x++) { if (x >= 1 && !exclusions.includes(x)) { validB.push(x); } } return validB;
  };
  while (questions.length < numQuestions && attempts < 5000) {
    attempts++;
    let A = 0, B = 0, C = 0, op1: "+" | "-" = "+", op2: "+" | "-" = "-";
    const scenario = randRange(0, 5);
    if (scenario === 0) {
      op1 = "+"; op2 = "-"; A = randRange(1, 4); const minB = 10 - A; const validB = getValidB(minB, []);
      if (validB.length === 0) continue; B = validB[Math.floor(Math.random() * validB.length)]; C = 1;
    } else if (scenario === 1) {
      op1 = "+"; op2 = "-"; A = 5; const minB = 10 - A; const exclusions = [6, 7, 8, 9];
      const validB = getValidB(minB, exclusions); if (validB.length === 0) continue; B = validB[Math.floor(Math.random() * validB.length)]; C = 1;
    } else if (scenario === 2) {
      op1 = "+"; op2 = "-"; A = 6; const minB = 10 - A; const exclusions = [6, 7, 8];
      const validB = getValidB(minB, exclusions); if (validB.length === 0) continue; B = validB[Math.floor(Math.random() * validB.length)]; C = 1;
    } else if (scenario === 3) {
      op1 = "+"; op2 = "-"; A = 7; const minB = 10 - A; const exclusions = [6, 7];
      const validB = getValidB(minB, exclusions); if (validB.length === 0) continue; B = validB[Math.floor(Math.random() * validB.length)]; C = 1;
    } else if (scenario === 4) {
      op1 = "+"; op2 = "-"; A = 8; const minB = 10 - A; const exclusions = [6];
      const validB = getValidB(minB, exclusions); if (validB.length === 0) continue; B = validB[Math.floor(Math.random() * validB.length)]; C = 1;
    } else {
      op1 = "-"; op2 = "+"; const validA = [10, 11, 12, 13, 14, 15, 17, 18, 19]; A = validA[Math.floor(Math.random() * validA.length)]; B = 1;
      const diffAB = A - B; const excludedC: number[] = [];
      if (diffAB === 5) { excludedC.push(6, 7, 8, 9); } else if (diffAB === 6) { excludedC.push(6, 7, 8); } else if (diffAB === 7) { excludedC.push(6, 7); } else if (diffAB === 8) { excludedC.push(6); }
      const validC: number[] = []; for (let c = 1; c <= 9; c++) { if (!excludedC.includes(c)) { validC.push(c); } }
      if (validC.length === 0) continue; C = validC[Math.floor(Math.random() * validC.length)];
    }
    let result = op1 === "+" ? A + B : A - B;
    result = op2 === "+" ? result + C : result - C;
    const questionString = `${A} ${op1} ${B} ${op2} ${C}`;
    if (A >= 1 && A <= 50 && B >= 1 && B <= 9 && C >= 1 && C <= 9 && result >= 0 && result <= 50 && !uniqueQuestions.has(questionString)) {
        questions.push({ q: questionString, a: result.toString() });
        uniqueQuestions.add(questionString);
    }
  }
  return questions;
}

function randomBook2Chapter20TenBuddyMinus(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const allUniqueQuestions: { q: string, a: string }[] = [];
  const uniqueKeys = new Set<string>();
  let attempts = 0;
  const randRange = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;
  const MAX_UNIQUE_ATTEMPTS = 5000;
  const getValidC = (intermediateSum: number): number[] => {
      const allC = [1, 2, 3, 4, 5, 6, 7, 8, 9]; const excludedC: number[] = [];
      if (intermediateSum <= 10) { return allC.filter(c => c <= intermediateSum); } 
      else if (intermediateSum === 11) { excludedC.push(1, 6); } else if (intermediateSum === 12) { excludedC.push(1, 2, 6, 7); } else if (intermediateSum === 13) { excludedC.push(1, 2, 3, 6, 7, 8); } else if (intermediateSum === 14) { excludedC.push(1, 2, 3, 4, 6, 7, 8, 9); }
      if (intermediateSum > 14) { return allC.filter(c => c <= intermediateSum); }
      return allC.filter(c => !excludedC.includes(c) && c <= intermediateSum);
  };
  while (attempts < MAX_UNIQUE_ATTEMPTS) {
    attempts++;
    let A = 0, B = 0, C = 0, op1: "+" | "-" = "+", op2: "+" | "-" = "-";
    const scenario = randRange(0, 2);
    if (scenario === 0) {
      A = randRange(1, 4); const minB = 10 - A; if (minB > 9) continue; B = randRange(minB, 9);
    } else if (scenario === 1) {
      A = 5; B = 5;
    } else {
      A = randRange(6, 9); const minB = 10 - A; const maxB = 5; if (minB > maxB) continue; B = randRange(minB, maxB);
    }
    const intermediateSum = A + B; const possibleC = getValidC(intermediateSum);
    if (possibleC.length === 0) continue; C = possibleC[Math.floor(Math.random() * possibleC.length)];
    let result = intermediateSum - C;
    const questionString = `${A} ${op1} ${B} ${op2} ${C}`;
    if (A >= 1 && A <= 9 && B >= 1 && B <= 9 && C >= 1 && C <= 9 && result >= 0 && result <= 100 && !uniqueKeys.has(questionString)) {
        allUniqueQuestions.push({ q: questionString, a: result.toString() });
        uniqueKeys.add(questionString);
    }
  }
  const uniqueCount = allUniqueQuestions.length;
  if (uniqueCount === 0) return [];
  for (let i = 0; i < numQuestions; i++) { questions.push(allUniqueQuestions[i % uniqueCount]); }
  return questions;
}

function randomBook2Chapter21MixTenBuddy(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const allUniqueQuestions: { q: string, a: string }[] = [];
  const uniqueKeys = new Set<string>();
  let attempts = 0;
  const randRange = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;
  const MAX_UNIQUE_ATTEMPTS = 5000;
  const getValidC = (intermediateSum: number): number[] => {
      const maxC = Math.min(9, intermediateSum); const allC = [1, 2, 3, 4, 5, 6, 7, 8, 9]; const excludedC: number[] = [];
      const exclude6 = [1, 2, 3, 4, 11, 12, 13, 14]; if (exclude6.includes(intermediateSum)) excludedC.push(6);
      const exclude7 = [2, 3, 4, 12, 13, 14]; if (exclude7.includes(intermediateSum)) excludedC.push(7);
      const exclude8 = [3, 4, 13, 14]; if (exclude8.includes(intermediateSum)) excludedC.push(8);
      const exclude9 = [4, 14]; if (exclude9.includes(intermediateSum)) excludedC.push(9);
      return allC.filter(c => c <= maxC && !excludedC.includes(c));
  };
  while (attempts < MAX_UNIQUE_ATTEMPTS) {
    attempts++;
    let A = 0, B = 0, C = 0, op1: "+" | "-" = "+", op2: "+" | "-" = "-";
    const A_value = randRange(1, 6);
    if (A_value === 1) { A = randRange(1, 4); B = randRange(1, 9); } 
    else if (A_value === 2) { A = 5; B = randRange(1, 5); } 
    else if (A_value === 3) { A = 6; B = randRange(1, 5); } 
    else if (A_value === 4) { A = 7; const validB = [1, 2, 3, 4, 5, 9]; B = validB[Math.floor(Math.random() * validB.length)]; } 
    else if (A_value === 5) { A = 8; const validB = [1, 2, 3, 4, 5, 9]; B = validB[Math.floor(Math.random() * validB.length)]; } 
    else { A = 9; const validB = [1, 2, 3, 4, 5, 9]; B = validB[Math.floor(Math.random() * validB.length)]; }
    const intermediateSum = A + B; const possibleC = getValidC(intermediateSum);
    if (possibleC.length === 0) continue; C = possibleC[Math.floor(Math.random() * possibleC.length)];
    let result = intermediateSum - C;
    const questionString = `${A} ${op1} ${B} ${op2} ${C}`;
    if (A >= 1 && A <= 9 && B >= 1 && B <= 9 && C >= 1 && C <= 9 && result >= 0 && result <= 50 && !uniqueKeys.has(questionString)) {
        allUniqueQuestions.push({ q: questionString, a: result.toString() });
        uniqueKeys.add(questionString);
    }
  }
  const uniqueCount = allUniqueQuestions.length;
  if (uniqueCount === 0) return [];
  for (let i = 0; i < numQuestions; i++) { questions.push(allUniqueQuestions[i % uniqueCount]); }
  return questions;
}

// ---------- generator selector ----------
function getGenerator(book: number, chapter: number): GenFn {
  // === BOOK 2 GENERATORS ===
  if (book === 2) {
    switch (chapter) {
      case 1: return randomBook2Chapter1TenBuddyPlus9;
      case 2: return randomBook2Chapter2TenBuddyPlus8;
      case 3: return randomBook2Chapter3TenBuddyPlus7;
      case 4: return randomBook2Chapter4TenBuddyPlus6;
      case 5: return randomBook2Chapter5TenBuddyPlus5;
      case 6: return randomBook2Chapter6TenBuddyPlus4;
      case 7: return randomBook2Chapter7TenBuddyPlus3;
      case 8: return randomBook2Chapter8TenBuddyPlus2;
      case 9: return randomBook2Chapter9TenBuddyPlus1;
      case 10: return randomBook2Chapter10TenBuddyPlus;
      case 11: return randomBook2Chapter11TenBuddyMinus9;
      case 12: return randomBook2Chapter12TenBuddyMinus8;
      case 13: return randomBook2Chapter13TenBuddyMinus7;
      case 14: return randomBook2Chapter14TenBuddyMinus6;
      case 15: return randomBook2Chapter15TenBuddyMinus5;
      case 16: return randomBook2Chapter16TenBuddyMinus4;
      case 17: return randomBook2Chapter17TenBuddyMinus3;
      case 18: return randomBook2Chapter18TenBuddyMinus2;
      case 19: return randomBook2Chapter19TenBuddyMinus1;
      case 20: return randomBook2Chapter20TenBuddyMinus;
      case 21: return randomBook2Chapter21MixTenBuddy;
      default: return randomBook2Chapter1TenBuddyPlus9;
    }
  }

  // === BOOK 1 GENERATORS (Default) ===
  switch (chapter) {
    case 1: return randomChapter1Lower;
    case 2: return randomChapter2Lower2Digits;
    case 3: return randomChapterChapter3Upper;
    case 4: return randomChapter4MixLowerUpper;
    case 5: return randomChapter5MixUpperLower2Digits;
    case 6: return randomChapter6FivebuddyPlus4;
    case 7: return randomChapter7FivebuddyPlus3;
    case 8: return randomChapter8FivebuddyPlus2;
    case 9: return randomChapter9FivebuddyPlus1;
    case 10: return randomChapter10FiveBuddyPlus;
    case 11: return randomChapter11FiveBuddyMinus4;
    case 12: return randomChapter12FivebuddyMinus3;
    case 13: return randomChapter13FivebuddyMinus2;
    case 14: return randomChapter14FivebuddyMinus1;
    case 15: return randomChapter15FiveBuddyMinus;
    case 16: return randomChapter16FiveBuddyPlusMinus;
    case 17: return randomChapter17Mix5buddy2digits;
    default: return randomChapter1Lower;
  }
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