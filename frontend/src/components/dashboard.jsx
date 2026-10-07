import { useCallback, useEffect, useMemo, useState } from "react";
import "../styles/dashboard.css";
import { getDashboardData, sendCommand } from "../api";
import { buildJournal, buildStats, buildSerie, formatUptime } from "../events";
import SensorPanel from "./dashboard/SensorPanel.jsx";
import CameraPanel from "./dashboard/CameraPanel.jsx";
import EventTypes from "./dashboard/EventTypes.jsx";
import Journal from "./dashboard/Journal.jsx";
import Buzzer from "./dashboard/Buzzer.jsx";
import LogModal from "./dashboard/LogModal.jsx";

const REFRESH_MS = 15000;

function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [active, setActive] = useState(null);
  const [alert, setAlert] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [command, setCommand] = useState(null);

  const load = useCallback(async () => {
    try {
      const payload = await getDashboardData();
      setData(payload);
      setError(null);
      setUpdatedAt(new Date());
    } catch (loadError) {
      setError(loadError.message);
    }
  }, []);

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect -- premier chargement asynchrone
    load();
    const timer = setInterval(load, REFRESH_MS);
    return () => clearInterval(timer);
  }, [load]);

  const telemetry = data?.telemetry ?? [];
  const movements = data?.movements ?? [];

  const latest = telemetry[0] ?? null;
  const lastMovement = movements[0] ?? null;
  const zoneAlert = lastMovement ? Number(lastMovement.motion) === 1 : false;

  const journal = useMemo(() => buildJournal(data ?? {}), [data]);
  const stats = useMemo(() => buildStats(data ?? {}), [data]);
  const serie = useMemo(() => buildSerie(data?.telemetry ?? []), [data]);

  const runCommand = useCallback(async (action) => {
    setCommand({ action, pending: true });

    try {
      await sendCommand(action);
      setCommand({ action, pending: false, ok: true });
    } catch (commandError) {
      setCommand({ action, pending: false, ok: false, message: commandError.message });
    }
  }, []);

  const toggleBuzzer = () => {
    setAlert((current) => {
      runCommand(current ? "buzzer_off" : "buzzer_on");
      return !current;
    });
  };

  const openDoor = () => runCommand("open_door");

  const device = latest?.device_id ?? "appareil inconnu";

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="dashboard-title">
          <h1>SENTINEL X</h1>
          <p>Centre de commandement</p>
        </div>

        <div className={`dashboard-status ${error ? "offline" : "online"}`}>
          <span className="status-dot" />
          <span>
            {error
              ? "Backend injoignable"
              : `${device} · uptime ${latest ? formatUptime(latest.uptime_s) : "—"} · MAJ ${
                  updatedAt
                    ? updatedAt.toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })
                    : "—"
                }`}
          </span>
        </div>
      </header>

      {error && (
        <div className="api-banner error">
          <span>⚠</span>
          <p>{error}</p>
          <button type="button" onClick={load}>
            Réessayer
          </button>
        </div>
      )}

      {!error && stats.total === 0 && data && (
        <div className="api-banner info">
          <span>ℹ</span>
          <p>Backend connecté mais aucune donnée en base (voir « npm run seed »).</p>
        </div>
      )}

      <div className="section1">
        <SensorPanel active={active} setActive={setActive} latest={latest} serie={serie} />
        <CameraPanel active={active} setActive={setActive} />
      </div>

      <div className="section2">
        <EventTypes stats={stats} />
        <Journal events={journal} setSelectedEvent={setSelectedEvent} />
        <Buzzer
          alert={alert}
          zoneAlert={zoneAlert}
          onToggle={toggleBuzzer}
          onOpenDoor={openDoor}
          command={command}
        />
      </div>

      <LogModal selectedEvent={selectedEvent} setSelectedEvent={setSelectedEvent} />
    </div>
  );
}

export default Dashboard;
