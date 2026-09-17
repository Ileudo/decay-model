import { calculateMatchOutcomes } from './src/lib/math.ts';

const targetP1 = 0.098;
const targetX = 0.221;
const targetP2 = 0.680;
const targetR2 = 0.396; // 2.40 with 5% margin => 0.396

let bestErr = Infinity;
let best_xG1 = 0, best_xG2 = 0;

for (let xg1 = 0.1; xg1 <= 3.0; xg1 += 0.01) {
  for (let xg2 = 0.1; xg2 <= 3.0; xg2 += 0.01) {
    let rem = calculateMatchOutcomes(xg1, xg2, 0, 0, 1.24);
    let full = calculateMatchOutcomes(xg1, xg2, 0, 1, 1.24);
    
    let err = Math.abs(full.p1 - targetP1) + Math.abs(full.x - targetX) + Math.abs(full.p2 - targetP2) + Math.abs(rem.p2 - targetR2);
    if (err < bestErr) {
      bestErr = err;
      best_xG1 = xg1;
      best_xG2 = xg2;
    }
  }
}

let rem = calculateMatchOutcomes(best_xG1, best_xG2, 0, 0, 1.24);
let full = calculateMatchOutcomes(best_xG1, best_xG2, 0, 1, 1.24);

console.log(`xG1=${best_xG1.toFixed(3)}, xG2=${best_xG2.toFixed(3)} (Err: ${bestErr.toFixed(4)})`);
console.log(`Remainder: R1=${(rem.p1).toFixed(3)}, RX=${(rem.x).toFixed(3)}, R2=${(rem.p2).toFixed(3)}`);
console.log(`Full: P1=${(full.p1).toFixed(3)}, X=${(full.x).toFixed(3)}, P2=${(full.p2).toFixed(3)}`);

