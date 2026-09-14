import React, { useState } from 'react';
import { BetType, MatchInput } from '../types';
import { Wand2 } from 'lucide-react';
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
    intensity1: 1.0,
    intensity2: 1.0,
  });
  
  const [rawText, setRawText] = useState('');
  const [calib, setCalib] = useState({ p1: '', x: '', p2: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'betType' ? value : parseFloat(value) || 0,
    }));
  };

  const handleAutoCalibrate = () => {
    const p1 = parseFloat(calib.p1);
    const x = parseFloat(calib.x);
    const p2 = parseFloat(calib.p2);
    
    if (p1 && x && p2) {
      const { m1, m2 } = autoCalibrate(
        formData.p1, formData.x, formData.p2,
        p1, x, p2,
        formData.minute, formData.score1, formData.score2
      );
      const newData = {
        ...formData,
        intensity1: m1,
        intensity2: m2
      };
      setFormData(newData);
      onCalculate(newData);
    }
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
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-zinc-200 p-5">
      <div className="bg-zinc-50 rounded-lg p-3 border border-zinc-200 mb-5 space-y-2">
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

      <div className="space-y-4 mb-5">
        {/* Прематч 1X2 */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-zinc-900 border-b border-zinc-100 pb-1">Прематч 1X2</h3>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">П1 (Home)</label>
              <input type="number" step="0.01" name="p1" value={formData.p1} onChange={handleChange} className="w-full px-2 py-1.5 text-sm border border-zinc-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">X (Draw)</label>
              <input type="number" step="0.01" name="x" value={formData.x} onChange={handleChange} className="w-full px-2 py-1.5 text-sm border border-zinc-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">П2 (Away)</label>
              <input type="number" step="0.01" name="p2" value={formData.p2} onChange={handleChange} className="w-full px-2 py-1.5 text-sm border border-zinc-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" required />
            </div>
          </div>
        </div>

        {/* Тотал */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-zinc-900 border-b border-zinc-100 pb-1">Тотал</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">Значение Тотала</label>
              <input type="number" step="0.25" name="total" value={formData.total} onChange={handleChange} className="w-full px-2 py-1.5 text-sm border border-zinc-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">Кэф ТМ (Under)</label>
              <input type="number" step="0.01" name="underOdds" value={formData.underOdds} onChange={handleChange} className="w-full px-2 py-1.5 text-sm border border-zinc-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" required />
            </div>
          </div>
        </div>

        {/* Лайв Ситуация */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-zinc-900 border-b border-zinc-100 pb-1">Лайв Ситуация</h3>
          <div className="grid grid-cols-5 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">Минута (1-90)</label>
              <input type="number" step="1" min="1" max="90" name="minute" value={formData.minute} onChange={handleChange} className="w-full px-2 py-1.5 text-sm border border-zinc-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" required />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-zinc-500 mb-1 leading-tight">Счет (Хозяева)</label>
              <input type="number" step="1" min="0" name="score1" value={formData.score1} onChange={handleChange} className="w-full px-2 py-1.5 text-sm border border-zinc-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" required />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-zinc-500 mb-1 leading-tight">Счет (Гости)</label>
              <input type="number" step="1" min="0" name="score2" value={formData.score2} onChange={handleChange} className="w-full px-2 py-1.5 text-sm border border-zinc-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">Тип ставки</label>
              <select name="betType" value={formData.betType} onChange={handleChange} className="w-full px-2 py-1.5 text-sm border border-zinc-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white" required>
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
              <label className="block text-xs font-medium text-zinc-500 mb-1">Кэф (K_live)</label>
              <input type="number" step="0.01" name="kLive" value={formData.kLive} onChange={handleChange} className="w-full px-2 py-1.5 text-sm border border-zinc-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" required />
            </div>
          </div>
        </div>

        {/* Ручная корректировка тактики */}
        <div className="space-y-2 pt-2 border-t border-zinc-100">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-zinc-900">Лайв Активность (Тактика)</h3>
            <span className="text-[10px] text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-full">100% = Стандартная Модель</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <label className="font-medium text-zinc-600">Хозяева (П1)</label>
                <span className={`font-mono ${formData.intensity1 > 1.0 ? 'text-green-600' : formData.intensity1 < 1.0 ? 'text-red-500' : 'text-zinc-500'}`}>{Math.round(formData.intensity1 * 100)}%</span>
              </div>
              <input type="range" name="intensity1" min="0.5" max="2.0" step="0.01" value={formData.intensity1} onChange={handleChange} className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
              <div className="flex justify-between text-[10px] text-zinc-400">
                <span>Автобус</span>
                <span>Навал / +Вр</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <label className="font-medium text-zinc-600">Гости (П2)</label>
                <span className={`font-mono ${formData.intensity2 > 1.0 ? 'text-green-600' : formData.intensity2 < 1.0 ? 'text-red-500' : 'text-zinc-500'}`}>{Math.round(formData.intensity2 * 100)}%</span>
              </div>
              <input type="range" name="intensity2" min="0.5" max="2.0" step="0.01" value={formData.intensity2} onChange={handleChange} className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
              <div className="flex justify-between text-[10px] text-zinc-400">
                <span>Автобус</span>
                <span>Навал / +Вр</span>
              </div>
            </div>
          </div>
        </div>

        {/* Авто-Калибровка */}
        <div className="space-y-2 pt-3 border-t border-zinc-100">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-medium text-zinc-900">Авто-калибровка по текущей линии (1X2)</h3>
          </div>
          <div className="flex gap-2">
            <input type="number" step="0.01" value={calib.p1} onChange={e => setCalib({...calib, p1: e.target.value})} placeholder="П1 (Live)" className="w-1/3 px-2 py-1.5 text-sm border border-zinc-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" />
            <input type="number" step="0.01" value={calib.x} onChange={e => setCalib({...calib, x: e.target.value})} placeholder="X (Live)" className="w-1/3 px-2 py-1.5 text-sm border border-zinc-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" />
            <input type="number" step="0.01" value={calib.p2} onChange={e => setCalib({...calib, p2: e.target.value})} placeholder="П2 (Live)" className="w-1/3 px-2 py-1.5 text-sm border border-zinc-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" />
          </div>
          <button 
            type="button" 
            onClick={handleAutoCalibrate}
            className="w-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-sm font-medium py-1.5 rounded-md transition-colors"
          >
            Подобрать идеальную активность
          </button>
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
