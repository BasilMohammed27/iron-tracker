import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Dumbbell, TrendingUp, Calendar, Trash2 } from 'lucide-react';

interface SessionRecord {
  date: string;
  dayTitle: string;
  totalVolume: number;
  totalSets: number;
  durationSeconds: number;
}

export default function AnalyticsView() {
  const [history, setHistory] = useState<SessionRecord[]>(() => {
    try {
      const savedHistory = localStorage.getItem('iron_tracker_history');
      if (savedHistory) {
        return JSON.parse(savedHistory);
      }
    } catch (e) {
      console.error('Failed to parse history:', e);
    }
    // Sample mock history data if none logged yet so the chart looks vibrant
    const mockData: SessionRecord[] = [
      { date: 'Oct 10', dayTitle: 'Push A', totalVolume: 4200, totalSets: 18, durationSeconds: 2700 },
      { date: 'Oct 12', dayTitle: 'Pull A', totalVolume: 4650, totalSets: 18, durationSeconds: 2900 },
      { date: 'Oct 14', dayTitle: 'Legs A', totalVolume: 5100, totalSets: 16, durationSeconds: 3100 },
      { date: 'Oct 16', dayTitle: 'Push B', totalVolume: 4800, totalSets: 20, durationSeconds: 2850 }
    ];
    try {
      localStorage.setItem('iron_tracker_history', JSON.stringify(mockData));
    } catch (e) {
      console.error('Failed to save initial mock history:', e);
    }
    return mockData;
  });

  const clearHistory = () => {
    if (window.confirm("Clear all workout history?")) {
      setHistory([]);
      localStorage.removeItem('iron_tracker_history');
    }
  };

  const totalWorkouts = history.length;
  const maxVolume = history.length > 0 ? Math.max(...history.map(h => h.totalVolume)) : 0;
  const totalTonnageLifted = history.reduce((acc, curr) => acc + curr.totalVolume, 0);

  return (
    <div className="max-w-xl mx-auto px-4 py-6 pb-28">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <TrendingUp className="text-gym-highlight w-7 h-7" /> PROGRESS HUB
          </h1>
          <p className="text-xs text-gym-muted font-medium mt-0.5">Volume Progression & History</p>
        </div>

        {history.length > 0 && (
          <button
            onClick={clearHistory}
            className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/50 text-slate-400 hover:text-rose-400 transition-all"
            title="Clear History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </header>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-gym-card border border-gym-border p-4 rounded-2xl shadow-lg">
          <span className="text-[10px] uppercase font-bold text-gym-muted block mb-1">Workouts</span>
          <span className="text-xl font-black font-mono text-white">{totalWorkouts}</span>
        </div>
        <div className="bg-gym-card border border-gym-border p-4 rounded-2xl shadow-lg">
          <span className="text-[10px] uppercase font-bold text-gym-muted block mb-1">Peak Volume</span>
          <span className="text-xl font-black font-mono text-gym-accent">{maxVolume} <span className="text-xs">kg</span></span>
        </div>
        <div className="bg-gym-card border border-gym-border p-4 rounded-2xl shadow-lg">
          <span className="text-[10px] uppercase font-bold text-gym-muted block mb-1">Total Tonnage</span>
          <span className="text-xl font-black font-mono text-gym-highlight">{totalTonnageLifted} <span className="text-xs">kg</span></span>
        </div>
      </div>

      {/* Recharts Volume Curve */}
      <div className="bg-gym-card border border-gym-border rounded-2xl p-5 mb-6 shadow-xl">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Dumbbell className="w-4 h-4 text-gym-accent" /> Tonnage Lifted per Session (kg)
        </h3>
        
        {history.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-gym-muted text-xs">
            No completed workouts recorded yet. Finish a workout to see charts!
          </div>
        ) : (
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
                <XAxis dataKey="date" stroke="#8b949e" fontSize={11} />
                <YAxis stroke="#8b949e" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#161b22', borderColor: '#30363d', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="totalVolume" 
                  stroke="#10b981" 
                  strokeWidth={3} 
                  dot={{ fill: '#10b981', r: 4 }} 
                  activeDot={{ r: 6, fill: '#38bdf8' }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Recent Sessions List */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white mb-2">Recent Sessions</h3>
        {history.slice().reverse().map((rec, idx) => (
          <div key={idx} className="bg-gym-card border border-gym-border rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-800 text-gym-accent flex items-center justify-center font-bold">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{rec.dayTitle}</h4>
                <p className="text-xs text-gym-muted">{rec.date} • {Math.floor(rec.durationSeconds / 60)} mins</p>
              </div>
            </div>
            <div className="text-right font-mono">
              <span className="text-sm font-bold text-gym-accent block">{rec.totalVolume} kg</span>
              <span className="text-[10px] text-gym-muted">{rec.totalSets} sets</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}