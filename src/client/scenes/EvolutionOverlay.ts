import Phaser from 'phaser';
import { WEAPON_EVOLUTIONS, type EvolvedWeaponId } from '@/shared/constants/evolutions';

interface EvolutionOverlayData {
  availableEvolutions: EvolvedWeaponId[];
}

/**
 * EvolutionOverlay - golden legendary modal that pauses the game
 * and presents weapon evolution choices (usually 1 at a time).
 */
export class EvolutionOverlay extends Phaser.Scene {
  private onSelect?: (evoId: EvolvedWeaponId) => void;
  private hasSelected: boolean = false;

  constructor() {
    super({ key: 'EvolutionOverlay' });
  }

  create(data: EvolutionOverlayData) {
    this.hasSelected = false;
    const { width, height } = this.scale;
    const cx = width / 2;

    // Dark overlay with golden tint
    this.add.rectangle(cx, height / 2, width, height, 0x000000, 0.9);

    // Animated golden border lines
    const borderTop = this.add
      .rectangle(cx, 0, width, 4, 0xffdd44)
      .setOrigin(0.5, 0)
      .setDepth(2);
    const borderBot = this.add
      .rectangle(cx, height, width, 4, 0xffdd44)
      .setOrigin(0.5, 1)
      .setDepth(2);
    this.tweens.add({
      targets: [borderTop, borderBot],
      alpha: { from: 0.4, to: 1 },
      duration: 800,
      yoyo: true,
      repeat: -1,
    });

    // Title with golden glow effect
    const title = this.add
      .text(cx, 60, '✦ WEAPON EVOLUTION ✦', {
        fontSize: '52px',
        color: '#ffdd44',
        fontStyle: 'bold',
        stroke: '#aa8800',
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    // Pulse title
    this.tweens.add({
      targets: title,
      scale: { from: 1, to: 1.05 },
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut',
    });

    this.add
      .text(cx, 125, 'Your weapons have reached maximum synergy!', {
        fontSize: '18px',
        color: '#ffeeaa',
      })
      .setOrigin(0.5);

    // Create evolution cards
    const evolutions = data.availableEvolutions;
    const cardSpacing = 320;
    const startX = cx - (evolutions.length - 1) * cardSpacing / 2;

    evolutions.forEach((evoId, i) => {
      const evo = WEAPON_EVOLUTIONS[evoId];
      this.createEvolutionCard(startX + i * cardSpacing, 360, evo, () => {
        this.selectEvolution(evoId);
      });
    });

    // Fade in with golden flash
    this.cameras.main.fadeIn(300, 60, 50, 0);
  }

  private createEvolutionCard(
    x: number,
    y: number,
    evo: typeof WEAPON_EVOLUTIONS[EvolvedWeaponId],
    onClick: () => void
  ) {
    const container = this.add.container(x, y);
    const cardW = 280;
    const cardH = 360;

    // Card background with golden border
    const bg = this.add
      .rectangle(0, 0, cardW, cardH, 0x1a1a0a)
      .setStrokeStyle(4, 0xffdd44);

    // Inner glow rectangle
    const innerGlow = this.add
      .rectangle(0, 0, cardW - 8, cardH - 8, evo.color, 0.08);

    // Evolution name
    const nameText = this.add
      .text(0, -130, evo.name, {
        fontSize: '24px',
        color: '#ffdd44',
        fontStyle: 'bold',
        wordWrap: { width: cardW - 20 },
        align: 'center',
      })
      .setOrigin(0.5);

    // Decorative divider
    const divider = this.add
      .rectangle(0, -95, cardW - 40, 2, 0xffdd44, 0.6);

    // Description
    const descText = this.add
      .text(0, -50, evo.description, {
        fontSize: '17px',
        color: '#ffffff',
        wordWrap: { width: cardW - 30 },
        align: 'center',
      })
      .setOrigin(0.5);

    // Requirements label
    const reqLabel = this.add
      .text(0, 20, 'REQUIREMENTS MET:', {
        fontSize: '12px',
        color: '#88aa66',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    const [req1, req2] = evo.requirements;
    const reqText = this.add
      .text(0, 42, `✓ ${req1} (MAX)  ✓ ${req2} (MAX)`, {
        fontSize: '13px',
        color: '#66ff66',
      })
      .setOrigin(0.5);

    // Effects preview
    const effectEntries = Object.entries(evo.effects);
    const effectStr = effectEntries
      .map(([k, v]) => `${k}: ${v}`)
      .join('\n');
    const effectText = this.add
      .text(0, 85, effectStr, {
        fontSize: '13px',
        color: '#ccddff',
        align: 'center',
      })
      .setOrigin(0.5);

    // EVOLVE button with golden styling
    const btnBg = this.add
      .rectangle(0, 145, 200, 50, 0xddaa00)
      .setStrokeStyle(3, 0xffee88);
    const btnText = this.add
      .text(0, 145, '⚡ EVOLVE', {
        fontSize: '22px',
        color: '#1a1a00',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    container.add([bg, innerGlow, nameText, divider, descText, reqLabel, reqText, effectText, btnBg, btnText]);

    // Entrance animation
    container.setScale(0.8).setAlpha(0);
    this.tweens.add({
      targets: container,
      scale: 1,
      alpha: 1,
      duration: 400,
      ease: 'Back.Out',
    });

    // Pulsing inner glow
    this.tweens.add({
      targets: innerGlow,
      alpha: { from: 0.05, to: 0.15 },
      duration: 1500,
      yoyo: true,
      repeat: -1,
    });

    // Interactivity
    bg.setInteractive({ useHandCursor: true });
    btnBg.setInteractive({ useHandCursor: true });

    const hover = () => {
      container.setScale(1.06);
      bg.setStrokeStyle(5, 0xffee88);
      btnBg.setFillStyle(0xffcc00);
    };
    const unhover = () => {
      container.setScale(1);
      bg.setStrokeStyle(4, 0xffdd44);
      btnBg.setFillStyle(0xddaa00);
    };

    bg.on('pointerover', hover);
    bg.on('pointerout', unhover);
    bg.on('pointerdown', onClick);
    btnBg.on('pointerover', hover);
    btnBg.on('pointerout', unhover);
    btnBg.on('pointerdown', onClick);
  }

  private selectEvolution(evoId: EvolvedWeaponId) {
    if (this.hasSelected) return;
    this.hasSelected = true;

    this.cameras.main.fadeOut(200, 60, 50, 0);
    this.time.delayedCall(200, () => {
      this.onSelect?.(evoId);
      this.scene.stop();
    });
  }

  setOnSelect(callback: (evoId: EvolvedWeaponId) => void) {
    this.onSelect = callback;
  }
}
