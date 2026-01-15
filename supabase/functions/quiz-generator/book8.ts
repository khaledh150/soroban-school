// book8.ts - Book 8 Generator Functions

import { Question, GenFn, fillQuestions } from "./book1.ts";

// Chapter 1: 2 Digit ± (A±B±C±D±E±F=H, all 2-digit, H >= 0)
function randomBook8Chapter1(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const uniqueSet = new Set<string>();
  let attempts = 0;

  function r2digit() { return Math.floor(Math.random() * 90) + 10; }
  function rOp() { return Math.random() < 0.5 ? "+" : "-"; }

  while (questions.length < numQuestions && attempts < 4000) {
    attempts++;
    const A = r2digit(), B = r2digit(), C = r2digit();
    const D = r2digit(), E = r2digit(), F = r2digit();
    const op1 = rOp(), op2 = rOp(), op3 = rOp(), op4 = rOp(), op5 = rOp();

    let H = A;
    H = op1 === "+" ? H + B : H - B; if (H < 0) continue;
    H = op2 === "+" ? H + C : H - C; if (H < 0) continue;
    H = op3 === "+" ? H + D : H - D; if (H < 0) continue;
    H = op4 === "+" ? H + E : H - E; if (H < 0) continue;
    H = op5 === "+" ? H + F : H - F; if (H < 0) continue;

    const qStr = `${A} ${op1} ${B} ${op2} ${C} ${op3} ${D} ${op4} ${E} ${op5} ${F}`;
    if (!uniqueSet.has(qStr)) {
      questions.push({ q: qStr, a: H.toString() });
      uniqueSet.add(qStr);
    }
  }
  return fillQuestions(questions, numQuestions!);
}

// Chapter 2: 3 Digit +- (A±B±C±D=H, all 3-digit, H >= 0)
function randomBook8Chapter2(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const uniqueSet = new Set<string>();
  let attempts = 0;

  function r3digit() { return Math.floor(Math.random() * 900) + 100; }
  function rOp() { return Math.random() < 0.5 ? "+" : "-"; }

  while (questions.length < numQuestions && attempts < 4000) {
    attempts++;
    const A = r3digit(), B = r3digit(), C = r3digit(), D = r3digit();
    const op1 = rOp(), op2 = rOp(), op3 = rOp();

    let H = A;
    H = op1 === "+" ? H + B : H - B; if (H < 0) continue;
    H = op2 === "+" ? H + C : H - C; if (H < 0) continue;
    H = op3 === "+" ? H + D : H - D; if (H < 0) continue;

    const qStr = `${A} ${op1} ${B} ${op2} ${C} ${op3} ${D}`;
    if (!uniqueSet.has(qStr)) {
      questions.push({ q: qStr, a: H.toString() });
      uniqueSet.add(qStr);
    }
  }
  return fillQuestions(questions, numQuestions!);
}

// Chapter 3: 3 Digit × 1 Digit
function randomBook8Chapter3(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const uniqueSet = new Set<string>();
  let attempts = 0;

  while (questions.length < numQuestions && attempts < 4000) {
    attempts++;
    const A = Math.floor(Math.random() * 900) + 100; // 100-999
    const B = Math.floor(Math.random() * 9) + 1;     // 1-9
    const C = A * B;

    const qStr = `${A} × ${B}`;
    if (!uniqueSet.has(qStr)) {
      questions.push({ q: qStr, a: C.toString() });
      uniqueSet.add(qStr);
    }
  }
  return fillQuestions(questions, numQuestions!);
}

// Chapter 4: 4 Digit × 1 Digit
function randomBook8Chapter4(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const uniqueSet = new Set<string>();
  let attempts = 0;

  while (questions.length < numQuestions && attempts < 4000) {
    attempts++;
    const A = Math.floor(Math.random() * 9000) + 1000; // 1000-9999
    const B = Math.floor(Math.random() * 9) + 1;       // 1-9
    const C = A * B;

    const qStr = `${A} × ${B}`;
    if (!uniqueSet.has(qStr)) {
      questions.push({ q: qStr, a: C.toString() });
      uniqueSet.add(qStr);
    }
  }
  return fillQuestions(questions, numQuestions!);
}

// Chapter 5: 2 Digit × 2 Digit
function randomBook8Chapter5(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const uniqueSet = new Set<string>();
  let attempts = 0;

  while (questions.length < numQuestions && attempts < 4000) {
    attempts++;
    const A = Math.floor(Math.random() * 90) + 10; // 10-99
    const B = Math.floor(Math.random() * 90) + 10; // 10-99
    const C = A * B;

    const qStr = `${A} × ${B}`;
    if (!uniqueSet.has(qStr)) {
      questions.push({ q: qStr, a: C.toString() });
      uniqueSet.add(qStr);
    }
  }
  return fillQuestions(questions, numQuestions!);
}

// Chapter 6: 3 Digit ÷ 1 Digit (evenly divisible)
function randomBook8Chapter6(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const uniqueSet = new Set<string>();
  let attempts = 0;

  while (questions.length < numQuestions && attempts < 4000) {
    attempts++;
    const B = Math.floor(Math.random() * 9) + 1; // 1-9
    // Generate C such that A = B * C is 3-digit (100-999)
    const minC = Math.ceil(100 / B);
    const maxC = Math.floor(999 / B);
    if (minC > maxC) continue;

    const C = Math.floor(Math.random() * (maxC - minC + 1)) + minC;
    const A = B * C;

    if (A < 100 || A > 999) continue;

    const qStr = `${A} ÷ ${B}`;
    if (!uniqueSet.has(qStr)) {
      questions.push({ q: qStr, a: C.toString() });
      uniqueSet.add(qStr);
    }
  }
  return fillQuestions(questions, numQuestions!);
}

// Chapter 7: 4 Digit ÷ 1 Digit (evenly divisible)
function randomBook8Chapter7(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const uniqueSet = new Set<string>();
  let attempts = 0;

  while (questions.length < numQuestions && attempts < 4000) {
    attempts++;
    const B = Math.floor(Math.random() * 9) + 1; // 1-9
    // Generate C such that A = B * C is 4-digit (1000-9999)
    const minC = Math.ceil(1000 / B);
    const maxC = Math.floor(9999 / B);
    if (minC > maxC) continue;

    const C = Math.floor(Math.random() * (maxC - minC + 1)) + minC;
    const A = B * C;

    if (A < 1000 || A > 9999) continue;

    const qStr = `${A} ÷ ${B}`;
    if (!uniqueSet.has(qStr)) {
      questions.push({ q: qStr, a: C.toString() });
      uniqueSet.add(qStr);
    }
  }
  return fillQuestions(questions, numQuestions!);
}

// Chapter 8: 3 Digit ÷ 2 Digit (evenly divisible)
function randomBook8Chapter8(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const uniqueSet = new Set<string>();
  let attempts = 0;

  while (questions.length < numQuestions && attempts < 4000) {
    attempts++;
    const B = Math.floor(Math.random() * 90) + 10; // 10-99
    // Generate C such that A = B * C is 3-digit (100-999)
    const minC = Math.ceil(100 / B);
    const maxC = Math.floor(999 / B);
    if (minC > maxC) continue;

    const C = Math.floor(Math.random() * (maxC - minC + 1)) + minC;
    const A = B * C;

    if (A < 100 || A > 999) continue;

    const qStr = `${A} ÷ ${B}`;
    if (!uniqueSet.has(qStr)) {
      questions.push({ q: qStr, a: C.toString() });
      uniqueSet.add(qStr);
    }
  }
  return fillQuestions(questions, numQuestions!);
}

// Chapter 9: 2 Digit ÷ 2 Digit (evenly divisible)
function randomBook8Chapter9(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const uniqueSet = new Set<string>();
  let attempts = 0;

  while (questions.length < numQuestions && attempts < 4000) {
    attempts++;
    const B = Math.floor(Math.random() * 90) + 10; // 10-99
    // Generate C such that A = B * C is 2-digit (10-99)
    const minC = Math.ceil(10 / B);
    const maxC = Math.floor(99 / B);
    if (minC > maxC || minC < 1) continue;

    const C = Math.floor(Math.random() * (maxC - minC + 1)) + minC;
    const A = B * C;

    if (A < 10 || A > 99) continue;

    const qStr = `${A} ÷ ${B}`;
    if (!uniqueSet.has(qStr)) {
      questions.push({ q: qStr, a: C.toString() });
      uniqueSet.add(qStr);
    }
  }
  return fillQuestions(questions, numQuestions!);
}

// Export all Book 8 generator functions
export const book8Generators: Record<number, GenFn> = {
  1: randomBook8Chapter1,
  2: randomBook8Chapter2,
  3: randomBook8Chapter3,
  4: randomBook8Chapter4,
  5: randomBook8Chapter5,
  6: randomBook8Chapter6,
  7: randomBook8Chapter7,
  8: randomBook8Chapter8,
  9: randomBook8Chapter9,
};
