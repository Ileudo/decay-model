import { calculateMatchOutcomes, solvePreMatch, getShare } from './src/lib/math.ts';
let bestErr = Infinity, best_xG1 = 0, best_xG2 = 0;
for (let xg1 = 0.1; xg1 <= 3.0; xg1 += 0.01) {
  for (let xg2 = 0.1; xg2 <= 3.0; xg2 += 0.01) {
    let f = calculateMatchOutcomes(xg1, xg2, 0, 1, 1.24);
    let err = Math.abs(f.p1 - 0.098) + Math.abs(f.x - 0.221) + Math.abs(f.p2 - 0.680);
    if (err < bestErr) {
      bestErr = err;
      best_xG1 = xg1;
      best_xG2 = xg2;
    }
  }
}
let optF = calculateMatchOutcomes(best_xG1, best_xG2, 0, 1, 1.24);
let optR = calculateMatchOutcomes(best_xG1, best_xG2, 0, 0, 1.24);
console.log(`To exactly match Pinnacle 1X2 line (9.06 / 4.05 / 1.317):`);
console.log(`xG1=${best_xG1.toFixed(3)}, xG2=${best_xG2.toFixed(3)} (Err: ${bestErr.toFixed(4)})`);
console.log(`Full Match: P1=${optF.p1.toFixed(3)}, X=${optF.x.toFixed(3)}, P2=${optF.p2.toFixed(3)}`);
console.log(`Implied Remainder: R1=${optR.p1.toFixed(3)}, RX=${optR.x.toFixed(3)}, R2=${optR.p2.toFixed(3)}`);
console.log(`Implied Odds for R2 (with 5% margin): ${(1 / (optR.p2 * 1.05)).toFixed(2)}`);
