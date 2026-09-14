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
      <div className="bg-white rounded-lg shadow-sm border border-zinc-200 p-2.5 flex items-center gap-2.5 text-zinc-500">
        <AlertCircle className="w-4 h-4 text-indigo-400" />
        <p className="text-xs font-medium text-zinc-700">Вставьте сигнал или заполните форму, затем нажмите "Анализировать линию".</p>
      </div>
    );
  }

  const isValue = live.verdict === 'VALUE';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
      {/* Top Banner: Verdict */}
      <div className={`px-5 py-4 border-b flex flex-col md:flex-row justify-between items-center gap-4 ${isValue ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${isValue ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
            {isValue ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          </div>
          <div>
            <h2 className={`text-lg font-bold ${isValue ? 'text-emerald-900' : 'text-rose-900'}`}>
              {isValue ? 'ВАЛУЙ (VALUE)' : 'ПЕРЕГРЕВ - ПРОПУСК'}
            </h2>
            <div className={`text-xs font-medium flex items-center gap-1 ${isValue ? 'text-emerald-700' : 'text-rose-700'}`}>
              Индекс Перегрева:
              <span className="font-bold ml-1 text-sm">{(live.iTimeDrop * 100).toFixed(2)}%</span>
              {live.iTimeDrop > 0 ? <TrendingDown className="w-4 h-4 ml-0.5" /> : <TrendingUp className="w-4 h-4 ml-0.5" />}
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="text-right">
            <div className={`text-[10px] uppercase font-bold tracking-wider mb-0.5 ${isValue ? 'text-emerald-600/70' : 'text-rose-600/70'}`}>Расчетная линия</div>
            <div className={`text-2xl font-black ${isValue ? 'text-emerald-700' : 'text-rose-700'}`}>{live.kCalculated.toFixed(3)}</div>
          </div>
          <div className="w-px bg-current opacity-20 my-2"></div>
          <div className="text-right">
            <div className={`text-[10px] uppercase font-bold tracking-wider mb-0.5 ${isValue ? 'text-emerald-600/70' : 'text-rose-600/70'}`}>Pinnacle (Live)</div>
            <div className={`text-2xl font-black ${isValue ? 'text-emerald-900' : 'text-rose-900'}`}>{live.kLive.toFixed(3)}</div>
          </div>
        </div>
      </div>

      {/* Bottom section: Core Metrics */}
      <div className="p-3 grid grid-cols-2 md:grid-cols-5 gap-3 bg-zinc-50/50">
        <div className="p-2.5 bg-white rounded-lg border border-zinc-100 shadow-sm">
          <div className="text-[9px] text-zinc-500 uppercase font-semibold tracking-wider mb-0.5">Маржа ПМ</div>
          <div className="text-base font-bold text-zinc-800">{(preMatch.margin * 100).toFixed(2)}%</div>
        </div>
        <div className="p-2.5 bg-white rounded-lg border border-zinc-100 shadow-sm">
          <div className="text-[9px] text-zinc-500 uppercase font-semibold tracking-wider mb-0.5">Fair (Чистая Линия)</div>
          <div className="text-base font-bold text-zinc-800">{live.kFairTime.toFixed(3)}</div>
        </div>
        <div className="p-2.5 bg-white rounded-lg border border-zinc-100 shadow-sm">
          <div className="text-[9px] text-zinc-500 uppercase font-semibold tracking-wider mb-0.5">xG П1 (Прематч)</div>
          <div className="text-base font-bold text-zinc-800">{preMatch.xG1.toFixed(2)}</div>
        </div>
        <div className="p-2.5 bg-white rounded-lg border border-zinc-100 shadow-sm">
          <div className="text-[9px] text-zinc-500 uppercase font-semibold tracking-wider mb-0.5">xG П2 (Прематч)</div>
          <div className="text-base font-bold text-zinc-800">{preMatch.xG2.toFixed(2)}</div>
        </div>
        <div className="p-2.5 bg-indigo-50 rounded-lg border border-indigo-100 shadow-sm">
          <div className="text-[9px] text-indigo-500 uppercase font-semibold tracking-wider mb-0.5">Остаток xG (П1/П2)</div>
          <div className="text-base font-bold text-indigo-900">{live.rem_xG1.toFixed(2)} <span className="text-indigo-400 font-normal">/</span> {live.rem_xG2.toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
};
