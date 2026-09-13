import { calculateMatchOutcomes, poisson, findLambdas } from './src/lib/math.ts';

const pmP1 = 1.826;
const pmX = 3.49;
const pmP2 = 4.35;
const marginSum = (1 / pmP1) + (1 / pmX) + (1 / pmP2);
const trueP1 = (1 / pmP1) / marginSum;
const trueX = (1 / pmX) / marginSum;
const trueP2 = (1 / pmP2) / marginSum;
const { xG1, xG2 } = findLambdas(trueP1, trueP2);

const testPoints = [
  { m: 17, p1: 3.86, x: 3.21, p2: 1.99 },
  { m: 30, p1: 4.7, x: 3.26, p2: 1.833 },
  { m: 45, p1: 3.02, x: 2.75, p2: 2.64 }, // HT odds jump
  { m: 60, p1: 4.58, x: 2.67, p2: 2.08 },
  { m: 75, p1: 9.50, x: 3.10, p2: 1.55 },
  { m: 85, p1: 24.08, x: 4.50, p2: 1.24 }
];

function getShare(minute: number, period: 1 | 2 = minute <= 45 ? 1 : 2): number {
  if (period === 1) {
    const safeMinute = Math.min(minute, 47.499);
    return 0.61 + 0.39 * ((47.5 - safeMinute) / 47.5);
  } else {
    const safeMinute = Math.min(minute, 93.999);
    const r = (94.0 - safeMinute) / 49.0;
    const cliff = 0.15 * (1.0 - Math.min(1.0, r / 0.3));
    return 0.61 * Math.pow(r, 0.85 + cliff);
  }
}

// In calibrate_goal5 we found the exact optimal multipliers for these specific minutes:
// Min 17: M1=0.96, M2=0.69 
// Min 30: M1=0.97, M2=0.79 
// Min 45: M1=1.33, M2=0.29 
// Min 60: M1=1.35, M2=0.19 
// Min 75: M1=1.40, M2=0.31 
// Min 85: M1=1.75, M2=1.38

// Notice a pattern:
// 1. In the first half, the multipliers are basically flat! M1 ~ 1.0, M2 ~ 0.75. 
// The game state barely changes the favorite's attacking output, but the underdog defends a bit more.
// 2. AT HALFTIME, a massive tactical shift occurs. M1 jumps to ~1.35. M2 drops to ~0.25 (pure parking the bus).
// 3. Late in the game (85+), M2 shoots back up to 1.38 (counter-attacks / desperation / model breaking down).

for (let point of testPoints) {
    const decay = getShare(point.m, point.m <= 45 ? 1 : 2);
    
    let m1 = 1.0;
    let m2 = 1.0;
    
    if (point.m <= 45) {
        m1 = 1.0;
        m2 = 0.75;
    } else {
        // Second half
        // M1 is around 1.35, rising slowly to 1.75 at the very end
        const t2 = (point.m - 45) / 45.0; // 0.0 to 1.0 in second half
        m1 = 1.35 + (t2 * t2 * 0.4); // accelerates at the end
        
        // M2 is very low (0.2), rising sharply at the end
        m2 = 0.25 + (Math.pow(t2, 4) * 1.15); // Stays low until very end
    }
    
    let rem_xG1 = xG1 * decay * m1;
    let rem_xG2 = xG2 * decay * m2;
    
    // Check if it fits
    const full = calculateMatchOutcomes(rem_xG1, rem_xG2, 0, 1);
            
    const calcP1 = 1 / (full.p1 * marginSum);
    const calcX = 1 / (full.x * marginSum);
    const calcP2 = 1 / (full.p2 * marginSum);
    
    const err = Math.abs(calcP1 - point.p1) / point.p1 + 
                Math.abs(calcX - point.x) / point.x + 
                Math.abs(calcP2 - point.p2) / point.p2;
    
    console.log(`Min ${point.m}: calcP1=${calcP1.toFixed(2)}(${point.p1}), calcX=${calcX.toFixed(2)}(${point.x}), calcP2=${calcP2.toFixed(2)}(${point.p2}) | Err: ${(err*100).toFixed(1)}%`);
}

