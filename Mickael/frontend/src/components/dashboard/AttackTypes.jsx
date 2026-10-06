function AttackTypes({ attackTypes }) {
  return (
    <div className="actioneur">
      <h2>Type d'attaque</h2>

      <div className="attack-types">
        {attackTypes.map((attack) => (
          <div className="attack-row" key={attack.name}>
            <span
              className="attack-square"
              style={{ backgroundColor: attack.color }}
            />

            <span className="attack-name">{attack.name}</span>

            <span className="attack-percentage">{attack.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AttackTypes;
