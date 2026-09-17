import { solvePreMatch, calculateMatchOutcomes, getShare } from './src/lib/math.ts';

const pre = solvePreMatch(3.36, 2.62, 2.32, 1.93, 1.78, 2.00);

let rem_xG1 = pre.xG1 * getShare(24);
let rem_xG2 = pre.xG2 * getShare(24);

console.log("Rem xG1:", rem_xG1, "Rem xG2:", rem_xG2);
let remOutcomes = calculateMatchOutcomes(rem_xG1, rem_xG2, 0, 0, pre.rho);
console.log("Rem outcomes (no tactical adjust):", remOutcomes);

// With tactical adjust (score 0:1, diff = -1)
let mLosing = 1.0;
let mWinning = 0.6;
let adj_xG1 = rem_xG1 * mLosing;
let adj_xG2 = rem_xG2 * mWinning;
console.log("Adj xG1:", adj_xG1, "Adj xG2:", adj_xG2);
let adjOutcomes = calculateMatchOutcomes(adj_xG1, adj_xG2, 0, 0, pre.rho);
console.log("Adj outcomes:", adjOutcomes);
