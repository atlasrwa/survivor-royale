import Phaser from 'phaser';

export interface DamageNumberConfig {
  x: number;
  y: number;
  damage: number;
  isCrit?: boolean;    // ability hits, big hits
  isHeal?: boolean;    // lifesteal healing
}

// Performance: limit active damage numbers on screen
let activeDamageNumbers = 0;
const MAX_DAMAGE_NUMBERS = 30;

/**
 * DamageNumber - floating text that appears on hit, drifts up, and fades out.
 * Throttled: skips small damage numbers when too many are active.
 */
export class DamageNumber {
  private text: Phaser.GameObjects.Text | null = null;

  constructor(scene: Phaser.Scene, config: DamageNumberConfig) {
    const { x, y, damage, isCrit, isHeal } = config;

    // Performance: skip non-crit small damage numbers when at capacity
    if (activeDamageNumbers >= MAX_DAMAGE_NUMBERS && !isCrit && !isHeal) {
      return;
    }
    
    // Color based on type
    let color = '#ffffff';
    let fontSize = '16px';
    if (isHeal) {
      color = '#44ff88';
      fontSize = '14px';
    } else if (isCrit) {
      color = '#ffcc00';
      fontSize = '22px';
    } else if (damage >= 100) {
      color = '#ff4444';
      fontSize = '20px';
    }

    const displayText = isHeal ? `+${damage}` : String(Math.ceil(damage));

    this.text = scene.add.text(x, y - 10, displayText, {
      fontSize,
      color,
      fontStyle: isCrit ? 'bold' : 'normal',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(200);

    activeDamageNumbers++;

    // Random horizontal offset for variety
    const offsetX = Phaser.Math.Between(-15, 15);

    // Float up + fade out
    scene.tweens.add({
      targets: this.text,
      y: y - 50 - (isCrit ? 20 : 0),
      x: x + offsetX,
      alpha: 0,
      scale: isCrit ? { from: 1.3, to: 0.8 } : { from: 1, to: 0.7 },
      duration: isCrit ? 900 : 700,
      ease: 'Power2',
      onComplete: () => {
        this.text?.destroy();
        activeDamageNumbers--;
      },
    });
  }
}
