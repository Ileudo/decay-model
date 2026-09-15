import React from 'react';
import { PreMatchResult, LiveResult, MatchInput } from '../types';
import { AlertCircle } from 'lucide-react';

interface MatchInfoHeaderProps {
  preMatch: PreMatchResult | null;
  live: LiveResult | null;
  inputData: MatchInput | null;
}

export const MatchInfoHeader: React.FC<MatchInfoHeaderProps> = ({ preMatch, live, inputData }) => {
  if (!preMatch || !live || !inputData) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-zinc-200 p-2.5 flex items-center gap-2.5 text-zinc-500">
        <AlertCircle className="w-4 h-4 text-indigo-400" />
        <p className="text-xs font-medium text-zinc-700">Вставьте сигнал или заполните форму, затем нажмите "Анализировать линию".</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
      <div className="px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-3 relative">
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
    </div>
  );
}
