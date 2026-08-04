import Phaser from 'phaser';
import { SKILL_TREES, canUnlockNode, getSkillPointsForLevel } from '@/shared/constants/skillTrees';
import { saveManager } from '@/client/utils/SaveManager';
import { playSound } from '@/client/utils/SoundManager';
import type { SkillNode } from '@/shared/constants/skillTrees';

export class SkillTreeScene extends Phaser.Scene {
  private selectedHero: string = 'knight';
  private unlockedNodes: string[] = [];
  private availablePoints: number = 0;
  private contentContainer!: Phaser.GameObjects.Container;

  constructor() {
    super({ key: 'SkillTreeScene' });
  }

  init(data?: { heroId?: string }) {
    // Use passed heroId, or fall back to the gameStore's selected hero
    if (data?.heroId) {
      this.selectedHero = data.heroId;
    } else {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { useGameStore } = require('@/client/store/gameStore');
      this.selectedHero = useGameStore.getState().selectedHero ?? 'knight';
    }
  }

  create() {
    const { width, height } = this.scale;
    const cx = width / 2;

    // Background
    this.add.rectangle(cx, height / 2, width, height, 0x0a0a1a);

    // Load saved skill data
    this.unlockedNodes = saveManager.getUnlockedSkills();
    // Calculate points: sum of all hero levels / 5, minus spent points
    const totalPoints = this.calculateTotalPoints();
    this.availablePoints = totalPoints - this.unlockedNodes.length;

    // Title
    this.add.text(cx, 30, 'SKILL TREES', {
      fontSize: '36px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5);

    // Points display
    this.add.text(cx, 65, `Available Points: ${this.availablePoints}`, {
      fontSize: '18px', color: this.availablePoints > 0 ? '#ffcc00' : '#888888',
    }).setOrigin(0.5);

    // Hero tabs
    const heroes = ['knight', 'archer', 'mage'];
    const tabY = 100;
    heroes.forEach((heroId, i) => {
      const tabX = cx - 200 + i * 200;
      const isActive = heroId === this.selectedHero;
      const bg = this.add.rectangle(tabX, tabY, 150, 36, isActive ? 0x4488ff : 0x222244)
        .setStrokeStyle(isActive ? 2 : 1, isActive ? 0xffffff : 0x445566)
        .setInteractive({ useHandCursor: true });
      this.add.text(tabX, tabY, heroId.toUpperCase(), {
        fontSize: '16px', color: isActive ? '#ffffff' : '#888899', fontStyle: 'bold',
      }).setOrigin(0.5);
      bg.on('pointerdown', () => {
        this.selectedHero = heroId;
        this.scene.restart({ heroId });
      });
    });

    // Content container for tree nodes
    this.contentContainer = this.add.container(0, 0);
    this.renderTree();

    // Back button
    const backBg = this.add.rectangle(80, height - 40, 120, 40, 0x334466)
      .setStrokeStyle(1, 0xffffff).setInteractive({ useHandCursor: true });
    this.add.text(80, height - 40, 'BACK', {
      fontSize: '18px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5);
    backBg.on('pointerdown', () => this.scene.start('MainMenuScene'));

    this.cameras.main.fadeIn(300, 0, 0, 0);
  }

  private calculateTotalPoints(): number {
    // Each hero's best wave approximates their level reached
    let totalLevels = 0;
    const heroIds = ['knight', 'archer', 'mage'];
    heroIds.forEach(h => {
      const hs = saveManager.getHeroStats(h);
      totalLevels += hs.bestWave;
    });
    return getSkillPointsForLevel(totalLevels);
  }

  private renderTree() {
    this.contentContainer.removeAll(true);
    const tree = SKILL_TREES[this.selectedHero];
    if (!tree) return;

    const { width } = this.scale;
    const pathSpacing = width / (tree.paths.length + 1);
    const startY = 160;

    tree.paths.forEach((path, pathIdx) => {
      const px = pathSpacing * (pathIdx + 1);

      // Path name
      const pathName = this.add.text(px, startY, path.name, {
        fontSize: '20px', color: '#' + path.color.toString(16).padStart(6, '0'),
        fontStyle: 'bold',
      }).setOrigin(0.5);
      this.contentContainer.add(pathName);

      // Path description
      const pathDesc = this.add.text(px, startY + 22, path.description, {
        fontSize: '11px', color: '#778899', wordWrap: { width: 200 }, align: 'center',
      }).setOrigin(0.5, 0);
      this.contentContainer.add(pathDesc);

      // Nodes
      path.nodes.forEach((node, tierIdx) => {
        const ny = startY + 80 + tierIdx * 110;
        this.renderNode(px, ny, node, path.color);
      });
    });
  }

  private renderNode(x: number, y: number, node: SkillNode, pathColor: number) {
    const isUnlocked = this.unlockedNodes.includes(node.id);
    const canUnlock = !isUnlocked && this.availablePoints > 0 && canUnlockNode(node, this.unlockedNodes);

    const bgColor = isUnlocked ? pathColor : (canUnlock ? 0x333355 : 0x1a1a2a);
    const strokeColor = isUnlocked ? 0xffffff : (canUnlock ? pathColor : 0x333344);

    const bg = this.add.rectangle(x, y, 180, 80, bgColor)
      .setStrokeStyle(canUnlock ? 2 : 1, strokeColor);
    this.contentContainer.add(bg);

    const nameText = this.add.text(x, y - 18, node.name, {
      fontSize: '14px', color: isUnlocked ? '#ffffff' : (canUnlock ? '#ccddee' : '#556677'),
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.contentContainer.add(nameText);

    const descText = this.add.text(x, y + 8, node.description, {
      fontSize: '11px', color: isUnlocked ? '#aabbcc' : '#445566',
      wordWrap: { width: 160 }, align: 'center',
    }).setOrigin(0.5, 0);
    this.contentContainer.add(descText);

    // Tier indicator
    const tierText = this.add.text(x + 80, y - 30, `T${node.tier}`, {
      fontSize: '10px', color: '#445566',
    }).setOrigin(0.5);
    this.contentContainer.add(tierText);

    if (canUnlock) {
      bg.setInteractive({ useHandCursor: true });
      bg.on('pointerover', () => bg.setStrokeStyle(3, 0xffffff));
      bg.on('pointerout', () => bg.setStrokeStyle(2, strokeColor));
      bg.on('pointerdown', () => this.unlockNode(node));
    }
  }

  private unlockNode(_node: SkillNode) {
    if (this.availablePoints <= 0) return;
    saveManager.unlockSkill(_node.id);
    this.unlockedNodes.push(_node.id);
    this.availablePoints--;
    playSound('levelUp');
    this.scene.restart({ heroId: this.selectedHero });
  }
}
