import { solvePreMatch, calculateLiveOdds } from './src/lib/math.ts';

const pre = solvePreMatch(3.36, 2.62, 2.32, 1.93, 1.78, 2.00);
const liveMargin = (1/9.06) + (1/4.05) + (1/1.317);

const live = calculateLiveOdds(pre.xG1, pre.xG2, pre.rho, 0, 1, 24, liveMargin, 1, 1, 1);
console.log(`AH2(-0.5) Live (model): ${live.ah2_05.toFixed(2)}`);
console.log(`1X2: P1=${live.p1.toFixed(2)} X=${live.x.toFixed(2)} P2=${live.p2.toFixed(2)}`);
