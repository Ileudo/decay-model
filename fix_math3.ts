import { calculateMatchOutcomes, getShare, solvePreMatch } from './src/lib/math.ts';

const pre = solvePreMatch(3.36, 2.62, 2.32, 1.93, 1.78, 2.00);

let rem_xG1 = pre.xG1 * getShare(24);
let rem_xG2 = pre.xG2 * getShare(24);
let rem = calculateMatchOutcomes(rem_xG1, rem_xG2, 0, 0, pre.rho);
let full = calculateMatchOutcomes(rem_xG1, rem_xG2, 0, 1, pre.rho);

console.log(`With base model:`)
console.log(`Rem: R1=${rem.p1.toFixed(3)}, RX=${rem.x.toFixed(3)}, R2=${rem.p2.toFixed(3)}`);
console.log(`Full Match: P1=${full.p1.toFixed(3)}, X=${full.x.toFixed(3)}, P2=${full.p2.toFixed(3)}`);

console.log("\nIf bot odds is 2.40 for R2 (with 5% margin), true R2 ~ 39.6% (0.396)");
console.log("If target P1=0.098, X=0.221, P2=0.680 (from 9.06 / 4.05 / 1.317 with 11.6% margin):")

let bestErr = Infinity;
let best_xG1 = 0, best_xG2 = 0;
for (let xg1 = 0.1; xg1 <= 3.0; xg1 += 0.01) {
  for (let xg2 = 0.1; xg2 <= 3.0; xg2 += 0.01) {
    let r = calculateMatchOutcomes(xg1, xg2, 0, 0, pre.rho);
    let f = calculateMatchOutcomes(xg1, xg2, 0, 1, pre.rho);
    let err = Math.abs(f.p1 - 0.098) + Math.abs(f.x - 0.221) + Math.abs(f.p2 - 0.680) + Math.abs(r.p2 - 0.396);
    if (err < bestErr) {
      bestErr = err;
      best_xG1 = xg1;
      best_xG2 = xg2;
    }
  }
}
let optR = calculateMatchOutcomes(best_xG1, best_xG2, 0, 0, pre.rho);
let optF = calculateMatchOutcomes(best_xG1, best_xG2, 0, 1, pre.rho);
console.log(`\nGrid Search Best fit:`);
console.log(`xG1=${best_xG1.toFixed(3)}, xG2=${best_xG2.toFixed(3)} (Err: ${bestErr.toFixed(4)})`);
console.log(`Rem: R1=${optR.p1.toFixed(3)}, RX=${optR.x.toFixed(3)}, R2=${optR.p2.toFixed(3)}`);
console.log(`Full Match: P1=${optF.p1.toFixed(3)}, X=${optF.x.toFixed(3)}, P2=${optF.p2.toFixed(3)}`);

