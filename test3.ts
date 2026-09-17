import { solvePreMatch, calculateLiveOdds } from './src/lib/math.ts';

const pre = solvePreMatch(3.36, 2.62, 2.32, 1.93, 1.78, 2.00);
const liveMargin = (1/9.06) + (1/4.05) + (1/1.317);

const live = calculateLiveOdds(pre.xG1, pre.xG2, pre.rho, 0, 1, 24, liveMargin, 1, 1, 1);
// F2(-1.5) for the whole match means Team 2 wins by 2 or more goals.
// This is exactly the same as Team 2 winning the REMAINDER of the match by at least 1 goal!
// Because score is 0:1, so to win by 2+ goals, they need to score 1+ more goal than Team 1 from now on.
// So F2(-1.5) whole match === AH2(-0.5) remainder!!!
console.log(`AH2(-0.5) remainder (which is F2(-1.5) whole match): ${live.ah2_05.toFixed(2)}`);
