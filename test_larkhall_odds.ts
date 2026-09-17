import { solvePreMatch, calculateLiveOdds } from './src/lib/math.ts';

const pre = solvePreMatch(2.79, 3.75, 2.05, 1.76, 1.95, 3.00);
const liveMargin = (1/5.73) + (1/4.22) + (1/1.414);

// Test raw:
const raw = calculateLiveOdds(pre.xG1, pre.xG2, pre.rho, 0, 1, 12, liveMargin, 1, 1, 1);
console.log(`Raw 1X2: P1=${raw.p1.toFixed(2)}, X=${raw.x.toFixed(2)}, P2=${raw.p2.toFixed(2)}`);

// Test auto:
const auto = calculateLiveOdds(pre.xG1, pre.xG2, pre.rho, 0, 1, 12, liveMargin, 0.89, 1.19, 1);
console.log(`Auto 1X2: P1=${auto.p1.toFixed(2)}, X=${auto.x.toFixed(2)}, P2=${auto.p2.toFixed(2)}`);

