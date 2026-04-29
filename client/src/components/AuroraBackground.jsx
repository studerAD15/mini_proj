import { useMemo } from "react";

/* ── Pure CSS Particle system + Aurora orbs + Grid overlays ── */
export default function AuroraBackground() {
  /* Generate particles with randomized positions and timing */
  const particles = useMemo(() => {
    return Array.from({ length: 35 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 15 + 15,
      delay: Math.random() * 20,
      opacity: Math.random() * 0.4 + 0.1,
    }));
  }, []);

  return (
    <>
      {/* Aurora gradient orbs */}
      <div className="aurora-bg" aria-hidden="true">
        <div className="aurora-orb aurora-orb--purple" />
        <div className="aurora-orb aurora-orb--teal" />
        <div className="aurora-orb aurora-orb--blue" />
        <div className="aurora-orb aurora-orb--pink" />
      </div>

      {/* Mesh grid */}
      <div className="mesh-grid" aria-hidden="true" />

      {/* Animated dot-grid */}
      <div className="dot-grid" aria-hidden="true" />

      {/* Floating particle system */}
      <div className="particles" aria-hidden="true">
        {particles.map((p) => (
          <div
            key={p.id}
            className="particle"
            style={{
              left: p.left,
              width: `${p.size}px`,
              height: `${p.size}px`,
              opacity: p.opacity,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>
    </>
  );
}

