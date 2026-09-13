import { calculateMatchOutcomes, poisson, findLambdas } from './src/lib/math.ts';

// Let's create a blended formula!
// Match 1 (Heavy Favorite, P1=1.82, xG1/xG2 = 1.74):
// M1 ~ 0.95, M2 ~ 0.70

// Match 2 (Slight Favorite, P1=2.15, xG1/xG2 = 1.28):
// M1 ~ 1.11, M2 ~ 0.82

// Notice how the SLIGHT favorite pushes MUCH harder (M1=1.11) compared to the HEAVY favorite (M1=0.95).
// Why? Because a heavy favorite already has a huge baseline xG! If you multiply a huge baseline by 1.11, it becomes absurdly high.
// Pinnacle seems to cap the total absolute xG output.
// Also, the heavy underdog (Match 1) parks the bus much harder (M2=0.70) than the slight underdog (Match 2) (M2=0.82).

const preMatchData = [
  { p1: 1.826, x: 3.49, p2: 4.35, targetM1: 0.95, targetM2: 0.70 },
  { p1: 2.150, x: 3.47, p2: 3.20, targetM1: 1.11, targetM2: 0.82 }
];

for (let pm of preMatchData) {
    const marginSum = (1 / pm.p1) + (1 / pm.x) + (1 / pm.p2);
    const trueP1 = (1 / pm.p1) / marginSum;
    const trueX = (1 / pm.x) / marginSum;
    const trueP2 = (1 / pm.p2) / marginSum;
    const { xG1, xG2 } = findLambdas(trueP1, trueP2);
    const strengthRatio = xG1 / xG2;
    
    console.log(`P1=${pm.p1} | Ratio: ${strengthRatio.toFixed(2)} | Target M1: ${pm.targetM1}, Target M2: ${pm.targetM2}`);
    
    // Formula for M1 (Losing team):
    // As strength ratio increases (heavy fav), M1 drops!
    // Let's try: M1 = 1.25 - 0.20 * (xG1/xG2)
    // For Match 1: 1.25 - 0.20 * 1.74 = 1.25 - 0.35 = 0.90
    // For Match 2: 1.25 - 0.20 * 1.28 = 1.25 - 0.25 = 1.00
    // Let's adjust constants:
    const calcM1 = 1.40 - (0.26 * strengthRatio);
    
    // Formula for M2 (Winning team):
    // As strength ratio increases (they are a heavy underdog), they park the bus harder (M2 drops).
    // Let's try: M2 = 1.15 - 0.26 * (xG1/xG2)
    const calcM2 = 1.15 - (0.26 * strengthRatio);
    
    console.log(`Calculated -> M1: ${calcM1.toFixed(2)}, M2: ${calcM2.toFixed(2)}`);
}

