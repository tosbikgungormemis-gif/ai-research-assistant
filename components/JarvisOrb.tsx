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
