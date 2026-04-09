import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer, Dot,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass px-3 py-2 text-xs border border-white/10 rounded-xl">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {p.name}: {p.value} {p.payload.unit || 'units'}
        </p>
      ))}
    </div>
  );
};

const CustomDot = (props) => {
  const { cx, cy, payload } = props;
  if (payload.actual === undefined || payload.actual === null) return null;
  const color = payload.actual <= payload.target ? '#14b8a6' :
    payload.actual <= payload.target * 1.2 ? '#f59e0b' : '#ef4444';
  return <circle cx={cx} cy={cy} r={5} fill={color} stroke="#06060F" strokeWidth={2} />;
};

export default function StaircaseChart({ plan }) {
  if (!plan) return null;

  const { weeklySchedule, logs, baselineDaily, unit } = plan;

  // Build chart data from weekly schedule + actual logs
  const data = (weeklySchedule || []).map((day, idx) => {
    const dayDate = new Date(day.date);
    dayDate.setHours(0, 0, 0, 0);
    const log = (logs || []).find(l => {
      const d = new Date(l.date);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === dayDate.getTime();
    });
    return {
      name: dayDate.toLocaleDateString('en-US', { weekday: 'short' }),
      target: day.target,
      actual: log ? log.consumed : null,
      unit,
    };
  });

  // Add baseline as first point
  const chartData = [
    { name: 'Start', target: baselineDaily, actual: null, unit },
    ...data,
  ];

  return (
    <div className="w-full h-52">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="targetGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="name"
            tick={{ fill: '#64748b', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#64748b', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4" />
          {/* Target staircase */}
          <Area
            type="stepAfter"
            dataKey="target"
            name="Target"
            stroke="#14b8a6"
            strokeWidth={2}
            fill="url(#targetGrad)"
            dot={false}
            activeDot={{ r: 4, fill: '#14b8a6' }}
          />
          {/* Actual consumption dots */}
          <Area
            type="monotone"
            dataKey="actual"
            name="Actual"
            stroke="none"
            fill="none"
            dot={<CustomDot />}
            activeDot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
