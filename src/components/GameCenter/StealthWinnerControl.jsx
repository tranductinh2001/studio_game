import React, { useState } from 'react';
import { CharacterAvatar } from './services/characterAvatars';

/**
 * Discreet, nearly-invisible stealth control embedded in the bottom-left corner
 * of every game arena. Allows the teacher to silently select or switch the
 * winning team/character before OR mid-game without students noticing.
 */
export default function StealthWinnerControl({
  items = [],
  secretControl = {},
  onUpdateSecretControl,
  onLiveOverrideWinner
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [justLocked, setJustLocked] = useState(false);

  const isRigged = secretControl?.mode === 'teacher_rigged' || secretControl?.mode === 'weighted_random';
  const activeTargetId = secretControl?.targetTeamId || secretControl?.targetStudentId;

  const handlePickWinner = (item) => {
    if (onUpdateSecretControl) {
      onUpdateSecretControl({
        ...secretControl,
        mode: 'teacher_rigged',
        targetTeamId: item.id,
        targetStudentId: item.id
      });
    }
    if (onLiveOverrideWinner) {
      onLiveOverrideWinner(item);
    }
    setJustLocked(true);
    setIsExpanded(false);
    setTimeout(() => setJustLocked(false), 1000);
  };

  const handleResetFair = () => {
    if (onUpdateSecretControl) {
      onUpdateSecretControl({
        ...secretControl,
        mode: 'fair_random'
      });
    }
    if (onLiveOverrideWinner) {
      onLiveOverrideWinner(null);
    }
    setIsExpanded(false);
  };

  const displayItems = items.slice(0, 8);

  return (
    <div className="absolute bottom-2.5 left-2.5 z-40 flex items-center gap-1.5 select-none">
      {/* Hidden/Discreet Corner Trigger Dot */}
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 ${
          isExpanded
            ? 'bg-slate-800/95 border border-slate-500/70 opacity-95'
            : justLocked
            ? 'bg-emerald-500/30 border border-emerald-400/60 opacity-80 scale-110'
            : 'bg-slate-900/40 border border-slate-700/30 opacity-15 hover:opacity-75'
        }`}
        title="•"
      >
        <span
          className={`w-2 h-2 rounded-full transition-colors ${
            justLocked
              ? 'bg-emerald-400'
              : isRigged
              ? 'bg-amber-400/80'
              : 'bg-slate-400/70'
          }`}
        />
      </button>

      {/* Compact Stealth Micro-Bar (No suspicious labels) */}
      {isExpanded && (
        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-slate-950/90 backdrop-blur-md border border-slate-700/70 shadow-2xl animate-in fade-in duration-150">
          {displayItems.map((item, idx) => {
            const isSelected = isRigged && (activeTargetId === item.id || activeTargetId === item.code);
            return (
              <button
                key={item.id || idx}
                type="button"
                onClick={() => handlePickWinner(item)}
                title={item.shortName || item.name}
                className={`relative w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black transition-all active:scale-90 ${
                  isSelected
                    ? 'ring-2 ring-amber-400 scale-110 shadow-md'
                    : 'opacity-80 hover:opacity-100 hover:scale-105'
                }`}
                style={{ backgroundColor: item.color || '#334155', color: '#0f172a' }}
              >
                {item.characterImage ? (
                  <CharacterAvatar team={item} index={idx} size="xs" className="w-full h-full border-0" />
                ) : (
                  <span>{item.number || idx + 1}</span>
                )}
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-slate-950 text-white text-[8px] font-mono font-black flex items-center justify-center border border-slate-700">
                  {item.number || idx + 1}
                </span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={handleResetFair}
            title="Ngẫu nhiên"
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all ml-0.5 border ${
              !isRigged
                ? 'bg-cyan-500/20 border-cyan-400/60 text-cyan-300'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            🎲
          </button>
        </div>
      )}
    </div>
  );
}

