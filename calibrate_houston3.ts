import { calculateMatchOutcomes, poisson, findLambdas } from './src/lib/math.ts';

const pmP1 = 3.99;
const pmX = 3.34;
const pmP2 = 1.909;
const pmMarginSum = (1 / pmP1) + (1 / pmX) + (1 / pmP2);
const trueP1 = (1 / pmP1) / pmMarginSum;
const trueX = (1 / pmX) / pmMarginSum;
const trueP2 = (1 / pmP2) / pmMarginSum;
const { xG1, xG2 } = findLambdas(trueP1, trueP2);

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
    const liveMarginSum = (1 / point.p1) + (1 / point.x) + (1 / point.p2);
    
    // Evaluate optimal multipliers
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

console.log("\n=== 0:1 Phase ===");
for (let point of testPoints01) {
    const decay = getShare(point.m, point.m <= 45 ? 1 : 2);
    const liveMarginSum = (1 / point.p1) + (1 / point.x) + (1 / point.p2);
    
    // Evaluate optimal multipliers
    let bestErr = Infinity;
    let bestXg1 = 0;
    let bestXg2 = 0;
    
    for (let rx1 = 0.01; rx1 <= 3.0; rx1 += 0.02) {
        for (let rx2 = 0.01; rx2 <= 3.0; rx2 += 0.02) {
            const full = calculateMatchOutcomes(rx1, rx2, 0, 1); 
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
    
    console.log(`Min ${point.m}: Optimal M1(Lose)=${m1.toFixed(2)}, M2(Win)=${m2.toFixed(2)} (Err: ${(bestErr*100).toFixed(1)}%)`);
}

