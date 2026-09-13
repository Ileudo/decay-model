import { calculateMatchOutcomes, poisson, findLambdas } from './src/lib/math.ts';

const pmP1 = 2.79;
const pmX = 3.63;
const pmP2 = 2.08;
const marginSum = (1 / pmP1) + (1 / pmX) + (1 / pmP2);
const trueP1 = (1 / pmP1) / marginSum;
const trueX = (1 / pmX) / marginSum;
const trueP2 = (1 / pmP2) / marginSum;
const { xG1, xG2 } = findLambdas(trueP1, trueP2);

const testPoints = [
  { m: 15, p1: 2.33, x: 3.23, p2: 2.66 },
  { m: 30, p1: 2.31, x: 3.07, p2: 2.81 },
  { m: 45, p1: 1.943, x: 3.07, p2: 3.65 }, 
  { m: 60, p1: 1.704, x: 3.05, p2: 4.94 },
  { m: 75, p1: 1.39, x: 3.47, p2: 9.21 },
  { m: 85, p1: 1.18, x: 4.65, p2: 18.41 }
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

// What if neither team got a red card, but the Game State modifier in lower leagues is just fundamentally different?
// Let's use the optimal grid search error output directly to check what happened.
for (let point of testPoints) {
    const decay = getShare(point.m, point.m <= 45 ? 1 : 2);
    
    // Evaluate optimal multipliers
    let bestErr = Infinity;
    let bestXg1 = 0;
    let bestXg2 = 0;
    
    for (let rx1 = 0.01; rx1 <= 3.0; rx1 += 0.01) {
        for (let rx2 = 0.01; rx2 <= 3.0; rx2 += 0.01) {
            const full = calculateMatchOutcomes(rx1, rx2, 1, 0); // 1-0 score
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
    
    const m1 = bestXg1 / (xG1 * decay);
    const m2 = bestXg2 / (xG2 * decay);
    
    const full = calculateMatchOutcomes(bestXg1, bestXg2, 1, 0);
    const calcP1 = 1 / (full.p1 * marginSum);
    const calcX = 1 / (full.x * marginSum);
    const calcP2 = 1 / (full.p2 * marginSum);
    
    console.log(`Min ${point.m}: Optimal M1(Win)=${m1.toFixed(2)}, M2(Lose)=${m2.toFixed(2)} (Err: ${(bestErr*100).toFixed(1)}%) -> P1=${calcP1.toFixed(2)}(${point.p1}) X=${calcX.toFixed(2)}(${point.x}) P2=${calcP2.toFixed(2)}(${point.p2})`);
}

