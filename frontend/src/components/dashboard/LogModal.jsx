function LogModal({ selectedEvent, setSelectedEvent }) {
  return (
    selectedEvent && (
      <div className="modal-overlay" onClick={() => setSelectedEvent(null)}>
        <div className="log-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <div>
              <h2>{selectedEvent.title}</h2>
              <span>
                {selectedEvent.date} · {selectedEvent.device_id}
              </span>
            </div>

            <button
              className="modal-close"
              onClick={() => setSelectedEvent(null)}
              aria-label="Fermer"
            >
              ×
            </button>
          </div>

          <div className="event-banner">
            <div className={`event-icon ${selectedEvent.type.toLowerCase()}`}>
              {selectedEvent.type === "ERROR" ? "!" : "✓"}
            </div>

            <div>
              <h3>{selectedEvent.message}</h3>
              <span>{selectedEvent.source}</span>
            </div>

            <strong>{selectedEvent.type}</strong>
          </div>

          <div className="event-info">
            <div>
              <label>Appareil</label>
              <strong>{selectedEvent.device_id}</strong>
            </div>

            <div>
              <label>Date & heure</label>
              <strong>{selectedEvent.date}</strong>
            </div>

            <div>
              <label>Source API</label>
              <strong>{selectedEvent.endpoint}</strong>
            </div>

            <div>
              <label>Enregistrement</label>
              <strong>{selectedEvent.reference}</strong>
            </div>
          </div>

          <div className="analysis">
            <h3>Détails</h3>
            <p>{selectedEvent.details}</p>
          </div>

          {selectedEvent.type === "ERROR" && (
            <div className="action-warning">
              <span>⚠</span>

              <div>
                <strong>Action recommandée</strong>
                <p>
                  Vérifier le flux caméra et contrôler l'accès au site
                  {" "}({selectedEvent.source}, {selectedEvent.device_id}).
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  );
}

export default LogModal;
