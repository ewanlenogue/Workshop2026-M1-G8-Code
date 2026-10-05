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
          
        </div>

        <div className="journal">
          <h2>Journal</h2>
          <div className="console">
            <p>[INFO] Serveur connecté</p>
            <p>[SUCCESS] Données récupérées</p>
            <p>[ERROR] Connexion échouée</p>
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
    </div>
  );
}

export default Dashboard;
