import { calculateMatchOutcomes, poisson, findLambdas } from './src/lib/math.ts';

// Wehen SV-Waldhof Mannheim 0:1
// Pre-match data (Minute 0)
// 0 0-0 2.15 3.47 3.2
const pmP1 = 2.15;
const pmX = 3.47;
const pmP2 = 3.20;

const marginSum = (1 / pmP1) + (1 / pmX) + (1 / pmP2);
const trueP1 = (1 / pmP1) / marginSum;
const trueX = (1 / pmX) / marginSum;
const trueP2 = (1 / pmP2) / marginSum;
const { xG1, xG2 } = findLambdas(trueP1, trueP2);

console.log("True Probs:", trueP1.toFixed(3), trueX.toFixed(3), trueP2.toFixed(3));
console.log("Base xG:", xG1.toFixed(2), xG2.toFixed(2));

// This is a match where P1 is a slight favorite (2.15 vs 3.20).
// In the previous match, P1 was a huge favorite (1.82 vs 4.35).
// Let's test the current static Game State Modifier on this new match.

const testPoints = [
  // 1st half
  { m: 20, p1: 4.12, x: 3.50, p2: 1.833 },
  { m: 30, p1: 4.34, x: 3.45, p2: 1.833 },
  { m: 45, p1: 5.68, x: 3.41, p2: 1.68 }, // Wait, P1 odds go UP over time, which is normal for losing. 
  // 2nd half
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

for (let point of testPoints) {
    const decay = getShare(point.m, point.m <= 45 ? 1 : 2);
    
    // Using our CURRENT hardcoded logic:
    let m1 = 0.95;
    let m2 = 0.75;
    
    let rem_xG1 = xG1 * decay * m1;
    let rem_xG2 = xG2 * decay * m2;
    
    // Check if it fits
    const full = calculateMatchOutcomes(rem_xG1, rem_xG2, 0, 1);
            
    const calcP1 = 1 / (full.p1 * marginSum);
    const calcX = 1 / (full.x * marginSum);
    const calcP2 = 1 / (full.p2 * marginSum);
    
    const err = Math.abs(calcP1 - point.p1) / point.p1 + 
                Math.abs(calcX - point.x) / point.x + 
                Math.abs(calcP2 - point.p2) / point.p2;
    
    console.log(`Min ${point.m}: calcP1=${calcP1.toFixed(2)}(${point.p1}), calcX=${calcX.toFixed(2)}(${point.x}), calcP2=${calcP2.toFixed(2)}(${point.p2}) | Err: ${(err*100).toFixed(1)}%`);
}

