import { solvePreMatch, calculateMatchOutcomes, getShare } from './src/lib/math.ts';

const pre = solvePreMatch(3.36, 2.62, 2.32, 1.93, 1.78, 2.00);

let rem_xG1 = pre.xG1 * getShare(24);
let rem_xG2 = pre.xG2 * getShare(24);
let mLosing = 1.0;
let mWinning = 0.6;
rem_xG1 *= mLosing;
rem_xG2 *= mWinning;

let rem = calculateMatchOutcomes(rem_xG1, rem_xG2, 0, 0, pre.rho);
console.log("My Model Remainder True Probs:");
console.log(`R_1: ${(rem.p1*100).toFixed(1)}%`);
console.log(`R_X: ${(rem.x*100).toFixed(1)}%`);
console.log(`R_2: ${(rem.p2*100).toFixed(1)}%`);
console.log(`P2_full (R_X + R_2): ${((rem.x + rem.p2)*100).toFixed(1)}%`);
