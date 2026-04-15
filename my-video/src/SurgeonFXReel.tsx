import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

/* ============================================================================
   SurgeonFX Reel — Instagram 9:16 announcement
   Structure:
   0   - 90f  : Logo reveal (blurry -> sharp) + brand name
   90  - 180f : "NOW LIVE" button drops in below the logo
   180 - 290f : Full-blue takeover with headline (glassmorphism card)
   290 - 480f : Website preview scroll (hero, method, ticker, pricing)
   480 - 540f : Final CTA lock-up
============================================================================ */

const BLACK = '#030308';
const BLACK_2 = '#0b0b16';
const BLUE = '#1e6bff';
const BLUE_DEEP = '#0b3dd6';
const BLUE_LIGHT = '#5aa1ff';
const BLUE_GLOW = 'rgba(30,107,255,0.55)';
const WHITE = '#ffffff';
const GRAY = '#8a8aa0';
const LOSS = '#ef4444';

const SYNE = "'Syne', 'Space Grotesk', sans-serif";
const GROT = "'Space Grotesk', system-ui, sans-serif";

/* ---------------------------------------------------------------------------
   Ambient background: animated grid + orbs (present on every scene)
--------------------------------------------------------------------------- */
const AmbientBG: React.FC<{intensity?: number}> = ({intensity = 1}) => {
  const frame = useCurrentFrame();
  const shift = (frame * 0.8) % 80;
  return (
    <>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 30%, ${BLACK_2} 0%, ${BLACK} 65%)`,
        }}
      />
      <AbsoluteFill
        style={{
          opacity: 0.25 * intensity,
          backgroundImage: `
            linear-gradient(to right, rgba(90,161,255,0.18) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(90,161,255,0.18) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
          backgroundPosition: `${shift}px ${shift}px`,
          maskImage: 'radial-gradient(ellipse at center, black 35%, transparent 75%)',
          WebkitMaskImage:
            'radial-gradient(ellipse at center, black 35%, transparent 75%)',
        }}
      />
      {/* Orbs */}
      <div
        style={{
          position: 'absolute',
          top: '15%',
          left: '-15%',
          width: 700,
          height: 700,
          borderRadius: '50%',
          background: BLUE,
          filter: 'blur(140px)',
          opacity: 0.35 * intensity,
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '10%',
          right: '-20%',
          width: 800,
          height: 800,
          borderRadius: '50%',
          background: BLUE_DEEP,
          filter: 'blur(160px)',
          opacity: 0.4 * intensity,
        }}
      />
    </>
  );
};

/* ---------------------------------------------------------------------------
   SurgeonFX Logo (S mark + brand text)
--------------------------------------------------------------------------- */
const LogoMark: React.FC<{size?: number}> = ({size = 150}) => {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.22,
        background: `linear-gradient(135deg, ${BLUE_LIGHT} 0%, ${BLUE} 55%, ${BLUE_DEEP} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: SYNE,
        fontSize: size * 0.6,
        fontWeight: 800,
        color: WHITE,
        boxShadow: `0 0 80px ${BLUE_GLOW}, inset 0 2px 0 rgba(255,255,255,0.3)`,
        letterSpacing: -2,
        position: 'relative',
      }}
    >
      S
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: size * 0.22,
          border: '2px solid rgba(255,255,255,0.25)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};

/* ===========================================================================
   SCENE 1 — Logo reveal (blurry -> sharp)
=========================================================================== */
const Scene1Logo: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const blur = interpolate(frame, [0, 28], [50, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const scale = interpolate(frame, [0, 28], [1.4, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const opacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Text slides in after logo is sharp
  const textSpring = spring({
    frame: frame - 22,
    fps,
    config: {damping: 14, stiffness: 90},
  });
  const textX = interpolate(textSpring, [0, 1], [-80, 0]);
  const textOpacity = interpolate(textSpring, [0, 1], [0, 1]);

  // Tagline appears later
  const tagSpring = spring({
    frame: frame - 45,
    fps,
    config: {damping: 18, stiffness: 80},
  });
  const tagY = interpolate(tagSpring, [0, 1], [30, 0]);
  const tagOpacity = interpolate(tagSpring, [0, 1], [0, 1]);

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 28,
          filter: `blur(${blur}px)`,
          transform: `scale(${scale})`,
          opacity,
        }}
      >
        <LogoMark size={170} />
        <div
          style={{
            fontFamily: SYNE,
            fontWeight: 800,
            fontSize: 110,
            color: WHITE,
            letterSpacing: -3,
            transform: `translateX(${textX}px)`,
            opacity: textOpacity,
            lineHeight: 1,
          }}
        >
          Surgeon
          <span style={{color: BLUE_LIGHT}}>FX</span>
        </div>
      </div>

      {/* Tagline */}
      <div
        style={{
          marginTop: 48,
          fontFamily: GROT,
          fontSize: 38,
          color: GRAY,
          letterSpacing: 6,
          textTransform: 'uppercase',
          transform: `translateY(${tagY}px)`,
          opacity: tagOpacity,
          fontWeight: 500,
        }}
      >
        Précision · Forex · En Direct
      </div>
    </AbsoluteFill>
  );
};

/* ===========================================================================
   SCENE 2 — "NOW LIVE" button drops in (logo still visible above)
=========================================================================== */
const Scene2NowLive: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // Logo stays but slides up a bit
  const slideUp = spring({
    frame,
    fps,
    config: {damping: 16, stiffness: 80},
  });
  const logoY = interpolate(slideUp, [0, 1], [0, -120]);

  // Button pops in
  const pop = spring({
    frame: frame - 6,
    fps,
    config: {damping: 8, stiffness: 160},
  });
  const btnScale = interpolate(pop, [0, 1], [0, 1]);

  // Pulse
  const pulse = 1 + Math.sin(frame / 5) * 0.025;

  // Shockwave ring
  const wave1 = (frame % 45) / 45;
  const wave2 = ((frame + 22) % 45) / 45;

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
      }}
    >
      {/* Logo pinned above */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 24,
          transform: `translateY(${logoY}px)`,
        }}
      >
        <LogoMark size={130} />
        <div
          style={{
            fontFamily: SYNE,
            fontWeight: 800,
            fontSize: 90,
            color: WHITE,
            letterSpacing: -2,
          }}
        >
          Surgeon<span style={{color: BLUE_LIGHT}}>FX</span>
        </div>
      </div>

      {/* NOW LIVE */}
      <div
        style={{
          position: 'relative',
          marginTop: 140,
          transform: `scale(${btnScale * pulse})`,
        }}
      >
        {/* Shockwave rings */}
        {[wave1, wave2].map((w, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 28,
              border: `3px solid ${BLUE_LIGHT}`,
              opacity: (1 - w) * 0.7,
              transform: `scale(${1 + w * 0.8})`,
            }}
          />
        ))}

        <div
          style={{
            padding: '36px 90px',
            borderRadius: 28,
            background: `linear-gradient(135deg, ${BLUE_LIGHT} 0%, ${BLUE} 100%)`,
            color: WHITE,
            fontFamily: SYNE,
            fontWeight: 800,
            fontSize: 88,
            letterSpacing: 3,
            boxShadow: `0 25px 80px ${BLUE_GLOW}, 0 0 120px ${BLUE_GLOW}`,
            display: 'flex',
            alignItems: 'center',
            gap: 24,
            position: 'relative',
          }}
        >
          <span
            style={{
              width: 22,
              height: 22,
              borderRadius: '50%',
              background: WHITE,
              boxShadow: `0 0 20px ${WHITE}`,
              animation: 'none',
            }}
          />
EN DIRECT
        </div>
      </div>

      {/* Subline */}
      <div
        style={{
          marginTop: 60,
          fontFamily: GROT,
          fontSize: 32,
          color: WHITE,
          opacity: interpolate(frame, [30, 50], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
          letterSpacing: 1,
          fontWeight: 500,
        }}
      >
        SurgeonFX est EN DIRECT{' '}
        <span style={{fontSize: 36}}>🩺</span>
      </div>
    </AbsoluteFill>
  );
};

/* ===========================================================================
   SCENE 3 — Full-blue takeover with accroche headline
=========================================================================== */
const Scene3BluePunch: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // Circular wipe grows from center
  const wipeR = interpolate(frame, [0, 22], [0, 2800], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const textSpring = spring({
    frame: frame - 28,
    fps,
    config: {damping: 14, stiffness: 90},
  });
  const textY = interpolate(textSpring, [0, 1], [80, 0]);
  const textOpacity = interpolate(textSpring, [0, 1], [0, 1]);

  const subSpring = spring({
    frame: frame - 48,
    fps,
    config: {damping: 18},
  });
  const subY = interpolate(subSpring, [0, 1], [40, 0]);
  const subOpacity = interpolate(subSpring, [0, 1], [0, 1]);

  return (
    <AbsoluteFill>
      {/* Blue expanding circle */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 50%, ${BLUE} 0%, ${BLUE_DEEP} 100%)`,
          clipPath: `circle(${wipeR}px at 50% 50%)`,
        }}
      />

      {/* Light pattern over blue */}
      <AbsoluteFill
        style={{
          clipPath: `circle(${wipeR}px at 50% 50%)`,
          opacity: 0.15,
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.25) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.25) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Headline card */}
      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          padding: 70,
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            background: 'rgba(255,255,255,0.14)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: 36,
            padding: '52px 60px',
            border: '2px solid rgba(255,255,255,0.35)',
            boxShadow: '0 30px 80px rgba(0,0,0,0.25)',
            fontFamily: SYNE,
            fontWeight: 800,
            fontSize: 92,
            color: WHITE,
            lineHeight: 1.05,
            textAlign: 'center',
            transform: `translateY(${textY}px)`,
            opacity: textOpacity,
            maxWidth: 900,
          }}
        >
          Marre de trader
          <br />
          seul dans le noir ?
        </div>

        <div
          style={{
            marginTop: 50,
            fontFamily: GROT,
            fontSize: 38,
            color: WHITE,
            textAlign: 'center',
            maxWidth: 800,
            transform: `translateY(${subY}px)`,
            opacity: subOpacity,
            fontWeight: 500,
            lineHeight: 1.35,
          }}
        >
          Rejoins une communauté de traders d'élite.
          <br />
          Chaque setup analysé. Chaque trade justifié.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ===========================================================================
   SCENE 4 — Website preview scroll (mocked site sections)
=========================================================================== */
const SiteMock: React.FC = () => {
  // Full mock of the website inside a phone-ish frame
  return (
    <div
      style={{
        width: 900,
        background: BLACK,
        borderRadius: 44,
        border: `2px solid rgba(90,161,255,0.25)`,
        overflow: 'hidden',
        boxShadow: `0 40px 120px ${BLUE_GLOW}`,
        fontFamily: GROT,
        color: WHITE,
      }}
    >
      {/* Top browser chrome */}
      <div
        style={{
          padding: '18px 26px',
          background: BLACK_2,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <span style={{width: 14, height: 14, borderRadius: 7, background: '#ff5f57'}} />
        <span style={{width: 14, height: 14, borderRadius: 7, background: '#febc2e'}} />
        <span style={{width: 14, height: 14, borderRadius: 7, background: '#28c840'}} />
        <div
          style={{
            marginLeft: 28,
            padding: '6px 18px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: 10,
            fontSize: 22,
            color: GRAY,
            fontFamily: GROT,
          }}
        >
          surgeonfx.com
        </div>
      </div>

      {/* ---------- HERO section ---------- */}
      <div
        style={{
          padding: '80px 60px 60px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* grid bg */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.25,
            backgroundImage: `
              linear-gradient(to right, rgba(90,161,255,0.25) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(90,161,255,0.25) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            maskImage: 'radial-gradient(ellipse at center, black 20%, transparent 70%)',
            WebkitMaskImage:
              'radial-gradient(ellipse at center, black 20%, transparent 70%)',
          }}
        />
        {/* Navbar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
            marginBottom: 70,
          }}
        >
          <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
            <LogoMark size={44} />
            <span style={{fontFamily: SYNE, fontWeight: 800, fontSize: 26}}>
              Surgeon<span style={{color: BLUE_LIGHT}}>FX</span>
            </span>
          </div>
          <div
            style={{
              padding: '10px 22px',
              background: BLUE,
              borderRadius: 12,
              fontSize: 18,
              fontWeight: 600,
              color: WHITE,
            }}
          >
            Rejoindre →
          </div>
        </div>

        {/* live pill */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 18px',
            borderRadius: 999,
            background: 'rgba(90,161,255,0.12)',
            border: `1px solid rgba(90,161,255,0.4)`,
            fontSize: 18,
            color: BLUE_LIGHT,
            fontWeight: 500,
            position: 'relative',
          }}
        >
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: BLUE_LIGHT,
              boxShadow: `0 0 10px ${BLUE_LIGHT}`,
            }}
          />
          Analyses en direct · 247 membres actifs
        </div>

        {/* Title */}
        <div
          style={{
            fontFamily: SYNE,
            fontWeight: 800,
            fontSize: 110,
            lineHeight: 1,
            letterSpacing: -3,
            marginTop: 30,
            position: 'relative',
          }}
        >
          Trade like
          <br />
          <span style={{color: BLUE_LIGHT}}>a Surgeon.</span>
        </div>

        <div
          style={{
            marginTop: 26,
            fontSize: 26,
            color: GRAY,
            maxWidth: 600,
            lineHeight: 1.4,
            position: 'relative',
          }}
        >
          Précision chirurgicale sur les marchés Forex.
          Chaque setup analysé, chaque trade justifié.
        </div>

        {/* Stats */}
        <div
          style={{
            display: 'flex',
            gap: 50,
            marginTop: 50,
            position: 'relative',
          }}
        >
          {[
            {n: '5.0', u: '★ Whop'},
            {n: '100%', u: 'Transparent'},
            {n: '0€', u: 'Pour commencer'},
          ].map((s, i) => (
            <div key={i} style={{display: 'flex', flexDirection: 'column', gap: 4}}>
              <span
                style={{
                  fontFamily: SYNE,
                  fontWeight: 800,
                  fontSize: 50,
                  color: WHITE,
                }}
              >
                {s.n}
              </span>
              <span style={{fontSize: 18, color: GRAY, letterSpacing: 1}}>
                {s.u}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ---------- Ticker ---------- */}
      <TickerStrip />

      {/* ---------- Method cards ---------- */}
      <div style={{padding: '70px 60px'}}>
        <div
          style={{
            fontSize: 20,
            color: BLUE_LIGHT,
            letterSpacing: 4,
            textTransform: 'uppercase',
            marginBottom: 20,
          }}
        >
          01 — Méthode
        </div>
        <div
          style={{
            fontFamily: SYNE,
            fontWeight: 800,
            fontSize: 72,
            lineHeight: 1.05,
            letterSpacing: -2,
            marginBottom: 50,
          }}
        >
          L'approche du <span style={{color: BLUE_LIGHT}}>chirurgien.</span>
        </div>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24}}>
          {[
            {n: '01', t: 'Structure de marché', d: 'Zones de liquidité, BOS, CHoCH.'},
            {n: '02', t: 'Biais fondamental', d: 'COT report, flux institutionnels.'},
            {n: '03', t: 'Exécution', d: 'Entrée millimétrée, SL défini.'},
            {n: '04', t: 'Transparence', d: 'Chaque trade partagé en live.'},
          ].map((c) => (
            <div
              key={c.n}
              style={{
                padding: 28,
                background: 'rgba(90,161,255,0.05)',
                border: `1px solid rgba(90,161,255,0.2)`,
                borderRadius: 20,
                backdropFilter: 'blur(10px)',
              }}
            >
              <div
                style={{
                  fontFamily: SYNE,
                  fontWeight: 800,
                  fontSize: 40,
                  color: BLUE_LIGHT,
                  marginBottom: 10,
                }}
              >
                {c.n}
              </div>
              <div style={{fontSize: 24, fontWeight: 600, marginBottom: 6}}>
                {c.t}
              </div>
              <div style={{fontSize: 18, color: GRAY, lineHeight: 1.4}}>{c.d}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ---------- Pricing peek ---------- */}
      <div style={{padding: '40px 60px 90px'}}>
        <div
          style={{
            padding: 40,
            background: `linear-gradient(135deg, ${BLUE_DEEP} 0%, ${BLUE} 100%)`,
            borderRadius: 28,
            boxShadow: `0 20px 60px ${BLUE_GLOW}`,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              fontSize: 16,
              color: WHITE,
              opacity: 0.8,
              letterSpacing: 3,
              textTransform: 'uppercase',
              marginBottom: 12,
            }}
          >
            ⚡ Recommandé
          </div>
          <div
            style={{
              fontFamily: SYNE,
              fontWeight: 800,
              fontSize: 54,
              color: WHITE,
              marginBottom: 8,
            }}
          >
            Premium
          </div>
          <div style={{color: WHITE, opacity: 0.85, fontSize: 20, marginBottom: 24}}>
            Toutes les analyses. Tous les setups. Tout Matt.
          </div>
          <div
            style={{
              display: 'inline-block',
              padding: '16px 32px',
              background: WHITE,
              color: BLUE_DEEP,
              borderRadius: 14,
              fontSize: 22,
              fontWeight: 700,
              fontFamily: GROT,
            }}
          >
            Rejoindre Premium →
          </div>
        </div>
      </div>
    </div>
  );
};

const TickerStrip: React.FC = () => {
  const frame = useCurrentFrame();
  const items = [
    {p: 'EUR/USD', r: '+2.3R', win: true},
    {p: 'GBP/JPY', r: '+1.8R', win: true},
    {p: 'USD/CHF', r: '-1R', win: false},
    {p: 'XAU/USD', r: '+3.1R', win: true},
    {p: 'EUR/GBP', r: '+1.5R', win: true},
    {p: 'USD/JPY', r: '+2.7R', win: true},
  ];
  const doubled = [...items, ...items, ...items];
  const offset = -(frame * 3) % 1200;

  return (
    <div
      style={{
        padding: '24px 0',
        borderTop: '1px solid rgba(90,161,255,0.15)',
        borderBottom: '1px solid rgba(90,161,255,0.15)',
        background: 'rgba(11,11,22,0.6)',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          gap: 40,
          transform: `translateX(${offset}px)`,
          fontFamily: SYNE,
          fontWeight: 700,
          fontSize: 28,
        }}
      >
        {doubled.map((it, i) => (
          <span
            key={i}
            style={{
              color: it.win ? BLUE_LIGHT : LOSS,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            {it.p} {it.r} {it.win ? '✓' : '✗'}
            <span style={{color: GRAY, margin: '0 10px'}}>·</span>
          </span>
        ))}
      </div>
    </div>
  );
};

const Scene4SiteReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();

  // Mock enters from bottom, then slow parallax scroll upward
  const entrance = spring({
    frame,
    fps,
    config: {damping: 18, stiffness: 55},
  });
  const startY = interpolate(entrance, [0, 1], [1500, 0]);

  // Then scroll through site
  const scrollProgress = interpolate(
    frame,
    [40, durationInFrames - 10],
    [0, 1],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
  );
  const scrollY = interpolate(scrollProgress, [0, 1], [0, -1100]);

  // Label at top
  const labelOpacity = interpolate(frame, [10, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{alignItems: 'center', justifyContent: 'flex-start', paddingTop: 70}}
    >
      <div
        style={{
          fontFamily: SYNE,
          fontWeight: 800,
          fontSize: 64,
          color: WHITE,
          opacity: labelOpacity,
          letterSpacing: -1,
          textAlign: 'center',
          marginBottom: 16,
        }}
      >
        Découvre le site
      </div>
      <div
        style={{
          fontFamily: GROT,
          fontSize: 28,
          color: BLUE_LIGHT,
          opacity: labelOpacity,
          letterSpacing: 3,
          textTransform: 'uppercase',
          marginBottom: 30,
        }}
      >
        surgeonfx.com
      </div>

      <div
        style={{
          transform: `translateY(${startY + scrollY}px)`,
          transformOrigin: 'top center',
        }}
      >
        <SiteMock />
      </div>
    </AbsoluteFill>
  );
};

/* ===========================================================================
   SCENE 5 — Final CTA
=========================================================================== */
const Scene5Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const pop = spring({frame, fps, config: {damping: 14, stiffness: 90}});
  const scale = interpolate(pop, [0, 1], [0.7, 1]);
  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const btnSpring = spring({
    frame: frame - 15,
    fps,
    config: {damping: 14, stiffness: 140},
  });
  const btnScale = interpolate(btnSpring, [0, 1], [0, 1]);

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        opacity,
      }}
    >
      <div style={{transform: `scale(${scale})`}}>
        <LogoMark size={180} />
      </div>
      <div
        style={{
          fontFamily: SYNE,
          fontWeight: 800,
          fontSize: 88,
          color: WHITE,
          letterSpacing: -2,
          marginTop: 36,
          textAlign: 'center',
          lineHeight: 1.05,
        }}
      >
        Prêt à opérer
        <br />
        <span style={{color: BLUE_LIGHT}}>les marchés ?</span>
      </div>
      <div
        style={{
          marginTop: 60,
          padding: '28px 72px',
          background: `linear-gradient(135deg, ${BLUE_LIGHT} 0%, ${BLUE} 100%)`,
          borderRadius: 22,
          color: WHITE,
          fontFamily: SYNE,
          fontWeight: 800,
          fontSize: 48,
          letterSpacing: 1,
          boxShadow: `0 25px 80px ${BLUE_GLOW}`,
          transform: `scale(${btnScale})`,
        }}
      >
        Rejoindre l'équipe →
      </div>
      <div
        style={{
          marginTop: 40,
          fontFamily: GROT,
          fontSize: 28,
          color: GRAY,
          letterSpacing: 4,
          textTransform: 'uppercase',
          opacity: interpolate(frame, [40, 60], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      >
        @matt.crx · whop.com/surgeon-fx
      </div>
    </AbsoluteFill>
  );
};

/* ===========================================================================
   ROOT
=========================================================================== */
export const SurgeonFXReel: React.FC = () => {
  const frame = useCurrentFrame();

  // Ambient background gets dimmer during blue scene
  const ambientIntensity = interpolate(
    frame,
    [175, 195, 285, 300],
    [1, 0, 0, 1],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
  );

  return (
    <AbsoluteFill
      style={{
        background: BLACK,
        fontFamily: GROT,
        overflow: 'hidden',
      }}
    >
      <AmbientBG intensity={ambientIntensity} />

      <Sequence from={0} durationInFrames={95}>
        <Scene1Logo />
      </Sequence>

      <Sequence from={95} durationInFrames={90}>
        <Scene2NowLive />
      </Sequence>

      <Sequence from={185} durationInFrames={115}>
        <Scene3BluePunch />
      </Sequence>

      <Sequence from={300} durationInFrames={180}>
        <Scene4SiteReveal />
      </Sequence>

      <Sequence from={480} durationInFrames={90}>
        <Scene5Outro />
      </Sequence>
    </AbsoluteFill>
  );
};
