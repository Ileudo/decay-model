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

// In this match, the winning team (underdog) parked the bus exceptionally hard (M1=0.50 in the first half).
// And the favorite pressed exceptionally hard (M2=1.24).
// In Estonia match (also underdog winning 1-0), M1=0.76, M2=1.11.
// So there is some variance.
// Let's modify the formula to account for lower baseline xG totals.
// Wait, what if this match had a RED CARD early?
// If a red card happened, say to the winning team, they would sit deeper (M1 drops), and the losing team would attack more (M2 rises).
// If a red card happened, say to the losing team, their M2 would drop.
// The fact that M1 drops to 0.50 while M2 rises to 1.24 implies:
// EITHER: The winning team got a red card.
// OR: It's just extreme tactical shift.

// However, notice the gap between the formula output and actual:
// Min 45: Formula -> P1=1.61, X=3.56, P2=4.73
// Min 45: Actual  -> P1=1.94, X=3.07, P2=3.65

// The actual odds are much more "conservative", keeping P2 chances alive!
// P1=1.94 is much worse for Team 1 than the formula's P1=1.61.
// This means Pinnacle thinks Team 1's lead is much more fragile in this match than our formula thinks.
// Could it be a red card to Team 1? Yes! If Team 1 got a red card, they are severely disadvantaged, so their chances of holding on to the lead are lower. P1=1.94 vs P1=1.61 perfectly matches a red card for the winning team!

// Let's try simulating a red card for Team 1.
// A red card typically reduces xG by ~40-50%.
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
    
    // Simulate Red Card for Winning Team (Team 1)
    mWinningInv *= 0.60; // 40% drop in attacking capability
    mLosingInv *= 1.20; // 20% boost to losing team's attack (since they have a man advantage)
    
    let rem_xG1 = xG1 * decay * mWinningInv;
    let rem_xG2 = xG2 * decay * mLosingInv;
    
    const full = calculateMatchOutcomes(rem_xG1, rem_xG2, 1, 0);
    const calcP1 = 1 / (full.p1 * marginSum);
    const calcX = 1 / (full.x * marginSum);
    const calcP2 = 1 / (full.p2 * marginSum);
    
    console.log(`Min ${point.m}: Red Card Formula -> P1=${calcP1.toFixed(2)} X=${calcX.toFixed(2)} P2=${calcP2.toFixed(2)} | Actual P1=${point.p1} X=${point.x} P2=${point.p2}`);
}

