// book5.ts - Book 5 Generator Functions

import { Question, GenFn, fillQuestions } from "./book1.ts";

// Chapter 1: Lower Upper 2 Digit (clone of randomChapter5MixUpperLower2Digits from book1.ts)
function randomBook5Chapter1(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const uniqueSet = new Set<string>();
  let attempts = 0;

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

  while (questions.length < numQuestions && attempts < 4000) {
    attempts++;
    const op1 = rOp(); const op2 = rOp();
    const tensSeq = getDigitSequence(op1, op2, r19); if (!tensSeq) continue;
    const unitsSeq = getDigitSequence(op1, op2, r09); if (!unitsSeq) continue;
    const valA = (tensSeq[0] * 10) + unitsSeq[0];
    const valB = (tensSeq[1] * 10) + unitsSeq[1];
    const valC = (tensSeq[2] * 10) + unitsSeq[2];
    const stage1 = evalOp(valA, op1, valB);
    const valD = evalOp(stage1, op2, valC);

    const qStr = `${valA} ${op1} ${valB} ${op2} ${valC}`;
    if (!uniqueSet.has(qStr)) {
      questions.push({ q: qStr, a: valD.toString() });
      uniqueSet.add(qStr);
    }
  }
  return fillQuestions(questions, numQuestions!);
}

// Chapter 2: 2 Digit +- 2 Digit (A ± B ± C ± D = H)
function randomBook5Chapter2(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const uniqueSet = new Set<string>();
  let attempts = 0;

  function r2digit() { return Math.floor(Math.random() * 90) + 10; } // 10-99
  function r1digit() { return Math.floor(Math.random() * 9) + 1; }   // 1-9
  function rOp() { return Math.random() < 0.5 ? "+" : "-"; }

  while (questions.length < numQuestions && attempts < 4000) {
    attempts++;
    const A = r2digit();
    const B = r1digit();
    const C = r1digit();
    const D = r1digit();
    const op1 = rOp();
    const op2 = rOp();
    const op3 = rOp();

    // Calculate running totals
    const step1 = op1 === "+" ? A + B : A - B;
    if (step1 < 0) continue;
    const step2 = op2 === "+" ? step1 + C : step1 - C;
    if (step2 < 0) continue;
    const H = op3 === "+" ? step2 + D : step2 - D;
    if (H < 0) continue;

    const qStr = `${A} ${op1} ${B} ${op2} ${C} ${op3} ${D}`;
    if (!uniqueSet.has(qStr)) {
      questions.push({ q: qStr, a: H.toString() });
      uniqueSet.add(qStr);
    }
  }
  return fillQuestions(questions, numQuestions!);
}

// Chapter 3: Multiply 2 Digit (A × B = C)
function randomBook5Chapter3(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const uniqueSet = new Set<string>();
  let attempts = 0;

  function r2digit() { return Math.floor(Math.random() * 90) + 10; } // 10-99
  function r1digit() { return Math.floor(Math.random() * 9) + 1; }   // 1-9

  while (questions.length < numQuestions && attempts < 4000) {
    attempts++;
    const A = r2digit();
    const B = r1digit();
    const C = A * B;

    const qStr = `${A} × ${B}`;
    if (!uniqueSet.has(qStr)) {
      questions.push({ q: qStr, a: C.toString() });
      uniqueSet.add(qStr);
    }
  }
  return fillQuestions(questions, numQuestions!);
}

// Chapter 4: Multiply Missing Number (_ × B = C)
// A×B=C where A is 1 digit (the answer), B is 1 digit, C is 2 digit
function randomBook5Chapter4(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const uniqueSet = new Set<string>();
  let attempts = 0;

  while (questions.length < numQuestions && attempts < 4000) {
    attempts++;

    // 1. Generate random A (answer) between 1 and 9 (1 digit only)
    const A = Math.floor(Math.random() * 9) + 1;
    // 2. Generate random B (multiplier) between 1 and 9
    const B = Math.floor(Math.random() * 9) + 1;
    // 3. Calculate C = A * B
    const C = A * B;

    // 4. C must be 2-digit (10-99)
    if (C < 10 || C > 99) continue;

    // 5. Format question as: _ × B = C
    const qStr = `_ × ${B} = ${C}`;

    if (!uniqueSet.has(qStr)) {
      // 6. Answer is string value of A
      questions.push({ q: qStr, a: A.toString() });
      uniqueSet.add(qStr);
    }
  }
  return fillQuestions(questions, numQuestions!);
}

// Chapter 5: Five Buddy 2 Digit (clone of randomChapter17Mix5buddy2digits from book1.ts)
function randomBook5Chapter5(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const uniqueSet = new Set<string>();
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

  while (questions.length < numQuestions && attempts < 4000) {
    attempts++;
    const op1 = Math.random() < 0.5 ? "+" : "-"; const op2 = Math.random() < 0.5 ? "+" : "-";
    const tens = getDigitComponents(op1, op2); if (!tens) continue;
    const units = getDigitComponents(op1, op2); if (!units) continue;
    const M = (tens.A * 10) + units.A; const N = (tens.B * 10) + units.B; const O = (tens.C * 10) + units.C;
    let step1 = 0; if (op1 === "+") step1 = M + N; else step1 = M - N;
    let P = 0; if (op2 === "+") P = step1 + O; else P = step1 - O;

    const qStr = `${M} ${op1} ${N} ${op2} ${O}`;
    if (P >= 0 && P <= 99 && !uniqueSet.has(qStr)) {
      questions.push({ q: qStr, a: P.toString() });
      uniqueSet.add(qStr);
    }
  }
  return fillQuestions(questions, numQuestions!);
}

// Export all Book 5 generator functions
export const book5Generators: Record<number, GenFn> = {
  1: randomBook5Chapter1,
  2: randomBook5Chapter2,
  3: randomBook5Chapter3,
  4: randomBook5Chapter4,
  5: randomBook5Chapter5,
};
