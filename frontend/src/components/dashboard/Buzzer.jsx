const ACTION_LABELS = {
  buzzer_on: "buzzer ON",
  buzzer_off: "buzzer OFF",
  open_door: "ouverture porte",
};

function Buzzer({ alert, zoneAlert, onToggle, onOpenDoor, command }) {
  const armed = alert || zoneAlert;

  let status = "ZONE SÉCURISÉE";
  if (alert) status = "⚠ ALARME ACTIVE";
  else if (zoneAlert) status = "⚠ MOUVEMENT DÉTECTÉ";

  return (
    <div className="buzzer-container">
      <div className={`warning-light ${armed ? "active" : ""}`}></div>

      <button
        className={`buzzer ${alert ? "pressed" : ""}`}
        onClick={onToggle}
        aria-pressed={alert}
      >
        ⚠<span>BUZZER</span>
      </button>

      <p className={armed ? "alert-on" : ""}>{status}</p>

      <button className="door-btn" onClick={onOpenDoor} disabled={command?.pending}>
        <span className="door-icon">🔓</span>
        <span>Ouvrir la porte</span>
      </button>

      {command && (
        <p className={`command-status ${command.pending ? "" : command.ok ? "ok" : "ko"}`}>
          {command.pending
            ? `Envoi « ${ACTION_LABELS[command.action]} »…`
            : command.ok
              ? `✓ Ordre « ${ACTION_LABELS[command.action] } » envoyé`
              : `✕ Échec : ${command.message}`}
        </p>
      )}
    </div>
  );
}

export default Buzzer;
