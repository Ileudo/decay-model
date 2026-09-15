import React from 'react';
import { LiveResult, PreMatchResult } from '../types';
import { TrendingDown, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ResultsViewProps {
  preMatch: PreMatchResult | null;
  live: LiveResult | null;
  inputData: MatchInput | null;
}

export const ResultsView: React.FC<ResultsViewProps> = ({ preMatch, live, inputData }) => {
  if (!preMatch || !live || !inputData) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-zinc-200 p-2.5 flex items-center gap-2.5 text-zinc-500">
        <AlertCircle className="w-4 h-4 text-indigo-400" />
        <p className="text-xs font-medium text-zinc-700">Вставьте сигнал или заполните форму, затем нажмите "Анализировать линию".</p>
      </div>
    );
  }

  const isValue = live.verdict === 'VALUE';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
      {/* Match Info Header */}
      <div className="bg-white border-b border-zinc-200 px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-3 relative">
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          {inputData.league && (
            <div 
              className="text-[9px] text-zinc-400 font-semibold uppercase tracking-wider cursor-pointer hover:text-indigo-500 transition-colors mb-1" 
              onClick={() => navigator.clipboard.writeText(inputData.league!)} 
              title="Скопировать лигу"
            >
              {inputData.league}
            </div>
          )}
          <div className="flex items-center justify-center gap-4 text-zinc-800 w-full">
            <div className="flex flex-col items-end flex-1">
              <span className="font-bold text-sm md:text-base cursor-pointer hover:text-indigo-600 transition-colors text-right" onClick={() => navigator.clipboard.writeText(inputData.team1 || 'Команда 1')} title="Скопировать">{inputData.team1 || 'Команда 1'}</span>
              <span className="text-[10px] text-zinc-400 font-mono mt-0.5" title="Начальный xG → Остаточный xG">
                xG: {preMatch.xG1.toFixed(2)} → <span className="text-indigo-400 font-semibold">{live.rem_xG1.toFixed(2)}</span>
              </span>
            </div>
            
            <div className="bg-zinc-100 px-3 py-1 rounded-md border border-zinc-200 shadow-sm flex items-center gap-1.5 font-mono font-bold text-base md:text-lg text-indigo-900 shrink-0">
              <span>{inputData.score1}</span>
              <span className="text-zinc-400 font-normal">:</span>
              <span>{inputData.score2}</span>
            </div>
            
            <div className="flex flex-col items-start flex-1">
              <span className="font-bold text-sm md:text-base cursor-pointer hover:text-indigo-600 transition-colors text-left" onClick={() => navigator.clipboard.writeText(inputData.team2 || 'Команда 2')} title="Скопировать">{inputData.team2 || 'Команда 2'}</span>
              <span className="text-[10px] text-zinc-400 font-mono mt-0.5" title="Начальный xG → Остаточный xG">
                xG: {preMatch.xG2.toFixed(2)} → <span className="text-indigo-400 font-semibold">{live.rem_xG2.toFixed(2)}</span>
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 bg-zinc-50 px-3 py-1.5 rounded-full border border-zinc-100 shrink-0 md:absolute md:right-4 md:top-1/2 md:-translate-y-1/2">
          <div className="flex items-center gap-1.5 text-zinc-700 font-mono text-sm font-bold">
             <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
             {inputData.minute}'
          </div>
          <div className="w-px h-3 bg-zinc-300"></div>
          <div className="text-[10px] text-zinc-500 font-medium whitespace-nowrap">
            Осталось {Math.max(0, 90 - inputData.minute)} мин
          </div>
          <div className="w-px h-3 bg-zinc-300"></div>
          <div className="text-[10px] text-zinc-500 font-medium whitespace-nowrap" title="Прематчевая маржа букмекера">
            Маржа ПМ: {(preMatch.margin * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Top Banner: Verdict */}
      <div className={`px-4 py-3 flex flex-col md:flex-row justify-between items-center gap-2 ${isValue ? 'bg-emerald-50' : 'bg-rose-50'}`}>
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-full shadow-sm ${isValue ? 'bg-emerald-100/80 text-emerald-600' : 'bg-rose-100/80 text-rose-600'}`}>
            {isValue ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          </div>
          <div>
            <h2 className={`text-base font-black tracking-tight ${isValue ? 'text-emerald-900' : 'text-rose-900'}`}>
              {isValue ? 'ВАЛУЙ (VALUE)' : 'ПЕРЕГРЕВ - ПРОПУСК'}
            </h2>
            <div className={`text-[11px] font-medium flex items-center gap-1 mt-0.5 ${isValue ? 'text-emerald-700' : 'text-rose-700'}`}>
              Индекс Перегрева:
              <span className="font-bold ml-1 text-xs">{(live.iTimeDrop * 100).toFixed(2)}%</span>
              {live.iTimeDrop > 0 ? <TrendingDown className="w-3.5 h-3.5 ml-0.5" /> : <TrendingUp className="w-3.5 h-3.5 ml-0.5" />}
            </div>
          </div>
        </div>

        <div className="flex gap-5 bg-white/60 px-4 py-2 rounded-lg border border-white/80 shadow-sm backdrop-blur-sm">
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
