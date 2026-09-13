import { calculateMatchOutcomes, poisson, findLambdas } from './src/lib/math.ts';

const pmP1 = 3.99;
const pmX = 3.34;
const pmP2 = 1.909;
const pmMarginSum = (1 / pmP1) + (1 / pmX) + (1 / pmP2);
const trueP1 = (1 / pmP1) / pmMarginSum;
const trueX = (1 / pmX) / pmMarginSum;
const trueP2 = (1 / pmP2) / pmMarginSum;
const { xG1, xG2 } = findLambdas(trueP1, trueP2);

const testPoints01 = [
  { m: 70, p1: 12.70, x: 4.45, p2: 1.173 },
  { m: 75, p1: 14.24, x: 4.33, p2: 1.18 },
  { m: 80, p1: 16.40, x: 4.66, p2: 1.15 },
  { m: 85, p1: 19.54, x: 5.42, p2: 1.10 },
  { m: 89, p1: 20.51, x: 6.03, p2: 1.07 }
];

function getShare(minute: number, period: 1 | 2 = minute <= 45 ? 1 : 2): number {
  if (period === 1) {
    const safeMinute = Math.min(minute, 47.499);
    return 0.61 + 0.39 * ((47.5 - safeMinute) / 47.5);
  } else {
    const safeMinute = Math.min(minute, 93.999);
    const r = (94.0 - safeMinute) / 49.0;
    const cliff = 0.15 * (1.0 - Math.min(1.0, r / 0.3));
    return 0.61 * Math.pow(r, 0.85 + cliff);
  }
}

for (let point of testPoints01) {
    const decay = getShare(point.m, point.m <= 45 ? 1 : 2);
    const liveMarginSum = (1 / point.p1) + (1 / point.x) + (1 / point.p2);
    
    // Evaluate current formula
    const ratio_actual = Math.max(0.5, Math.min(3.0, xG2 / xG1)); // xG1 is losing, xG2 is winning
    let formula_losing = 1.40 - (0.26 * ratio_actual); // xG1 is losing
    let formula_winning = 1.0;
    if (ratio_actual > 1.0) { // xG2 > xG1
        formula_winning = 1.0 - (0.17 * ratio_actual);
    } else {
        formula_winning = 0.80 + (0.20 * ratio_actual);
    }
    
    if (point.m > 45) {
      const t2 = (point.m - 45) / 45.0; 
      formula_losing += (t2 * 0.50); 
      formula_winning += (t2 * 0.25); 
    }
    
    let rem_xG1 = xG1 * decay * formula_losing;
    let rem_xG2 = xG2 * decay * formula_winning;
    
    const full = calculateMatchOutcomes(rem_xG1, rem_xG2, 0, 1);
    const calcP1 = 1 / (full.p1 * liveMarginSum);
    const calcX = 1 / (full.x * liveMarginSum);
    const calcP2 = 1 / (full.p2 * liveMarginSum);
    const formErr = Math.abs(calcP1 - point.p1) / point.p1 + 
                    Math.abs(calcX - point.x) / point.x + 
                    Math.abs(calcP2 - point.p2) / point.p2;
    
    console.log(`Min ${point.m}: Formula M1(Lose)=${formula_losing.toFixed(2)}, M2(Win)=${formula_winning.toFixed(2)} -> P1=${calcP1.toFixed(2)}(${point.p1}) X=${calcX.toFixed(2)}(${point.x}) P2=${calcP2.toFixed(2)}(${point.p2}) (Err: ${(formErr*100).toFixed(1)}%)`);
}

