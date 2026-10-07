import { useState } from "react";
import "../styles/dashboard.css";
import SensorPanel from "./dashboard/SensorPanel.jsx";
import CameraPanel from "./dashboard/CameraPanel.jsx";
import AttackTypes from "./dashboard/AttackTypes.jsx";
import Journal from "./dashboard/Journal.jsx";
import Buzzer from "./dashboard/Buzzer.jsx";
import LogModal from "./dashboard/LogModal.jsx";

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
        <SensorPanel active={active} setActive={setActive} data={data} />
        <CameraPanel active={active} setActive={setActive} />
      </div>

      <div className="section2">
        <AttackTypes attackTypes={attackTypes} />
        <Journal logs={logs} setSelectedLog={setSelectedLog} />
        <Buzzer alert={alert} setAlert={setAlert} />
      </div>

      <LogModal selectedLog={selectedLog} setSelectedLog={setSelectedLog} />
    </div>
  );
}

export default Dashboard;
