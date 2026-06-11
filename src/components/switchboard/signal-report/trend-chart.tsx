type Props = {
  data: number[];
  height?: number;
  stroke?: string;
  fill?: string;
};

const W = 700;
const PAD = { t: 16, r: 16, b: 24, l: 44 };

function formatGridLabel(v: number): string {
  if (v >= 1000) return `${(v / 1000).toFixed(1)}K`;
  return Math.round(v).toString();
}

export function TrendChart({
  data,
  height = 160,
  stroke = "#1E40AF",
  fill = "#1E40AF",
}: Props) {
  if (!data || data.length < 2) {
    return (
      <div
        className="flex items-center justify-center rounded-xl border border-gray-200 dark:border-navy-light/40 text-xs text-gray-500 dark:text-gray-400"
        style={{ height }}
      >
        Not enough data to chart yet
      </div>
    );
  }

  const max = Math.max(...data);
  const min = 0;
  const usableW = W - PAD.l - PAD.r;
  const usableH = height - PAD.t - PAD.b;
  const step = data.length > 1 ? usableW / (data.length - 1) : 0;

  const points = data.map((v, i) => {
    const x = PAD.l + i * step;
    const y = PAD.t + usableH - ((v - min) / (max - min || 1)) * usableH;
    return { x, y };
  });

  const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const area =
    `${path} L ${points[points.length - 1].x} ${PAD.t + usableH}` +
    ` L ${points[0].x} ${PAD.t + usableH} Z`;

  // Gridline values: 0, half, max
  const grid = [min, max / 2, max];

  return (
    <svg
      viewBox={`0 0 ${W} ${height}`}
      preserveAspectRatio="none"
      width="100%"
      height={height}
      role="img"
      aria-label="Sessions trend"
    >
      <defs>
        <linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fill} stopOpacity="0.32" />
          <stop offset="100%" stopColor={fill} stopOpacity="0" />
        </linearGradient>
      </defs>
      {grid.map((v) => {
        const y = PAD.t + usableH - ((v - min) / (max - min || 1)) * usableH;
        return (
          <g key={v}>
            <line
              x1={PAD.l}
              x2={W - PAD.r}
              y1={y}
              y2={y}
              stroke="currentColor"
              strokeOpacity="0.08"
              strokeDasharray="3 3"
            />
            <text
              x={PAD.l - 8}
              y={y + 4}
              textAnchor="end"
              fontFamily="var(--font-mono)"
              fontSize="10"
              fill="currentColor"
              fillOpacity="0.45"
            >
              {formatGridLabel(v)}
            </text>
          </g>
        );
      })}
      <path d={area} fill="url(#trend-fill)" />
      <path d={path} fill="none" stroke={stroke} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
