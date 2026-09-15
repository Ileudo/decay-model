export function poisson(k: number, lambda: number): number {
  if (lambda === 0) return k === 0 ? 1 : 0;
  let p = Math.exp(-lambda);
  for (let i = 1; i <= k; i++) {
    p *= (lambda / i);
  }
  return p;
}

export function calculateMatchOutcomes(lambda1: number, lambda2: number, score1 = 0, score2 = 0, rho = 1.0) {
  let p1 = 0, px = 0, p2 = 0;
  const MAX_GOALS = 10; // sufficient for football

  for (let i = 0; i <= MAX_GOALS; i++) {
    for (let j = 0; j <= MAX_GOALS; j++) {
      let prob = poisson(i, lambda1) * poisson(j, lambda2);
      
      // Inflate or deflate draws specifically (Dixon-Coles simplified approach)
      if (i === j) {
        prob *= rho;
      }
      
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

export function findLambdas(targetP1: number, targetX: number, targetP2: number, targetTotalXg?: number) {
  // Use user-provided total xG, or default to 2.5 goals (standard football benchmark)
  const L_total = targetTotalXg || 2.5; 
  
  let lowL1 = 0.01;
  let highL1 = L_total - 0.01;
  
  if (highL1 <= lowL1) {
     return { xG1: L_total / 2, xG2: L_total / 2, rho: 1.0 };
  }

  const targetRatio = targetP1 / targetP2;
  
  let bestL1 = L_total / 2;
  let p1_raw = 0, px_raw = 0, p2_raw = 0;

  for (let iter = 0; iter < 40; iter++) {
    const midL1 = (lowL1 + highL1) / 2;
    const midL2 = L_total - midL1;
    
    // Calculate raw probabilities strictly without draw inflation (rho = 1.0)
    const probs = calculateMatchOutcomes(midL1, midL2, 0, 0, 1.0);
    p1_raw = probs.p1;
    px_raw = probs.x;
    p2_raw = probs.p2;
    
    const currentRatio = p1_raw / p2_raw;
    
    // Binary search to find L1 that perfectly matches targetP1/targetP2 ratio
    if (currentRatio < targetRatio) {
      lowL1 = midL1;
    } else {
      highL1 = midL1;
    }
    bestL1 = (lowL1 + highL1) / 2;
  }
  
  const L1 = bestL1;
  const L2 = L_total - L1;
  
  // Calculate exact inflation factor (rho) needed to match the bookmaker's Draw probability.
  // This guarantees that P(X) = targetX, and since P1/P2 ratio is preserved, P1 and P2 also match perfectly.
  let rho = 1.0;
  if (px_raw > 0 && targetX < 1.0) {
     rho = (targetX * (p1_raw + p2_raw)) / (px_raw * (1 - targetX));
  }
  
  return { xG1: L1, xG2: L2, rho };
}

export function asianTotalUnderProb(lambda: number, line: number): number {
  const base = Math.floor(line);
  const frac = line - base;

  const cdf = (k: number) => {
    let sum = 0;
    for (let i = 0; i <= k; i++) sum += poisson(i, lambda);
    return sum;
  };
  
  const pdf = (k: number) => poisson(k, lambda);

  // Implied probabilities derived exactly from Expected Value = 0 (fair odds)
  if (frac === 0.5) {
    // e.g. 2.5. Win = <=2. Lose = >=3.
    return cdf(base);
  } else if (frac === 0) {
    // e.g. 2.0. Win = <=1. Push = 2.
    const pWin = cdf(base - 1);
    const pPush = pdf(base);
    return pWin / (1 - pPush);
  } else if (frac === 0.25) {
    // e.g. 2.25. Half-win = 2. Win = <=1.
    const pWin = cdf(base - 1);
    const pHalfWin = pdf(base);
    return (pWin + 0.5 * pHalfWin) / (1 - 0.5 * pHalfWin);
  } else if (frac === 0.75) {
    // e.g. 2.75. Half-lose = 3. Win = <=2.
    const pWin = cdf(base);
    const pHalfLose = pdf(base + 1);
    return pWin / (1 - 0.5 * pHalfLose);
  }
  return cdf(base);
}

export function findTotalLambda(totalLine: number, targetUnderProb: number): number {
  let low = 0.1;
  let high = 10.0;
  
  for (let i = 0; i < 30; i++) {
    const mid = (low + high) / 2;
    const prob = asianTotalUnderProb(mid, totalLine);
    
    // Higher lambda = lower under probability
    if (prob > targetUnderProb) {
       low = mid; 
    } else {
       high = mid;
    }
  }
  return (low + high) / 2;
}

export function solvePreMatch(p1Odds: number, xOdds: number, p2Odds: number, overOdds?: number, underOdds?: number, totalLine?: number) {
  const marginSum = (1 / p1Odds) + (1 / xOdds) + (1 / p2Odds);
  const trueP1 = (1 / p1Odds) / marginSum;
  const trueX = (1 / xOdds) / marginSum;
  const trueP2 = (1 / p2Odds) / marginSum;
  
  let targetTotalXg = undefined;
  
  // Extract total xG if over/under market data is available
  if (overOdds && underOdds && totalLine && overOdds > 1 && underOdds > 1) {
    const totalMargin = (1 / overOdds) + (1 / underOdds);
    const fairUnderProb = (1 / underOdds) / totalMargin;
    targetTotalXg = findTotalLambda(totalLine, fairUnderProb);
  }
  
  const { xG1, xG2, rho } = findLambdas(trueP1, trueX, trueP2, targetTotalXg);

  return { 
    trueP1, 
    trueX, 
    trueP2, 
    margin: marginSum - 1,
    xG1,
    xG2,
    rho
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

export function calculateLiveOdds(
  xG1: number, 
  xG2: number, 
  rho: number,
  score1: number, 
  score2: number, 
  minute: number, 
  marginSum: number, 
  period: 1 | 2 = minute <= 45 ? 1 : 2,
  intensity1: number = 1.0,
  intensity2: number = 1.0
) {
  const share = getShare(minute, period);
  const decayFactor = share;
  
  // Base Remaining expected goals
  let rem_xG1 = xG1 * decayFactor;
  let rem_xG2 = xG2 * decayFactor;

  // Game State (Score) Modifier:
  // Dynamic calibration based on Pinnacle data (0:1 scenario, 11v11).
  // The multipliers for remaining xG depend on the initial strength ratio (xG1/xG2).
  // A heavy favorite pushes less aggressively when losing (M1 ~ 0.95) because they are already at peak capacity
  // and the opponent parks the bus heavily (M2 ~ 0.70).
  // A slight favorite pushes harder when losing (M1 ~ 1.11), and the opponent defends less deeply (M2 ~ 0.82).
  
  const goalDifference = score1 - score2;
  
  if (goalDifference !== 0) {
    const strengthRatio = Math.max(0.5, Math.min(3.0, xG1 / xG2)); // Clamp ratio to avoid extremes
    
    // Base formula derived from empirical regression:
    // M1 (Losing team) increases as they are stronger, but decreases as they are weaker.
    let mLosing = 1.40 - (0.26 * strengthRatio);
    
    // M2 (Winning team) depends on if they are the favorite or the underdog.
    let mWinning = 1.0;
    if (strengthRatio > 1.0) {
      // Losing team is favorite -> Winning team is underdog (parks the bus)
      mWinning = 1.0 - (0.17 * strengthRatio);
    } else {
      // Losing team is underdog -> Winning team is favorite (controls the game, doesn't panic)
      mWinning = 0.80 + (0.20 * strengthRatio);
    }
    
    // Second half escalation ("Panic" and "Desperation")
    if (minute > 45) {
      const t2 = (minute - 45) / 45.0; // 0.0 to 1.0 in second half
      mLosing += (t2 * 0.50); 
      mWinning += (t2 * 0.25); 
    }
    
    // Apply modifiers based on who is winning/losing
    if (goalDifference < 0) { // Team 1 is losing
      rem_xG1 *= mLosing; 
      rem_xG2 *= mWinning; 
    } else { // Team 1 is winning
      // If team 1 is winning, the "strength ratio" from the perspective of the losing team (Team 2) is inverted.
      const invRatio = Math.max(0.5, Math.min(3.0, xG2 / xG1));
      let mLosingInv = 1.40 - (0.26 * invRatio);
      
      let mWinningInv = 1.0;
      if (invRatio > 1.0) {
        mWinningInv = 1.0 - (0.17 * invRatio);
      } else {
        mWinningInv = 0.80 + (0.20 * invRatio);
      }
      
      if (minute > 45) {
        const t2 = (minute - 45) / 45.0; // 0.0 to 1.0 in second half
        mLosingInv += (t2 * 0.50); 
        mWinningInv += (t2 * 0.25); 
      }
      
      rem_xG1 *= mWinningInv; 
      rem_xG2 *= mLosingInv; 
    }
  }

  // Apply user-defined tactical intensities
  rem_xG1 *= intensity1;
  rem_xG2 *= intensity2;
  
  // Match outcomes for the remainder of the match (0:0 virtual start) - used for live AH
  // We use the same pre-match calibrated 'rho' to ensure consistency
  const rem = calculateMatchOutcomes(rem_xG1, rem_xG2, 0, 0, rho);
  
  // Match outcomes for the full match considering current score - used for 1X2
  const full = calculateMatchOutcomes(rem_xG1, rem_xG2, score1, score2, rho);
  
  const liveP1 = full.p1;
  const livePX = full.x;
  const liveP2 = full.p2;
  
  const clamp = (val: number) => Math.max(1.01, val);

  // Odds WITH margin (simulated bookmaker line)
  const p1 = clamp(1 / (liveP1 * marginSum));
  const x = clamp(1 / (livePX * marginSum));
  const p2 = clamp(1 / (liveP2 * marginSum));
  
  // Asian Handicap Margin
  // Handicap margins are typically lower than 1X2 margins. 
  // We approximate the handicap margin based on the 1X2 margin.
  // Empirical data from Pinnacle shows the AH margin is usually ~80% of the 1X2 margin.
  const ahMarginSum = 1 + ((marginSum - 1) * 0.8);

  // Live Asian Handicaps are evaluated on the REMAINDER of the match
  // Ф1(0) is won if remP1, lost if remP2, returned if remX
  const trueAH1_0 = rem.p1 / (rem.p1 + rem.p2);
  const trueAH2_0 = rem.p2 / (rem.p1 + rem.p2);

  // Ф1(-0.5) live is won if Team 1 scores MORE goals in the remainder of the match
  const trueAH1_05 = rem.p1;
  const trueAH2_05 = rem.p2;

  // Apply margin 
  const ah1_0 = clamp(1 / (trueAH1_0 * ahMarginSum));
  const ah2_0 = clamp(1 / (trueAH2_0 * ahMarginSum));
  const ah1_05 = clamp(1 / (trueAH1_05 * ahMarginSum));
  const ah2_05 = clamp(1 / (trueAH2_05 * ahMarginSum));
  
  // Ф1(-0.25)
  // Half stake on -0.5 (win if remP1), half stake on 0 (win if remP1, return if remX)
  // Equivalently, win = rem.p1, half-loss = rem.x, loss = rem.p2
  const trueAH1_025 = rem.p1 / (1 - 0.5 * rem.x);
  const trueAH2_025 = rem.p2 / (1 - 0.5 * rem.x);

  const ah1_025 = clamp(1 / (trueAH1_025 * ahMarginSum));
  const ah2_025 = clamp(1 / (trueAH2_025 * ahMarginSum));
  
  // Fair Odds calculations (Algebraic direct)
  const clampFair = (val: number) => Math.max(1.00, val);
  const p1Fair = clampFair(1 / liveP1);
  const xFair = clampFair(1 / livePX);
  const p2Fair = clampFair(1 / liveP2);
  
  const ah1_0Fair = clampFair((rem.p1 + rem.p2) / rem.p1);
  const ah2_0Fair = clampFair((rem.p1 + rem.p2) / rem.p2);
  
  const ah1_05Fair = clampFair(1 / rem.p1);
  const ah2_05Fair = clampFair(1 / rem.p2);

  const ah1_025Fair = clampFair((1 - 0.5 * rem.x) / rem.p1);
  const ah2_025Fair = clampFair((1 - 0.5 * rem.x) / rem.p2);
  
  return {
    p1, x, p2,
    ah1_0, ah2_0, ah1_025, ah2_025, ah1_05, ah2_05,
    p1Fair, xFair, p2Fair,
    ah1_0Fair, ah2_0Fair, ah1_025Fair, ah2_025Fair, ah1_05Fair, ah2_05Fair,
    decayFactor,
    rem_xG1, rem_xG2
  };
}

export function autoCalibrate(
  pmP1: number, pmX: number, pmP2: number,
  liveP1: number, liveX: number, liveP2: number,
  score1: number, score2: number, minute: number,
  overOdds?: number, underOdds?: number, totalLine?: number
): { m1: number, m2: number } {
  const pre = solvePreMatch(pmP1, pmX, pmP2, overOdds, underOdds, totalLine);
  const period = minute <= 45 ? 1 : 2;
  
  // Use the margin sum from the live odds to better match bookmaker behavior
  const liveMarginSum = (1 / liveP1) + (1 / liveX) + (1 / liveP2);
  
  let bestErr = Infinity;
  let bestM1 = 1.0;
  let bestM2 = 1.0;
  
  for (let m1 = 0.1; m1 <= 3.0; m1 += 0.1) {
    for (let m2 = 0.1; m2 <= 3.0; m2 += 0.1) {
      const live = calculateLiveOdds(pre.xG1, pre.xG2, pre.rho, score1, score2, minute, liveMarginSum, period, m1, m2);
      
      const err = Math.abs(live.p1 - liveP1) + 
                  Math.abs(live.x - liveX) + 
                  Math.abs(live.p2 - liveP2);
                  
      if (err < bestErr) {
        bestErr = err;
        bestM1 = m1;
        bestM2 = m2;
      }
    }
  }
  
  const coarseM1 = bestM1;
  const coarseM2 = bestM2;
  bestErr = Infinity;
  
  for (let m1 = Math.max(0.1, coarseM1 - 0.1); m1 <= Math.min(3.0, coarseM1 + 0.1); m1 += 0.01) {
    for (let m2 = Math.max(0.1, coarseM2 - 0.1); m2 <= Math.min(3.0, coarseM2 + 0.1); m2 += 0.01) {
      const live = calculateLiveOdds(pre.xG1, pre.xG2, pre.rho, score1, score2, minute, liveMarginSum, period, m1, m2);
      
      const err = Math.abs(live.p1 - liveP1) + 
                  Math.abs(live.x - liveX) + 
                  Math.abs(live.p2 - liveP2);
                  
      if (err < bestErr) {
        bestErr = err;
        bestM1 = m1;
        bestM2 = m2;
      }
    }
  }
  
  return {
    m1: Math.max(0.1, Math.min(3.0, bestM1)),
    m2: Math.max(0.1, Math.min(3.0, bestM2))
  };
}
