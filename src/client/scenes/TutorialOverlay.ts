import Phaser from 'phaser';

/**
 * TutorialOverlay — Tap-to-advance card carousel teaching core mechanics.
 * Each card shows one game mechanic. Tap/click anywhere to go to next card.
 * Slide transition between cards. ESC to skip entirely.
 */

interface TutorialCard {
  title: string;
  instruction: string;
  hint: string;
}

export class TutorialOverlay extends Phaser.Scene {
  private currentCard: number = 0;
  private cards: TutorialCard[] = [];
  private isTransitioning: boolean = false;

  // UI elements
  private panel!: Phaser.GameObjects.Rectangle;
  private titleText!: Phaser.GameObjects.Text;
  private instructionText!: Phaser.GameObjects.Text;
  private hintText!: Phaser.GameObjects.Text;
  private tapPrompt!: Phaser.GameObjects.Text;
  private progressText!: Phaser.GameObjects.Text;
  private stepIndicators: Phaser.GameObjects.Arc[] = [];

  constructor() {
    super({ key: 'TutorialOverlay' });
  }

  create() {
    const { width, height } = this.scale;

    this.setupCards();
    this.createUI(width, height);
    this.showCard(0);

    // Tap/click anywhere to advance
    this.input.on('pointerdown', () => {
      if (!this.isTransitioning) {
        this.advanceCard();
      }
    });

    // Keyboard: Enter/Space to advance, ESC to skip
    const kb = this.input.keyboard;
    if (kb) {
      const enterKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
      const spaceKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
      const escKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

      enterKey.on('down', () => { if (!this.isTransitioning) this.advanceCard(); });
      spaceKey.on('down', () => { if (!this.isTransitioning) this.advanceCard(); });
      escKey.on('down', () => this.dismiss());
    }

    this.cameras.main.fadeIn(300, 0, 0, 0);
  }

  private setupCards() {
    this.cards = [
      {
        title: '🎮 MOVEMENT',
        instruction: 'Use WASD or swipe the joystick to move',
        hint: 'Your hero attacks automatically — just get close to enemies!',
      },
      {
        title: '⚡ DODGE',
        instruction: 'Press SPACE or tap the dodge button to roll',
        hint: 'You\'re invincible during dodge! Time it against attacks for 2× damage',
      },
      {
        title: '💥 ABILITIES',
        instruction: 'Q = Active ability (8s cooldown)\nE = Ultimate (charges after 30 kills)',
        hint: 'Use abilities at the right moment for maximum impact',
      },
      {
        title: '📈 LEVEL UP',
        instruction: 'Kill enemies → collect XP orbs → level up → pick upgrades',
        hint: 'Combine upgrades to unlock weapon evolutions!',
      },
      {
        title: '🎯 PRO TIPS',
        instruction: 'Right-click to aim at priority targets\nTab to cycle targets • ESC to pause',
        hint: 'Focus healers and ranged enemies first — they\'re the real threat',
      },
      {
        title: '⚔️ SURVIVE!',
        instruction: 'Survive 30 waves to win! Bosses at waves 10, 20, 30',
        hint: 'Good luck, warrior. Your score goes on the leaderboard!',
      },
    ];
  }

  private createUI(width: number, _height: number) {
    const cx = width / 2;
    const panelW = Math.min(460, width - 40);
    const panelY = 80;

    // Panel background
    this.panel = this.add.rectangle(cx, panelY, panelW, 130, 0x000000, 0.9)
      .setStrokeStyle(2, 0x4488ff, 0.8)
      .setDepth(300);

    // Title
    this.titleText = this.add.text(cx, panelY - 40, '', {
      fontSize: Math.min(22, width * 0.035) + 'px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(301);

    // Instruction
    this.instructionText = this.add.text(cx, panelY - 5, '', {
      fontSize: Math.min(15, width * 0.025) + 'px', color: '#ddeeff',
      align: 'center', wordWrap: { width: panelW - 40 },
    }).setOrigin(0.5).setDepth(301);

    // Hint
    this.hintText = this.add.text(cx, panelY + 30, '', {
      fontSize: Math.min(11, width * 0.018) + 'px', color: '#8899aa',
      align: 'center', wordWrap: { width: panelW - 40 },
    }).setOrigin(0.5).setDepth(301);

    // Tap to continue prompt
    this.tapPrompt = this.add.text(cx, panelY + 52, '▶ Tap anywhere to continue', {
      fontSize: '11px', color: '#88aacc', fontStyle: 'italic',
    }).setOrigin(0.5).setDepth(301);

    // Pulse animation on tap prompt
    this.tweens.add({
      targets: this.tapPrompt,
      alpha: { from: 0.4, to: 1 },
      yoyo: true,
      duration: 700,
      repeat: -1,
    });

    // Progress dots
    const dotStartX = cx - (this.cards.length - 1) * 10;
    for (let i = 0; i < this.cards.length; i++) {
      const dot = this.add.circle(dotStartX + i * 20, panelY + 55, 4, 0x334455)
        .setDepth(301);
      this.stepIndicators.push(dot);
    }

    // Progress text
    this.progressText = this.add.text(cx + panelW / 2 - 10, panelY - 55, '', {
      fontSize: '10px', color: '#667788',
    }).setOrigin(1, 0).setDepth(301);
  }

  private showCard(index: number) {
    if (index >= this.cards.length) {
      this.dismiss();
      return;
    }

    this.currentCard = index;
    const card = this.cards[index]!;

    this.titleText.setText(card.title);
    this.instructionText.setText(card.instruction);
    this.hintText.setText(card.hint);
    this.progressText.setText(`${index + 1} / ${this.cards.length}`);

    // Update dots
    this.stepIndicators.forEach((dot, i) => {
      if (i < index) dot.setFillStyle(0x44ff88);
      else if (i === index) dot.setFillStyle(0x4488ff);
      else dot.setFillStyle(0x334455);
    });

    // Last card — change tap prompt
    if (index === this.cards.length - 1) {
      this.tapPrompt.setText('▶ Tap to start playing!');
    }
  }

  private advanceCard() {
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    const elements = [this.titleText, this.instructionText, this.hintText];

    // Slide current content out
    this.tweens.add({
      targets: elements,
      x: '-=60',
      alpha: 0,
      duration: 150,
      ease: 'Power2',
      onComplete: () => {
        this.currentCard++;
        if (this.currentCard >= this.cards.length) {
          this.dismiss();
          return;
        }

        // Position new content to the right
        const cx = this.scale.width / 2;
        elements.forEach(el => {
          el.x = cx + 60;
          el.alpha = 0;
        });

        this.showCard(this.currentCard);

        // Slide new content in
        this.tweens.add({
          targets: elements,
          x: cx,
          alpha: 1,
          duration: 200,
          ease: 'Power2',
          onComplete: () => {
            this.isTransitioning = false;
          },
        });
      },
    });
  }

  private dismiss() {
    this.tweens.add({
      targets: [this.panel, this.titleText, this.instructionText, this.hintText, this.tapPrompt, this.progressText, ...this.stepIndicators],
      alpha: 0,
      y: '-=30',
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        this.scene.stop();
      },
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(_time: number, _delta: number) {
    // No per-frame checks needed — advancement is tap-driven
  }
}
