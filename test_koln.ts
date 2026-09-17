import { solvePreMatch, calculateMatchOutcomes, getShare } from './src/lib/math.ts';

const pre = solvePreMatch(2.85, 3.5, 2.42, 1.86, 1.97, 2.50);
console.log(`Pre-match xG: 1=${pre.xG1.toFixed(2)}, 2=${pre.xG2.toFixed(2)}, total=${(pre.xG1+pre.xG2).toFixed(2)}, rho=${pre.rho.toFixed(2)}`);

const liveMargin = (1/6.88) + (1/4.1) + (1/1.46);
console.log(`Live 1X2 Margin: ${((liveMargin - 1)*100).toFixed(2)}%`);
const true_live_p1 = (1/6.88) / liveMargin;
const true_live_x = (1/4.1) / liveMargin;
const true_live_p2 = (1/1.46) / liveMargin;
console.log(`Live True Probs: P1=${(true_live_p1*100).toFixed(1)}%, X=${(true_live_x*100).toFixed(1)}%, P2=${(true_live_p2*100).toFixed(1)}%`);

const ah_odds = 2.49;
const ahMarginSum = 1 + ((liveMargin - 1) * 0.8);
const true_rem_2 = (1/ah_odds) / ahMarginSum;
console.log(`Live AH Margin (Est): ${((ahMarginSum - 1)*100).toFixed(2)}%`);
console.log(`Live True AH2(-0.5) (R2): ${(true_rem_2*100).toFixed(1)}%`);

const implied_rem_x = true_live_p2 - true_rem_2;
console.log(`Implied Remainder X: ${(implied_rem_x*100).toFixed(1)}%`);

const decayFactor = getShare(14);
const rem_xG1 = pre.xG1 * decayFactor;
const rem_xG2 = pre.xG2 * decayFactor;
console.log(`\nModel Remaining xG (min 14): 1=${rem_xG1.toFixed(2)}, 2=${rem_xG2.toFixed(2)}`);

const r = calculateMatchOutcomes(rem_xG1, rem_xG2, 0, 0, pre.rho);
const f = calculateMatchOutcomes(rem_xG1, rem_xG2, 0, 1, pre.rho);

console.log(`Model True Probs (Remainder): R1=${(r.p1*100).toFixed(1)}%, RX=${(r.x*100).toFixed(1)}%, R2=${(r.p2*100).toFixed(1)}%`);
console.log(`Model True Probs (Full 1X2): P1=${(f.p1*100).toFixed(1)}%, X=${(f.x*100).toFixed(1)}%, P2=${(f.p2*100).toFixed(1)}%`);

console.log(`\nModel Output Odds (with live margin):`);
console.log(`P1 = ${(1/(f.p1 * liveMargin)).toFixed(2)}`);
console.log(`X  = ${(1/(f.x * liveMargin)).toFixed(2)}`);
console.log(`P2 = ${(1/(f.p2 * liveMargin)).toFixed(2)}`);
console.log(`AH2(-0.5) = ${(1/(r.p2 * ahMarginSum)).toFixed(2)}`);

