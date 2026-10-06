function LogModal({ selectedLog, setSelectedLog }) {
  return (
    selectedLog && (
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
    )
  );
}

export default LogModal;
