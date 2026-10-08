import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const number = (value) => Number(value) || 0;

const tooltipStyle = {
  background: "#111827",
  border: "1px solid #374151",
  color: "#d6e4f0",
  fontFamily: "monospace",
};

const UNITS = {
  "Température": " °C",
  "Humidité": " %",
};

function SensorPanel({ active, setActive, latest, serie }) {
  const readings = latest
    ? [
        { value: `${number(latest.temperature).toFixed(1)} °C`, label: "Température" },
        { value: `${number(latest.humidity).toFixed(1)} %`, label: "Humidité" },
        { value: `${number(latest.air_raw)}`, label: `Air · ${latest.air_level}` },
        { value: `${number(latest.rssi)} dBm`, label: "Wi-Fi RSSI" },
      ]
    : [];

  return (
    <div
      className={`panel dashboard-capteur
            ${active === "left" ? "expanded" : ""}
            ${active === "right" ? "collapsed" : ""}`}
      onClick={() => setActive(active === "left" ? null : "left")}
    >
      <h3 className="capteur-title">Capteurs</h3>

      {readings.length > 0 ? (
        <div className="flex-row">
          {readings.map((reading) => (
            <div className="cap-console" key={reading.label}>
              <h2>{reading.value}</h2>
              {reading.label}
            </div>
          ))}
        </div>
      ) : (
        <p className="empty-state">Aucune mesure reçue du boîtier.</p>
      )}

      {serie.length > 0 && (
        <p className="chart-caption">
          {serie.length} mesures — du {serie[0].fullLabel} au{" "}
          {serie[serie.length - 1].fullLabel}
        </p>
      )}

      <div className={`diagram-ligne ${serie.length === 0 ? "is-empty" : ""}`}>
        {serie.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={serie} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" />

                <XAxis
                  dataKey="label"
                  stroke="#6b7280"
                  tick={{ fontSize: 11 }}
                  minTickGap={28}
                />

                <YAxis
                  yAxisId="left"
                  domain={[0, 100]}
                  stroke="#6b7280"
                  tick={{ fontSize: 11 }}
                />

                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={[0, 1000]}
                  stroke="#6b7280"
                  tick={{ fontSize: 11 }}
                />

                <Tooltip
                  labelFormatter={(label, payload) =>
                    payload?.[0]?.payload.fullLabel ?? label
                  }
                  contentStyle={tooltipStyle}
                  formatter={(value, name) => [`${value}${UNITS[name] ?? ""}`, name]}
                />

                <Legend wrapperStyle={{ fontSize: 12 }} />

                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="temperature"
                  name="Température"
                  stroke="#00ff66"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="humidity"
                  name="Humidité"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="air"
                  name="Air brut"
                  stroke="#ffc107"
                  strokeWidth={2}
                  strokeDasharray="5 4"
                  dot={false}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </>
        ) : (
          <p className="empty-state">En attente de la première mesure…</p>
        )}
      </div>
    </div>
  );
}

export default SensorPanel;
