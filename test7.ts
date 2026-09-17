import { calculateMatchOutcomes } from './src/lib/math.ts';

let bestErr = Infinity, best_xG1 = 0, best_xG2 = 0;
// Force xG1 + xG2 ~ 1.46
for (let xg1 = 0.1; xg1 <= 1.46; xg1 += 0.05) {
  let xg2 = 1.46 - xg1;
  let rem = calculateMatchOutcomes(xg1, xg2, 0, 0, 1.24); 
  // We want R_1 = 0.32
  let err = Math.abs(rem.p1 - 0.32);
  if (err < bestErr) {
    bestErr = err;
    best_xG1 = xg1;
    best_xG2 = xg2;
  }
}
let r = calculateMatchOutcomes(best_xG1, best_xG2, 0, 0, 1.24);
console.log(`Min Err: ${bestErr.toFixed(4)}`);
console.log(`xG1: ${best_xG1.toFixed(2)}, xG2: ${best_xG2.toFixed(2)}`);
console.log(`R_1: ${r.p1.toFixed(3)}, R_X: ${r.x.toFixed(3)}, R_2: ${r.p2.toFixed(3)}`);

let full = calculateMatchOutcomes(best_xG1, best_xG2, 0, 1, 1.24);
console.log(`Full: P1=${full.p1.toFixed(3)}, X=${full.x.toFixed(3)}, P2=${full.p2.toFixed(3)}`);
