import { calculateMatchOutcomes, poisson, findLambdas } from './src/lib/math.ts';

const pmP1 = 3.99;
const pmX = 3.34;
const pmP2 = 1.909;
const marginSum = (1 / pmP1) + (1 / pmX) + (1 / pmP2);
const trueP1 = (1 / pmP1) / marginSum;
const trueX = (1 / pmX) / marginSum;
const trueP2 = (1 / pmP2) / marginSum;
const { xG1, xG2 } = findLambdas(trueP1, trueP2);

console.log(`True Probs: P1=${trueP1.toFixed(3)}, X=${trueX.toFixed(3)}, P2=${trueP2.toFixed(3)}`);
console.log(`Base xG: xG1(P1)=${xG1.toFixed(2)}, xG2(P2)=${xG2.toFixed(2)}`);

const testPoints00 = [
  { m: 15, p1: 3.00, x: 3.12, p2: 2.02 },
  { m: 30, p1: 3.42, x: 2.97, p2: 1.917 },
  { m: 45, p1: 3.96, x: 2.37, p2: 2.10 }, 
  { m: 60, p1: 4.08, x: 2.15, p2: 2.27 },
  { m: 67, p1: 4.84, x: 2.05, p2: 2.19 }
];

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

console.log("=== 0:0 Phase ===");
for (let point of testPoints00) {
    const decay = getShare(point.m, point.m <= 45 ? 1 : 2);
    
    let rem_xG1 = xG1 * decay;
    let rem_xG2 = xG2 * decay;
    
    // No multipliers for 0:0 yet, unless we add some
    
    const full = calculateMatchOutcomes(rem_xG1, rem_xG2, 0, 0);
    const calcP1 = 1 / (full.p1 * marginSum);
    const calcX = 1 / (full.x * marginSum);
    const calcP2 = 1 / (full.p2 * marginSum);
    const formErr = Math.abs(calcP1 - point.p1) / point.p1 + 
                    Math.abs(calcX - point.x) / point.x + 
                    Math.abs(calcP2 - point.p2) / point.p2;
    
    console.log(`Min ${point.m}: Formula -> P1=${calcP1.toFixed(2)}(${point.p1}) X=${calcX.toFixed(2)}(${point.x}) P2=${calcP2.toFixed(2)}(${point.p2}) (Err: ${(formErr*100).toFixed(1)}%)`);
}

console.log("\n=== 0:1 Phase ===");
for (let point of testPoints01) {
    const decay = getShare(point.m, point.m <= 45 ? 1 : 2);
    
    // Evaluate current formula
    const ratio_actual = Math.max(0.5, Math.min(3.0, xG1 / xG2)); // xG1 is losing, xG2 is winning
    let formula_losing = 1.40 - (0.26 * ratio_actual);
    let formula_winning = 1.0;
    if (ratio_actual > 1.0) { // losing team is fav
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
    const calcP1 = 1 / (full.p1 * marginSum);
    const calcX = 1 / (full.x * marginSum);
    const calcP2 = 1 / (full.p2 * marginSum);
    const formErr = Math.abs(calcP1 - point.p1) / point.p1 + 
                    Math.abs(calcX - point.x) / point.x + 
                    Math.abs(calcP2 - point.p2) / point.p2;
    
    console.log(`Min ${point.m}: Formula -> P1=${calcP1.toFixed(2)}(${point.p1}) X=${calcX.toFixed(2)}(${point.x}) P2=${calcP2.toFixed(2)}(${point.p2}) (Err: ${(formErr*100).toFixed(1)}%)`);
}

