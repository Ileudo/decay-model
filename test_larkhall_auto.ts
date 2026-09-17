import { autoCalibrate } from './src/lib/math.ts';

const res = autoCalibrate(
  2.79, 3.75, 2.05, 
  5.73, 4.22, 1.414, 
  0, 1, 12, 
  1.76, 1.95, 3.00
);

console.log(`Auto-calibrated multipliers to match 1X2: m1=${res.m1.toFixed(3)}, m2=${res.m2.toFixed(3)}`);
