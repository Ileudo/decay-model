import { calculateMatchOutcomes, poisson, findLambdas } from './src/lib/math.ts';

const pmP1 = 2.79;
const pmX = 3.63;
const pmP2 = 2.08;
const marginSum = (1 / pmP1) + (1 / pmX) + (1 / pmP2);
const trueP1 = (1 / pmP1) / marginSum;
const trueX = (1 / pmX) / marginSum;
const trueP2 = (1 / pmP2) / marginSum;
const { xG1, xG2 } = findLambdas(trueP1, trueP2);

const testPoints = [
  { m: 15, p1: 2.33, x: 3.23, p2: 2.66 },
  { m: 30, p1: 2.31, x: 3.07, p2: 2.81 },
  { m: 45, p1: 1.943, x: 3.07, p2: 3.65 }, 
  { m: 60, p1: 1.704, x: 3.05, p2: 4.94 },
  { m: 75, p1: 1.39, x: 3.47, p2: 9.21 },
  { m: 85, p1: 1.18, x: 4.65, p2: 18.41 }
];

// Let's print out what M1 and M2 the script thinks are OPTIMAL 
// compared to what our formula gives.
// In the previous output, Optimal M1 (winning) is extremely low: 0.51, 0.50, 0.62.
// Why is it so low here? This is an Asian lower league game.
// It seems the favorite (who is losing) presses very hard, and the underdog (winning) completely stops playing.
// M1(Win) = 0.50
// But in the Estonia match (similar odds, 2.81 vs 2.06), Optimal M1(Win) was 0.76!

// Why did the HK team stop playing much harder than the Estonian team?
// That's standard variance between leagues/teams. The formula gave 0.80, which is the average.
// If the actual team drops to 0.50, our formula will naturally have some error because we don't know the specific team's mentality.

// However, let's see how much error this really introduces in terms of the "visual" coefficients.

for (let point of testPoints) {
    console.log(`Min ${point.m}: P1=${point.p1}, X=${point.x}, P2=${point.p2}`);
}

