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
      backgroundColor: '#0a0a1a',
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1280,
        height: 720,
      },
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: process.env.NODE_ENV === 'development',
        },
      },
      scene: [BootScene, PreloadScene, MainMenuScene, GameScene, GameOverScene, LevelUpOverlay, PauseMenu, SettingsScene, TutorialOverlay, SkillTreeScene],
    };

    gameInstance = new Phaser.Game(config);

    return () => {
      gameInstance?.destroy(true);
      gameInstance = null;
    };
  }, []);

  return <div id="game-container" ref={containerRef} className="w-full h-full" />;
}
