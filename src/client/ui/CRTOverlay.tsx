import type { FC } from 'react';

type Props = {
  enabled?: boolean;
};

export const CRTOverlay: FC<Props> = ({ enabled = true }) => {
  if (!enabled) {
    return null;
  }

  return (
    <div className="hell-crt-overlay" aria-hidden="true">
      <div className="hell-crt-scanlines" />
      <div className="hell-crt-vignette" />
      <div className="hell-crt-flicker" />
    </div>
  );
};
