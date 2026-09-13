import { calculateMatchOutcomes, poisson, findLambdas } from './src/lib/math.ts';

const pmP1 = 12.43;
const pmX = 6.34;
const pmP2 = 1.215;
const marginSum = (1 / pmP1) + (1 / pmX) + (1 / pmP2);
const trueP1 = (1 / pmP1) / marginSum;
const trueX = (1 / pmX) / marginSum;
const trueP2 = (1 / pmP2) / marginSum;
const { xG1, xG2 } = findLambdas(trueP1, trueP2);

// From the previous output:
// Base xG: xG1(Brest)=0.63, xG2(PSG)=2.46
// True ratio: xG1/xG2 = 0.25 (Brest is 4x weaker than PSG)

// The optimal multipliers were:
// Min 15: M1=1.32, M2=0.91
// Min 30: M1=1.36, M2=0.85
// Min 45: M1=1.33, M2=0.83
// Min 60: M1=1.77, M2=0.99
// Min 67: M1=1.81, M2=0.98

// My clamp logic: Math.max(0.5, Math.min(3.0, xG1 / xG2))
// Wait! I clamped xG1/xG2 to 0.5. But for Brest, it is 0.25.
// If I use the actual ratio (0.25) without clamping, or clamp lower:
// M1 = 1.40 - 0.26 * 0.25 = 1.335
// M2 = 1.15 - 0.26 * 0.25 = 1.085

// That matches the first half OPTIMAL MULTIPLIERS almost exactly! 
// Optimal Min 45 was M1=1.33, M2=0.83.
// Wait, M2 optimal was 0.83, but formula gives 1.085.
// If PSG's multiplier is 1.085, it means they score too many goals in the simulation, 
// which lowers P1's chances too much (P1=38.76 instead of 27.99).

// Let's refine the M2 formula.
// Match 1 (0.50 underdog winning 0:1): M_winning = 0.70
// Match 2 (0.78 underdog winning 0:1): M_winning = 0.82
// Match 3 (4.00 favorite winning 0:1): M_winning = 0.85 (PSG)

// The relationship for the winning team's multiplier isn't strictly linear!
// It seems the winning team ALWAYS drops below 1.0. 
// A heavy underdog winning parks the bus hard (0.70).
// A slight underdog winning parks less (0.82).
// A heavy favorite winning ALSO slows down (0.85), but doesn't park the bus.

for (let r of [0.5, 0.78, 4.0]) {
    // If r is xG_losing / xG_winning
    // Match 1: losing is fav (1.74 / 1.0) -> r = 1.74
    // Match 2: losing is slight fav (1.28 / 1.0) -> r = 1.28
    // Match 3: losing is massive underdog (0.25 / 1.0) -> r = 0.25
    
    // Let's list the empirical (R, M_losing, M_winning) triplets for the 1st half:
    // R = 1.74 -> M_losing = 0.95, M_winning = 0.70
    // R = 1.28 -> M_losing = 1.11, M_winning = 0.82
    // R = 0.25 -> M_losing = 1.33, M_winning = 0.85
    
    // Look at M_losing: 0.95, 1.11, 1.33. This is perfectly linear!
    // M_losing = 1.40 - 0.26 * R. 
    // R=1.74 -> 1.40 - 0.45 = 0.95. (Exact!)
    // R=1.28 -> 1.40 - 0.33 = 1.07. (Close to 1.11)
    // R=0.25 -> 1.40 - 0.06 = 1.34. (Exact!)
    
    // Look at M_winning: 0.70, 0.82, 0.85. 
    // This is NOT linear. It's asymptotic or logarithmic.
    // Let's try: M_winning = 0.86 - 0.10 * R
    // R=1.74 -> 0.86 - 0.17 = 0.69. (Exact!)
    // R=1.28 -> 0.86 - 0.13 = 0.73. (A bit low, should be 0.82)
    // R=0.25 -> 0.86 - 0.02 = 0.84. (Exact!)
    console.log(`R=${r.toFixed(2)} -> M_losing=${(1.40 - 0.26 * r).toFixed(2)}, M_winning=${(0.86 - 0.10 * r).toFixed(2)}`);
}

