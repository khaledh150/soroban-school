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

// ---------- Book 1 Chapter 1 Lower ----------
function randomChapter1Lower(numQuestions = 10, numNumbers = 4): Question[] {
  const out: Question[] = [];

  function r14() {
    return Math.floor(Math.random() * 4) + 1;
  }
  
  function rOp() {
    return Math.random() < 0.5 ? "+" : "-";
  }

  let attempts = 0;

  while (out.length < numQuestions && attempts < 5000) {
    attempts++;

    // 1. Generate A (1,2,3,4)
    const A = r14();
    const op1 = rOp();

    // 2. Generate B based on Op1 rules
    let validBs: number[] = [];
    for (let b = 1; b <= 4; b++) {
      if (op1 === "+") {
        if (b < 5 - A) validBs.push(b);
      } else {
        if (b <= A) validBs.push(b);
      }
    }

    if (validBs.length === 0) continue;
    
    const B = validBs[Math.floor(Math.random() * validBs.length)];
    const stage1 = op1 === "+" ? A + B : A - B;

    // 3. Generate C based on Op2 rules
    const op2 = rOp();
    let validCs: number[] = [];
    for (let c = 1; c <= 4; c++) {
      if (op2 === "+") {
        if (c < 5 - stage1) validCs.push(c);
      } else {
        if (c <= stage1) validCs.push(c);
      }
    }

    if (validCs.length === 0) continue;

    const C = validCs[Math.floor(Math.random() * validCs.length)];
    const D = op2 === "+" ? stage1 + C : stage1 - C;

    if (D >= 0 && D <= 4) {
      out.push({ q: `${A} ${op1} ${B} ${op2} ${C}`, a: D.toString() });
    }
  }

  return out;
}

// ---------- Book 1 Chapter 2 Lower 2-Digits ----------
function randomChapter2Lower2Digits(numQuestions = 10): Question[] {
  const out: Question[] = [];

  // Generators
  function r14() { return Math.floor(Math.random() * 4) + 1; } // 1-4 (Tens A)
  function r04() { return Math.floor(Math.random() * 5); }     // 0-4 (Units A)
  
  function rOp() { return Math.random() < 0.5 ? "+" : "-"; }
  function evalOp(x: number, o: string, y: number) { return o === "+" ? x + y : x - y; }

  // Helper: Generate one column sequence (A, B, C) strictly following user's Lower Bead rules
  function getDigitSequence(op1: string, op2: string, aGen: () => number): number[] | null {
    // 1. Generate A
    const A = aGen();

    if (A === 0 && op1 === "-") return null;

    // 2. Generate B (Must be 1-4, strictly no 0)
    let validBs: number[] = [];
    for (let b = 1; b <= 4; b++) {
      if (op1 === "+") {
        if (b < 5 - A) validBs.push(b);
      } else {
        if (b <= A) validBs.push(b);
      }
    }
    
    if (validBs.length === 0) return null;
    const B = validBs[Math.floor(Math.random() * validBs.length)];
    
    const stage1 = evalOp(A, op1, B);
    if (stage1 < 0 || stage1 > 4) return null;

    // 3. Generate C (Must be 1-4, strictly no 0)
    let validCs: number[] = [];
    for (let c = 1; c <= 4; c++) {
      if (op2 === "+") {
        if (c < 5 - stage1) validCs.push(c);
      } else {
        if (c <= stage1) validCs.push(c);
      }
    }

    if (validCs.length === 0) return null;
    const C = validCs[Math.floor(Math.random() * validCs.length)];

    const D = evalOp(stage1, op2, C);
    
    if (D < 0 || D > 4) return null;

    return [A, B, C];
  }

  // Main Loop
  let attempts = 0;
  while (out.length < numQuestions && attempts < 5000) {
    attempts++;
    
    const op1 = rOp();
    const op2 = rOp();

    // 1. Generate Tens Column (Independent)
    const tensSeq = getDigitSequence(op1, op2, r14);
    if (!tensSeq) continue;

    // 2. Generate Units Column (Independent)
    const unitsSeq = getDigitSequence(op1, op2, r04);
    if (!unitsSeq) continue;

    // 3. Construct Full Numbers
    const valM = (tensSeq[0] * 10) + unitsSeq[0];
    const valN = (tensSeq[1] * 10) + unitsSeq[1];
    const valO = (tensSeq[2] * 10) + unitsSeq[2];

    const stage1 = evalOp(valM, op1, valN);
    const valP = evalOp(stage1, op2, valO);

    if (valP >= 0 && valP <= 49) {
        out.push({ 
            q: `${valM} ${op1} ${valN} ${op2} ${valO}`, 
            a: valP.toString() 
        });
    }
  }

  return out;
}

// ---------- Book 1 Chapter 3 Upper ----------
function randomChapterChapter3Upper(numQuestions = 10, numNumbers = 4): Question[] {
    const out: Question[] = [];

    function r15() {
        return Math.floor(Math.random() * 5) + 1;
    }
    function rOp() {
        return Math.random() < 0.5 ? "+" : "-";
    }
    function evalOp(x: number, o: string, y: number) {
        return o === "+" ? x + y : x - y;
    }

    while (out.length < numQuestions) {
        const A = r15();
        const B = r15();
        const C = r15();
        const op1 = rOp();

        if (A === 5 && op1 === "-" && B !== 5) continue;
        if (A === 5 && op1 === "+" && B === 5) continue;
        if (A === 4 && op1 === "-" && !(B >= 1 && B <= 4)) continue;
        if (A === 4 && op1 === "+" && B !== 5) continue;
        if (A <= 4 && Math.abs(evalOp(A, op1, B)) > 4) continue;

        const AB = evalOp(A, op1, B);

        if (AB < 0 || AB > 9) continue;
        if (AB === 5) continue;

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

// ---------- Book 1 Chapter 4 Mix Lower Upper ----------
function randomChapter4MixLowerUpper(numQuestions = 10): Question[] {
    const out: Question[] = [];

    /* ---------- helpers ---------- */
    function r19() {
        return Math.floor(Math.random() * 9) + 1;
    }
    function rOp() {
        return Math.random() < 0.5 ? "+" : "-";
    }
    function evalOp(x: number, o: string, y: number) {
        return o === "+" ? x + y : x - y;
    }

    function choose(generator: any, ok: any, tries = 60) {
        while (tries--) {
            const v = generator();
            if (ok(v)) return v;
        }
        return null;
    }

    /* ---------- rule predicates ---------- */
    function validB_plus(A: number, B: number) {
        if (A <= 4) return !(B >= 10 - A || (B >= 5 - A && B < 5));
        if (A === 5) return B < 5;
        return B < 10 - A;
    }
    function validB_minus(A: number, B: number) {
        if (A <= 4) return B <= A;
        if (A === 5) return B === 5;
        return B <= A - 5 || B === 5;
    }
    function validC_plusplus(S: number, C: number) {
        if (S <= 4) return !(C >= 10 - S || (C >= 5 - S && C < 5));
        if (S === 5) return C < 5;
        return C < 10 - S;
    }
    function validC_plusminus(S: number, C: number) {
        if (2 <= S && S <= 4) return C < S;
        if (S === 5) return C === 5;
        return C <= S - 5 || C === 5;
    }
    function validC_minusplus(S: number, C: number) {
        if (S <= 4) return !(C >= 10 - S || (C >= 5 - S && C < 5));
        if (S === 5) return C < 5;
        return C < 10 - S;
    }
    function validC_minusminus(S: number, C: number) {
        if (S <= 4) return C < S;
        if (S === 5) return C === 5;
        return C <= S - 5 || C === 5;
    }

    while (out.length < numQuestions) {
        const A = r19();
        const op1 = rOp();

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

// ---------- Book 1 Chapter 5 Mix Upper Lower 2-Digits ----------
function randomChapter5MixUpperLower2Digits(numQuestions = 10): Question[] {
  const out: Question[] = [];

  // Generators
  function r19() { return Math.floor(Math.random() * 9) + 1; }
  function r09() { return Math.floor(Math.random() * 10); }
  function rOp() { return Math.random() < 0.5 ? "+" : "-"; }
  function evalOp(x: number, o: string, y: number) { return o === "+" ? x + y : x - y; }

  function choose(
    generator: () => number,
    ok: (v: number) => boolean,
    tries = 100
  ): number | null {
    while (tries--) {
      const v = generator();
      if (ok(v)) return v;
    }
    return null;
  }

  // Validators
  function validB_plus(A: number, B: number) {
    if (A <= 4) return !(B >= 10 - A || (B >= 5 - A && B < 5));
    if (A === 5) return B < 5;
    return B < 10 - A;
  }
  function validB_minus(A: number, B: number) {
    if (A <= 4) return B <= A;
    if (A === 5) return B === 5;
    return B <= A - 5 || B === 5;
  }
  function validC_plusplus(S: number, C: number) {
    if (S <= 4) return !(C >= 10 - S || (C >= 5 - S && C < 5));
    if (S === 5) return C < 5;
    return C < 10 - S;
  }
  function validC_plusminus(S: number, C: number) {
    if (2 <= S && S <= 4) return C < S;
    if (S === 5) return C === 5;
    return C <= S - 5 || C === 5;
  }
  function validC_minusplus(S: number, C: number) {
    if (S <= 4) return !(C >= 10 - S || (C >= 5 - S && C < 5));
    if (S === 5) return C < 5;
    return C < 10 - S;
  }
  function validC_minusminus(S: number, C: number) {
    if (S <= 4) return C < S;
    if (S === 5) return C === 5;
    return C <= S - 5 || C === 5;
  }

  function getDigitSequence(op1: string, op2: string, aGen: () => number): number[] | null {
    const A = aGen();

    let B = op1 === "+"
        ? choose(r19, (b) => validB_plus(A, b))
        : choose(r19, (b) => validB_minus(A, b));
    
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
    
    const op1 = rOp();
    const op2 = rOp();

    const tensSeq = getDigitSequence(op1, op2, r19);
    if (!tensSeq) continue;

    const unitsSeq = getDigitSequence(op1, op2, r09);
    if (!unitsSeq) continue;

    const valA = (tensSeq[0] * 10) + unitsSeq[0];
    const valB = (tensSeq[1] * 10) + unitsSeq[1];
    const valC = (tensSeq[2] * 10) + unitsSeq[2];

    const stage1 = evalOp(valA, op1, valB);
    const valD = evalOp(stage1, op2, valC);

    out.push({ 
        q: `${valA} ${op1} ${valB} ${op2} ${valC}`, 
        a: valD.toString() 
    });
  }

  return out;
}

// ---------- Book 1 Chapter 6 Five buddy +4 ----------
function randomChapter6FivebuddyPlus4(numQuestions = 10, numNumbers = 4): Question[] {
  const questions: Question[] = [];

  while (questions.length < numQuestions) {
    let A = 0;
    let B = 0;
    let C = 0;
    let op1 = "+";
    let op2 = "+";

    const startWithPlus = Math.random() < 0.5;

    if (startWithPlus) {
      op1 = "+";
      A = Math.floor(Math.random() * 4) + 1;
      B = 4;
      const step1 = A + B;
      op2 = Math.random() < 0.5 ? "+" : "-";

      if (op2 === "+") {
        const limit = 10 - step1; 
        const maxC = limit - 1;
        if (maxC < 1) continue; 
        C = Math.floor(Math.random() * maxC) + 1;
      } else {
        if (step1 === 5) {
            C = Math.random() < 0.5 ? 5 : 0;
        } else {
            const option1 = step1 - 1;
            const option2 = step1 - 5;
            C = Math.random() < 0.5 ? option1 : option2;
        }
      }

    } else {
      op1 = "-";
      A = Math.floor(Math.random() * 4) + 6;
      B = 5;
      const step1 = A - B;
      op2 = Math.random() < 0.5 ? "+" : "-";

      if (op2 === "+") {
        C = 4;
      } else {
        C = Math.floor(Math.random() * step1) + 1;
      }
    }

    let result = op1 === "+" ? A + B : A - B;
    result = op2 === "+" ? result + C : result - C;

    const isCValid = (C >= 1 && C <= 9) || (C === 0);

    if (
      A >= 1 && A <= 9 &&
      B >= 4 && B <= 5 &&
      isCValid &&
      result >= 0 && result <= 9
    ) {
      questions.push({ q: `${A} ${op1} ${B} ${op2} ${C}`, a: result.toString() });
    }
  }

  return questions;
}

// ---------- Book 1 Chapter 7 Five buddy +3 ----------
function randomChapter7FivebuddyPlus3(numQuestions = 10, numNumbers = 4): Question[] {
  const questions: Question[] = [];
  let attempts = 0;

  while (questions.length < numQuestions && attempts < 5000) {
    attempts++;
    let A = 0;
    let B = 0;
    let C = 0;
    let op1: "+" | "-" = "+";
    let op2: "+" | "-" = "+";
    let isValidQuestion = true;
    
    const startWithPlus = Math.random() < 0.5;

    if (startWithPlus) {
      op1 = "+";
      A = Math.floor(Math.random() * 4) + 1;
      B = 3;
      const step1 = A + B;
      op2 = Math.random() < 0.5 ? "+" : "-";

      if (op2 === "+") {
        if (step1 === 4) {
            C = 3;
        } else {
            const limit = 10 - step1; 
            const maxC = limit - 1; 
            
            if (maxC < 1) { isValidQuestion = false; continue; } 
            
            C = Math.floor(Math.random() * maxC) + 1;
        }
      } else {
        if (step1 === 4) {
            C = Math.floor(Math.random() * 3) + 1;
        } else if (step1 === 5) {
            C = Math.random() < 0.5 ? 5 : 0;
        } else {
            const option1 = step1 - 1;
            const option2 = step1 - 5;
            C = Math.random() < 0.5 ? option1 : option2;
        }
      }

    } else {
      op1 = "-";
      A = Math.floor(Math.random() * 4) + 6;
      B = 5;
      const step1 = A - B; 
      op2 = Math.random() < 0.5 ? "+" : "-";

      if (op2 === "+") {
        C = 3;
      } else {
        C = Math.floor(Math.random() * step1) + 1;
      }
    }

    let result = op1 === "+" ? A + B : A - B;
    result = op2 === "+" ? result + C : result - C;

    const isCValid = (C >= 1 && C <= 9) || (C === 0 && op1 === "+" && op2 === "-" && A + B === 5); 
    
    if (
      isValidQuestion &&
      A >= 1 && A <= 9 &&
      B >= 3 && B <= 5 && B !== 4 && 
      isCValid &&
      result >= 0 && result <= 9
    ) {
      questions.push({ q: `${A} ${op1} ${B} ${op2} ${C}`, a: result.toString() });
    }
  }

  return questions;
}  

// ---------- Book 1 Chapter 8 Five Buddy +2 ----------
function randomChapter8FivebuddyPlus2(numQuestions = 10, numNumbers = 4): Question[] {
  const questions: Question[] = [];
  let attempts = 0;

  while (questions.length < numQuestions && attempts < 5000) {
    attempts++;
    let A = 0;
    let B = 0;
    let C = 0;
    let op1: "+" | "-" = "+";
    let op2: "+" | "-" = "+";
    let isValidQuestion = true;
    
    const startWithPlus = Math.random() < 0.7; 

    if (startWithPlus) {
      op1 = "+";
      A = Math.floor(Math.random() * 4) + 1;
      B = 2;
      const step1 = A + B; 
      op2 = Math.random() < 0.5 ? "+" : "-";

      if (op2 === "+") {
        if (step1 === 3 || step1 === 4) {
            C = 2;
        } else {
            const limit = 10 - step1; 
            const maxC = limit - 1; 
            
            if (maxC < 1) { isValidQuestion = false; continue; } 
            
            C = Math.floor(Math.random() * maxC) + 1;
        }
      } else {
        if (step1 === 3 || step1 === 4) {
            C = Math.floor(Math.random() * (step1 - 1)) + 1;
        } else if (step1 === 5) {
            C = Math.random() < 0.5 ? 5 : 0;
        } else {
            const option1 = step1 - 1; 
            const option2 = step1 - 5; 
            C = Math.random() < 0.5 ? option1 : option2;
        }
      }

    } else {
      op1 = "-";
      A = Math.floor(Math.random() * 4) + 6;
      B = 5;
      const step1 = A - B; 
      
      op2 = "+"; 
      C = 2;
    }

    let result = op1 === "+" ? A + B : A - B;
    result = op2 === "+" ? result + C : result - C;

    const isCValid = (C >= 1 && C <= 9) || (C === 0 && op1 === "+" && op2 === "-" && A + B === 5); 
    
    if (
      isValidQuestion &&
      A >= 1 && A <= 9 &&
      (B === 2 || B === 5) && 
      isCValid &&
      result >= 0 && result <= 9
    ) {
      questions.push({ q: `${A} ${op1} ${B} ${op2} ${C}`, a: result.toString() });
    }
  }

  return questions;
}

// ---------- Book 1 Chapter 9 Five buddy +1 ----------
function randomChapter9FivebuddyPlus1(numQuestions = 10, numNumbers = 4): Question[] {
  const questions: Question[] = [];
  let attempts = 0;

  while (questions.length < numQuestions && attempts < 5000) {
    attempts++;
    let A = 0;
    let B = 0;
    let C = 0;
    let op1 = "+";
    let op2 = "+";
    let D = 0;

    const caseType = Math.random() < 0.5 ? 1 : 2;

    if (caseType === 1) {
      op1 = "+";
      A = 4;
      B = 1;
      const step1 = A + B; 
      op2 = Math.random() < 0.5 ? "+" : "-";

      if (op2 === "+") {
        C = Math.floor(Math.random() * 4) + 1;
        D = step1 + C;
      } else {
        C = 5;
        D = step1 - C;
      }

    } else {
      op1 = "-";
      A = 9;
      B = 5;
      const step1 = A - B; 
      op2 = "+";
      C = 1;
      D = step1 + C;
    }

    if (
      A >= 1 && A <= 9 &&
      C >= 1 && C <= 9 &&
      D >= 0 && D <= 9
    ) {
      questions.push({ q: `${A} ${op1} ${B} ${op2} ${C}`, a: D.toString() });
    }
  }

  return questions;
}

// ---------- Book 1 Chapter 10 Five Buddy + ----------
function randomChapter10FiveBuddyPlus(numQuestions = 10): Question[] {
    const out: Question[] = [];
    while (out.length < numQuestions) {
        const op1 = Math.random() < 0.5 ? "+" : "-";
        const op2 = Math.random() < 0.5 ? "+" : "-";
        let A, B, C;

        if (op1 === "+") {
            A = Math.floor(Math.random() * 4) + 1;
            const pivot = 5 - A;

            switch (Math.floor(Math.random() * 6) + 1) {
                case 1:
                    B = pivot;
                    C = op2 === "+" ? Math.floor(Math.random() * 4) + 1 : 5;
                    break;
                case 2:
                    if (pivot <= 1 || op2 !== "+") continue;
                    B = Math.floor(Math.random() * (pivot - 1)) + 1;
                    C = 5 - (A + B);
                    break;
                case 3:
                    if (pivot >= 5 || op2 !== "+") continue;
                    B = Math.floor(Math.random() * (5 - pivot)) + (pivot + 1);
                    C = Math.floor(Math.random() * (A + B - 1)) + 1;
                    break;
                case 4:
                    if (op2 !== "-") continue;
                    B = pivot;
                    C = 5;
                    break;
                case 5:
                    if (pivot <= 1 || op2 !== "-") continue;
                    B = Math.floor(Math.random() * (pivot - 1)) + 1;
                    C = Math.floor(Math.random() * (A + B)) + 1;
                    break;
                case 6:
                    if (pivot >= 5 || op2 !== "-") continue;
                    B = Math.floor(Math.random() * (5 - pivot)) + (pivot + 1);
                    C = [A + B - 5, 5][Math.random() < 0.5 ? 0 : 1];
                    break;
            }
        } else {
            A = Math.floor(Math.random() * 9) + 1;
            if (A >= 1 && A <= 4) {
                if (A <= 1 || op2 !== "+") continue;
                B = Math.floor(Math.random() * (A - 1)) + 1;
                C = 5 - (A - B);
            } else if (A >= 6 && A <= 9) {
                if (op2 !== "+") continue;
                if (Math.random() < 0.5 && A - 5 >= 1) {
                    B = Math.floor(Math.random() * (A - 5)) + 1;
                    C = Math.floor(Math.random() * 4) + 1;
                } else {
                    B = 5;
                    C = 5 - (A - B);
                }
            } else {
                continue;
            }
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

// ---------- Book 1 Chapter 11 Five Buddy -4 ----------
function randomChapter11FiveBuddyMinus4(numQuestions = 10, numNumbers = 4): Question[] {
  const questions: Question[] = [];
  let attempts = 0;

  while (questions.length < numQuestions && attempts < 5000) {
    attempts++;
    let A = 0;
    let B = 0;
    let C = 4;
    let op1 = "+";
    let op2 = "-"; 
    let D = 0;

    const caseType = Math.random() < 0.5 ? 1 : 2;

    if (caseType === 1) {
      op1 = "+";
      A = Math.floor(Math.random() * 4) + 1;
      const option1 = 5;
      const option2 = 5 - A;
      B = Math.random() < 0.5 ? option1 : option2;
      C = 4;
      D = A + B - C;
    } else {
      op1 = "-";
      const aOptions = [6, 7, 8, 9];
      A = aOptions[Math.floor(Math.random() * aOptions.length)];
      B = A - 5;
      C = 4;
      D = A - B - C;
    }

    if (
      A >= 1 && A <= 9 &&
      B >= 1 && B <= 9 &&
      C === 4 &&
      D >= 0 && D <= 9
    ) {
      questions.push({ q: `${A} ${op1} ${B} ${op2} ${C}`, a: D.toString() });
    }
  }

  return questions;
}

// ---------- Book 1 Chapter 12 Five buddy -3 ----------
function randomChapter12FivebuddyMinus3(numQuestions = 10, numNumbers = 4): Question[] {
  const questions: Question[] = [];
  let attempts = 0;

  while (questions.length < numQuestions && attempts < 5000) {
    attempts++;
    let A = 0;
    let B = 0;
    let C = 3;
    let op1 = "+";
    let op2 = "-";
    let D = 0;

    const caseType = Math.random() < 0.5 ? 1 : 2;

    if (caseType === 1) {
      op1 = "+";
      A = Math.floor(Math.random() * 4) + 1;
      const option1 = 5;
      const option2 = 5 - A;
      B = Math.random() < 0.5 ? option1 : option2;
      C = 3;
      D = A + B - C;
    } else {
      op1 = "-";
      const aOptions = [6, 7, 8, 9];
      A = aOptions[Math.floor(Math.random() * aOptions.length)];
      B = A - 5;
      C = 3;
      D = A - B - C;
    }

    if (
      A >= 1 && A <= 9 &&
      B >= 1 && B <= 9 &&
      C === 3 &&
      D >= 0 && D <= 9
    ) {
      questions.push({ q: `${A} ${op1} ${B} ${op2} ${C}`, a: D.toString() });
    }
  }

  return questions;
}

// ---------- Book 1 Chapter 13 Five buddy -2 ----------
function randomChapter13FivebuddyMinus2(numQuestions = 10, numNumbers = 4): Question[] {
  const questions: Question[] = [];
  let attempts = 0;

  while (questions.length < numQuestions && attempts < 5000) {
    attempts++;
    let A = 0;
    let B = 0;
    let C = 2;
    let op1 = "+";
    let op2 = "-";
    let D = 0;

    const caseType = Math.random() < 0.5 ? 1 : 2;

    if (caseType === 1) {
      op1 = "+";
      A = Math.floor(Math.random() * 4) + 1;
      B = 5 - A;
      C = 2;
      D = A + B - C;
    } else {
      op1 = "-";
      const aOptions = [6, 7, 8, 9];
      A = aOptions[Math.floor(Math.random() * aOptions.length)];
      B = A - 5;
      C = 2;
      D = A - B - C;
    }

    if (
      A >= 1 && A <= 9 &&
      B >= 1 && B <= 9 &&
      C === 2 &&
      D >= 0 && D <= 9
    ) {
      questions.push({ q: `${A} ${op1} ${B} ${op2} ${C}`, a: D.toString() });
    }
  }

  return questions;
}

// ---------- Book 1 Chapter 14 Five buddy -1 ----------
function randomChapter14FivebuddyMinus1(numQuestions = 10, numNumbers = 4): Question[] {
  const questions: Question[] = [];
  let attempts = 0;

  while (questions.length < numQuestions && attempts < 5000) {
    attempts++;
    let A = 0;
    let B = 0;
    let C = 1;
    let op1 = "+";
    let op2 = "-";
    let D = 0;

    const caseType = Math.random() < 0.5 ? 1 : 2;

    if (caseType === 1) {
      op1 = "+";
      A = Math.floor(Math.random() * 4) + 1;
      B = 5 - A;
      C = 1;
      D = A + B - C;
    } else {
      op1 = "-";
      const aOptions = [6, 7, 8, 9];
      A = aOptions[Math.floor(Math.random() * aOptions.length)];
      B = A - 5;
      C = 1;
      D = A - B - C;
    }

    if (
      A >= 1 && A <= 9 &&
      B >= 1 && B <= 9 &&
      C === 1 &&
      D >= 0 && D <= 9
    ) {
      questions.push({ q: `${A} ${op1} ${B} ${op2} ${C}`, a: D.toString() });
    }
  }

  return questions;
}

// ---------- Book 1 Chapter 15 Five Buddy (-) ----------
function randomChapter15FiveBuddyMinus(numQuestions = 10): Question[] {
    let A, B, C, op2, D, expr;
    const questions: Question[] = [];
    while (questions.length < numQuestions) {
        let caseType = Math.random() < 0.5 ? 1 : 2;

        if (caseType === 1) {
            A = 5;
            B = [1, 2, 3, 4][Math.floor(Math.random() * 4)];
            let AB = A - B;
            op2 = Math.random() < 0.5 ? "+" : "-";

            if (op2 === "+") {
                if (AB === 4) {
                    C = Math.floor(Math.random() * 5) + 1; // 1–5
                } else if (AB < 4) {
                    let cMin = 5,
                        cMax = 10 - AB;
                    let cOptions = [];
                    for (let x = cMin; x < cMax; x++) cOptions.push(x);
                    if (cOptions.length === 0) continue;
                    C = cOptions[Math.floor(Math.random() * cOptions.length)];
                } else {
                    C = Math.floor(Math.random() * 5) + 1;
                }
                D = AB + C;
            } else {
                if (AB < 1) continue;
                C = Math.floor(Math.random() * AB) + 1;
                D = AB - C;
            }
            expr = `${A} - ${B} ${op2} ${C}`;
        } else {
            A = [6, 7, 8][Math.floor(Math.random() * 3)];
            let bMin = A - 5 + 1,
                bMax = 4;
            let bOptions = [];
            for (let x = bMin; x < bMax; x++) bOptions.push(x);
            if (bOptions.length === 0) continue;
            B = bOptions[Math.floor(Math.random() * bOptions.length)];
            let AB = A - B;
            op2 = Math.random() < 0.5 ? "+" : "-";

            if (op2 === "+") {
                C = Math.floor(Math.random() * 5) + 1;
                D = AB + C;
            } else {
                if (AB < 1) continue;
                C = Math.floor(Math.random() * AB) + 1;
                D = AB - C;
            }
            expr = `${A} - ${B} ${op2} ${C}`;
        }

        if ([A, B, C].every((v) => v >= 1 && v <= 9) && D >= 0 && D <= 9) {
            questions.push({ q: expr, a: D.toString() });
        }
    }
    return questions;
}

// ---------- Book 1 Chapter 16 Five Buddy +- ----------
function randomChapter16FiveBuddyPlusMinus(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const uniqueQuestions = new Set<string>();
  let attempts = 0;

  while (questions.length < numQuestions && attempts < 5000) {
    attempts++;
    let A = 0;
    let B = 0;
    let C = 0;
    let op1: "+" | "-" = "+";
    let op2: "+" | "-" = "+";
    let isValidQuestion = true;
    
    const startWithPlus = Math.random() < 0.5;

    if (startWithPlus) {
      op1 = "+";
      A = Math.floor(Math.random() * 4) + 1;
      
      const B_small_min = 5 - A; 
      const B_small_max = 4;
      const use_B_small = Math.random() < 0.5;

      if (use_B_small && B_small_min <= B_small_max) {
        B = Math.floor(Math.random() * (B_small_max - B_small_min + 1)) + B_small_min;
        const step1 = A + B; 
        
        op2 = Math.random() < 0.5 ? "+" : "-";

        if (op2 === "+") {
            const C_max = 9 - step1; 
            if (C_max < 1) { isValidQuestion = false; continue; }

            const C_options: number[] = [1, 2, 3, 4, 5].filter(c => c <= C_max);
            
            if (C_options.length === 0) { isValidQuestion = false; continue; }
            C = C_options[Math.floor(Math.random() * C_options.length)];

        } else {
            const C_max = Math.min(9, step1);
            C = Math.floor(Math.random() * C_max) + 1; 
        }

      } else {
        B = 5;
        const step1 = A + B; 
        op2 = "-";
        
        const C_min = step1 - 5; 
        const C_max = 4;

        C = Math.floor(Math.random() * (C_max - C_min + 1)) + C_min; 
      }

    } else {
      op1 = "-";
      A = Math.floor(Math.random() * 4) + 6;

      const B_min = A - 4;
      const B_max = 4;
      
      if (A === 9) { isValidQuestion = false; continue; }
      
      B = Math.floor(Math.random() * (B_max - B_min + 1)) + B_min;

      const step1 = A - B; 
      op2 = "+"; 
      C = 5 - step1; 
    }

    let result = op1 === "+" ? A + B : A - B;
    result = op2 === "+" ? result + C : result - C;
    const questionString = `${A} ${op1} ${B} ${op2} ${C}`;

    if (
      isValidQuestion &&
      C >= 1 && C <= 9 && 
      result >= 0 && result <= 9 &&
      !uniqueQuestions.has(questionString) 
    ) {
      questions.push({ q: questionString, a: result.toString() });
      uniqueQuestions.add(questionString); 
    }
  }

  return questions;
}

// ---------- Book 1 Chapter 17 Mix 5 buddy 2 digits ----------
function randomChapter17Mix5buddy2digits(numQuestions = 10, numNumbers = 4): Question[] {
  const questions: Question[] = [];
  let attempts = 0;

  function getDigitComponents(op1: string, op2: string): { A: number; B: number; C: number; D: number } | null {
    let A = 0, B = 0, C = 0, D = 0;

    if (op1 === "+") {
      A = Math.floor(Math.random() * 4) + 1;
      B = 5 - A;

      const step1 = A + B;

      if (op2 === "+") {
        C = Math.floor(Math.random() * 4) + 1;
        D = step1 + C;
      } else {
        C = 5;
        D = step1 - C;
      }
    } else {
      const aOptions = [6, 7, 8, 9];
      A = aOptions[Math.floor(Math.random() * aOptions.length)];

      const bOptions: number[] = [5]; 
      const maxValForOption1 = A - 5; 
      for (let x = 1; x <= maxValForOption1; x++) {
        bOptions.push(x);
      }
      B = bOptions[Math.floor(Math.random() * bOptions.length)];

      const step1 = A - B;

      if (op2 === "+") {
        if (step1 === 5) {
          C = Math.floor(Math.random() * 4) + 1;
        } else {
          C = 5 - step1;
        }
        D = step1 + C;
      } else { 
        if (step1 === 5) {
          C = 5;
        } else {
          C = Math.floor(Math.random() * step1) + 1;
        }
        D = step1 - C;
      }
    }

    if (A >= 1 && A <= 9 && B >= 1 && B <= 9 && C >= 1 && C <= 9 && D >= 0 && D <= 9) {
      return { A, B, C, D };
    }
    return null;
  }

  while (questions.length < numQuestions && attempts < 5000) {
    attempts++;
    
    const op1 = Math.random() < 0.5 ? "+" : "-";
    const op2 = Math.random() < 0.5 ? "+" : "-";

    const tens = getDigitComponents(op1, op2);
    if (!tens) continue;

    const units = getDigitComponents(op1, op2);
    if (!units) continue;

    const M = (tens.A * 10) + units.A;
    const N = (tens.B * 10) + units.B;
    const O = (tens.C * 10) + units.C;

    let step1 = 0;
    if (op1 === "+") step1 = M + N;
    else step1 = M - N;

    let P = 0;
    if (op2 === "+") P = step1 + O;
    else P = step1 - O;

    if (P >= 0 && P <= 99) {
      questions.push({ q: `${M} ${op1} ${N} ${op2} ${O}`, a: P.toString() });
    }
  }

  return questions;
}

// ---------- generator selector ----------
function getGenerator(chapter: number): GenFn {
  switch (chapter) {
    case 1:
      return randomChapter1Lower;
    case 2:
      return randomChapter2Lower2Digits;
    case 3:
      return randomChapterChapter3Upper;
    case 4:
      return randomChapter4MixLowerUpper;
    case 5:
      return randomChapter5MixUpperLower2Digits;
    case 6:
      return randomChapter6FivebuddyPlus4;
    case 7:
      return randomChapter7FivebuddyPlus3;
    case 8:
      return randomChapter8FivebuddyPlus2;
    case 9:
      return randomChapter9FivebuddyPlus1;
    case 10:
      return randomChapter10FiveBuddyPlus;
    case 11:
      return randomChapter11FiveBuddyMinus4;
    case 12:
      return randomChapter12FivebuddyMinus3;
    case 13:
      return randomChapter13FivebuddyMinus2;
    case 14:
      return randomChapter14FivebuddyMinus1;
    case 15:
      return randomChapter15FiveBuddyMinus;
    case 16:
      return randomChapter16FiveBuddyPlusMinus;
    case 17:
      return randomChapter17Mix5buddy2digits;
    default:
      return randomChapter1Lower;
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
    const chapter = Number(body.chapter ?? 1);
    const numQuestions = Number(body.numQuestions ?? 20);
    const numNumbers = Number(body.numNumbers ?? 4);

    const gen = getGenerator(chapter);
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