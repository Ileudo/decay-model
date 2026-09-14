import { calculateMatchOutcomes, poisson, findLambdas } from './src/lib/math.ts';

const pmP1 = 2.22;
const pmX = 3.35;
const pmP2 = 3.29;
const marginSum = (1 / pmP1) + (1 / pmX) + (1 / pmP2);
const trueP1 = (1 / pmP1) / marginSum;
const trueX = (1 / pmX) / marginSum;
const trueP2 = (1 / pmP2) / marginSum;
const { xG1, xG2 } = findLambdas(trueP1, trueP2);

console.log(`True Probs: P1=${trueP1.toFixed(3)}, X=${trueX.toFixed(3)}, P2=${trueP2.toFixed(3)}`);
console.log(`Base xG: xG1(P1)=${xG1.toFixed(2)}, xG2(P2)=${xG2.toFixed(2)}`);

const testPoints00 = [
  { m: 15, p1: 2.25, x: 3.13, p2: 3.48 },
  { m: 30, p1: 2.45, x: 2.83, p2: 3.45 },
  { m: 45, p1: 2.63, x: 2.52, p2: 3.64 }
];

const testPoints01 = [
  { m: 46, p1: 6.85, x: 3.38, p2: 1.62 }, 
  { m: 60, p1: 11.25, x: 3.75, p2: 1.44 },
  { m: 72, p1: 19.85, x: 4.49, p2: 1.29 }
];

const testPoints11 = [
  { m: 74, p1: 4.25, x: 1.61, p2: 4.90 },
  { m: 84, p1: 7.66, x: 1.42, p2: 4.58 }
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

console.log("\n=== 0:1 Phase ===");
for (let point of testPoints01) {
    const decay = getShare(point.m, point.m <= 45 ? 1 : 2);
    const liveMarginSum = (1 / point.p1) + (1 / point.x) + (1 / point.p2);
    
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

console.log("\n=== 1:1 Phase ===");
for (let point of testPoints11) {
    const decay = getShare(point.m, point.m <= 45 ? 1 : 2);
    const liveMarginSum = (1 / point.p1) + (1 / point.x) + (1 / point.p2);
    
    let bestErr = Infinity;
    let bestXg1 = 0;
    let bestXg2 = 0;
    
    for (let rx1 = 0.01; rx1 <= 3.0; rx1 += 0.02) {
        for (let rx2 = 0.01; rx2 <= 3.0; rx2 += 0.02) {
            const full = calculateMatchOutcomes(rx1, rx2, 1, 1); 
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

