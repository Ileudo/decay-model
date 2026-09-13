import React from 'react';
import { LiveResult, PreMatchResult } from '../types';
import { TrendingDown, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ResultsViewProps {
  preMatch: PreMatchResult | null;
  live: LiveResult | null;
}

export const ResultsView: React.FC<ResultsViewProps> = ({ preMatch, live }) => {
  if (!preMatch || !live) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-8 text-center text-zinc-500 flex flex-col items-center justify-center h-full min-h-[200px]">
        <AlertCircle className="w-10 h-10 mb-3 text-zinc-300" />
        <p className="text-sm">Заполните форму и нажмите "Анализировать линию" для получения отчета.</p>
      </div>
    );
  }

  const isValue = live.verdict === 'VALUE';

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
        <div className="bg-zinc-50 px-4 py-3 border-b border-zinc-200">
          <h3 className="font-semibold text-zinc-900 flex items-center gap-2 text-sm">
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
            Прематчевый Расклад
          </h3>
        </div>
        <div className="p-4 grid grid-cols-2 md:grid-cols-6 gap-3">
          <div className="bg-zinc-50 p-3 rounded-lg">
            <div className="text-[10px] text-zinc-500 uppercase font-semibold tracking-wider mb-1">Маржа ПМ</div>
            <div className="text-lg font-bold text-zinc-900">{(preMatch.margin * 100).toFixed(2)}%</div>
          </div>
          <div className="bg-zinc-50 p-3 rounded-lg">
            <div className="text-[10px] text-zinc-500 uppercase font-semibold tracking-wider mb-1">True П1</div>
            <div className="text-lg font-bold text-zinc-900">{(preMatch.trueP1 * 100).toFixed(1)}%</div>
          </div>
          <div className="bg-zinc-50 p-3 rounded-lg">
            <div className="text-[10px] text-zinc-500 uppercase font-semibold tracking-wider mb-1">True X</div>
            <div className="text-lg font-bold text-zinc-900">{(preMatch.trueX * 100).toFixed(1)}%</div>
          </div>
          <div className="bg-zinc-50 p-3 rounded-lg">
            <div className="text-[10px] text-zinc-500 uppercase font-semibold tracking-wider mb-1">True П2</div>
            <div className="text-lg font-bold text-zinc-900">{(preMatch.trueP2 * 100).toFixed(1)}%</div>
          </div>
          <div className="bg-zinc-50 p-3 rounded-lg border-l-2 border-indigo-200">
            <div className="text-[10px] text-zinc-500 uppercase font-semibold tracking-wider mb-1">xG П1</div>
            <div className="text-lg font-bold text-zinc-900">{preMatch.xG1.toFixed(2)}</div>
          </div>
          <div className="bg-zinc-50 p-3 rounded-lg border-r-2 border-indigo-200">
            <div className="text-[10px] text-zinc-500 uppercase font-semibold tracking-wider mb-1">xG П2</div>
            <div className="text-lg font-bold text-zinc-900">{preMatch.xG2.toFixed(2)}</div>
          </div>
        </div>
      </div>

      <div className={`rounded-xl shadow-sm border overflow-hidden transition-colors ${isValue ? 'border-emerald-200' : 'border-rose-200'}`}>
        <div className={`px-4 py-3 border-b flex justify-between items-center ${isValue ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
          <h3 className={`font-semibold flex items-center gap-2 text-sm ${isValue ? 'text-emerald-900' : 'text-rose-900'}`}>
            {isValue ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            Вердикт Модели
          </h3>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${isValue ? 'bg-emerald-200 text-emerald-800' : 'bg-rose-200 text-rose-800'}`}>
            {isValue ? 'ВАЛУЙ (VALUE)' : 'ПЕРЕГРЕВ - ПРОПУСК'}
          </span>
        </div>
        <div className="bg-white p-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <div className="text-[10px] text-zinc-500 uppercase font-semibold tracking-wider mb-1 flex items-center gap-1" title="Remaining Expected Goals">
              Остаток xG (П1 / П2)
            </div>
            <div className="text-lg font-medium text-zinc-900">{live.rem_xG1.toFixed(2)} <span className="text-zinc-400 text-sm font-normal">/</span> {live.rem_xG2.toFixed(2)}</div>
            <div className="text-[10px] text-zinc-400 mt-0.5 font-medium">
              Суммарный тотал: {(live.rem_xG1 + live.rem_xG2).toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-zinc-500 uppercase font-semibold tracking-wider mb-1">Расчетная линия</div>
            <div className="text-lg font-bold text-indigo-600">
              {live.kCalculated.toFixed(3)}
            </div>
            <div className="text-[10px] text-zinc-400 mt-0.5 font-medium">
              Fair: {live.kFairTime.toFixed(3)}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-zinc-500 uppercase font-semibold tracking-wider mb-1">Pinnacle (Live)</div>
            <div className="text-lg font-bold text-zinc-900">{live.kLive.toFixed(3)}</div>
          </div>
          <div>
            <div className="text-[10px] text-zinc-500 uppercase font-semibold tracking-wider mb-1 flex items-center gap-1">
              Индекс Перегрева
              {live.iTimeDrop > 0 ? <TrendingDown className="w-3 h-3 text-rose-500" /> : <TrendingUp className="w-3 h-3 text-emerald-500" />}
            </div>
            <div className={`text-lg font-bold ${live.iTimeDrop > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              {(live.iTimeDrop * 100).toFixed(2)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
