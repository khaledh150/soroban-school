// book9.ts - Book 9 Generator Functions

import { Question, GenFn, fillQuestions } from "./book1.ts";

// Chapter 1: ± Decimals < 1 (A±B±C=H, 0.01 to 0.99, H >= 0)
function randomBook9Chapter1(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const uniqueSet = new Set<string>();
  let attempts = 0;

  function rDecimal() { return (Math.floor(Math.random() * 99) + 1) / 100; } // 0.01 to 0.99
  function rOp() { return Math.random() < 0.5 ? "+" : "-"; }

  while (questions.length < numQuestions && attempts < 4000) {
    attempts++;
    const A = rDecimal(), B = rDecimal(), C = rDecimal();
    const op1 = rOp(), op2 = rOp();

    let H = A;
    H = op1 === "+" ? H + B : H - B; if (H < 0) continue;
    H = op2 === "+" ? H + C : H - C; if (H < 0) continue;

    const qStr = `${A.toFixed(2)} ${op1} ${B.toFixed(2)} ${op2} ${C.toFixed(2)}`;
    if (!uniqueSet.has(qStr)) {
      questions.push({ q: qStr, a: H.toFixed(2) });
      uniqueSet.add(qStr);
    }
  }
  return fillQuestions(questions, numQuestions!);
}

// Chapter 2: ± Decimal > 1 (A±B±C=H, 1.01 to 9.99, H >= 0)
function randomBook9Chapter2(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const uniqueSet = new Set<string>();
  let attempts = 0;

  function rDecimal() { return (Math.floor(Math.random() * 899) + 101) / 100; } // 1.01 to 9.99
  function rOp() { return Math.random() < 0.5 ? "+" : "-"; }

  while (questions.length < numQuestions && attempts < 4000) {
    attempts++;
    const A = rDecimal(), B = rDecimal(), C = rDecimal();
    const op1 = rOp(), op2 = rOp();

    let H = A;
    H = op1 === "+" ? H + B : H - B; if (H < 0) continue;
    H = op2 === "+" ? H + C : H - C; if (H < 0) continue;

    const qStr = `${A.toFixed(2)} ${op1} ${B.toFixed(2)} ${op2} ${C.toFixed(2)}`;
    if (!uniqueSet.has(qStr)) {
      questions.push({ q: qStr, a: H.toFixed(2) });
      uniqueSet.add(qStr);
    }
  }
  return fillQuestions(questions, numQuestions!);
}

// Chapter 3: 3 Digit × 1 Digit
function randomBook9Chapter3(numQuestions = 10): Question[] {
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
function randomBook9Chapter4(numQuestions = 10): Question[] {
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

// Chapter 5: 5 Digit × 1 Digit
function randomBook9Chapter5(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const uniqueSet = new Set<string>();
  let attempts = 0;

  while (questions.length < numQuestions && attempts < 4000) {
    attempts++;
    const A = Math.floor(Math.random() * 90000) + 10000; // 10000-99999
    const B = Math.floor(Math.random() * 9) + 1;         // 1-9
    const C = A * B;

    const qStr = `${A} × ${B}`;
    if (!uniqueSet.has(qStr)) {
      questions.push({ q: qStr, a: C.toString() });
      uniqueSet.add(qStr);
    }
  }
  return fillQuestions(questions, numQuestions!);
}

// Chapter 6: 2 Digit × 2 Digit
function randomBook9Chapter6(numQuestions = 10): Question[] {
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

// Chapter 7: 3 Digit +- (A±B±C±D±E=H, all 3-digit, H >= 0)
function randomBook9Chapter7(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const uniqueSet = new Set<string>();
  let attempts = 0;

  function r3digit() { return Math.floor(Math.random() * 900) + 100; }
  function rOp() { return Math.random() < 0.5 ? "+" : "-"; }

  while (questions.length < numQuestions && attempts < 4000) {
    attempts++;
    const A = r3digit(), B = r3digit(), C = r3digit(), D = r3digit(), E = r3digit();
    const op1 = rOp(), op2 = rOp(), op3 = rOp(), op4 = rOp();

    let H = A;
    H = op1 === "+" ? H + B : H - B; if (H < 0) continue;
    H = op2 === "+" ? H + C : H - C; if (H < 0) continue;
    H = op3 === "+" ? H + D : H - D; if (H < 0) continue;
    H = op4 === "+" ? H + E : H - E; if (H < 0) continue;

    const qStr = `${A} ${op1} ${B} ${op2} ${C} ${op3} ${D} ${op4} ${E}`;
    if (!uniqueSet.has(qStr)) {
      questions.push({ q: qStr, a: H.toString() });
      uniqueSet.add(qStr);
    }
  }
  return fillQuestions(questions, numQuestions!);
}

// Chapter 8: 3 Digit ÷ 1 Digit (evenly divisible)
function randomBook9Chapter8(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const uniqueSet = new Set<string>();
  let attempts = 0;

  while (questions.length < numQuestions && attempts < 4000) {
    attempts++;
    const B = Math.floor(Math.random() * 9) + 1; // 1-9
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

// Chapter 9: 4 Digit ÷ 1 Digit (evenly divisible)
function randomBook9Chapter9(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const uniqueSet = new Set<string>();
  let attempts = 0;

  while (questions.length < numQuestions && attempts < 4000) {
    attempts++;
    const B = Math.floor(Math.random() * 9) + 1; // 1-9
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

// Chapter 10: 5 Digit ÷ 1 Digit (evenly divisible)
function randomBook9Chapter10(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const uniqueSet = new Set<string>();
  let attempts = 0;

  while (questions.length < numQuestions && attempts < 4000) {
    attempts++;
    const B = Math.floor(Math.random() * 9) + 1; // 1-9
    const minC = Math.ceil(10000 / B);
    const maxC = Math.floor(99999 / B);
    if (minC > maxC) continue;

    const C = Math.floor(Math.random() * (maxC - minC + 1)) + minC;
    const A = B * C;

    if (A < 10000 || A > 99999) continue;

    const qStr = `${A} ÷ ${B}`;
    if (!uniqueSet.has(qStr)) {
      questions.push({ q: qStr, a: C.toString() });
      uniqueSet.add(qStr);
    }
  }
  return fillQuestions(questions, numQuestions!);
}

// Chapter 11: 3 Digit ÷ 2 Digit (evenly divisible)
function randomBook9Chapter11(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const uniqueSet = new Set<string>();
  let attempts = 0;

  while (questions.length < numQuestions && attempts < 4000) {
    attempts++;
    const B = Math.floor(Math.random() * 90) + 10; // 10-99
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

// Chapter 12: 4 Digit ÷ 2 Digit (evenly divisible)
function randomBook9Chapter12(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const uniqueSet = new Set<string>();
  let attempts = 0;

  while (questions.length < numQuestions && attempts < 4000) {
    attempts++;
    const B = Math.floor(Math.random() * 90) + 10; // 10-99
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

// Export all Book 9 generator functions
export const book9Generators: Record<number, GenFn> = {
  1: randomBook9Chapter1,
  2: randomBook9Chapter2,
  3: randomBook9Chapter3,
  4: randomBook9Chapter4,
  5: randomBook9Chapter5,
  6: randomBook9Chapter6,
  7: randomBook9Chapter7,
  8: randomBook9Chapter8,
  9: randomBook9Chapter9,
  10: randomBook9Chapter10,
  11: randomBook9Chapter11,
  12: randomBook9Chapter12,
};
