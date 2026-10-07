function Journal({ events, setSelectedEvent }) {
  return (
    <div className="journal">
      <div className="logs-header">
        <h2>Journal</h2>
        <p>{events.length} événements</p>
      </div>

      <div className="console">
        {events.length === 0 ? (
          <p className="empty-state">Aucun événement remonté par le backend.</p>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className={`log-item log-${event.type.toLowerCase()}`}
              onClick={() => setSelectedEvent(event)}
            >
              <span className="log-type">[{event.type}]</span>
              <span className="log-message">
                <strong>{event.title}</strong> — {event.message}
              </span>
              <span className="log-time">{event.time}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Journal;
