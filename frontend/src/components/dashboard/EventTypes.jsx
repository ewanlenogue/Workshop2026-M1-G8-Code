function EventTypes({ stats }) {
  return (
    <div className="actioneur">
      <div className="logs-header">
        <h2>Événements</h2>
        <p>{stats.total} en base</p>
      </div>

      <div className="attack-types">
        {stats.items.map((item) => (
          <div className="attack-row" key={item.name}>
            <span className="attack-square" style={{ backgroundColor: item.color }} />

            <span className="attack-name">
              {item.name}
              <span className="attack-count">{item.count}</span>
            </span>

            <span className="attack-percentage">{item.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EventTypes;
