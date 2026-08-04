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
    if (data?.heroId) {
      this.selectedHero = data.heroId;
    } else {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { useGameStore } = require('@/client/store/gameStore');
      this.selectedHero = useGameStore.getState().selectedHero ?? 'knight';
    }
  }

  create() {
    this.buildUI();

    // Listen for resize events and rebuild UI
    this.scale.on('resize', this.handleResize, this);
    this.cameras.main.fadeIn(300, 0, 0, 0);
  }

  private handleResize() {
    // Rebuild the entire UI on resize
    this.children.removeAll(true);
    this.buildUI();
  }

  private buildUI() {
    const { width, height } = this.scale;
    const cx = width / 2;

    // Background
    this.add.rectangle(cx, height / 2, width, height, 0x0a0a1a);

    // Load saved skill data
    this.unlockedNodes = saveManager.getUnlockedSkills();
    const totalPoints = this.calculateTotalPoints();
    this.availablePoints = totalPoints - this.unlockedNodes.length;

    // --- Layout calculations ---
    const titleFontSize = Math.max(18, Math.min(36, width * 0.04));
    const pointsFontSize = Math.max(12, Math.min(18, width * 0.025));
    const titleY = height * 0.04;
    const pointsY = titleY + titleFontSize * 1.2;

    // Title
    this.add.text(cx, titleY, 'SKILL TREES', {
      fontSize: `${titleFontSize}px`,
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Points display
    this.add.text(cx, pointsY, `Available Points: ${this.availablePoints}`, {
      fontSize: `${pointsFontSize}px`,
      color: this.availablePoints > 0 ? '#ffcc00' : '#888888',
    }).setOrigin(0.5);

    // Hero tabs - data driven from SKILL_TREES keys
    const heroIds = Object.keys(SKILL_TREES);
    const numHeroes = heroIds.length;
    const tabSpacing = Math.min(180, (width - 100) / numHeroes);
    const tabY = pointsY + pointsFontSize * 2;
    const tabFontSize = Math.max(11, Math.min(16, width * 0.02));
    const tabW = Math.min(150, tabSpacing - 10);
    const tabH = Math.max(28, Math.min(36, height * 0.04));

    heroIds.forEach((heroId, i) => {
      const tabX = cx + (i - (numHeroes - 1) / 2) * tabSpacing;
      const isActive = heroId === this.selectedHero;
      const bg = this.add.rectangle(tabX, tabY, tabW, tabH, isActive ? 0x4488ff : 0x222244)
        .setStrokeStyle(isActive ? 2 : 1, isActive ? 0xffffff : 0x445566)
        .setInteractive({ useHandCursor: true });
      this.add.text(tabX, tabY, heroId.toUpperCase(), {
        fontSize: `${tabFontSize}px`,
        color: isActive ? '#ffffff' : '#888899',
        fontStyle: 'bold',
      }).setOrigin(0.5);
      bg.on('pointerdown', () => {
        this.selectedHero = heroId;
        this.scene.restart({ heroId });
      });
    });

    // Header height (everything above the tree content)
    const headerHeight = tabY + tabH / 2 + 20;

    // Content container for tree nodes
    this.contentContainer = this.add.container(0, 0);
    this.renderTree(headerHeight);

    // Back button - responsive position and sizing
    const backW = Math.max(80, Math.min(120, width * 0.12));
    const backH = Math.max(30, Math.min(40, height * 0.05));
    const backX = backW / 2 + 20;
    const backY = height - backH / 2 - 10;
    const backFontSize = Math.max(12, Math.min(18, width * 0.025));

    const backBg = this.add.rectangle(backX, backY, backW, backH, 0x334466)
      .setStrokeStyle(1, 0xffffff)
      .setInteractive({ useHandCursor: true });
    this.add.text(backX, backY, 'BACK', {
      fontSize: `${backFontSize}px`,
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    backBg.on('pointerdown', () => this.scene.start('MainMenuScene'));
  }

  private calculateTotalPoints(): number {
    let totalLevels = 0;
    const heroIds = Object.keys(SKILL_TREES);
    heroIds.forEach((h) => {
      const hs = saveManager.getHeroStats(h);
      totalLevels += hs.bestWave;
    });
    return getSkillPointsForLevel(totalLevels);
  }

  private renderTree(headerHeight: number) {
    this.contentContainer.removeAll(true);
    const tree = SKILL_TREES[this.selectedHero];
    if (!tree) return;

    const { width, height } = this.scale;
    const numPaths = tree.paths.length;
    const pathSpacing = width / (numPaths + 1);

    // Available vertical space for tree content (minus header and back button area)
    const footerHeight = 60;
    const availableHeight = height - headerHeight - footerHeight;

    // Card dimensions derived from available space
    const cardW = Math.min(200, pathSpacing - 20);
    const cardH = Math.min(90, (availableHeight - 50) / 4 - 20);

    // Vertical spacing between nodes
    const pathNameFontSize = Math.max(13, Math.min(20, width * 0.025));
    const pathDescFontSize = Math.max(9, Math.min(11, width * 0.015));
    const pathNameAreaHeight = pathNameFontSize + pathDescFontSize + 16;

    // Space available for nodes after path name area
    const nodesAreaHeight = availableHeight - pathNameAreaHeight;
    const nodeSpacingY = Math.min(nodesAreaHeight / 4, cardH + 20);

    // Check if content would overflow and apply scale factor
    const totalContentHeight = pathNameAreaHeight + 4 * (cardH + 20);
    const scaleFactor = totalContentHeight > availableHeight
      ? availableHeight / totalContentHeight
      : 1;

    // Apply scale to content container for overflow handling
    this.contentContainer.setScale(1, scaleFactor);

    const startY = headerHeight;

    tree.paths.forEach((path, pathIdx) => {
      const px = pathSpacing * (pathIdx + 1);

      // Path name
      const pathName = this.add.text(px, startY, path.name, {
        fontSize: `${pathNameFontSize}px`,
        color: '#' + path.color.toString(16).padStart(6, '0'),
        fontStyle: 'bold',
      }).setOrigin(0.5);
      this.contentContainer.add(pathName);

      // Path description
      const pathDesc = this.add.text(px, startY + pathNameFontSize + 4, path.description, {
        fontSize: `${pathDescFontSize}px`,
        color: '#778899',
        wordWrap: { width: cardW - 10 },
        align: 'center',
      }).setOrigin(0.5, 0);
      this.contentContainer.add(pathDesc);

      // Nodes
      path.nodes.forEach((node, tierIdx) => {
        const ny = startY + pathNameAreaHeight + tierIdx * nodeSpacingY + cardH / 2;
        this.renderNode(px, ny, node, path.color, cardW, cardH);
      });
    });
  }

  private renderNode(
    x: number,
    y: number,
    node: SkillNode,
    pathColor: number,
    cardW: number,
    cardH: number,
  ) {
    const isUnlocked = this.unlockedNodes.includes(node.id);
    const canUnlock = !isUnlocked && this.availablePoints > 0 && canUnlockNode(node, this.unlockedNodes);

    const bgColor = isUnlocked ? pathColor : (canUnlock ? 0x333355 : 0x1a1a2a);
    const strokeColor = isUnlocked ? 0xffffff : (canUnlock ? pathColor : 0x333344);

    const bg = this.add.rectangle(x, y, cardW, cardH, bgColor)
      .setStrokeStyle(canUnlock ? 2 : 1, strokeColor);
    this.contentContainer.add(bg);

    // Responsive font sizes based on card dimensions
    const nameFontSize = Math.max(10, Math.min(14, cardW * 0.075));
    const descFontSize = Math.max(9, Math.min(11, cardW * 0.06));
    const tierFontSize = Math.max(8, Math.min(10, cardW * 0.05));

    const nameText = this.add.text(x, y - cardH * 0.22, node.name, {
      fontSize: `${nameFontSize}px`,
      color: isUnlocked ? '#ffffff' : (canUnlock ? '#ccddee' : '#556677'),
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.contentContainer.add(nameText);

    const descText = this.add.text(x, y + cardH * 0.05, node.description, {
      fontSize: `${descFontSize}px`,
      color: isUnlocked ? '#aabbcc' : '#445566',
      wordWrap: { width: cardW - 20 },
      align: 'center',
    }).setOrigin(0.5, 0);
    this.contentContainer.add(descText);

    // Tier indicator
    const tierText = this.add.text(x + cardW / 2 - 10, y - cardH / 2 + 4, `T${node.tier}`, {
      fontSize: `${tierFontSize}px`,
      color: '#445566',
    }).setOrigin(0.5, 0);
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
