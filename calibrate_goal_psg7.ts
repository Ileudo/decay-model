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

// Notice that the calculated P1 and X are WAY too high, and P2 is too low.
// This means the model thinks PSG (P2) is MORE likely to win than Pinnacle does.
// WHY? Because our mWinning is 1.02. We are barely reducing PSG's xG!
// If PSG is winning, they WILL slow down, but wait. If they play at 1.02, they score MORE goals, which kills Brest's chances of a comeback.
// We found optimal M2 (mWinning) is ~ 0.85.

for (let point of testPoints) {
    const decay = getShare(point.m, point.m <= 45 ? 1 : 2);
    let rem_xG1 = xG1 * decay;
    let rem_xG2 = xG2 * decay;
    
    // Unclamped ratio logic
    // We want M_losing to be ~1.35 and M_winning to be ~0.85.
    
    const strengthRatio = Math.max(0.1, xG1 / xG2); // xG1 is losing
    // strengthRatio = 0.25. 
    // M_losing: 1.40 - 0.26 * 0.25 = 1.335
    // M_winning: 0.90 - 0.20 * 0.25 = 0.85
    
    let mLosing = 1.40 - (0.26 * strengthRatio);
    
    // A better formula for M_winning that fits all 3 cases:
    // Match 1 (ratio = 1.74): 0.70
    // Match 2 (ratio = 1.28): 0.82
    // Match 3 (ratio = 0.25): 0.85
    // This is NOT linear. 
    let mWinning = 1.0;
    if (strengthRatio > 1.0) {
        // losing team is favorite -> winning team is underdog (parks the bus)
        mWinning = 1.0 - (0.17 * strengthRatio); // 1.74 -> 0.70, 1.28 -> 0.78
    } else {
        // losing team is underdog -> winning team is favorite (controls game)
        mWinning = 0.80 + (0.20 * strengthRatio); // 0.25 -> 0.85
    }
    
    // Add second half escalation
    if (point.m > 45) {
        const t2 = (point.m - 45) / 45.0; 
        mLosing += (t2 * 0.50); 
        mWinning += (t2 * 0.25); 
    }
    
    rem_xG1 *= mLosing; 
    rem_xG2 *= mWinning; 
    
    const full = calculateMatchOutcomes(rem_xG1, rem_xG2, 0, 1);
            
    const calcP1 = 1 / (full.p1 * marginSum);
    const calcX = 1 / (full.x * marginSum);
    const calcP2 = 1 / (full.p2 * marginSum);
    
    const err = Math.abs(calcP1 - point.p1) / point.p1 + 
                Math.abs(calcX - point.x) / point.x + 
                Math.abs(calcP2 - point.p2) / point.p2;
    
    console.log(`Min ${point.m}: M1=${mLosing.toFixed(2)}, M2=${mWinning.toFixed(2)} | calcP1=${calcP1.toFixed(2)}(${point.p1}), calcX=${calcX.toFixed(2)}(${point.x}), calcP2=${calcP2.toFixed(2)}(${point.p2}) | Err: ${(err*100).toFixed(1)}%`);
}

