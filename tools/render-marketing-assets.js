import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ASSETS_DIR = path.resolve(__dirname, '../assets');

if (!fs.existsSync(ASSETS_DIR)) {
  fs.mkdirSync(ASSETS_DIR, { recursive: true });
}

// 1. GENERATE ICON SVG (1024x1024)
export const generateIconSvg = () => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <defs>
    <!-- Background Gradients -->
    <radialGradient id="bgGlow" cx="50%" cy="45%" r="65%">
      <stop offset="0%" stop-color="#4a150a"/>
      <stop offset="45%" stop-color="#200a06"/>
      <stop offset="85%" stop-color="#0a0504"/>
      <stop offset="100%" stop-color="#050202"/>
    </radialGradient>

    <radialGradient id="coreFire" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffcc44" stop-opacity="0.9"/>
      <stop offset="35%" stop-color="#ff5511" stop-opacity="0.7"/>
      <stop offset="70%" stop-color="#b01100" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>

    <!-- Metallic Steel Gradients -->
    <linearGradient id="metalBevel" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#8e96a0"/>
      <stop offset="25%" stop-color="#4d535b"/>
      <stop offset="50%" stop-color="#24282d"/>
      <stop offset="75%" stop-color="#555c66"/>
      <stop offset="100%" stop-color="#181a1d"/>
    </linearGradient>

    <linearGradient id="goldBevel" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffe699"/>
      <stop offset="40%" stop-color="#f59e0b"/>
      <stop offset="80%" stop-color="#b45309"/>
      <stop offset="100%" stop-color="#542202"/>
    </linearGradient>

    <linearGradient id="bloodRed" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ff4422"/>
      <stop offset="50%" stop-color="#cc1a06"/>
      <stop offset="100%" stop-color="#660a02"/>
    </linearGradient>

    <!-- Hazard Stripe Pattern -->
    <pattern id="hazardPattern" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width="20" height="40" fill="#f0642a"/>
      <rect x="20" width="20" height="40" fill="#18100c"/>
    </pattern>

    <!-- Drop Shadows -->
    <filter id="heavyShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="16" stdDeviation="16" flood-color="#000000" flood-opacity="0.95"/>
    </filter>
    <filter id="glowGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="12" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- Deep Dark Texture Background -->
  <rect width="1024" height="1024" fill="url(#bgGlow)"/>

  <!-- Subtle Industrial Grid Lines -->
  <g stroke="#ffffff" stroke-opacity="0.04" stroke-width="2">
    <line x1="128" y1="0" x2="128" y2="1024"/>
    <line x1="256" y1="0" x2="256" y2="1024"/>
    <line x1="384" y1="0" x2="384" y2="1024"/>
    <line x1="512" y1="0" x2="512" y2="1024"/>
    <line x1="640" y1="0" x2="640" y2="1024"/>
    <line x1="768" y1="0" x2="768" y2="1024"/>
    <line x1="896" y1="0" x2="896" y2="1024"/>
    <line x1="0" y1="128" x2="1024" y2="128"/>
    <line x1="0" y1="256" x2="1024" y2="256"/>
    <line x1="0" y1="384" x2="1024" y2="384"/>
    <line x1="0" y1="512" x2="1024" y2="512"/>
    <line x1="0" y1="640" x2="1024" y2="640"/>
    <line x1="0" y1="768" x2="1024" y2="768"/>
    <line x1="0" y1="896" x2="1024" y2="896"/>
  </g>

  <!-- Heavy Outer Octagonal Steel Armor Frame -->
  <g filter="url(#heavyShadow)">
    <polygon points="192,48 832,48 976,192 976,832 832,976 192,976 48,832 48,192" 
             fill="url(#metalBevel)" stroke="#1a1c20" stroke-width="8"/>
    <polygon points="204,68 820,68 956,204 956,820 820,956 204,956 68,820 68,204" 
             fill="#110d0b" stroke="#f0642a" stroke-width="4"/>
  </g>

  <!-- Hazard Stripe Border Trim -->
  <polygon points="214,84 810,84 940,214 940,234 810,104 214,104 84,234 84,214" fill="url(#hazardPattern)"/>
  <polygon points="214,940 810,940 940,810 940,790 810,920 214,920 84,790 84,810" fill="url(#hazardPattern)"/>

  <!-- Steel Rivets on Corner Facets -->
  <g fill="#7c8490" stroke="#1d2024" stroke-width="3">
    <circle cx="200" cy="80" r="12"/><circle cx="824" cy="80" r="12"/>
    <circle cx="944" cy="200" r="12"/><circle cx="944" cy="824" r="12"/>
    <circle cx="824" cy="944" r="12"/><circle cx="200" cy="944" r="12"/>
    <circle cx="80" cy="824" r="12"/><circle cx="80" cy="200" r="12"/>
  </g>

  <!-- Fiery Inner Core Glow -->
  <circle cx="512" cy="460" r="380" fill="url(#coreFire)"/>

  <!-- Crossed Shotgun Shells / Barrels Behind Skull -->
  <g filter="url(#heavyShadow)">
    <!-- Diagonal Left Barrel -->
    <rect x="480" y="80" width="64" height="760" rx="12" fill="#2a3038" stroke="#5b6472" stroke-width="6" 
          transform="rotate(-45 512 460)"/>
    <rect x="496" y="80" width="32" height="120" rx="6" fill="#f0642a" 
          transform="rotate(-45 512 460)"/>
    <!-- Diagonal Right Barrel -->
    <rect x="480" y="80" width="64" height="760" rx="12" fill="#2a3038" stroke="#5b6472" stroke-width="6" 
          transform="rotate(45 512 460)"/>
    <rect x="496" y="80" width="32" height="120" rx="6" fill="#f0642a" 
          transform="rotate(45 512 460)"/>
  </g>

  <!-- Central Demonic Cyber-Skull Emblem (DOOM Aesthetic) -->
  <g filter="url(#heavyShadow)">
    <!-- Skull Cranium -->
    <path d="M 332,320 
             C 332,190 410,140 512,140 
             C 614,140 692,190 692,320 
             C 692,380 670,420 644,450 
             L 644,520 L 590,560 L 590,620 L 434,620 L 434,560 L 380,520 L 380,450 
             C 354,420 332,380 332,320 Z" 
          fill="#1c1411" stroke="#8d2616" stroke-width="12"/>

    <!-- Cranium Armor Plates -->
    <path d="M 380,240 L 470,220 L 512,250 L 554,220 L 644,240 L 610,340 L 512,320 L 414,340 Z" 
          fill="#351a14" stroke="#d4421b" stroke-width="5"/>

    <!-- Piercing Fiery Eye Sockets -->
    <polygon points="390,380 470,410 450,450 380,420" fill="#000000" stroke="#f0642a" stroke-width="6"/>
    <polygon points="634,380 554,410 574,450 644,420" fill="#000000" stroke="#f0642a" stroke-width="6"/>

    <!-- Glowing Eye Pupils (Ember Red) -->
    <circle cx="435" cy="425" r="14" fill="#ffff44" filter="url(#glowGlow)"/>
    <circle cx="589" cy="425" r="14" fill="#ffff44" filter="url(#glowGlow)"/>
    <circle cx="435" cy="425" r="6" fill="#ffffff"/>
    <circle cx="589" cy="425" r="6" fill="#ffffff"/>

    <!-- Triangular Nasal Cavity -->
    <polygon points="512,460 488,510 536,510" fill="#000000" stroke="#551a11" stroke-width="4"/>

    <!-- Cybernetic Jaw & Gritted Teeth -->
    <rect x="444" y="550" width="136" height="50" rx="4" fill="#0c0705" stroke="#f0642a" stroke-width="4"/>
    <line x1="466" y1="550" x2="466" y2="600" stroke="#7a2a1b" stroke-width="6"/>
    <line x1="490" y1="550" x2="490" y2="600" stroke="#7a2a1b" stroke-width="6"/>
    <line x1="512" y1="550" x2="512" y2="600" stroke="#d4421b" stroke-width="6"/>
    <line x1="534" y1="550" x2="534" y2="600" stroke="#7a2a1b" stroke-width="6"/>
    <line x1="558" y1="550" x2="558" y2="600" stroke="#7a2a1b" stroke-width="6"/>
  </g>

  <!-- Heavy Beveled Title Banner Plaque -->
  <g filter="url(#heavyShadow)">
    <polygon points="120,680 904,680 934,840 90,840" 
             fill="#140b08" stroke="#e05615" stroke-width="7"/>
    <polygon points="135,696 889,696 915,824 109,824" 
             fill="#22110c" stroke="#481810" stroke-width="3"/>
  </g>

  <!-- HELL SHIFT Title Text (Retro DOOM 3D Block Lettering) -->
  <g filter="url(#heavyShadow)" text-anchor="middle" font-family="'Impact', 'Arial Black', sans-serif">
    <!-- Deep Blood Shadow Extrusion -->
    <text x="512" y="796" font-size="112" font-weight="900" letter-spacing="4" fill="#580e04">HELL SHIFT</text>
    <text x="512" y="790" font-size="112" font-weight="900" letter-spacing="4" fill="#a41d0c">HELL SHIFT</text>
    <text x="512" y="784" font-size="112" font-weight="900" letter-spacing="4" fill="#f0541e">HELL SHIFT</text>
    <!-- Top Face Bright Bone / Gold Gradient -->
    <text x="512" y="778" font-size="112" font-weight="900" letter-spacing="4" fill="#fff5ea">HELL SHIFT</text>
  </g>

  <!-- Bottom Sub-Badge: "DAILY SURVIVAL FPS" -->
  <g filter="url(#heavyShadow)">
    <rect x="272" y="864" width="480" height="48" rx="6" fill="#0b0705" stroke="#f0642a" stroke-width="3"/>
    <text x="512" y="897" font-family="'Courier New', monospace" font-size="24" font-weight="900" 
          letter-spacing="6" fill="#ffb49f" text-anchor="middle">
      // DAILY SURVIVAL FPS //
    </text>
  </g>
</svg>`;

// 2. GENERATE TILE IMAGE SVG (800x600, 4:3)
export const generateTileSvg = () => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <defs>
    <radialGradient id="tileGlow" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#481409"/>
      <stop offset="50%" stop-color="#1e0a06"/>
      <stop offset="100%" stop-color="#0a0504"/>
    </radialGradient>
    <linearGradient id="corridorFloor" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#140c09"/>
      <stop offset="100%" stop-color="#341b12"/>
    </linearGradient>
    <pattern id="tileHazard" width="30" height="30" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width="15" height="30" fill="#f0642a"/>
      <rect x="15" width="15" height="30" fill="#18100c"/>
    </pattern>
    <filter id="tileShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="10" stdDeviation="10" flood-color="#000000" flood-opacity="0.9"/>
    </filter>
  </defs>

  <!-- Background Demonic Corridor -->
  <rect width="800" height="600" fill="url(#tileGlow)"/>

  <!-- Perspective 3D Corridor Walls -->
  <!-- Left Wall -->
  <polygon points="0,0 240,160 240,440 0,600" fill="#1c110c" stroke="#4a2517" stroke-width="4"/>
  <line x1="80" y1="53" x2="80" y2="547" stroke="#361b11" stroke-width="3"/>
  <line x1="160" y1="106" x2="160" y2="494" stroke="#361b11" stroke-width="3"/>

  <!-- Right Wall -->
  <polygon points="800,0 560,160 560,440 800,600" fill="#1c110c" stroke="#4a2517" stroke-width="4"/>
  <line x1="720" y1="53" x2="720" y2="547" stroke="#361b11" stroke-width="3"/>
  <line x1="640" y1="106" x2="640" y2="494" stroke="#361b11" stroke-width="3"/>

  <!-- Ceiling & Floor -->
  <polygon points="0,0 800,0 560,160 240,160" fill="#0d0806"/>
  <polygon points="0,600 800,600 560,440 240,440" fill="url(#corridorFloor)"/>

  <!-- Blast Door at the End of Corridor -->
  <g filter="url(#tileShadow)">
    <rect x="240" y="160" width="320" height="280" fill="#231713" stroke="#f0642a" stroke-width="5"/>
    <!-- Door Caution Stripes -->
    <rect x="240" y="160" width="320" height="30" fill="url(#tileHazard)"/>
    <rect x="240" y="410" width="320" height="30" fill="url(#tileHazard)"/>
    <!-- Door Center Seam & Hydraulic Beacon -->
    <line x1="400" y1="190" x2="400" y2="410" stroke="#f0642a" stroke-width="4"/>
    <circle cx="400" cy="300" r="28" fill="#e05615" stroke="#ffd152" stroke-width="4"/>
    <circle cx="400" cy="300" r="12" fill="#fff5ea"/>
  </g>

  <!-- Glowing Red Demonic Eyes in Corridor -->
  <g fill="#ff2200" filter="url(#tileShadow)">
    <ellipse cx="320" cy="320" rx="6" ry="3"/><ellipse cx="340" cy="320" rx="6" ry="3"/>
    <ellipse cx="460" cy="310" rx="7" ry="4"/><ellipse cx="482" cy="310" rx="7" ry="4"/>
  </g>

  <!-- Centered Double-Barreled Shotgun Emerging at Bottom -->
  <g filter="url(#tileShadow)">
    <!-- Mahogany Grip Stock -->
    <polygon points="340,600 460,600 440,510 360,510" fill="#3a1a0e" stroke="#1d0a04" stroke-width="4"/>
    <!-- Receiver Base Plate -->
    <rect x="364" y="470" width="72" height="44" rx="4" fill="#383e46" stroke="#1c2024" stroke-width="4"/>
    <!-- Left Steel Barrel -->
    <rect x="362" y="380" width="36" height="92" rx="4" fill="#4d5560" stroke="#1c2024" stroke-width="3"/>
    <ellipse cx="380" cy="380" rx="15" ry="8" fill="#111316" stroke="#717a86" stroke-width="3"/>
    <ellipse cx="380" cy="380" rx="9" ry="5" fill="#040506"/>
    <!-- Right Steel Barrel -->
    <rect x="402" y="380" width="36" height="92" rx="4" fill="#4d5560" stroke="#1c2024" stroke-width="3"/>
    <ellipse cx="420" cy="380" rx="15" ry="8" fill="#111316" stroke="#717a86" stroke-width="3"/>
    <ellipse cx="420" cy="380" rx="9" ry="5" fill="#040506"/>
    <!-- Brass Center Sight Bead -->
    <circle cx="400" cy="378" r="5" fill="#ffd152" stroke="#b45309" stroke-width="2"/>
  </g>

  <!-- Top Title Overlay Card -->
  <g filter="url(#tileShadow)">
    <rect x="80" y="32" width="640" height="110" rx="8" fill="#120a07" stroke="#e05615" stroke-width="4"/>
    <text x="400" y="105" font-family="'Impact', 'Arial Black', sans-serif" font-size="72" font-weight="900" 
          letter-spacing="4" fill="#f0541e" text-anchor="middle">HELL SHIFT</text>
    <text x="400" y="100" font-family="'Impact', 'Arial Black', sans-serif" font-size="72" font-weight="900" 
          letter-spacing="4" fill="#fff5ea" text-anchor="middle">HELL SHIFT</text>
  </g>

  <!-- Bottom Badges Bar -->
  <g filter="url(#tileShadow)">
    <rect x="140" y="528" width="520" height="42" rx="6" fill="#0c0705" stroke="#f0642a" stroke-width="3"/>
    <text x="400" y="556" font-family="'Courier New', monospace" font-size="18" font-weight="900" 
          letter-spacing="4" fill="#ffb49f" text-anchor="middle">
      1 DAILY ARENA • 60 FPS IN-FEED 3D FPS
    </text>
  </g>
</svg>`;

// 3. GENERATE FALLBACK ASSET SVG (1920x1080, 16:9)
export const generateFallbackSvg = () => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080">
  <defs>
    <radialGradient id="fbBg" cx="50%" cy="40%" r="70%">
      <stop offset="0%" stop-color="#4f1509"/>
      <stop offset="45%" stop-color="#230a05"/>
      <stop offset="85%" stop-color="#0c0503"/>
      <stop offset="100%" stop-color="#050202"/>
    </radialGradient>
    <linearGradient id="wallGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#2a160f"/>
      <stop offset="50%" stop-color="#412418"/>
      <stop offset="100%" stop-color="#1a0c07"/>
    </linearGradient>
    <pattern id="fbHazard" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width="20" height="40" fill="#f0642a"/>
      <rect x="20" width="20" height="40" fill="#140b07"/>
    </pattern>
    <filter id="fbShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="12" stdDeviation="14" flood-color="#000000" flood-opacity="0.95"/>
    </filter>
    <filter id="muzzleFlashGlow">
      <feGaussianBlur stdDeviation="35" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- Dark Atmospheric 3D Maze Viewport -->
  <rect width="1920" height="1080" fill="url(#fbBg)"/>

  <!-- Left Arena Colonnade & Brick Walls -->
  <polygon points="0,0 600,280 600,720 0,1080" fill="url(#wallGradient)" stroke="#5d2a1b" stroke-width="6"/>
  <!-- Left Wall Brick Grid Lines -->
  <g stroke="#1a0b06" stroke-width="4">
    <line x1="150" y1="70" x2="150" y2="990"/>
    <line x1="300" y1="140" x2="300" y2="900"/>
    <line x1="450" y1="210" x2="450" y2="810"/>
  </g>

  <!-- Right Arena Colonnade & Brick Walls -->
  <polygon points="1920,0 1320,280 1320,720 1920,1080" fill="url(#wallGradient)" stroke="#5d2a1b" stroke-width="6"/>
  <g stroke="#1a0b06" stroke-width="4">
    <line x1="1770" y1="70" x2="1770" y2="990"/>
    <line x1="1620" y1="140" x2="1620" y2="900"/>
    <line x1="1470" y1="210" x2="1470" y2="810"/>
  </g>

  <!-- Ceiling & Blood-stained Slag Floor -->
  <polygon points="0,0 1920,0 1320,280 600,280" fill="#0f0705"/>
  <polygon points="0,1080 1920,1080 1320,720 600,720" fill="#1e100b"/>

  <!-- Blast Door Chamber in the Distance -->
  <g filter="url(#fbShadow)">
    <rect x="600" y="280" width="720" height="440" fill="#221612" stroke="#f0642a" stroke-width="8"/>
    <!-- Hazard Stripes on Bulkhead -->
    <rect x="600" y="280" width="720" height="48" fill="url(#fbHazard)"/>
    <rect x="600" y="672" width="720" height="48" fill="url(#fbHazard)"/>
    <!-- Center Blast Door Slit & Hydraulic Lock -->
    <line x1="960" y1="328" x2="960" y2="672" stroke="#f0642a" stroke-width="6"/>
    <circle cx="960" cy="500" r="48" fill="#e05615" stroke="#ffd152" stroke-width="6"/>
    <circle cx="960" cy="500" r="20" fill="#fff5ea"/>
  </g>

  <!-- Lurking Husk Demons (Demonic Silhouettes with Glowing Eyes) -->
  <!-- Left Husk -->
  <g filter="url(#fbShadow)">
    <circle cx="760" cy="540" r="38" fill="#140805" stroke="#8d2616" stroke-width="4"/>
    <ellipse cx="760" cy="620" rx="46" ry="60" fill="#140805"/>
    <circle cx="748" cy="535" r="7" fill="#ff2200"/>
    <circle cx="772" cy="535" r="7" fill="#ff2200"/>
  </g>
  <!-- Right Husk -->
  <g filter="url(#fbShadow)">
    <circle cx="1160" cy="520" r="44" fill="#140805" stroke="#8d2616" stroke-width="4"/>
    <ellipse cx="1160" cy="610" rx="52" ry="70" fill="#140805"/>
    <circle cx="1146" cy="515" r="8" fill="#ff2200"/>
    <circle cx="1174" cy="515" r="8" fill="#ff2200"/>
  </g>

  <!-- Centered Double-Barreled Shotgun with Dynamic Muzzle Smoke -->
  <g filter="url(#fbShadow)">
    <!-- Stock & Hands -->
    <polygon points="840,1080 1080,1080 1030,880 890,880" fill="#3e1b0c" stroke="#1d0a04" stroke-width="6"/>
    <!-- Receiver Housing -->
    <rect x="890" y="810" width="140" height="80" rx="8" fill="#363c44" stroke="#1b1e22" stroke-width="6"/>
    <!-- Left Barrel -->
    <rect x="888" y="660" width="68" height="160" rx="6" fill="#4d5562" stroke="#1e2227" stroke-width="5"/>
    <ellipse cx="922" cy="660" rx="28" ry="14" fill="#111316" stroke="#7b8492" stroke-width="5"/>
    <ellipse cx="922" cy="660" rx="16" ry="8" fill="#040506"/>
    <!-- Right Barrel -->
    <rect x="964" y="660" width="68" height="160" rx="6" fill="#4d5562" stroke="#1e2227" stroke-width="5"/>
    <ellipse cx="998" cy="660" rx="28" ry="14" fill="#111316" stroke="#7b8492" stroke-width="5"/>
    <ellipse cx="998" cy="660" rx="16" ry="8" fill="#040506"/>
    <!-- Brass Center Sight Bead -->
    <circle cx="960" cy="656" r="8" fill="#ffd152" stroke="#b45309" stroke-width="3"/>
  </g>

  <!-- Muzzle Flash Crown (Dynamic Fire Halo) -->
  <circle cx="960" cy="630" r="120" fill="#ff9922" opacity="0.35" filter="url(#muzzleFlashGlow)"/>
  <circle cx="960" cy="640" r="60" fill="#ffee66" opacity="0.5" filter="url(#muzzleFlashGlow)"/>

  <!-- TOP TRANSMISSION HUD BAR -->
  <g filter="url(#fbShadow)">
    <rect x="40" y="32" width="1840" height="76" rx="8" fill="#100a08" stroke="#482218" stroke-width="3"/>
    <text x="70" y="78" font-family="'Courier New', monospace" font-size="28" font-weight="900" 
          letter-spacing="4" fill="#f0642a">// DAILY SECTOR: THE FURNACE //</text>
    <text x="1400" y="78" font-family="'Courier New', monospace" font-size="26" font-weight="700" 
          letter-spacing="3" fill="#ffb49f">UTC RESET IN: 14H 22M 09S</text>
  </g>

  <!-- BOTTOM RETRO DOOM STATUS BAR HUD -->
  <g filter="url(#fbShadow)">
    <rect x="40" y="930" width="1840" height="118" rx="8" fill="#0d0806" stroke="#5a271a" stroke-width="4"/>
    <rect x="48" y="938" width="1824" height="102" fill="#18100c" stroke="#2c140d" stroke-width="2"/>

    <!-- 1. VITAL INTEGRITY CONSOLE -->
    <g transform="translate(80, 946)">
      <text x="0" y="24" font-family="'Courier New', monospace" font-size="16" font-weight="900" 
            letter-spacing="2" fill="#8d7462">VITALITY</text>
      <text x="0" y="78" font-family="'Courier New', monospace" font-size="56" font-weight="900" fill="#ff4422">100%</text>
    </g>

    <!-- 2. DOOM MARINE FACE WIDGET IN STATUS BAR -->
    <g transform="translate(360, 946)">
      <!-- Face Console Frame -->
      <rect x="0" y="0" width="100" height="86" rx="4" fill="#100b08" stroke="#f0642a" stroke-width="3"/>
      <!-- Marine Head (Buzz Cut & Jaw) -->
      <polygon points="26,16 74,16 80,48 68,76 32,76 20,48" fill="#c49a78" stroke="#5a3822" stroke-width="2"/>
      <!-- Brown Military Crew Cut Hair -->
      <polygon points="24,14 76,14 74,28 26,28" fill="#4a2e1b"/>
      <!-- Piercing Glancing Eyes -->
      <rect x="32" y="36" width="12" height="7" fill="#ffffff"/>
      <rect x="56" y="36" width="12" height="7" fill="#ffffff"/>
      <rect x="36" y="37" width="5" height="5" fill="#205090"/>
      <rect x="60" y="37" width="5" height="5" fill="#205090"/>
      <!-- Gritted Evil Grin Teeth -->
      <rect x="36" y="58" width="28" height="8" fill="#ffffff" stroke="#3a1a0e" stroke-width="2"/>
      <line x1="44" y1="58" x2="44" y2="66" stroke="#3a1a0e" stroke-width="1.5"/>
      <line x1="56" y1="58" x2="56" y2="66" stroke="#3a1a0e" stroke-width="1.5"/>
      <!-- Battle Scar -->
      <line x1="66" y1="24" x2="72" y2="44" stroke="#8d1810" stroke-width="2.5"/>
    </g>

    <!-- 3. AMMUNITION CONSOLE -->
    <g transform="translate(580, 946)">
      <text x="0" y="24" font-family="'Courier New', monospace" font-size="16" font-weight="900" 
            letter-spacing="2" fill="#8d7462">BUCKSHOT</text>
      <text x="0" y="78" font-family="'Courier New', monospace" font-size="56" font-weight="900" fill="#ffd152">12 / 72</text>
    </g>

    <!-- 4. WAVE TELEMETRY -->
    <g transform="translate(980, 946)">
      <text x="0" y="24" font-family="'Courier New', monospace" font-size="16" font-weight="900" 
            letter-spacing="2" fill="#8d7462">HOSTILE WAVE</text>
      <text x="0" y="78" font-family="'Courier New', monospace" font-size="56" font-weight="900" fill="#f0642a">WAVE 3/5</text>
    </g>

    <!-- 5. SCORE DISPLAY -->
    <g transform="translate(1420, 946)">
      <text x="0" y="24" font-family="'Courier New', monospace" font-size="16" font-weight="900" 
            letter-spacing="2" fill="#8d7462">DAILY SCORE</text>
      <text x="0" y="78" font-family="'Courier New', monospace" font-size="56" font-weight="900" fill="#fff5ea">3,450 PTS</text>
    </g>
  </g>

  <!-- Big Watermark Logo In Top Right -->
  <g filter="url(#fbShadow)" transform="translate(1320, 140)">
    <rect x="0" y="0" width="520" height="96" rx="8" fill="#120a07" stroke="#e05615" stroke-width="4"/>
    <text x="260" y="66" font-family="'Impact', 'Arial Black', sans-serif" font-size="58" font-weight="900" 
          letter-spacing="3" fill="#f0541e" text-anchor="middle">HELL SHIFT</text>
    <text x="260" y="62" font-family="'Impact', 'Arial Black', sans-serif" font-size="58" font-weight="900" 
          letter-spacing="3" fill="#fff5ea" text-anchor="middle">HELL SHIFT</text>
  </g>
</svg>`;

// 4. MAIN BUILD SCRIPT
async function main() {
  console.log('--- GENERATING MARKETING CATALOG ASSETS ---');

  // Write SVGs
  const iconSvgPath = path.join(ASSETS_DIR, 'icon.svg');
  const tileSvgPath = path.join(ASSETS_DIR, 'tile.svg');
  const fallbackSvgPath = path.join(ASSETS_DIR, 'fallback.svg');

  fs.writeFileSync(iconSvgPath, generateIconSvg(), 'utf-8');
  fs.writeFileSync(tileSvgPath, generateTileSvg(), 'utf-8');
  fs.writeFileSync(fallbackSvgPath, generateFallbackSvg(), 'utf-8');

  console.log('✓ Created SVGs: icon.svg, tile.svg, fallback.svg');

  // Render to PNGs via Headless Edge / Chromium CDP
  const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const DEBUG_PORT = 9225;
  const USER_DATA_DIR = path.resolve(__dirname, '../.edge-assets-profile');

  const browserProc = spawn(
    EDGE_PATH,
    [
      '--headless=new',
      `--remote-debugging-port=${DEBUG_PORT}`,
      `--user-data-dir=${USER_DATA_DIR}`,
      '--disable-gpu',
      '--no-first-run',
      '--no-default-browser-check',
      '--run-all-compositor-stages-before-draw',
      'about:blank',
    ],
    { stdio: 'ignore' }
  );

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  try {
    let versionData = null;
    for (let i = 0; i < 20; i++) {
      await sleep(300);
      try {
        const res = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/version`);
        if (res.ok) {
          versionData = await res.json();
          break;
        }
      } catch {}
    }

    if (!versionData) {
      throw new Error('Chromium debug endpoint did not respond on port ' + DEBUG_PORT);
    }
    console.log(`Connected to headless browser: ${versionData['Browser']}`);

    const targetsRes = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/new?about:blank`, { method: 'PUT' });
    const target = await targetsRes.json();
    const ws = new WebSocket(target.webSocketDebuggerUrl);

    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });

    let nextId = 1;
    const callbacks = new Map();
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && callbacks.has(msg.id)) {
        const cb = callbacks.get(msg.id);
        callbacks.delete(msg.id);
        if (msg.error) cb.reject(new Error(msg.error.message));
        else cb.resolve(msg.result);
      }
    };

    const sendCDP = (method, params = {}) =>
      new Promise((resolve, reject) => {
        const id = nextId++;
        callbacks.set(id, { resolve, reject });
        ws.send(JSON.stringify({ id, method, params }));
      });

    await sendCDP('Page.enable');
    await sendCDP('Runtime.enable');
    await sendCDP('Emulation.setDeviceMetricsOverride', {
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
      mobile: false,
    });

    // Helper to capture a file to PNG
    const captureFile = async (svgFilePath, pngFileName, width, height) => {
      console.log(`Rendering ${pngFileName} (${width}x${height})...`);
      await sendCDP('Emulation.setDeviceMetricsOverride', {
        width,
        height,
        deviceScaleFactor: 1,
        mobile: false,
      });

      const fileUrl = 'file:///' + svgFilePath.replace(/\\/g, '/');
      await sendCDP('Page.navigate', { url: fileUrl });
      await sleep(600);

      const shot = await sendCDP('Page.captureScreenshot', {
        format: 'png',
        clip: { x: 0, y: 0, width, height, scale: 1 },
      });

      const outPath = path.join(ASSETS_DIR, pngFileName);
      fs.writeFileSync(outPath, Buffer.from(shot.data, 'base64'));
      console.log(`✓ Saved ${pngFileName} (${fs.statSync(outPath).size} bytes)`);
    };

    // 1. Icon (1024x1024)
    await captureFile(iconSvgPath, 'icon.png', 1024, 1024);

    // 2. Tile (800x600)
    await captureFile(tileSvgPath, 'tile.png', 800, 600);

    // 3. Fallback (1920x1080)
    await captureFile(fallbackSvgPath, 'fallback.png', 1920, 1080);

    ws.close();
    console.log('\n--- ALL MARKETING ASSETS SUCCESSFULLY GENERATED ---');
  } finally {
    browserProc.kill();
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error('Asset generation failed:', err);
    process.exit(1);
  });
}
