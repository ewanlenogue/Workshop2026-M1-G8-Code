function Journal({ logs, setSelectedLog }) {
  return (
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
  );
}

export default Journal;
