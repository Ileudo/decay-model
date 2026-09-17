import { calculateMatchOutcomes } from './src/lib/math.ts';

const targetP1 = 0.098;
const targetX = 0.221;
const targetP2 = 0.680;
const targetR2 = 0.380; // F2(-0.5) remainder = 2.40 => true prob ~ 0.38

let bestErr = Infinity;
let bestR1 = 0, bestRX = 0, bestR2 = 0;
let best_xG1 = 0, best_xG2 = 0;

for (let xg1 = 0.1; xg1 <= 3.0; xg1 += 0.05) {
  for (let xg2 = 0.1; xg2 <= 3.0; xg2 += 0.05) {
    let rem = calculateMatchOutcomes(xg1, xg2, 0, 0, 1.24); // R_1, R_X, R_2
    // We want rem.p1 + rem.x + rem.p2 = 1
    
    // Now calculate full match probabilities given score 0:1
    let full = calculateMatchOutcomes(xg1, xg2, 0, 1, 1.24);
    
    let err = Math.abs(full.p1 - targetP1) + Math.abs(full.x - targetX) + Math.abs(full.p2 - targetP2) + Math.abs(rem.p2 - targetR2);
    if (err < bestErr) {
      bestErr = err;
      bestR1 = rem.p1;
      bestRX = rem.x;
      bestR2 = rem.p2;
      best_xG1 = xg1;
      best_xG2 = xg2;
    }
  }
}

console.log(`Best error: ${bestErr.toFixed(4)}`);
console.log(`xG1: ${best_xG1.toFixed(2)}, xG2: ${best_xG2.toFixed(2)}`);
console.log(`R_1: ${bestR1.toFixed(3)}, R_X: ${bestRX.toFixed(3)}, R_2: ${bestR2.toFixed(3)}`);
let full = calculateMatchOutcomes(best_xG1, best_xG2, 0, 1, 1.24);
console.log(`Full: P1=${full.p1.toFixed(3)}, X=${full.x.toFixed(3)}, P2=${full.p2.toFixed(3)}`);

