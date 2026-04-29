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
import { TrendingUp, PieChart as PieIcon, BarChart3 } from "lucide-react";

const TEAL = "#c1d722";
const CORAL = "#8aa300";
const PURPLE = "#6ea94e";
const MUTED = "#7b8ca6";

const chartTooltipStyle = {
  contentStyle: {
    background: "rgba(8,8,26,0.95)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "0.75rem",
    color: "#e8f0fe",
    fontSize: "0.75rem",
    fontFamily: '"Space Mono", monospace',
    backdropFilter: "blur(12px)",
    boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
  },
  itemStyle: { color: "#e8f0fe" },
};

export default function AnalyticsDashboard({ analytics, loading }) {
  if (loading) {
    return (
      <section className="py-6" id="analytics-section">
        <div className="flex items-center gap-2.5 mb-6">
          <div
            className="w-3 h-3 rounded-full"
            style={{
              background: "linear-gradient(135deg, #6ea94e, #747b46)",
              boxShadow: "0 0 10px rgba(139,92,246,0.3)",
            }}
          />
          <h2
            className="text-xl font-bold tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Analytics
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-6">
              <div className="skeleton h-56 rounded-xl" />
            </div>
          ))}
        </div>
      </section>
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
    <section className="py-6" id="analytics-section">
      {/* Section Header */}
      <div className="flex items-center gap-2.5 mb-2">
        <div
          className="w-3 h-3 rounded-full"
          style={{
            background: "linear-gradient(135deg, #6ea94e, #747b46)",
            boxShadow: "0 0 10px rgba(139,92,246,0.3)",
          }}
        />
        <h2
          className="text-xl font-bold tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Analytics
        </h2>
      </div>
      <p className="text-sm mb-6" style={{ color: "var(--color-muted)" }}>
        Real-time insights from prediction data
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* ── Risk Score Trend (Line) ── */}
        <motion.div
          className="glass-card p-6"
          whileHover={{ y: -4 }}
          transition={{ duration: 0.3 }}
        >
          <h3
            className="text-sm font-bold mb-4 flex items-center gap-2"
            style={{ fontFamily: "var(--font-display)" }}
          >
            <TrendingUp size={16} style={{ color: TEAL }} />
            Risk Score Trend
          </h3>
          <div className="h-52">
            {formattedTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formattedTrend}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.04)"
                  />
                  <XAxis
                    dataKey="idx"
                    tick={{ fill: MUTED, fontSize: 10, fontFamily: '"Space Mono"' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: MUTED, fontSize: 10, fontFamily: '"Space Mono"' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip {...chartTooltipStyle} />
                  <Line
                    type="monotone"
                    dataKey="risk"
                    stroke={TEAL}
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: TEAL, strokeWidth: 0 }}
                    activeDot={{ r: 5, stroke: TEAL, strokeWidth: 2, fill: "#050510" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-sm" style={{ color: "var(--color-muted)" }}>
                No trend data yet
              </div>
            )}
          </div>
        </motion.div>

        {/* ── Distribution (Donut) ── */}
        <motion.div
          className="glass-card p-6"
          whileHover={{ y: -4 }}
          transition={{ duration: 0.3 }}
        >
          <h3
            className="text-sm font-bold mb-4 flex items-center gap-2"
            style={{ fontFamily: "var(--font-display)" }}
          >
            <PieIcon size={16} style={{ color: PURPLE }} />
            Disease vs Healthy
          </h3>
          <div className="h-52">
            {distribution.disease || distribution.healthy ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={72}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={{ stroke: "rgba(255,255,255,0.15)" }}
                  >
                    <Cell fill={CORAL} />
                    <Cell fill={TEAL} />
                  </Pie>
                  <Tooltip {...chartTooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-sm" style={{ color: "var(--color-muted)" }}>
                No distribution data yet
              </div>
            )}
          </div>
        </motion.div>

        {/* ── Risk by Age Group (Bar) ── */}
        <motion.div
          className="glass-card p-6"
          whileHover={{ y: -4 }}
          transition={{ duration: 0.3 }}
        >
          <h3
            className="text-sm font-bold mb-4 flex items-center gap-2"
            style={{ fontFamily: "var(--font-display)" }}
          >
            <BarChart3 size={16} style={{ color: "#747b46" }} />
            Risk by Age Group
          </h3>
          <div className="h-52">
            {ageGroups.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ageGroups}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.04)"
                  />
                  <XAxis
                    dataKey="group"
                    tick={{ fill: MUTED, fontSize: 10, fontFamily: '"Space Mono"' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: MUTED, fontSize: 10, fontFamily: '"Space Mono"' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip {...chartTooltipStyle} />
                  <Bar dataKey="avgRisk" radius={[6, 6, 0, 0]}>
                    {ageGroups.map((_, i) => (
                      <Cell
                        key={i}
                        fill={i % 3 === 0 ? TEAL : i % 3 === 1 ? PURPLE : CORAL}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-sm" style={{ color: "var(--color-muted)" }}>
                No age group data yet
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

