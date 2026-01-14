// book4.ts - Book 4 Generator Functions (2-digit first number variants)

import { Question, GenFn, fillQuestions } from "./book1.ts";

// Chapter 1: Exact replica of randomChapter5MixUpperLower2Digits from book1.ts
function randomBook4Chapter1(numQuestions = 10): Question[] {
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

// Chapter 2: From Book1 Ch.6 (FivebuddyPlus4) with 2-digit first number
function randomBook4Chapter2(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const uniqueSet = new Set<string>();
  let attempts = 0;

  while (questions.length < numQuestions && attempts < 4000) {
    attempts++;
    let A = 0, B = 0, C = 0, op1 = "+", op2 = "+";
    const k = Math.floor(Math.random() * 9) + 1;
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

    const kA = (k * 10) + A;
    let result = op1 === "+" ? kA + B : kA - B;
    result = op2 === "+" ? result + C : result - C;
    const isCValid = (C >= 1 && C <= 9) || (C === 0);
    const qStr = `${kA} ${op1} ${B} ${op2} ${C}`;

    if (A >= 1 && A <= 9 && B >= 4 && B <= 5 && isCValid && result >= 0 && !uniqueSet.has(qStr)) {
      questions.push({ q: qStr, a: result.toString() });
      uniqueSet.add(qStr);
    }
  }
  return fillQuestions(questions, numQuestions!);
}

// Chapter 3: From Book1 Ch.7 (FivebuddyPlus3) with 2-digit first number
function randomBook4Chapter3(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const uniqueSet = new Set<string>();
  let attempts = 0;

  while (questions.length < numQuestions && attempts < 4000) {
    attempts++;
    let A = 0, B = 0, C = 0, op1: "+" | "-" = "+", op2: "+" | "-" = "+";
    let isValidQuestion = true;
    const k = Math.floor(Math.random() * 9) + 1;
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

    const kA = (k * 10) + A;
    let result = op1 === "+" ? kA + B : kA - B;
    result = op2 === "+" ? result + C : result - C;
    const isCValid = (C >= 1 && C <= 9) || (C === 0 && op1 === "+" && op2 === "-" && A + B === 5);
    const qStr = `${kA} ${op1} ${B} ${op2} ${C}`;

    if (isValidQuestion && A >= 1 && A <= 9 && B >= 3 && B <= 5 && B !== 4 && isCValid && result >= 0 && !uniqueSet.has(qStr)) {
      questions.push({ q: qStr, a: result.toString() });
      uniqueSet.add(qStr);
    }
  }
  return fillQuestions(questions, numQuestions!);
}

// Chapter 4: From Book1 Ch.8 (FivebuddyPlus2) with 2-digit first number
function randomBook4Chapter4(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const uniqueSet = new Set<string>();
  let attempts = 0;

  while (questions.length < numQuestions && attempts < 4000) {
    attempts++;
    let A = 0, B = 0, C = 0, op1: "+" | "-" = "+", op2: "+" | "-" = "+";
    let isValidQuestion = true;
    const k = Math.floor(Math.random() * 9) + 1;
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

    const kA = (k * 10) + A;
    let result = op1 === "+" ? kA + B : kA - B;
    result = op2 === "+" ? result + C : result - C;
    const isCValid = (C >= 1 && C <= 9) || (C === 0 && op1 === "+" && op2 === "-" && A + B === 5);
    const qStr = `${kA} ${op1} ${B} ${op2} ${C}`;

    if (isValidQuestion && A >= 1 && A <= 9 && (B === 2 || B === 5) && isCValid && result >= 0 && !uniqueSet.has(qStr)) {
      questions.push({ q: qStr, a: result.toString() });
      uniqueSet.add(qStr);
    }
  }
  return fillQuestions(questions, numQuestions!);
}

// Chapter 5: From Book1 Ch.9 (FivebuddyPlus1) with 2-digit first number
function randomBook4Chapter5(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const uniqueSet = new Set<string>();
  let attempts = 0;

  while (questions.length < numQuestions && attempts < 4000) {
    attempts++;
    let A = 0, B = 0, C = 0, op1 = "+", op2 = "+", D = 0;
    const k = Math.floor(Math.random() * 9) + 1;
    const caseType = Math.random() < 0.5 ? 1 : 2;
    if (caseType === 1) {
      op1 = "+"; A = 4; B = 1; const step1 = A + B; op2 = Math.random() < 0.5 ? "+" : "-";
      if (op2 === "+") { C = Math.floor(Math.random() * 4) + 1; D = step1 + C; } else { C = 5; D = step1 - C; }
    } else {
      op1 = "-"; A = 9; B = 5; const step1 = A - B; op2 = "+"; C = 1; D = step1 + C;
    }

    const kA = (k * 10) + A;
    const actualResult = op1 === "+" ? (kA + B) : (kA - B);
    const finalResult = op2 === "+" ? (actualResult + C) : (actualResult - C);
    const qStr = `${kA} ${op1} ${B} ${op2} ${C}`;

    if (A >= 1 && A <= 9 && C >= 1 && C <= 9 && finalResult >= 0 && !uniqueSet.has(qStr)) {
      questions.push({ q: qStr, a: finalResult.toString() });
      uniqueSet.add(qStr);
    }
  }
  return fillQuestions(questions, numQuestions!);
}

// Chapter 6: From Book1 Ch.11 (FiveBuddyMinus4) with 2-digit first number
function randomBook4Chapter6(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const uniqueSet = new Set<string>();
  let attempts = 0;

  while (questions.length < numQuestions && attempts < 4000) {
    attempts++;
    let A = 0, B = 0, C = 4, op1 = "+", op2 = "-", D = 0;
    const k = Math.floor(Math.random() * 9) + 1;
    const caseType = Math.random() < 0.5 ? 1 : 2;
    if (caseType === 1) {
      op1 = "+"; A = Math.floor(Math.random() * 4) + 1;
      const o1 = 5; const o2 = 5 - A;
      B = Math.random() < 0.5 ? o1 : o2;
      C = 4;
    } else {
      op1 = "-";
      const aOpt = [6, 7, 8, 9];
      A = aOpt[Math.floor(Math.random() * aOpt.length)];
      B = A - 5;
      C = 4;
    }

    const kA = (k * 10) + A;
    D = op1 === "+" ? (kA + B - C) : (kA - B - C);
    const qStr = `${kA} ${op1} ${B} ${op2} ${C}`;

    if (A >= 1 && A <= 9 && B >= 1 && B <= 9 && C === 4 && D >= 0 && !uniqueSet.has(qStr)) {
      questions.push({ q: qStr, a: D.toString() });
      uniqueSet.add(qStr);
    }
  }
  return fillQuestions(questions, numQuestions!);
}

// Chapter 7: From Book1 Ch.12 (FivebuddyMinus3) with 2-digit first number
function randomBook4Chapter7(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const uniqueSet = new Set<string>();
  let attempts = 0;

  while (questions.length < numQuestions && attempts < 4000) {
    attempts++;
    let A = 0, B = 0, C = 3, op1 = "+", op2 = "-", D = 0;
    const k = Math.floor(Math.random() * 9) + 1;
    const caseType = Math.random() < 0.5 ? 1 : 2;
    if (caseType === 1) {
      op1 = "+"; A = Math.floor(Math.random() * 4) + 1;
      const o1 = 5; const o2 = 5 - A;
      B = Math.random() < 0.5 ? o1 : o2;
      C = 3;
    } else {
      op1 = "-";
      const aOpt = [6, 7, 8, 9];
      A = aOpt[Math.floor(Math.random() * aOpt.length)];
      B = A - 5;
      C = 3;
    }

    const kA = (k * 10) + A;
    D = op1 === "+" ? (kA + B - C) : (kA - B - C);
    const qStr = `${kA} ${op1} ${B} ${op2} ${C}`;

    if (A >= 1 && A <= 9 && B >= 1 && B <= 9 && C === 3 && D >= 0 && !uniqueSet.has(qStr)) {
      questions.push({ q: qStr, a: D.toString() });
      uniqueSet.add(qStr);
    }
  }
  return fillQuestions(questions, numQuestions!);
}

// Chapter 8: From Book1 Ch.13 (FivebuddyMinus2) with 2-digit first number
function randomBook4Chapter8(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const uniqueSet = new Set<string>();
  let attempts = 0;

  while (questions.length < numQuestions && attempts < 4000) {
    attempts++;
    let A = 0, B = 0, C = 2, op1 = "+", op2 = "-", D = 0;
    const k = Math.floor(Math.random() * 9) + 1;
    const caseType = Math.random() < 0.5 ? 1 : 2;
    if (caseType === 1) {
      op1 = "+"; A = Math.floor(Math.random() * 4) + 1;
      B = 5 - A;
      C = 2;
    } else {
      op1 = "-";
      const aOpt = [6, 7, 8, 9];
      A = aOpt[Math.floor(Math.random() * aOpt.length)];
      B = A - 5;
      C = 2;
    }

    const kA = (k * 10) + A;
    D = op1 === "+" ? (kA + B - C) : (kA - B - C);
    const qStr = `${kA} ${op1} ${B} ${op2} ${C}`;

    if (A >= 1 && A <= 9 && B >= 1 && B <= 9 && C === 2 && D >= 0 && !uniqueSet.has(qStr)) {
      questions.push({ q: qStr, a: D.toString() });
      uniqueSet.add(qStr);
    }
  }
  return fillQuestions(questions, numQuestions!);
}

// Chapter 9: From Book1 Ch.14 (FivebuddyMinus1) with 2-digit first number
function randomBook4Chapter9(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const uniqueSet = new Set<string>();
  let attempts = 0;

  while (questions.length < numQuestions && attempts < 4000) {
    attempts++;
    let A = 0, B = 0, C = 1, op1 = "+", op2 = "-", D = 0;
    const k = Math.floor(Math.random() * 9) + 1;
    const caseType = Math.random() < 0.5 ? 1 : 2;
    if (caseType === 1) {
      op1 = "+"; A = Math.floor(Math.random() * 4) + 1;
      B = 5 - A;
      C = 1;
    } else {
      op1 = "-";
      const aOpt = [6, 7, 8, 9];
      A = aOpt[Math.floor(Math.random() * aOpt.length)];
      B = A - 5;
      C = 1;
    }

    const kA = (k * 10) + A;
    D = op1 === "+" ? (kA + B - C) : (kA - B - C);
    const qStr = `${kA} ${op1} ${B} ${op2} ${C}`;

    if (A >= 1 && A <= 9 && B >= 1 && B <= 9 && C === 1 && D >= 0 && !uniqueSet.has(qStr)) {
      questions.push({ q: qStr, a: D.toString() });
      uniqueSet.add(qStr);
    }
  }
  return fillQuestions(questions, numQuestions!);
}

// Chapter 10: From Book2 Ch.1 (TenBuddyPlus9) with 2-digit first number
function randomBook4Chapter10(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const uniqueQuestions = new Set<string>();
  let attempts = 0;
  while (questions.length < numQuestions && attempts < 4000) {
    attempts++;
    let A = 0, B = 0, C = 0;
    let op1: "+" | "-" = "+", op2: "+" | "-" = "+";
    let isValidQuestion = true;
    const k = Math.floor(Math.random() * 9) + 1;
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

    const kA = (k * 10) + A;
    let result = op1 === "+" ? kA + B : kA - B;
    result = op2 === "+" ? result + C : result - C;
    const questionString = `${kA} ${op1} ${B} ${op2} ${C}`;
    const isCValid = (C >= 1 && C <= 9) || (C === 0 && A === 6 && B === 9);
    if (isValidQuestion && A >= 1 && A <= 9 && B >= 1 && B <= 9 && isCValid && result >= 0 && !uniqueQuestions.has(questionString)) {
      questions.push({ q: questionString, a: result.toString() });
      uniqueQuestions.add(questionString);
    }
  }
  return fillQuestions(questions, numQuestions!);
}

// Chapter 11: From Book2 Ch.2 (TenBuddyPlus8) with 2-digit first number
function randomBook4Chapter11(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const uniqueQuestions = new Set<string>();
  let attempts = 0;
  while (questions.length < numQuestions && attempts < 4000) {
    attempts++;
    let A = 0, B = 0, C = 0;
    let op1: "+" | "-" = "+", op2: "+" | "-" = "+";
    let isValidQuestion = true;
    const k = Math.floor(Math.random() * 9) + 1;
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

    const kA = (k * 10) + A;
    let result = op1 === "+" ? kA + B : kA - B;
    result = op2 === "+" ? result + C : result - C;
    const questionString = `${kA} ${op1} ${B} ${op2} ${C}`;
    const isCValid = (C >= 1 && C <= 9) || (C === 0 && B === 8 && (A === 7 || A === 8));
    if (isValidQuestion && A >= 1 && A <= 9 && B >= 1 && B <= 9 && isCValid && result >= 0 && !uniqueQuestions.has(questionString)) {
      questions.push({ q: questionString, a: result.toString() });
      uniqueQuestions.add(questionString);
    }
  }
  return fillQuestions(questions, numQuestions!);
}

// Chapter 12: From Book2 Ch.3 (TenBuddyPlus7) with 2-digit first number
function randomBook4Chapter12(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const uniqueSet = new Set<string>();
  let attempts = 0;
  while (questions.length < numQuestions && attempts < 4000) {
    attempts++;
    let A = 0, B = 0, C = 0, op1 = "+", op2 = "+", D = 0;
    const k = Math.floor(Math.random() * 9) + 1;
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

    const kA = (k * 10) + A;
    const actualResult = op1 === "+" ? (kA + B) : (kA - B);
    const finalResult = op2 === "+" ? (actualResult + C) : (actualResult - C);
    const qStr = `${kA} ${op1} ${B} ${op2} ${C}`;
    if (A >= 1 && A <= 9 && B >= 1 && B <= 9 && C >= 0 && C <= 9 && finalResult >= 0 && !uniqueSet.has(qStr)) {
      questions.push({ q: qStr, a: finalResult.toString() });
      uniqueSet.add(qStr);
    }
  }
  return fillQuestions(questions, numQuestions!);
}

// Chapter 13: From Book2 Ch.4 (TenBuddyPlus6) with 2-digit first number
function randomBook4Chapter13(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const uniqueQuestions = new Set<string>();
  let attempts = 0;
  while (questions.length < numQuestions && attempts < 4000) {
    attempts++;
    let A = 0, B = 0, C = 0, op1: "+" | "-" = "+", op2: "+" | "-" = "+";
    const k = Math.floor(Math.random() * 9) + 1;
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

    const kA = (k * 10) + A;
    let result = op1 === "+" ? kA + B : kA - B;
    result = op2 === "+" ? result + C : result - C;
    const questionString = `${kA} ${op1} ${B} ${op2} ${C}`;
    if (A >= 1 && A <= 9 && B >= 1 && B <= 9 && C >= 1 && C <= 9 && result >= 0 && !uniqueQuestions.has(questionString)) {
       questions.push({ q: questionString, a: result.toString() });
       uniqueQuestions.add(questionString);
    }
  }
  return fillQuestions(questions, numQuestions!);
}

// Chapter 14: From Book2 Ch.5 (TenBuddyPlus5) with 2-digit first number
function randomBook4Chapter14(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const uniqueQuestions = new Set<string>();
  let attempts = 0;
  while (questions.length < numQuestions && attempts < 4000) {
    attempts++;
    let A = 0, B = 0, C = 0, op1: "+" | "-" = "+", op2: "+" | "-" = "+";
    let isValidQuestion = true;
    const k = Math.floor(Math.random() * 9) + 1;
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

    const kA = (k * 10) + A;
    let result = op1 === "+" ? kA + B : kA - B;
    result = op2 === "+" ? result + C : result - C;
    const questionString = `${kA} ${op1} ${B} ${op2} ${C}`;
    if (isValidQuestion && A >= 1 && A <= 9 && B >= 1 && B <= 9 && C >= 1 && C <= 9 && result >= 0 && !uniqueQuestions.has(questionString)) {
      questions.push({ q: questionString, a: result.toString() });
      uniqueQuestions.add(questionString);
    }
  }
  return fillQuestions(questions, numQuestions!);
}

// Chapter 15: From Book2 Ch.6 (TenBuddyPlus4) with 2-digit first number
function randomBook4Chapter15(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const uniqueQuestions = new Set<string>();
  let attempts = 0;
  while (questions.length < numQuestions && attempts < 4000) {
    attempts++;
    let A = 0, B = 0, C = 0, op1: "+" | "-" = "+", op2: "+" | "-" = "+";
    let isValidQuestion = true;
    const k = Math.floor(Math.random() * 9) + 1;
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

    const kA = (k * 10) + A;
    let result = op1 === "+" ? kA + B : kA - B;
    result = op2 === "+" ? result + C : result - C;
    const questionString = `${kA} ${op1} ${B} ${op2} ${C}`;
    if (isValidQuestion && A >= 1 && A <= 9 && B >= 1 && B <= 9 && C >= 1 && C <= 9 && result >= 0 && !uniqueQuestions.has(questionString)) {
      questions.push({ q: questionString, a: result.toString() });
      uniqueQuestions.add(questionString);
    }
  }
  return fillQuestions(questions, numQuestions!);
}

// Chapter 16: From Book2 Ch.7 (TenBuddyPlus3) with 2-digit first number
function randomBook4Chapter16(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const uniqueQuestions = new Set<string>();
  let attempts = 0;
  while (questions.length < numQuestions && attempts < 4000) {
    attempts++;
    let A = 0, B = 0, C = 0, op1: "+" | "-" = "+", op2: "+" | "-" = "+";
    const k = Math.floor(Math.random() * 9) + 1;
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

    const kA = (k * 10) + A;
    let result = op1 === "+" ? kA + B : kA - B;
    result = op2 === "+" ? result + C : result - C;
    const questionString = `${kA} ${op1} ${B} ${op2} ${C}`;
    if (A >= 1 && A <= 9 && B >= 1 && B <= 9 && C >= 1 && C <= 9 && result >= 0 && !uniqueQuestions.has(questionString)) {
        questions.push({ q: questionString, a: result.toString() });
        uniqueQuestions.add(questionString);
    }
  }
  return fillQuestions(questions, numQuestions!);
}

// Chapter 17: From Book2 Ch.8 (TenBuddyPlus2) with 2-digit first number
function randomBook4Chapter17(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const uniqueQuestions = new Set<string>();
  let attempts = 0;
  while (questions.length < numQuestions && attempts < 4000) {
    attempts++;
    let A = 0, B = 0, C = 0, op1: "+" | "-" = "+", op2: "+" | "-" = "+";
    const k = Math.floor(Math.random() * 9) + 1;
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

    const kA = (k * 10) + A;
    let result = op1 === "+" ? kA + B : kA - B;
    result = op2 === "+" ? result + C : result - C;
    const questionString = `${kA} ${op1} ${B} ${op2} ${C}`;
    if (A >= 1 && A <= 9 && B >= 1 && B <= 9 && C >= 1 && C <= 9 && result >= 0 && !uniqueQuestions.has(questionString)) {
        questions.push({ q: questionString, a: result.toString() });
        uniqueQuestions.add(questionString);
    }
  }
  return fillQuestions(questions, numQuestions!);
}

// Chapter 18: From Book2 Ch.9 (TenBuddyPlus1) with 2-digit first number
function randomBook4Chapter18(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const uniqueKeys = new Set<string>();
  let attempts = 0;
  const randRange = (min: number, max: number): number => {
    const actualMin = Math.max(1, min); const actualMax = Math.min(max, 50); return Math.floor(Math.random() * (actualMax - actualMin + 1)) + actualMin;
  };
  while (questions.length < numQuestions && attempts < 4000) {
    attempts++;
    let A = 0, B = 0, C = 0, op1: "+" | "-" = "+", op2: "+" | "-" = "+";
    const k = Math.floor(Math.random() * 9) + 1;
    const scenario = randRange(0, 2);
    if (scenario === 0) {
      A = randRange(1, 4); op1 = "+"; op2 = "+";
      const minB = 9 - A; B = randRange(minB, 9); C = 1;
    } else if (scenario === 1) {
      A = 5; op1 = "+"; op2 = "+"; B = 9 - A; C = 1;
    } else {
      A = randRange(6, 9); op1 = "+"; op2 = "+";
      const B1 = 9 - A; const B2 = 19 - A; const validB: number[] = [];
      if (B1 >= 1 && B1 <= 9) validB.push(B1); if (B2 >= 1 && B2 <= 9) validB.push(B2);
      if (validB.length === 0) continue; B = validB[Math.floor(Math.random() * validB.length)]; C = 1;
    }

    const kA = (k * 10) + A;
    const result = kA + B + C;
    const questionString = `${kA} + ${B} + ${C}`;
    if (A >= 1 && A <= 9 && B >= 1 && B <= 9 && C >= 1 && C <= 9 && result >= 0 && !uniqueKeys.has(questionString)) {
        questions.push({ q: questionString, a: result.toString() });
        uniqueKeys.add(questionString);
    }
  }
  return fillQuestions(questions, numQuestions!);
}

// Chapter 19: From Book2 Ch.11 (TenBuddyMinus9) with 2-digit first number
function randomBook4Chapter19(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const uniqueSet = new Set<string>();
  let attempts = 0;
  while (questions.length < numQuestions && attempts < 4000) {
    attempts++;
    const k = Math.floor(Math.random() * 9) + 1;
    const scenario = Math.floor(Math.random() * 3);
    let A = 0, B = 0, C = 0, op1 = "+", op2 = "+";
    if (scenario === 0) {
        op1 = "+"; op2 = "-"; A = Math.floor(Math.random() * 4) + 1;
        const minB = 10 - A; const validBs: number[] = []; for (let bVal = minB; bVal <= 9; bVal++) validBs.push(bVal);
        if (validBs.length === 0) continue; B = validBs[Math.floor(Math.random() * validBs.length)]; C = 9;
    } else if (scenario === 1) {
        op1 = "-"; op2 = "+"; const aOptions = [10, 11, 12, 13, 15, 16, 17, 18]; A = aOptions[Math.floor(Math.random() * aOptions.length)]; B = 9;
        const intermediate = A - B; const invalidCs = new Set<number>();
        if (intermediate === 6) { invalidCs.add(6); invalidCs.add(7); invalidCs.add(8); }
        else if (intermediate === 7) { invalidCs.add(6); invalidCs.add(7); }
        else if (intermediate === 8) { invalidCs.add(6); }
        const validCs: number[] = []; for (let cVal = 1; cVal <= 9; cVal++) { if (!invalidCs.has(cVal)) validCs.push(cVal); }
        if (validCs.length === 0) continue; C = validCs[Math.floor(Math.random() * validCs.length)];
    } else {
        op1 = "+"; op2 = "-"; A = 9; B = Math.floor(Math.random() * 9) + 1; C = 9;
    }

    // For scenarios 0 and 2, A is single digit, apply k
    // For scenario 1, A is already 2-digit, but we still prefix with k for consistency
    let kA: number;
    if (scenario === 1) {
      // A is already 10-18, we add k*10 to make it 3-digit effect, but let's just use A as units
      kA = (k * 10) + (A % 10);
      // Recalculate with the original logic but using kA
      const step1 = kA - B;
      const D = step1 + C;
      const qStr = `${kA} ${op1} ${B} ${op2} ${C}`;
      if (D >= 0 && !uniqueSet.has(qStr)) {
        questions.push({ q: qStr, a: D.toString() });
        uniqueSet.add(qStr);
      }
    } else {
      kA = (k * 10) + A;
      const step1 = op1 === "+" ? kA + B : kA - B;
      const D = op2 === "+" ? step1 + C : step1 - C;
      const qStr = `${kA} ${op1} ${B} ${op2} ${C}`;
      if (D >= 0 && !uniqueSet.has(qStr)) {
        questions.push({ q: qStr, a: D.toString() });
        uniqueSet.add(qStr);
      }
    }
  }
  return fillQuestions(questions, numQuestions!);
}

// Chapter 20: From Book2 Ch.12 (TenBuddyMinus8) with 2-digit first number
function randomBook4Chapter20(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const uniqueQuestions = new Set<string>();
  let attempts = 0;
  const randRange = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;
  while (questions.length < numQuestions && attempts < 4000) {
    attempts++;
    let A = 0, B = 0, C = 0, op1: "+" | "-" = "+", op2: "+" | "-" = "-";
    const k = Math.floor(Math.random() * 9) + 1;
    const scenario = randRange(0, 2);
    if (scenario === 0) {
      op1 = "+"; op2 = "-"; A = randRange(1, 4);
      const minB = 10 - A; const excl1 = 4 - A; const excl2 = 14 - A; const excl3 = 3 - A; const excl4 = 13 - A;
      const validB: number[] = [];
      for (let x = minB; x <= 9; x++) { if (x < 1) continue; if (x !== excl1 && x !== excl2 && x !== excl3 && x !== excl4) { validB.push(x); } }
      if (validB.length === 0) continue; B = validB[Math.floor(Math.random() * validB.length)]; C = 8;
    } else if (scenario === 1) {
      op1 = "-"; op2 = "+"; A = randRange(1, 9); B = 8;
      const validC: number[] = []; for (let c = 1; c <= 9; c++) { validC.push(c); }
      if (validC.length === 0) continue; C = validC[Math.floor(Math.random() * validC.length)];
    } else {
      op1 = "+"; op2 = "-"; A = 9; const validB = [1, 2, 3, 6, 7, 8]; B = validB[Math.floor(Math.random() * validB.length)]; C = 8;
    }

    const kA = (k * 10) + A;
    let result = op1 === "+" ? kA + B : kA - B;
    result = op2 === "+" ? result + C : result - C;
    const questionString = `${kA} ${op1} ${B} ${op2} ${C}`;
    if (A >= 1 && A <= 9 && B >= 1 && B <= 9 && C >= 1 && C <= 9 && result >= 0 && !uniqueQuestions.has(questionString)) {
        questions.push({ q: questionString, a: result.toString() });
        uniqueQuestions.add(questionString);
    }
  }
  return fillQuestions(questions, numQuestions!);
}

// Chapter 21: From Book2 Ch.13 (TenBuddyMinus7) with 2-digit first number
function randomBook4Chapter21(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const uniqueQuestions = new Set<string>();
  let attempts = 0;
  const randRange = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;
  while (questions.length < numQuestions && attempts < 4000) {
    attempts++;
    let A = 0, B = 0, C = 0, op1: "+" | "-" = "+", op2: "+" | "-" = "-";
    const k = Math.floor(Math.random() * 9) + 1;
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
      op1 = "-"; op2 = "+"; A = randRange(1, 9); B = 7;
      const validC: number[] = []; for (let c = 1; c <= 9; c++) { validC.push(c); }
      if (validC.length === 0) continue; C = validC[Math.floor(Math.random() * validC.length)];
    }

    const kA = (k * 10) + A;
    let result = op1 === "+" ? kA + B : kA - B;
    result = op2 === "+" ? result + C : result - C;
    const questionString = `${kA} ${op1} ${B} ${op2} ${C}`;
    if (A >= 1 && A <= 9 && B >= 1 && B <= 9 && C >= 1 && C <= 9 && result >= 0 && !uniqueQuestions.has(questionString)) {
        questions.push({ q: questionString, a: result.toString() });
        uniqueQuestions.add(questionString);
    }
  }
  return fillQuestions(questions, numQuestions!);
}

// Chapter 22: From Book2 Ch.14 (TenBuddyMinus6) with 2-digit first number
function randomBook4Chapter22(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const uniqueQuestions = new Set<string>();
  let attempts = 0;
  const randRange = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;
  while (questions.length < numQuestions && attempts < 4000) {
    attempts++;
    let A = 0, B = 0, C = 0, op1: "+" | "-" = "+", op2: "+" | "-" = "-";
    const k = Math.floor(Math.random() * 9) + 1;
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
      op1 = "-"; op2 = "+"; A = randRange(1, 9); B = 6;
      C = randRange(1, 9);
    }

    const kA = (k * 10) + A;
    let result = op1 === "+" ? kA + B : kA - B;
    result = op2 === "+" ? result + C : result - C;
    const questionString = `${kA} ${op1} ${B} ${op2} ${C}`;
    if (A >= 1 && A <= 9 && B >= 1 && B <= 9 && C >= 1 && C <= 9 && result >= 0 && !uniqueQuestions.has(questionString)) {
        questions.push({ q: questionString, a: result.toString() });
        uniqueQuestions.add(questionString);
    }
  }
  return fillQuestions(questions, numQuestions!);
}

// Chapter 23: From Book2 Ch.15 (TenBuddyMinus5) with 2-digit first number
function randomBook4Chapter23(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const uniqueQuestions = new Set<string>();
  let attempts = 0;
  const randRange = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;
  while (questions.length < numQuestions && attempts < 4000) {
    attempts++;
    let A = 0, B = 0, C = 0, op1: "+" | "-" = "+", op2: "+" | "-" = "-";
    const k = Math.floor(Math.random() * 9) + 1;
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
      op1 = "-"; op2 = "+"; A = randRange(1, 9); B = 5;
      const validC: number[] = []; for (let c = 1; c <= 9; c++) { validC.push(c); }
      if (validC.length === 0) continue; C = validC[Math.floor(Math.random() * validC.length)];
    }

    const kA = (k * 10) + A;
    let result = op1 === "+" ? kA + B : kA - B;
    result = op2 === "+" ? result + C : result - C;
    const questionString = `${kA} ${op1} ${B} ${op2} ${C}`;
    if (A >= 1 && A <= 9 && B >= 1 && B <= 9 && C >= 1 && C <= 9 && result >= 0 && !uniqueQuestions.has(questionString)) {
        questions.push({ q: questionString, a: result.toString() });
        uniqueQuestions.add(questionString);
    }
  }
  return fillQuestions(questions, numQuestions!);
}

// Chapter 24: From Book2 Ch.16 (TenBuddyMinus4) with 2-digit first number
function randomBook4Chapter24(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const uniqueQuestions = new Set<string>();
  let attempts = 0;
  const randRange = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;
  while (questions.length < numQuestions && attempts < 4000) {
    attempts++;
    let A = 0, B = 0, C = 0, op1: "+" | "-" = "+", op2: "+" | "-" = "-";
    const k = Math.floor(Math.random() * 9) + 1;
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
      op1 = "-"; op2 = "+"; A = randRange(1, 9); B = 4;
      const validC: number[] = []; for (let c = 1; c <= 9; c++) { validC.push(c); }
      if (validC.length === 0) continue; C = validC[Math.floor(Math.random() * validC.length)];
    }

    const kA = (k * 10) + A;
    let result = op1 === "+" ? kA + B : kA - B;
    result = op2 === "+" ? result + C : result - C;
    const questionString = `${kA} ${op1} ${B} ${op2} ${C}`;
    if (A >= 1 && A <= 9 && B >= 1 && B <= 9 && C >= 1 && C <= 9 && result >= 0 && !uniqueQuestions.has(questionString)) {
        questions.push({ q: questionString, a: result.toString() });
        uniqueQuestions.add(questionString);
    }
  }
  return fillQuestions(questions, numQuestions!);
}

// Chapter 25: From Book2 Ch.17 (TenBuddyMinus3) with 2-digit first number
function randomBook4Chapter25(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const uniqueQuestions = new Set<string>();
  let attempts = 0;
  const randRange = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;
  const getValidB = (minB: number, exclusions: number[]): number[] => {
    const validB: number[] = []; for (let x = minB; x <= 9; x++) { if (x >= 1 && !exclusions.includes(x)) { validB.push(x); } } return validB;
  };
  while (questions.length < numQuestions && attempts < 4000) {
    attempts++;
    let A = 0, B = 0, C = 0, op1: "+" | "-" = "+", op2: "+" | "-" = "-";
    const k = Math.floor(Math.random() * 9) + 1;
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
      op1 = "-"; op2 = "+"; A = randRange(1, 9); B = 3;
      const validC: number[] = []; for (let c = 1; c <= 9; c++) { validC.push(c); }
      if (validC.length === 0) continue; C = validC[Math.floor(Math.random() * validC.length)];
    }

    const kA = (k * 10) + A;
    let result = op1 === "+" ? kA + B : kA - B;
    result = op2 === "+" ? result + C : result - C;
    const questionString = `${kA} ${op1} ${B} ${op2} ${C}`;
    if (A >= 1 && A <= 9 && B >= 1 && B <= 9 && C >= 1 && C <= 9 && result >= 0 && !uniqueQuestions.has(questionString)) {
        questions.push({ q: questionString, a: result.toString() });
        uniqueQuestions.add(questionString);
    }
  }
  return fillQuestions(questions, numQuestions!);
}

// Chapter 26: From Book2 Ch.18 (TenBuddyMinus2) with 2-digit first number
function randomBook4Chapter26(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const uniqueQuestions = new Set<string>();
  let attempts = 0;
  const randRange = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;
  const getValidB = (minB: number, exclusions: number[]): number[] => {
    const validB: number[] = []; for (let x = minB; x <= 9; x++) { if (x >= 1 && !exclusions.includes(x)) { validB.push(x); } } return validB;
  };
  while (questions.length < numQuestions && attempts < 4000) {
    attempts++;
    let A = 0, B = 0, C = 0, op1: "+" | "-" = "+", op2: "+" | "-" = "-";
    const k = Math.floor(Math.random() * 9) + 1;
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
      op1 = "-"; op2 = "+"; A = randRange(1, 9); B = 2;
      const validC: number[] = []; for (let c = 1; c <= 9; c++) { validC.push(c); }
      if (validC.length === 0) continue; C = validC[Math.floor(Math.random() * validC.length)];
    }

    const kA = (k * 10) + A;
    let result = op1 === "+" ? kA + B : kA - B;
    result = op2 === "+" ? result + C : result - C;
    const questionString = `${kA} ${op1} ${B} ${op2} ${C}`;
    if (A >= 1 && A <= 9 && B >= 1 && B <= 9 && C >= 1 && C <= 9 && result >= 0 && !uniqueQuestions.has(questionString)) {
        questions.push({ q: questionString, a: result.toString() });
        uniqueQuestions.add(questionString);
    }
  }
  return fillQuestions(questions, numQuestions!);
}

// Chapter 27: From Book2 Ch.19 (TenBuddyMinus1) with 2-digit first number
function randomBook4Chapter27(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const uniqueQuestions = new Set<string>();
  let attempts = 0;
  const randRange = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;
  const getValidB = (minB: number, exclusions: number[]): number[] => {
    const validB: number[] = []; for (let x = minB; x <= 9; x++) { if (x >= 1 && !exclusions.includes(x)) { validB.push(x); } } return validB;
  };
  while (questions.length < numQuestions && attempts < 4000) {
    attempts++;
    let A = 0, B = 0, C = 0, op1: "+" | "-" = "+", op2: "+" | "-" = "-";
    const k = Math.floor(Math.random() * 9) + 1;
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
      op1 = "-"; op2 = "+"; A = randRange(1, 9); B = 1;
      const validC: number[] = []; for (let c = 1; c <= 9; c++) { validC.push(c); }
      if (validC.length === 0) continue; C = validC[Math.floor(Math.random() * validC.length)];
    }

    const kA = (k * 10) + A;
    let result = op1 === "+" ? kA + B : kA - B;
    result = op2 === "+" ? result + C : result - C;
    const questionString = `${kA} ${op1} ${B} ${op2} ${C}`;
    if (A >= 1 && A <= 9 && B >= 1 && B <= 9 && C >= 1 && C <= 9 && result >= 0 && !uniqueQuestions.has(questionString)) {
        questions.push({ q: questionString, a: result.toString() });
        uniqueQuestions.add(questionString);
    }
  }
  return fillQuestions(questions, numQuestions!);
}

// Chapter 28: Five & Ten Buddy +9 with 2-digit first number (from Book3 Ch.1)
function randomBook4Chapter28(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const seen = new Set<string>();
  let attempts = 0;

  while (questions.length < numQuestions && attempts < 4000) {
    attempts++;
    const k = Math.floor(Math.random() * 9) + 1;
    let A: number, B: number, C: number, op1: string, op2: string;
    const ruleType = Math.floor(Math.random() * 4);

    if (ruleType === 0) {
      op1 = "+"; op2 = "+";
      A = 5; B = 9;
      C = Math.floor(Math.random() * 9) + 1;
    } else if (ruleType === 1) {
      op1 = "+"; op2 = "+";
      A = Math.floor(Math.random() * 4) + 1;
      B = 5 - A; C = 9;
    } else if (ruleType === 2) {
      op1 = "+"; op2 = "+";
      A = Math.floor(Math.random() * 4) + 6;
      B = 15 - A; C = 9;
    } else {
      op1 = "-"; op2 = "+";
      A = Math.floor(Math.random() * 4) + 6;
      B = A - 5; C = 9;
    }

    if (![A, B, C].every((n) => n >= 1 && n <= 9)) continue;

    const kA = (k * 10) + A;
    let result = op1 === "+" ? kA + B : kA - B;
    result = op2 === "+" ? result + C : result - C;
    const expr = `${kA} ${op1} ${B} ${op2} ${C}`;

    if (result >= 0 && result <= 200 && !seen.has(expr)) {
      questions.push({ q: expr, a: result.toString() });
      seen.add(expr);
    }
  }
  return fillQuestions(questions, numQuestions!);
}

// Chapter 29: Five & Ten Buddy +8 with 2-digit first number (from Book3 Ch.2)
function randomBook4Chapter29(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const seen = new Set<string>();
  let attempts = 0;

  while (questions.length < numQuestions && attempts < 4000) {
    attempts++;
    const k = Math.floor(Math.random() * 9) + 1;
    let A: number, B: number, C: number, op1: string, op2: string;
    const ruleType = Math.floor(Math.random() * 7);

    if (ruleType === 0) {
      op1 = "+"; op2 = "+";
      A = Math.random() < 0.5 ? 5 : 6;
      B = 8; C = Math.floor(Math.random() * 9) + 1;
    } else if (ruleType === 1) {
      op1 = "+"; op2 = "+";
      A = Math.floor(Math.random() * 4) + 1;
      B = 5 - A; C = 8;
    } else if (ruleType === 2) {
      op1 = "+"; op2 = "+";
      A = Math.floor(Math.random() * 4) + 1;
      B = 6 - A; C = 8;
    } else if (ruleType === 3) {
      op1 = "+"; op2 = "+";
      A = Math.floor(Math.random() * 4) + 6;
      B = 15 - A; C = 8;
    } else if (ruleType === 4) {
      op1 = "+"; op2 = "+";
      A = Math.floor(Math.random() * 4) + 6;
      B = 16 - A; C = 8;
    } else if (ruleType === 5) {
      op1 = "-"; op2 = "+";
      A = Math.floor(Math.random() * 4) + 6;
      B = A - 5; C = 8;
    } else {
      op1 = "-"; op2 = "+";
      A = Math.floor(Math.random() * 4) + 6;
      B = A - 6; C = 8;
    }

    if (![A, B, C].every((n) => n >= 1 && n <= 9)) continue;

    const kA = (k * 10) + A;
    let result = op1 === "+" ? kA + B : kA - B;
    result = op2 === "+" ? result + C : result - C;
    const expr = `${kA} ${op1} ${B} ${op2} ${C}`;

    if (result >= 0 && result <= 200 && !seen.has(expr)) {
      questions.push({ q: expr, a: result.toString() });
      seen.add(expr);
    }
  }
  return fillQuestions(questions, numQuestions!);
}

// Chapter 30: Five & Ten Buddy +7 with 2-digit first number (from Book3 Ch.3)
function randomBook4Chapter30(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const seen = new Set<string>();
  let attempts = 0;

  while (questions.length < numQuestions && attempts < 6000) {
    attempts++;
    const k = Math.floor(Math.random() * 9) + 1;
    let A: number, B: number, C: number, op1: string, op2: string;
    const ruleType = Math.floor(Math.random() * 10);

    if (ruleType === 0) {
      op1 = "+"; op2 = "+";
      A = [5, 6, 7][Math.floor(Math.random() * 3)];
      B = 7; C = Math.floor(Math.random() * 9) + 1;
    } else if (ruleType === 1) {
      op1 = "+"; op2 = "+";
      A = Math.floor(Math.random() * 4) + 1;
      B = 5 - A; C = 7;
    } else if (ruleType === 2) {
      op1 = "+"; op2 = "+";
      A = Math.floor(Math.random() * 4) + 1;
      B = 6 - A; C = 7;
    } else if (ruleType === 3) {
      op1 = "+"; op2 = "+";
      A = Math.floor(Math.random() * 4) + 1;
      B = 7 - A; C = 7;
    } else if (ruleType === 4) {
      op1 = "+"; op2 = "+";
      A = Math.floor(Math.random() * 4) + 6;
      B = 15 - A; C = 7;
    } else if (ruleType === 5) {
      op1 = "+"; op2 = "+";
      A = Math.floor(Math.random() * 4) + 6;
      B = 16 - A; C = 7;
    } else if (ruleType === 6) {
      op1 = "+"; op2 = "+";
      A = Math.floor(Math.random() * 4) + 6;
      B = 17 - A; C = 7;
    } else if (ruleType === 7) {
      op1 = "-"; op2 = "+";
      A = Math.floor(Math.random() * 4) + 6;
      B = A - 5; C = 7;
    } else if (ruleType === 8) {
      op1 = "-"; op2 = "+";
      A = Math.floor(Math.random() * 4) + 6;
      B = A - 6; C = 7;
    } else {
      op1 = "-"; op2 = "+";
      A = Math.floor(Math.random() * 3) + 7;
      B = A - 7; C = 7;
    }

    if (![A, B, C].every((n) => n >= 1 && n <= 9)) continue;

    const kA = (k * 10) + A;
    let result = op1 === "+" ? kA + B : kA - B;
    result = op2 === "+" ? result + C : result - C;
    const expr = `${kA} ${op1} ${B} ${op2} ${C}`;

    if (result >= 0 && result <= 200 && !seen.has(expr)) {
      questions.push({ q: expr, a: result.toString() });
      seen.add(expr);
    }
  }
  return fillQuestions(questions, numQuestions!);
}

// Chapter 31: Five & Ten Buddy +6 with 2-digit first number (from Book3 Ch.4)
function randomBook4Chapter31(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const seen = new Set<string>();
  let attempts = 0;

  while (questions.length < numQuestions && attempts < 8000) {
    attempts++;
    const k = Math.floor(Math.random() * 9) + 1;
    let A: number, B: number, C: number, op1: string, op2: string;
    const ruleType = Math.floor(Math.random() * 14);

    if (ruleType === 0) {
      op1 = "+"; op2 = "+";
      A = Math.floor(Math.random() * 4) + 5; // 5-8
      B = 6; C = Math.floor(Math.random() * 9) + 1;
    } else if (ruleType === 1) {
      op1 = "+"; op2 = "+";
      A = Math.floor(Math.random() * 4) + 1;
      B = 5 - A; C = 6;
    } else if (ruleType === 2) {
      op1 = "+"; op2 = "+";
      A = Math.floor(Math.random() * 4) + 1;
      B = 6 - A; C = 6;
    } else if (ruleType === 3) {
      op1 = "+"; op2 = "+";
      A = Math.floor(Math.random() * 4) + 1;
      B = 7 - A; C = 6;
    } else if (ruleType === 4) {
      op1 = "+"; op2 = "+";
      A = Math.floor(Math.random() * 4) + 1;
      B = 8 - A; C = 6;
    } else if (ruleType === 5) {
      op1 = "+"; op2 = "+";
      A = Math.floor(Math.random() * 4) + 6;
      B = 15 - A; C = 6;
    } else if (ruleType === 6) {
      op1 = "+"; op2 = "+";
      A = Math.floor(Math.random() * 4) + 6;
      B = 16 - A; C = 6;
    } else if (ruleType === 7) {
      op1 = "+"; op2 = "+";
      A = Math.floor(Math.random() * 4) + 6;
      B = 17 - A; C = 6;
    } else if (ruleType === 8) {
      op1 = "+"; op2 = "+";
      A = Math.floor(Math.random() * 4) + 6;
      B = 18 - A; C = 6;
    } else if (ruleType === 9) {
      op1 = "-"; op2 = "+";
      A = Math.floor(Math.random() * 4) + 6;
      B = A - 5; C = 6;
    } else if (ruleType === 10) {
      op1 = "-"; op2 = "+";
      A = Math.floor(Math.random() * 4) + 6;
      B = A - 6; C = 6;
    } else if (ruleType === 11) {
      op1 = "-"; op2 = "+";
      A = Math.floor(Math.random() * 3) + 7;
      B = A - 7; C = 6;
    } else {
      op1 = "-"; op2 = "+";
      A = Math.floor(Math.random() * 2) + 8;
      B = A - 8; C = 6;
    }

    if (![A, B, C].every((n) => n >= 1 && n <= 9)) continue;

    const kA = (k * 10) + A;
    let result = op1 === "+" ? kA + B : kA - B;
    result = op2 === "+" ? result + C : result - C;
    const expr = `${kA} ${op1} ${B} ${op2} ${C}`;

    if (result >= 0 && result <= 200 && !seen.has(expr)) {
      questions.push({ q: expr, a: result.toString() });
      seen.add(expr);
    }
  }
  return fillQuestions(questions, numQuestions!);
}

// Chapter 32: Five & Ten Buddy -9 with 2-digit first number (from Book3 Ch.5)
function randomBook4Chapter32(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const seen = new Set<string>();
  let attempts = 0;

  while (questions.length < numQuestions && attempts < 4000) {
    attempts++;
    const k = Math.floor(Math.random() * 8) + 1; // 1-8 to keep result reasonable
    let A: number, B: number, C: number, op1: string, op2: string;
    const ruleType = Math.floor(Math.random() * 3);

    if (ruleType === 0) {
      // kA - 9 + C where A makes kA-9 valid
      op1 = "-"; op2 = "+";
      A = 4; // k4 - 9 needs borrow from tens
      B = 9; C = Math.floor(Math.random() * 9) + 1;
    } else if (ruleType === 1) {
      // kA - 9 - C
      op1 = "-"; op2 = "-";
      A = 4;
      B = 9; C = Math.floor(Math.random() * 5) + 1;
    } else {
      // kA + B - 9 where A+B triggers carry then -9
      op1 = "+"; op2 = "-";
      A = Math.floor(Math.random() * 4) + 6; // 6-9
      B = 14 - A; // Makes A+B = 14
      C = 9;
      if (B < 1 || B > 9) continue;
    }

    const kA = (k * 10) + A;
    let result = op1 === "+" ? kA + B : kA - B;
    result = op2 === "+" ? result + C : result - C;
    const expr = `${kA} ${op1} ${B} ${op2} ${C}`;

    if (result >= 0 && result <= 200 && !seen.has(expr)) {
      questions.push({ q: expr, a: result.toString() });
      seen.add(expr);
    }
  }
  return fillQuestions(questions, numQuestions!);
}

// Chapter 33: Five & Ten Buddy -8 with 2-digit first number (from Book3 Ch.6)
function randomBook4Chapter33(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const seen = new Set<string>();
  let attempts = 0;

  while (questions.length < numQuestions && attempts < 4000) {
    attempts++;
    const k = Math.floor(Math.random() * 8) + 1;
    let A: number, B: number, C: number, op1: string, op2: string;
    const ruleType = Math.floor(Math.random() * 4);

    if (ruleType === 0) {
      op1 = "-"; op2 = "+";
      A = Math.random() < 0.5 ? 3 : 4; // k3 or k4 - 8
      B = 8; C = Math.floor(Math.random() * 9) + 1;
    } else if (ruleType === 1) {
      op1 = "-"; op2 = "-";
      A = Math.random() < 0.5 ? 3 : 4;
      B = 8; C = Math.floor(Math.random() * 5) + 1;
    } else if (ruleType === 2) {
      op1 = "+"; op2 = "-";
      A = Math.floor(Math.random() * 4) + 6; // 6-9
      B = 14 - A; C = 8;
      if (B < 1 || B > 9) continue;
    } else {
      op1 = "+"; op2 = "-";
      A = Math.floor(Math.random() * 4) + 6; // 6-9
      B = 13 - A; C = 8;
      if (B < 1 || B > 9) continue;
    }

    const kA = (k * 10) + A;
    let result = op1 === "+" ? kA + B : kA - B;
    result = op2 === "+" ? result + C : result - C;
    const expr = `${kA} ${op1} ${B} ${op2} ${C}`;

    if (result >= 0 && result <= 200 && !seen.has(expr)) {
      questions.push({ q: expr, a: result.toString() });
      seen.add(expr);
    }
  }
  return fillQuestions(questions, numQuestions!);
}

// Chapter 34: Five & Ten Buddy -7 with 2-digit first number (from Book3 Ch.7)
function randomBook4Chapter34(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const seen = new Set<string>();
  let attempts = 0;

  while (questions.length < numQuestions && attempts < 4000) {
    attempts++;
    const k = Math.floor(Math.random() * 8) + 1;
    let A: number, B: number, C: number, op1: string, op2: string;
    const ruleType = Math.floor(Math.random() * 5);

    if (ruleType === 0) {
      op1 = "-"; op2 = "+";
      A = Math.floor(Math.random() * 3) + 2; // k2, k3, k4 - 7
      B = 7; C = Math.floor(Math.random() * 9) + 1;
    } else if (ruleType === 1) {
      op1 = "-"; op2 = "-";
      A = Math.floor(Math.random() * 3) + 2;
      B = 7; C = Math.floor(Math.random() * 5) + 1;
    } else if (ruleType === 2) {
      op1 = "+"; op2 = "-";
      A = Math.floor(Math.random() * 4) + 6; // 6-9
      B = 14 - A; C = 7;
      if (B < 1 || B > 9) continue;
    } else if (ruleType === 3) {
      op1 = "+"; op2 = "-";
      A = Math.floor(Math.random() * 4) + 6;
      B = 13 - A; C = 7;
      if (B < 1 || B > 9) continue;
    } else {
      op1 = "+"; op2 = "-";
      A = Math.floor(Math.random() * 4) + 6;
      B = 12 - A; C = 7;
      if (B < 1 || B > 9) continue;
    }

    const kA = (k * 10) + A;
    let result = op1 === "+" ? kA + B : kA - B;
    result = op2 === "+" ? result + C : result - C;
    const expr = `${kA} ${op1} ${B} ${op2} ${C}`;

    if (result >= 0 && result <= 200 && !seen.has(expr)) {
      questions.push({ q: expr, a: result.toString() });
      seen.add(expr);
    }
  }
  return fillQuestions(questions, numQuestions!);
}

// Chapter 35: Five & Ten Buddy -6 with 2-digit first number (from Book3 Ch.8)
function randomBook4Chapter35(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const seen = new Set<string>();
  let attempts = 0;

  while (questions.length < numQuestions && attempts < 4000) {
    attempts++;
    const k = Math.floor(Math.random() * 8) + 1;
    let A: number, B: number, C: number, op1: string, op2: string;
    const ruleType = Math.floor(Math.random() * 6);

    if (ruleType === 0) {
      op1 = "-"; op2 = "+";
      A = Math.floor(Math.random() * 4) + 1; // k1, k2, k3, k4 - 6
      B = 6; C = Math.floor(Math.random() * 9) + 1;
    } else if (ruleType === 1) {
      op1 = "-"; op2 = "-";
      A = Math.floor(Math.random() * 4) + 1;
      B = 6; C = Math.floor(Math.random() * 5) + 1;
    } else if (ruleType === 2) {
      op1 = "+"; op2 = "-";
      A = Math.floor(Math.random() * 4) + 6; // 6-9
      B = 14 - A; C = 6;
      if (B < 1 || B > 9) continue;
    } else if (ruleType === 3) {
      op1 = "+"; op2 = "-";
      A = Math.floor(Math.random() * 4) + 6;
      B = 13 - A; C = 6;
      if (B < 1 || B > 9) continue;
    } else if (ruleType === 4) {
      op1 = "+"; op2 = "-";
      A = Math.floor(Math.random() * 4) + 6;
      B = 12 - A; C = 6;
      if (B < 1 || B > 9) continue;
    } else {
      op1 = "+"; op2 = "-";
      A = Math.floor(Math.random() * 4) + 6;
      B = 11 - A; C = 6;
      if (B < 1 || B > 9) continue;
    }

    const kA = (k * 10) + A;
    let result = op1 === "+" ? kA + B : kA - B;
    result = op2 === "+" ? result + C : result - C;
    const expr = `${kA} ${op1} ${B} ${op2} ${C}`;

    if (result >= 0 && result <= 200 && !seen.has(expr)) {
      questions.push({ q: expr, a: result.toString() });
      seen.add(expr);
    }
  }
  return fillQuestions(questions, numQuestions!);
}

// Export all Book 4 generator functions
export const book4Generators: Record<number, GenFn> = {
  1: randomBook4Chapter1,
  2: randomBook4Chapter2,
  3: randomBook4Chapter3,
  4: randomBook4Chapter4,
  5: randomBook4Chapter5,
  6: randomBook4Chapter6,
  7: randomBook4Chapter7,
  8: randomBook4Chapter8,
  9: randomBook4Chapter9,
  10: randomBook4Chapter10,
  11: randomBook4Chapter11,
  12: randomBook4Chapter12,
  13: randomBook4Chapter13,
  14: randomBook4Chapter14,
  15: randomBook4Chapter15,
  16: randomBook4Chapter16,
  17: randomBook4Chapter17,
  18: randomBook4Chapter18,
  19: randomBook4Chapter19,
  20: randomBook4Chapter20,
  21: randomBook4Chapter21,
  22: randomBook4Chapter22,
  23: randomBook4Chapter23,
  24: randomBook4Chapter24,
  25: randomBook4Chapter25,
  26: randomBook4Chapter26,
  27: randomBook4Chapter27,
  28: randomBook4Chapter28,
  29: randomBook4Chapter29,
  30: randomBook4Chapter30,
  31: randomBook4Chapter31,
  32: randomBook4Chapter32,
  33: randomBook4Chapter33,
  34: randomBook4Chapter34,
  35: randomBook4Chapter35,
};
