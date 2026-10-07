function Buzzer({ alert, setAlert }) {
  return (
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
  );
}

export default Buzzer;
