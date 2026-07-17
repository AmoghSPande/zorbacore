// Zorby vs The Slump — the streak-powered rivalry.
// Zorby's moves escalate and The Slump shrinks as the user's streak grows.
// Tone rule: never guilt. At streak 0 Zorby is getting up, not defeated.

export interface FightState {
  anim: string;
  /** 0–4 power tier */
  tier: number;
  line: string;
  /** streak needed for the next power-up (undefined at max tier) */
  nextAt?: number;
  /** streak where the current tier began (for the progress bar) */
  tierStart: number;
}

const TIERS = [
  { min: 0, anim: 'fight-0', line: 'The Slump towers today — but Zorby is already getting up. Log anything and he swings back.' },
  { min: 1, anim: 'fight-1', line: 'Zorby is on his feet, guard up. Keep the streak alive and he starts swinging.' },
  { min: 4, anim: 'fight-2', line: 'Jabs are landing — The Slump definitely felt that one.' },
  { min: 7, anim: 'fight-3', line: 'Zorby is kicking now. The Slump is shrinking fast.' },
  { min: 14, anim: 'fight-4', line: 'Full power. The Slump can barely peek over its own fists.' },
];

export function fightState(streak: number): FightState {
  let idx = 0;
  for (let i = 0; i < TIERS.length; i++) if (streak >= TIERS[i].min) idx = i;
  const tier = TIERS[idx];
  const next = TIERS[idx + 1];
  return {
    anim: tier.anim,
    tier: idx,
    line: tier.line,
    nextAt: next?.min,
    tierStart: tier.min,
  };
}
