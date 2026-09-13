import { calculateMatchOutcomes, poisson, findLambdas } from './src/lib/math.ts';

const pmP1 = 1.826;
const pmX = 3.49;
const pmP2 = 4.35;
const marginSum = (1 / pmP1) + (1 / pmX) + (1 / pmP2);
const trueP1 = (1 / pmP1) / marginSum;
const trueX = (1 / pmX) / marginSum;
const trueP2 = (1 / pmP2) / marginSum;
const { xG1, xG2 } = findLambdas(trueP1, trueP2);

const testPoints = [
  { m: 17, p1: 3.86, x: 3.21, p2: 1.99 },
  { m: 30, p1: 4.7, x: 3.26, p2: 1.833 },
  { m: 45, p1: 3.02, x: 2.75, p2: 2.64 }, // adjusted HT odds based on stable block
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

// Let's implement a dynamic game state modifier based on the probability ratios
for (let point of testPoints) {
    const decay = getShare(point.m, point.m <= 45 ? 1 : 2);
    
    // Instead of simple multiplier, what if xG ratio shifts?
    let bestErr = Infinity;
    let bestXg1 = 0;
    let bestXg2 = 0;
    
    for (let rx1 = 0.1; rx1 <= 3.0; rx1 += 0.05) {
        for (let rx2 = 0.1; rx2 <= 3.0; rx2 += 0.05) {
            const full = calculateMatchOutcomes(rx1, rx2, 0, 1);
            
            const calcP1 = 1 / (full.p1 * marginSum);
            const calcX = 1 / (full.x * marginSum);
            const calcP2 = 1 / (full.p2 * marginSum);
            
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
    
    console.log(`Min ${point.m}: Target Rem xG: ${bestXg1.toFixed(2)} vs ${bestXg2.toFixed(2)} (Base was ${ (xG1 * decay).toFixed(2) } vs ${ (xG2 * decay).toFixed(2) }) | Err: ${(bestErr*100).toFixed(1)}%`);
}

