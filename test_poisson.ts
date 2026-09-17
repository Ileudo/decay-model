import { calculateMatchOutcomes } from './src/lib/math.ts';

let targetR1 = 0.320;
let targetRX = 0.280;
let targetR2 = 0.400;

let bestErr = Infinity;
let best_xG1 = 0, best_xG2 = 0;

for (let xg1 = 0.1; xg1 <= 3.0; xg1 += 0.05) {
  for (let xg2 = 0.1; xg2 <= 3.0; xg2 += 0.05) {
    let r = calculateMatchOutcomes(xg1, xg2, 0, 0, 1.24); // rho doesn't matter too much but let's use 1.24
    let err = Math.abs(r.p1 - targetR1) + Math.abs(r.x - targetRX) + Math.abs(r.p2 - targetR2);
    if (err < bestErr) {
      bestErr = err;
      best_xG1 = xg1;
      best_xG2 = xg2;
    }
  }
}

let r = calculateMatchOutcomes(best_xG1, best_xG2, 0, 0, 1.24);
console.log(`To get R1=32%, RX=28%, R2=40%:`);
console.log(`xG1=${best_xG1.toFixed(3)}, xG2=${best_xG2.toFixed(3)} (Min Err: ${bestErr.toFixed(4)})`);
console.log(`Actual R1=${r.p1.toFixed(3)}, RX=${r.x.toFixed(3)}, R2=${r.p2.toFixed(3)}`);

// Let's also check what 1X2 would be if these xG were true
let full = calculateMatchOutcomes(best_xG1, best_xG2, 0, 1, 1.24);
console.log(`\nIf this was true, Full Match Probs would be:`);
console.log(`P1=${full.p1.toFixed(3)}, X=${full.x.toFixed(3)}, P2=${full.p2.toFixed(3)}`);
console.log(`With 11.6% margin, Odds would be:`);
console.log(`P1=${(1 / (full.p1 * 1.116)).toFixed(2)}, X=${(1 / (full.x * 1.116)).toFixed(2)}, P2=${(1 / (full.p2 * 1.116)).toFixed(2)}`);

