import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "../styles/dashboard.css";

function Dashboard() {
  // const [users, setMessage] = useState([]);

  // useEffect(() => {
  //   fetch("http://localhost:3000/api/users")
  //     .then((res) => res.json())
  //     .then((data) => setMessage(data)) // Assuming you want to display all users
  //     .catch((error) => console.error(error));
  // }, []);
  const data = [
    { day: "Lun", score: 20 },
    { day: "Mar", score: 35 },
    { day: "Mer", score: 28 },
    { day: "Jeu", score: 65 },
    { day: "Ven", score: 82 },
    { day: "Sam", score: 70 },
    { day: "Dim", score: 45 },
  ];
  const [active, setActive] = useState(null);
  const [alert, setAlert] = useState(false);

  const attackTypes = [
    {
      name: "Brute Force",
      percentage: 47.4,
      color: "#ff3b4b",
    },
    {
      name: "SQL Injection",
      percentage: 21.1,
      color: "#ffc107",
    },
    {
      name: "XSS",
      percentage: 13.2,
      color: "#1683ff",
    },
    {
      name: "Scan de ports",
      percentage: 10.5,
      color: "#8b4de8",
    },
    {
      name: "Autres",
      percentage: 7.9,
      color: "#8ba9c5",
    },
  ];
  const logs = [
    {
      id: 1,
      type: "INFO",
      message: "Niveau détecté : 21°C",
      time: "14:28:12",
      date: "08/04/2026",
      source: "Backend API",
      ip: "192.168.1.45",
      endpoint: "/api/server",
      method: "GET",
      description: "Le serveur backend est correctement connecté.",
    },
    {
      id: 2,
      type: "SUCCESS",
      message: "Données récupérées",
      time: "14:28:15",
      date: "08/04/2026",
      source: "Sensor API",
      ip: "192.168.1.20",
      endpoint: "/api/sensors",
      method: "GET",
      description: "Les données des capteurs ont été récupérées avec succès.",
    },
    {
      id: 3,
      type: "ERROR",
      message: "Connexion échouée",
      time: "14:29:03",
      date: "08/04/2026",
      source: "Authentication",
      ip: "192.168.1.145",
      endpoint: "/login",
      method: "POST",
      description:
        "Plusieurs tentatives de connexion ont échoué depuis cette adresse IP.",
    },
    {
      id: 4,
      type: "ERROR",
      message: "Connexion échouée",
      time: "14:29:03",
      date: "08/04/2026",
      source: "Authentication",
      ip: "192.168.1.145",
      endpoint: "/login",
      method: "POST",
      description:
        "Plusieurs tentatives de connexion ont échoué depuis cette adresse IP.",
    },
  ];
  const [selectedLog, setSelectedLog] = useState(null);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>SENTINEL X</h1>
        <p>Centre de commandement</p>
      </div>

      <div className="section1">
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
            <ResponsiveContainer width="100%" height={300}>
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

        <div
          className={`panel dashboard-vision ${active === "right" ? "expanded" : ""} ${
            active === "left" ? "collapsed" : ""
          }`}
          onClick={() => setActive(active === "right" ? null : "right")}
        >
          <div className="camera">
            <h3>CAMÉRA (VISION IA)</h3>
          </div>
          <div className="video">
            <video className="security-video" autoPlay muted loop playsInline>
              {/* <source src="/assetssecurity.mp4" type="video/mp4" /> */}
            </video>
          </div>
        </div>
      </div>

      <div className="section2">
        <div className="actioneur">
          <h2>Type d'attaque</h2>

          <div className="attack-types">
            {attackTypes.map((attack) => (
              <div className="attack-row" key={attack.name}>
                <span
                  className="attack-square"
                  style={{ backgroundColor: attack.color }}
                />

                <span className="attack-name">{attack.name}</span>

                <span className="attack-percentage">{attack.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="journal">
          <div className="logs-header">
            <h2>Journal</h2>
            <p>{logs.length} événements</p>
          </div>
          <div className="console">
            {logs.map((log) => (
              <div
                key={log.id}
                className={`log-item log-${log.type.toLowerCase()}`}
                onClick={() => setSelectedLog(log)}
              >
                <span className="log-type">[{log.type}]</span>
                <span className="log-message">{log.message}</span>
                <span className="log-time">{log.time}</span>
              </div>
            ))}
          </div>

        </div>

        <div className="buzzer-container">
          <div className={`warning-light ${alert ? "active" : ""}`}></div>

          <button
            className={`buzzer ${alert ? "pressed" : ""}`}
            onClick={() => setAlert(!alert)}
          >
            ⚠<span>BUZZER</span>
          </button>

          <p className={alert ? "alert-on" : ""}>
            {alert ? "⚠ ALERT ACTIVE" : "SYSTEM NORMAL"}
          </p>
        </div>
      </div>

      {/* MODAL */}
      {selectedLog && (
        <div className="modal-overlay" onClick={() => setSelectedLog(null)}>
          <div className="log-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>Détails de l'événement</h2>
                <span>
                  {selectedLog.date} {selectedLog.time}
                </span>
              </div>

              <button
                className="modal-close"
                onClick={() => setSelectedLog(null)}
              >
                ×
              </button>
            </div>

            <div className="event-banner">
              <div className={`event-icon ${selectedLog.type.toLowerCase()}`}>
                {selectedLog.type === "ERROR" ? "!" : "✓"}
              </div>

              <div>
                <h3>{selectedLog.message}</h3>
                <span>{selectedLog.source}</span>
              </div>

              <strong>{selectedLog.type}</strong>
            </div>

            <div className="event-info">
              <div>
                <label>Adresse IP</label>
                <strong>{selectedLog.ip}</strong>
              </div>

              <div>
                <label>Date & heure</label>
                <strong>
                  {selectedLog.date} {selectedLog.time}
                </strong>
              </div>

              <div>
                <label>Endpoint</label>
                <strong>{selectedLog.endpoint}</strong>
              </div>

              <div>
                <label>Méthode</label>
                <strong>{selectedLog.method}</strong>
              </div>
            </div>

            <div className="analysis">
              <h3>Analyse</h3>

              <p>{selectedLog.description}</p>
            </div>

            {selectedLog.type === "ERROR" && (
              <div className="action-warning">
                <span>⚠</span>

                <div>
                  <strong>Action recommandée</strong>
                  <p>
                    Vérifier l'adresse IP et analyser les tentatives de
                    connexion.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
