import React, { useState } from 'react';
import { useSessionStore, STUDY_TASKS } from '../../store/sessionStore';
import { Target, X, CheckCircle, ChevronDown, ListOrdered } from 'lucide-react';

export const TaskBanner: React.FC = () => {
  const {
    activeTaskId,
    activeTaskNumber,
    isBannerDismissed,
    dismissBanner,
    showBanner,
    setActiveTask,
    completeTask
  } = useSessionStore();

  const [isOpenMenu, setIsOpenMenu] = useState(false);
  const [completedAnimation, setCompletedAnimation] = useState(false);

  const activeTask = STUDY_TASKS.find(t => t.id === activeTaskId || t.taskNumber === activeTaskNumber) || STUDY_TASKS[0];

  const handleComplete = async () => {
    setCompletedAnimation(true);
    await completeTask(activeTask.id);
    setTimeout(() => {
      setCompletedAnimation(false);
      // Advance to next task if available
      const nextTask = activeTask.taskNumber < 5 ? activeTask.taskNumber + 1 : 1;
      setActiveTask(nextTask);
    }, 800);
  };

  if (isBannerDismissed) {
    return (
      <button
        onClick={showBanner}
        className="fixed bottom-4 left-4 z-50 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-2 rounded-full shadow-lg transition-all"
        title="View Current Study Task"
      >
        <Target className="w-4 h-4" />
        Task #{activeTask.taskNumber}: {activeTask.title}
      </button>
    );
  }

  return (
    <aside aria-label="Usability study task banner" className="relative z-40 border-b border-slate-800 bg-slate-900 px-4 py-2 text-white transition-all">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-2 text-sm md:flex-row md:items-center">
        {/* Left: Task badge and title */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 bg-blue-600 text-white px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider shrink-0">
            <Target className="w-3.5 h-3.5" />
            <span>Task {activeTask.taskNumber} of 5</span>
          </div>

          <div className="relative">
            <button
              onClick={() => setIsOpenMenu(!isOpenMenu)}
              className="flex items-center gap-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 px-2.5 py-1 rounded border border-slate-700 transition-colors"
            >
              <ListOrdered className="w-3.5 h-3.5 text-blue-400" />
              <span>Select Task</span>
              <ChevronDown className="w-3 h-3 ml-0.5" />
            </button>

            {isOpenMenu && (
              <div className="absolute top-full left-0 mt-1.5 w-80 bg-white text-slate-800 rounded-lg shadow-xl border border-slate-200 py-1.5 z-50">
                <div className="px-3 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  Usability Study Tasks
                </div>
                {STUDY_TASKS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setActiveTask(t.taskNumber);
                      setIsOpenMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-blue-50 transition-colors flex items-start gap-2 ${
                      t.taskNumber === activeTask.taskNumber ? 'bg-blue-50/70 font-semibold text-blue-700' : 'text-slate-700'
                    }`}
                  >
                    <span className="font-bold shrink-0">#{t.taskNumber}</span>
                    <div>
                      <p className="font-medium text-slate-900">{t.title}</p>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{t.instruction}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center: Instruction text */}
        <div className="flex-1 px-0 text-left font-medium text-slate-200 md:px-2">
          <span className="mr-1.5 font-bold text-blue-300">Instruction:</span>
          <span className="line-clamp-2 md:line-clamp-1">{activeTask.instruction}</span>
        </div>

        {/* Right: Complete & Dismiss buttons */}
        <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
          <button
            onClick={handleComplete}
            disabled={completedAnimation}
            className={`flex items-center gap-1 text-xs font-medium px-3 py-1 rounded transition-all ${
              completedAnimation
                ? 'bg-green-600 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            {completedAnimation ? 'Completed!' : 'Mark Completed'}
          </button>

          <button
            onClick={dismissBanner}
            aria-label="Dismiss task banner"
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors"
            title="Dismiss task banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
