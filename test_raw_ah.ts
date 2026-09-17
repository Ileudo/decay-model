import { solvePreMatch, calculateMatchOutcomes, getShare } from './src/lib/math.ts';

const pmP1 = 3.36, pmX = 2.62, pmP2 = 2.32;
const pre = solvePreMatch(pmP1, pmX, pmP2, 1.93, 1.78, 2.00);
const liveMargin = (1/9.06) + (1/4.05) + (1/1.317);
const ahMarginSum = 1 + ((liveMargin - 1) * 0.8);

const decayFactor = getShare(24);
const raw_rem_xG1 = pre.xG1 * decayFactor;
const raw_rem_xG2 = pre.xG2 * decayFactor;

const rem = calculateMatchOutcomes(raw_rem_xG1, raw_rem_xG2, 0, 0, pre.rho);

const trueAH2_05 = rem.p2;
const ah2_05 = Math.max(1.01, 1 / (trueAH2_05 * ahMarginSum));

console.log(`With raw remaining xG: AH2(-0.5) = ${ah2_05.toFixed(2)}`);

