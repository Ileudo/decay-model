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
  { m: 45, p1: 3.02, x: 2.75, p2: 2.64 }, // Wait, the actual halftime line is what?
  // "перерыв	0-1	3.02	2.75	2.64" 
  // Let's also look at min 46:
  // "46	0-1	3.14	2.73	2.57"
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

// WHY is HT 3.02 for P1 in Pinnacle, but 4.37 at min 30?
// Ah! "30 0-1 4.7 3.26 1.833" is min 30.
// Then it drops to "3.02" at HT.
// Wait, looking at the raw data:
// 30	0-1	4.7	3.26	1.833
// 28	0-1	4.53	3.2	1.884
// 27	0-1	4.38	3.19	1.917
// The data you provided is backwards! "87" is at the top, "0" is at the bottom.
// SO min 30 is AFTER min 17.
// 17	0-1	3.86	3.21	1.99
// 30	0-1	4.7	3.26	1.833
// 45	0-1	3.03	2.74	2.64 (THIS IS WRONG. Look at raw data:)
// 45	0-1	3.03	2.74	2.64 
// wait, min 45 P1 is 3.03? But min 30 P1 is 4.7? 
// Oh! 
// Look at the data:
// 45	0-1	3.03	2.74	2.64
// 46	0-1	3.14	2.73	2.57
// 47	0-1	3.25	2.72	2.51
// 48	0-1	3.33	2.71	2.48
// 50	0-1	3.48	2.69	2.42
// 60	0-1	4.58	2.67	2.08
// 70	0-1	7.01	2.87	1.72
// 80	0-1	12.97	3.51	1.41
// 87	0-1	30.53	5.21	1.18

// IT INCREASES OVER TIME AS EXPECTED.
// So why was min 30 P1 = 4.7, and min 45 P1 = 3.03? 
// Let's look at raw data around min 30.
// 30	0-1	4.7	3.26	1.833
// 31	0-1	4.88	3.28	1.8
// 32	0-1	4.98	3.28	1.781
// 33	0-1	5.1	3.29	1.763
// 34	0-1	5.2	3.29	1.757
// 36	0-1	2.96	2.86	2.59 (WAIT! Massive jump here!)
// 37	0-1	2.85	2.85	2.7
// Red card? Penalty missed? Let's check the TOtal.
// 34	0-1	ТБ 1.84	Тотал 2.5	ТМ 1.99
// 36	0-1	ТБ 1.961 Тотал 2.75 ТМ 1.854
// TOTAL went UP from 2.5 to 2.75. P1 dropped from 5.2 to 2.9.
// This is clearly a RED CARD for the leading team (Stal Rzeszow) at min 35!
// Odra Opole (P1) suddenly became huge favorites again because they are playing 11 vs 10!

