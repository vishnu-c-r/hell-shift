import { useEffect, useState, type FC } from 'react';

type DoomFaceProps = {
  health: number;
  damageFlash: number;
  muzzleFlash: number;
  isDead: boolean;
};

type FaceState = 'healthy' | 'bruised' | 'bloody' | 'mutilated' | 'pain' | 'smile' | 'dead';

export const DoomFace: FC<DoomFaceProps> = ({
  health,
  damageFlash,
  muzzleFlash,
  isDead,
}) => {
  const [glance, setGlance] = useState<'center' | 'left' | 'right'>('center');

  // Marine eyes glance left/right occasionally when idle
  useEffect(() => {
    if (isDead) return;
    const interval = window.setInterval(() => {
      const rand = Math.random();
      if (rand < 0.25) setGlance('left');
      else if (rand < 0.5) setGlance('right');
      else setGlance('center');
    }, 1800);
    return () => window.clearInterval(interval);
  }, [isDead]);

  let state: FaceState = 'healthy';
  if (isDead || health <= 0) {
    state = 'dead';
  } else if (damageFlash > 0) {
    state = 'pain';
  } else if (muzzleFlash > 0) {
    state = 'smile';
  } else if (health < 20) {
    state = 'mutilated';
  } else if (health < 50) {
    state = 'bloody';
  } else if (health < 80) {
    state = 'bruised';
  }

  // Eye pupil offset based on glance direction
  const eyeOffset = glance === 'left' ? -1 : glance === 'right' ? 1 : 0;

  return (
    <div className={`hell-doom-face-container hell-face-${state}`} title="OPERATOR STATUS">
      <svg
        className="hell-doom-face-svg"
        viewBox="0 0 24 28"
        width="48"
        height="56"
        shapeRendering="crispEdges"
      >
        {/* Background skin base */}
        <rect x="5" y="4" width="14" height="20" fill={state === 'dead' ? '#4a3b32' : '#d29b72'} />

        {/* Brown Buzzcut Hair */}
        <rect x="5" y="2" width="14" height="4" fill="#3d271d" />
        <rect x="4" y="4" width="2" height="6" fill="#3d271d" />
        <rect x="18" y="4" width="2" height="6" fill="#3d271d" />
        <rect x="7" y="5" width="2" height="2" fill="#291811" />
        <rect x="15" y="5" width="2" height="2" fill="#291811" />

        {/* Jaw shading and ears */}
        <rect x="3" y="10" width="2" height="6" fill="#ad714b" />
        <rect x="19" y="10" width="2" height="6" fill="#ad714b" />
        <rect x="6" y="22" width="12" height="2" fill="#8c5332" />
        <rect x="7" y="23" width="10" height="2" fill="#63351d" />

        {/* Brows */}
        {state === 'pain' ? (
          <>
            {/* Clenched agony brows */}
            <rect x="6" y="8" width="4" height="2" fill="#291811" />
            <rect x="14" y="8" width="4" height="2" fill="#291811" />
          </>
        ) : state === 'smile' ? (
          <>
            {/* Confident arched evil brows */}
            <rect x="6" y="7" width="4" height="2" fill="#291811" />
            <rect x="14" y="7" width="4" height="2" fill="#291811" />
          </>
        ) : (
          <>
            {/* Determined flat brows */}
            <rect x="6" y="8" width="4" height="2" fill="#291811" />
            <rect x="14" y="8" width="4" height="2" fill="#291811" />
          </>
        )}

        {/* Eyes */}
        {state === 'dead' ? (
          <>
            {/* Skull / X Eyes */}
            <rect x="7" y="11" width="2" height="2" fill="#991111" />
            <rect x="15" y="11" width="2" height="2" fill="#991111" />
          </>
        ) : state === 'pain' ? (
          <>
            {/* Squeezed shut pain eyes */}
            <rect x="6" y="11" width="4" height="1" fill="#291811" />
            <rect x="14" y="11" width="4" height="1" fill="#291811" />
          </>
        ) : (
          <>
            {/* White of eyes */}
            <rect x="6" y="10" width="4" height="3" fill="#ffffff" />
            <rect x="14" y="10" width="4" height="3" fill="#ffffff" />
            {/* Blue-grey pupils */}
            <rect x={7 + eyeOffset} y="11" width="2" height="2" fill="#2b506e" />
            <rect x={15 + eyeOffset} y="11" width="2" height="2" fill="#2b506e" />
          </>
        )}

        {/* Nose */}
        <rect x="11" y="12" width="2" height="4" fill="#ad714b" />
        <rect x="10" y="15" width="4" height="1" fill="#8c5332" />

        {/* Mouth */}
        {state === 'dead' ? (
          <rect x="9" y="19" width="6" height="2" fill="#110505" />
        ) : state === 'pain' ? (
          <>
            {/* Agony grimace */}
            <rect x="8" y="18" width="8" height="4" fill="#291811" />
            <rect x="9" y="19" width="6" height="2" fill="#ffffff" />
          </>
        ) : state === 'smile' ? (
          <>
            {/* Evil toothy grin */}
            <rect x="7" y="18" width="10" height="3" fill="#291811" />
            <rect x="8" y="19" width="8" height="2" fill="#ffffff" />
          </>
        ) : state === 'mutilated' ? (
          <>
            {/* Battered bloody mouth */}
            <rect x="8" y="19" width="8" height="2" fill="#660a0a" />
            <rect x="11" y="21" width="2" height="3" fill="#cc1111" />
          </>
        ) : (
          <rect x="8" y="19" width="8" height="2" fill="#63351d" />
        )}

        {/* Blood & Gore overlays */}
        {(state === 'bloody' || state === 'mutilated') && (
          <>
            <rect x="13" y="16" width="2" height="3" fill="#b31212" />
            <rect x="7" y="7" width="2" height="3" fill="#8f0f0f" />
          </>
        )}
        {state === 'mutilated' && (
          <>
            <rect x="5" y="12" width="3" height="4" fill="#6b0808" />
            <rect x="16" y="6" width="3" height="2" fill="#b31212" />
            <rect x="15" y="17" width="2" height="4" fill="#b31212" />
          </>
        )}
      </svg>
    </div>
  );
};
