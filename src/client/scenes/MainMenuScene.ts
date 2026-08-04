import Phaser from 'phaser';
import { useGameStore } from '@/client/store/gameStore';
import { HERO_DEFINITIONS } from '@/shared/constants/heroes';
import { DIFFICULTY_TIERS, ALL_DIFFICULTY_TIERS, type DifficultyTier } from '@/shared/constants/difficulty';
import { playSound } from '@/client/utils/SoundManager';
import type { HeroId } from '@/shared/types/entities';

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
      .text(cx, 30, 'SURVIVOR ROYALE', {
        fontSize: '28px',
        color: '#4488ff',
        fontStyle: 'bold',
        stroke: '#000033',
        strokeThickness: 3,
      })
      .setOrigin(0.5);

    this.add
      .text(cx, 55, 'Skill-based auto-shooter', {
        fontSize: '11px',
        color: '#8899aa',
      })
      .setOrigin(0.5);

    // Hero selection
    this.add
      .text(cx, 80, 'SELECT HERO', {
        fontSize: '12px',
        color: '#aabbcc',
        letterSpacing: 2,
      })
      .setOrigin(0.5);

    // Hero cards (compact)
    const heroes = Object.values(HERO_DEFINITIONS);
    const cardSpacing = 150;
    const totalWidth = heroes.length * cardSpacing - 20;
    const startX = cx - totalWidth / 2 + 65;

    heroes.forEach((hero, i) => {
      const x = startX + i * cardSpacing;
      const card = this.createHeroCard(x, 170, hero.id as HeroId);
      this.heroCards.set(hero.id, card);
    });

    // ── Difficulty Selection ──────────────────────────────────────────────
    this.add
      .text(cx, 275, 'DIFFICULTY', {
        fontSize: '11px',
        color: '#aabbcc',
        letterSpacing: 2,
      })
      .setOrigin(0.5);

    const diffSpacing = 130;
    const totalDiffWidth = ALL_DIFFICULTY_TIERS.length * diffSpacing - 20;
    const diffStartX = cx - totalDiffWidth / 2 + 55;

    ALL_DIFFICULTY_TIERS.forEach((tierId, i) => {
      const tier = DIFFICULTY_TIERS[tierId];
      const dx = diffStartX + i * diffSpacing;
      const dy = 310;

      const bg = this.add
        .rectangle(dx, dy, 120, 40, 0x111133)
        .setStrokeStyle(2, 0x334466)
        .setInteractive({ useHandCursor: true });

      const label = this.add
        .text(dx, dy - 5, `${tier.icon} ${tier.name}`, {
          fontSize: '12px',
          color: '#ffffff',
          fontStyle: 'bold',
        })
        .setOrigin(0.5);

      this.add
        .text(dx, dy + 12, tier.description.split('.')[0]!, {
          fontSize: '8px',
          color: '#778899',
          align: 'center',
        })
        .setOrigin(0.5);

      this.difficultyCards.set(tierId, { bg, text: label });

      bg.on('pointerover', () => {
        if (this.selectedDifficulty !== tierId) bg.setFillStyle(0x1a2255);
      });
      bg.on('pointerout', () => {
        if (this.selectedDifficulty !== tierId) bg.setFillStyle(0x111133);
      });
      bg.on('pointerdown', () => {
        playSound('uiClick');
        this.selectDifficulty(tierId);
      });
    });

    // Start button (prominent, easy to tap)
    this.createButton(cx, 380, 'START GAME', 0x4488ff, () => {
      this.startGame();
    });

    // Smaller secondary buttons
    this.createButton(cx - 100, 430, 'SETTINGS', 0x334466, () => {
      this.scene.launch('SettingsScene');
    }, false, true);

    this.createButton(cx + 100, 430, 'SKILLS', 0x443366, () => {
      this.scene.start('SkillTreeScene', { heroId: this.selectedHero });
    }, true, true);

    // Shop button (bottom-left)
    this.createButton(70, height - 45, '🪙 SHOP', 0x554400, () => {
      this.scene.start('MetaShopScene');
    }, true, true);

    // Battle Pass button (bottom-right)
    this.createButton(width - 100, height - 45, '⚔️ BATTLE PASS', 0x443366, () => {
      this.scene.start('BattlePassScene');
    }, true, true);

    // Controls hint
    this.add
      .text(cx, height - 15, 'Auto-attacks • Space: Dodge • Q/E: Abilities', {
        fontSize: '9px',
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
    const cardW = 130;
    const cardH = 150;

    // Background
    const bg = this.add
      .rectangle(0, 0, cardW, cardH, 0x111133)
      .setStrokeStyle(2, 0x334466);

    // Hero sprite preview
    const sprite = this.add
      .image(0, -40, `hero_${heroId}`)
      .setDisplaySize(48, 48);

    // Name
    const nameText = this.add
      .text(0, 0, def.name.toUpperCase(), {
        fontSize: '13px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Description (short)
    const descText = this.add
      .text(0, 18, def.description.split('.')[0]!, {
        fontSize: '8px',
        color: '#8899aa',
        wordWrap: { width: 120 },
        align: 'center',
      })
      .setOrigin(0.5);

    container.add([bg, sprite, nameText, descText]);

    // Make interactive
    bg.setInteractive({ useHandCursor: true });
    bg.on('pointerover', () => {
      if (this.selectedHero !== heroId) bg.setFillStyle(0x1a2255);
    });
    bg.on('pointerout', () => {
      if (this.selectedHero !== heroId) bg.setFillStyle(0x111133);
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
    onClick: () => void,
    fadeOnClick: boolean = true,
    small: boolean = false
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    const w = small ? 150 : 200;
    const h = small ? 32 : 42;
    const fontSize = small ? '13px' : '18px';

    const bg = this.add.rectangle(0, 0, w, h, color).setStrokeStyle(2, 0xffffff);
    const text = this.add
      .text(0, 0, label, {
        fontSize,
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
      if (fadeOnClick) {
        this.cameras.main.fadeOut(300, 0, 0, 0);
        this.time.delayedCall(300, onClick);
      } else {
        onClick();
      }
    });

    return container;
  }

  private startGame() {
    const store = useGameStore.getState();
    store.startGame(this.selectedHero, 'solo');
    this.scene.start('GameScene', { heroId: this.selectedHero, difficulty: this.selectedDifficulty });
  }
}
