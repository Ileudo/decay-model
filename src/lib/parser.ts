import { MatchInput, BetType } from '../types';

export function parseRawText(text: string): Partial<MatchInput> {
  const result: Partial<MatchInput> = {};

  // Score
  const scoreMatch = text.match(/Текущий счет игры:\s*(\d+):(\d+)/i) || text.match(/Счет:\s*(\d+):(\d+)/i);
  if (scoreMatch) {
    result.score1 = parseInt(scoreMatch[1], 10);
    result.score2 = parseInt(scoreMatch[2], 10);
  }

  // Minute
  const minuteMatch = text.match(/Время:\s*(\d+)\s*мин/i) || text.match(/(\d+)\s*мин/i);
  if (minuteMatch) result.minute = parseInt(minuteMatch[1], 10);
  
  // Prematch 1X2
  // Prioritize block under "Прематчевые коэффициенты"
  const prematchBlockMatch = text.match(/Прематчевые коэффициенты[\s\S]*?П1=([\d.]+),\s*X=([\d.]+),\s*П2=([\d.]+)/i);
  if (prematchBlockMatch) {
    result.p1 = parseFloat(prematchBlockMatch[1]);
    result.x = parseFloat(prematchBlockMatch[2]);
    result.p2 = parseFloat(prematchBlockMatch[3]);
  } else {
     // Fallback if there's only one line of coefficients
     const fallback1X2 = text.match(/П1=([\d.]+),\s*X=([\d.]+),\s*П2=([\d.]+)/i);
     if (fallback1X2) {
       result.p1 = parseFloat(fallback1X2[1]);
       result.x = parseFloat(fallback1X2[2]);
       result.p2 = parseFloat(fallback1X2[3]);
     }
  }

  // Totals
  const totalMatch = text.match(/ТМ\(([\d.]+)\)=([\d.]+)/i);
  if (totalMatch) {
    result.total = parseFloat(totalMatch[1]);
    result.underOdds = parseFloat(totalMatch[2]);
  }

  // Bet Type
  const betTypeMatch = text.match(/Основная игра\.\s*(.+)/i) || text.match(/🌟Основная игра\.\s*(.+)/i) || text.match(/Ставка:\s*(.+)/i);
  if (betTypeMatch) {
    const rawType = betTypeMatch[1].toUpperCase();
    if (rawType.includes('ФОРА1 (0)') || rawType.includes('Ф1(0)')) result.betType = 'Ф1(0)';
    else if (rawType.includes('ФОРА2 (0)') || rawType.includes('Ф2(0)')) result.betType = 'Ф2(0)';
    else if (rawType.includes('ФОРА1 (-0.25)') || rawType.includes('Ф1(-0.25)')) result.betType = 'Ф1(-0.25)';
    else if (rawType.includes('ФОРА2 (-0.25)') || rawType.includes('Ф2(-0.25)')) result.betType = 'Ф2(-0.25)';
    else if (rawType.includes('ФОРА1 (-0.5)') || rawType.includes('Ф1(-0.5)') || rawType.includes('П1')) result.betType = 'П1';
    else if (rawType.includes('ФОРА2 (-0.5)') || rawType.includes('Ф2(-0.5)') || rawType.includes('П2')) result.betType = 'П2';
    else if (rawType.includes(' X') || rawType.includes('НИЧЬЯ')) result.betType = 'X';
  } else {
    // Direct match anywhere in the text as fallback
    if (text.match(/ФОРА1\s*\(0\)|Ф1\(0\)/i)) result.betType = 'Ф1(0)';
    else if (text.match(/ФОРА2\s*\(0\)|Ф2\(0\)/i)) result.betType = 'Ф2(0)';
    else if (text.match(/ФОРА1\s*\(-0\.25\)|Ф1\(-0\.25\)/i)) result.betType = 'Ф1(-0.25)';
    else if (text.match(/ФОРА2\s*\(-0\.25\)|Ф2\(-0\.25\)/i)) result.betType = 'Ф2(-0.25)';
    else if (text.match(/ФОРА1\s*\(-0\.5\)|Ф1\(-0\.5\)/i)) result.betType = 'П1';
    else if (text.match(/ФОРА2\s*\(-0\.5\)|Ф2\(-0\.5\)/i)) result.betType = 'П2';
  }

  // Live odds (K_live)
  const kLiveMatch = text.match(/Коэффициент\s*([\d.]+)/i) || text.match(/☑️Коэффициент\s*([\d.]+)/i);
  if (kLiveMatch) {
    result.kLive = parseFloat(kLiveMatch[1]);
  }
  
  return result;
}
