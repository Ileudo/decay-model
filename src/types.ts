export type BetType = 'П1' | 'X' | 'П2' | 'Ф1(0)' | 'Ф2(0)' | 'Ф1(-0.25)' | 'Ф2(-0.25)';

export interface MatchInput {
  p1: number;
  x: number;
  p2: number;
  total: number;
  underOdds: number;
  minute: number;
  score1: number;
  score2: number;
  betType: BetType;
  kLive: number;
  intensity1: number;
  intensity2: number;
}

export interface PreMatchResult {
  margin: number;
  trueP1: number;
  trueX: number;
  trueP2: number;
  xG1: number;
  xG2: number;
}

export interface LiveResult {
  decayFactor: number;
  kCalculated: number;
  kFairTime: number;
  kLive: number;
  iTimeDrop: number;
  verdict: 'VALUE' | 'OVERREACTION';
}

export interface MinuteRow {
  displayMinute: string;
  p1: number;
  x: number;
  p2: number;
  ah1_0: number;
  ah2_0: number;
  ah1_025: number;
  ah2_025: number;
}
