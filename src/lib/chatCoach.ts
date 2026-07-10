import { db, getProfile } from '../db';
import { computeDayStatus } from './readiness';
import { computeRunStats, fmtPace, fmtTime, paceTargets } from './running';
import { weeklyVolumes } from './stats';
import { buildSession } from './coach';

/** Assemble a compact summary of the user's data for answers / LLM context. */
export async function buildContext(): Promise<string> {
  const [status, run, vols, profile, prs, metrics] = await Promise.all([
    computeDayStatus(),
    computeRunStats(),
    weeklyVolumes(4),
    getProfile(),
    db.prs.orderBy('date').reverse().limit(8).toArray(),
    db.bodyMetrics.orderBy('date').toArray(),
  ]);
  const wk = vols[vols.length - 1];
  const weights = metrics.filter((m) => m.weightKg != null);
  const waists = metrics.filter((m) => m.waistCm != null);
  const lines = [
    `Athlete: ${profile.name}, intermediate, desk job. Constraints: chondromalacia patella (right knee), chronic lower-back stiffness. 2-3 gym days/week + running. Goals: less visceral/body fat, 5K<30min then 10K<60min, stronger glutes, bigger biceps, eliminate back stiffness, hybrid athlete.`,
    `Equipment: rack, deadlift platform, barbells, dumbbells, benches, lat pulldown, seated row, leg extension, leg curl, chest fly, chest press, bicep curl machine, cable crossover, treadmills, spin bike, tractor tyre, mudgals.`,
    status.checkin
      ? `Today's check-in: sleep ${status.checkin.sleep}/10, energy ${status.checkin.energy}/10, soreness ${status.checkin.soreness}/10, knee ${status.checkin.knee}/10, back ${status.checkin.back}/10. Readiness ${status.readiness?.score}/100 (${status.readiness?.level}).`
      : 'No check-in today yet.',
    `7-day averages: knee ${status.kneeAvg7 ?? 'n/a'}/10 (${status.kneeTrend}), back ${status.backAvg7 ?? 'n/a'}/10 (${status.backTrend}). Streak ${status.streak} days.`,
    `Next planned session: ${status.nextSession.title}.`,
    `Running: 5K best ${run.pb5k ? fmtTime(run.pb5k.sec) : 'none yet'}, 10K best ${run.pb10k ? fmtTime(run.pb10k.sec) : 'none yet'}, VO2max est ${run.vo2max ?? 'n/a'}, this week ${Math.round(run.thisWeekKm * 10) / 10}km, current 5K capability ~${fmtTime(run.current5kEstimateSec)}.`,
    wk ? `This week: ${wk.workouts} workouts, ${wk.totalSets} sets (${wk.gluteSets} glute, ${wk.bicepSets} bicep).` : '',
    weights.length ? `Weight: ${weights[weights.length - 1].weightKg}kg (started ${weights[0].weightKg}kg).` : 'No weight logged.',
    waists.length ? `Waist: ${waists[waists.length - 1].waistCm}cm.` : '',
    prs.length ? `Recent PRs: ${prs.map((p) => `${p.exerciseId} ${p.detail}`).join('; ')}.` : '',
  ];
  return lines.filter(Boolean).join('\n');
}

/** Rule-based coach: pattern-match the question, answer from real data. */
export async function ruleAnswer(q: string): Promise<string> {
  const s = q.toLowerCase();
  const status = await computeDayStatus();

  // exercise technique questions
  if (/how (do|to|should) .*(perform|do|execute)|technique|form/.test(s) || /^how do i/.test(s)) {
    const exercises = await db.exercises.toArray();
    // rank by how many words of the exercise name appear in the question
    const found = exercises
      .map((e) => {
        const words = e.name.toLowerCase().split(/[^a-z]+/).filter((w) => w.length > 3);
        const hits = words.filter((w) => s.includes(w)).length;
        return { e, hits, frac: hits / Math.max(1, words.length) };
      })
      .filter((x) => x.hits > 0)
      .sort((a, b) => b.hits - a.hits || b.frac - a.frac)[0]?.e;
    if (found) {
      return [
        `**${found.name}** — key cues:`,
        ...found.cues.map((c) => `• ${c}`),
        found.mistakes.length ? `\nAvoid: ${found.mistakes[0]}` : '',
        found.kneeMod && (status.kneeAvg7 ?? 0) >= 4 ? `\nWith your knee lately: ${found.kneeMod}` : '',
        found.backMod && (status.backAvg7 ?? 0) >= 4 ? `\nWith your back lately: ${found.backMod}` : '',
        `\nOpen Library → ${found.name} for the animated demo.`,
      ].filter(Boolean).join('\n');
    }
  }

  // knee pain
  if (/knee/.test(s) && /(hurt|pain|sore|bad|discomfort|what should)/.test(s)) {
    return [
      `Sorry the knee is talking today. The playbook:`,
      `• **Skip today:** deep squats, leg extensions, split squats, sprints, downhill/fast running.`,
      `• **Green-light instead:** hip thrusts, glute bridges, RDLs, leg curls, seated upper-body work, spin bike (saddle slightly high, light gear), incline walking, tyre pushes.`,
      `• **Helps directly:** ankle rocks 2×10/side, short quad isometrics (leg extension held at the top, light), and glute work — strong glutes steer the kneecap.`,
      `• If you still want cardio: 30–40 min Zone 2 on the bike counts fully toward your 5K engine.`,
      `Rule of thumb: nothing that raises knee pain above ~3/10 during, or leaves it worse the next morning. If it stays ≥6/10 for several days, that's physio territory.`,
    ].join('\n');
  }

  // back stiffness — why / what to do
  if (/back/.test(s) && /(stiff|hurt|pain|sore|why|tight)/.test(s)) {
    const avg = status.backAvg7;
    return [
      `Your back has averaged ${avg ?? '—'}/10 this week (${status.backTrend === 'down' ? 'easing — the plan is working' : status.backTrend === 'up' ? 'rising — let\'s be smart for a few days' : 'steady'}).`,
      ``,
      `Why it gets stiff (usually several at once): long sitting shortens hip flexors and switches off glutes → your lower back does their job all day; a core that hasn't been trained to stiffen; a stiff upper back pushing bending into the lower back; and hinging with the spine instead of the hips.`,
      ``,
      `What actually fixes it over weeks:`,
      `• **McGill Big 3 3×/week** (curl-up, side plank, bird dog) — in your Day 1 plan.`,
      `• **Hip flexor stretch daily** — the desk antidote (Coach → Desk-break reset).`,
      `• **Glute strength** — hip thrusts and bridges take over from the back.`,
      `• **Morning back reset** routine when you wake stiff.`,
      `• Right now, 60 seconds of cat–cow + child's pose usually eases it.`,
      avg != null && avg >= 6 ? `\nAt ${avg}/10, keep hinges light this week — the app will swap exercises automatically at your pre-workout check-in.` : '',
    ].filter(Boolean).join('\n');
  }

  // what should I train today
  if (/(what|which).*(train|workout|do today|session)|today.*(train|workout)/.test(s)) {
    const r = status.readiness;
    return [
      r ? `Readiness ${r.score}/100 — ${r.label.toLowerCase()}.` : `Do the daily check-in on Home and I'll factor in sleep, soreness, knee and back.`,
      ``,
      `**Recommended: ${status.nextSession.title}**`,
      status.nextSession.why,
      ``,
      status.nextSession.kind === 'strength'
        ? `Tap Train and it builds the session — it'll adapt to your knee/back answers on the spot.`
        : status.nextSession.kind === 'run'
        ? `Head to the Run tab — you'll get pace targets after a 30-second check-in.`
        : `Open Coach and start a mobility session — recovery is training today.`,
    ].join('\n');
  }

  // 30-minute workout
  if (/30\s*(-|\s)?min|short (workout|session)|quick (workout|session)/.test(s)) {
    const sym = status.checkin
      ? { knee: status.checkin.knee, back: status.checkin.back, energy: status.checkin.energy }
      : { knee: 2, back: 3, energy: 7 };
    const plan = buildSession(status.nextSession.type ?? 'strength-core', sym);
    const picks = plan.blocks.filter((b) => b.section === 'strength').slice(0, 4);
    const exs = await db.exercises.toArray();
    const name = (id: string) => exs.find((e) => e.id === id)?.name ?? id;
    return [
      `30-minute version — superset pairs, rest ~60s:`,
      `• 5 min: glute bridges ×12, cat–cow ×8, ankle rocks`,
      ...picks.map((p, i) => `• ${name(p.exerciseId)} — ${Math.max(2, p.sets - 1)} × ${p.reps}${i % 2 === 1 ? ' (superset with the one above)' : ''}`),
      `• Finish: McGill curl-up + side plank, 2 rounds`,
      plan.adaptations.length ? `\nAdapted: ${plan.adaptations.join(' ')}` : '',
      `\nStart Train → it will track it set by set.`,
    ].filter(Boolean).join('\n');
  }

  // improve 5K
  if (/5k|10k|run.*(faster|improve|time)|improve.*run/.test(s)) {
    const run = await computeRunStats();
    const t = paceTargets(run.current5kEstimateSec);
    const gap = run.current5kEstimateSec - 1800;
    return [
      run.pb5k ? `Your 5K best is ${fmtTime(run.pb5k.sec)}; current capability ~${fmtTime(run.current5kEstimateSec)}.` : `No 5K on record yet — current capability estimate ~${fmtTime(run.current5kEstimateSec)}.`,
      gap > 0 ? `Gap to sub-30: about ${Math.round(gap / 60)} min. Very beatable with consistency.` : `You're already under 30 — now we chase the sub-60 10K.`,
      ``,
      `The recipe (in priority order):`,
      `• **Run more often, mostly easy.** 80% of minutes at Zone 2 (${fmtPace(t.zone2)}) — the engine grows here, and it burns the most fat.`,
      `• **One quality session/week:** 6–8 × 400m at ${fmtPace(t.interval)} (90s recovery) or 15–20 min tempo at ${fmtPace(t.tempo)}.`,
      `• **Cadence ~170–180, land under your hips** — free speed AND kinder to the kneecap.`,
      `• **Weekly km +10% max.** Your knee sets the ceiling.`,
      `• Strength already helps: hip thrusts and calf raises are running power in disguise.`,
      ``,
      `Log every run in the Run tab — pace targets update as you get fitter.`,
    ].join('\n');
  }

  // visceral fat / fat loss
  if (/visceral|fat loss|lose (fat|weight)|body ?fat|belly/.test(s)) {
    const metrics = await db.bodyMetrics.orderBy('date').toArray();
    const w = metrics.filter((m) => m.weightKg != null);
    const trend = w.length >= 2 ? w[w.length - 1].weightKg! - w[0].weightKg! : null;
    return [
      trend != null ? `Weight so far: ${w[0].weightKg} → ${w[w.length - 1].weightKg}kg (${trend <= 0 ? '' : '+'}${Math.round(trend * 10) / 10}kg).` : `Start logging weight (daily check-in) and waist (weekly) — waist is the visceral-fat needle.`,
      ``,
      `This week's visceral-fat plan:`,
      `• **Hit your 2–3 strength sessions** — muscle is the engine that burns it.`,
      `• **2–3 h of Zone 2** across runs/bike/incline walks — visceral fat responds to aerobic volume more than intensity.`,
      `• **Walk after meals** 10–15 min, especially dinner (your desk job is the enemy here).`,
      `• **Nutrition does the heavy lifting:** ~300–500 kcal deficit, protein at every meal (~1.6–2 g/kg), alcohol and liquid calories are visceral fat's best friends — cut them first.`,
      `• **Sleep 7–8 h** — short sleep measurably shifts fat storage visceral.`,
      ``,
      `Track waist weekly in Progress → the waist-to-height ratio is your honest scoreboard.`,
    ].join('\n');
  }

  // progress / how am I doing
  if (/progress|how am i|doing|stats|summary/.test(s)) {
    return (await buildContext()).replace(/^Athlete:.*\n/, '').replace(/^Equipment:.*\n/m, '');
  }

  // fallback
  return [
    `I coach from your actual data. Try:`,
    `• "What should I train today?"`,
    `• "My knee hurts — what should I do?"`,
    `• "Why is my lower back stiff?"`,
    `• "Give me a 30-minute workout"`,
    `• "How can I improve my 5K time?"`,
    `• "What should I do this week to reduce visceral fat?"`,
    `• "How do I perform a Romanian deadlift?"`,
    `\nTip: add your Anthropic API key in Settings to unlock free-form AI coaching on top of these.`,
  ].join('\n');
}

/** LLM answer via the Anthropic API (user-supplied key), with rule fallback. */
export async function llmAnswer(q: string, apiKey: string, history: { role: string; content: string }[]): Promise<string> {
  const context = await buildContext();
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-5',
      max_tokens: 700,
      system: `You are HybridCoach, a concise personal trainer + running coach + physio-minded advisor inside a training app. Ground every answer in the athlete data below. Respect the right-knee chondromalacia and lower-back constraints in every recommendation. Only recommend equipment from the list. Be encouraging, specific and brief (under 250 words). Data:\n\n${context}`,
      messages: [
        ...history.slice(-6).map((m) => ({ role: m.role === 'coach' ? 'assistant' : 'user', content: m.content })),
        { role: 'user', content: q },
      ],
    }),
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  const data = await res.json();
  return data.content?.[0]?.text ?? 'No response.';
}
