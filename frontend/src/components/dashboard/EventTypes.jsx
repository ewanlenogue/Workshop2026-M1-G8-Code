import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const tooltipStyle = {
  background: "#111827",
  border: "1px solid #374151",
  color: "#d6e4f0",
  fontFamily: "monospace",
};

function EventTypes({ stats }) {
  return (
    <div className="actioneur">
      <div className="logs-header">
        <h2>Événements</h2>
        <p>{stats.total} en base</p>
      </div>

      {/* Répartition visuelle des mêmes données que la liste ci-dessous */}
      <div className="events-pie">
        {stats.total > 0 ? (
          <>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
                <Pie
                  data={stats.items}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius="56%"
                  outerRadius="90%"
                  paddingAngle={2}
                  stroke="#001f55"
                  strokeWidth={2}
                  label={false}
                  labelLine={false}
                  isAnimationActive={false}
                >
                  {stats.items.map((item) => (
                    <Cell key={item.name} fill={item.color} />
                  ))}
                </Pie>

                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value, name) => [`${value} événement(s)`, name]}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="pie-center">
              <strong>{stats.total}</strong>
              <span>événements</span>
            </div>
          </>
        ) : (
          <p className="empty-state">Aucun événement en base.</p>
        )}
      </div>

      <div className="attack-types">
        {stats.items.map((item) => (
          <div className="attack-row" key={item.name}>
            <span className="attack-square" style={{ backgroundColor: item.color }} />

            <span className="attack-name">
              {item.name}
              <span className="attack-count">{item.count}</span>
            </span>

            <span className="attack-percentage">{item.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EventTypes;
