import { calculateMatchOutcomes } from './src/lib/math.ts';
let xG1 = 0.74;
let xG2 = 0.59;
let r = calculateMatchOutcomes(xG1, xG2, 0, 0, 1.24);
console.log(`Low xG Remainder: R1=${(r.p1*100).toFixed(1)}%, RX=${(r.x*100).toFixed(1)}%, R2=${(r.p2*100).toFixed(1)}%`);

let full = calculateMatchOutcomes(xG1, xG2, 0, 1, 1.24);
console.log(`Low xG Full: P1=${(full.p1*100).toFixed(1)}%, X=${(full.x*100).toFixed(1)}%, P2=${(full.p2*100).toFixed(1)}%`);

console.log(`Odds with 11.6% margin:`);
console.log(`P1=${(1 / (full.p1 * 1.116)).toFixed(2)}`);
console.log(`X =${(1 / (full.x * 1.116)).toFixed(2)}`);
console.log(`P2=${(1 / (full.p2 * 1.116)).toFixed(2)}`);

