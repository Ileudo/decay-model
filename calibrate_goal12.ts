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
  { m: 20, p1: 4.03, x: 3.21, p2: 1.98 },
  { m: 25, p1: 4.40, x: 3.22, p2: 1.90 },
  { m: 30, p1: 4.70, x: 3.26, p2: 1.833 },
  { m: 34, p1: 5.20, x: 3.29, p2: 1.757 }, // Just before the red card
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

// Okay, for a clean 11v11 scenario in the FIRST HALF where the favorite is losing 0:1:
// The favorite's xG multiplier is ~ 0.95 (They attack SLIGHTLY less effectively than at 0:0, probably due to the opponent parking the bus).
// The underdog's xG multiplier goes from 0.70 at min 17 up to 0.80 at min 34. (They park the bus heavily initially, but naturally open up slightly as time goes on).

// Let's test a very simple Game State Modifier:
// Goal Difference = score1 - score2.
// Losing team M = 0.95.
// Winning team M = 0.75.

for (let point of testPoints) {
    const decay = getShare(point.m, point.m <= 45 ? 1 : 2);
    
    // Static modifiers for early game state
    const m1 = 0.95; // Losing team (favorite)
    const m2 = 0.75; // Winning team (underdog)
    
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

