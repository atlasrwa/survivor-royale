import Phaser from 'phaser';
import { HERO_DEFINITIONS, xpForLevel } from '@/shared/constants/heroes';
import { SKILL_TREES } from '@/shared/constants/skillTrees';
import { saveManager } from '@/client/utils/SaveManager';
import { playSound } from '@/client/utils/SoundManager';
import type { UpgradeId } from '@/shared/constants/upgrades';
import type { EvolvedWeaponId } from '@/shared/constants/evolutions';
import type { HeroId } from '@/shared/types/entities';

export interface PlayerConfig {
  heroId: HeroId;
  x: number;
  y: number;
}

/**
 * Player - handles movement, dodge, taking damage, XP/leveling.
 * Auto-attacks are fired by the WeaponSystem which references this object.
 */
export class Player extends Phaser.Physics.Arcade.Sprite {
  readonly heroId: HeroId;

  // Stats
  maxHp: number;
  hp: number;
  speed: number;
  private readonly baseSpeed: number;
  defense: number;
  attackDamage: number;
  attackSpeed: number;
  attackRange: number;

  // Level / XP
  level: number = 1;
  xp: number = 0;
  xpToNextLevel: number = 100;

  // Upgrades
  upgrades: Partial<Record<UpgradeId, number>> = {};

  // Evolutions
  evolvedWeapons: EvolvedWeaponId[] = [];
  hasAutoRevive: boolean = false;
  comboLifesteal: boolean = false;
  deathExplosionDamage: number = 0;
  homingProjectileCount: number = 0;
  infinitePiercing: boolean = false;
  private hpRegenRate: number = 0; // HP per second
  private hpRegenAccumulator: number = 0;

  // ── Skill tree gameplay effects ──────────────────────────────────────
  critChance: number = 0;       // 0-1 probability of critical hit
  critDamageBonus: number = 0;  // extra crit damage multiplier (0.5 = 150% crit)
  reflectDamage: boolean = false;   // reflect portion of damage to attacker
  arcAttack: boolean = false;       // attacks hit in an arc (wider projectile)
  burnDot: boolean = false;         // attacks apply burn DoT
  slowOnHit: boolean = false;       // attacks slow enemies
  chainLightning: number = 0;       // attacks chain to N extra enemies
  stunOnCrit: boolean = false;      // crits stun enemy briefly

  // Skill tree bonus stats
  skillTreeMultishot: number = 0;       // extra arrows from skill tree (Archer)
  abilityCooldownReduction: number = 0; // fraction reduction for Q/E cooldowns (Mage)
  meleeLifestealBonus: number = 0;      // extra % max HP healed per melee hit (Knight)

  // Dodge state
  isDodging: boolean = false;
  private dodgeCooldown: number;
  private dodgeDuration: number;
  private dodgeSpeed: number;
  private dodgeTimer: number = 0;
  private dodgeCooldownTimer: number = 0;
  private dodgeVelocity: Phaser.Math.Vector2 = new Phaser.Math.Vector2(0, 0);

  // Perfect dodge: triggered when dodging through an attack
  isPerfectDodgeActive: boolean = false;
  private perfectDodgeTimer: number = 0;
  private readonly PERFECT_DODGE_WINDOW = 150; // ms window at start of dodge for "perfect"
  private readonly PERFECT_DODGE_BONUS_DURATION = 1500; // 1.5s of bonus after perfect dodge
  private perfectDodgeElapsed: number = 0; // time since dodge started (to check window)

  // Manual aim override (right-click hold)
  manualAimActive: boolean = false;
  manualAimAngle: number = 0;

  // Hit flash
  isInvincible: boolean = false;
  private invincibilityTimer: number = 0;
  private readonly INVINCIBILITY_DURATION = 500; // ms after taking damage

  // Death recap tracking
  lastDamageSource: string = '';
  lastDamageAmount: number = 0;
  damageHistory: Array<{ source: string; amount: number; time: number }> = [];
  private sessionStartTime: number = Date.now();

  // Facing direction (normalized)
  facing: Phaser.Math.Vector2 = new Phaser.Math.Vector2(0, -1);

  // Input
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys!: {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
  };
  private spaceKey!: Phaser.Input.Keyboard.Key;

  // Callbacks
  onDeath?: () => void;
  onLevelUp?: (newLevel: number) => void;

  constructor(scene: Phaser.Scene, config: PlayerConfig) {
    const def = HERO_DEFINITIONS[config.heroId];
    if (!def) throw new Error(`Hero ${config.heroId} not found`);

    super(scene, config.x, config.y, `hero_${config.heroId}`);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.heroId = config.heroId;

    // Initialize stats from definition
    this.maxHp = def.baseStats.maxHp;
    this.hp = def.baseStats.hp;
    this.speed = def.baseStats.speed;
    this.baseSpeed = def.baseStats.speed;
    this.defense = def.baseStats.defense;
    this.attackDamage = def.baseStats.attackDamage;
    this.attackSpeed = def.baseStats.attackSpeed;
    this.attackRange = def.baseStats.attackRange;
    this.dodgeCooldown = def.baseStats.dodgeCooldown;
    this.dodgeDuration = def.baseStats.dodgeDuration;
    this.dodgeSpeed = def.baseStats.dodgeSpeed;

    // Physics body setup
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCircle(18, 0, 0);
    body.setMaxVelocity(600, 600);
    this.setDepth(10);

    // Real sprites are 64px, scale to game size
    // Placeholder sprites are 32px, scale up slightly
    const textureFrame = this.texture.get('__BASE');
    const texSize = textureFrame?.width ?? 32;
    if (texSize >= 64) {
      this.setScale(0.7); // 64px * 0.7 = ~45px in-game
      body.setCircle(22, 10, 10);
    } else {
      this.setScale(1.3); // 32px * 1.3 = ~42px in-game
    }

    // Hero-specific innate bonuses (identity passives)
    this.applyHeroPassives();

    // Apply skill tree effects from saved unlocks
    this.applySkillTreeEffects();

    // Input setup
    this.setupInput();
  }

  private setupInput() {
    const kb = this.scene.input.keyboard;
    if (!kb) return;

    this.cursors = kb.createCursorKeys();
    this.wasdKeys = {
      up: kb.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: kb.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: kb.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: kb.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
    this.spaceKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Right-click hold for manual aim
    this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.rightButtonDown()) {
        this.manualAimActive = true;
      }
    });
    this.scene.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (!pointer.rightButtonDown()) {
        this.manualAimActive = false;
      }
    });
    this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.manualAimActive) {
        const worldPoint = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
        this.manualAimAngle = Phaser.Math.Angle.Between(this.x, this.y, worldPoint.x, worldPoint.y);
      }
    });
    // Prevent context menu on right-click
    this.scene.game.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  // ── Hero identity passives ────────────────────────────────────────────
  /** Mage splash radius (0 = no splash). Splash deals 50% damage to nearby enemies. */
  splashRadius: number = 0;
  splashDamageRatio: number = 0;

  /**
   * Apply innate hero passives that define each hero's identity:
   * - Knight: no special passive (identity is raw tankiness + AoE sweep)
   * - Archer: innate 15% crit chance + 50% crit damage bonus (rewards rapid fire)
   * - Mage: splash damage on every hit (60px radius, 50% damage to nearby)
   */
  private applyHeroPassives() {
    switch (this.heroId) {
      case 'archer':
        this.critChance = 0.15;          // 15% innate crit
        this.critDamageBonus = 0.5;      // Crits deal 200% (1.5 + 0.5)
        break;
      case 'mage':
        this.splashRadius = 60;          // Every hit splashes in 60px
        this.splashDamageRatio = 0.5;    // Splash deals 50% of hit damage
        break;
      case 'knight':
        // Knight passive: innate lifesteal on melee (heals 3% max HP per hit)
        // Implemented in WeaponSystem melee sweep
        break;
    }
  }

  /**
   * Apply all unlocked skill tree node effects to the player's stats.
   * Called once at construction. Stat-based effects are applied as multipliers,
   * ability-based effects set boolean flags that other systems check.
   */
  private applySkillTreeEffects() {
    const unlockedIds = saveManager.getUnlockedSkills();
    if (unlockedIds.length === 0) return;

    const heroTree = SKILL_TREES[this.heroId];
    if (!heroTree) return;

    // Collect all effects from unlocked nodes for this hero
    for (const path of heroTree.paths) {
      for (const node of path.nodes) {
        if (!unlockedIds.includes(node.id)) continue;

        const fx = node.effects;

        // Stat multipliers (additive percentage boosts)
        if (fx.attackDamage) this.attackDamage = Math.floor(this.attackDamage * (1 + fx.attackDamage));
        if (fx.attackSpeed) this.attackSpeed *= (1 + fx.attackSpeed);
        if (fx.defense) this.defense = Math.floor(this.defense * (1 + fx.defense));
        if (fx.maxHp) {
          this.maxHp = Math.floor(this.maxHp * (1 + fx.maxHp));
          this.hp = this.maxHp;
        }
        if (fx.speed) this.speed *= (1 + fx.speed);
        if (fx.attackRange) this.attackRange = Math.floor(this.attackRange * (1 + fx.attackRange));
        if (fx.dodgeCooldown) this.dodgeCooldown = Math.max(100, this.dodgeCooldown * (1 + fx.dodgeCooldown));
        if (fx.fireDamage) this.attackDamage = Math.floor(this.attackDamage * (1 + fx.fireDamage));
        if (fx.critDamage) this.critDamageBonus += fx.critDamage;

        // Gameplay ability flags (tier 3-4)
        if (fx.critChance) this.critChance += fx.critChance;
        if (fx.arcAttack) this.arcAttack = true;
        if (fx.reflect) this.reflectDamage = true;
        if (fx.burnDot) this.burnDot = true;
        if (fx.slowOnHit) this.slowOnHit = true;
        if (fx.chainCount) this.chainLightning += fx.chainCount;
        if (fx.stunOnCrit) this.stunOnCrit = true;

        // Pierce bonus from Sniper tree
        if (fx.pierce) this.infinitePiercing = true;

        // Archer: bonus multishot from skill tree
        if (fx.multishot) this.skillTreeMultishot += fx.multishot;

        // Mage: ability cooldown reduction
        if (fx.abilityCooldown) this.abilityCooldownReduction += Math.abs(fx.abilityCooldown);

        // Mage: splash bonuses
        if (fx.splashRadius) this.splashRadius = Math.floor(this.splashRadius * (1 + fx.splashRadius));
        if (fx.splashDamage) this.splashDamageRatio += fx.splashDamage;

        // Knight: enhanced melee lifesteal
        if (fx.meleLifesteal) this.meleeLifestealBonus += fx.meleLifesteal;

        // Knight: auto-revive
        if (fx.autoRevive) this.hasAutoRevive = true;
      }
    }
  }

  update(delta: number) {
    if (this.hp <= 0) return;

    this.updateTimers(delta);
    this.updateHpRegen(delta);

    if (this.isDodging) {
      this.updateDodge(delta);
    } else {
      this.updateMovement();
      this.checkDodgeInput();
    }

    this.updateVisuals();
  }

  private updateTimers(delta: number) {
    if (this.dodgeCooldownTimer > 0) {
      this.dodgeCooldownTimer -= delta;
    }
    if (this.invincibilityTimer > 0) {
      this.invincibilityTimer -= delta;
      if (this.invincibilityTimer <= 0) {
        this.isInvincible = false;
        this.setAlpha(1);
      }
    }
    // Perfect dodge bonus timer
    if (this.perfectDodgeTimer > 0) {
      this.perfectDodgeTimer -= delta;
      if (this.perfectDodgeTimer <= 0) {
        this.isPerfectDodgeActive = false;
      }
    }
  }

  private updateMovement() {
    const body = this.body as Phaser.Physics.Arcade.Body;
    const moveDir = new Phaser.Math.Vector2(0, 0);

    // Keyboard input
    if (this.cursors.left.isDown || this.wasdKeys.left.isDown) moveDir.x -= 1;
    if (this.cursors.right.isDown || this.wasdKeys.right.isDown) moveDir.x += 1;
    if (this.cursors.up.isDown || this.wasdKeys.up.isDown) moveDir.y -= 1;
    if (this.cursors.down.isDown || this.wasdKeys.down.isDown) moveDir.y += 1;

    // Touch controls fallback (virtual joystick)
    if (moveDir.length() === 0) {
      const touchScene = this.scene.scene.get('TouchControls') as any;
      if (touchScene?.moveVector && (touchScene.moveVector.x !== 0 || touchScene.moveVector.y !== 0)) {
        moveDir.set(touchScene.moveVector.x, touchScene.moveVector.y);
      }
    }

    // Touch: dodge button
    const touchScene = this.scene.scene.get('TouchControls') as any;
    if (touchScene?.dodgePressed && this.dodgeCooldownTimer <= 0 && !this.isDodging) {
      this.startDodge();
    }

    // Touch: manual aim
    if (touchScene?.manualAimActive) {
      this.manualAimActive = true;
      this.manualAimAngle = touchScene.manualAimAngle;
    }

    if (moveDir.length() > 0) {
      moveDir.normalize();
      this.facing.set(moveDir.x, moveDir.y);
      body.setVelocity(moveDir.x * this.speed, moveDir.y * this.speed);
    } else {
      body.setVelocity(0, 0);
    }
  }

  private checkDodgeInput() {
    if (
      Phaser.Input.Keyboard.JustDown(this.spaceKey) &&
      this.dodgeCooldownTimer <= 0
    ) {
      this.startDodge();
    }
  }

  private startDodge() {
    playSound('playerDodge');
    this.isDodging = true;
    this.isInvincible = true;
    this.dodgeTimer = this.dodgeDuration;
    this.dodgeCooldownTimer = this.dodgeCooldown;
    this.perfectDodgeElapsed = 0; // reset perfect dodge window tracker

    // Dodge in movement input direction; fall back to facing if no input
    const moveDir = new Phaser.Math.Vector2(0, 0);
    if (this.cursors.left.isDown || this.wasdKeys.left.isDown) moveDir.x -= 1;
    if (this.cursors.right.isDown || this.wasdKeys.right.isDown) moveDir.x += 1;
    if (this.cursors.up.isDown || this.wasdKeys.up.isDown) moveDir.y -= 1;
    if (this.cursors.down.isDown || this.wasdKeys.down.isDown) moveDir.y += 1;

    if (moveDir.length() > 0) {
      moveDir.normalize();
    } else {
      moveDir.set(this.facing.x, this.facing.y);
    }

    this.dodgeVelocity.set(moveDir.x * this.dodgeSpeed, moveDir.y * this.dodgeSpeed);

    // Visual feedback
    this.setAlpha(0.5);
  }

  private updateDodge(delta: number) {
    this.dodgeTimer -= delta;
    this.perfectDodgeElapsed += delta;
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(this.dodgeVelocity.x, this.dodgeVelocity.y);

    if (this.dodgeTimer <= 0) {
      this.isDodging = false;
      // Keep brief invincibility after dodge ends
      this.invincibilityTimer = 100;
    }
  }

  private updateVisuals() {
    // Rotate sprite to face movement direction
    if (this.facing.length() > 0) {
      this.setRotation(Math.atan2(this.facing.y, this.facing.x) + Math.PI / 2);
    }

    // Dodge flash
    if (this.isDodging) {
      this.setAlpha(0.5 + Math.sin(Date.now() / 30) * 0.3);
    } else if (!this.isInvincible) {
      this.setAlpha(1);
    }
  }

  private updateHpRegen(delta: number) {
    if (this.hpRegenRate <= 0 || this.hp >= this.maxHp) return;
    this.hpRegenAccumulator += (this.hpRegenRate * delta) / 1000;
    if (this.hpRegenAccumulator >= 1) {
      const regenAmount = Math.floor(this.hpRegenAccumulator);
      this.hpRegenAccumulator -= regenAmount;
      this.heal(regenAmount);
    }
  }

  /**
   * Perfect dodge: grants 1.5s of double damage when dodging through an attack
   * within the first 150ms of the dodge.
   */
  private triggerPerfectDodge() {
    this.isPerfectDodgeActive = true;
    this.perfectDodgeTimer = this.PERFECT_DODGE_BONUS_DURATION;
    playSound('comboHit', { pitch: 2.0 });

    // Visual feedback: gold flash + floating text
    this.setTint(0xffdd00);
    this.scene.time.delayedCall(200, () => {
      if (this.active && !this.isPerfectDodgeActive) this.clearTint();
    });

    const txt = this.scene.add
      .text(this.x, this.y - 50, '✨ PERFECT DODGE!', {
        fontSize: '18px', color: '#ffdd00',
        fontStyle: 'bold', stroke: '#000000', strokeThickness: 3,
      })
      .setOrigin(0.5).setDepth(200);

    this.scene.tweens.add({
      targets: txt, y: this.y - 100, alpha: 0,
      duration: 1200, ease: 'Power2',
      onComplete: () => txt.destroy(),
    });
  }

  /** Damage multiplier including perfect dodge bonus and adrenaline */
  get damageMultiplier(): number {
    let mult = this.isPerfectDodgeActive ? 2.0 : 1.0;
    // Adrenaline: +1% damage per 1% missing HP
    if ((this.upgrades['adrenaline'] ?? 0) > 0) {
      const missingHpPercent = 1 - (this.hp / this.maxHp);
      mult *= (1 + missingHpPercent);
    }
    return mult;
  }

  takeDamage(amount: number, source: string = 'Unknown'): boolean {
    if (this.hp <= 0) return false;

    // Perfect dodge: if we're dodging and within the early window, trigger bonus
    if (this.isDodging) {
      if (this.perfectDodgeElapsed <= this.PERFECT_DODGE_WINDOW && !this.isPerfectDodgeActive) {
        this.triggerPerfectDodge();
      }
      return false;
    }

    if (this.isInvincible) return false;

    // Defense is now percentage-based: defense stat = % damage reduction (capped at 75%)
    const reductionPercent = Math.min(this.defense, 75) / 100;
    const actual = Math.max(1, Math.floor(amount * (1 - reductionPercent)));
    this.hp = Math.max(0, this.hp - actual);
    playSound('playerHit');

    // Track damage for death recap
    this.lastDamageSource = source;
    this.lastDamageAmount = actual;
    this.damageHistory.push({
      source,
      amount: actual,
      time: Date.now() - this.sessionStartTime,
    });
    // Keep last 20 entries
    if (this.damageHistory.length > 20) {
      this.damageHistory.shift();
    }

    // Damage flash
    this.setTint(0xff4444);
    this.scene.time.delayedCall(100, () => {
      if (this.active) this.clearTint();
    });

    // Set invincibility frames
    this.isInvincible = true;
    this.invincibilityTimer = this.INVINCIBILITY_DURATION;

    if (this.hp <= 0) {
      this.onDeath?.();
    }

    return true;
  }

  gainXp(amount: number) {
    this.xp += amount;
    while (this.xp >= this.xpToNextLevel) {
      this.xp -= this.xpToNextLevel;
      this.level++;
      this.xpToNextLevel = xpForLevel(this.level + 1);
      this.applyLevelUpBonus();
      this.onLevelUp?.(this.level);
    }
  }

  private applyLevelUpBonus() {
    // Flattened power curve: smaller per-level bonuses keep late-game challenging
    this.maxHp = Math.floor(this.maxHp * 1.05); // was 1.1
    this.hp = Math.min(this.maxHp, this.hp + Math.floor(this.maxHp * 0.2));
    this.speed *= 1.01; // was 1.03
    this.speed = Math.min(this.speed, this.baseSpeed * 1.5); // cap lower
    this.attackDamage *= 1.05; // was 1.08
    const baseDef = HERO_DEFINITIONS[this.heroId];
    if (baseDef) {
      this.attackDamage = Math.min(this.attackDamage, baseDef.baseStats.attackDamage * 4);
    }
    // No auto defense gain — player must pick defense upgrades intentionally
  }

  /** Multiplier for all healing received (set by difficulty tier) */
  healingMultiplier: number = 1;

  heal(amount: number) {
    const effective = Math.floor(amount * this.healingMultiplier);
    this.hp = Math.min(this.maxHp, this.hp + effective);
  }

  /** Set invincibility state (used by AbilitySystem for Titan Form) */
  setInvincible(value: boolean) {
    this.isInvincible = value;
    if (!value) {
      this.invincibilityTimer = 0;
    }
  }

  /** Apply an upgrade selected from the level-up screen */
  applyUpgrade(upgradeId: UpgradeId) {
    const current = this.upgrades[upgradeId] ?? 0;
    this.upgrades[upgradeId] = current + 1;

    switch (upgradeId) {
      case 'atk_damage':
        this.attackDamage *= 1.2;
        break;
      case 'atk_speed':
        this.attackSpeed *= 1.15;
        break;
      case 'move_speed':
        this.speed *= 1.1;
        this.speed = Math.min(this.speed, this.baseSpeed * 2);
        break;
      case 'max_hp':
        this.maxHp = Math.floor(this.maxHp * 1.25);
        this.hp = Math.min(this.maxHp, this.hp + Math.floor(this.maxHp * 0.2));
        break;
      case 'defense':
        this.defense = Math.min(75, this.defense + 4); // +4 percentage points, capped at 75%
        break;
      case 'dodge_cd':
        this.dodgeCooldown *= 0.8;
        break;
      case 'piercing':
      case 'lifesteal':
      case 'knockback':
      case 'multishot':
      case 'chain_shot':
      case 'orbit_shield':
      case 'magnetic':
        // These are applied in WeaponSystem / XpOrb logic
        break;
      case 'adrenaline':
        // Flag-based: damage scales with missing HP (applied in WeaponSystem)
        break;
      case 'glass_cannon':
        // +50% damage, -30% max HP
        this.attackDamage *= 1.5;
        const hpLoss = Math.floor(this.maxHp * 0.3);
        this.maxHp -= hpLoss;
        this.hp = Math.min(this.hp, this.maxHp);
        break;
    }
  }

  /** Apply a weapon evolution after requirements are met */
  applyEvolution(evoId: EvolvedWeaponId) {
    if (this.evolvedWeapons.includes(evoId)) return;
    this.evolvedWeapons.push(evoId);

    switch (evoId) {
      case 'divine_blade':
        this.attackDamage *= 2;
        this.attackSpeed *= 1.5;
        break;
      case 'phantom_rush':
        this.dodgeCooldown = 300;
        break;
      case 'immortal_guard':
        this.hasAutoRevive = true;
        this.hpRegenRate = 5;
        break;
      case 'soul_reaper':
        this.deathExplosionDamage = 50;
        this.comboLifesteal = true;
        break;
      case 'storm_barrage':
        this.homingProjectileCount = 8;
        this.infinitePiercing = true;
        break;
    }
  }

  /** Get number of stacks for a specific upgrade */
  getUpgradeStacks(upgradeId: UpgradeId): number {
    return this.upgrades[upgradeId] ?? 0;
  }

  /** Get dodge cooldown progress (0=on cooldown, 1=ready) */
  get dodgeCooldownRatio(): number {
    return this.dodgeCooldownTimer <= 0 ? 1 : 1 - (this.dodgeCooldownTimer / this.dodgeCooldown);
  }

  /** Get nearest point in the scene - used by weapon system for targeting */
  getNearestEnemy(enemies: Phaser.GameObjects.Group): Phaser.GameObjects.GameObject | null {
    let nearest: Phaser.GameObjects.GameObject | null = null;
    let nearestDist = Infinity;

    enemies.getChildren().forEach((obj) => {
      const enemy = obj as Phaser.GameObjects.Sprite;
      if (!enemy.active) return;
      const dist = Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = enemy;
      }
    });

    return nearest;
  }
}
