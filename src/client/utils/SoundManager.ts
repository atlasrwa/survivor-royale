/**
 * SoundManager — Procedural sound generation using Web Audio API.
 * Singleton pattern. No external audio files needed.
 */
export class SoundManager {
  private static instance: SoundManager | null = null;

  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private bgmGain: GainNode | null = null;

  private noiseBuffer: AudioBuffer | null = null;
  private bgmInterval: ReturnType<typeof setInterval> | null = null;
  private bgmOscillators: OscillatorNode[] = [];
  private isBgmPlaying = false;

  private masterVolume = 1;
  private sfxVolume = 0.7;
  private bgmVolume = 0.4;

  private constructor() {}

  static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  private ensureContext(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.masterVolume;
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = this.sfxVolume;
      this.sfxGain.connect(this.masterGain);

      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.value = this.bgmVolume;
      this.bgmGain.connect(this.masterGain);

      this.noiseBuffer = this.createNoiseBuffer();
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  private createNoiseBuffer(): AudioBuffer {
    const ctx = this.ctx!;
    const length = ctx.sampleRate * 0.5; // 0.5s of noise
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  // ── Volume controls ───────────────────────────────────────────────────────

  setMasterVolume(v: number) {
    this.masterVolume = Math.max(0, Math.min(1, v));
    if (this.masterGain) this.masterGain.gain.value = this.masterVolume;
  }

  setSfxVolume(v: number) {
    this.sfxVolume = Math.max(0, Math.min(1, v));
    if (this.sfxGain) this.sfxGain.gain.value = this.sfxVolume;
  }

  setBgmVolume(v: number) {
    this.bgmVolume = Math.max(0, Math.min(1, v));
    if (this.bgmGain) this.bgmGain.gain.value = this.bgmVolume;
  }

  // ── Main play method ──────────────────────────────────────────────────────

  playSound(name: string, options?: { pitch?: number; volume?: number }) {
    const ctx = this.ensureContext();
    const pitch = options?.pitch ?? 1;
    const volume = options?.volume ?? 1;

    switch (name) {
      case 'playerAttack': this.soundPlayerAttack(ctx, pitch, volume); break;
      case 'enemyHit': this.soundEnemyHit(ctx, pitch, volume); break;
      case 'enemyDeath': this.soundEnemyDeath(ctx, pitch, volume); break;
      case 'playerHit': this.soundPlayerHit(ctx, pitch, volume); break;
      case 'playerDodge': this.soundPlayerDodge(ctx, pitch, volume); break;
      case 'levelUp': this.soundLevelUp(ctx, pitch, volume); break;
      case 'abilityActivate': this.soundAbilityActivate(ctx, pitch, volume); break;
      case 'ultimateActivate': this.soundUltimateActivate(ctx, pitch, volume); break;
      case 'bossEntrance': this.soundBossEntrance(ctx, pitch, volume); break;
      case 'xpCollect': this.soundXpCollect(ctx, pitch, volume); break;
      case 'comboHit': this.soundComboHit(ctx, pitch, volume); break;
      case 'waveStart': this.soundWaveStart(ctx, pitch, volume); break;
      case 'uiClick': this.soundUiClick(ctx, pitch, volume); break;
      default: break;
    }
  }

  // ── BGM ───────────────────────────────────────────────────────────────────

  startBGM() {
    const ctx = this.ensureContext();
    if (this.isBgmPlaying) return;
    this.isBgmPlaying = true;

    // Bass drone
    const drone = ctx.createOscillator();
    drone.type = 'sawtooth';
    drone.frequency.value = 55; // A1
    const droneGain = ctx.createGain();
    droneGain.gain.value = 0.15;
    const droneFilter = ctx.createBiquadFilter();
    droneFilter.type = 'lowpass';
    droneFilter.frequency.value = 200;
    drone.connect(droneFilter);
    droneFilter.connect(droneGain);
    droneGain.connect(this.bgmGain!);
    drone.start();
    this.bgmOscillators.push(drone);

    // Sub bass
    const sub = ctx.createOscillator();
    sub.type = 'sine';
    sub.frequency.value = 36.7; // D1
    const subGain = ctx.createGain();
    subGain.gain.value = 0.2;
    sub.connect(subGain);
    subGain.connect(this.bgmGain!);
    sub.start();
    this.bgmOscillators.push(sub);

    // Rhythm sequencer
    let step = 0;
    const pattern = [1, 0, 0.6, 0, 0.8, 0, 0.5, 0];

    this.bgmInterval = setInterval(() => {
      const vel = pattern[step % pattern.length]!;
      step++;
      if (vel <= 0) return;

      const now = ctx.currentTime;
      const kick = ctx.createOscillator();
      kick.type = 'sine';
      kick.frequency.setValueAtTime(110 * vel, now);
      kick.frequency.exponentialRampToValueAtTime(40, now + 0.08);
      const kickGain = ctx.createGain();
      kickGain.gain.setValueAtTime(0.25 * vel, now);
      kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      kick.connect(kickGain);
      kickGain.connect(this.bgmGain!);
      kick.start(now);
      kick.stop(now + 0.15);
    }, 200);
  }

  stopBGM() {
    this.isBgmPlaying = false;
    this.bgmOscillators.forEach((osc) => {
      try { osc.stop(); } catch { /* already stopped */ }
    });
    this.bgmOscillators = [];
    if (this.bgmInterval !== null) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }

  // ── Sound implementations ─────────────────────────────────────────────────

  private soundPlayerAttack(ctx: AudioContext, pitch: number, volume: number) {
    const now = ctx.currentTime;
    // Noise-based whoosh with pitched character
    const source = ctx.createBufferSource();
    source.buffer = this.noiseBuffer!;
    source.playbackRate.value = pitch;

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 800 * pitch;
    bandpass.Q.value = 2;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.4 * volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    source.connect(bandpass);
    bandpass.connect(gain);
    gain.connect(this.sfxGain!);
    source.start(now);
    source.stop(now + 0.12);
  }

  private soundEnemyHit(ctx: AudioContext, pitch: number, volume: number) {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200 * pitch, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.06);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.35 * volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxGain!);
    osc.start(now);
    osc.stop(now + 0.08);
  }

  private soundEnemyDeath(ctx: AudioContext, pitch: number, volume: number) {
    const now = ctx.currentTime;
    // Pop/burst
    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(600 * pitch, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.15);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.3 * volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.sfxGain!);
    osc.start(now);
    osc.stop(now + 0.18);

    // Noise burst
    const noise = ctx.createBufferSource();
    noise.buffer = this.noiseBuffer!;
    const nGain = ctx.createGain();
    nGain.gain.setValueAtTime(0.15 * volume, now);
    nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 2000;
    noise.connect(hp);
    hp.connect(nGain);
    nGain.connect(this.sfxGain!);
    noise.start(now);
    noise.stop(now + 0.1);
  }

  private soundPlayerHit(ctx: AudioContext, pitch: number, volume: number) {
    const now = ctx.currentTime;
    // Deep thud
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120 * pitch, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.15);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.5 * volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(this.sfxGain!);
    osc.start(now);
    osc.stop(now + 0.2);

    // Low rumble
    const rumble = ctx.createOscillator();
    rumble.type = 'sawtooth';
    rumble.frequency.value = 35 * pitch;
    const rGain = ctx.createGain();
    rGain.gain.setValueAtTime(0.2 * volume, now);
    rGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 100;
    rumble.connect(lp);
    lp.connect(rGain);
    rGain.connect(this.sfxGain!);
    rumble.start(now);
    rumble.stop(now + 0.3);
  }

  private soundPlayerDodge(ctx: AudioContext, pitch: number, volume: number) {
    const now = ctx.currentTime;
    const source = ctx.createBufferSource();
    source.buffer = this.noiseBuffer!;
    source.playbackRate.value = 1.5 * pitch;

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(1500, now);
    bandpass.frequency.exponentialRampToValueAtTime(4000, now + 0.08);
    bandpass.Q.value = 1.5;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.3 * volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    source.connect(bandpass);
    bandpass.connect(gain);
    gain.connect(this.sfxGain!);
    source.start(now);
    source.stop(now + 0.1);
  }

  private soundLevelUp(ctx: AudioContext, pitch: number, volume: number) {
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    notes.forEach((freq, i) => {
      const t = now + i * 0.1;
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq * pitch;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.3 * volume, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(t);
      osc.stop(t + 0.35);
    });
  }

  private soundAbilityActivate(ctx: AudioContext, pitch: number, volume: number) {
    const now = ctx.currentTime;
    // Energetic burst: rising tone + noise
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200 * pitch, now);
    osc.frequency.exponentialRampToValueAtTime(800 * pitch, now + 0.12);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.35 * volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 3000;

    osc.connect(lp);
    lp.connect(gain);
    gain.connect(this.sfxGain!);
    osc.start(now);
    osc.stop(now + 0.2);

    // Noise accent
    const noise = ctx.createBufferSource();
    noise.buffer = this.noiseBuffer!;
    const nGain = ctx.createGain();
    nGain.gain.setValueAtTime(0.2 * volume, now);
    nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    noise.connect(nGain);
    nGain.connect(this.sfxGain!);
    noise.start(now);
    noise.stop(now + 0.15);
  }

  private soundUltimateActivate(ctx: AudioContext, pitch: number, volume: number) {
    const now = ctx.currentTime;
    // Dramatic multi-layer burst
    const freqs = [150, 300, 600];
    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator();
      osc.type = i === 0 ? 'sawtooth' : 'square';
      osc.frequency.setValueAtTime(f * pitch, now);
      osc.frequency.exponentialRampToValueAtTime(f * pitch * 2, now + 0.3);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.2 * volume, now + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(now + i * 0.05);
      osc.stop(now + 0.6);
    });

    // Noise sweep for reverb feel
    const noise = ctx.createBufferSource();
    noise.buffer = this.noiseBuffer!;
    const nGain = ctx.createGain();
    nGain.gain.setValueAtTime(0.25 * volume, now);
    nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(500, now);
    bp.frequency.exponentialRampToValueAtTime(3000, now + 0.4);
    bp.Q.value = 0.8;
    noise.connect(bp);
    bp.connect(nGain);
    nGain.connect(this.sfxGain!);
    noise.start(now);
    noise.stop(now + 0.8);
  }

  private soundBossEntrance(ctx: AudioContext, pitch: number, volume: number) {
    const now = ctx.currentTime;
    // Deep rumbling boom
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(60 * pitch, now);
    osc.frequency.exponentialRampToValueAtTime(25, now + 0.8);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.5 * volume, now);
    gain.gain.linearRampToValueAtTime(0.4 * volume, now + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    osc.connect(gain);
    gain.connect(this.sfxGain!);
    osc.start(now);
    osc.stop(now + 1.2);

    // Noise rumble layer
    const noise = ctx.createBufferSource();
    noise.buffer = this.noiseBuffer!;
    const nGain = ctx.createGain();
    nGain.gain.setValueAtTime(0.3 * volume, now);
    nGain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 150;
    noise.connect(lp);
    lp.connect(nGain);
    nGain.connect(this.sfxGain!);
    noise.start(now);
    noise.stop(now + 1.0);
  }

  private soundXpCollect(ctx: AudioContext, pitch: number, volume: number) {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 1800 * pitch;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.18 * volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(this.sfxGain!);
    osc.start(now);
    osc.stop(now + 0.06);
  }

  private soundComboHit(ctx: AudioContext, pitch: number, volume: number) {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = 600 * pitch;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.25 * volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(this.sfxGain!);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  private soundWaveStart(ctx: AudioContext, pitch: number, volume: number) {
    const now = ctx.currentTime;
    // Alert horn: two tones
    const freqs = [440, 554.37]; // A4, C#5
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = freq * pitch;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, now + i * 0.15);
      gain.gain.linearRampToValueAtTime(0.25 * volume, now + i * 0.15 + 0.03);
      gain.gain.linearRampToValueAtTime(0.2 * volume, now + i * 0.15 + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.4);

      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 2000;

      osc.connect(lp);
      lp.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(now + i * 0.15);
      osc.stop(now + i * 0.15 + 0.4);
    });
  }

  private soundUiClick(ctx: AudioContext, pitch: number, volume: number) {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 1000 * pitch;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.2 * volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    osc.connect(gain);
    gain.connect(this.sfxGain!);
    osc.start(now);
    osc.stop(now + 0.03);
  }
}

// ── Convenience export ────────────────────────────────────────────────────────

export function playSound(name: string, options?: { pitch?: number; volume?: number }) {
  SoundManager.getInstance().playSound(name, options);
}
