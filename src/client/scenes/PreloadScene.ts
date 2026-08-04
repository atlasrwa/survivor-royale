import Phaser from 'phaser';
import { ENEMY_DEFINITIONS } from '@/shared/constants/enemies';
import { HERO_DEFINITIONS } from '@/shared/constants/heroes';
import { SoundManager } from '@/client/utils/SoundManager';
import { saveManager } from '@/client/utils/SaveManager';
import { createParticleTextures } from '@/client/entities/ParticleSystem';
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

    // Load real sprite assets
    this.load.image('hero_knight', 'sprites/heroes/knight/knight-topdown.png');
  }

  create() {
    // Generate all game textures procedurally
    this.generateHeroTextures();
    this.generateEnemyTextures();
    this.generateProjectileTextures();
    this.generateArenaTexture();
    this.generateParticleTexture();

    // Generate particle effect textures (circles, sparks, stars, etc.)
    createParticleTextures(this);

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
      // Skip if a real texture was already loaded in preload()
      if (this.textures.exists(`hero_${heroId}`)) continue;

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
          case 'flyer':
            // Small diamond/rhombus shape (fast, aerial)
            gfx.fillTriangle(size / 2, 2, 2, size / 2, size / 2, size - 2);
            gfx.fillTriangle(size / 2, 2, size - 2, size / 2, size / 2, size - 2);
            // Inner highlight to distinguish from exploder
            gfx.fillStyle(0xffffff, 0.3);
            gfx.fillTriangle(size / 2, size / 4, size / 4, size / 2, size * 3 / 4, size / 2);
            break;
          case 'splitter':
            // Circle with inner horizontal line (splits into pieces)
            gfx.fillCircle(size / 2, size / 2, size / 2 - 1);
            gfx.lineStyle(2, 0xffffff, 0.6);
            gfx.lineBetween(size / 4, size / 2, size * 3 / 4, size / 2);
            break;
          case 'shielder':
            // Rectangle body with front shield arc
            gfx.fillRect(size / 4, size / 4, size / 2, size / 2);
            // Shield arc on the front (top)
            gfx.lineStyle(3, 0xffffff, 0.8);
            gfx.beginPath();
            gfx.arc(size / 2, size / 4, size / 3, Math.PI, 0, false);
            gfx.strokePath();
            break;
          case 'healer':
            // Circle with cross/plus symbol
            gfx.fillCircle(size / 2, size / 2, size / 2 - 1);
            // Cross/plus
            gfx.fillStyle(0xffffff, 0.8);
            gfx.fillRect(size / 2 - 2, size / 4, 4, size / 2);
            gfx.fillRect(size / 4, size / 2 - 2, size / 2, 4);
            break;
          case 'boss_goblin_king':
            gfx.fillRect(2, 2, size - 4, size - 4);
            gfx.fillStyle(0xffcc00, 0.7);
            // Crown shape
            gfx.fillTriangle(size / 4, size / 2, size / 2, size / 5, size * 3 / 4, size / 2);
            gfx.fillRect(size / 4, size / 2, size / 2, size / 3);
            break;
          case 'boss_hydra':
            // Large octagon/circle with 3 dots (multi-headed)
            gfx.fillCircle(size / 2, size / 2, size / 2 - 2);
            // Three dots representing multiple heads
            gfx.fillStyle(0xffffff, 0.8);
            gfx.fillCircle(size / 4, size / 3, size / 10);
            gfx.fillCircle(size / 2, size / 4, size / 10);
            gfx.fillCircle(size * 3 / 4, size / 3, size / 10);
            break;
          case 'boss_lich':
            // Large diamond with inner circle (magical boss)
            gfx.fillTriangle(size / 2, 2, 2, size / 2, size / 2, size - 2);
            gfx.fillTriangle(size / 2, 2, size - 2, size / 2, size / 2, size - 2);
            // Inner magical circle
            gfx.fillStyle(0xffffff, 0.4);
            gfx.fillCircle(size / 2, size / 2, size / 5);
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
    // Grasslands / meadow tile for the arena floor
    if (!this.textures.exists('arena_tile')) {
      const gfx = this.make.graphics({ x: 0, y: 0 });
      const size = 64;

      // Base grass color (varied greens)
      gfx.fillStyle(0x3a7d2e, 1);
      gfx.fillRect(0, 0, size, size);

      // Slightly darker patches for depth
      gfx.fillStyle(0x2d6b23, 0.5);
      gfx.fillRect(10, 5, 20, 12);
      gfx.fillRect(40, 35, 18, 14);

      // Lighter grass highlights
      gfx.fillStyle(0x4a9d3e, 0.6);
      gfx.fillRect(0, 30, 15, 10);
      gfx.fillRect(35, 10, 12, 8);

      // Small grass blade lines
      gfx.lineStyle(1, 0x5aad4e, 0.4);
      for (let i = 0; i < 8; i++) {
        const bx = (i * 8 + 3) % size;
        const by = (i * 11 + 7) % size;
        gfx.beginPath();
        gfx.moveTo(bx, by + 4);
        gfx.lineTo(bx + 1, by);
        gfx.strokePath();
      }

      // Subtle grid line (dirt path between tiles)
      gfx.lineStyle(1, 0x5c4a2a, 0.15);
      gfx.strokeRect(0, 0, size, size);

      gfx.generateTexture('arena_tile', size, size);
      gfx.destroy();
    }

    // Flower decoration texture (small)
    if (!this.textures.exists('flower_deco')) {
      const gfx = this.make.graphics({ x: 0, y: 0 });
      // Random flower colors
      const colors = [0xff6688, 0xffdd44, 0xffffff, 0xaa88ff, 0xff8844];
      const color = colors[Math.floor(Math.random() * colors.length)]!;
      // Petals
      gfx.fillStyle(color, 0.8);
      gfx.fillCircle(5, 3, 3);
      gfx.fillCircle(9, 5, 3);
      gfx.fillCircle(5, 9, 3);
      gfx.fillCircle(1, 5, 3);
      // Center
      gfx.fillStyle(0xffee00, 1);
      gfx.fillCircle(5, 5, 2);
      gfx.generateTexture('flower_deco', 12, 12);
      gfx.destroy();
    }

    // Grass tuft decoration
    if (!this.textures.exists('grass_tuft')) {
      const gfx = this.make.graphics({ x: 0, y: 0 });
      gfx.lineStyle(2, 0x4aad3e, 0.7);
      gfx.beginPath();
      gfx.moveTo(4, 12); gfx.lineTo(3, 2);
      gfx.moveTo(7, 12); gfx.lineTo(8, 0);
      gfx.moveTo(10, 12); gfx.lineTo(12, 3);
      gfx.strokePath();
      gfx.generateTexture('grass_tuft', 14, 14);
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
