import React from 'react';
import { MinuteRow } from '../types';

interface MinuteTableProps {
  data: MinuteRow[];
}

export const MinuteTable: React.FC<MinuteTableProps> = ({ data }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden flex flex-col">
      <div className="bg-zinc-50 px-6 py-4 border-b border-zinc-200">
        <h3 className="font-semibold text-zinc-900">Динамика Линий (0:0)</h3>
        <p className="text-xs text-zinc-500 mt-1">Естественное усыхание с шагом 1 минута</p>
      </div>
      <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 sticky top-0 border-b border-zinc-200 z-10">
            <tr>
              <th className="px-3 py-3 font-semibold text-center w-12">Мин</th>
              <th className="px-3 py-3 font-semibold text-right">П1</th>
              <th className="px-3 py-3 font-semibold text-right">X</th>
              <th className="px-3 py-3 font-semibold text-right">П2</th>
              <th className="px-3 py-3 font-semibold text-right">Ф1(0)</th>
              <th className="px-3 py-3 font-semibold text-right">Ф2(0)</th>
              <th className="px-3 py-3 font-semibold text-right">Ф1(-0.25)</th>
              <th className="px-3 py-3 font-semibold text-right">Ф2(-0.25)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {data.map((row) => (
              <tr key={row.displayMinute} className="hover:bg-zinc-50 transition-colors">
                <td className="px-3 py-2 font-medium text-zinc-900 text-center bg-zinc-50/50 whitespace-nowrap">{row.displayMinute}'</td>
                <td className="px-3 py-2 text-right font-mono text-zinc-600">{row.p1.toFixed(3)}</td>
                <td className="px-3 py-2 text-right font-mono text-zinc-600">{row.x.toFixed(3)}</td>
                <td className="px-3 py-2 text-right font-mono text-zinc-600">{row.p2.toFixed(3)}</td>
                <td className="px-3 py-2 text-right font-mono text-indigo-600">{row.ah1_0.toFixed(3)}</td>
                <td className="px-3 py-2 text-right font-mono text-indigo-600">{row.ah2_0.toFixed(3)}</td>
                <td className="px-3 py-2 text-right font-mono text-emerald-600">{row.ah1_025.toFixed(3)}</td>
                <td className="px-3 py-2 text-right font-mono text-emerald-600">{row.ah2_025.toFixed(3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
