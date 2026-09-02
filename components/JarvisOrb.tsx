"use client";

export type JarvisState = "idle" | "thinking" | "speaking";

const STATE_LABEL: Record<JarvisState, string> = {
  idle: "HAZIR",
  thinking: "İŞLENİYOR",
  speaking: "YANITLIYOR",
};

const STATE_COLOR: Record<JarvisState, string> = {
  idle: "#4fc3ff",
  thinking: "#ff9d3d",
  speaking: "#4fc3ff",
};

function Ticks({ count, radius, active }: { count: number; radius: number; active: boolean }) {
  const ticks = Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * 360;
    const long = i % 3 === 0;
    return (
      <line
        key={i}
        x1={0}
        y1={-radius}
        x2={0}
        y2={-(radius - (long ? 8 : 4))}
        stroke="currentColor"
        strokeWidth={long ? 1.5 : 1}
        transform={`rotate(${angle})`}
        opacity={active ? 0.9 : 0.4}
      />
    );
  });
  return <>{ticks}</>;
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
        style={{ width: size, height: size, filter: `drop-shadow(0 0 ${size * 0.12}px ${color}66)` }}
      >
        <svg viewBox="-50 -50 100 100" width={size} height={size} className="overflow-visible">
          <g className={`jarvis-ring-ccw ${active ? "is-active" : ""}`} style={{ color: "#ff9d3d" }}>
            <Ticks count={36} radius={48} active={active} />
          </g>
          <circle
            r={38}
            fill="none"
            stroke={color}
            strokeWidth={1}
            strokeDasharray="3 6"
            className={`jarvis-ring-cw ${active ? "is-active" : ""}`}
            opacity={0.7}
          />
          <circle r={30} fill="none" stroke={color} strokeWidth={0.75} opacity={0.35} />
          <circle
            r={20}
            fill="url(#jarvis-core-gradient)"
            className="jarvis-core"
            style={{ transformOrigin: "center" }}
          />
          <defs>
            <radialGradient id="jarvis-core-gradient">
              <stop offset="0%" stopColor={color} stopOpacity={0.95} />
              <stop offset="70%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </radialGradient>
          </defs>
        </svg>
        {state === "speaking" && (
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
