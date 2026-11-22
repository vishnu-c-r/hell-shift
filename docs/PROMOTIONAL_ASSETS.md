# HELL SHIFT — In-App Catalog & Promotional Assets Guide

This document contains the exact marketing copy, taglines, visual specifications, video storyboard, and submission guidance required for the **In-App Catalog & Featuring** section on the [Reddit Developer Portal](https://developers.reddit.com) (`Developer Settings` → `In-app catalog`).

---

## 1. Title Taglines

Reddit's catalog placements display short taglines alongside your app name and icon in category feeds, search results, and compact discovery tiles.

| Variant | Tagline Text | Character Count | Best Surface |
| :--- | :--- | :---: | :--- |
| **Option A (Official / Primary)** | `One arena. One day. Survive the hell.` | **38 chars** | Main hero listing, app directory |
| **Option B (Gameplay & Retro Focus)** | `Classic 1993 3D FPS action directly in your Reddit feed.` | **57 chars** | Games catalog, category browsing |
| **Option C (Competitive & Social)** | `Daily 60 FPS retro survival FPS with Reddit leaderboards.` | **57 chars** | Community & competition feeds |
| **Option D (Compact / Mobile)** | `Daily retro 3D survival FPS.` | **29 chars** | Small mobile discovery tiles |

*Recommended Choice for Portal*: **`One arena. One day. Survive the hell.`**

---

## 2. Featuring Descriptions

The featuring description is displayed in prominent promotional hero banners and featured carousel placements across the Reddit Games catalog.

### Primary Featuring Description (178 words — Recommended)

```text
Step into the ultimate daily survival test. HELL SHIFT transforms any Reddit post into a blistering 60 FPS retro 3D first-person shooter inspired by 1993 classics—running instantly with zero downloads, zero external assets, and sub-400ms load times.

Every day at 00:00 UTC, a brand-new industrial maze is deterministically generated from the date. Everyone across Reddit plays the exact same arena, monster swarms, and supplies for 24 hours.

Wield an authentic centered double-barreled shotgun featuring realistic walking sway, heavy recoil kick, and corridor-strobing muzzle flash illumination. Watch your vital integrity degrade in real time through the retro Marine Status Face HUD widget. Open pneumatic blast doors to funnel demonic Husks into killzones, survive 5 escalating waves, and fight for the top spot on your subreddit's daily Devvit Redis leaderboard. When your shift ends, share your formatted ballistic scorecard directly into the thread comments with a single click.

One arena. One day. Survive the hell.
```

### Compact Featuring Description (68 words — For Sub-Banners / Sidebars)

```text
HELL SHIFT is a daily retro 3D survival FPS running natively inside your Reddit feed. Every 24 hours at 00:00 UTC, a new arena generates for the entire community. Blast through 5 escalating waves of demonic Husks with a centered double-barreled shotgun, dynamic muzzle lighting, and pneumatic blast doors. Climb your subreddit's daily leaderboard and share your scorecard to comments. Zero downloads. Instant play.
```

---

## 3. Visual Catalog Assets Summary

All required high-resolution assets have been generated, rendered, and verified directly inside the repository under [`assets/`](file:///c:/Users/vishn/Downloads/open%20code%20projects/reddit%20game%20dev/assets/):

| Asset Name | Target File | Resolution | Format | Purpose & Description |
| :--- | :--- | :---: | :---: | :--- |
| **Promotional Icon** *(App Icon)* | [`assets/icon.png`](file:///c:/Users/vishn/Downloads/open%20code%20projects/reddit%20game%20dev/assets/icon.png) | **1024 × 1024 px** (1:1) | PNG | Primary app brand icon. Beveled industrial steel armor plate with hazard chevrons, crossed shotgun barrels, cyber-skull emblem, and fiery ember core. Configured in `devvit.json`. |
| **Tile Image** | [`assets/tile.png`](file:///c:/Users/vishn/Downloads/open%20code%20projects/reddit%20game%20dev/assets/tile.png) | **800 × 600 px** (4:3) | PNG | Compact discovery tile used in category grids. Features 3D corridor depth, glowing blast door, centered shotgun, and bold title badge. |
| **Fallback Video** | [`assets/fallback_video.mp4`](file:///c:/Users/vishn/Downloads/open%20code%20projects/reddit%20game%20dev/assets/fallback_video.mp4) | **1280 × 720 px** (16:9, 30 FPS) | MP4 (H.264) | 10-second gameplay video featuring corridor navigation, blast door opening, double-barreled shotgun blast with fiery flash, animated DOOM Marine face reactions, wave clear telemetry, and closing title splash. |
| **Fallback Animated GIF** | [`assets/fallback.gif`](file:///c:/Users/vishn/Downloads/open%20code%20projects/reddit%20game%20dev/assets/fallback.gif) | **640 × 360 px** (16:9) | Animated GIF | Looping animated fallback asset for mobile clients where video autoplay is disabled. |
| **Fallback Asset (Static)** | [`assets/fallback.png`](file:///c:/Users/vishn/Downloads/open%20code%20projects/reddit%20game%20dev/assets/fallback.png) | **1920 × 1080 px** (16:9) | PNG | Full 1080p widescreen static fallback displayed when video is unsupported. Depicts live first-person gameplay, demonic Husks, blast doors, and retro DOOM Marine face HUD. |
| **Promotional Key Art** | [`assets/key_art.png`](file:///c:/Users/vishn/Downloads/open%20code%20projects/reddit%20game%20dev/assets/key_art.png) | **1024 × 1024 px** (1:1) | PNG / JPG | High-impact promotional concept illustration featuring the armored Marine holding the shotgun in an industrial corridor with demon eyes. |

---

## 4. Featuring Asset: Video Trailer (15–25 Seconds)

### Reddit Video Guidelines & Constraints
* **Aspect Ratio**: 16:9 Widescreen (1920 × 1080 recommended, minimum 1280 × 720).
* **Format**: MP4 (H.264 video, AAC stereo audio or silent loop).
* **Duration**: 15 to 25 seconds.
* **First Frame Rule**: Must have a meaningful, non-black opening frame with high visual contrast in case browser autoplay is disabled.
* **Epilepsy & Accessibility Rule**: No rapid red strobe or full-screen flashing effects.
* **Closing Screen**: Must conclude with a clear branded splash screen and call to action.

### Shot-by-Shot Video Storyboard & Script

| Timecode | Visual Scene | On-Screen Text / Overlay | Audio / SFX Design |
| :--- | :--- | :--- | :--- |
| **0:00 – 0:03** <br>*(Opening Frame)* | **The Reddit Feed Hook**: A user scrolling through the Reddit mobile feed. Stops on an interactive HELL SHIFT post card showing today's arena countdown (`THE FURNACE`). Taps `"Enter the arena"`. | `ONE ARENA. ONE DAY.` | Ambient industrial hum; UI click chirp. |
| **0:03 – 0:07** | **First-Person Immersion**: Camera plunges into expanded mode. The retro 2.5D DDA raycaster initializes. Player strafes down dark metallic corridors. Approaching a hazard-striped blast door, prompt appears: `[E] OPEN BLAST DOOR`. Door hisses open. | `RETRO 3D FPS IN YOUR REDDIT FEED` | Heavy pneumatic airlock hiss; echoing metallic footsteps. |
| **0:07 – 0:13** | **Combat & Shotgun Feel**: Demonic Husks charge down the hall with glowing red eyes. Player fires the centered double-barreled shotgun. Recoil kicks back, muzzle flash illuminates dark brick walls, and demon explodes. | `CENTERED DOUBLE-BARRELED SHOTGUN` | Sub-bass shotgun blast (220Hz $\to$ 35Hz drop); mechanical pump cock; demonic death roar. |
| **0:13 – 0:17** | **DOOM Status Face & Game Feel**: Close-up on the retro Status Bar HUD. The pixel-art Marine grimaces in agony upon taking a hit, then grins evil grin as buckshot takes down another Husk. Health drops to 75%. | `DYNAMIC MARINE STATUS FACE` | Vocal marine grunt on damage; shotgun firing cadence. |
| **0:17 – 0:21** | **Social Competition & Scoring**: Sector Cleared banner appears (`AREA PURGED`). Score: `4,850 PTS`. User taps `📋 SHARE RUN TO REDDIT` and shows the formatted scorecard pasted in the subreddit thread comments. Subreddit daily leaderboard displays Rank #1. | `SUBREDDIT LEADERBOARDS & RUN SHARING` | Upbeat retro victory synth chime; UI copy confirmation. |
| **0:21 – 0:25** <br>*(Closing Splash)* | **Title Splash Card**: Heavy octagonal steel logo with glowing cyber-skull. Bold block letters: `HELL SHIFT`. <br>Tagline: `One arena. One day. Survive the hell.` <br>Badge: `PLAY FREE ON REDDIT // ZERO DOWNLOADS`. | `HELL SHIFT`<br>`SURVIVE THE HELL`<br>`PLAY NOW ON REDDIT` | Deep industrial bass sting fade-out. |

---

## 5. Portal Upload Checklist

When completing your submission in the **Reddit Developer Portal**:

1. Log into [developers.reddit.com](https://developers.reddit.com).
2. Select your application (`hell-shift`).
3. In the left navigation, go to **Developer Settings** → **In-app catalog**.
4. **App Icon**: Upload [`assets/icon.png`](file:///c:/Users/vishn/Downloads/open%20code%20projects/reddit%20game%20dev/assets/icon.png) (1024×1024 px).
5. **Tile Image**: Upload [`assets/tile.png`](file:///c:/Users/vishn/Downloads/open%20code%20projects/reddit%20game%20dev/assets/tile.png) (800×600 px).
6. **Fallback Asset**: Upload [`assets/fallback.png`](file:///c:/Users/vishn/Downloads/open%20code%20projects/reddit%20game%20dev/assets/fallback.png) (1920×1080 px).
7. **Featuring Asset (Video)**: Upload your 16:9 MP4 trailer (or use [`assets/fallback.png`](file:///c:/Users/vishn/Downloads/open%20code%20projects/reddit%20game%20dev/assets/fallback.png) as the primary image if submitting without video initially).
8. **Tile Tagline**: Paste: `One arena. One day. Survive the hell.`
9. **Featuring Description**: Paste the **Primary Featuring Description** from Section 2 above.
10. Click **Save & Submit for Review**.
