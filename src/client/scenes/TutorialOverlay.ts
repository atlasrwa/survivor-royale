import Phaser from 'phaser';

/**
 * Interactive tutorial that teaches core mechanics step-by-step.
 * Shows above the GameScene during the first run.
 * Each step requires the player to perform the action before advancing.
 */

interface TutorialStep {
  title: string;
  instruction: string;
  hint: string;
  /** Input check: returns true when the player has completed this step */
  checkComplete: (scene: Phaser.Scene, elapsed: number) => boolean;
  /** How long (ms) to wait showing "Good!" before advancing */
  celebrateMs?: number;
}

export class TutorialOverlay extends Phaser.Scene {
  private currentStep: number = 0;
  private stepElapsed: number = 0;
  private stepCompleted: boolean = false;
  private celebrateTimer: number = 0;

  // UI elements
  private panel!: Phaser.GameObjects.Rectangle;
  private titleText!: Phaser.GameObjects.Text;
  private instructionText!: Phaser.GameObjects.Text;
  private hintText!: Phaser.GameObjects.Text;
  private progressText!: Phaser.GameObjects.Text;
  private successText!: Phaser.GameObjects.Text;
  private stepIndicators: Phaser.GameObjects.Arc[] = [];

  // Tracking input state
  private hasMoved: boolean = false;
  private hasDodged: boolean = false;
  private hasUsedAbility: boolean = false;
  private hasKilled: boolean = false;
  private hasManualAimed: boolean = false;

  private steps: TutorialStep[] = [];

  constructor() {
    super({ key: 'TutorialOverlay' });
  }

  create() {
    const { width, height } = this.scale;

    this.setupSteps();
    this.setupInputTracking();
    this.createUI(width, height);
    this.showStep(0);

    this.cameras.main.fadeIn(400, 0, 0, 0);
  }

  private setupSteps() {
    this.steps = [
      {
        title: '🎮 MOVEMENT',
        instruction: 'Use WASD or Arrow Keys to move around',
        hint: 'Move in any direction to continue',
        checkComplete: () => this.hasMoved,
        celebrateMs: 800,
      },
      {
        title: '⚡ DODGE',
        instruction: 'Press SPACE to dodge — you\'re invincible during it!',
        hint: 'Dodge through enemy attacks for a Perfect Dodge (2× damage)',
        checkComplete: () => this.hasDodged,
        celebrateMs: 1000,
      },
      {
        title: '🎯 AUTO-ATTACK',
        instruction: 'Your hero attacks automatically! Just stay near enemies.',
        hint: 'Kill an enemy to continue',
        checkComplete: () => this.hasKilled,
        celebrateMs: 800,
      },
      {
        title: '💥 ABILITY (Q)',
        instruction: 'Press Q to use your active ability!',
        hint: 'It has a cooldown — use it at the right moment',
        checkComplete: () => this.hasUsedAbility,
        celebrateMs: 1000,
      },
      {
        title: '🎯 MANUAL AIM',
        instruction: 'Hold RIGHT-CLICK to aim manually at a specific target',
        hint: 'Useful for sniping healers or priority enemies',
        checkComplete: () => this.hasManualAimed,
        celebrateMs: 800,
      },
      {
        title: '✅ YOU\'RE READY!',
        instruction: 'Survive waves, collect XP, level up, choose upgrades!',
        hint: 'Press E for your Ultimate (charges after 30 kills) • ESC to pause',
        checkComplete: (_scene, elapsed) => elapsed > 3000,
        celebrateMs: 0,
      },
    ];
  }

  private setupInputTracking() {
    const kb = this.input.keyboard;
    if (!kb) return;

    // Movement tracking
    const moveKeys = ['W', 'A', 'S', 'D', 'UP', 'DOWN', 'LEFT', 'RIGHT'];
    moveKeys.forEach((key) => {
      const k = kb.addKey((Phaser.Input.Keyboard.KeyCodes as any)[key]);
      k.on('down', () => { this.hasMoved = true; });
    });

    // Dodge tracking
    const spaceKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    spaceKey.on('down', () => { this.hasDodged = true; });

    // Ability tracking
    const qKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
    qKey.on('down', () => { this.hasUsedAbility = true; });

    // Manual aim tracking
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.rightButtonDown()) {
        this.hasManualAimed = true;
      }
    });

    // Kill tracking: listen for event from GameScene
    const gameScene = this.scene.get('GameScene');
    if (gameScene) {
      gameScene.events.on('enemy-killed', () => { this.hasKilled = true; });
    }

    // Skip on Escape
    const escKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    escKey.on('down', () => this.dismiss());
  }

  private createUI(width: number, _height: number) {
    const cx = width / 2;
    const panelY = 80;

    // Panel background
    this.panel = this.add.rectangle(cx, panelY, 520, 140, 0x000000, 0.85)
      .setStrokeStyle(2, 0x4488ff, 0.8)
      .setDepth(300);

    // Title
    this.titleText = this.add.text(cx, panelY - 45, '', {
      fontSize: '22px', color: '#ffffff', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(301);

    // Instruction
    this.instructionText = this.add.text(cx, panelY - 10, '', {
      fontSize: '16px', color: '#ddeeff',
      align: 'center',
    }).setOrigin(0.5).setDepth(301);

    // Hint (smaller, dimmer)
    this.hintText = this.add.text(cx, panelY + 20, '', {
      fontSize: '12px', color: '#8899aa',
      align: 'center',
    }).setOrigin(0.5).setDepth(301);

    // Success text (hidden until step complete)
    this.successText = this.add.text(cx, panelY + 48, '✓ Great!', {
      fontSize: '18px', color: '#44ff88', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(301).setVisible(false);

    // Progress dots
    const dotStartX = cx - (this.steps.length - 1) * 12;
    for (let i = 0; i < this.steps.length; i++) {
      const dot = this.add.circle(dotStartX + i * 24, panelY + 55, 5, 0x334455)
        .setDepth(301);
      this.stepIndicators.push(dot);
    }

    // Skip hint
    this.add.text(cx, panelY + 55, 'ESC to skip tutorial', {
      fontSize: '10px', color: '#556677',
    }).setOrigin(0.5).setDepth(301);

    // Progress
    this.progressText = this.add.text(width - 20, panelY - 55, '', {
      fontSize: '11px', color: '#667788',
    }).setOrigin(1, 0).setDepth(301);
  }

  private showStep(index: number) {
    if (index >= this.steps.length) {
      this.dismiss();
      return;
    }

    this.currentStep = index;
    this.stepElapsed = 0;
    this.stepCompleted = false;
    this.celebrateTimer = 0;
    this.successText.setVisible(false);

    const step = this.steps[index];
    if (!step) return;
    this.titleText.setText(step.title);
    this.instructionText.setText(step.instruction);
    this.hintText.setText(step.hint);
    this.progressText.setText(`${index + 1} / ${this.steps.length}`);

    // Update dots
    this.stepIndicators.forEach((dot, i) => {
      if (i < index) {
        dot.setFillStyle(0x44ff88); // completed = green
      } else if (i === index) {
        dot.setFillStyle(0x4488ff); // current = blue
        // Pulse animation
        this.tweens.add({
          targets: dot, scaleX: 1.4, scaleY: 1.4,
          yoyo: true, duration: 500, repeat: -1,
        });
      } else {
        dot.setFillStyle(0x334455); // upcoming = dim
      }
    });

    // Pulse the panel border
    this.tweens.add({
      targets: this.panel,
      strokeAlpha: { from: 0.4, to: 1 },
      yoyo: true,
      duration: 800,
      repeat: 2,
    });
  }

  update(_time: number, delta: number) {
    this.stepElapsed += delta;

    if (this.stepCompleted) {
      this.celebrateTimer -= delta;
      if (this.celebrateTimer <= 0) {
        this.showStep(this.currentStep + 1);
      }
      return;
    }

    const step = this.steps[this.currentStep];
    if (step && step.checkComplete(this, this.stepElapsed)) {
      this.completeCurrentStep();
    }
  }

  private completeCurrentStep() {
    this.stepCompleted = true;
    const step = this.steps[this.currentStep];
    const celebrateMs = step?.celebrateMs ?? 800;
    this.celebrateTimer = celebrateMs;

    // Show success
    this.successText.setVisible(true);
    this.successText.setScale(0);
    this.tweens.add({
      targets: this.successText,
      scaleX: 1, scaleY: 1,
      duration: 200, ease: 'Back.easeOut',
    });

    // Flash panel green briefly
    this.panel.setStrokeStyle(2, 0x44ff88, 1);
    this.time.delayedCall(400, () => {
      if (this.panel.active) this.panel.setStrokeStyle(2, 0x4488ff, 0.8);
    });
  }

  private dismiss() {
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.time.delayedCall(300, () => {
      this.scene.stop();
    });
  }
}
