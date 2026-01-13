// book3.ts - Book 3 Generator Functions

import { Question, GenFn } from "./book1.ts";

function randomBook3Chapter1FiveAndTenBuddyPlus9(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const seen = new Set<string>();
  let attempts = 0;

  while (questions.length < numQuestions && attempts < 2000) {
    attempts++;
    let A: number, B: number, C: number, op1: string, op2: string, expr: string;
    let ruleType = Math.floor(Math.random() * 4);

    if (ruleType === 0) {
      op1 = "+";
      op2 = "+";
      A = 5;
      B = 9;
      C = Math.floor(Math.random() * 9) + 1; // 1-9
    } else if (ruleType === 1) {
      op1 = "+";
      op2 = "+";
      A = Math.floor(Math.random() * 4) + 1; // 1-4
      B = 5 - A;
      C = 9;
    } else if (ruleType === 2) {
      op1 = "+";
      op2 = "+";
      A = Math.floor(Math.random() * 4) + 6; // 6-9
      B = 15 - A;
      C = 9;
    } else {
      op1 = "-";
      op2 = "+";
      A = Math.floor(Math.random() * 4) + 6; // 6-9
      B = A - 5;
      C = 9;
    }

    expr = `${A} ${op1} ${B} ${op2} ${C}`;
    let result = A;
    result = op1 === "+" ? result + B : result - B;
    result = op2 === "+" ? result + C : result - C;

    if ([A, B, C].every((n) => n >= 1 && n <= 9) && result >= 0 && result <= 100 && !seen.has(expr)) {
      questions.push({ q: expr, a: result.toString() });
      seen.add(expr);
    }
  }
  return questions;
}

function randomBook3Chapter2FiveAndTenBuddyPlus8(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const seen = new Set<string>();
  let attempts = 0;

  while (questions.length < numQuestions && attempts < 4000) {
    attempts++;
    let A: number, B: number, C: number, op1: string, op2: string, expr: string, result: number;

    let ruleType = Math.floor(Math.random() * 7);

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
    if ([A, B, C].every((n) => n >= 1 && n <= 9)) {
      expr = `${A} ${op1} ${B} ${op2} ${C}`;
      result = A;
      result = op1 === "+" ? result + B : result - B;
      result = op2 === "+" ? result + C : result - C;

      if (result >= 0 && result <= 100 && !seen.has(expr)) {
        questions.push({ q: expr, a: result.toString() });
        seen.add(expr);
      }
    }
  }

  return questions;
}

function randomBook3Chapter3FiveAndTenBuddyPlus7(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const seen = new Set<string>();
  let attempts = 0;

  while (questions.length < numQuestions && attempts < 6000) {
    attempts++;
    let A: number, B: number, C: number, op1: string, op2: string, expr: string, result: number;

    let ruleType = Math.floor(Math.random() * 10);

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
    if ([A, B, C].every((n) => n >= 1 && n <= 9)) {
      expr = `${A} ${op1} ${B} ${op2} ${C}`;
      result = op1 === "+" ? A + B : A - B;
      result = op2 === "+" ? result + C : result - C;

      if (result >= 0 && result <= 100 && !seen.has(expr)) {
        questions.push({ q: expr, a: result.toString() });
        seen.add(expr);
      }
    }
  }

  return questions;
}

function randomBook3Chapter4FiveAndTenBuddyPlus6(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const seen = new Set<string>();
  let attempts = 0;

  while (questions.length < numQuestions && attempts < 8000) {
    attempts++;
    let A: number, B: number, C: number, op1: string, op2: string, expr: string, result: number;

    let ruleType = Math.floor(Math.random() * 14);

    if (ruleType === 0) {
      op1 = "+";
      op2 = "+";
      A = Math.floor(Math.random() * 4) + 5; // 5-8
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
    } else {
      op1 = "-";
      op2 = "+";
      A = Math.floor(Math.random() * 2) + 8;
      B = A - 8;
      C = 6;
    }
    if ([A, B, C].every((n) => n >= 1 && n <= 9)) {
      expr = `${A} ${op1} ${B} ${op2} ${C}`;
      result = op1 === "+" ? A + B : A - B;
      result = op2 === "+" ? result + C : result - C;

      if (result >= 0 && result <= 100 && !seen.has(expr)) {
        questions.push({ q: expr, a: result.toString() });
        seen.add(expr);
      }
    }
  }
  return questions;
}

function randomBook3Chapter5FiveAndTenBuddyMinus9(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const seen = new Set<string>();
  let attempts = 0;

  while (questions.length < numQuestions && attempts < 2000) {
    attempts++;
    let A: number, B: number, C: number, op1: string, op2: string, expr: string, result: number;

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
      A = Math.floor(Math.random() * 4) + 6; // 6-9
      B = 14 - A;
      C = 9;
      if (B < 1 || B > 9) continue;
    }

    expr = `${A} ${op1} ${B} ${op2} ${C}`;
    result = op1 === "+" ? A + B : A - B;
    result = op2 === "+" ? result + C : result - C;

    if ([A, B, C].every((x) => x >= 1 && x <= 14) && result >= 0 && result <= 100 && !seen.has(expr)) {
      questions.push({ q: expr, a: result.toString() });
      seen.add(expr);
    }
  }

  return questions;
}

function randomBook3Chapter6FiveAndTenBuddyMinus8(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const seen = new Set<string>();
  let attempts = 0;

  while (questions.length < numQuestions && attempts < 2000) {
    attempts++;
    let A: number, B: number, C: number, op1: string, op2: string, expr: string, result: number;

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
      A = Math.floor(Math.random() * 4) + 6; // 6-9
      B = 14 - A;
      C = 8;
      if (B < 1 || B > 9) continue;
    } else {
      op1 = "+";
      op2 = "-";
      A = Math.floor(Math.random() * 4) + 6; // 6-9
      B = 13 - A;
      C = 8;
      if (B < 1 || B > 9) continue;
    }

    expr = `${A} ${op1} ${B} ${op2} ${C}`;
    result = op1 === "+" ? A + B : A - B;
    result = op2 === "+" ? result + C : result - C;

    if ([A, B, C].every((x) => x >= 1 && x <= 14) && result >= 0 && result <= 100 && !seen.has(expr)) {
      questions.push({ q: expr, a: result.toString() });
      seen.add(expr);
    }
  }

  return questions;
}

function randomBook3Chapter7FiveAndTenBuddyMinus7(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const seen = new Set<string>();
  let attempts = 0;

  while (questions.length < numQuestions && attempts < 2000) {
    attempts++;
    let A: number, B: number, C: number, op1: string, op2: string, expr: string, result: number;

    let ruleType = Math.floor(Math.random() * 6);

    if (ruleType === 0) {
      op1 = "-";
      op2 = "+";
      A = Math.floor(Math.random() * 3) + 12; // 12-14
      B = 7;
      C = Math.floor(Math.random() * 9) + 1;
    } else if (ruleType === 1) {
      op1 = "-";
      op2 = "-";
      A = Math.floor(Math.random() * 3) + 12; // 12-14
      B = 7;
      C = Math.floor(Math.random() * 5) + 1;
    } else if (ruleType === 2) {
      op1 = "+";
      op2 = "-";
      A = Math.floor(Math.random() * 4) + 6; // 6-9
      B = 14 - A;
      C = 7;
      if (B < 1 || B > 9) continue;
    } else if (ruleType === 3) {
      op1 = "+";
      op2 = "-";
      A = Math.floor(Math.random() * 4) + 6; // 6-9
      B = 13 - A;
      C = 7;
      if (B < 1 || B > 9) continue;
    } else {
      op1 = "+";
      op2 = "-";
      A = Math.floor(Math.random() * 4) + 6; // 6-9
      B = 12 - A;
      C = 7;
      if (B < 1 || B > 9) continue;
    }

    expr = `${A} ${op1} ${B} ${op2} ${C}`;
    result = op1 === "+" ? A + B : A - B;
    result = op2 === "+" ? result + C : result - C;

    if ([A, B, C].every((x) => x >= 1 && x <= 14) && result >= 0 && result <= 100 && !seen.has(expr)) {
      questions.push({ q: expr, a: result.toString() });
      seen.add(expr);
    }
  }

  return questions;
}

function randomBook3Chapter8FiveAndTenBuddyMinus6(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const seen = new Set<string>();
  let attempts = 0;

  while (questions.length < numQuestions && attempts < 3000) {
    attempts++;
    let A: number, B: number, C: number, op1: string, op2: string, expr: string, result: number;

    let ruleType = Math.floor(Math.random() * 6);

    if (ruleType === 0) {
      op1 = "-";
      op2 = "+";
      A = Math.floor(Math.random() * 4) + 11; // 11-14
      B = 6;
      C = Math.floor(Math.random() * 9) + 1; // 1-9
    } else if (ruleType === 1) {
      op1 = "-";
      op2 = "-";
      A = Math.floor(Math.random() * 4) + 11; // 11-14
      B = 6;
      C = Math.floor(Math.random() * 5) + 1; // 1-5
    } else if (ruleType === 2) {
      op1 = "+";
      op2 = "-";
      A = Math.floor(Math.random() * 4) + 6; // 6-9
      B = 14 - A;
      C = 6;
      if (B < 1 || B > 9) continue;
    } else if (ruleType === 3) {
      op1 = "+";
      op2 = "-";
      A = Math.floor(Math.random() * 4) + 6; // 6-9
      B = 13 - A;
      C = 6;
      if (B < 1 || B > 9) continue;
    } else if (ruleType === 4) {
      op1 = "+";
      op2 = "-";
      A = Math.floor(Math.random() * 4) + 6; // 6-9
      B = 12 - A;
      C = 6;
      if (B < 1 || B > 9) continue;
    } else {
      op1 = "+";
      op2 = "-";
      A = Math.floor(Math.random() * 4) + 6; // 6-9
      B = 11 - A;
      C = 6;
      if (B < 1 || B > 9) continue;
    }

    expr = `${A} ${op1} ${B} ${op2} ${C}`;
    result = op1 === "+" ? A + B : A - B;
    result = op2 === "+" ? result + C : result - C;

    if ([A, B, C].every((x) => x >= 1 && x <= 14) && result >= 0 && result <= 100 && !seen.has(expr)) {
      questions.push({ q: expr, a: result.toString() });
      seen.add(expr);
    }
  }

  return questions;
}

function randomBook3Chapter9Multiply2(numQuestions = 10, numNumbers = 4): Question[] {
  const questions: Question[] = [];

  for (let i = 0; i < numQuestions; i++) {
    const A = 2;
    const B = Math.floor(Math.random() * 9) + 1; // {1, 2, ..., 9}
    const D = A * B;

    let qText: string = "";
    let aText: string = "";

    if (Math.random() < 0.5) {
      qText = A.toString() + " × " + B.toString();
      aText = D.toString();
    } else {
      qText = A.toString() + " × _ = " + D.toString();
      aText = B.toString();
    }

    questions.push({ q: qText, a: aText });
  }

  return questions;
}

function randomBook3Chapter10Multiply3(numQuestions = 10, numNumbers = 4): Question[] {
  const questions: Question[] = [];

  for (let i = 0; i < numQuestions; i++) {
    const A = 3;
    const B = Math.floor(Math.random() * 9) + 1;
    const D = A * B;

    let qText: string = "";
    let aText: string = "";

    if (Math.random() < 0.5) {
      qText = A.toString() + " × " + B.toString();
      aText = D.toString();
    } else {
      qText = A.toString() + " × _ = " + D.toString();
      aText = B.toString();
    }

    questions.push({ q: qText, a: aText });
  }

  return questions;
}

function randomBook3Chapter11Multiply4(numQuestions = 10, numNumbers = 4): Question[] {
  const questions: Question[] = [];

  for (let i = 0; i < numQuestions; i++) {
    const A = 4;
    const B = Math.floor(Math.random() * 9) + 1;
    const D = A * B;

    let qText: string = "";
    let aText: string = "";

    if (Math.random() < 0.5) {
      qText = A.toString() + " × " + B.toString();
      aText = D.toString();
    } else {
      qText = A.toString() + " × _ = " + D.toString();
      aText = B.toString();
    }

    questions.push({ q: qText, a: aText });
  }

  return questions;
}

function randomBook3Chapter12Multiply5(numQuestions = 10, numNumbers = 4): Question[] {
  const questions: Question[] = [];

  for (let i = 0; i < numQuestions; i++) {
    const A = 5;
    const B = Math.floor(Math.random() * 9) + 1;
    const D = A * B;

    let qText: string = "";
    let aText: string = "";

    if (Math.random() < 0.5) {
      qText = A.toString() + " × " + B.toString();
      aText = D.toString();
    } else {
      qText = A.toString() + " × _ = " + D.toString();
      aText = B.toString();
    }

    questions.push({ q: qText, a: aText });
  }

  return questions;
}

function randomBook3Chapter13Multiply6(numQuestions = 10, numNumbers = 4): Question[] {
  const questions: Question[] = [];

  for (let i = 0; i < numQuestions; i++) {
    const A = 6;
    const B = Math.floor(Math.random() * 9) + 1;
    const D = A * B;

    let qText: string = "";
    let aText: string = "";

    if (Math.random() < 0.5) {
      qText = A.toString() + " × " + B.toString();
      aText = D.toString();
    } else {
      qText = A.toString() + " × _ = " + D.toString();
      aText = B.toString();
    }

    questions.push({ q: qText, a: aText });
  }

  return questions;
}

function randomBook3Chapter14Multiply7(numQuestions = 10, numNumbers = 4): Question[] {
  const questions: Question[] = [];

  for (let i = 0; i < numQuestions; i++) {
    const A = 7;
    const B = Math.floor(Math.random() * 9) + 1;
    const D = A * B;

    let qText: string = "";
    let aText: string = "";

    if (Math.random() < 0.5) {
      qText = A.toString() + " × " + B.toString();
      aText = D.toString();
    } else {
      qText = A.toString() + " × _ = " + D.toString();
      aText = B.toString();
    }

    questions.push({ q: qText, a: aText });
  }

  return questions;
}

function randomBook3Chapter15Multiply8(numQuestions = 10, numNumbers = 4): Question[] {
  const questions: Question[] = [];

  for (let i = 0; i < numQuestions; i++) {
    const A = 8;
    const B = Math.floor(Math.random() * 9) + 1;
    const D = A * B;

    let qText: string = "";
    let aText: string = "";

    if (Math.random() < 0.5) {
      qText = A.toString() + " × " + B.toString();
      aText = D.toString();
    } else {
      qText = A.toString() + " × _ = " + D.toString();
      aText = B.toString();
    }

    questions.push({ q: qText, a: aText });
  }
  return questions;
}

function randomBook3Chapter16Multiply9(numQuestions = 10, numNumbers = 4): Question[] {
  const questions: Question[] = [];

  for (let i = 0; i < numQuestions; i++) {
    const A = 9;
    const B = Math.floor(Math.random() * 9) + 1;
    const D = A * B;

    let qText: string = "";
    let aText: string = "";

    if (Math.random() < 0.5) {
      qText = A.toString() + " × " + B.toString();
      aText = D.toString();
    } else {
      qText = A.toString() + " × _ = " + D.toString();
      aText = B.toString();
    }

    questions.push({ q: qText, a: aText });
  }

  return questions;
}

function randomBook3Chapter17Multiply2To9(numQuestions = 10, numNumbers = 4): Question[] {
  const questions: Question[] = [];

  for (let i = 0; i < numQuestions; i++) {
    const A = Math.floor(Math.random() * 9) + 1;
    const B = Math.floor(Math.random() * 9) + 1;
    const D = A * B;

    let qText: string = "";
    let aText: string = "";

    if (Math.random() < 0.5) {
      qText = A.toString() + " × " + B.toString();
      aText = D.toString();
    } else {
      qText = A.toString() + " × _ = " + D.toString();
      aText = B.toString();
    }

    questions.push({ q: qText, a: aText });
  }

  return questions;
}

// Export all Book 3 generator functions
export const book3Generators: Record<number, GenFn> = {
  1: randomBook3Chapter1FiveAndTenBuddyPlus9,
  2: randomBook3Chapter2FiveAndTenBuddyPlus8,
  3: randomBook3Chapter3FiveAndTenBuddyPlus7,
  4: randomBook3Chapter4FiveAndTenBuddyPlus6,
  5: randomBook3Chapter5FiveAndTenBuddyMinus9,
  6: randomBook3Chapter6FiveAndTenBuddyMinus8,
  7: randomBook3Chapter7FiveAndTenBuddyMinus7,
  8: randomBook3Chapter8FiveAndTenBuddyMinus6,
  9: randomBook3Chapter9Multiply2,
  10: randomBook3Chapter10Multiply3,
  11: randomBook3Chapter11Multiply4,
  12: randomBook3Chapter12Multiply5,
  13: randomBook3Chapter13Multiply6,
  14: randomBook3Chapter14Multiply7,
  15: randomBook3Chapter15Multiply8,
  16: randomBook3Chapter16Multiply9,
  17: randomBook3Chapter17Multiply2To9,
};
