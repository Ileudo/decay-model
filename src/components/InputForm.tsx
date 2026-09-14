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
        formData.score1, formData.score2, formData.minute
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
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-zinc-200 p-4">
      <div className="bg-zinc-50 rounded-lg p-3 border border-zinc-200 mb-4 space-y-2">
        <label className="block text-sm font-medium text-zinc-700 flex items-center gap-2">
          <Wand2 className="w-4 h-4 text-indigo-500" />
          Быстрый импорт из сигнала (Telegram)
        </label>
        <textarea
          value={rawText}
          onChange={handleTextChange}
          placeholder="Вставьте текст сигнала для автозаполнения..."
          className="w-full h-16 px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none bg-white"
        />
      </div>

      <div className="space-y-3 mb-4">
        {/* Прематч 1X2 */}
        <div className="space-y-1.5">
          <h3 className="text-xs font-semibold text-zinc-900 border-b border-zinc-100 pb-1">Прематч 1X2</h3>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[10px] font-medium text-zinc-500 mb-0.5">П1 (Home)</label>
              <input type="number" step="0.01" name="p1" value={formData.p1} onChange={handleChange} className="w-full px-2 py-1 text-sm border border-zinc-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" required />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-zinc-500 mb-0.5">X (Draw)</label>
              <input type="number" step="0.01" name="x" value={formData.x} onChange={handleChange} className="w-full px-2 py-1 text-sm border border-zinc-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" required />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-zinc-500 mb-0.5">П2 (Away)</label>
              <input type="number" step="0.01" name="p2" value={formData.p2} onChange={handleChange} className="w-full px-2 py-1 text-sm border border-zinc-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" required />
            </div>
          </div>
        </div>

        {/* Тотал */}
        <div className="space-y-1.5">
          <h3 className="text-xs font-semibold text-zinc-900 border-b border-zinc-100 pb-1">Тотал</h3>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-medium text-zinc-500 mb-0.5">Значение Тотала</label>
              <input type="number" step="0.25" name="total" value={formData.total} onChange={handleChange} className="w-full px-2 py-1 text-sm border border-zinc-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" required />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-zinc-500 mb-0.5">Кэф ТМ (Under)</label>
              <input type="number" step="0.01" name="underOdds" value={formData.underOdds} onChange={handleChange} className="w-full px-2 py-1 text-sm border border-zinc-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" required />
            </div>
          </div>
        </div>

        {/* Лайв Ситуация */}
        <div className="space-y-1.5">
          <h3 className="text-xs font-semibold text-zinc-900 border-b border-zinc-100 pb-1">Лайв Ситуация</h3>
          <div className="grid grid-cols-5 gap-2 mb-2">
            <div>
              <label className="block text-[10px] font-medium text-zinc-500 mb-0.5">Минута (1-90)</label>
              <input type="number" step="1" min="1" max="90" name="minute" value={formData.minute} onChange={handleChange} className="w-full px-2 py-1 text-sm border border-zinc-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" required />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-zinc-500 mb-0.5 leading-tight">Счет (Хозяева)</label>
              <input type="number" step="1" min="0" name="score1" value={formData.score1} onChange={handleChange} className="w-full px-2 py-1 text-sm border border-zinc-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" required />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-zinc-500 mb-0.5 leading-tight">Счет (Гости)</label>
              <input type="number" step="1" min="0" name="score2" value={formData.score2} onChange={handleChange} className="w-full px-2 py-1 text-sm border border-zinc-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" required />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-zinc-500 mb-0.5">Тип ставки</label>
              <select name="betType" value={formData.betType} onChange={handleChange} className="w-full px-2 py-1 text-sm border border-zinc-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white" required>
                <option value="П1">П1</option>
                <option value="X">X</option>
                <option value="П2">П2</option>
                <option value="Ф1(0)">Ф1(0)</option>
                <option value="Ф2(0)">Ф2(0)</option>
                <option value="Ф1(-0.25)">Ф1(-0.25)</option>
                <option value="Ф2(-0.25)">Ф2(-0.25)</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-medium text-zinc-500 mb-0.5">Кэф (K_live)</label>
              <input type="number" step="0.01" name="kLive" value={formData.kLive} onChange={handleChange} className="w-full px-2 py-1 text-sm border border-zinc-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" required />
            </div>
          </div>
          
          {/* Live 1X2 для калибровки */}
          <div className="bg-blue-50/50 p-2 rounded-lg border border-blue-100">
            <h4 className="text-[10px] font-semibold text-blue-800 mb-1.5 uppercase tracking-wide">Live 1X2 для калибровки</h4>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[9px] font-medium text-blue-600/80 mb-0.5">Live П1</label>
                <input type="number" step="0.01" name="liveP1" value={formData.liveP1 || ''} onChange={handleChange} className="w-full px-2 py-1 text-sm border border-blue-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white" placeholder="—" />
              </div>
              <div>
                <label className="block text-[9px] font-medium text-blue-600/80 mb-0.5">Live X</label>
                <input type="number" step="0.01" name="liveX" value={formData.liveX || ''} onChange={handleChange} className="w-full px-2 py-1 text-sm border border-blue-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white" placeholder="—" />
              </div>
              <div>
                <label className="block text-[9px] font-medium text-blue-600/80 mb-0.5">Live П2</label>
                <input type="number" step="0.01" name="liveP2" value={formData.liveP2 || ''} onChange={handleChange} className="w-full px-2 py-1 text-sm border border-blue-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white" placeholder="—" />
              </div>
            </div>
          </div>
        </div>

        {/* Ручная корректировка тактики */}
        <div className="space-y-1.5 pt-2 border-t border-zinc-100">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-zinc-900">Лайв Активность (Тактика)</h3>
            <span className="text-[9px] text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded-full">100% = Стандартная Модель</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px]">
                <label className="font-medium text-zinc-600">Хозяева (П1)</label>
                <span className={`font-mono ${formData.intensity1 > 1.0 ? 'text-green-600' : formData.intensity1 < 1.0 ? 'text-red-500' : 'text-zinc-500'}`}>{Math.round(formData.intensity1 * 100)}%</span>
              </div>
              <input type="range" name="intensity1" min="0.5" max="2.0" step="0.01" value={formData.intensity1} onChange={handleChange} className="w-full h-1 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
              <div className="flex justify-between text-[9px] text-zinc-400">
                <span>Автобус</span>
                <span>Навал / +Вр</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px]">
                <label className="font-medium text-zinc-600">Гости (П2)</label>
                <span className={`font-mono ${formData.intensity2 > 1.0 ? 'text-green-600' : formData.intensity2 < 1.0 ? 'text-red-500' : 'text-zinc-500'}`}>{Math.round(formData.intensity2 * 100)}%</span>
              </div>
              <input type="range" name="intensity2" min="0.5" max="2.0" step="0.01" value={formData.intensity2} onChange={handleChange} className="w-full h-1 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
              <div className="flex justify-between text-[9px] text-zinc-400">
                <span>Автобус</span>
                <span>Навал / +Вр</span>
              </div>
            </div>
          </div>
        </div>

        {/* Авто-Калибровка */}
        <div className="pt-2 border-t border-zinc-100">
          <div className="flex gap-2">
            <button 
              type="button" 
              onClick={handleAutoCalibrate}
              className="flex-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-[11px] font-medium py-1.5 rounded-md transition-colors"
            >
              Подобрать идеальную активность (по Live 1X2)
            </button>
            <button 
              type="button" 
              onClick={handleResetCalibration}
              className="px-2.5 bg-zinc-50 hover:bg-zinc-100 text-zinc-500 border border-zinc-200 text-sm font-medium py-1.5 rounded-md transition-colors flex items-center justify-center"
              title="Сбросить на 100%"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
