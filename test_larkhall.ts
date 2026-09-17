import { solvePreMatch, calculateMatchOutcomes, getShare } from './src/lib/math.ts';

const pmP1 = 2.79, pmX = 3.75, pmP2 = 2.05;
const pre = solvePreMatch(pmP1, pmX, pmP2, 1.76, 1.95, 3.00);

const liveMargin = (1/5.73) + (1/4.22) + (1/1.414);

const decayFactor = getShare(12);
const raw_rem_xG1 = pre.xG1 * decayFactor;
const raw_rem_xG2 = pre.xG2 * decayFactor;

const rem = calculateMatchOutcomes(raw_rem_xG1, raw_rem_xG2, 0, 0, pre.rho);
const full = calculateMatchOutcomes(raw_rem_xG1, raw_rem_xG2, 0, 1, pre.rho);

console.log(`Pre-match xG: 1=${pre.xG1.toFixed(2)}, 2=${pre.xG2.toFixed(2)} (Total: ${(pre.xG1+pre.xG2).toFixed(2)})`);
console.log(`Remaining xG (min 12): 1=${raw_rem_xG1.toFixed(2)}, 2=${raw_rem_xG2.toFixed(2)}`);

console.log(`\nIf AH and 1X2 are perfectly coupled (using raw xG):`);
console.log(`Model 1X2 Odds: P1=${(1/(full.p1*liveMargin)).toFixed(2)}, X=${(1/(full.x*liveMargin)).toFixed(2)}, P2=${(1/(full.p2*liveMargin)).toFixed(2)}`);
console.log(`Actual 1X2 Odds: P1=5.73, X=4.22, P2=1.414`);

const ahMarginSum = 1 + ((liveMargin - 1) * 0.8);
console.log(`Model AH2(-0.5) Odds: ${(Math.max(1.01, 1 / (rem.p2 * ahMarginSum))).toFixed(2)}`);
console.log(`Actual AH2(-0.5) Odds: 2.12`);
