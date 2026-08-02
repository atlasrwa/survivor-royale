import Phaser from 'phaser';

/**
 * BootScene - First scene to run.
 * Sets global Phaser settings and transitions to Preload.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Load the loading bar assets (minimal, just a white pixel)
    this.load.image('pixel', this.generatePixel());
  }

  create() {
    // Set pointer lock on click for better game feel
    this.input.setPollAlways();
    this.scene.start('PreloadScene');
  }

  /** Generate a 1x1 white pixel as a data URL for use as a placeholder */
  private generatePixel(): string {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 1, 1);
    }
    return canvas.toDataURL();
  }
}
