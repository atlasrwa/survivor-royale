import Phaser from 'phaser';
import { useGameStore } from '@/client/store/gameStore';
import { HERO_DEFINITIONS } from '@/shared/constants/heroes';
import { DIFFICULTY_TIERS, ALL_DIFFICULTY_TIERS, type DifficultyTier } from '@/shared/constants/difficulty';
import { playSound } from '@/client/utils/SoundManager';
import type { HeroId } from '@/shared/types/entities';
import { saveManager } from '@/client/utils/SaveManager';

/**
 * MainMenuScene - Hero selection, difficulty selection, and game start.
 */
export class MainMenuScene extends Phaser.Scene {
  private selectedHero: HeroId = 'knight';
  private selectedDifficulty: DifficultyTier = 'normal';
  private heroCards: Map<string, Phaser.GameObjects.Container> = new Map();
  private difficultyCards: Map<string, { bg: Phaser.GameObjects.Rectangle; text: Phaser.GameObjects.Text }> = new Map();

  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create() {
    const { width, height } = this.scale;
    const cx = width / 2;

    // Dark background
    this.add.rectangle(cx, height / 2, width, height, 0x0a0a1a);

    // Title
    this.add
      .text(cx, 70, 'SURVIVOR ROYALE', {
        fontSize: '52px',
        color: '#4488ff',
        fontStyle: 'bold',
        stroke: '#000033',
        strokeThickness: 4,
      })
      .setOrigin(0.5);

    this.add
      .text(cx, 120, 'Skill-based auto-shooter', {
        fontSize: '18px',
        color: '#8899aa',
      })
      .setOrigin(0.5);

    // Hero selection
    this.add
      .text(cx, 180, 'SELECT YOUR HERO', {
        fontSize: '22px',
        color: '#aabbcc',
        letterSpacing: 4,
      })
      .setOrigin(0.5);

    // Hero cards
    const heroes = Object.values(HERO_DEFINITIONS);
    const cardWidth = 200;
    const cardSpacing = 220;
    const totalWidth = heroes.length * cardSpacing - 20;
    const startX = cx - totalWidth / 2 + cardWidth / 2;

    heroes.forEach((hero, i) => {
      const x = startX + i * cardSpacing;
      const card = this.createHeroCard(x, 340, hero.id as HeroId);
      this.heroCards.set(hero.id, card);

      // Show best wave below each hero card
      const heroStats = saveManager.getHeroStats(hero.id);
      if (heroStats.bestWave > 0) {
        this.add
          .text(x, 475, `Best: Wave ${heroStats.bestWave}`, {
            fontSize: '12px',
            color: '#66aa88',
          })
          .setOrigin(0.5);
      }
    });

    // Lifetime stats section
    const lifetimeStats = saveManager.getLifetimeStats();
    if (lifetimeStats.totalGamesPlayed > 0) {
      const heroIds: HeroId[] = ['knight', 'archer', 'mage'];
      const bestScore = Math.max(0, ...heroIds.map(id => saveManager.getHeroStats(id).bestScore));
      this.add
        .text(cx, 505, `Games: ${lifetimeStats.totalGamesPlayed}  •  Best Score: ${bestScore.toLocaleString()}`, {
          fontSize: '13px',
          color: '#667788',
        })
        .setOrigin(0.5);
    }

    // ── Difficulty Selection ──────────────────────────────────────────────
    this.add
      .text(cx, 530, 'DIFFICULTY', {
        fontSize: '18px',
        color: '#aabbcc',
        letterSpacing: 3,
      })
      .setOrigin(0.5);

    const diffCardWidth = 160;
    const diffSpacing = 180;
    const totalDiffWidth = ALL_DIFFICULTY_TIERS.length * diffSpacing - 20;
    const diffStartX = cx - totalDiffWidth / 2 + diffCardWidth / 2;

    ALL_DIFFICULTY_TIERS.forEach((tierId, i) => {
      const tier = DIFFICULTY_TIERS[tierId];
      const dx = diffStartX + i * diffSpacing;
      const dy = 580;

      const bg = this.add
        .rectangle(dx, dy, diffCardWidth, 60, 0x111133)
        .setStrokeStyle(2, 0x334466)
        .setInteractive({ useHandCursor: true });

      const label = this.add
        .text(dx, dy - 12, `${tier.icon} ${tier.name}`, {
          fontSize: '16px',
          color: '#ffffff',
          fontStyle: 'bold',
        })
        .setOrigin(0.5);

      this.add
        .text(dx, dy + 12, tier.description, {
          fontSize: '10px',
          color: '#778899',
          wordWrap: { width: diffCardWidth - 10 },
          align: 'center',
        })
        .setOrigin(0.5);

      this.difficultyCards.set(tierId, { bg, text: label });

      bg.on('pointerover', () => {
        if (this.selectedDifficulty !== tierId) {
          bg.setFillStyle(0x1a2255);
        }
      });
      bg.on('pointerout', () => {
        if (this.selectedDifficulty !== tierId) {
          bg.setFillStyle(0x111133);
        }
      });
      bg.on('pointerdown', () => {
        playSound('uiClick');
        this.selectDifficulty(tierId);
      });
    });

    // Start button
    this.createButton(cx, 650, 'START GAME', 0x4488ff, () => {
      this.startGame();
    });

    // Settings button
    this.createButton(cx, 720, 'SETTINGS', 0x334466, () => {
      this.scene.launch('SettingsScene');
    });

    // Skill Trees button
    this.createButton(cx, 780, 'SKILL TREES', 0x443366, () => {
      this.scene.start('SkillTreeScene', { heroId: this.selectedHero });
    });

    // Controls hint
    this.add
      .text(cx, height - 30, 'WASD / Arrow Keys: Move  •  Space: Dodge  •  Auto-attacks enemies', {
        fontSize: '14px',
        color: '#556677',
      })
      .setOrigin(0.5);

    // Animate in
    this.cameras.main.fadeIn(500, 0, 0, 0);

    // Select defaults
    this.selectHero('knight');
    this.selectDifficulty('normal');
  }

  private createHeroCard(x: number, y: number, heroId: HeroId): Phaser.GameObjects.Container {
    const def = HERO_DEFINITIONS[heroId];
    if (!def) throw new Error(`Hero ${heroId} not found`);

    const container = this.add.container(x, y);
    const cardW = 190;
    const cardH = 240;

    // Background
    const bg = this.add
      .rectangle(0, 0, cardW, cardH, 0x111133)
      .setStrokeStyle(2, 0x334466);

    // Hero sprite preview
    const sprite = this.add
      .image(0, -60, `hero_${heroId}`)
      .setDisplaySize(64, 64);

    // Name
    const nameText = this.add
      .text(0, -10, def.name.toUpperCase(), {
        fontSize: '18px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Description
    const descText = this.add
      .text(0, 20, def.description, {
        fontSize: '11px',
        color: '#8899aa',
        wordWrap: { width: 170 },
        align: 'center',
      })
      .setOrigin(0.5);

    // Stat bars
    const statsY = 80;
    const statLabels = ['HP', 'SPD', 'ATK'];
    const statValues = [
      def.baseStats.maxHp / 200,
      def.baseStats.speed / 300,
      def.baseStats.attackDamage / 80,
    ];
    const statColors = [0xff4444, 0x44ff88, 0x4488ff];

    statLabels.forEach((label, i) => {
      this.add
        .text(-80, statsY + i * 18, label, {
          fontSize: '11px',
          color: '#778899',
        })
        .setOrigin(0, 0.5)

      const barBg = this.add.rectangle(10, statsY + i * 18, 110, 8, 0x223344).setOrigin(0, 0.5);
      const barFill = this.add
        .rectangle(10, statsY + i * 18, Math.max(4, 110 * statValues[i]!), 8, statColors[i]!)
        .setOrigin(0, 0.5);

      container.add([barBg, barFill]);
    });

    container.add([bg, sprite, nameText, descText]);

    // Make interactive
    bg.setInteractive({ useHandCursor: true });
    bg.on('pointerover', () => {
      if (this.selectedHero !== heroId) {
        bg.setFillStyle(0x1a2255);
      }
    });
    bg.on('pointerout', () => {
      if (this.selectedHero !== heroId) {
        bg.setFillStyle(0x111133);
      }
    });
    bg.on('pointerdown', () => {
      playSound('uiClick');
      this.selectHero(heroId);
    });

    return container;
  }

  private selectHero(heroId: HeroId) {
    this.selectedHero = heroId;

    // Update card visuals
    this.heroCards.forEach((card, id) => {
      const bg = card.getAt(0) as Phaser.GameObjects.Rectangle;
      if (id === heroId) {
        bg.setFillStyle(0x1133aa);
        bg.setStrokeStyle(3, 0x4488ff);
        card.setScale(1.05);
      } else {
        bg.setFillStyle(0x111133);
        bg.setStrokeStyle(2, 0x334466);
        card.setScale(1.0);
      }
    });

    // Sync Zustand
    useGameStore.getState().selectHero(heroId);
  }

  private selectDifficulty(tierId: DifficultyTier) {
    this.selectedDifficulty = tierId;
    const tier = DIFFICULTY_TIERS[tierId];

    // Update card visuals
    this.difficultyCards.forEach((card, id) => {
      if (id === tierId) {
        card.bg.setFillStyle(tier.color & 0x333333 | 0x111111);
        card.bg.setStrokeStyle(3, tier.color);
      } else {
        card.bg.setFillStyle(0x111133);
        card.bg.setStrokeStyle(2, 0x334466);
      }
    });

    // Sync Zustand
    useGameStore.getState().setDifficulty(tierId);
  }

  private createButton(
    x: number,
    y: number,
    label: string,
    color: number,
    onClick: () => void
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    const bg = this.add.rectangle(0, 0, 240, 56, color).setStrokeStyle(2, 0xffffff);
    const text = this.add
      .text(0, 0, label, {
        fontSize: '22px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    container.add([bg, text]);

    bg.setInteractive({ useHandCursor: true });
    bg.on('pointerover', () => {
      bg.setScale(1.05);
      text.setScale(1.05);
    });
    bg.on('pointerout', () => {
      bg.setScale(1);
      text.setScale(1);
    });
    bg.on('pointerdown', () => {
      playSound('uiClick');
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.time.delayedCall(300, onClick);
    });

    return container;
  }

  private startGame() {
    const store = useGameStore.getState();
    store.startGame(this.selectedHero, 'solo');
    this.scene.start('GameScene', { heroId: this.selectedHero, difficulty: this.selectedDifficulty });
  }
}
