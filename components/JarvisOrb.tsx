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
          <g style={{ color: "#ff9d3d" }}>
            <Ticks count={36} radius={48} active={active} />
          </g>
          <circle
            r={44}
            fill="none"
            stroke={color}
            strokeWidth={1.5}
            strokeDasharray="46 14 22 10 60 18 34 12"
            strokeLinecap="round"
            opacity={0.85}
            transform="rotate(-15)"
          />
          <circle
            r={40}
            fill="none"
            stroke="#ff9d3d"
            strokeWidth={2.5}
            strokeDasharray="24 400"
            strokeLinecap="round"
            opacity={active ? 0.95 : 0.6}
            transform="rotate(205)"
          />
          <circle
            r={34}
            fill="none"
            stroke={color}
            strokeWidth={1}
            strokeDasharray="18 10 28 14 16 8 40 20"
            strokeLinecap="round"
            opacity={0.45}
            transform="rotate(35)"
          />
          <circle r={28} fill="none" stroke={color} strokeWidth={0.5} opacity={0.25} />
          <rect x={-1.5} y={-46.5} width={3} height={3} fill={color} opacity={0.8} transform="rotate(-58)" />
          <rect x={-1.5} y={-46.5} width={3} height={3} fill={color} opacity={0.5} transform="rotate(-48)" />
          <circle
            r={20}
            fill="url(#jarvis-core-gradient)"
            className={`jarvis-core ${active ? "is-active" : ""}`}
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
