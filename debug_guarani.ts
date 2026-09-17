import { solvePreMatch, calculateLiveOdds, autoCalibrate } from './src/lib/math.ts';

const pre = solvePreMatch(3.36, 2.62, 2.32, 1.93, 1.78, 2.00);
console.log("Pre-match result:", pre);

const min = 24;
const score1 = 0, score2 = 1;
const liveP1 = 9.06, liveX = 4.05, liveP2 = 1.317;
const liveMargin = (1/liveP1) + (1/liveX) + (1/liveP2);

console.log(`Live margin: ${liveMargin}`);

const liveBase = calculateLiveOdds(pre.xG1, pre.xG2, pre.rho, score1, score2, min, liveMargin, 1, 1, 1);
console.log(`Base calculation (m1=1, m2=1): P1=${liveBase.p1.toFixed(2)}, X=${liveBase.x.toFixed(2)}, P2=${liveBase.p2.toFixed(2)}`);

const cal = autoCalibrate(3.36, 2.62, 2.32, liveP1, liveX, liveP2, score1, score2, min, 1.93, 1.78, 2.00);
console.log("Auto-calibrate:", cal);

const liveCalibrated = calculateLiveOdds(pre.xG1, pre.xG2, pre.rho, score1, score2, min, liveMargin, 1, cal.m1, cal.m2);
console.log(`Calibrated calculation: P1=${liveCalibrated.p1.toFixed(2)}, X=${liveCalibrated.x.toFixed(2)}, P2=${liveCalibrated.p2.toFixed(2)}`);

