import React, { useEffect, useRef } from 'react';
import { MinuteRow } from '../types';

interface MinuteTableProps {
  data: MinuteRow[];
  currentMinute?: number;
}

export const MinuteTable: React.FC<MinuteTableProps> = ({ data, currentMinute }) => {
  const activeRowRef = useRef<HTMLTableRowElement>(null);

  useEffect(() => {
    if (activeRowRef.current) {
      activeRowRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [data, currentMinute]);

  if (!data || data.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden flex flex-col">
      <div className="bg-zinc-50 px-4 py-2 border-b border-zinc-200 flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-zinc-900 text-sm">Динамика Линий (0:0)</h3>
          <p className="text-[10px] text-zinc-500 mt-0.5">Естественное усыхание с шагом 1 минута</p>
        </div>
      </div>
      <div className="overflow-x-auto h-[280px] overflow-y-auto relative">
        <table className="w-full text-sm table-fixed min-w-[550px]">
          <thead className="text-[11px] text-zinc-500 uppercase bg-zinc-50 sticky top-0 border-b border-zinc-200 z-10 shadow-sm">
            <tr>
              <th className="px-2 py-3 font-semibold text-center w-12 border-r border-zinc-200/50">Мин</th>
              <th className="px-2 py-3 font-semibold text-center w-[11%]">П1</th>
              <th className="px-2 py-3 font-semibold text-center w-[11%]">X</th>
              <th className="px-2 py-3 font-semibold text-center w-[11%]">П2</th>
              <th className="px-2 py-3 font-semibold text-center w-[12%]">Ф1(0)</th>
              <th className="px-2 py-3 font-semibold text-center w-[12%]">Ф2(0)</th>
              <th className="px-2 py-3 font-semibold text-center w-[16%]">Ф2(-0.25)</th>
              <th className="px-2 py-3 font-semibold text-center w-[15%] border-l border-zinc-200">Ост. xG</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {data.map((row) => {
              const isActive = currentMinute !== undefined && row.displayMinute === String(currentMinute);
              return (
                <tr 
                  key={row.displayMinute} 
                  ref={isActive ? activeRowRef : null}
                  className={`transition-colors ${isActive ? 'bg-indigo-50 border-y border-indigo-200 shadow-sm relative z-0' : 'hover:bg-zinc-50'}`}
                >
                  <td className={`px-2 py-2 font-medium text-center whitespace-nowrap border-r border-zinc-200/50 ${isActive ? 'text-indigo-900 bg-indigo-100/50' : 'text-zinc-900 bg-zinc-50/50'}`}>
                    {row.displayMinute}'
                  </td>
                  <td className={`px-2 py-2 text-center font-mono ${isActive ? 'text-indigo-900 font-bold' : 'text-zinc-600'}`}>{row.p1.toFixed(3)}</td>
                  <td className={`px-2 py-2 text-center font-mono ${isActive ? 'text-indigo-900 font-bold' : 'text-zinc-600'}`}>{row.x.toFixed(3)}</td>
                  <td className={`px-2 py-2 text-center font-mono ${isActive ? 'text-indigo-900 font-bold' : 'text-zinc-600'}`}>{row.p2.toFixed(3)}</td>
                  <td className={`px-2 py-2 text-center font-mono ${isActive ? 'text-indigo-700 font-bold' : 'text-indigo-600'}`}>{row.ah1_0.toFixed(3)}</td>
                  <td className={`px-2 py-2 text-center font-mono ${isActive ? 'text-indigo-700 font-bold' : 'text-indigo-600'}`}>{row.ah2_0.toFixed(3)}</td>
                  <td className={`px-2 py-2 text-center font-mono ${isActive ? 'text-emerald-700 font-bold' : 'text-emerald-600'}`}>{row.ah2_025.toFixed(3)}</td>
                  <td className={`px-2 py-2 text-center font-mono border-l ${isActive ? 'text-amber-700 bg-amber-100/50 border-amber-200 font-bold' : 'text-amber-600 bg-amber-50/30 border-zinc-100 font-medium'}`}>{row.totalXg.toFixed(3)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
