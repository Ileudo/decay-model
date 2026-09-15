import React from 'react';
import { LiveResult, PreMatchResult, MatchInput } from '../types';
import { TrendingDown, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ResultsViewProps {
  preMatch: PreMatchResult | null;
  live: LiveResult | null;
  inputData: MatchInput | null;
}

export const ResultsView: React.FC<ResultsViewProps> = ({ preMatch, live, inputData }) => {
  if (!preMatch || !live || !inputData) {
    return null; // Empty placeholder is handled by MatchInfoHeader
  }

  const isValue = live.verdict === 'VALUE';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
      {/* Top Banner: Verdict */}
      <div className={`px-4 py-3 flex flex-col md:flex-row items-center gap-4 ${isValue ? 'bg-emerald-50' : 'bg-rose-50'}`}>
        <div className="flex-1 flex items-center justify-center gap-3">
          <div className={`p-2 rounded-full shadow-sm ${isValue ? 'bg-emerald-100/80 text-emerald-600' : 'bg-rose-100/80 text-rose-600'}`}>
            {isValue ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          </div>
          <div className="flex flex-col">
            <h2 className={`text-base md:text-lg font-black tracking-tight ${isValue ? 'text-emerald-900' : 'text-rose-900'}`}>
              {isValue ? 'ВАЛУЙ (VALUE)' : 'ПЕРЕГРЕВ - ПРОПУСК'}
            </h2>
            <div className={`text-[11px] font-medium flex items-center justify-center gap-1 mt-0.5 ${isValue ? 'text-emerald-700' : 'text-rose-700'}`}>
              Индекс Перегрева:
              <span className="font-bold ml-1 text-xs">{(live.iTimeDrop * 100).toFixed(2)}%</span>
              {live.iTimeDrop > 0 ? <TrendingDown className="w-3.5 h-3.5 ml-0.5" /> : <TrendingUp className="w-3.5 h-3.5 ml-0.5" />}
            </div>
          </div>
        </div>

        <div className="flex gap-5 bg-white/60 px-4 py-2 rounded-lg border border-white/80 shadow-sm backdrop-blur-sm shrink-0">
          <div className="text-right">
            <div className={`text-[9px] uppercase font-bold tracking-wider mb-0.5 ${isValue ? 'text-emerald-600/80' : 'text-rose-600/80'}`}>Расчетная линия</div>
            <div className={`text-xl font-black leading-none mb-1 ${isValue ? 'text-emerald-700' : 'text-rose-700'}`}>{live.kCalculated.toFixed(3)}</div>
            <div className={`text-[10px] font-semibold ${isValue ? 'text-emerald-600/60' : 'text-rose-600/60'}`}>Fair: {live.kFairTime.toFixed(3)}</div>
          </div>
          <div className="w-px bg-current opacity-10 my-1"></div>
          <div className="text-right flex flex-col justify-center">
            <div className={`text-[9px] uppercase font-bold tracking-wider mb-0.5 ${isValue ? 'text-emerald-600/80' : 'text-rose-600/80'}`}>Pinnacle (Live)</div>
            <div className={`text-xl font-black leading-none ${isValue ? 'text-emerald-900' : 'text-rose-900'}`}>{live.kLive.toFixed(3)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
