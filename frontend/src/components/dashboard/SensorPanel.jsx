import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function SensorPanel({ active, setActive, data }) {
  return (
    <div
      className={`panel dashboard-capteur
            ${active === "left" ? "expanded" : ""} 
            ${active === "right" ? "collapsed" : ""}`}
      onClick={() => setActive(active === "left" ? null : "left")}
    >
      <h3 className="capteur-title">Capteurs</h3>

      <div className="flex-row">
        <div className="cap-console">
          <h2>25°C</h2>
          Temp
        </div>
        <div className="cap-console">
          <h2>60%</h2>
          Humidité
        </div>
        <div className="cap-console">
          <h2>1013 hPa</h2>
          Pression
        </div>
      </div>

      <div className="diagram-ligne">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" />

            <XAxis dataKey="day" stroke="#6b7280" />

            <YAxis domain={[0, 100]} stroke="#6b7280" />

            <Tooltip
              contentStyle={{
                background: "#111827",
                border: "1px solid #374151",
                color: "#00ff66",
                fontFamily: "monospace",
              }}
            />

            <Line
              type="monotone"
              dataKey="score"
              stroke="#00ff66"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default SensorPanel;
