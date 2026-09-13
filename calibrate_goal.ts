import { calculateMatchOutcomes, poisson, findLambdas } from './src/lib/math.ts';

// Pre-match data (we take it from minute 0)
// 0 0-0 1.819 3.49 4.35
const pmP1 = 1.826;
const pmX = 3.49;
const pmP2 = 4.35;

const marginSum = (1 / pmP1) + (1 / pmX) + (1 / pmP2);
const trueP1 = (1 / pmP1) / marginSum;
const trueX = (1 / pmX) / marginSum;
const trueP2 = (1 / pmP2) / marginSum;

console.log("Pre-match True Probs:", trueP1, trueX, trueP2);

const { xG1, xG2 } = findLambdas(trueP1, trueP2);
console.log("xG:", xG1, xG2);

// Let's test a few data points from the provided set (0-1 score)
const testPoints = [
  { m: 17, p1: 3.86, x: 3.21, p2: 1.99 },
  { m: 30, p1: 4.7, x: 3.26, p2: 1.833 },
  { m: 45, p1: 2.99, x: 2.76, p2: 2.66 }, // HT, note odds jump around HT
  { m: 60, p1: 4.58, x: 2.67, p2: 2.08 },
  { m: 75, p1: 9.50, x: 3.10, p2: 1.55 },
  { m: 85, p1: 24.08, x: 4.50, p2: 1.24 }
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

console.log("\n--- TEST BASE MODIFIERS ---");

for (let point of testPoints) {
    const decay = getShare(point.m, point.m <= 45 ? 1 : 2);
    
    // Let's grid search the best multiplier for xG1 and xG2
    let bestErr = Infinity;
    let bestM1 = 0, bestM2 = 0;
    
    for (let m1 = 0.5; m1 <= 2.5; m1 += 0.05) {
        for (let m2 = 0.5; m2 <= 2.5; m2 += 0.05) {
            const rem_xG1 = xG1 * decay * m1;
            const rem_xG2 = xG2 * decay * m2;
            
            const full = calculateMatchOutcomes(rem_xG1, rem_xG2, 0, 1);
            
            const calcP1 = 1 / (full.p1 * marginSum);
            const calcX = 1 / (full.x * marginSum);
            const calcP2 = 1 / (full.p2 * marginSum);
            
            const err = Math.abs(calcP1 - point.p1) / point.p1 + 
                        Math.abs(calcX - point.x) / point.x + 
                        Math.abs(calcP2 - point.p2) / point.p2;
                        
            if (err < bestErr) {
                bestErr = err;
                bestM1 = m1;
                bestM2 = m2;
            }
        }
    }
    
    console.log(`Min ${point.m}: Optimal M1(Losing Fav) = ${bestM1.toFixed(2)}, M2(Winning Dog) = ${bestM2.toFixed(2)} | Error: ${(bestErr*100).toFixed(1)}%`);
}

