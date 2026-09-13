export function poisson(k: number, lambda: number): number {
  if (lambda === 0) return k === 0 ? 1 : 0;
  let p = Math.exp(-lambda);
  for (let i = 1; i <= k; i++) {
    p *= (lambda / i);
  }
  return p;
}

export function calculateMatchOutcomes(lambda1: number, lambda2: number, score1 = 0, score2 = 0) {
  let p1 = 0, px = 0, p2 = 0;
  const MAX_GOALS = 10; // sufficient for football

  for (let i = 0; i <= MAX_GOALS; i++) {
    for (let j = 0; j <= MAX_GOALS; j++) {
      const prob = poisson(i, lambda1) * poisson(j, lambda2);
      const final1 = score1 + i;
      const final2 = score2 + j;
      if (final1 > final2) p1 += prob;
      else if (final1 === final2) px += prob;
      else p2 += prob;
    }
  }
  // Normalize
  const sum = p1 + px + p2;
  return { p1: p1 / sum, x: px / sum, p2: p2 / sum };
}

export function findLambdas(targetP1: number, targetP2: number) {
  let L1 = 1.2; // Initial guess
  let L2 = 1.2;
  const lr = 3.0; // Learning rate for gradient descent

  for (let iter = 0; iter < 200; iter++) {
    const { p1, p2 } = calculateMatchOutcomes(L1, L2, 0, 0);
    const err1 = targetP1 - p1;
    const err2 = targetP2 - p2;
    
    L1 += err1 * lr;
    L2 += err2 * lr;
    
    // Prevent negative xG
    L1 = Math.max(0.01, L1);
    L2 = Math.max(0.01, L2);
    
    if (Math.abs(err1) < 0.0001 && Math.abs(err2) < 0.0001) break;
  }
  return { xG1: L1, xG2: L2 };
}

export function solvePreMatch(p1Odds: number, xOdds: number, p2Odds: number) {
  const marginSum = (1 / p1Odds) + (1 / xOdds) + (1 / p2Odds);
  const trueP1 = (1 / p1Odds) / marginSum;
  const trueX = (1 / xOdds) / marginSum;
  const trueP2 = (1 / p2Odds) / marginSum;
  
  const { xG1, xG2 } = findLambdas(trueP1, trueP2);

  return { 
    trueP1, 
    trueX, 
    trueP2, 
    margin: marginSum - 1,
    xG1,
    xG2
  };
}

export function getShare(minute: number, period: 1 | 2 = minute <= 45 ? 1 : 2): number {
  if (period === 1) {
    const safeMinute = Math.min(minute, 47.499);
    // Calibrated: 0.61 at HT (Global Average), linear decay in 1st half
    return 0.61 + 0.39 * ((47.5 - safeMinute) / 47.5);
  } else {
    // 2nd half calibrated for 94 min end time (49 mins duration from 46 to 94)
    const safeMinute = Math.min(minute, 93.999);
    const r = (94.0 - safeMinute) / 49.0;
    
    // The "80th-minute cliff": bookmakers hold the draw odds relatively stable 
    // until about the 80th minute (r ~ 0.3) to induce liquidity, 
    // and then aggressively accelerate the decay (crash the odds) to manage liability.
    // Softened cliff max to 0.15 based on tail-end data.
    const cliff = 0.15 * (1.0 - Math.min(1.0, r / 0.3));
    
    return 0.61 * Math.pow(r, 0.85 + cliff);
  }
}

export function calculateLiveOdds(xG1: number, xG2: number, score1: number, score2: number, minute: number, marginSum: number, period: 1 | 2 = minute <= 45 ? 1 : 2) {
  const share = getShare(minute, period);
  const decayFactor = share;
  
  // Remaining expected goals
  const rem_xG1 = xG1 * decayFactor;
  const rem_xG2 = xG2 * decayFactor;
  
  // Match outcomes for the remainder of the match (0:0 virtual start) - used for live AH
  const rem = calculateMatchOutcomes(rem_xG1, rem_xG2, 0, 0);
  
  // Match outcomes for the full match considering current score - used for 1X2
  const full = calculateMatchOutcomes(rem_xG1, rem_xG2, score1, score2);
  
  const liveP1 = full.p1;
  const livePX = full.x;
  const liveP2 = full.p2;
  
  const clamp = (val: number) => Math.max(1.01, val);

  // Odds WITH margin (simulated bookmaker line)
  const p1 = clamp(1 / (liveP1 * marginSum));
  const x = clamp(1 / (livePX * marginSum));
  const p2 = clamp(1 / (liveP2 * marginSum));
  
  // Live Asian Handicaps are evaluated on the REMAINDER of the match
  // Ф1(0) is won if remP1, lost if remP2, returned if remX
  const ah1_0 = clamp(1 / ((rem.p1 / (rem.p1 + rem.p2)) * marginSum));
  const ah2_0 = clamp(1 / ((rem.p2 / (rem.p1 + rem.p2)) * marginSum));
  
  // Ф1(-0.25)
  const ah1_025 = clamp(1 / ((rem.p1 / (1 - 0.5 * rem.x)) * marginSum));
  const ah2_025 = clamp(1 / ((rem.p2 / (1 - 0.5 * rem.x)) * marginSum));
  
  // Fair Odds calculations (Algebraic direct)
  const clampFair = (val: number) => Math.max(1.00, val);
  const p1Fair = clampFair(1 / liveP1);
  const xFair = clampFair(1 / livePX);
  const p2Fair = clampFair(1 / liveP2);
  
  const ah1_0Fair = clampFair((rem.p1 + rem.p2) / rem.p1);
  const ah2_0Fair = clampFair((rem.p1 + rem.p2) / rem.p2);
  
  const ah1_025Fair = clampFair((1 - 0.5 * rem.x) / rem.p1);
  const ah2_025Fair = clampFair((1 - 0.5 * rem.x) / rem.p2);
  
  return {
    p1, x, p2,
    ah1_0, ah2_0, ah1_025, ah2_025,
    p1Fair, xFair, p2Fair,
    ah1_0Fair, ah2_0Fair, ah1_025Fair, ah2_025Fair,
    decayFactor
  };
}
