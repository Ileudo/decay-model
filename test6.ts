import { calculateMatchOutcomes } from './src/lib/math.ts';

let bestErr = Infinity, best_xG1 = 0, best_xG2 = 0;
for (let xg1 = 0.1; xg1 <= 5.0; xg1 += 0.05) {
  for (let xg2 = 0.1; xg2 <= 5.0; xg2 += 0.05) {
    let rem = calculateMatchOutcomes(xg1, xg2, 0, 0, 1.24); 
    let err = Math.abs(rem.p1 - 0.32) + Math.abs(rem.x - 0.30) + Math.abs(rem.p2 - 0.38);
    if (err < bestErr) {
      bestErr = err;
      best_xG1 = xg1;
      best_xG2 = xg2;
    }
  }
}
let r = calculateMatchOutcomes(best_xG1, best_xG2, 0, 0, 1.24);
console.log(`Min Err: ${bestErr.toFixed(4)}`);
console.log(`xG1: ${best_xG1.toFixed(2)}, xG2: ${best_xG2.toFixed(2)}`);
console.log(`R_1: ${r.p1.toFixed(3)}, R_X: ${r.x.toFixed(3)}, R_2: ${r.p2.toFixed(3)}`);

let full = calculateMatchOutcomes(best_xG1, best_xG2, 0, 1, 1.24);
console.log(`Full: P1=${full.p1.toFixed(3)}, X=${full.x.toFixed(3)}, P2=${full.p2.toFixed(3)}`);
