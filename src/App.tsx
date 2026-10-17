import React, { useState } from 'react';
import WorkoutTracker from './WorkoutTracker';
import AnalyticsView from './AnalyticsView';
import { Dumbbell, TrendingUp } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'workout' | 'analytics'>('workout');

  return (
    <div className="min-h-screen bg-gym-bg text-slate-100 flex flex-col justify-between">
      {/* Main Content Area */}
      <main className="flex-1 pb-24">
        {currentTab === 'workout' ? <WorkoutTracker /> : <AnalyticsView />}
      </main>

      {/* Fixed Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#161b22]/95 backdrop-blur-md border-t border-[#30363d] py-3 px-8 flex justify-around items-center z-50 max-w-xl mx-auto shadow-2xl">
        <button
          onClick={() => setCurrentTab('workout')}
          className={`flex flex-col items-center gap-1.5 transition-all ${
            currentTab === 'workout' ? 'text-emerald-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Dumbbell className="w-6 h-6" />
          <span className="text-xs">Workout</span>
        </button>

        <button
          onClick={() => setCurrentTab('analytics')}
          className={`flex flex-col items-center gap-1.5 transition-all ${
            currentTab === 'analytics' ? 'text-sky-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <TrendingUp className="w-6 h-6" />
          <span className="text-xs">Progress</span>
        </button>
      </nav>
    </div>
  );
}