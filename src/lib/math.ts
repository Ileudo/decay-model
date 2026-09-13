export function solvePreMatch(p1Odds: number, xOdds: number, p2Odds: number) {
  const marginSum = (1 / p1Odds) + (1 / xOdds) + (1 / p2Odds);
  const trueP1 = (1 / p1Odds) / marginSum;
  const trueX = (1 / xOdds) / marginSum;
  const trueP2 = (1 / p2Odds) / marginSum;

  return { 
    trueP1, 
    trueX, 
    trueP2, 
    margin: marginSum - 1 
  };
}

export function getShare(minute: number, period: 1 | 2 = minute <= 45 ? 1 : 2): number {
  if (period === 1) {
    const safeMinute = Math.min(minute, 47.499);
    // Calibrated: 0.62 at HT, linear decay in 1st half
    return 0.62 + 0.38 * ((47.5 - safeMinute) / 47.5);
  } else {
    // 2nd half calibrated for 94 min end time (49 mins duration from 46 to 94)
    const safeMinute = Math.min(minute, 93.999);
    const r = (94.0 - safeMinute) / 49.0;
    
    // The "80th-minute cliff": bookmakers hold the draw odds relatively stable 
    // until about the 80th minute (r ~ 0.3) to induce liquidity, 
    // and then aggressively accelerate the decay (crash the odds) to manage liability.
    // Softened cliff max to 0.15 based on Tottenham-Everton tail-end data.
    const cliff = 0.15 * (1.0 - Math.min(1.0, r / 0.3));
    
    return 0.62 * Math.pow(r, 0.85 + cliff);
  }
}

export function calculateLiveOdds(trueP1: number, trueX: number, trueP2: number, total: number, minute: number, marginSum: number, period: 1 | 2 = minute <= 45 ? 1 : 2) {
  const share = getShare(minute, period);
  // Removed total modifier: the pre-match X odds inherently encode the Total's effect.
  // Double-dipping by skewing the time decay creates divergence.
  const decayFactor = share;
  
  // Dynamic probability of Draw at 0:0
  const livePX = trueX / (trueX + (1 - trueX) * decayFactor);
  
  // Remaining probability distributed proportionally to initial winning probs
  const p1p2Sum = trueP1 + trueP2;
  const remainder = 1 - livePX;
  
  const liveP1 = remainder * (trueP1 / p1p2Sum);
  const liveP2 = remainder * (trueP2 / p1p2Sum);
  
  // Odds WITH margin (simulated bookmaker line)
  const p1 = 1 / (liveP1 * marginSum);
  const x = 1 / (livePX * marginSum);
  const p2 = 1 / (liveP2 * marginSum);
  
  const ah1_0 = 1 / ((liveP1 / (liveP1 + liveP2)) * marginSum);
  const ah2_0 = 1 / ((liveP2 / (liveP1 + liveP2)) * marginSum);
  
  const ah1_025 = 1 / ((liveP1 / (1 - 0.5 * livePX)) * marginSum);
  const ah2_025 = 1 / ((liveP2 / (1 - 0.5 * livePX)) * marginSum);
  
  // Fair Odds calculations (Algebraic direct)
  const p1Fair = 1 / liveP1;
  const xFair = 1 / livePX;
  const p2Fair = 1 / liveP2;
  
  const ah1_0Fair = (liveP1 + liveP2) / liveP1;
  const ah2_0Fair = (liveP1 + liveP2) / liveP2;
  
  const ah1_025Fair = (1 - 0.5 * livePX) / liveP1;
  const ah2_025Fair = (1 - 0.5 * livePX) / liveP2;
  
  return {
    p1, x, p2,
    ah1_0, ah2_0, ah1_025, ah2_025,
    p1Fair, xFair, p2Fair,
    ah1_0Fair, ah2_0Fair, ah1_025Fair, ah2_025Fair,
    decayFactor
  };
}
