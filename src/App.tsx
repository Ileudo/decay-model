import React, { useState } from 'react';
import { Activity } from 'lucide-react';
import { InputForm } from './components/InputForm';
import { ResultsView } from './components/ResultsView';
import { MinuteTable } from './components/MinuteTable';
import { MatchInput, PreMatchResult, LiveResult, MinuteRow } from './types';
import { solvePreMatch, calculateLiveOdds } from './lib/math';

export default function App() {
  const [isCalculating, setIsCalculating] = useState(false);
  const [preMatch, setPreMatch] = useState<PreMatchResult | null>(null);
  const [live, setLive] = useState<LiveResult | null>(null);
  const [inputData, setInputData] = useState<MatchInput | null>(null);
  const [tableData, setTableData] = useState<MinuteRow[]>([]);

  const handleCalculate = async (input: MatchInput) => {
    setIsCalculating(true);
    setInputData(input);
    
    // Use a short timeout to allow UI to render loading state
    setTimeout(() => {
      try {
        // 1. Calculate pre-match margin and true probabilities
        const pre = solvePreMatch(input.p1, input.x, input.p2);
        setPreMatch(pre);
        
        // 2. Calculate live odds for current minute using hybrid model
        const marginSum = pre.margin + 1;
        const liveOdds = calculateLiveOdds(pre.xG1, pre.xG2, input.score1, input.score2, input.minute, marginSum, input.minute <= 45 ? 1 : 2, input.intensity1, input.intensity2);
        
        // Map selected bet type to the calculated fair odds and calculated odds with margin
        let kFairTime = 0;
        let kCalculated = 0;
        
        switch(input.betType) {
          case 'П1': kCalculated = liveOdds.p1; kFairTime = liveOdds.p1Fair; break;
          case 'X': kCalculated = liveOdds.x; kFairTime = liveOdds.xFair; break;
          case 'П2': kCalculated = liveOdds.p2; kFairTime = liveOdds.p2Fair; break;
          case 'Ф1(0)': kCalculated = liveOdds.ah1_0; kFairTime = liveOdds.ah1_0Fair; break;
          case 'Ф2(0)': kCalculated = liveOdds.ah2_0; kFairTime = liveOdds.ah2_0Fair; break;
          case 'Ф1(-0.25)': kCalculated = liveOdds.ah1_025; kFairTime = liveOdds.ah1_025Fair; break;
          case 'Ф2(-0.25)': kCalculated = liveOdds.ah2_025; kFairTime = liveOdds.ah2_025Fair; break;
        }
        
        // I_time_drop is calculated using the modeled bookmaker line (with margin) vs Pinnacle odds
        const iTimeDrop = (kCalculated - input.kLive) / kCalculated;
        const verdict = kCalculated < input.kLive ? 'VALUE' : 'OVERREACTION';
        
        setLive({
          decayFactor: liveOdds.decayFactor,
          rem_xG1: liveOdds.rem_xG1,
          rem_xG2: liveOdds.rem_xG2,
          kCalculated,
          kFairTime,
          kLive: input.kLive,
          iTimeDrop,
          verdict
        });
        
        // 3. Generate minute-by-minute table (1 to 90+)
        const table: MinuteRow[] = [];
        
        const addRow = (display: string, m: number, period: 1 | 2) => {
          const rowOdds = calculateLiveOdds(pre.xG1, pre.xG2, input.score1, input.score2, m, marginSum, period, input.intensity1, input.intensity2);
          table.push({
            displayMinute: display,
            p1: rowOdds.p1,
            x: rowOdds.x,
            p2: rowOdds.p2,
            ah1_0: rowOdds.ah1_0,
            ah2_0: rowOdds.ah2_0,
            ah1_025: rowOdds.ah1_025,
            ah2_025: rowOdds.ah2_025,
            totalXg: rowOdds.rem_xG1 + rowOdds.rem_xG2
          });
        };

        // First Half
        for (let m = 1; m <= 45; m++) addRow(`${m}`, m, 1);
        addRow('45+1', 46, 1);
        addRow('45+2', 47, 1);
        
        // Second Half
        for (let m = 46; m <= 90; m++) addRow(`${m}`, m, 2);
        addRow('90+1', 91, 2);
        addRow('90+2', 92, 2);
        addRow('90+3', 93, 2);
        addRow('90+4', 94, 2);
        addRow('90+5', 95, 2);
        
        setTableData(table);
        
      } catch (error) {
        console.error("Calculation error:", error);
      } finally {
        setIsCalculating(false);
      }
    }, 50);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 pb-2">
      <header className="bg-white border-b border-zinc-200 px-4 py-2 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex items-center gap-2">
          <div className="bg-indigo-600 p-1.5 rounded-lg">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-lg font-bold tracking-tight text-zinc-900">Live Odds Actuary</h1>
          <span className="text-[10px] font-medium bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-full ml-1 border border-zinc-200">Time-Decay Model</span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 lg:px-6 pt-2 pb-2 space-y-2">
        <ResultsView preMatch={preMatch} live={live} inputData={inputData} />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4">
          <div className="lg:col-span-4">
            <InputForm onCalculate={handleCalculate} isLoading={isCalculating} />
          </div>
          <div className="lg:col-span-8">
            <MinuteTable data={tableData} currentMinute={inputData?.minute} />
          </div>
        </div>
      </main>
    </div>
  );
}
