import { useState, useEffect, useCallback } from 'react';
import { WORKOUT_PLAN, type Exercise, type WorkoutDay } from './workoutData';
import { 
  Dumbbell, 
  CheckCircle2, 
  Circle, 
  Timer, 
  Info, 
  X, 
  Trophy, 
  Play, 
  RotateCcw,
  Sparkles
} from 'lucide-react';

interface SetLog {
  weight: number;
  reps: number;
  completed: boolean;
}

interface CompletedSession {
  date: string;
  dayTitle: string;
  totalVolume: number;
  totalSets: number;
  durationSeconds: number;
}

const parseDefaultReps = (targetReps: string): number => {
  const match = targetReps.match(/\d+/);
  return match ? parseInt(match[0], 10) : 10;
};

const getDefaultLogsForExercise = (ex: Exercise): SetLog[] => {
  const reps = parseDefaultReps(ex.targetReps);
  return Array.from({ length: ex.targetSets }, () => ({
    weight: 20,
    reps,
    completed: false
  }));
};

const formatTime = (totalSec: number) => {
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export default function WorkoutTracker() {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [isLive, setIsLive] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [restSeconds, setRestSeconds] = useState(0);
  const [activeRestTimer, setActiveRestTimer] = useState(false);
  
  // Set logs state keyed by exerciseId -> array of SetLog with safe localStorage recovery
  const [sessionLogs, setSessionLogs] = useState<Record<string, SetLog[]>>(() => {
    try {
      const saved = localStorage.getItem('iron_tracker_active_logs');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (err) {
      console.error('Failed to parse saved session logs:', err);
    }
    return {};
  });
  
  // Modal states
  const [selectedExerciseForTips, setSelectedExerciseForTips] = useState<Exercise | null>(null);
  const [summaryData, setSummaryData] = useState<CompletedSession | null>(null);

  const currentDay: WorkoutDay = WORKOUT_PLAN[selectedDayIndex];

  const handleDismissSummary = useCallback(() => {
    // Clear completed status for the current day's exercises for the next session
    setSessionLogs(prev => {
      const updated = { ...prev };
      currentDay.exercises.forEach(ex => {
        if (updated[ex.id]) {
          updated[ex.id] = updated[ex.id].map(s => ({ ...s, completed: false }));
        }
      });
      return updated;
    });
    setSummaryData(null);
    setElapsedSeconds(0);
    setIsLive(false);
  }, [currentDay.exercises]);

  // Persist session logs to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('iron_tracker_active_logs', JSON.stringify(sessionLogs));
    } catch (err) {
      console.error('Failed to save session logs:', err);
    }
  }, [sessionLogs]);

  // Overall workout timer
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isLive]);

  // Rest countdown timer (90s default)
  useEffect(() => {
    if (!activeRestTimer) return;

    const timer = setInterval(() => {
      setRestSeconds(prev => {
        if (prev <= 1) {
          setActiveRestTimer(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeRestTimer]);

  // Handle ESC key and scroll locking when modals are open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedExerciseForTips(null);
        if (summaryData) {
          handleDismissSummary();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [summaryData, handleDismissSummary]);

  useEffect(() => {
    if (selectedExerciseForTips || summaryData) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedExerciseForTips, summaryData]);

  const getExerciseSets = (exercise: Exercise): SetLog[] => {
    return sessionLogs[exercise.id] || getDefaultLogsForExercise(exercise);
  };

  const handleUpdateSet = (exercise: Exercise, setIndex: number, field: 'weight' | 'reps', delta: number) => {
    setSessionLogs(prev => {
      const currentSets = [...(prev[exercise.id] || getDefaultLogsForExercise(exercise))];
      if (!currentSets[setIndex]) return prev;
      const currentVal = currentSets[setIndex][field];
      const rawNewVal = currentVal + delta;
      const newVal = Math.max(0, field === 'weight' ? Math.round(rawNewVal * 10) / 10 : Math.round(rawNewVal));
      currentSets[setIndex] = { ...currentSets[setIndex], [field]: newVal };
      return { ...prev, [exercise.id]: currentSets };
    });
  };

  const handleSetDirectValue = (exercise: Exercise, setIndex: number, field: 'weight' | 'reps', value: number) => {
    setSessionLogs(prev => {
      const currentSets = [...(prev[exercise.id] || getDefaultLogsForExercise(exercise))];
      if (!currentSets[setIndex]) return prev;
      const sanitizedVal = Math.max(0, isNaN(value) ? 0 : field === 'weight' ? Math.round(value * 10) / 10 : Math.round(value));
      currentSets[setIndex] = { ...currentSets[setIndex], [field]: sanitizedVal };
      return { ...prev, [exercise.id]: currentSets };
    });
  };

  const handleToggleComplete = (exercise: Exercise, setIndex: number) => {
    setSessionLogs(prev => {
      const currentSets = [...(prev[exercise.id] || getDefaultLogsForExercise(exercise))];
      const currentState = currentSets[setIndex]?.completed;
      currentSets[setIndex] = { ...currentSets[setIndex], completed: !currentState };
      
      // Start rest timer if checking off
      if (!currentState) {
        setRestSeconds(90);
        setActiveRestTimer(true);
      }
      return { ...prev, [exercise.id]: currentSets };
    });
  };

  const handleCompleteWorkout = () => {
    setIsLive(false);
    let totalVolume = 0;
    let completedSets = 0;

    currentDay.exercises.forEach(exercise => {
      const sets = sessionLogs[exercise.id] || getDefaultLogsForExercise(exercise);
      sets.forEach(s => {
        if (s.completed) {
          totalVolume += s.weight * s.reps;
          completedSets += 1;
        }
      });
    });

    const summary: CompletedSession = {
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      dayTitle: currentDay.title,
      totalVolume: Math.round(totalVolume * 10) / 10,
      totalSets: completedSets,
      durationSeconds: elapsedSeconds
    };

    // Save completed workout session into history
    try {
      const history: CompletedSession[] = JSON.parse(localStorage.getItem('iron_tracker_history') || '[]');
      history.unshift(summary);
      localStorage.setItem('iron_tracker_history', JSON.stringify(history));
    } catch (err) {
      console.error('Failed to save workout history:', err);
    }

    setSummaryData(summary);
  };

  const handleResetSession = () => {
    if (window.confirm('Reset current workout timer and completed sets?')) {
      setIsLive(false);
      setElapsedSeconds(0);
      setActiveRestTimer(false);
      setRestSeconds(0);
      setSessionLogs(prev => {
        const updated = { ...prev };
        currentDay.exercises.forEach(ex => {
          if (updated[ex.id]) {
            updated[ex.id] = updated[ex.id].map(s => ({ ...s, completed: false }));
          }
        });
        return updated;
      });
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-6 pb-28">
      {/* Top Header */}
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <Dumbbell className="text-gym-accent w-7 h-7" /> IRON TRACKER
          </h1>
          <p className="text-xs text-gym-muted font-medium mt-0.5">Rotating 6-Day PPL Microcycle</p>
        </div>

        {/* Live Timer Pill */}
        {isLive && (
          <div className="flex items-center gap-2 bg-gym-card border border-gym-highlight/40 px-3 py-1.5 rounded-full shadow-lg">
            <span className="w-2 h-2 rounded-full bg-gym-highlight animate-ping" />
            <span className="text-sm font-mono font-bold text-gym-highlight">{formatTime(elapsedSeconds)}</span>
          </div>
        )}
      </header>

      {/* Routine Navigation (Microcycle Days) */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
        {WORKOUT_PLAN.map((plan, idx) => {
          const isActive = idx === selectedDayIndex;
          return (
            <button
              key={plan.id}
              type="button"
              disabled={isLive && !isActive}
              onClick={() => {
                if (!isLive) setSelectedDayIndex(idx);
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex flex-col items-start border ${
                isActive
                  ? 'bg-gym-accent text-black border-gym-accent shadow-md shadow-gym-accent/20 scale-[1.02]'
                  : isLive
                    ? 'bg-gym-card/50 text-gym-muted/40 border-gym-border/40 cursor-not-allowed'
                    : 'bg-gym-card text-gym-muted border-gym-border hover:border-slate-500'
              }`}
              title={isLive && !isActive ? 'Finish or reset current session to switch routines' : undefined}
            >
              <span>{plan.title}</span>
              <span className={`text-[10px] font-normal ${isActive ? 'text-black/80' : isLive ? 'text-gym-muted/40' : 'text-gym-muted'}`}>
                {plan.focus}
              </span>
            </button>
          );
        })}
      </div>

      {/* Workout Overview Hero */}
      <div className="bg-gym-card border border-gym-border rounded-2xl p-5 mb-6 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-gym-accent bg-gym-accent/10 px-2.5 py-1 rounded-md">
              {currentDay.focus} Routine
            </span>
            <h2 className="text-xl font-extrabold text-white mt-2">{currentDay.title}</h2>
            <p className="text-sm text-gym-muted">{currentDay.subtitle}</p>
          </div>

          {!isLive ? (
            <button
              type="button"
              onClick={() => {
                setIsLive(true);
                setElapsedSeconds(0);
              }}
              className="flex items-center gap-2 bg-gym-accent hover:bg-emerald-400 text-black font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-gym-accent/20 transition-all text-sm"
            >
              <Play className="w-4 h-4 fill-black" /> Start
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetSession}
                title="Reset session"
                aria-label="Reset current session"
                className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-all text-sm border border-gym-border/50"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleCompleteWorkout}
                className="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-black font-bold px-4 py-2.5 rounded-xl shadow-lg transition-all text-sm"
              >
                <Trophy className="w-4 h-4" /> Finish
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Exercises List */}
      <div className="space-y-4">
        {currentDay.exercises.map((exercise, exIndex) => {
          const sets = getExerciseSets(exercise);

          return (
            <div 
              key={exercise.id} 
              className="bg-gym-card border border-gym-border rounded-2xl p-4 shadow-sm"
            >
              {/* Exercise Header */}
              <div className="flex items-center justify-between mb-3 border-b border-gym-border/60 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-slate-800 text-gym-muted text-xs font-bold flex items-center justify-center">
                    {exIndex + 1}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-white leading-snug">{exercise.name}</h3>
                    <p className="text-xs text-gym-muted">Target: {exercise.targetSets} sets × {exercise.targetReps} reps</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedExerciseForTips(exercise)}
                  aria-label={`View form tips for ${exercise.name}`}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-gym-highlight transition-all"
                  title="Form Cues"
                >
                  <Info className="w-4 h-4" />
                </button>
              </div>

              {/* Set Logging Rows */}
              <div className="space-y-2">
                <div className="grid grid-cols-12 text-[10px] font-bold text-gym-muted uppercase px-2">
                  <span className="col-span-2">Set</span>
                  <span className="col-span-4 text-center">Weight (kg)</span>
                  <span className="col-span-4 text-center">Reps</span>
                  <span className="col-span-2 text-right">Done</span>
                </div>

                {sets.map((set, sIdx) => (
                  <div
                    key={sIdx}
                    className={`grid grid-cols-12 items-center px-2 py-2 rounded-xl transition-all ${
                      set.completed 
                        ? 'bg-gym-accent/10 border border-gym-accent/30' 
                        : 'bg-slate-900/60 border border-gym-border/40'
                    }`}
                  >
                    <span className="col-span-2 font-mono text-xs font-bold text-slate-300 pl-1">
                      #{sIdx + 1}
                    </span>

                    {/* Weight Controls */}
                    <div className="col-span-4 flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleUpdateSet(exercise, sIdx, 'weight', -2.5)}
                        aria-label={`Decrease weight for set ${sIdx + 1}`}
                        className="w-6 h-6 rounded-md bg-slate-800 text-slate-300 hover:bg-slate-700 active:scale-95 flex items-center justify-center font-bold text-xs transition-all"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        value={set.weight}
                        onChange={(e) => handleSetDirectValue(exercise, sIdx, 'weight', parseFloat(e.target.value))}
                        aria-label={`Weight in kg for set ${sIdx + 1}`}
                        className="font-mono text-xs font-bold w-12 text-center text-white bg-slate-800/50 hover:bg-slate-800 focus:bg-slate-900 border border-transparent focus:border-gym-highlight/50 rounded py-0.5 outline-none transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleUpdateSet(exercise, sIdx, 'weight', 2.5)}
                        aria-label={`Increase weight for set ${sIdx + 1}`}
                        className="w-6 h-6 rounded-md bg-slate-800 text-slate-300 hover:bg-slate-700 active:scale-95 flex items-center justify-center font-bold text-xs transition-all"
                      >
                        +
                      </button>
                    </div>

                    {/* Reps Controls */}
                    <div className="col-span-4 flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleUpdateSet(exercise, sIdx, 'reps', -1)}
                        aria-label={`Decrease reps for set ${sIdx + 1}`}
                        className="w-6 h-6 rounded-md bg-slate-800 text-slate-300 hover:bg-slate-700 active:scale-95 flex items-center justify-center font-bold text-xs transition-all"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        step="1"
                        min="0"
                        value={set.reps}
                        onChange={(e) => handleSetDirectValue(exercise, sIdx, 'reps', parseInt(e.target.value, 10))}
                        aria-label={`Reps for set ${sIdx + 1}`}
                        className="font-mono text-xs font-bold w-10 text-center text-white bg-slate-800/50 hover:bg-slate-800 focus:bg-slate-900 border border-transparent focus:border-gym-highlight/50 rounded py-0.5 outline-none transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleUpdateSet(exercise, sIdx, 'reps', 1)}
                        aria-label={`Increase reps for set ${sIdx + 1}`}
                        className="w-6 h-6 rounded-md bg-slate-800 text-slate-300 hover:bg-slate-700 active:scale-95 flex items-center justify-center font-bold text-xs transition-all"
                      >
                        +
                      </button>
                    </div>

                    {/* Checkmark Button */}
                    <div className="col-span-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleToggleComplete(exercise, sIdx)}
                        aria-label={`Mark set ${sIdx + 1} as ${set.completed ? 'incomplete' : 'complete'}`}
                        className={`p-1.5 rounded-lg transition-transform active:scale-90 ${
                          set.completed ? 'text-gym-accent' : 'text-slate-600 hover:text-slate-400'
                        }`}
                      >
                        {set.completed ? (
                          <CheckCircle2 className="w-5 h-5 fill-gym-accent/20" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Rest Timer Pill */}
      {activeRestTimer && restSeconds > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 border border-gym-highlight shadow-2xl shadow-cyan-500/20 px-5 py-3 rounded-full flex items-center gap-3 z-40 backdrop-blur-md">
          <Timer className="w-5 h-5 text-gym-highlight animate-pulse" />
          <div className="text-xs">
            <span className="text-gym-muted block leading-none">Rest Interval</span>
            <span className="font-mono font-bold text-base text-gym-highlight leading-tight">
              {formatTime(restSeconds)}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setActiveRestTimer(false)}
            aria-label="Dismiss rest timer"
            className="p-1 rounded-full text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Bottom Form Tips Sheet */}
      {selectedExerciseForTips && (
        <div 
          role="dialog"
          aria-modal="true"
          aria-labelledby="form-tips-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedExerciseForTips(null);
          }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
          <div className="bg-gym-card border border-gym-border w-full max-w-lg rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-[10px] font-bold text-gym-highlight uppercase tracking-wider">Form Guide & Anatomy</span>
                <h3 id="form-tips-title" className="text-lg font-black text-white">{selectedExerciseForTips.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedExerciseForTips(null)}
                aria-label="Close form guide"
                className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-900/80 border border-gym-border rounded-xl p-4 mb-4">
              <p className="text-xs font-bold text-gym-muted mb-1">EXECUTION CUES</p>
              <p className="text-sm text-slate-200 leading-relaxed">{selectedExerciseForTips.formTips}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs mb-4">
              <div className="bg-slate-900/60 p-3 rounded-xl border border-gym-border/40">
                <span className="text-gym-muted block">Target Reps</span>
                <span className="text-white font-bold font-mono">{selectedExerciseForTips.targetReps}</span>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-xl border border-gym-border/40">
                <span className="text-gym-muted block">Muscle Group</span>
                <span className="text-white font-bold">{selectedExerciseForTips.category}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedExerciseForTips(null)}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl text-sm transition-colors"
            >
              Got It
            </button>
          </div>
        </div>
      )}

      {/* Post Workout Perspective Summary Modal */}
      {summaryData && (
        <div 
          role="dialog"
          aria-modal="true"
          aria-labelledby="summary-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleDismissSummary();
          }}
          className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4"
        >
          <div className="bg-gym-card border border-gym-accent/40 w-full max-w-md rounded-2xl p-6 text-center shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-gym-accent/10 border border-gym-accent/30 text-gym-accent flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-7 h-7" />
            </div>

            <h2 id="summary-title" className="text-xl font-black text-white">Workout Crushed!</h2>
            <p className="text-xs text-gym-muted mt-1">{summaryData.dayTitle} • {summaryData.date}</p>

            <div className="grid grid-cols-3 gap-2 my-6">
              <div className="bg-slate-900/80 p-3 rounded-xl border border-gym-border">
                <span className="text-[10px] text-gym-muted block uppercase">Volume</span>
                <span className="text-sm font-black font-mono text-gym-accent">{summaryData.totalVolume} kg</span>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-xl border border-gym-border">
                <span className="text-[10px] text-gym-muted block uppercase">Duration</span>
                <span className="text-sm font-black font-mono text-white">{formatTime(summaryData.durationSeconds)}</span>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-xl border border-gym-border">
                <span className="text-[10px] text-gym-muted block uppercase">Sets</span>
                <span className="text-sm font-black font-mono text-gym-highlight">{summaryData.totalSets}</span>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-gym-border/60 p-3.5 rounded-xl text-left mb-6 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-gym-accent shrink-0 mt-0.5" />
              <p className="text-xs text-slate-300 leading-relaxed">
                Consistency wins. You hit <strong>{summaryData.totalSets} hard working sets</strong> today. Rest, hydrate, and prepare for your next rotation!
              </p>
            </div>

            <button
              type="button"
              onClick={handleDismissSummary}
              className="w-full bg-gym-accent hover:bg-emerald-400 text-black font-extrabold py-3.5 rounded-xl text-sm transition-all"
            >
              Log & Return to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}