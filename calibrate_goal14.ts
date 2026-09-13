import { calculateMatchOutcomes, poisson, findLambdas } from './src/lib/math.ts';

const pmP1 = 2.15;
const pmX = 3.47;
const pmP2 = 3.20;
const marginSum = (1 / pmP1) + (1 / pmX) + (1 / pmP2);
const trueP1 = (1 / pmP1) / marginSum;
const trueX = (1 / pmX) / marginSum;
const trueP2 = (1 / pmP2) / marginSum;
const { xG1, xG2 } = findLambdas(trueP1, trueP2);

const testPoints = [
  { m: 20, p1: 4.12, x: 3.50, p2: 1.833 },
  { m: 30, p1: 4.34, x: 3.45, p2: 1.833 },
  { m: 45, p1: 5.68, x: 3.41, p2: 1.68 }, 
  { m: 60, p1: 7.53, x: 3.53, p2: 1.54 },
  { m: 75, p1: 14.13, x: 4.09, p2: 1.34 },
  { m: 85, p1: 28.85, x: 5.31, p2: 1.19 }
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

// Our model's P1 is way too HIGH (meaning our model thinks P1 has a lower chance of coming back).
// P1 actual at min 20 is 4.12. Our model gives 5.01.
// That means the actual xG for P1 needs to be HIGHER. The favorite is pushing harder than 0.95!

for (let point of testPoints) {
    let bestErr = Infinity;
    let bestXg1 = 0;
    let bestXg2 = 0;
    
    for (let rx1 = 0.01; rx1 <= 2.5; rx1 += 0.02) {
        for (let rx2 = 0.01; rx2 <= 2.5; rx2 += 0.02) {
            const full = calculateMatchOutcomes(rx1, rx2, 0, 1);
            
            const calcP1 = 1 / (full.p1 * marginSum);
            const calcX = 1 / (full.x * marginSum);
            const calcP2 = 1 / (full.p2 * marginSum);
            
            // Weight the error towards the Draw and P1 (the chaser)
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

