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
      {inputData.team1 && inputData.team2 && (
        <div className="bg-white border-b border-zinc-200 px-4 py-2 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex flex-col items-center md:items-start w-full md:w-auto">
            {inputData.league && (
              <div 
                className="text-[9px] text-zinc-400 font-semibold uppercase tracking-wider cursor-pointer hover:text-indigo-500 transition-colors mb-0.5" 
                onClick={() => navigator.clipboard.writeText(inputData.league!)} 
                title="Скопировать лигу"
              >
                {inputData.league}
              </div>
            )}
            <div className="flex items-center gap-2 text-zinc-800">
              <span className="font-bold text-sm cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => navigator.clipboard.writeText(inputData.team1!)} title="Скопировать">{inputData.team1}</span>
              <div className="bg-zinc-100 px-2 py-0.5 rounded-md border border-zinc-200 shadow-sm flex items-center gap-1 font-mono font-bold text-sm text-indigo-900">
                <span>{inputData.score1}</span>
                <span className="text-zinc-400 font-normal">:</span>
                <span>{inputData.score2}</span>
              </div>
              <span className="font-bold text-sm cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => navigator.clipboard.writeText(inputData.team2!)} title="Скопировать">{inputData.team2}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-zinc-50 px-3 py-1.5 rounded-lg border border-zinc-100 w-full md:w-auto justify-center md:justify-end">
            <div className="flex items-center gap-1.5 text-zinc-700 font-mono text-sm font-bold">
               <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
               {inputData.minute}'
            </div>
            <div className="w-px h-4 bg-zinc-300"></div>
            <div className="text-[11px] text-zinc-500 font-medium whitespace-nowrap">
              Осталось {Math.max(0, 90 - inputData.minute)} мин
            </div>
          </div>
        </div>
      )}

      {/* Top Banner: Verdict */}
      <div className={`px-4 py-2 border-b flex flex-col md:flex-row justify-between items-center gap-2 ${isValue ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-full ${isValue ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
            {isValue ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          </div>
          <div>
            <h2 className={`text-sm font-bold ${isValue ? 'text-emerald-900' : 'text-rose-900'}`}>
              {isValue ? 'ВАЛУЙ (VALUE)' : 'ПЕРЕГРЕВ - ПРОПУСК'}
            </h2>
            <div className={`text-[10px] font-medium flex items-center gap-1 ${isValue ? 'text-emerald-700' : 'text-rose-700'}`}>
              Индекс Перегрева:
              <span className="font-bold ml-1 text-[11px]">{(live.iTimeDrop * 100).toFixed(2)}%</span>
              {live.iTimeDrop > 0 ? <TrendingDown className="w-3 h-3 ml-0.5" /> : <TrendingUp className="w-3 h-3 ml-0.5" />}
            </div>
          </div>
        </div>

        <div className="flex gap-4 bg-white/50 px-3 py-1.5 rounded border border-white/50 backdrop-blur-sm">
          <div className="text-right">
            <div className={`text-[8px] uppercase font-bold tracking-wider mb-0.5 ${isValue ? 'text-emerald-600/70' : 'text-rose-600/70'}`}>Расчетная линия</div>
            <div className={`text-lg font-black ${isValue ? 'text-emerald-700' : 'text-rose-700'}`}>{live.kCalculated.toFixed(3)}</div>
          </div>
          <div className="w-px bg-current opacity-20 my-1"></div>
          <div className="text-right">
            <div className={`text-[8px] uppercase font-bold tracking-wider mb-0.5 ${isValue ? 'text-emerald-600/70' : 'text-rose-600/70'}`}>Pinnacle (Live)</div>
            <div className={`text-lg font-black ${isValue ? 'text-emerald-900' : 'text-rose-900'}`}>{live.kLive.toFixed(3)}</div>
          </div>
        </div>
      </div>

      {/* Bottom section: Core Metrics */}
      <div className="p-2 grid grid-cols-2 md:grid-cols-5 gap-2 bg-zinc-50/50">
        <div className="px-2 py-1.5 bg-white rounded border border-zinc-100 shadow-sm">
          <div className="text-[8px] text-zinc-500 uppercase font-semibold tracking-wider mb-0.5">Маржа ПМ</div>
          <div className="text-sm font-bold text-zinc-800">{(preMatch.margin * 100).toFixed(2)}%</div>
        </div>
        <div className="px-2 py-1.5 bg-white rounded border border-zinc-100 shadow-sm">
          <div className="text-[8px] text-zinc-500 uppercase font-semibold tracking-wider mb-0.5">Fair (Чистая Линия)</div>
          <div className="text-sm font-bold text-zinc-800">{live.kFairTime.toFixed(3)}</div>
        </div>
        <div className="px-2 py-1.5 bg-white rounded border border-zinc-100 shadow-sm">
          <div className="text-[8px] text-zinc-500 uppercase font-semibold tracking-wider mb-0.5">xG П1 (Прематч)</div>
          <div className="text-sm font-bold text-zinc-800">{preMatch.xG1.toFixed(2)}</div>
        </div>
        <div className="px-2 py-1.5 bg-white rounded border border-zinc-100 shadow-sm">
          <div className="text-[8px] text-zinc-500 uppercase font-semibold tracking-wider mb-0.5">xG П2 (Прематч)</div>
          <div className="text-sm font-bold text-zinc-800">{preMatch.xG2.toFixed(2)}</div>
        </div>
        <div className="px-2 py-1.5 bg-indigo-50 rounded border border-indigo-100 shadow-sm">
          <div className="text-[8px] text-indigo-500 uppercase font-semibold tracking-wider mb-0.5">Остаток xG (П1/П2)</div>
          <div className="text-sm font-bold text-indigo-900">{live.rem_xG1.toFixed(2)} <span className="text-indigo-400 font-normal">/</span> {live.rem_xG2.toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
};
