import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

const TEAL = "#c1d722";
const CORAL = "#8aa300";
const MUTED = "#7b8ca6";

const chartTooltipStyle = {
  contentStyle: {
    background: "#1a2332",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "0.5rem",
    color: "#e8f0fe",
    fontSize: "0.8rem",
    fontFamily: '"JetBrains Mono", monospace',
  },
  itemStyle: { color: "#e8f0fe" },
};

export default function AnalyticsSection({ analytics, loading }) {
  if (loading) {
    return (
      <motion.div
        className="glass-card p-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <h2 className="text-lg font-bold font-[family-name:var(--font-heading)] mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#c1d722] inline-block" />
          Analytics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-52 rounded-xl" />
          ))}
        </div>
      </motion.div>
    );
  }

  if (!analytics) return null;

  const { riskTrend = [], distribution = {}, ageGroups = [] } = analytics;

  const pieData = [
    { name: "Disease", value: distribution.disease || 0 },
    { name: "Healthy", value: distribution.healthy || 0 },
  ];

  const formattedTrend = riskTrend.map((d, i) => ({
    idx: i + 1,
    risk: d.riskScore,
    time: new Date(d.time).toLocaleDateString(),
  }));

  return (
    <motion.div
      className="glass-card p-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.8 }}
    >
      <h2 className="text-lg font-bold font-[family-name:var(--font-heading)] mb-5 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#c1d722] inline-block" />
        Analytics
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Score Trend */}
        <div>
          <h3 className="text-sm font-semibold text-[var(--color-muted)] mb-3 font-[family-name:var(--font-heading)]">
            Risk Score Trend (Last 20)
          </h3>
          <div className="h-52">
            {formattedTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formattedTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="idx" tick={{ fill: MUTED, fontSize: 11 }} axisLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fill: MUTED, fontSize: 11 }} axisLine={false} />
                  <Tooltip {...chartTooltipStyle} />
                  <Line
                    type="monotone"
                    dataKey="risk"
                    stroke={TEAL}
                    strokeWidth={2}
                    dot={{ r: 3, fill: TEAL }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-[var(--color-muted)]">
                No data yet
              </div>
            )}
          </div>
        </div>

        {/* Distribution Pie */}
        <div>
          <h3 className="text-sm font-semibold text-[var(--color-muted)] mb-3 font-[family-name:var(--font-heading)]">
            Prediction Distribution
          </h3>
          <div className="h-52">
            {(distribution.disease || distribution.healthy) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    <Cell fill={CORAL} />
                    <Cell fill={TEAL} />
                  </Pie>
                  <Tooltip {...chartTooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-[var(--color-muted)]">
                No data yet
              </div>
            )}
          </div>
        </div>

        {/* Age Group Bar */}
        <div>
          <h3 className="text-sm font-semibold text-[var(--color-muted)] mb-3 font-[family-name:var(--font-heading)]">
            Avg Risk by Age Group
          </h3>
          <div className="h-52">
            {ageGroups.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ageGroups}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="group" tick={{ fill: MUTED, fontSize: 11 }} axisLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fill: MUTED, fontSize: 11 }} axisLine={false} />
                  <Tooltip {...chartTooltipStyle} />
                  <Bar dataKey="avgRisk" fill={TEAL} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-[var(--color-muted)]">
                No data yet
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

