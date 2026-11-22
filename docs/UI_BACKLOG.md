# HELL SHIFT — UI & Browser Testing Backlog

This backlog outlines the visual engineering, responsive layout, React component architecture, and browser testing roadmap owned by **Antigravity**.

---

## 1. UI Aesthetic & Design System

- **Industrial Sci-Fi Horror (1990s FPS)**:
  - Palette: Ink black (`#0b0706`), rusted iron (`#7a3b25`), dried blood (`#c8321e`), glowing ember (`#f0642a`), bone white (`#e8dcc8`), and toxic acid amber/yellow (`#b7c46a`).
  - Heavy mechanical panels, beveled edges, bolt rivets, and diagonal hazard striping.
  - Scanline CRT overlay with toggleable toggle and full `@media (prefers-reduced-motion: reduce)` compliance.
  - Authentic monospace / pixel-art typography and segmented LCD/CRT gauges.

---

## 2. Priority UI Backlog

### Phase 1: Core HUD & Status Overlay (Immediate)
- [ ] **Health & Armor Monitor**: Segmented health bar (0–100) with dynamic color transitions (bone -> ember -> blood), low-health flashing pulse, and numerical display.
- [ ] **Ammo & Magazine Gauge**: Prominent magazine counter (e.g., `12 / 12`), reserve pool display (`72`), and animated reloading progress indicator.
- [ ] **Wave & Threat Telemetry**: Current wave indicator (`WAVE 1 / 5`), active husks counter, and wave transition banners.
- [ ] **Daily Mission Clock**: Mission timer countdown (`03:00` to `00:00`) with high-stress pulsing when `< 00:30`.
- [ ] **Combat Feed & Hit Effects**:
  - Full-screen directional damage flash vignette (blood red on hit).
  - Crosshair with dynamic hitmarker flash (`X` shape on valid hits).
  - Tactical event log ticker (kill notifications, wave completions, pickup grabs).

### Phase 2: Flow Modals & Screens (Immediate)
- [ ] **Daily Briefing / Start Screen**:
  - Displays daily arena name (e.g. `THE FURNACE`), Day number, and reset countdown.
  - Tactical mission briefing, objective checklist, and control scheme legend.
  - "COMMENCE SHIFT" button to enter combat.
- [ ] **Game Over & Victory Screen**:
  - Outcome headline (`AREA PURGED` vs `SHIFT TERMINATED / FLATLINE`).
  - Stepped score rollup calculation:
    - Kills points (`kills * 100`)
    - Time remaining points (`seconds * 5`)
    - Accuracy bonus (scaled to 250 points)
    - Victory bonus (`1,000 points`)
    - Total canonical score
  - Personal best comparison and daily rank badge.
  - Action buttons: "RETRY SHIFT", "VIEW LEADERBOARD", "RETURN TO FEED".
- [ ] **Leaderboard Modal**:
  - Top daily survivors table (rank, username, score).
  - Current user highlight and rank status.
  - Refresh and back buttons.
- [ ] **In-Game Pause Menu**:
  - Resume, Restart, Controls reference, CRT toggle, Abandon run.

### Phase 3: Mobile Touch Interface (Immediate)
- [ ] **Virtual Movement Pad**: Left-side responsive virtual stick / D-pad for forward/backward and strafe.
- [ ] **Drag-to-Aim Zone**: Right-side touch drag area for smooth turning.
- [ ] **Tactile Action Buttons**: Chunky, high-contrast on-screen `FIRE` and `RELOAD` buttons with active press states.
- [ ] **Auto-Detection & Responsiveness**: Adapts seamlessly to touch vs mouse/keyboard inputs and screen orientations (portrait vs landscape).

### Phase 4: Browser Automation & Smoke Testing
- [ ] Devvit iframe responsiveness (Reddit mobile feed, desktop feed, expanded modal).
- [ ] Full navigation flow: Splash -> Expanded Game -> Briefing -> Play -> Pause -> Game Over -> Leaderboard.
- [ ] Interactive input handling: keyboard, mouse click, and touch event emulation.
- [ ] Verification of zero console errors, clean unmounts, and accessibility compliance.
