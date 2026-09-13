import { calculateMatchOutcomes, poisson, findLambdas } from './src/lib/math.ts';

// Our current math.ts logic uses this:
/*
  if (goalDifference !== 0) {
    const strengthRatio = Math.max(0.5, Math.min(3.0, xG1 / xG2)); 
    let mLosing = 1.40 - (0.26 * strengthRatio);
    let mWinning = 1.15 - (0.26 * strengthRatio);
    
    // ...
*/

// For Brest vs PSG, xG1/xG2 = 0.25.
// But clamped to 0.5.
// So mLosing = 1.40 - 0.26 * 0.5 = 1.27.
// And mWinning = 1.15 - 0.26 * 0.5 = 1.02.
// BUT because PSG is TEAM 2 and they are WINNING:
// score1 = 0, score2 = 1. goalDifference = -1.
// Team 1 (Brest) is losing. So rem_xG1 *= mLosing (1.27), rem_xG2 *= mWinning (1.02).

// Let's test EXACTLY what current math.ts is doing for this match.

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
    
    // EXACT CURRENT MATH.TS LOGIC
    const strengthRatio = Math.max(0.5, Math.min(3.0, xG1 / xG2));
    let mLosing = 1.40 - (0.26 * strengthRatio);
    let mWinning = 1.15 - (0.26 * strengthRatio);
    rem_xG1 *= mLosing; 
    rem_xG2 *= mWinning; 
    
    const full = calculateMatchOutcomes(rem_xG1, rem_xG2, 0, 1);
            
    const calcP1 = 1 / (full.p1 * marginSum);
    const calcX = 1 / (full.x * marginSum);
    const calcP2 = 1 / (full.p2 * marginSum);
    
    const err = Math.abs(calcP1 - point.p1) / point.p1 + 
                Math.abs(calcX - point.x) / point.x + 
                Math.abs(calcP2 - point.p2) / point.p2;
    
    console.log(`Min ${point.m}: calcP1=${calcP1.toFixed(2)}(${point.p1}), calcX=${calcX.toFixed(2)}(${point.x}), calcP2=${calcP2.toFixed(2)}(${point.p2}) | Err: ${(err*100).toFixed(1)}%`);
}

