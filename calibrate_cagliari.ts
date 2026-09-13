import { calculateMatchOutcomes, poisson, findLambdas } from './src/lib/math.ts';

const pmP1 = 2.24;
const pmX = 2.96;
const pmP2 = 3.72;
const marginSum = (1 / pmP1) + (1 / pmX) + (1 / pmP2);
const trueP1 = (1 / pmP1) / marginSum;
const trueX = (1 / pmX) / marginSum;
const trueP2 = (1 / pmP2) / marginSum;
const { xG1, xG2 } = findLambdas(trueP1, trueP2);

console.log(`True Probs: P1=${trueP1.toFixed(3)}, X=${trueX.toFixed(3)}, P2=${trueP2.toFixed(3)}`);
console.log(`Base xG: xG1(P1)=${xG1.toFixed(2)}, xG2(P2)=${xG2.toFixed(2)}`);

const testPoints00 = [
  { m: 15, p1: 2.16, x: 2.88, p2: 4.15 },
  { m: 27, p1: 2.45, x: 2.61, p2: 3.83 }
];

const testPoints10 = [
  { m: 30, p1: 1.39, x: 4.18, p2: 10.26 },
  { m: 45, p1: 1.35, x: 4.29, p2: 13.34 }, 
  { m: 60, p1: 1.27, x: 4.73, p2: 19.58 },
  { m: 74, p1: 1.21, x: 5.51, p2: 30.58 }
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

console.log("\n=== 0:0 Phase ===");
for (let point of testPoints00) {
    const decay = getShare(point.m, point.m <= 45 ? 1 : 2);
    const liveMarginSum = (1 / point.p1) + (1 / point.x) + (1 / point.p2);
    
    let bestErr = Infinity;
    let bestXg1 = 0;
    let bestXg2 = 0;
    
    for (let rx1 = 0.01; rx1 <= 3.0; rx1 += 0.02) {
        for (let rx2 = 0.01; rx2 <= 3.0; rx2 += 0.02) {
            const full = calculateMatchOutcomes(rx1, rx2, 0, 0); 
            const calcP1 = 1 / (full.p1 * liveMarginSum);
            const calcX = 1 / (full.x * liveMarginSum);
            const calcP2 = 1 / (full.p2 * liveMarginSum);
            
            const err = Math.abs(calcP1 - point.p1) / point.p1 + 
                        Math.abs(calcX - point.x) / point.x + 
                        Math.abs(calcP2 - point.p2) / point.p2;
                        
            if (err < bestErr) {
                bestErr = err;
                bestXg1 = rx1;
                bestXg2 = rx2;
            }
        }
    }
    
    const m1 = bestXg1 / (xG1 * decay);
    const m2 = bestXg2 / (xG2 * decay);
    
    console.log(`Min ${point.m}: Optimal M1=${m1.toFixed(2)}, M2=${m2.toFixed(2)} (Err: ${(bestErr*100).toFixed(1)}%)`);
}

console.log("\n=== 1:0 Phase ===");
for (let point of testPoints10) {
    const decay = getShare(point.m, point.m <= 45 ? 1 : 2);
    const liveMarginSum = (1 / point.p1) + (1 / point.x) + (1 / point.p2);
    
    let bestErr = Infinity;
    let bestXg1 = 0;
    let bestXg2 = 0;
    
    for (let rx1 = 0.01; rx1 <= 3.0; rx1 += 0.02) {
        for (let rx2 = 0.01; rx2 <= 3.0; rx2 += 0.02) {
            const full = calculateMatchOutcomes(rx1, rx2, 1, 0); 
            const calcP1 = 1 / (full.p1 * liveMarginSum);
            const calcX = 1 / (full.x * liveMarginSum);
            const calcP2 = 1 / (full.p2 * liveMarginSum);
            
            const err = Math.abs(calcP1 - point.p1) / point.p1 + 
                        Math.abs(calcX - point.x) / point.x + 
                        Math.abs(calcP2 - point.p2) / point.p2;
                        
            if (err < bestErr) {
                bestErr = err;
                bestXg1 = rx1;
                bestXg2 = rx2;
            }
        }
    }
    
    const m1 = bestXg1 / (xG1 * decay);
    const m2 = bestXg2 / (xG2 * decay);
    
    // Evaluate current formula
    const ratio_actual = Math.max(0.5, Math.min(3.0, xG2 / xG1)); // xG2 is losing, xG1 is winning
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
    
    let rem_xG1 = xG1 * decay * formula_winning;
    let rem_xG2 = xG2 * decay * formula_losing;
    
    const full = calculateMatchOutcomes(rem_xG1, rem_xG2, 1, 0);
    const calcP1 = 1 / (full.p1 * liveMarginSum);
    const calcX = 1 / (full.x * liveMarginSum);
    const calcP2 = 1 / (full.p2 * liveMarginSum);
    const formErr = Math.abs(calcP1 - point.p1) / point.p1 + 
                    Math.abs(calcX - point.x) / point.x + 
                    Math.abs(calcP2 - point.p2) / point.p2;
    
    console.log(`Min ${point.m}: Optimal M1(Win)=${m1.toFixed(2)}, M2(Lose)=${m2.toFixed(2)} (Err: ${(bestErr*100).toFixed(1)}%) | Formula M1=${formula_winning.toFixed(2)}, M2=${formula_losing.toFixed(2)} -> P1=${calcP1.toFixed(2)}(${point.p1}) X=${calcX.toFixed(2)}(${point.x}) P2=${calcP2.toFixed(2)}(${point.p2}) (Err: ${(formErr*100).toFixed(1)}%)`);
}

