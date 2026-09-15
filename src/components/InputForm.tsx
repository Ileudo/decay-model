import React, { useState } from 'react';
import { BetType, MatchInput } from '../types';
import { Wand2, RotateCcw } from 'lucide-react';
import { parseRawText } from '../lib/parser';
import { autoCalibrate } from '../lib/math';

interface InputFormProps {
  onCalculate: (data: MatchInput) => void;
  isLoading: boolean;
}

export const InputForm: React.FC<InputFormProps> = ({ onCalculate, isLoading }) => {
  const [formData, setFormData] = useState<MatchInput>({
    p1: 2.21,
    x: 3.81,
    p2: 3.13,
    total: 3.0,
    overOdds: 1.86,
    underOdds: 1.86,
    minute: 20,
    score1: 0,
    score2: 0,
    betType: 'Ф2(0)',
    kLive: 2.13,
    liveP1: undefined,
    liveX: undefined,
    liveP2: undefined,
    intensity1: 1.0,
    intensity2: 1.0,
  });
  
  const [rawText, setRawText] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'betType' ? value : (value === '' ? undefined : parseFloat(value)),
    }));
  };

  const handleAutoCalibrate = () => {
    try {
      if (!formData.liveP1 || !formData.liveX || !formData.liveP2) {
        return; // Silently exit if no live odds to calibrate
      }
      
      const { m1, m2 } = autoCalibrate(
        formData.p1, formData.x, formData.p2,
        formData.liveP1, formData.liveX, formData.liveP2,
        formData.score1, formData.score2, formData.minute,
        formData.overOdds, formData.underOdds, formData.total
      );
      
      const newData = {
        ...formData,
        intensity1: m1,
        intensity2: m2
      };
      
      setFormData(newData);
      onCalculate(newData);
      
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetCalibration = () => {
    const newData = {
      ...formData,
      intensity1: 1.0,
      intensity2: 1.0
    };
    setFormData(newData);
    onCalculate(newData);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setRawText(text);
    if (text.trim()) {
      const parsed = parseRawText(text);
      if (Object.keys(parsed).length > 0) {
        setFormData((prev) => ({
          ...prev,
          ...parsed,
        }));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCalculate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-zinc-200 p-3 flex flex-col gap-3">
      
      {/* Import Telegram */}
      <div className="relative">
        <Wand2 className="w-4 h-4 text-indigo-500 absolute left-3 top-3" />
        <textarea
          value={rawText}
          onChange={handleTextChange}
          placeholder="Вставьте текст сигнала (Telegram)..."
          className="w-full h-10 pl-9 pr-3 py-2 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-indigo-500 resize-none overflow-hidden leading-tight bg-zinc-50"
        />
      </div>

      {/* Prematch & Total Group */}
      <div>
        <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1 flex items-center">
          Прематч и Тотал
          <div className="flex-1 border-b border-zinc-100 ml-2"></div>
        </div>
        <div className="grid grid-cols-6 gap-1.5">
          <div>
            <label className="block text-[10px] text-zinc-500 mb-0.5 truncate" title="П1 (Home)">П1 (Home)</label>
            <input type="number" step="0.01" name="p1" value={formData.p1} onChange={handleChange} className="w-full px-1.5 py-1.5 text-xs border border-zinc-300 rounded focus:ring-1 focus:ring-indigo-500 min-w-0" required />
          </div>
          <div>
            <label className="block text-[10px] text-zinc-500 mb-0.5 truncate" title="X (Draw)">X (Draw)</label>
            <input type="number" step="0.01" name="x" value={formData.x} onChange={handleChange} className="w-full px-1.5 py-1.5 text-xs border border-zinc-300 rounded focus:ring-1 focus:ring-indigo-500 min-w-0" required />
          </div>
          <div>
            <label className="block text-[10px] text-zinc-500 mb-0.5 truncate" title="П2 (Away)">П2 (Away)</label>
            <input type="number" step="0.01" name="p2" value={formData.p2} onChange={handleChange} className="w-full px-1.5 py-1.5 text-xs border border-zinc-300 rounded focus:ring-1 focus:ring-indigo-500 min-w-0" required />
          </div>
          <div>
            <label className="block text-[10px] text-zinc-500 mb-0.5 truncate" title="Тотал">Тотал</label>
            <input type="number" step="0.25" name="total" value={formData.total} onChange={handleChange} className="w-full px-1.5 py-1.5 text-xs border border-zinc-300 rounded focus:ring-1 focus:ring-indigo-500 min-w-0" required />
          </div>
          <div>
            <label className="block text-[10px] text-zinc-500 mb-0.5 truncate" title="Кэф ТБ">Кэф ТБ</label>
            <input type="number" step="0.01" name="overOdds" value={formData.overOdds || ''} onChange={handleChange} className="w-full px-1.5 py-1.5 text-xs border border-zinc-300 rounded focus:ring-1 focus:ring-indigo-500 min-w-0" />
          </div>
          <div>
            <label className="block text-[10px] text-zinc-500 mb-0.5 truncate" title="Кэф ТМ">Кэф ТМ</label>
            <input type="number" step="0.01" name="underOdds" value={formData.underOdds} onChange={handleChange} className="w-full px-1.5 py-1.5 text-xs border border-zinc-300 rounded focus:ring-1 focus:ring-indigo-500 min-w-0" required />
          </div>
        </div>
      </div>

      {/* Live Situation */}
      <div className="bg-zinc-50/50 rounded-lg p-2 border border-zinc-100">
        <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center">
          Лайв Ситуация
          <div className="flex-1 border-b border-zinc-200 ml-2"></div>
        </div>
        <div className="grid grid-cols-7 gap-1.5 mb-2">
          <div className="col-span-1">
            <label className="block text-[10px] text-zinc-500 mb-0.5 truncate" title="Минута">Мин</label>
            <input type="number" step="1" min="1" max="90" name="minute" value={formData.minute} onChange={handleChange} className="w-full px-1.5 py-1.5 text-xs border border-zinc-300 rounded focus:ring-1 focus:ring-indigo-500 min-w-0" required />
          </div>
          <div className="col-span-1">
            <label className="block text-[10px] text-zinc-500 mb-0.5 truncate" title="Счет 1">Сч 1</label>
            <input type="number" step="1" min="0" name="score1" value={formData.score1} onChange={handleChange} className="w-full px-1.5 py-1.5 text-xs border border-zinc-300 rounded focus:ring-1 focus:ring-indigo-500 min-w-0" required />
          </div>
          <div className="col-span-1">
            <label className="block text-[10px] text-zinc-500 mb-0.5 truncate" title="Счет 2">Сч 2</label>
            <input type="number" step="1" min="0" name="score2" value={formData.score2} onChange={handleChange} className="w-full px-1.5 py-1.5 text-xs border border-zinc-300 rounded focus:ring-1 focus:ring-indigo-500 min-w-0" required />
          </div>
          <div className="col-span-2">
            <label className="block text-[10px] text-zinc-500 mb-0.5 truncate" title="Ставка">Ставка</label>
            <select name="betType" value={formData.betType} onChange={handleChange} className="w-full px-1 py-1.5 text-xs border border-zinc-300 rounded focus:ring-1 focus:ring-indigo-500 bg-white min-w-0" required>
              <option value="П1">П1 (Исход)</option>
              <option value="X">X (Ничья)</option>
              <option value="П2">П2 (Исход)</option>
              <option value="Ф1(0)">Ф1(0)</option>
              <option value="Ф2(0)">Ф2(0)</option>
              <option value="Ф1(-0.25)">Ф1(-0.25)</option>
              <option value="Ф2(-0.25)">Ф2(-0.25)</option>
              <option value="Ф1(-0.5)">Ф1(-0.5) Live</option>
              <option value="Ф2(-0.5)">Ф2(-0.5) Live</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-[10px] font-bold text-indigo-600 mb-0.5 truncate" title="Коэффициент">K_live</label>
            <input type="number" step="0.01" name="kLive" value={formData.kLive} onChange={handleChange} className="w-full px-1.5 py-1.5 text-sm font-bold text-indigo-700 border border-indigo-200 rounded focus:ring-1 focus:ring-indigo-500 bg-indigo-50/30 min-w-0" required />
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-1.5 bg-blue-50/50 p-2 rounded border border-blue-100">
          <div>
            <label className="block text-[9px] font-bold text-blue-600/80 uppercase mb-0.5 tracking-wider truncate" title="Live П1 (Калибровка)">Live П1 (Кал)</label>
            <input type="number" step="0.01" name="liveP1" value={formData.liveP1 || ''} onChange={handleChange} className="w-full px-1.5 py-1.5 text-xs border border-blue-200 rounded focus:ring-1 focus:ring-blue-500 bg-white min-w-0" placeholder="—" />
          </div>
          <div>
            <label className="block text-[9px] font-bold text-blue-600/80 uppercase mb-0.5 tracking-wider truncate" title="Live X (Калибровка)">Live X</label>
            <input type="number" step="0.01" name="liveX" value={formData.liveX || ''} onChange={handleChange} className="w-full px-1.5 py-1.5 text-xs border border-blue-200 rounded focus:ring-1 focus:ring-blue-500 bg-white min-w-0" placeholder="—" />
          </div>
          <div>
            <label className="block text-[9px] font-bold text-blue-600/80 uppercase mb-0.5 tracking-wider truncate" title="Live П2 (Калибровка)">Live П2 (Кал)</label>
            <input type="number" step="0.01" name="liveP2" value={formData.liveP2 || ''} onChange={handleChange} className="w-full px-1.5 py-1.5 text-xs border border-blue-200 rounded focus:ring-1 focus:ring-blue-500 bg-white min-w-0" placeholder="—" />
          </div>
        </div>
      </div>

      {/* Tactics & Calibration */}
      <div className="bg-zinc-50 p-2 rounded border border-zinc-200">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[11px] font-bold text-zinc-700 uppercase tracking-wider">Активность</div>
          <div className="flex gap-1.5">
            <button type="button" onClick={handleAutoCalibrate} className="px-2 py-1 bg-white border border-zinc-300 text-zinc-700 text-[10px] font-bold rounded shadow-sm hover:bg-zinc-100 transition-colors">
              АВТО-КАЛИБРОВКА
            </button>
            <button type="button" onClick={handleResetCalibration} className="px-1.5 py-1 bg-white border border-zinc-300 text-zinc-500 rounded shadow-sm hover:bg-zinc-100 transition-colors" title="Сбросить">
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[10px]">
              <label className="font-medium text-zinc-600">Хозяева (П1)</label>
              <span className={`font-mono ${formData.intensity1 > 1.0 ? 'text-green-600' : formData.intensity1 < 1.0 ? 'text-red-500' : 'text-zinc-500'}`}>{Math.round(formData.intensity1 * 100)}%</span>
            </div>
            <input type="range" name="intensity1" min="0.5" max="2.0" step="0.01" value={formData.intensity1} onChange={handleChange} className="w-full h-1.5 bg-zinc-300 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
            <div className="flex justify-between text-[9px] text-zinc-400">
              <span>Автобус</span>
              <span>Навал</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[10px]">
              <label className="font-medium text-zinc-600">Гости (П2)</label>
              <span className={`font-mono ${formData.intensity2 > 1.0 ? 'text-green-600' : formData.intensity2 < 1.0 ? 'text-red-500' : 'text-zinc-500'}`}>{Math.round(formData.intensity2 * 100)}%</span>
            </div>
            <input type="range" name="intensity2" min="0.5" max="2.0" step="0.01" value={formData.intensity2} onChange={handleChange} className="w-full h-1.5 bg-zinc-300 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
            <div className="flex justify-between text-[9px] text-zinc-400">
              <span>Автобус</span>
              <span>Навал</span>
            </div>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-bold py-2 rounded-md transition-colors flex items-center justify-center space-x-1 disabled:opacity-70 disabled:cursor-not-allowed mt-1"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Расчет...</span>
          </>
        ) : (
          <span>Анализировать линию</span>
        )}
      </button>
    </form>
  );
};
