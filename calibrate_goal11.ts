import { calculateMatchOutcomes, poisson, findLambdas } from './src/lib/math.ts';

const pmP1 = 1.826;
const pmX = 3.49;
const pmP2 = 4.35;
const marginSum = (1 / pmP1) + (1 / pmX) + (1 / pmP2);
const trueP1 = (1 / pmP1) / marginSum;
const trueX = (1 / pmX) / marginSum;
const trueP2 = (1 / pmP2) / marginSum;
const { xG1, xG2 } = findLambdas(trueP1, trueP2);

// We must ONLY use data before the red card at min 35!
// The game was 11v11 until minute 35. 
// Odra Opole (P1, favorite) conceded at min 16.
// Let's look at the clean 11v11 data for the "losing favorite" effect.

const testPoints = [
  { m: 17, p1: 3.86, x: 3.21, p2: 1.99 },
  { m: 20, p1: 4.03, x: 3.21, p2: 1.98 },
  { m: 25, p1: 4.40, x: 3.22, p2: 1.90 },
  { m: 30, p1: 4.70, x: 3.26, p2: 1.833 },
  { m: 34, p1: 5.20, x: 3.29, p2: 1.757 }, // Just before the red card
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

// Let's grid search the multipliers for these clean 11v11 points
for (let point of testPoints) {
    let bestErr = Infinity;
    let bestXg1 = 0;
    let bestXg2 = 0;
    
    for (let rx1 = 0.01; rx1 <= 2.5; rx1 += 0.01) {
        for (let rx2 = 0.01; rx2 <= 2.5; rx2 += 0.01) {
            const full = calculateMatchOutcomes(rx1, rx2, 0, 1);
            
            const calcP1 = 1 / (full.p1 * marginSum);
            const calcX = 1 / (full.x * marginSum);
            const calcP2 = 1 / (full.p2 * marginSum);
            
            const err = Math.abs(calcP1 - point.p1) / point.p1 * 1.5 + 
                        Math.abs(calcX - point.x) / point.x * 1.5 + 
                        Math.abs(calcP2 - point.p2) / point.p2;
                        
            if (err < bestErr) {
                bestErr = err;
                bestXg1 = rx1;
                bestXg2 = rx2;
            }
        }
    }
    
    const decay = getShare(point.m, point.m <= 45 ? 1 : 2);
    const m1 = bestXg1 / (xG1 * decay);
    const m2 = bestXg2 / (xG2 * decay);
    
    console.log(`Min ${point.m}: Optimal Rem xG: ${bestXg1.toFixed(2)} vs ${bestXg2.toFixed(2)} | Implied Multipliers: M1=${m1.toFixed(2)}, M2=${m2.toFixed(2)} | Error: ${(bestErr*100).toFixed(1)}%`);
}

