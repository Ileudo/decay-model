import { solvePreMatch, calculateMatchOutcomes, getShare } from './src/lib/math.ts';
const pre = solvePreMatch(3.36, 2.62, 2.32, 1.93, 1.78, 2.00);
let rem_xG1 = pre.xG1 * getShare(24);
let rem_xG2 = pre.xG2 * getShare(24);
let r = calculateMatchOutcomes(rem_xG1, rem_xG2, 0, 0, pre.rho);
console.log(`Pre-match Win% (T2): ${(pre.trueP2*100).toFixed(1)}%`);
console.log(`Pure Remainder Win% (T2): ${(r.p2*100).toFixed(1)}%`);
