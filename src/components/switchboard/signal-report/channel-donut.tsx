type Segment = {
  label: string;
  pct: number;
  color: string;
};

type Props = {
  segments: Segment[];
  size?: number;
  thickness?: number;
};

// TZ-tone channel palette. Blue + neutrals. Restraint over rainbow.
export const CHANNEL_COLORS: Record<string, string> = {
  "Organic Search": "#1E40AF",
  Direct: "#0F1C3F",
  Referral: "#2563EB",
  "Organic Social": "#64748B",
  "Paid Search": "#1E3A8A",
  Email: "#475569",
  "Paid Social": "#3B82F6",
  Display: "#94A3B8",
  Other: "#CBD5E1",
};

export function paletteFor(i: number): string {
  const order = ["#1E40AF", "#0F1C3F", "#2563EB", "#64748B", "#1E3A8A", "#475569", "#CBD5E1"];
  return order[i % order.length];
}

export function ChannelDonut({ segments, size = 200, thickness = 28 }: Props) {
  if (!segments || segments.length === 0) return null;

  const total = segments.reduce((acc, s) => acc + s.pct, 0) || 100;
  const r = size / 2 - thickness / 2;
  const c = size / 2;
  const circumference = 2 * Math.PI * r;

  let offset = 0;
  const arcs = segments.map((s, i) => {
    const portion = s.pct / total;
    const length = portion * circumference;
    const dashArray = `${length} ${circumference - length}`;
    const dashOffset = -offset;
    offset += length;
    return (
      <circle
        key={`${s.label}-${i}`}
        cx={c}
        cy={c}
        r={r}
        fill="none"
        stroke={s.color}
        strokeWidth={thickness}
        strokeDasharray={dashArray}
        strokeDashoffset={dashOffset}
        transform={`rotate(-90 ${c} ${c})`}
      />
    );
  });

  const dominant = [...segments].sort((a, b) => b.pct - a.pct)[0];

  return (
    <div className="inline-flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={c}
            cy={c}
            r={r}
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.06"
            strokeWidth={thickness}
          />
          {arcs}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-gray-500 dark:text-gray-400">
            {dominant.label}
          </p>
          <p className="font-semibold text-2xl tracking-tight text-gray-900 dark:text-white">
            {Math.round(dominant.pct)}%
          </p>
        </div>
      </div>
    </div>
  );
}
