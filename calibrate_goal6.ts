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
  { m: 45, p1: 3.02, x: 2.75, p2: 2.64 }, // We will use 45 instead of half time 
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

// Based on the data:
// In the first half, the losing favorite attacks normally (M1 ~ 0.95), and winning dog defends hard (M2 ~ 0.7)
// In the second half, panic sets in for the losing favorite (M1 jumps to 1.35 - 1.75).
// The winning dog defends EVEN HARDER initially (M2 ~ 0.2-0.3), but late in the game M2 bounces back up 
// (probably because Pinnacle raises the dog's odds very late to induce liquidity, or counter-attacks become likely).

for (let point of testPoints) {
    const decay = getShare(point.m, point.m <= 45 ? 1 : 2);
    const r = point.m <= 45 ? 1.0 : (94.0 - point.m) / 49.0;
    
    // Dynamic formula test
    let m1 = 1.0;
    let m2 = 1.0;
    
    if (point.m <= 45) {
        m1 = 0.95;
        m2 = 0.70;
    } else {
        // Second half panic
        // m1 starts at 1.35 at HT, goes to 1.80 by min 90
        const panicProgress = 1.0 - r; // 0 at HT, 1 at FT
        m1 = 1.35 + (panicProgress * 0.45);
        
        // m2 starts at 0.25 at HT, goes back up to 1.50 by min 90
        m2 = 0.25 + (panicProgress * 1.25);
    }
    
    let rem_xG1 = xG1 * decay * m1;
    let rem_xG2 = xG2 * decay * m2;
    
    const full = calculateMatchOutcomes(rem_xG1, rem_xG2, 0, 1);
            
    const calcP1 = 1 / (full.p1 * marginSum);
    const calcX = 1 / (full.x * marginSum);
    const calcP2 = 1 / (full.p2 * marginSum);
    
    const err = Math.abs(calcP1 - point.p1) / point.p1 + 
                Math.abs(calcX - point.x) / point.x + 
                Math.abs(calcP2 - point.p2) / point.p2;
    
    console.log(`Min ${point.m}: calcP1=${calcP1.toFixed(2)}(${point.p1}), calcX=${calcX.toFixed(2)}(${point.x}), calcP2=${calcP2.toFixed(2)}(${point.p2}) | Err: ${(err*100).toFixed(1)}%`);
}

