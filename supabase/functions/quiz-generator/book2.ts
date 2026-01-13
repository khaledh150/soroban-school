// book2.ts - Book 2 Generator Functions

import { Question, GenFn, fillQuestions } from "./book1.ts";

function randomBook2Chapter1TenBuddyPlus9(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const uniqueQuestions = new Set<string>();
  let attempts = 0;
  while (questions.length < numQuestions && attempts < 4000) {
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
  return fillQuestions(questions, numQuestions!);
}

function randomBook2Chapter2TenBuddyPlus8(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const uniqueQuestions = new Set<string>();
  let attempts = 0;
  while (questions.length < numQuestions && attempts < 4000) {
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
  return fillQuestions(questions, numQuestions!);
}

function randomBook2Chapter3TenBuddyPlus7(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const uniqueSet = new Set<string>();
  let attempts = 0;
  while (questions.length < numQuestions && attempts < 4000) {
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
    const qStr = `${A} ${op1} ${B} ${op2} ${C}`;
    if (A >= 1 && A <= 9 && B >= 1 && B <= 9 && C >= 0 && C <= 9 && D >= 0 && D <= 50 && !uniqueSet.has(qStr)) {
      questions.push({ q: qStr, a: D.toString() });
      uniqueSet.add(qStr);
    }
  }
  return fillQuestions(questions, numQuestions!);
}

function randomBook2Chapter4TenBuddyPlus6(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const uniqueQuestions = new Set<string>();
  let attempts = 0;
  while (questions.length < numQuestions && attempts < 4000) {
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
  return fillQuestions(questions, numQuestions!);
}

function randomBook2Chapter5TenBuddyPlus5(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const uniqueQuestions = new Set<string>();
  let attempts = 0;
  while (questions.length < numQuestions && attempts < 4000) {
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
  return fillQuestions(questions, numQuestions!);
}

function randomBook2Chapter6TenBuddyPlus4(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const uniqueQuestions = new Set<string>();
  let attempts = 0;
  while (questions.length < numQuestions && attempts < 4000) {
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
  return fillQuestions(questions, numQuestions!);
}

function randomBook2Chapter7TenBuddyPlus3(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const uniqueQuestions = new Set<string>();
  let attempts = 0;
  while (questions.length < numQuestions && attempts < 4000) {
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
  return fillQuestions(questions, numQuestions!);
}

function randomBook2Chapter8TenBuddyPlus2(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const uniqueQuestions = new Set<string>();
  let attempts = 0;
  while (questions.length < numQuestions && attempts < 4000) {
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
  return fillQuestions(questions, numQuestions!);
}

function randomBook2Chapter9TenBuddyPlus1(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const uniqueKeys = new Set<string>();
  let attempts = 0;
  const randRange = (min: number, max: number): number => {
    const actualMin = Math.max(1, min); const actualMax = Math.min(max, 50); return Math.floor(Math.random() * (actualMax - actualMin + 1)) + actualMin;
  };
  while (questions.length < numQuestions && attempts < 4000) {
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
        questions.push({ q: questionString, a: result.toString() });
        uniqueKeys.add(questionString);
    }
  }
  return fillQuestions(questions, numQuestions!);
}

function randomBook2Chapter10TenBuddyPlus(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const uniqueKeys = new Set<string>();
  let attempts = 0;
  const randRange = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;
  
  while (questions.length < numQuestions && attempts < 4000) {
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
        questions.push({ q: questionString, a: result.toString() });
        uniqueKeys.add(questionString);
    }
  }
  return fillQuestions(questions, numQuestions!);
}

function randomBook2Chapter11TenBuddyMinus9(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const uniqueSet = new Set<string>();
  let attempts = 0;
  while (questions.length < numQuestions && attempts < 4000) {
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
    const qStr = `${A} ${op1} ${B} ${op2} ${C}`;
    if (D >= 0 && D <= 50 && !uniqueSet.has(qStr)) { 
        questions.push({ q: qStr, a: D.toString() });
        uniqueSet.add(qStr);
    }
  }
  return fillQuestions(questions, numQuestions!);
}

function randomBook2Chapter12TenBuddyMinus8(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const uniqueQuestions = new Set<string>();
  let attempts = 0;
  const randRange = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;
  while (questions.length < numQuestions && attempts < 4000) {
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
  return fillQuestions(questions, numQuestions!);
}

function randomBook2Chapter13TenBuddyMinus7(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const uniqueQuestions = new Set<string>();
  let attempts = 0;
  const randRange = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;
  while (questions.length < numQuestions && attempts < 4000) {
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
  return fillQuestions(questions, numQuestions!);
}

function randomBook2Chapter14TenBuddyMinus6(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const uniqueQuestions = new Set<string>();
  let attempts = 0;
  const randRange = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;
  while (questions.length < numQuestions && attempts < 4000) {
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
  return fillQuestions(questions, numQuestions!);
}

function randomBook2Chapter15TenBuddyMinus5(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const uniqueQuestions = new Set<string>();
  let attempts = 0;
  const randRange = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;
  while (questions.length < numQuestions && attempts < 4000) {
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
  return fillQuestions(questions, numQuestions!);
}

function randomBook2Chapter16TenBuddyMinus4(numQuestions = 10): Question[] {
  const questions: Question[] = [];
  const uniqueQuestions = new Set<string>();
  let attempts = 0;
  const randRange = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;
  while (questions.length < numQuestions && attempts < 4000) {
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
  return fillQuestions(questions, numQuestions!);
}

function randomBook2Chapter17TenBuddyMinus3(numQuestions = 10): Question[] {
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
  return fillQuestions(questions, numQuestions!);
}

function randomBook2Chapter18TenBuddyMinus2(numQuestions = 10): Question[] {
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
  return fillQuestions(questions, numQuestions!);
}

function randomBook2Chapter19TenBuddyMinus1(numQuestions = 10): Question[] {
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
  return fillQuestions(questions, numQuestions!);
}

function randomBook2Chapter20TenBuddyMinus(numQuestions = 10): Question[] {
  const questions: Question[] = [];
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
        questions.push({ q: questionString, a: result.toString() });
        uniqueKeys.add(questionString);
    }
  }
  return fillQuestions(questions, numQuestions!);
}

function randomBook2Chapter21MixTenBuddy(numQuestions = 10): Question[] {
  const questions: Question[] = [];
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
        questions.push({ q: questionString, a: result.toString() });
        uniqueKeys.add(questionString);
    }
  }
  return fillQuestions(questions, numQuestions!);
}

// ---------- generator selector ----------

// Export all Book 2 generator functions
export const book2Generators: Record<number, GenFn> = {
  1: randomBook2Chapter1TenBuddyPlus9,
  2: randomBook2Chapter2TenBuddyPlus8,
  3: randomBook2Chapter3TenBuddyPlus7,
  4: randomBook2Chapter4TenBuddyPlus6,
  5: randomBook2Chapter5TenBuddyPlus5,
  6: randomBook2Chapter6TenBuddyPlus4,
  7: randomBook2Chapter7TenBuddyPlus3,
  8: randomBook2Chapter8TenBuddyPlus2,
  9: randomBook2Chapter9TenBuddyPlus1,
  10: randomBook2Chapter10TenBuddyPlus,
  11: randomBook2Chapter11TenBuddyMinus9,
  12: randomBook2Chapter12TenBuddyMinus8,
  13: randomBook2Chapter13TenBuddyMinus7,
  14: randomBook2Chapter14TenBuddyMinus6,
  15: randomBook2Chapter15TenBuddyMinus5,
  16: randomBook2Chapter16TenBuddyMinus4,
  17: randomBook2Chapter17TenBuddyMinus3,
  18: randomBook2Chapter18TenBuddyMinus2,
  19: randomBook2Chapter19TenBuddyMinus1,
  20: randomBook2Chapter20TenBuddyMinus,
  21: randomBook2Chapter21MixTenBuddy,
};
