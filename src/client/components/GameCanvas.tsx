import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { BootScene } from '@/client/scenes/BootScene';
import { PreloadScene } from '@/client/scenes/PreloadScene';
import { MainMenuScene } from '@/client/scenes/MainMenuScene';
import { GameScene } from '@/client/scenes/GameScene';
import { GameOverScene } from '@/client/scenes/GameOverScene';
import { LevelUpOverlay } from '@/client/scenes/LevelUpOverlay';
import { PauseMenu } from '@/client/scenes/PauseMenu';
import { SettingsScene } from '@/client/scenes/SettingsScene';
import { TutorialOverlay } from '@/client/scenes/TutorialOverlay';
import { SkillTreeScene } from '@/client/scenes/SkillTreeScene';
import { TouchControls } from '@/client/scenes/TouchControls';

let gameInstance: Phaser.Game | null = null;

export default function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Prevent double-mounting in React strict mode
    if (gameInstance) return;
    if (!containerRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: containerRef.current,
      backgroundColor: '#2a5c1e',
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 800,
        height: 480,
        // Mobile: expand to fill screen
        expandParent: true,
      },
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false,
        },
      },
      // Mobile input: enable multi-touch
      input: {
        activePointers: 3,
      },
      scene: [BootScene, PreloadScene, MainMenuScene, GameScene, GameOverScene, LevelUpOverlay, PauseMenu, SettingsScene, TutorialOverlay, SkillTreeScene, TouchControls],
    };

    gameInstance = new Phaser.Game(config);

    return () => {
      gameInstance?.destroy(true);
      gameInstance = null;
    };
  }, []);

  return <div id="game-container" ref={containerRef} className="w-full h-full" />;
}
