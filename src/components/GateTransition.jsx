import { useEffect, useRef, useState } from 'react';

export default function GateTransition({ active, onComplete }) {
  const videoRef = useRef();
  const [beamsActive, setBeamsActive] = useState(false);

  useEffect(() => {
    if (!active) return;

    const video = videoRef.current;
    if (video) {
      video.currentTime = 0;
      video.play().catch(() => {
        // Fallback if browser blocks video play
        onComplete();
      });
    }

    // Trigger secondary volumetric light beams
    const beamTimer = setTimeout(() => {
      setBeamsActive(true);
    }, 400);

    const endHandler = () => {
      onComplete();
    };

    video?.addEventListener('ended', endHandler);

    // Safety fallback timeout
    const safetyTimer = setTimeout(() => {
      onComplete();
    }, 5500);

    return () => {
      clearTimeout(beamTimer);
      clearTimeout(safetyTimer);
      video?.removeEventListener('ended', endHandler);
    };
  }, [active, onComplete]);

  return (
    <>
      <div className={`gate-container ${active ? 'active' : ''}`} aria-hidden="true">
        <video ref={videoRef} muted playsInline preload="auto">
          <source src="assets/Gate Opening.mp4" type="video/mp4" />
        </video>
      </div>

      <div className={`light-beams ${beamsActive && active ? 'active' : ''}`} aria-hidden="true">
        <div className="beam beam-1"></div>
        <div className="beam beam-2"></div>
        <div className="beam beam-3"></div>
      </div>
    </>
  );
}
