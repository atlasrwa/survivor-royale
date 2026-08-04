/**
 * ShareMessages — viral message templates for social sharing.
 * Placeholders: {wave}, {score}, {kills}, {hero}, {combo}, {time}, {weapon}
 */

import type { RunStats } from '@/shared/types/entities';
import { getHeroDefinition } from '@/shared/constants/heroes';

const HASHTAGS = '#SurvivorRoyale #CryptoGaming #Web3Gaming';
const GAME_URL = 'https://survivor-royale.gg';

/**
 * Tweet templates with stat placeholders. Varied tone: competitive, funny, proud.
 */
const TWEET_TEMPLATES: string[] = [
  '🗡️ Wave {wave} | {kills} kills | {score} score\n\nJust had an INSANE {hero} run in Survivor Royale. Beat me if you can 👀\n\n{hashtags}',
  '💀 Died on Wave {wave} with a {combo}x combo... I was SO close.\n\nThink you can do better? {url}\n\n{hashtags}',
  '🔥 {kills} enemies destroyed as {hero} in {time}. New personal best!\n\nThis game is actually addicting. {url}\n\n{hashtags}',
  '⚔️ {score} score on Wave {wave}. {hero} is absolutely BROKEN right now.\n\nCome fight me: {url}\n\n{hashtags}',
  '🏆 Wave {wave} reached! {hero} with {combo}x combo streak.\n\nNobody on my timeline can beat this. Prove me wrong 👇\n\n{hashtags}',
  '💎 Just evolved my {weapon} and went full demon mode. {kills} kills, Wave {wave}.\n\n{url}\n\n{hashtags}',
  '😤 {time} survived, {kills} kills, and I STILL died. This game doesn\'t let up.\n\nPlay free: {url}\n\n{hashtags}',
  '🎯 {combo}x combo → {score} score → Wave {wave}\n\n{hero} gameplay hits different. Challenge my run:\n\n{url}\n{hashtags}',
  '👑 New record! Wave {wave} | {score} pts | {kills} kills\n\nSurvivor Royale is what Survivor.io wished it was.\n\n{url}\n{hashtags}',
  '🚀 Speedrun: Wave {wave} in {time} with {hero}. {kills} kills, {combo}x max combo.\n\nWho\'s next? {url}\n\n{hashtags}',
  '⚡ {hero} main here. {score} score, {kills} kills, Wave {wave}.\n\nThe skill ceiling in this game is insane.\n\n{url}\n{hashtags}',
  '🎮 Another day, another {hero} carry. Wave {wave}, {kills} enemies vaporized.\n\nFree to play, skill to win: {url}\n\n{hashtags}',
];

/**
 * Discord-formatted message with stats block.
 */
const DISCORD_TEMPLATE = `**⚔️ Survivor Royale — Run Summary**

\`\`\`
┌─────────────────────────────────┐
│  Hero:    {hero}                │
│  Wave:    {wave}                │
│  Score:   {score}               │
│  Kills:   {kills}              │
│  Combo:   {combo}x             │
│  Time:    {time}               │
└─────────────────────────────────┘
\`\`\`

🏆 **Challenge me** → {url}
{hashtags}`;

/**
 * Generic share text (clipboard, SMS, etc).
 */
const GENERIC_TEMPLATE = `🎮 Survivor Royale Run
━━━━━━━━━━━━━━━━━━━
Hero: {hero}
Wave: {wave}
Score: {score}
Kills: {kills}
Combo: {combo}x
Time: {time}
━━━━━━━━━━━━━━━━━━━
Think you can beat me? Play free:
{url}

{hashtags}`;

/**
 * Format a time in ms to M:SS.
 */
function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Get hero name from heroId.
 */
function getHeroName(heroId: string): string {
  return getHeroDefinition(heroId)?.name ?? 'Unknown';
}

/**
 * Fill template placeholders from RunStats.
 */
function fillTemplate(template: string, stats: RunStats): string {
  const heroName = getHeroName(stats.heroId);
  const weapon = stats.evolvedWeapons.length > 0
    ? stats.evolvedWeapons[0]!.replace(/_/g, ' ')
    : 'weapon';

  return template
    .replace(/\{wave\}/g, String(stats.wave))
    .replace(/\{score\}/g, stats.score.toLocaleString())
    .replace(/\{kills\}/g, String(stats.kills))
    .replace(/\{hero\}/g, heroName)
    .replace(/\{combo\}/g, String(stats.longestCombo))
    .replace(/\{time\}/g, formatTime(stats.timeSurvivedMs))
    .replace(/\{weapon\}/g, weapon)
    .replace(/\{url\}/g, GAME_URL)
    .replace(/\{hashtags\}/g, HASHTAGS);
}

/**
 * Get a random tweet message filled with stats.
 */
export function getRandomTweet(stats: RunStats): string {
  const index = Math.floor(Math.random() * TWEET_TEMPLATES.length);
  return fillTemplate(TWEET_TEMPLATES[index]!, stats);
}

/**
 * Get formatted Discord message filled with stats.
 */
export function getDiscordMessage(stats: RunStats): string {
  return fillTemplate(DISCORD_TEMPLATE, stats);
}

/**
 * Get generic share text filled with stats.
 */
export function getGenericShareText(stats: RunStats): string {
  return fillTemplate(GENERIC_TEMPLATE, stats);
}

export { HASHTAGS, GAME_URL };
