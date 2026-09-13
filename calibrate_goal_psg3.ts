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
    
    // Instead of using Math.max(0.5, ...), we just use the raw ratio:
    // ratio = xg_losing / xg_winning
    const ratio = Math.max(0.2, Math.min(3.0, xG1 / xG2));
    
    let mLosing = 1.40 - (0.26 * ratio);
    
    // New M_winning formula:
    // Match 1 (ratio = 1.74): 0.70
    // Match 2 (ratio = 1.28): 0.82
    // Match 3 (ratio = 0.25): 0.85
    // It peaks around ratio=0.8 at ~0.85, then drops.
    // Let's use a simpler bounded value.
    let mWinning = 0.85; 
    if (ratio > 1.0) {
        mWinning = 0.85 - (ratio - 1.0) * 0.20; // 1.74 -> 0.85 - 0.74*0.2 = 0.70! Perfect.
    }
    
    // Test the second half "panic" multiplier.
    // In previous games we noticed M_losing goes up in 2nd half.
    if (point.m > 45) {
        const t2 = (point.m - 45) / 45.0; 
        mLosing += (t2 * 0.40); 
    }
    
    let rem_xG1 = xG1 * decay * mLosing;
    let rem_xG2 = xG2 * decay * mWinning;
    
    const full = calculateMatchOutcomes(rem_xG1, rem_xG2, 0, 1);
            
    const calcP1 = 1 / (full.p1 * marginSum);
    const calcX = 1 / (full.x * marginSum);
    const calcP2 = 1 / (full.p2 * marginSum);
    
    const err = Math.abs(calcP1 - point.p1) / point.p1 + 
                Math.abs(calcX - point.x) / point.x + 
                Math.abs(calcP2 - point.p2) / point.p2;
    
    console.log(`Min ${point.m}: calcP1=${calcP1.toFixed(2)}(${point.p1}), calcX=${calcX.toFixed(2)}(${point.x}), calcP2=${calcP2.toFixed(2)}(${point.p2}) | Err: ${(err*100).toFixed(1)}%`);
}

