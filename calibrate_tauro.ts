import { calculateMatchOutcomes, poisson, findLambdas } from './src/lib/math.ts';

const pmP1 = 2.28;
const pmX = 3.03;
const pmP2 = 3.19;
const marginSum = (1 / pmP1) + (1 / pmX) + (1 / pmP2);
const trueP1 = (1 / pmP1) / marginSum;
const trueX = (1 / pmX) / marginSum;
const trueP2 = (1 / pmP2) / marginSum;
const { xG1, xG2 } = findLambdas(trueP1, trueP2);

console.log(`True Probs: P1=${trueP1.toFixed(3)}, X=${trueX.toFixed(3)}, P2=${trueP2.toFixed(3)}`);
console.log(`Base xG: xG1(P1)=${xG1.toFixed(2)}, xG2(P2)=${xG2.toFixed(2)}`);

const testPoints10 = [
  { m: 26, p1: 1.361, x: 4.23, p2: 8.60 },
  { m: 30, p1: 1.375, x: 4.18, p2: 8.74 },
  { m: 45, p1: 1.392, x: 3.99, p2: 9.06 }, 
  { m: 60, p1: 1.310, x: 4.26, p2: 12.54 },
  { m: 70, p1: 1.260, x: 4.54, p2: 16.17 },
  { m: 81, p1: 1.170, x: 5.52, p2: 27.05 }
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

console.log("\n=== 1:0 Phase ===");
for (let point of testPoints10) {
    const decay = getShare(point.m, point.m <= 45 ? 1 : 2);
    const liveMarginSum = (1 / point.p1) + (1 / point.x) + (1 / point.p2);
    
    // Evaluate optimal multipliers
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
    
    console.log(`Min ${point.m}: Optimal M1(Win)=${m1.toFixed(2)}, M2(Lose)=${m2.toFixed(2)} (Err: ${(bestErr*100).toFixed(1)}%) | Formula M1(Win)=${formula_winning.toFixed(2)}, M2(Lose)=${formula_losing.toFixed(2)} -> P1=${calcP1.toFixed(2)}(${point.p1}) X=${calcX.toFixed(2)}(${point.x}) P2=${calcP2.toFixed(2)}(${point.p2}) (Err: ${(formErr*100).toFixed(1)}%)`);
}

