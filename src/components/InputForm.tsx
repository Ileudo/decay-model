import React, { useState } from 'react';
import { BetType, MatchInput } from '../types';
import { Wand2 } from 'lucide-react';
import { parseRawText } from '../lib/parser';

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
    betType: 'Ф2(0)',
    kLive: 2.13,
  });
  
  const [rawText, setRawText] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'betType' ? value : parseFloat(value) || 0,
    }));
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
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6">
      <div className="bg-zinc-50 rounded-lg p-4 border border-zinc-200 mb-6 space-y-3">
        <label className="block text-sm font-medium text-zinc-700 flex items-center gap-2">
          <Wand2 className="w-4 h-4 text-indigo-500" />
          Быстрый импорт из сигнала (Telegram)
        </label>
        <textarea
          value={rawText}
          onChange={handleTextChange}
          placeholder="Вставьте текст сигнала для автозаполнения..."
          className="w-full h-24 px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none bg-white"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="space-y-4">
          <h3 className="font-medium text-zinc-900 border-b border-zinc-100 pb-2">Прематч 1X2</h3>
          <div>
            <label className="block text-sm font-medium text-zinc-600 mb-1">П1 (Home)</label>
            <input type="number" step="0.01" name="p1" value={formData.p1} onChange={handleChange} className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-600 mb-1">X (Draw)</label>
            <input type="number" step="0.01" name="x" value={formData.x} onChange={handleChange} className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-600 mb-1">П2 (Away)</label>
            <input type="number" step="0.01" name="p2" value={formData.p2} onChange={handleChange} className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" required />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium text-zinc-900 border-b border-zinc-100 pb-2">Тотал</h3>
          <div>
            <label className="block text-sm font-medium text-zinc-600 mb-1">Значение Тотала</label>
            <input type="number" step="0.25" name="total" value={formData.total} onChange={handleChange} className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-600 mb-1">Кэф ТМ (Under)</label>
            <input type="number" step="0.01" name="underOdds" value={formData.underOdds} onChange={handleChange} className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" required />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium text-zinc-900 border-b border-zinc-100 pb-2">Лайв Ситуация</h3>
          <div>
            <label className="block text-sm font-medium text-zinc-600 mb-1">Текущая минута (1-90)</label>
            <input type="number" step="1" min="1" max="90" name="minute" value={formData.minute} onChange={handleChange} className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-600 mb-1">Тип ставки</label>
            <select name="betType" value={formData.betType} onChange={handleChange} className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white" required>
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
            <label className="block text-sm font-medium text-zinc-600 mb-1">Pinnacle Кэф (K_live)</label>
            <input type="number" step="0.01" name="kLive" value={formData.kLive} onChange={handleChange} className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" required />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
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
