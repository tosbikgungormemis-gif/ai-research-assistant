"use client";

export type JarvisState = "idle" | "thinking" | "speaking" | "listening";

const STATE_LABEL: Record<JarvisState, string> = {
  idle: "HAZIR",
  thinking: "İŞLENİYOR",
  speaking: "YANITLIYOR",
  listening: "DİNLİYORUM",
};

const STATE_COLOR: Record<JarvisState, string> = {
  idle: "#4fc3ff",
  thinking: "#34d399",
  speaking: "#4fc3ff",
  listening: "#ff4d6d",
};

// Deterministic pseudo-random (no Math.random) so server/client render match.
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function Ticks({ count, radius, active }: { count: number; radius: number; active: boolean }) {
  const ticks = Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * 360;
    const long = i % 5 === 0;
    return (
      <line
        key={i}
        x1={0}
        y1={-radius}
        x2={0}
        y2={-(radius - (long ? 6 : 3))}
        stroke="currentColor"
        strokeWidth={long ? 1.2 : 0.8}
        transform={`rotate(${angle})`}
        opacity={active ? 0.85 : 0.45}
      />
    );
  });
  return <>{ticks}</>;
}

function Sunburst({ count, innerRadius, baseOuter, variance }: {
  count: number;
  innerRadius: number;
  baseOuter: number;
  variance: number;
}) {
  const rays = Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * 360;
    const outer = baseOuter + seededRandom(i + 1) * variance;
    return (
      <line
        key={i}
        x1={0}
        y1={-innerRadius}
        x2={0}
        y2={-outer}
        stroke="currentColor"
        strokeWidth={0.9}
        strokeLinecap="round"
        transform={`rotate(${angle})`}
      />
    );
  });
  return <>{rays}</>;
}

export default function JarvisOrb({
  state,
  size = 96,
  showLabel = true,
}: {
  state: JarvisState;
  size?: number;
  showLabel?: boolean;
}) {
  const active = state !== "idle";
  const color = STATE_COLOR[state];

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="relative"
        style={{ width: size, height: size, filter: `drop-shadow(0 0 ${size * 0.14}px ${color}80)` }}
      >
        <svg viewBox="-50 -50 100 100" width={size} height={size} className="overflow-visible">
          <g style={{ color }}>
            <Ticks count={60} radius={47} active={active} />
          </g>
          <circle
            r={40}
            fill="none"
            stroke={color}
            strokeWidth={1}
            strokeDasharray="2 5"
            opacity={0.5}
          />
          <g
            className={`jarvis-core ${active ? "is-active" : ""}`}
            style={{ transformOrigin: "center", color }}
          >
            <Sunburst count={72} innerRadius={9} baseOuter={17} variance={12} />
            <circle r={8} fill="url(#jarvis-core-gradient)" />
          </g>
          <defs>
            <radialGradient id="jarvis-core-gradient">
              <stop offset="0%" stopColor="#ffffff" stopOpacity={0.95} />
              <stop offset="45%" stopColor={color} stopOpacity={0.9} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </radialGradient>
          </defs>
        </svg>
        {(state === "speaking" || state === "listening") && (
          <div className="absolute inset-x-0 bottom-[28%] flex items-end justify-center gap-[3px]">
            {[0, 1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className="jarvis-bar w-[3px] rounded-full"
                style={{
                  height: size * 0.16,
                  backgroundColor: color,
                  animationDelay: `${i * 0.12}s`,
                }}
              />
            ))}
          </div>
        )}
      </div>
      {showLabel && (
        <p
          className="text-[11px] font-semibold tracking-[0.2em]"
          style={{ color }}
        >
          {STATE_LABEL[state]}
        </p>
      )}
    </div>
  );
}
