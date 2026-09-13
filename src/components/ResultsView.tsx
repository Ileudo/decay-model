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
      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-12 text-center text-zinc-500 flex flex-col items-center justify-center h-full min-h-[300px]">
        <AlertCircle className="w-12 h-12 mb-4 text-zinc-300" />
        <p>Заполните форму и нажмите "Анализировать линию" для получения отчета.</p>
      </div>
    );
  }

  const isValue = live.verdict === 'VALUE';

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
        <div className="bg-zinc-50 px-6 py-4 border-b border-zinc-200">
          <h3 className="font-semibold text-zinc-900 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
            Прематчевый Расклад
          </h3>
        </div>
        <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-zinc-50 p-4 rounded-lg">
            <div className="text-xs text-zinc-500 uppercase font-semibold tracking-wider mb-1">Маржа ПМ</div>
            <div className="text-xl font-bold text-zinc-900">{(preMatch.margin * 100).toFixed(2)}%</div>
          </div>
          <div className="bg-zinc-50 p-4 rounded-lg">
            <div className="text-xs text-zinc-500 uppercase font-semibold tracking-wider mb-1">True П1</div>
            <div className="text-xl font-bold text-zinc-900">{(preMatch.trueP1 * 100).toFixed(1)}%</div>
          </div>
          <div className="bg-zinc-50 p-4 rounded-lg">
            <div className="text-xs text-zinc-500 uppercase font-semibold tracking-wider mb-1">True X</div>
            <div className="text-xl font-bold text-zinc-900">{(preMatch.trueX * 100).toFixed(1)}%</div>
          </div>
          <div className="bg-zinc-50 p-4 rounded-lg">
            <div className="text-xs text-zinc-500 uppercase font-semibold tracking-wider mb-1">True П2</div>
            <div className="text-xl font-bold text-zinc-900">{(preMatch.trueP2 * 100).toFixed(1)}%</div>
          </div>
        </div>
      </div>

      <div className={`rounded-xl shadow-sm border overflow-hidden transition-colors ${isValue ? 'border-emerald-200' : 'border-rose-200'}`}>
        <div className={`px-6 py-4 border-b flex justify-between items-center ${isValue ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
          <h3 className={`font-semibold flex items-center gap-2 ${isValue ? 'text-emerald-900' : 'text-rose-900'}`}>
            {isValue ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            Вердикт Модели
          </h3>
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isValue ? 'bg-emerald-200 text-emerald-800' : 'bg-rose-200 text-rose-800'}`}>
            {isValue ? 'ВАЛУЙ (VALUE)' : 'ПЕРЕГРЕВ - ПРОПУСК'}
          </span>
        </div>
        <div className="bg-white p-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <div className="text-xs text-zinc-500 uppercase font-semibold tracking-wider mb-1 flex items-center gap-1" title="Decay Factor">
              Фактор распада
            </div>
            <div className="text-xl font-medium text-zinc-900">{live.decayFactor.toFixed(3)}</div>
          </div>
          <div>
            <div className="text-xs text-zinc-500 uppercase font-semibold tracking-wider mb-1">Расчетная линия</div>
            <div className="text-xl font-bold text-indigo-600">
              {live.kCalculated.toFixed(3)}
            </div>
            <div className="text-[10px] text-zinc-400 mt-1 font-medium">
              Fair: {live.kFairTime.toFixed(3)}
            </div>
          </div>
          <div>
            <div className="text-xs text-zinc-500 uppercase font-semibold tracking-wider mb-1">Pinnacle (Live)</div>
            <div className="text-xl font-bold text-zinc-900">{live.kLive.toFixed(3)}</div>
          </div>
          <div>
            <div className="text-xs text-zinc-500 uppercase font-semibold tracking-wider mb-1 flex items-center gap-1">
              Индекс Перегрева
              {live.iTimeDrop > 0 ? <TrendingDown className="w-3 h-3 text-rose-500" /> : <TrendingUp className="w-3 h-3 text-emerald-500" />}
            </div>
            <div className={`text-xl font-bold ${live.iTimeDrop > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              {(live.iTimeDrop * 100).toFixed(2)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
