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

const HEX_POINTS = "0,-34 29.44,-17 29.44,17 0,34 -29.44,17 -29.44,-17";
const DOT_ANGLES = [20, 100, 190, 260, 320];
const CORNER = 46;
const BRACKET = 8;

function Bracket({ x, y, flipX, flipY, color }: { x: number; y: number; flipX: number; flipY: number; color: string }) {
  return (
    <g stroke={color} strokeWidth={1.5} strokeLinecap="round" opacity={0.6}>
      <line x1={x} y1={y} x2={x - flipX * BRACKET} y2={y} />
      <line x1={x} y1={y} x2={x} y2={y - flipY * BRACKET} />
    </g>
  );
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
  const color = STATE_COLOR[state];

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        style={{ width: size, height: size, filter: `drop-shadow(0 0 ${size * 0.12}px ${color}70)` }}
      >
        <svg viewBox="-50 -50 100 100" width={size} height={size}>
          <Bracket x={-CORNER} y={-CORNER} flipX={-1} flipY={-1} color={color} />
          <Bracket x={CORNER} y={-CORNER} flipX={1} flipY={-1} color={color} />
          <Bracket x={-CORNER} y={CORNER} flipX={-1} flipY={1} color={color} />
          <Bracket x={CORNER} y={CORNER} flipX={1} flipY={1} color={color} />

          <circle
            r={43}
            fill="none"
            stroke={color}
            strokeWidth={2}
            strokeDasharray="48 14 48 14"
            strokeLinecap="round"
            opacity={0.85}
          />
          <circle r={37} fill="none" stroke={color} strokeWidth={1} strokeDasharray="2 5" opacity={0.4} />

          {DOT_ANGLES.map((a) => {
            const rad = (a * Math.PI) / 180;
            return (
              <circle
                key={a}
                cx={43 * Math.cos(rad)}
                cy={43 * Math.sin(rad)}
                r={1.8}
                fill={color}
                opacity={0.9}
              />
            );
          })}

          <polygon points={HEX_POINTS} fill="none" stroke={color} strokeWidth={1.5} opacity={0.55} />
          {HEX_POINTS.split(" ").map((pt, i) => {
            const [x, y] = pt.split(",").map(Number);
            return <circle key={i} cx={x} cy={y} r={1.6} fill={color} opacity={0.8} />;
          })}
          <circle r={18} fill="url(#jarvis-core-gradient)" />
          <defs>
            <radialGradient id="jarvis-core-gradient">
              <stop offset="0%" stopColor="#ffffff" stopOpacity={0.9} />
              <stop offset="45%" stopColor={color} stopOpacity={0.95} />
              <stop offset="100%" stopColor={color} stopOpacity={0.15} />
            </radialGradient>
          </defs>
        </svg>
      </div>
      {showLabel && (
        <p className="text-[11px] font-semibold tracking-[0.2em]" style={{ color }}>
          {STATE_LABEL[state]}
        </p>
      )}
    </div>
  );
}
