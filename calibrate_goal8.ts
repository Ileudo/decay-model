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
  { m: 45, p1: 3.02, x: 2.75, p2: 2.64 }, // HT odds jump
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

// A completely different perspective: 
// In Pinnacle, when the underdog scores early, the market DOES NOT panic immediately.
// In fact, the market assumes the favorite will eventually equalize, so they keep the underdog's win odds relatively high (1.99 at min 17 is very high for a team already leading 1:0).
// BUT as time goes on, the "Panic" increases exponentially.
// Let's model Panic as a function of TIME remaining and GOAL DIFFERENCE.

for (let point of testPoints) {
    const decay = getShare(point.m, point.m <= 45 ? 1 : 2);
    
    // Time passed (0.0 to 1.0)
    const t = 1.0 - decay;
    
    // As t approaches 1 (end of game), the losing team pushes harder.
    // The winning team defends harder.
    // Base modifiers: 1.0
    let m1 = 1.0 + (t * 0.5); // Losing team pushes up to +50%
    let m2 = 1.0 - (t * 0.7); // Winning team defends up to -70%
    
    // However, if the losing team is a FAVORITE, they push even harder early on.
    const favFactor = Math.max(1.0, xG1 / xG2); // ~ 1.74
    
    // Let's refine
    m1 = 1.0 + (t * 0.8 * favFactor); 
    m2 = 1.0 - (t * 0.9);
    
    // Prevent negative xG
    m2 = Math.max(0.1, m2);
    
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
    
    console.log(`Min ${point.m} (t=${t.toFixed(2)}): calcP1=${calcP1.toFixed(2)}(${point.p1}), calcX=${calcX.toFixed(2)}(${point.x}), calcP2=${calcP2.toFixed(2)}(${point.p2}) | Err: ${(err*100).toFixed(1)}%`);
}

