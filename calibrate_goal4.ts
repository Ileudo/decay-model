import { calculateMatchOutcomes, poisson, findLambdas } from './src/lib/math.ts';

const pmP1 = 1.826;
const pmX = 3.49;
const pmP2 = 4.35;
const marginSum = (1 / pmP1) + (1 / pmX) + (1 / pmP2);
const trueP1 = (1 / pmP1) / marginSum;
const trueX = (1 / pmX) / marginSum;
const trueP2 = (1 / pmP2) / marginSum;
const { xG1, xG2 } = findLambdas(trueP1, trueP2);

// From previous test we see that:
// When the underdog (Team 2) scores:
// The favorite's (Team 1) xG stays relatively HIGH (or drops much slower than time decay).
// The underdog's (Team 2) xG PLUMMETS (they completely stop attacking and park the bus).

console.log("Base xG:", xG1, xG2);

// We want to formulate a dynamic multiplier.
// m1 = modifier for Team 1
// m2 = modifier for Team 2

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

for (let point of testPoints) {
    const decay = getShare(point.m, point.m <= 45 ? 1 : 2);
    const goalDiff = -1; // Team 1 is losing by 1
    
    // Formula idea:
    // When a team is losing, their intensity increases, but it's bounded.
    // When a team is winning, their intensity decreases.
    
    // Let's test a simple formula
    let m1 = 1.0;
    let m2 = 1.0;
    
    if (goalDiff < 0) {
       // Team 1 is losing
       m1 = 1.0 + (xG1 / xG2) * 0.15; // The stronger they are relative to opponent, the harder they push
       m2 = 1.0 - 0.40; // The winning team drops off significantly
    }
    
    // Try to calculate with this
    let rem_xG1 = xG1 * decay * m1;
    let rem_xG2 = xG2 * decay * m2;
    
    const full = calculateMatchOutcomes(rem_xG1, rem_xG2, 0, 1);
            
    const calcP1 = 1 / (full.p1 * marginSum);
    const calcX = 1 / (full.x * marginSum);
    const calcP2 = 1 / (full.p2 * marginSum);
    
    console.log(`Min ${point.m}: calcP1=${calcP1.toFixed(2)} (actual ${point.p1}), calcX=${calcX.toFixed(2)} (actual ${point.x}), calcP2=${calcP2.toFixed(2)} (actual ${point.p2})`);
}

