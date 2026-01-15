// book7.ts - Book 7 Generator Functions

import { Question, GenFn, fillQuestions } from "./book1.ts";

// Chapter 1: Multiply 3 Digit (A × B = C, A: 100-999, B: 1-9)
function randomBook7Chapter1(numQuestions = 10): Question[] {
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

// Chapter 2: Divide 2 Digit (A ÷ B = C, A: 10-99, B: 1-9, no remainder)
function randomBook7Chapter2(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const uniqueSet = new Set<string>();
  let attempts = 0;

  while (questions.length < numQuestions && attempts < 4000) {
    attempts++;
    const B = Math.floor(Math.random() * 9) + 1; // 1-9
    // Generate C such that A = B * C is 2-digit (10-99)
    const minC = Math.ceil(10 / B);
    const maxC = Math.floor(99 / B);
    if (minC > maxC) continue;

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

// Chapter 3: Divide 3 Digit (A ÷ B = C, A: 100-999, B: 1-9, no remainder)
function randomBook7Chapter3(numQuestions = 10): Question[] {
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

// Chapter 4: Multiply 4 Digit (A × B = C, A: 1000-9999, B: 1-9)
function randomBook7Chapter4(numQuestions = 10): Question[] {
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

// Chapter 5: 2 Digit +- (A ± B ± C ± D = H, A: 10-99, B/C/D: 1-9, never negative)
function randomBook7Chapter5(numQuestions = 10): Question[] {
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

    // Calculate running totals, ensure never negative
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

// Export all Book 7 generator functions
export const book7Generators: Record<number, GenFn> = {
  1: randomBook7Chapter1,
  2: randomBook7Chapter2,
  3: randomBook7Chapter3,
  4: randomBook7Chapter4,
  5: randomBook7Chapter5,
};
