import React from 'react';
import { X, Award, CheckCircle2, Lock } from 'lucide-react';
import { getStoredAchievements } from '../missions/achievements';
import { soundManager } from '../services/sound';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const achievements = getStoredAchievements();

  if (!isOpen) return null;

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-500/15 border border-orange-500/20 text-orange-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white font-display">BAŞARIMLAR</h3>
              <p className="text-xs text-slate-400">
                {unlockedCount} / {achievements.length} Başarım Açıldı
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List of achievements */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {achievements.map((item) => {
            const progressRatio = Math.min(100, Math.round((item.progress / item.maxProgress) * 100));

            return (
              <div
                key={item.id}
                className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
                  item.unlocked
                    ? 'bg-slate-950/80 border-emerald-500/30'
                    : 'bg-slate-950/40 border-slate-800/80 opacity-80'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 border ${
                      item.unlocked
                        ? 'bg-emerald-500/15 border-emerald-500/30'
                        : 'bg-slate-800/60 border-slate-700/60'
                    }`}
                  >
                    {item.unlocked ? item.icon : <Lock className="w-4 h-4 text-slate-500" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                        {item.title}
                        {item.unlocked && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                      </h4>
                      <div className="flex items-center gap-2 text-[10px] font-bold">
                        <span className="text-purple-400">+{item.xpReward} XP</span>
                        <span className="text-amber-400">+{item.coinReward} Altın</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 mt-0.5">
                      {item.description}
                    </p>

                    {/* Progress bar */}
                    {!item.unlocked && (
                      <div className="mt-2.5">
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                          <span>İlerleme</span>
                          <span>
                            {item.progress} / {item.maxProgress}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-orange-400 rounded-full transition-all"
                            style={{ width: `${progressRatio}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
