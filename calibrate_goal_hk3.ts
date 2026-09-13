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

// Let's test the red card modifier. What if someone got a red card?
// If Team 1 got a red card, they would play much worse (xG drops). But they are winning.
// If Team 2 got a red card, their xG drops. But P2 odds are getting worse, not better, so Team 2 didn't get a red card early.
// Actually wait! Look at the X coefficient.
// Min 15: X = 3.23
// Min 30: X = 3.07
// Min 45: X = 3.07
// Min 60: X = 3.05
// The X coefficient is DROPPING while the match progresses from min 15 to 60.
// Usually, X drops over time if it's a draw, but here it's 1:0.
// If it's 1:0, X drops if the losing team is heavily pressing and expected to score exactly 1 goal.

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
    
    // Evaluate current formula
    const strengthRatio = Math.max(0.5, Math.min(3.0, xG1 / xG2));
    let mLosingInv = 1.40 - (0.26 * strengthRatio);
    let mWinningInv = 0.80 + (0.20 * strengthRatio);
    
    if (point.m > 45) {
      const t2 = (point.m - 45) / 45.0; // 0.0 to 1.0 in second half
      mLosingInv += (t2 * 0.50); 
      mWinningInv += (t2 * 0.25); 
    }
    
    // What if we apply a more aggressive Asian handicap modifier?
    // In lower leagues, game state volatility is higher. 
    // Let's just output the base formula coefficients.
    
    let rem_xG1 = xG1 * decay * mWinningInv;
    let rem_xG2 = xG2 * decay * mLosingInv;
    
    const full = calculateMatchOutcomes(rem_xG1, rem_xG2, 1, 0);
    const calcP1 = 1 / (full.p1 * marginSum);
    const calcX = 1 / (full.x * marginSum);
    const calcP2 = 1 / (full.p2 * marginSum);
    
    console.log(`Min ${point.m}: Formula -> P1=${calcP1.toFixed(2)} X=${calcX.toFixed(2)} P2=${calcP2.toFixed(2)}`);
}

