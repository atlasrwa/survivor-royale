import Phaser from 'phaser';

/**
 * TouchControls - Virtual joystick + ability buttons for mobile play.
 * Runs as a separate Phaser scene overlaid on GameScene (UI camera, fixed to screen).
 *
 * Controls:
 * - Left side: Virtual joystick for movement
 * - Right side: Buttons for Dodge, Q (Active), E (Ultimate)
 * - Swipe anywhere on right half for manual aim
 */
export class TouchControls extends Phaser.Scene {
  // Virtual joystick state (left half of screen)
  private joystickBase!: Phaser.GameObjects.Arc;
  private joystickThumb!: Phaser.GameObjects.Arc;
  private joystickActive: boolean = false;
  private joystickPointerId: number = -1;
  private joystickCenter: Phaser.Math.Vector2 = new Phaser.Math.Vector2(0, 0);
  private readonly JOYSTICK_RADIUS = 50;
  private readonly JOYSTICK_DEAD_ZONE = 8;

  // Output: normalized movement vector (read by Player)
  moveVector: Phaser.Math.Vector2 = new Phaser.Math.Vector2(0, 0);

  // Buttons
  private dodgeBtn!: Phaser.GameObjects.Arc;
  private activeBtn!: Phaser.GameObjects.Arc;
  private ultimateBtn!: Phaser.GameObjects.Arc;

  // Button press states (read by Player/AbilitySystem)
  dodgePressed: boolean = false;
  activeAbilityPressed: boolean = false;
  ultimatePressed: boolean = false;

  // Pause button
  pausePressed: boolean = false;
  private pauseBtn!: Phaser.GameObjects.Arc;

  // Manual aim (hold on right side)
  manualAimActive: boolean = false;
  manualAimAngle: number = 0;
  private aimPointerId: number = -1;

  private isMobile: boolean = false;

  constructor() {
    super({ key: 'TouchControls' });
  }

  create() {
    // Only show on touch devices
    this.isMobile = !this.sys.game.device.os.desktop;
    if (!this.isMobile) {
      // Also check if touch is available (tablets in desktop mode)
      this.isMobile = this.sys.game.device.input.touch;
    }

    if (!this.isMobile) {
      this.scene.stop();
      return;
    }

    const { width, height } = this.scale;
    this.createJoystick(width, height);
    this.createButtons(height);
    this.setupInput();

    // Listen for resize events to reposition controls
    this.scale.on('resize', (gameSize: Phaser.Structs.Size) => {
      this.repositionControls(gameSize.width, gameSize.height);
    });
  }

  private repositionControls(width: number, height: number) {
    // Reposition joystick
    const baseX = 100;
    const baseY = height - 120;
    this.joystickBase.setPosition(baseX, baseY);
    this.joystickThumb.setPosition(baseX, baseY);
    this.joystickCenter.set(baseX, baseY);

    // Reposition buttons
    const rightX = width - 80;
    this.dodgeBtn.setPosition(rightX, height - 80);
    this.activeBtn.setPosition(rightX - 50, height - 160);
    this.ultimateBtn.setPosition(rightX, height - 240);
  }

  private createJoystick(_width: number, height: number) {
    const baseX = 100;
    const baseY = height - 120;

    // Joystick base (semi-transparent circle)
    this.joystickBase = this.add.circle(baseX, baseY, this.JOYSTICK_RADIUS, 0x333333, 0.4)
      .setStrokeStyle(2, 0x666666, 0.6)
      .setDepth(500);

    // Joystick thumb (smaller, moves with finger)
    this.joystickThumb = this.add.circle(baseX, baseY, 22, 0x4488ff, 0.7)
      .setStrokeStyle(2, 0x88bbff, 0.9)
      .setDepth(501);

    this.joystickCenter.set(baseX, baseY);
  }

  private createButtons(height: number) {
    const rightX = this.scale.width - 80;
    const btnRadius = 28;

    // Dodge button (bottom-right, most accessible)
    const dodgeY = height - 80;
    this.dodgeBtn = this.add.circle(rightX, dodgeY, btnRadius, 0x00aacc, 0.5)
      .setStrokeStyle(2, 0x44ddff, 0.8)
      .setDepth(500)
      .setInteractive();
    this.add.text(rightX, dodgeY, '⚡', {
      fontSize: '20px',
    }).setOrigin(0.5).setDepth(501);

    // Active ability (Q) button
    const activeY = height - 160;
    this.activeBtn = this.add.circle(rightX - 50, activeY, btnRadius, 0xccaa00, 0.5)
      .setStrokeStyle(2, 0xffdd44, 0.8)
      .setDepth(500)
      .setInteractive();
    this.add.text(rightX - 50, activeY, 'Q', {
      fontSize: '18px', color: '#ffdd44', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(501);

    // Ultimate (E) button
    const ultY = height - 240;
    this.ultimateBtn = this.add.circle(rightX, ultY, btnRadius, 0x8822cc, 0.5)
      .setStrokeStyle(2, 0xaa44ff, 0.8)
      .setDepth(500)
      .setInteractive();
    this.add.text(rightX, ultY, 'E', {
      fontSize: '18px', color: '#aa44ff', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(501);

    // Pause button (top-right)
    const pauseX = this.scale.width - 50;
    const pauseY = 50;
    this.pauseBtn = this.add.circle(pauseX, pauseY, 22, 0x555555, 0.6)
      .setStrokeStyle(2, 0x999999, 0.8)
      .setDepth(500)
      .setInteractive();
    this.add.text(pauseX, pauseY, '⏸', {
      fontSize: '18px',
    }).setOrigin(0.5).setDepth(501);
  }

  private setupInput() {
    const halfWidth = this.scale.width / 2;

    // Multi-touch pointer handling
    this.input.addPointer(2); // Support up to 3 simultaneous touches

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      // Left half: joystick
      if (pointer.x < halfWidth && !this.joystickActive) {
        this.joystickActive = true;
        this.joystickPointerId = pointer.id;
        // Move base to where finger touched
        this.joystickCenter.set(pointer.x, pointer.y);
        this.joystickBase.setPosition(pointer.x, pointer.y);
        this.joystickThumb.setPosition(pointer.x, pointer.y);
        this.joystickBase.setAlpha(0.6);
      }
      // Right half: check if it's a button or aim
      else if (pointer.x >= halfWidth) {
        this.checkButtonPress(pointer);
      }
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (pointer.id === this.joystickPointerId && this.joystickActive) {
        this.updateJoystickPosition(pointer);
      }
      if (pointer.id === this.aimPointerId && this.manualAimActive) {
        // Update aim angle from center of screen to pointer
        const cx = this.scale.width / 2;
        const cy = this.scale.height / 2;
        this.manualAimAngle = Phaser.Math.Angle.Between(cx, cy, pointer.x, pointer.y);
      }
    });

    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (pointer.id === this.joystickPointerId) {
        this.joystickActive = false;
        this.joystickPointerId = -1;
        this.moveVector.set(0, 0);
        this.joystickThumb.setPosition(this.joystickCenter.x, this.joystickCenter.y);
        this.joystickBase.setAlpha(0.4);
      }
      if (pointer.id === this.aimPointerId) {
        this.manualAimActive = false;
        this.aimPointerId = -1;
      }
    });

    // Button interactions
    this.dodgeBtn.on('pointerdown', () => {
      this.dodgePressed = true;
      this.dodgeBtn.setFillStyle(0x00aacc, 0.9);
      // Reset after 1 frame (pulse trigger)
      this.time.delayedCall(100, () => {
        this.dodgePressed = false;
        this.dodgeBtn.setFillStyle(0x00aacc, 0.5);
      });
    });

    this.activeBtn.on('pointerdown', () => {
      this.activeAbilityPressed = true;
      this.activeBtn.setFillStyle(0xccaa00, 0.9);
      this.time.delayedCall(100, () => {
        this.activeAbilityPressed = false;
        this.activeBtn.setFillStyle(0xccaa00, 0.5);
      });
    });

    this.ultimateBtn.on('pointerdown', () => {
      this.ultimatePressed = true;
      this.ultimateBtn.setFillStyle(0x8822cc, 0.9);
      this.time.delayedCall(100, () => {
        this.ultimatePressed = false;
        this.ultimateBtn.setFillStyle(0x8822cc, 0.5);
      });
    });

    this.pauseBtn.on('pointerdown', () => {
      this.pausePressed = true;
      this.pauseBtn.setFillStyle(0x555555, 0.9);
      this.time.delayedCall(100, () => {
        this.pauseBtn.setFillStyle(0x555555, 0.6);
      });
    });
  }

  private updateJoystickPosition(pointer: Phaser.Input.Pointer) {
    const dx = pointer.x - this.joystickCenter.x;
    const dy = pointer.y - this.joystickCenter.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < this.JOYSTICK_DEAD_ZONE) {
      this.moveVector.set(0, 0);
      this.joystickThumb.setPosition(this.joystickCenter.x, this.joystickCenter.y);
      return;
    }

    // Clamp thumb position within radius
    const clampedDist = Math.min(dist, this.JOYSTICK_RADIUS);
    const angle = Math.atan2(dy, dx);
    const thumbX = this.joystickCenter.x + Math.cos(angle) * clampedDist;
    const thumbY = this.joystickCenter.y + Math.sin(angle) * clampedDist;
    this.joystickThumb.setPosition(thumbX, thumbY);

    // Normalize movement vector (0-1 range based on distance from center)
    const magnitude = Math.min(1, dist / this.JOYSTICK_RADIUS);
    this.moveVector.set(
      Math.cos(angle) * magnitude,
      Math.sin(angle) * magnitude
    );
  }

  private checkButtonPress(pointer: Phaser.Input.Pointer) {
    // Check if pointer is near any button (handled by interactive setups above)
    // If not near a button, treat as aim hold
    const dodgeDist = Phaser.Math.Distance.Between(pointer.x, pointer.y, this.dodgeBtn.x, this.dodgeBtn.y);
    const activeDist = Phaser.Math.Distance.Between(pointer.x, pointer.y, this.activeBtn.x, this.activeBtn.y);
    const ultDist = Phaser.Math.Distance.Between(pointer.x, pointer.y, this.ultimateBtn.x, this.ultimateBtn.y);

    const btnThreshold = 45; // slightly larger than visual for ease of tapping

    if (dodgeDist > btnThreshold && activeDist > btnThreshold && ultDist > btnThreshold) {
      // Not a button: start manual aim
      this.manualAimActive = true;
      this.aimPointerId = pointer.id;
      const cx = this.scale.width / 2;
      const cy = this.scale.height / 2;
      this.manualAimAngle = Phaser.Math.Angle.Between(cx, cy, pointer.x, pointer.y);
    }
  }

  hide() {
    this.scene.setVisible(false);
    this.input.enabled = false;
    this.moveVector.set(0, 0);
    this.manualAimActive = false;
  }

  show() {
    this.scene.setVisible(true);
    this.input.enabled = true;
  }

  update() {
    if (!this.isMobile) return;
    const gameScene = this.scene.get('GameScene');
    if (!gameScene || !gameScene.scene.isActive()) {
      this.hide();
    }
  }
}
