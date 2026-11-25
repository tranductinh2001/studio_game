import React, { useState, useEffect, useCallback } from 'react';
import { 
  loadGameConfig, saveGameConfig, loadSecretControl, 
  saveSecretControl, recordGameResult, gameStorage 
} from './services/gameStorage';
import { gameAudio } from './services/gameAudioSynth';

import GameCenterHeader from './GameCenterHeader';
import GameCatalog, { GAME_CATALOG_LIST } from './GameCatalog';
import TeacherConfigModal from './TeacherConfigModal';
import TeacherSecretPanel from './TeacherSecretPanel';

// 8 Educational Games
import BoatRaceGame from './games/BoatRaceGame';
import DuckRaceGame from './games/DuckRaceGame';
import LuckyWheelGame from './games/LuckyWheelGame';
import MysteryBoxesGame from './games/MysteryBoxesGame';
import RocketSpaceGame from './games/RocketSpaceGame';
import LuckyCardShuffleGame from './games/LuckyCardShuffleGame';
import KnowledgeMazeGame from './games/KnowledgeMazeGame';
import BallCannonGame from './games/BallCannonGame';

export default function GameCenter({ onSwitchTab }) {
  // Load initial configurations from persistent localStorage
  const [config, setConfig] = useState(() => loadGameConfig());
  const [secretControl, setSecretControl] = useState(() => loadSecretControl());

  // UI state
  const [activeGameId, setActiveGameId] = useState(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isSecretPanelOpen, setIsSecretPanelOpen] = useState(false);

  // Global keyboard shortcuts: F2 or Shift+G to toggle Teacher Secret Panel
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Toggle secret teacher panel with F2 or Shift+G
      if (e.key === 'F2' || (e.shiftKey && (e.key === 'G' || e.key === 'g'))) {
        e.preventDefault();
        setIsSecretPanelOpen(prev => !prev);
        gameAudio.playPop();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Sync mute state on mount
  useEffect(() => {
    gameAudio.setMute(!config.settings.soundEnabled);
  }, [config.settings.soundEnabled]);

  // Handle saving new config from modal
  const handleSaveConfig = (newConfig) => {
    const syncedMode = newConfig.gameMode || newConfig.settings?.mode || 'team';
    const normalized = {
      ...newConfig,
      gameMode: syncedMode,
      settings: {
        ...newConfig.settings,
        mode: syncedMode,
        gameMode: syncedMode
      }
    };
    setConfig(normalized);
    saveGameConfig(normalized);
    gameAudio.setMute(!normalized.settings.soundEnabled);
  };

  // Handle updating secret control
  const handleUpdateSecretControl = (newSecret) => {
    setSecretControl(newSecret);
    saveSecretControl(newSecret);
  };

  // Handle setting updates from header
  const handleUpdateSettings = (settingsPatch) => {
    const nextMode = settingsPatch.mode || settingsPatch.gameMode || config.settings?.mode || config.gameMode || 'team';
    const updated = {
      ...config,
      gameMode: nextMode,
      settings: {
        ...config.settings,
        ...settingsPatch,
        mode: nextMode,
        gameMode: nextMode
      }
    };
    setConfig(updated);
    saveGameConfig(updated);
  };

  const handleResetDefaultConfig = () => {
    const def = gameStorage.resetToDefault();
    setConfig(def);
    setSecretControl(def.secretControl || { mode: 'fair_random', targetTeamId: def.teams?.[0]?.id });
    gameAudio.setMute(!def.settings?.soundEnabled);
  };

  // Record game history / score result
  const handleRecordResult = (resultData) => {
    recordGameResult(resultData);
  };

  // Find active game descriptor
  const activeGameInfo = GAME_CATALOG_LIST.find(g => g.id === activeGameId) || null;

  // Render the current active game
  const renderGameContent = () => {
    if (!activeGameId) {
      return (
        <GameCatalog 
          onSelectGame={(gameId) => {
            setActiveGameId(gameId);
            gameAudio.playTick();
          }}
          currentMode={config.settings.mode}
        />
      );
    }

    const commonProps = {
      teams: config.teams,
      students: config.students,
      secretControl: secretControl,
      onUpdateSecretControl: handleUpdateSecretControl,
      settings: {
        ...config.settings,
        mode: config.settings?.mode || config.gameMode || 'team',
        gameMode: config.settings?.gameMode || config.settings?.mode || config.gameMode || 'team'
      },
      onRecordResult: handleRecordResult,
      onOpenTeacherPanel: () => setIsSecretPanelOpen(true)
    };

    switch (activeGameId) {
      case 'game-01-boat-race':
        return <BoatRaceGame {...commonProps} />;
      case 'game-02-duck-race':
        return <DuckRaceGame {...commonProps} />;
      case 'game-03-lucky-wheel':
        return <LuckyWheelGame {...commonProps} />;
      case 'game-04-mystery-box':
        return <MysteryBoxesGame {...commonProps} />;
      case 'game-05-rocket-space':
        return <RocketSpaceGame {...commonProps} />;
      case 'game-06-lucky-shuffle':
        return <LuckyCardShuffleGame {...commonProps} />;
      case 'game-07-knowledge-maze':
        return <KnowledgeMazeGame {...commonProps} />;
      case 'game-08-ball-cannon':
        return <BallCannonGame {...commonProps} />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <p>Trò chơi đang được hoàn thiện...</p>
            <button
              onClick={() => setActiveGameId(null)}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
            >
              Quay lại danh sách
            </button>
          </div>
        );
    }
  };

  return (
    <div className="relative w-full h-screen flex flex-col bg-slate-950 text-slate-100 font-sans overflow-hidden select-none">
      {/* Top Header */}
      <GameCenterHeader
        activeGame={activeGameInfo}
        onBackToCatalog={() => {
          setActiveGameId(null);
          gameAudio.stopAmbientBGM();
        }}
        onOpenConfig={() => setIsConfigModalOpen(true)}
        onToggleSecretPanel={() => setIsSecretPanelOpen(prev => !prev)}
        isSecretPanelOpen={isSecretPanelOpen}
        settings={config.settings}
        onUpdateSettings={handleUpdateSettings}
        onExitToSlides={() => onSwitchTab && onSwitchTab('slides')}
      />

      {/* Main Play Arena / 16:9 Presentation Canvas */}
      <main className="flex-1 w-full overflow-hidden relative">
        {renderGameContent()}
      </main>

      {/* Hidden/Floating Teacher Secret Control Panel */}
      <TeacherSecretPanel
        isOpen={isSecretPanelOpen}
        onClose={() => setIsSecretPanelOpen(false)}
        teams={config.teams}
        students={config.students}
        gameMode={config.settings?.mode || config.gameMode || 'team'}
        secretControl={secretControl}
        onUpdateSecretControl={handleUpdateSecretControl}
      />

      {/* Teacher Configuration Modal */}
      <TeacherConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        config={config}
        onSaveConfig={handleSaveConfig}
        onResetDefault={handleResetDefaultConfig}
      />
    </div>
  );
}

