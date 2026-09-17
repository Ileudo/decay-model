import { solvePreMatch, calculateMatchOutcomes, getShare } from './src/lib/math.ts';

const pre = solvePreMatch(3.36, 2.62, 2.32, 1.93, 1.78, 2.00);
const liveMargin = (1/9.06) + (1/4.05) + (1/1.317);

console.log("Pre-match True xG:", pre);

let rem_xG1 = pre.xG1 * getShare(24);
let rem_xG2 = pre.xG2 * getShare(24);

console.log(`Rem xG: xG1=${rem_xG1.toFixed(3)}, xG2=${rem_xG2.toFixed(3)}`);

const rem = calculateMatchOutcomes(rem_xG1, rem_xG2, 0, 0, pre.rho);
console.log(`Remainder True Probs: R1=${(rem.p1*100).toFixed(1)}%, RX=${(rem.x*100).toFixed(1)}%, R2=${(rem.p2*100).toFixed(1)}%`);

// Now full match probs:
const full = calculateMatchOutcomes(rem_xG1, rem_xG2, 0, 1, pre.rho);
console.log(`Full Match True Probs: P1=${(full.p1*100).toFixed(1)}%, X=${(full.x*100).toFixed(1)}%, P2=${(full.p2*100).toFixed(1)}%`);

// Live Odds matching Pinnacle margin
const oddsP1 = 1 / (full.p1 * liveMargin);
const oddsX = 1 / (full.x * liveMargin);
const oddsP2 = 1 / (full.p2 * liveMargin);

console.log(`Model 1X2 (no tactical adjust): P1=${oddsP1.toFixed(2)}, X=${oddsX.toFixed(2)}, P2=${oddsP2.toFixed(2)}`);

// What is the odds for Remainder Away (R2)?
// With margin applied exactly the same way:
const oddsRem2 = 1 / (rem.p2 * liveMargin);
console.log(`Odds for Team 2 winning remainder (AH2 -0.5 live): ${oddsRem2.toFixed(2)}`);

