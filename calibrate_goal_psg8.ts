import { calculateMatchOutcomes, poisson, findLambdas } from './src/lib/math.ts';

const pmP1 = 12.43;
const pmX = 6.34;
const pmP2 = 1.215;
const marginSum = (1 / pmP1) + (1 / pmX) + (1 / pmP2);
const trueP1 = (1 / pmP1) / marginSum;
const trueX = (1 / pmX) / marginSum;
const trueP2 = (1 / pmP2) / marginSum;
const { xG1, xG2 } = findLambdas(trueP1, trueP2);

const testPoints = [
  { m: 15, p1: 26.43, x: 9.97, p2: 1.092 },
  { m: 30, p1: 23.94, x: 8.32, p2: 1.119 },
  { m: 45, p1: 27.99, x: 7.98, p2: 1.120 }, 
  { m: 60, p1: 26.43, x: 7.16, p2: 1.140 },
  { m: 67, p1: 30.77, x: 6.97, p2: 1.140 }
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

for (let point of testPoints) {
    const decay = getShare(point.m, point.m <= 45 ? 1 : 2);
    let rem_xG1 = xG1 * decay;
    let rem_xG2 = xG2 * decay;
    
    const strengthRatio = Math.max(0.1, xG1 / xG2); 
    
    // In our original script we found optimal M1/M2 for 60/67:
    // Min 60: M1=1.77, M2=0.99
    // Min 67: M1=1.81, M2=0.98
    // But with those, P1=49.90... wait.
    // Let's rerun the grid search just to be absolutely sure.
    let bestErr = Infinity;
    let bestXg1 = 0;
    let bestXg2 = 0;
    
    for (let rx1 = 0.01; rx1 <= 1.5; rx1 += 0.01) {
        for (let rx2 = 0.01; rx2 <= 2.5; rx2 += 0.02) {
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
    
    const m1 = bestXg1 / (xG1 * decay);
    const m2 = bestXg2 / (xG2 * decay);
    console.log(`Min ${point.m}: Optimal M1=${m1.toFixed(2)}, M2=${m2.toFixed(2)} (Err: ${(bestErr*100).toFixed(1)}%)`);
}

