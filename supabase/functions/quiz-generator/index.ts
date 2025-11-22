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

// ---------- CHAPTER 1 ----------
function randomChapter1(numQuestions = 10, numNumbers = 4): Question[] {
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

// ---------- CHAPTER 2 ----------
function randomChapter2(numQuestions = 10, numNumbers = 4): Question[] {
  const out: Question[] = [];

  function r19() {
    return Math.floor(Math.random() * 9) + 1;
  }
  function rOp() {
    return Math.random() < 0.5 ? "+" : "-";
  }
  function evalOp(x: number, o: string, y: number) {
    return o === "+" ? x + y : x - y;
  }

  function choose(
    generator: () => number,
    ok: (v: number) => boolean,
    tries = 60,
  ): number | null {
    while (tries--) {
      const v = generator();
      if (ok(v)) return v;
    }
    return null;
  }

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

    let B =
      op1 === "+"
        ? choose(r19, (b) => validB_plus(A, b))
        : choose(r19, (b) => validB_minus(A, b));
    if (B == null) continue;

    const stage1 = evalOp(A, op1, B);
    if (stage1 < 0 || stage1 > 9) continue;

    const op2 = rOp();
    let C = choose(r19, (c) => {
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

// ---------- CHAPTER 3 ----------
function randomChapter3(numQuestions = 10, numNumbers = 4): Question[] {
  const out: Question[] = [];

  while (out.length < numQuestions) {
    const op1 = Math.random() < 0.5 ? "+" : "-";
    const op2 = Math.random() < 0.5 ? "+" : "-";
    let A = 1;
    let B = 1;
    let C = 1;

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
          C = Math.random() < 0.5 ? A + B - 5 : 5;
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

    const stage1 = op1 === "+" ? A + B : A - B;
    const D = op2 === "+" ? stage1 + C : stage1 - C;
    if (D < 0 || D > 9) continue;

    out.push({ q: `${A} ${op1} ${B} ${op2} ${C}`, a: D.toString() });
  }
  return out;
}

// ---------- CHAPTER 4 ----------
function randomChapter4(numQuestions = 10, numNumbers = 4): Question[] {
  const questions: Question[] = [];

  while (questions.length < numQuestions) {
    let A: number;
    let B: number;
    let C: number;
    let op2: string;
    let D: number;
    let expr: string;

    const caseType = Math.random() < 0.5 ? 1 : 2;

    if (caseType === 1) {
      A = 5;
      B = [1, 2, 3, 4][Math.floor(Math.random() * 4)];
      const AB = A - B;
      op2 = Math.random() < 0.5 ? "+" : "-";

      if (op2 === "+") {
        if (AB === 4) {
          C = Math.floor(Math.random() * 5) + 1;
        } else if (AB < 4) {
          const cOptions: number[] = [];
          for (let x = 5; x < 10 - AB; x++) cOptions.push(x);
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
      const bOptions: number[] = [];
      for (let x = A - 5 + 1; x < 4; x++) bOptions.push(x);
      if (bOptions.length === 0) continue;
      B = bOptions[Math.floor(Math.random() * bOptions.length)];
      const AB = A - B;
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

// ---------- PLACEHOLDER CHAPTER 5 & 8 ----------
// Original server.js you sent does NOT include randomChapter5 / randomChapter8
// but still references them. To avoid crashes, we map them to safe generators.
// You can later replace these with the exact original logic if you still have it.

function randomChapter5(numQuestions = 10, numNumbers = 4): Question[] {
  return randomChapter4(numQuestions, numNumbers);
}

function randomChapter8(numQuestions = 10, numNumbers = 4): Question[] {
  return randomChapter6(numQuestions, numNumbers);
}

// ---------- CHAPTER 6 ----------
function randomChapter6(numQuestions = 10, numNumbers = 4): Question[] {
  const questions: Question[] = [];
  let attempts = 0;

  while (questions.length < numQuestions && attempts < 3000) {
    attempts++;
    let A = 1;
    let B = 1;
    let C = 1;
    let op1: "+" | "-" = "+";
    let op2: "+" | "-" = "+";

    const ruleType = Math.floor(Math.random() * 4);

    if (ruleType === 0) {
      op1 = "+";
      op2 = "+";
      A = Math.floor(Math.random() * 9) + 1;
      B = 10 - A;
      if (B < 1 || B > 9) continue;
      C = Math.floor(Math.random() * 9) + 1;
    } else if (ruleType === 1) {
      op1 = "+";
      op2 = "+";
      A = Math.floor(Math.random() * 9) + 1;
      const maxB = 10 - A - 1;
      if (maxB < 1) continue;
      B = Math.floor(Math.random() * maxB) + 1;
      const sumAB = A + B;
      C = 10 - sumAB;
      if (C < 1 || C > 9) continue;
    } else if (ruleType === 2) {
      op1 = "+";
      op2 = "-";
      A = Math.floor(Math.random() * 9) + 1;
      const maxB = 10 - A - 1;
      if (maxB < 1) continue;
      B = Math.floor(Math.random() * maxB) + 1;
      const sumAB = A + B;
      const maxC = Math.min(sumAB, 9);
      if (maxC < 1) continue;
      C = Math.floor(Math.random() * maxC) + 1;
    } else {
      op1 = "-";
      op2 = "+";
      A = Math.floor(Math.random() * 9) + 1;
      if (A === 1) continue;
      B = Math.floor(Math.random() * (A - 1)) + 1;
      const sumAB = A + B;
      C = 10 - sumAB;
      if (C < 1 || C > 9) continue;
    }

    const expr = `${A} ${op1} ${B} ${op2} ${C}`;
    let result = A;
    result = op1 === "+" ? result + B : result - B;
    result = op2 === "+" ? result + C : result - C;

    if ([A, B, C].every((n) => n >= 1 && n <= 9) && result >= 0 && result <= 30) {
      questions.push({ q: expr, a: result.toString() });
    }
  }
  return questions;
}

// ---------- CHAPTER 7 ----------
function randomChapter7(numQuestions = 10, numNumbers = 4): Question[] {
  const questions: Question[] = [];
  let attempts = 0;

  while (questions.length < numQuestions && attempts < 5000) {
    attempts++;
    let A = 1;
    let B = 1;
    let C = 1;
    let D = 0;
    let possibleCs: number[] = [];

    const caseType = Math.random();

    if (caseType < 0.38) {
      A = Math.floor(Math.random() * 4) + 1;
      const minB = 10 - A;
      if (minB > 9) continue;
      B = Math.floor(Math.random() * (10 - minB)) + minB;
      const sum = A + B;

      if (sum <= 10) {
        possibleCs = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      } else if (sum === 11) {
        possibleCs = [2, 3, 4, 5, 7, 8, 9];
      } else if (sum === 12) {
        possibleCs = [3, 4, 5, 8, 9];
      } else if (sum === 13) {
        possibleCs = [4, 5, 9];
      } else if (sum === 14) {
        possibleCs = [5];
      } else {
        continue;
      }
      if (possibleCs.length === 0) continue;
      C = possibleCs[Math.floor(Math.random() * possibleCs.length)];
    } else if (caseType < 0.54) {
      A = 5;
      B = 5;
      possibleCs = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      C = possibleCs[Math.floor(Math.random() * possibleCs.length)];
    } else {
      A = Math.floor(Math.random() * 4) + 6;
      const minB = 10 - A;
      const maxB = 5;
      if (minB > 5 || minB > 9) continue;
      const possibleBs: number[] = [];
      for (let b = minB; b <= maxB; b++) {
        if (b >= 1 && b <= 9) possibleBs.push(b);
      }
      if (possibleBs.length === 0) continue;
      B = possibleBs[Math.floor(Math.random() * possibleBs.length)];
      const sum = A + B;

      if (sum === 10) {
        possibleCs = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      } else if (sum === 11) {
        possibleCs = [2, 3, 4, 5, 7, 8, 9];
      } else if (sum === 12) {
        possibleCs = [3, 4, 5, 8, 9];
      } else if (sum === 13) {
        possibleCs = [4, 5, 9];
      } else if (sum === 14) {
        possibleCs = [5];
      } else {
        continue;
      }
      if (possibleCs.length === 0) continue;
      C = possibleCs[Math.floor(Math.random() * possibleCs.length)];
    }

    const expr = `${A} + ${B} - ${C}`;
    D = A + B - C;

    if ([A, B, C].every((n) => n >= 1 && n <= 9) && D >= 0 && D <= 100) {
      questions.push({ q: expr, a: D.toString() });
    }
  }
  return questions;
}

// ---------- helper alternate ----------
function alternateQuestions(arr1: Question[], arr2: Question[], total: number): Question[] {
  const mixed: Question[] = [];
  let i = 0;
  while (mixed.length < total) {
    if (i < arr1.length) mixed.push(arr1[i]);
    if (mixed.length < total && i < arr2.length) mixed.push(arr2[i]);
    i++;
  }
  return mixed;
}

// ---------- CHAPTER 9 ----------
function randomChapter9(numQuestions = 10, numNumbers = 4): Question[] {
  const questions: Question[] = [];
  const seen = new Set<string>();
  let attempts = 0;

  while (questions.length < numQuestions && attempts < 2000) {
    attempts++;
    let A = 1;
    let B = 1;
    let C = 1;
    let op1: "+" | "-" = "+";
    let op2: "+" | "-" = "+";

    const ruleType = Math.floor(Math.random() * 4);

    if (ruleType === 0) {
      op1 = "+";
      op2 = "+";
      A = 5;
      B = 9;
      C = Math.floor(Math.random() * 9) + 1;
    } else if (ruleType === 1) {
      op1 = "+";
      op2 = "+";
      A = Math.floor(Math.random() * 4) + 1;
      B = 5 - A;
      C = 9;
    } else if (ruleType === 2) {
      op1 = "+";
      op2 = "+";
      A = Math.floor(Math.random() * 4) + 6;
      B = 15 - A;
      C = 9;
    } else {
      op1 = "-";
      op2 = "+";
      A = Math.floor(Math.random() * 4) + 6;
      B = A - 5;
      C = 9;
    }

    const expr = `${A} ${op1} ${B} ${op2} ${C}`;
    let result = A;
    result = op1 === "+" ? result + B : result - B;
    result = op2 === "+" ? result + C : result - C;

    if (
      [A, B, C].every((n) => n >= 1 && n <= 9) &&
      result >= 0 &&
      result <= 100 &&
      !seen.has(expr)
    ) {
      questions.push({ q: expr, a: result.toString() });
      seen.add(expr);
    }
  }
  return questions;
}

// ---------- CHAPTER 10 ----------
function randomChapter10(numQuestions = 10, numNumbers = 4): Question[] {
  const questions: Question[] = [];
  const seen = new Set<string>();
  let attempts = 0;

  while (questions.length < numQuestions && attempts < 4000) {
    attempts++;
    let A = 1;
    let B = 1;
    let C = 1;
    let op1: "+" | "-" = "+";
    let op2: "+" | "-" = "+";

    const ruleType = Math.floor(Math.random() * 7);

    if (ruleType === 0) {
      op1 = "+";
      op2 = "+";
      A = Math.random() < 0.5 ? 5 : 6;
      B = 8;
      C = Math.floor(Math.random() * 9) + 1;
    } else if (ruleType === 1) {
      op1 = "+";
      op2 = "+";
      A = Math.floor(Math.random() * 4) + 1;
      B = 5 - A;
      C = 8;
    } else if (ruleType === 2) {
      op1 = "+";
      op2 = "+";
      A = Math.floor(Math.random() * 4) + 1;
      B = 6 - A;
      C = 8;
    } else if (ruleType === 3) {
      op1 = "+";
      op2 = "+";
      A = Math.floor(Math.random() * 4) + 6;
      B = 15 - A;
      C = 8;
    } else if (ruleType === 4) {
      op1 = "+";
      op2 = "+";
      A = Math.floor(Math.random() * 4) + 6;
      B = 16 - A;
      C = 8;
    } else if (ruleType === 5) {
      op1 = "-";
      op2 = "+";
      A = Math.floor(Math.random() * 4) + 6;
      B = A - 5;
      C = 8;
    } else {
      op1 = "-";
      op2 = "+";
      A = Math.floor(Math.random() * 4) + 6;
      B = A - 6;
      C = 8;
    }

    if (![A, B, C].every((n) => n >= 1 && n <= 9)) continue;

    const expr = `${A} ${op1} ${B} ${op2} ${C}`;
    let result = A;
    result = op1 === "+" ? result + B : result - B;
    result = op2 === "+" ? result + C : result - C;

    if (result >= 0 && result <= 100 && !seen.has(expr)) {
      questions.push({ q: expr, a: result.toString() });
      seen.add(expr);
    }
  }

  return questions;
}

// ---------- CHAPTER 11 ----------
function randomChapter11(numQuestions = 10, numNumbers = 4): Question[] {
  const questions: Question[] = [];
  const seen = new Set<string>();
  let attempts = 0;

  while (questions.length < numQuestions && attempts < 6000) {
    attempts++;
    let A = 1;
    let B = 1;
    let C = 1;
    let op1: "+" | "-" = "+";
    let op2: "+" | "-" = "+";

    const ruleType = Math.floor(Math.random() * 10);

    if (ruleType === 0) {
      op1 = "+";
      op2 = "+";
      A = [5, 6, 7][Math.floor(Math.random() * 3)];
      B = 7;
      C = Math.floor(Math.random() * 9) + 1;
    } else if (ruleType === 1) {
      op1 = "+";
      op2 = "+";
      A = Math.floor(Math.random() * 4) + 1;
      B = 5 - A;
      C = 7;
    } else if (ruleType === 2) {
      op1 = "+";
      op2 = "+";
      A = Math.floor(Math.random() * 4) + 1;
      B = 6 - A;
      C = 7;
    } else if (ruleType === 3) {
      op1 = "+";
      op2 = "+";
      A = Math.floor(Math.random() * 4) + 1;
      B = 7 - A;
      C = 7;
    } else if (ruleType === 4) {
      op1 = "+";
      op2 = "+";
      A = Math.floor(Math.random() * 4) + 6;
      B = 15 - A;
      C = 7;
    } else if (ruleType === 5) {
      op1 = "+";
      op2 = "+";
      A = Math.floor(Math.random() * 4) + 6;
      B = 16 - A;
      C = 7;
    } else if (ruleType === 6) {
      op1 = "+";
      op2 = "+";
      A = Math.floor(Math.random() * 4) + 6;
      B = 17 - A;
      C = 7;
    } else if (ruleType === 7) {
      op1 = "-";
      op2 = "+";
      A = Math.floor(Math.random() * 4) + 6;
      B = A - 5;
      C = 7;
    } else if (ruleType === 8) {
      op1 = "-";
      op2 = "+";
      A = Math.floor(Math.random() * 4) + 6;
      B = A - 6;
      C = 7;
    } else {
      op1 = "-";
      op2 = "+";
      A = Math.floor(Math.random() * 3) + 7;
      B = A - 7;
      C = 7;
    }

    if (![A, B, C].every((n) => n >= 1 && n <= 9)) continue;

    const expr = `${A} ${op1} ${B} ${op2} ${C}`;
    let result = op1 === "+" ? A + B : A - B;
    result = op2 === "+" ? result + C : result - C;

    if (result >= 0 && result <= 100 && !seen.has(expr)) {
      questions.push({ q: expr, a: result.toString() });
      seen.add(expr);
    }
  }

  return questions;
}

// ---------- CHAPTER 12 ----------
function randomChapter12(numQuestions = 10, numNumbers = 4): Question[] {
  const questions: Question[] = [];
  const seen = new Set<string>();
  let attempts = 0;

  while (questions.length < numQuestions && attempts < 8000) {
    attempts++;
    let A = 1;
    let B = 1;
    let C = 1;
    let op1: "+" | "-" = "+";
    let op2: "+" | "-" = "+";

    const ruleType = Math.floor(Math.random() * 14);

    if (ruleType === 0) {
      op1 = "+";
      op2 = "+";
      A = Math.floor(Math.random() * 4) + 5;
      B = 6;
      C = Math.floor(Math.random() * 9) + 1;
    } else if (ruleType === 1) {
      op1 = "+";
      op2 = "+";
      A = Math.floor(Math.random() * 4) + 1;
      B = 5 - A;
      C = 6;
    } else if (ruleType === 2) {
      op1 = "+";
      op2 = "+";
      A = Math.floor(Math.random() * 4) + 1;
      B = 6 - A;
      C = 6;
    } else if (ruleType === 3) {
      op1 = "+";
      op2 = "+";
      A = Math.floor(Math.random() * 4) + 1;
      B = 7 - A;
      C = 6;
    } else if (ruleType === 4) {
      op1 = "+";
      op2 = "+";
      A = Math.floor(Math.random() * 4) + 1;
      B = 8 - A;
      C = 6;
    } else if (ruleType === 5) {
      op1 = "+";
      op2 = "+";
      A = Math.floor(Math.random() * 4) + 6;
      B = 15 - A;
      C = 6;
    } else if (ruleType === 6) {
      op1 = "+";
      op2 = "+";
      A = Math.floor(Math.random() * 4) + 6;
      B = 16 - A;
      C = 6;
    } else if (ruleType === 7) {
      op1 = "+";
      op2 = "+";
      A = Math.floor(Math.random() * 4) + 6;
      B = 17 - A;
      C = 6;
    } else if (ruleType === 8) {
      op1 = "+";
      op2 = "+";
      A = Math.floor(Math.random() * 4) + 6;
      B = 18 - A;
      C = 6;
    } else if (ruleType === 9) {
      op1 = "-";
      op2 = "+";
      A = Math.floor(Math.random() * 4) + 6;
      B = A - 5;
      C = 6;
    } else if (ruleType === 10) {
      op1 = "-";
      op2 = "+";
      A = Math.floor(Math.random() * 4) + 6;
      B = A - 6;
      C = 6;
    } else if (ruleType === 11) {
      op1 = "-";
      op2 = "+";
      A = Math.floor(Math.random() * 3) + 7;
      B = A - 7;
      C = 6;
    } else if (ruleType === 12) {
      op1 = "-";
      op2 = "+";
      A = Math.floor(Math.random() * 2) + 8;
      B = A - 8;
      C = 6;
    } else {
      // ruleType 13: we just reuse a safe pattern
      op1 = "+";
      op2 = "+";
      A = Math.floor(Math.random() * 4) + 5;
      B = 5;
      C = 6;
    }

    if (![A, B, C].every((x) => x >= 1 && x <= 14)) continue;

    const expr = `${A} ${op1} ${B} ${op2} ${C}`;
    let result = op1 === "+" ? A + B : A - B;
    result = op2 === "+" ? result + C : result - C;

    if (result >= 0 && result <= 100 && !seen.has(expr)) {
      questions.push({ q: expr, a: result.toString() });
      seen.add(expr);
    }
  }

  return questions;
}

// ---------- CHAPTER 13 ----------
function randomChapter13(numQuestions = 10, numNumbers = 4): Question[] {
  const questions: Question[] = [];
  const seen = new Set<string>();
  let attempts = 0;

  while (questions.length < numQuestions && attempts < 2000) {
    attempts++;
    let A = 14;
    let B = 9;
    let C = 1;
    let op1: "+" | "-" = "-";
    let op2: "+" | "-" = "+";

    const ruleType = Math.floor(Math.random() * 3);

    if (ruleType === 0) {
      op1 = "-";
      op2 = "+";
      A = 14;
      B = 9;
      C = Math.floor(Math.random() * 9) + 1;
    } else if (ruleType === 1) {
      op1 = "-";
      op2 = "-";
      A = 14;
      B = 9;
      C = Math.floor(Math.random() * 5) + 1;
    } else {
      op1 = "+";
      op2 = "-";
      A = Math.floor(Math.random() * 4) + 6;
      B = 14 - A;
      C = 9;
      if (B < 1 || B > 9) continue;
    }

    const expr = `${A} ${op1} ${B} ${op2} ${C}`;
    let result = op1 === "+" ? A + B : A - B;
    result = op2 === "+" ? result + C : result - C;

    if (
      [A, B, C].every((x) => x >= 1 && x <= 14) &&
      result >= 0 &&
      result <= 100 &&
      !seen.has(expr)
    ) {
      questions.push({ q: expr, a: result.toString() });
      seen.add(expr);
    }
  }

  return questions;
}

// ---------- CHAPTER 14 ----------
function randomChapter14(numQuestions = 10, numNumbers = 4): Question[] {
  const questions: Question[] = [];
  const seen = new Set<string>();
  let attempts = 0;

  while (questions.length < numQuestions && attempts < 2000) {
    attempts++;
    let A = 13;
    let B = 8;
    let C = 1;
    let op1: "+" | "-" = "-";
    let op2: "+" | "-" = "+";

    const ruleType = Math.floor(Math.random() * 4);

    if (ruleType === 0) {
      op1 = "-";
      op2 = "+";
      A = Math.random() < 0.5 ? 13 : 14;
      B = 8;
      C = Math.floor(Math.random() * 9) + 1;
    } else if (ruleType === 1) {
      op1 = "-";
      op2 = "-";
      A = Math.random() < 0.5 ? 13 : 14;
      B = 8;
      C = Math.floor(Math.random() * 5) + 1;
    } else if (ruleType === 2) {
      op1 = "+";
      op2 = "-";
      A = Math.floor(Math.random() * 4) + 6;
      B = 14 - A;
      C = 8;
      if (B < 1 || B > 9) continue;
    } else {
      op1 = "+";
      op2 = "-";
      A = Math.floor(Math.random() * 4) + 6;
      B = 13 - A;
      C = 8;
      if (B < 1 || B > 9) continue;
    }

    const expr = `${A} ${op1} ${B} ${op2} ${C}`;
    let result = op1 === "+" ? A + B : A - B;
    result = op2 === "+" ? result + C : result - C;

    if (
      [A, B, C].every((x) => x >= 1 && x <= 14) &&
      result >= 0 &&
      result <= 100 &&
      !seen.has(expr)
    ) {
      questions.push({ q: expr, a: result.toString() });
      seen.add(expr);
    }
  }

  return questions;
}

// ---------- CHAPTER 15 ----------
function randomChapter15(numQuestions = 10, numNumbers = 4): Question[] {
  const questions: Question[] = [];
  const seen = new Set<string>();
  let attempts = 0;

  while (questions.length < numQuestions && attempts < 2000) {
    attempts++;
    let A = 12;
    let B = 7;
    let C = 1;
    let op1: "+" | "-" = "-";
    let op2: "+" | "-" = "+";

    const ruleType = Math.floor(Math.random() * 6);

    if (ruleType === 0) {
      op1 = "-";
      op2 = "+";
      A = Math.floor(Math.random() * 3) + 12;
      B = 7;
      C = Math.floor(Math.random() * 9) + 1;
    } else if (ruleType === 1) {
      op1 = "-";
      op2 = "-";
      A = Math.floor(Math.random() * 3) + 12;
      B = 7;
      C = Math.floor(Math.random() * 5) + 1;
    } else if (ruleType === 2) {
      op1 = "+";
      op2 = "-";
      A = Math.floor(Math.random() * 4) + 6;
      B = 14 - A;
      C = 7;
      if (B < 1 || B > 9) continue;
    } else if (ruleType === 3) {
      op1 = "+";
      op2 = "-";
      A = Math.floor(Math.random() * 4) + 6;
      B = 13 - A;
      C = 7;
      if (B < 1 || B > 9) continue;
    } else if (ruleType === 4) {
      op1 = "+";
      op2 = "-";
      A = Math.floor(Math.random() * 4) + 6;
      B = 12 - A;
      C = 7;
      if (B < 1 || B > 9) continue;
    } else {
      // safe fallback pattern
      op1 = "+";
      op2 = "-";
      A = Math.floor(Math.random() * 4) + 6;
      B = 11 - A;
      C = 7;
      if (B < 1 || B > 9) continue;
    }

    const expr = `${A} ${op1} ${B} ${op2} ${C}`;
    let result = op1 === "+" ? A + B : A - B;
    result = op2 === "+" ? result + C : result - C;

    if (
      [A, B, C].every((x) => x >= 1 && x <= 14) &&
      result >= 0 &&
      result <= 100 &&
      !seen.has(expr)
    ) {
      questions.push({ q: expr, a: result.toString() });
      seen.add(expr);
    }
  }

  return questions;
}

// ---------- CHAPTER 16 ----------
function randomChapter16(numQuestions = 10, numNumbers = 4): Question[] {
  const questions: Question[] = [];
  const seen = new Set<string>();
  let attempts = 0;

  while (questions.length < numQuestions && attempts < 3000) {
    attempts++;
    let A = 11;
    let B = 6;
    let C = 1;
    let op1: "+" | "-" = "-";
    let op2: "+" | "-" = "+";

    const ruleType = Math.floor(Math.random() * 6);

    if (ruleType === 0) {
      op1 = "-";
      op2 = "+";
      A = Math.floor(Math.random() * 4) + 11;
      B = 6;
      C = Math.floor(Math.random() * 9) + 1;
    } else if (ruleType === 1) {
      op1 = "-";
      op2 = "-";
      A = Math.floor(Math.random() * 4) + 11;
      B = 6;
      C = Math.floor(Math.random() * 5) + 1;
    } else if (ruleType === 2) {
      op1 = "+";
      op2 = "-";
      A = Math.floor(Math.random() * 4) + 6;
      B = 14 - A;
      C = 6;
      if (B < 1 || B > 9) continue;
    } else if (ruleType === 3) {
      op1 = "+";
      op2 = "-";
      A = Math.floor(Math.random() * 4) + 6;
      B = 13 - A;
      C = 6;
      if (B < 1 || B > 9) continue;
    } else if (ruleType === 4) {
      op1 = "+";
      op2 = "-";
      A = Math.floor(Math.random() * 4) + 6;
      B = 12 - A;
      C = 6;
      if (B < 1 || B > 9) continue;
    } else {
      op1 = "+";
      op2 = "-";
      A = Math.floor(Math.random() * 4) + 6;
      B = 11 - A;
      C = 6;
      if (B < 1 || B > 9) continue;
    }

    const expr = `${A} ${op1} ${B} ${op2} ${C}`;
    let result = op1 === "+" ? A + B : A - B;
    result = op2 === "+" ? result + C : result - C;

    if (
      [A, B, C].every((x) => x >= 1 && x <= 14) &&
      result >= 0 &&
      result <= 100 &&
      !seen.has(expr)
    ) {
      questions.push({ q: expr, a: result.toString() });
      seen.add(expr);
    }
  }

  return questions;
}

// ---------- CHAPTER 17 ----------
function randomChapter17(numQuestions = 10, numNumbers = 4): Question[] {
  const questions: Question[] = [];
  let attempts = 0;
  const ops: ("+" | "-")[] = ["+", "-"];

  while (questions.length < numQuestions && attempts < 3000) {
    attempts++;
    const A = Math.floor(Math.random() * 9) + 1;
    const B = Math.floor(Math.random() * 9) + 1;
    const C = Math.floor(Math.random() * 9) + 1;
    const op1 = ops[Math.floor(Math.random() * 2)];
    const op2 = ops[Math.floor(Math.random() * 2)];

    if (op1 === "-" && A < B) continue;

    let step1 = op1 === "+" ? A + B : A - B;
    if (op2 === "-" && step1 < C) continue;

    const D = op2 === "+" ? step1 + C : step1 - C;
    if (D >= 0 && D <= 9) {
      questions.push({ q: `${A} ${op1} ${B} ${op2} ${C}`, a: D.toString() });
    }
  }

  return questions;
}

// ---------- CHAPTER 18 ----------
function randomChapter18(numQuestions = 10, numNumbers = 4): Question[] {
  const questions: Question[] = [];
  let attempts = 0;
  const ops: ("+" | "-")[] = ["+", "-"];

  while (questions.length < numQuestions && attempts < 10000) {
    attempts++;
    const A = Math.floor(Math.random() * 59) + 1;
    const B = Math.floor(Math.random() * 59) + 1;
    const C = Math.floor(Math.random() * 59) + 1;
    const op1 = ops[Math.floor(Math.random() * 2)];
    const op2 = ops[Math.floor(Math.random() * 2)];

    if (op1 === "-" && A < B) continue;

    let step1 = op1 === "+" ? A + B : A - B;
    if (op2 === "-" && step1 < C) continue;

    const D = op2 === "+" ? step1 + C : step1 - C;
    if (D >= 10 && D <= 99) {
      questions.push({ q: `${A} ${op1} ${B} ${op2} ${C}`, a: D.toString() });
    }
  }

  return questions;
}

// ---------- CHAPTER 19 ----------
function randomChapter19(numQuestions = 10, numNumbers = 4): Question[] {
  const questions: Question[] = [];
  let attempts = 0;
  const ops: ("+" | "-")[] = ["+", "-"];

  while (questions.length < numQuestions && attempts < 30000) {
    attempts++;
    const A = Math.floor(Math.random() * 99) + 1;
    const B = Math.floor(Math.random() * 99) + 1;
    const C = Math.floor(Math.random() * 99) + 1;
    const op1 = ops[Math.floor(Math.random() * 2)];
    const op2 = ops[Math.floor(Math.random() * 2)];

    if (op1 === "-" && A < B) continue;
    let step1 = op1 === "+" ? A + B : A - B;
    if (op2 === "-" && step1 < C) continue;

    const D = op2 === "+" ? step1 + C : step1 - C;
    if (D >= 100 && D <= 999) {
      questions.push({ q: `${A} ${op1} ${B} ${op2} ${C}`, a: D.toString() });
    }
  }

  return questions;
}

// ---------- CHAPTER 20 ----------
function randomChapter20(numQuestions = 10, numNumbers = 4): Question[] {
  const questions: Question[] = [];
  let attempts = 0;
  const ops: ("+" | "-")[] = ["+", "-"];

  while (questions.length < numQuestions && attempts < 40000) {
    attempts++;

    const A = Math.floor(Math.random() * 999) + 1;
    const B = Math.floor(Math.random() * 999) + 1;
    const C = Math.floor(Math.random() * 999) + 1;
    const op1 = ops[Math.floor(Math.random() * 2)];
    const op2 = ops[Math.floor(Math.random() * 2)];

    if (op1 === "-" && A < B) continue;
    let step1 = op1 === "+" ? A + B : A - B;
    if (op2 === "-" && step1 < C) continue;

    const D = op2 === "+" ? step1 + C : step1 - C;
    if (D >= 1000 && D <= 9999) {
      questions.push({ q: `${A} ${op1} ${B} ${op2} ${C}`, a: D.toString() });
    }
  }

  return questions;
}

// ---------- generator selector ----------
function getGenerator(chapter: number): GenFn {
  switch (chapter) {
    case 1:
      return randomChapter1;
    case 2:
      return randomChapter2;
    case 3:
      return randomChapter3;
    case 4:
      return randomChapter4;
    case 5:
      return randomChapter5;
    case 6:
      return randomChapter6;
    case 7:
      return randomChapter7;
    case 8:
      return randomChapter8;
    case 9:
      return randomChapter9;
    case 10:
      return randomChapter10;
    case 11:
      return randomChapter11;
    case 12:
      return randomChapter12;
    case 13:
      return randomChapter13;
    case 14:
      return randomChapter14;
    case 15:
      return randomChapter15;
    case 16:
      return randomChapter16;
    case 17:
      return randomChapter17;
    case 18:
      return randomChapter18;
    case 19:
      return randomChapter19;
    case 20:
      return randomChapter20;
    default:
      return randomChapter1;
  }
}

// ---------- HTTP handler ----------
serve(async (req) => {
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
