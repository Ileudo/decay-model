import { calculateMatchOutcomes } from './src/lib/math.ts';

// Larkhall live 1X2: 5.73, 4.22, 1.414 -> Margin 11.7%
// True P1 = 15.5%, True X = 21.1%, True P2 = 63.2%
// True P2 is composed of: Remainder Draw (RX) + Remainder Away Win (R2)

// Larkhall live AH2(-0.5) Remainder: 2.12 -> Margin ~5%
// True R2 = 1 / (2.12 * 1.05) = 44.9%

// If True P2 = 63.2% and R2 = 44.9%, then RX must be 63.2% - 44.9% = 18.3%
// If True X = 21.1%, it means the probability of Home winning the remainder by EXACTLY 1 goal is 21.1%

let bestErr = Infinity;
let best_xG1 = 0, best_xG2 = 0;

for (let xg1 = 0.1; xg1 <= 3.0; xg1 += 0.01) {
    for (let xg2 = 0.1; xg2 <= 3.0; xg2 += 0.01) {
        let r = calculateMatchOutcomes(xg1, xg2, 0, 0, 1.0);
        let f = calculateMatchOutcomes(xg1, xg2, 0, 1, 1.0);
        
        let err = Math.abs(r.p2 - 0.449) + Math.abs(f.x - 0.211) + Math.abs(f.p2 - 0.632);
        if (err < bestErr) {
            bestErr = err;
            best_xG1 = xg1;
            best_xG2 = xg2;
        }
    }
}
console.log(`Trying to fit mathematically: R2=44.9%, X_full=21.1%, P2_full=63.2% (so RX=18.3%)`);
console.log(`Best fit xG1=${best_xG1.toFixed(2)}, xG2=${best_xG2.toFixed(2)} (Error: ${bestErr.toFixed(4)})`);
let optR = calculateMatchOutcomes(best_xG1, best_xG2, 0, 0, 1.0);
console.log(`With these xGs: RX=${(optR.x*100).toFixed(1)}% (We needed ~18.3%)`);
console.log(`With these xGs: R1=${(optR.p1*100).toFixed(1)}%`);
console.log(`But if RX is ~27% and R2 is 44.9%, P2_full becomes ~72% (1.38 odds or lower without margin)!`);

