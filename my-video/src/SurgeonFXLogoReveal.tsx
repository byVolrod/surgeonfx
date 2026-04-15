import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

/* ============================================================================
   SurgeonFX Logo Reveal — iPhone-style product presentation
   The "S" rotates on its Y axis like an Apple keynote unveiling.
   1080x1920, ~6s at 30fps.
============================================================================ */

const BLUE_DEEP = '#0a1f4d';
const BLUE = '#1e6bff';
const BLUE_LIGHT = '#5aa1ff';
const BLUE_PALE = '#a8c8ff';
const WHITE = '#ffffff';

const SYNE = "'Syne', 'Space Grotesk', sans-serif";

export const SurgeonFXLogoReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();

  // -------- Rotation --------
  // Fast initial spin that eases into slow continuous rotation
  const spinEase = spring({
    frame,
    fps,
    config: {damping: 30, stiffness: 40, mass: 2},
  });
  // First big rotation (720° in first second), then continuous slow rotation
  const primarySpin = interpolate(spinEase, [0, 1], [-180, 360]);
  const continuousSpin = Math.max(0, frame - fps) * 1.5; // 1.5° per frame after 1s
  const rotationY = primarySpin + continuousSpin;

  // -------- Entrance --------
  const entranceOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const entranceScale = interpolate(
    spring({frame, fps, config: {damping: 12, stiffness: 70}}),
    [0, 1],
    [0.3, 1]
  );

  // -------- Outro --------
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 20, durationInFrames],
    [1, 0.6],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
  );

  // -------- Text reveal under the logo --------
  const textReveal = spring({
    frame: frame - 55,
    fps,
    config: {damping: 16, stiffness: 80},
  });
  const textY = interpolate(textReveal, [0, 1], [40, 0]);
  const textOpacity = interpolate(textReveal, [0, 1], [0, 1]);

  const taglineReveal = spring({
    frame: frame - 80,
    fps,
    config: {damping: 18},
  });
  const taglineY = interpolate(taglineReveal, [0, 1], [25, 0]);
  const taglineOpacity = interpolate(taglineReveal, [0, 1], [0, 1]);

  // -------- Floating light particles (background ambient) --------
  const particles = Array.from({length: 40}).map((_, i) => {
    const seed = i * 137.5;
    const x = (Math.sin(seed) * 0.5 + 0.5) * 1080;
    const baseY = (Math.cos(seed * 1.3) * 0.5 + 0.5) * 1920;
    const drift = Math.sin(frame / 60 + i) * 30;
    const y = baseY + drift;
    const size = 2 + ((i * 7) % 5);
    const twinkle = 0.3 + Math.sin(frame / 10 + i) * 0.3;
    return {x, y, size, opacity: twinkle};
  });

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 50% 40%, ${BLUE} 0%, ${BLUE_DEEP} 55%, #02061a 100%)`,
        overflow: 'hidden',
      }}
    >
      {/* Subtle grid floor */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 600,
          opacity: 0.25,
          backgroundImage: `
            linear-gradient(to right, rgba(90,161,255,0.3) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(90,161,255,0.3) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
          transform: 'perspective(400px) rotateX(60deg)',
          transformOrigin: 'center top',
          maskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
        }}
      />

      {/* Ambient light particles */}
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            background: BLUE_PALE,
            opacity: p.opacity,
            boxShadow: `0 0 ${p.size * 4}px ${BLUE_LIGHT}`,
          }}
        />
      ))}

      {/* Main glow behind the S */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 900,
          height: 900,
          borderRadius: '50%',
          background: BLUE_LIGHT,
          filter: 'blur(180px)',
          opacity: 0.5 * entranceOpacity,
        }}
      />

      {/* 3D rotating S */}
      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          perspective: '1600px',
          opacity: entranceOpacity * fadeOut,
        }}
      >
        <div
          style={{
            transformStyle: 'preserve-3d',
            transform: `rotateY(${rotationY}deg) rotateX(-8deg) scale(${entranceScale})`,
          }}
        >
          {/* The S letter card with thickness (two stacked faces) */}
          <SCard rotationY={rotationY} />
        </div>

        {/* Floor reflection */}
        <div
          style={{
            marginTop: 40,
            opacity: 0.25 * entranceOpacity,
            transform: `rotateY(${rotationY}deg) scaleY(-1) scale(${entranceScale})`,
            maskImage: 'linear-gradient(to bottom, black 0%, transparent 70%)',
            WebkitMaskImage:
              'linear-gradient(to bottom, black 0%, transparent 70%)',
            filter: 'blur(4px)',
          }}
        >
          <SCard rotationY={rotationY} />
        </div>
      </AbsoluteFill>

      {/* Brand text */}
      <div
        style={{
          position: 'absolute',
          bottom: 420,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: SYNE,
          fontWeight: 800,
          fontSize: 110,
          color: WHITE,
          letterSpacing: -3,
          transform: `translateY(${textY}px)`,
          opacity: textOpacity,
          lineHeight: 1,
          textShadow: '0 10px 40px rgba(0,0,0,0.5)',
        }}
      >
        Surgeon<span style={{color: BLUE_PALE}}>FX</span>
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 340,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: "'Space Grotesk', system-ui, sans-serif",
          fontSize: 34,
          color: BLUE_PALE,
          letterSpacing: 8,
          textTransform: 'uppercase',
          fontWeight: 500,
          transform: `translateY(${taglineY}px)`,
          opacity: taglineOpacity * 0.85,
        }}
      >
        Precision Trading
      </div>
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------------------
   The S card. Rendered twice (front/back face) for 3D thickness illusion.
   The highlight sweeps based on rotation angle for a specular light effect.
--------------------------------------------------------------------------- */
const SCard: React.FC<{rotationY: number}> = ({rotationY}) => {
  // Light angle based on rotation — simulates reflection as S turns
  const lightAngle = ((rotationY % 360) + 360) % 360;
  // Intensity peaks when card is facing camera (0° / 180°)
  const facing = Math.abs(Math.cos((lightAngle * Math.PI) / 180));
  const highlight = facing;

  const SIZE = 520;
  const RADIUS = 110;

  return (
    <div
      style={{
        width: SIZE,
        height: SIZE,
        borderRadius: RADIUS,
        background: `linear-gradient(
          ${135 + lightAngle * 0.5}deg,
          ${BLUE_LIGHT} 0%,
          ${BLUE} 45%,
          ${BLUE_DEEP} 100%
        )`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        boxShadow: `
          0 0 120px ${BLUE_LIGHT},
          0 40px 120px rgba(0,0,0,0.6),
          inset 0 4px 0 rgba(255,255,255,${0.4 * highlight}),
          inset 0 -8px 30px rgba(0,0,0,0.3)
        `,
        backfaceVisibility: 'visible',
      }}
    >
      {/* Specular highlight streak */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: RADIUS,
          background: `linear-gradient(
            105deg,
            transparent 30%,
            rgba(255,255,255,${0.35 * highlight}) 50%,
            transparent 70%
          )`,
          pointerEvents: 'none',
        }}
      />

      {/* Edge outline */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: RADIUS,
          border: '2px solid rgba(255,255,255,0.35)',
          pointerEvents: 'none',
        }}
      />

      {/* The S */}
      <span
        style={{
          fontFamily: SYNE,
          fontWeight: 800,
          fontSize: 380,
          color: WHITE,
          letterSpacing: -10,
          lineHeight: 1,
          textShadow: `
            0 4px 0 rgba(0,0,0,0.15),
            0 20px 40px rgba(0,0,0,0.5)
          `,
          position: 'relative',
          transform: 'translateY(-12px)',
        }}
      >
        S
      </span>
    </div>
  );
};
