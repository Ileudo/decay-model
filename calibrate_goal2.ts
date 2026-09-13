import { calculateMatchOutcomes, poisson, findLambdas } from './src/lib/math.ts';

// We need to look closely at how Pinnacle handles the Poisson distribution.
// Often, the simple Poisson model underestimates draws.
// Let's check how Pinnacle's odds look using Dixon-Coles rho factor.

const pmP1 = 1.826;
const pmX = 3.49;
const pmP2 = 4.35;

const marginSum = (1 / pmP1) + (1 / pmX) + (1 / pmP2);
const trueP1 = (1 / pmP1) / marginSum;
const trueX = (1 / pmX) / marginSum;
const trueP2 = (1 / pmP2) / marginSum;

console.log("True Probs:", trueP1, trueX, trueP2);

const testPoints = [
  { m: 17, p1: 3.86, x: 3.21, p2: 1.99 },
  { m: 30, p1: 4.7, x: 3.26, p2: 1.833 },
  { m: 45, p1: 3.02, x: 2.75, p2: 2.64 }, // adjusted HT odds based on stable block
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

// What if the market operates primarily on probability manipulation rather than just xG manipulation?
// Let's see the implied probabilities of the live odds.

for (let point of testPoints) {
    const impP1 = (1 / point.p1) / marginSum;
    const impX = (1 / point.x) / marginSum;
    const impP2 = (1 / point.p2) / marginSum;
    
    console.log(`Min ${point.m}: Live Probs -> P1: ${impP1.toFixed(3)}, X: ${impX.toFixed(3)}, P2: ${impP2.toFixed(3)}`);
}

