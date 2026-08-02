import Phaser from 'phaser';
import { ENEMY_DEFINITIONS } from '@/shared/constants/enemies';
import { HERO_DEFINITIONS } from '@/shared/constants/heroes';
import { SoundManager } from '@/client/utils/SoundManager';
import { saveManager } from '@/client/utils/SaveManager';
import type { EnemyType } from '@/shared/types/entities';

/**
 * PreloadScene - Generates all placeholder textures programmatically.
 * Real sprites can replace these later without changing any game logic.
 */
export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload() {
    // Show loading progress
    this.createLoadingBar();
  }

  create() {
    // Generate all game textures procedurally
    this.generateHeroTextures();
    this.generateEnemyTextures();
    this.generateProjectileTextures();
    this.generateArenaTexture();
    this.generateParticleTexture();

    // Apply saved volume settings
    const settings = saveManager.getSettings();
    const sm = SoundManager.getInstance();
    sm.setMasterVolume(settings.masterVolume);
    sm.setSfxVolume(settings.sfxVolume);
    sm.setBgmVolume(settings.bgmVolume);

    this.scene.start('MainMenuScene');
  }

  private createLoadingBar() {
    const { width, height } = this.scale;
    const cx = width / 2;
    const cy = height / 2;

    // Background
    this.add.rectangle(cx, cy, width, height, 0x0a0a1a);

    // Title
    this.add
      .text(cx, cy - 60, 'SURVIVOR ROYALE', {
        fontSize: '36px',
        color: '#4488ff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Loading bar background
    const barBg = this.add.rectangle(cx, cy + 20, 400, 20, 0x333344);
    const bar = this.add.rectangle(cx - 200, cy + 20, 0, 20, 0x4488ff).setOrigin(0, 0.5);

    this.load.on('progress', (value: number) => {
      bar.width = 400 * value;
    });

    this.load.on('complete', () => {
      barBg.destroy();
      bar.destroy();
    });
  }

  private generateHeroTextures() {
    for (const [heroId, def] of Object.entries(HERO_DEFINITIONS)) {
      if (!this.textures.exists(`hero_${heroId}`)) {
        const size = 32;
        const gfx = this.make.graphics({ x: 0, y: 0 });

        // Body
        gfx.fillStyle(def.color, 1);
        gfx.fillCircle(size / 2, size / 2, size / 2 - 2);

        // Direction indicator (facing up by default)
        gfx.fillStyle(0xffffff, 0.8);
        gfx.fillTriangle(size / 2, 4, size / 2 - 6, size / 2 + 4, size / 2 + 6, size / 2 + 4);

        gfx.generateTexture(`hero_${heroId}`, size, size);
        gfx.destroy();
      }
    }
  }

  private generateEnemyTextures() {
    for (const [, def] of Object.entries(ENEMY_DEFINITIONS)) {
      const key = `enemy_${def.type}`;
      if (!this.textures.exists(key)) {
        const size = def.size * 2;
        const gfx = this.make.graphics({ x: 0, y: 0 });

        gfx.fillStyle(def.color, 1);

        // Different shapes per enemy type
        switch (def.type as EnemyType) {
          case 'walker':
          case 'runner':
            gfx.fillCircle(size / 2, size / 2, size / 2 - 1);
            break;
          case 'tank':
            gfx.fillRect(2, 2, size - 4, size - 4);
            break;
          case 'ranged':
            gfx.fillTriangle(size / 2, 2, 2, size - 2, size - 2, size - 2);
            break;
          case 'exploder':
            // Diamond shape
            gfx.fillTriangle(size / 2, 2, 2, size / 2, size / 2, size - 2);
            gfx.fillTriangle(size / 2, 2, size - 2, size / 2, size / 2, size - 2);
            break;
          case 'boss_titan':
            gfx.fillRect(2, 2, size - 4, size - 4);
            gfx.fillStyle(0xff0000, 0.5);
            gfx.fillCircle(size / 2, size / 2, size / 4);
            break;
        }

        gfx.generateTexture(key, size, size);
        gfx.destroy();
      }
    }
  }

  private generateProjectileTextures() {
    // Sword slash arc (knight melee)
    if (!this.textures.exists('projectile_sword')) {
      const gfx = this.make.graphics({ x: 0, y: 0 });
      gfx.fillStyle(0x88ccff, 0.9);
      gfx.fillCircle(8, 8, 6);
      gfx.generateTexture('projectile_sword', 16, 16);
      gfx.destroy();
    }

    // Arrow
    if (!this.textures.exists('projectile_arrow')) {
      const gfx = this.make.graphics({ x: 0, y: 0 });
      gfx.fillStyle(0xffcc44, 1);
      gfx.fillRect(0, 2, 20, 4);
      gfx.fillTriangle(20, 4, 26, 4, 23, 0);
      gfx.generateTexture('projectile_arrow', 26, 8);
      gfx.destroy();
    }

    // Fireball
    if (!this.textures.exists('projectile_fireball')) {
      const gfx = this.make.graphics({ x: 0, y: 0 });
      gfx.fillStyle(0xff6600, 1);
      gfx.fillCircle(10, 10, 10);
      gfx.fillStyle(0xffcc00, 0.7);
      gfx.fillCircle(10, 10, 6);
      gfx.generateTexture('projectile_fireball', 20, 20);
      gfx.destroy();
    }

    // Enemy projectile
    if (!this.textures.exists('projectile_enemy')) {
      const gfx = this.make.graphics({ x: 0, y: 0 });
      gfx.fillStyle(0xff4444, 1);
      gfx.fillCircle(6, 6, 5);
      gfx.generateTexture('projectile_enemy', 12, 12);
      gfx.destroy();
    }
  }

  private generateArenaTexture() {
    // Grid tile for the arena floor
    if (!this.textures.exists('arena_tile')) {
      const gfx = this.make.graphics({ x: 0, y: 0 });
      gfx.fillStyle(0x111122, 1);
      gfx.fillRect(0, 0, 64, 64);
      gfx.lineStyle(1, 0x1a1a33, 1);
      gfx.strokeRect(0, 0, 64, 64);
      gfx.generateTexture('arena_tile', 64, 64);
      gfx.destroy();
    }
  }

  private generateParticleTexture() {
    if (!this.textures.exists('particle')) {
      const gfx = this.make.graphics({ x: 0, y: 0 });
      gfx.fillStyle(0xffffff, 1);
      gfx.fillCircle(4, 4, 4);
      gfx.generateTexture('particle', 8, 8);
      gfx.destroy();
    }

    // XP Orb
    if (!this.textures.exists('xp_orb')) {
      const gfx = this.make.graphics({ x: 0, y: 0 });
      // Outer glow
      gfx.fillStyle(0x4488ff, 0.4);
      gfx.fillCircle(12, 12, 12);
      // Core
      gfx.fillStyle(0xaaddff, 1);
      gfx.fillCircle(12, 12, 8);
      // Highlight
      gfx.fillStyle(0xffffff, 0.8);
      gfx.fillCircle(10, 10, 3);
      gfx.generateTexture('xp_orb', 24, 24);
      gfx.destroy();
    }
  }
}
