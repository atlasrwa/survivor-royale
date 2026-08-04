/**
 * Season Missions — daily and weekly objectives that grant Battle Pass XP.
 * Uses seeded randomness so all players get the same missions on the same day.
 */

export interface Mission {
  id: string;
  description: string;
  target: number;
  xpReward: number;
  type: 'daily' | 'weekly';
}

// ═══════════════════════════════════════════════════════════════════════
// Seeded PRNG (mulberry32)
// ═══════════════════════════════════════════════════════════════════════

function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function dateSeed(date: Date): number {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  return year * 10000 + month * 100 + day;
}

function weekSeed(date: Date): number {
  // Use Monday of the current week as seed basis
  const d = new Date(date);
  const dayOfWeek = d.getUTCDay();
  const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday = 0
  d.setUTCDate(d.getUTCDate() - diff);
  return dateSeed(d) + 7777; // offset to differentiate from daily
}

// ═══════════════════════════════════════════════════════════════════════
// Mission Templates
// ═══════════════════════════════════════════════════════════════════════

interface MissionTemplate {
  idPrefix: string;
  descriptionFn: (target: number) => string;
  targetRange: [number, number];
  xpRange: [number, number];
}

const DAILY_TEMPLATES: MissionTemplate[] = [
  {
    idPrefix: 'daily_kill',
    descriptionFn: (t) => `Kill ${t} enemies`,
    targetRange: [30, 100],
    xpRange: [50, 100],
  },
  {
    idPrefix: 'daily_wave',
    descriptionFn: (t) => `Reach wave ${t}`,
    targetRange: [5, 15],
    xpRange: [75, 150],
  },
  {
    idPrefix: 'daily_gold',
    descriptionFn: (t) => `Collect ${t} gold in a single run`,
    targetRange: [50, 200],
    xpRange: [50, 100],
  },
];

const WEEKLY_TEMPLATES: MissionTemplate[] = [
  {
    idPrefix: 'weekly_kill',
    descriptionFn: (t) => `Kill ${t} enemies total`,
    targetRange: [400, 600],
    xpRange: [300, 400],
  },
  {
    idPrefix: 'weekly_wave',
    descriptionFn: (t) => `Reach wave ${t}`,
    targetRange: [18, 25],
    xpRange: [400, 500],
  },
  {
    idPrefix: 'weekly_games',
    descriptionFn: (t) => `Play ${t} games`,
    targetRange: [8, 12],
    xpRange: [300, 400],
  },
];

// ═══════════════════════════════════════════════════════════════════════
// Mission Generation
// ═══════════════════════════════════════════════════════════════════════

function generateMissionFromTemplate(
  template: MissionTemplate,
  rng: () => number,
  type: 'daily' | 'weekly',
  index: number,
): Mission {
  const [minTarget, maxTarget] = template.targetRange;
  const [minXp, maxXp] = template.xpRange;

  // Round targets to nice numbers
  const rawTarget = minTarget + Math.floor(rng() * (maxTarget - minTarget));
  const target = Math.round(rawTarget / 5) * 5 || 5;

  const xpReward = minXp + Math.floor(rng() * (maxXp - minXp));
  const roundedXp = Math.round(xpReward / 25) * 25 || 25;

  return {
    id: `${template.idPrefix}_${index}`,
    description: template.descriptionFn(target),
    target,
    xpReward: roundedXp,
    type,
  };
}

/**
 * Generate today's 3 daily missions deterministically.
 * All players get the same missions on the same day (UTC).
 */
export function generateDailyMissions(date: Date = new Date()): Mission[] {
  const seed = dateSeed(date);
  const rng = mulberry32(seed + 42); // offset from daily challenge seed

  return DAILY_TEMPLATES.map((template, index) =>
    generateMissionFromTemplate(template, rng, 'daily', index),
  );
}

/**
 * Generate this week's 3 weekly missions deterministically.
 * Resets every Monday (UTC). All players get the same missions.
 */
export function generateWeeklyMissions(date: Date = new Date()): Mission[] {
  const seed = weekSeed(date);
  const rng = mulberry32(seed);

  return WEEKLY_TEMPLATES.map((template, index) =>
    generateMissionFromTemplate(template, rng, 'weekly', index),
  );
}

/**
 * Get the daily reset key (YYYY-MM-DD UTC) for tracking resets.
 */
export function getDailyResetKey(date: Date = new Date()): string {
  return date.toISOString().split('T')[0]!;
}

/**
 * Get the weekly reset key (Monday's date in YYYY-MM-DD UTC).
 */
export function getWeeklyResetKey(date: Date = new Date()): string {
  const d = new Date(date);
  const dayOfWeek = d.getUTCDay();
  const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  d.setUTCDate(d.getUTCDate() - diff);
  return d.toISOString().split('T')[0]!;
}
