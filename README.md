# HELL SHIFT — Daily Retro Survival FPS

> **One arena. One day. Survive the hell.**

HELL SHIFT brings the visceral, heart-pounding adrenaline of classic 1993 3D raycaster shooters directly into your subreddit feed—with zero downloads, zero external assets, and instant sub-400ms load times.

Every day at 00:00 UTC, a brand-new industrial maze is procedurally generated from the date. Everyone across Reddit plays the exact same arena, enemy waves, and supplies for 24 hours. Compete with your subreddit members, survive 5 escalating waves of demonic Husks, climb the daily leaderboard, and share your run scorecard directly into the post comments!

---

## Key Features

* **3D FPS Inside the Reddit Feed**: Silky 60 FPS 2.5D DDA raycasting running natively inside an interactive Devvit post.
* **Centered DOOM Shotgun**: Authentic double-barreled shotgun with walking sway bobbing, punchy recoil kick, and dynamic corridor muzzle flash lighting.
* **Interactive Pneumatic Blast Doors**: Heavy steel blast doors placed at corridor bottlenecks. Press `[E]` (or tap on mobile) to open doors, seal corridors, and funnel incoming demon swarms.
* **Iconic Marine Status Face**: Dynamic pixel-art HUD widget that grimaces in agony when wounded, flashes an evil grin while firing, and tracks 5 visual health degradation stages.
* **Subreddit-Native Leaderboards**: Daily rankings persist in Devvit Redis, keeping only each user's single best score per UTC day.
* **One-Click Run Sharing**: Click `📋 SHARE RUN TO REDDIT` on the game-over screen to generate a formatted Markdown scorecard ready to paste into thread comments.
* **100% Procedural Audio & Assets**: Visceral shotgun blasts, sub-bass drops, demon roars, and airlock hisses generated in code via the Web Audio API—zero external CDNs or copyrighted assets.
* **Universal Mobile & Desktop Support**: Full desktop mouse aim with Pointer Lock and a floating analog virtual joystick for the Reddit mobile app.

---

## How to Play

1. **Enter the Arena**: In the inline Reddit post card, review today's arena name and reset countdown, then click **Enter the arena** to expand to full screen.
2. **Review the Briefing**: Check the sector map and telemetry, then deploy into the maze.
3. **Survive 5 Waves**: You have 180 seconds to survive 46 melee-charging Husks across 5 escalating waves.
4. **Scavenge & Manage Resources**: Pick up health packs (+25 HP) and buckshot ammo (+24 rounds) placed throughout the maze.
5. **Use Blast Doors Strategically**: Approach blast doors and press `[E]` to open them. Doors auto-cycle closed after 4.5 seconds to help you trap swarms or escape danger.

### Player Controls

| Action | Desktop (Mouse & Keyboard) | Mobile (Touch Controls) |
| :--- | :--- | :--- |
| **Move** | `[W] [A] [S] [D]` or Arrow Keys | Left floating analog joystick |
| **Look / Turn** | Mouse (click to lock cursor) or `[←] [→]` | Swipe anywhere on right screen |
| **Fire Shotgun** | Left Mouse Click or `[Space]` | `[FIRE]` touch button |
| **Reload** | `[R]` | `[RELOAD]` touch button |
| **Open Doors** | `[E]` or `[F]` | `[DOOR]` touch button (near doors) |
| **Pause** | `[Esc]` | `[PAUSE]` touch button |

---

## Scoring System

Your final survival score is calculated from deterministic run telemetry:

* **Demonic Kills**: +100 PTS per Husk eliminated (up to 4,600 PTS).
* **Time Remaining**: +5 PTS for every second remaining on the clock.
* **Ballistic Accuracy**: Up to +250 PTS scaled to hit ratio.
* **Full Sector Purge**: +1,000 PTS victory bonus for clearing all 5 waves.

---

## Instructions for Moderators

### Automatic Post on Install
When you install HELL SHIFT onto your subreddit, the app automatically publishes today's interactive arena post to your community.

### Creating New Daily Posts Manually
Community moderators can publish a fresh arena post at any time:
1. Navigate to your subreddit's main feed.
2. Click the subreddit menu (`...` or Mod Tools).
3. Select **"Create a HELL SHIFT arena post"**.
4. The interactive daily survival challenge is instantly published and ready for your community to play and discuss.

---

## Community & Feedback

* **Dedicated Subreddit**: [r/hell_shift](https://reddit.com/r/hell_shift)
* **Devvit Community**: [r/Devvit](https://reddit.com/r/Devvit) (Feedback Friday)
* **Reddit Games Showcase**: [r/GamesOnReddit](https://reddit.com/r/GamesOnReddit)

---

## Changelog

### v0.0.6 — Mobile Controls Overhaul
* **Touch controls**: Floating analog joystick replaces the D-pad; joystick and swipe-to-aim now track fingers independently for true multi-touch.
* **Orientation**: Automatic landscape lock with a "Rotate to Landscape" fallback prompt that freezes the run on phones.
* **HUD**: Compact status consoles that never cover the play view on small screens.

### Version 1.0.0 (Launch Release)
* **Engine**: Custom 2.5D DDA raycaster with texture mapping, sprite billboard sorting, and 60 FPS animation loop.
* **Combat**: Centered double-barreled shotgun, dynamic muzzle illumination, walking sway bobbing, and screen shake.
* **Environment**: Procedural daily BSP maze generation, wall texture variations, and interactive pneumatic blast doors.
* **Audio**: 100% procedural synthesized Web Audio effects for shotgun blasts, door hydraulics, damage grunts, and demon roars.
* **UI & HUD**: Living retro Marine status face widget with 5 health stages, telemetry breakdown, and pause menu.
* **Platform**: Reddit Devvit Web 0.15 integration, Redis leaderboards, touch controls, and clipboard scorecard sharing.
