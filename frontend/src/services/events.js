export const API_SOURCES = {
  telemetry: { label: "Télémétrie", endpoint: "/api/v1/telemetrie" },
  movement: { label: "Capteur PIR", endpoint: "/api/v1/mouvement" },
  fingerprint: { label: "Capteur d'empreintes", endpoint: "/api/v1/empreinte" },
};

const number = (value) => Number(value) || 0;

const frDateTime = (iso) => new Date(iso).toLocaleString("fr-FR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const frTime = (iso) =>
  new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

export const formatUptime = (seconds) => {
  const total = number(seconds);
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);

  if (days > 0) return `${days} j ${hours} h`;
  if (hours > 0) return `${hours} h ${minutes} min`;
  return `${minutes} min`;
};

const buildTelemetryEvent = (row) => {
  const temperature = number(row.temperature);
  const humidity = number(row.humidity);
  const airRaw = number(row.air_raw);
  const level = String(row.air_level || "");
  const critical = level.toLowerCase() === "critique";
  const raised = !critical && level.toLowerCase() !== "normal";

  const details =
    `Température ${temperature.toFixed(2)} °C · Humidité ${humidity.toFixed(2)} % · ` +
    `Air brut ${airRaw} (${level}) · RSSI ${row.rssi} dBm · ` +
    `uptime ${formatUptime(row.uptime_s)}`;

  if (critical || raised) {
    return {
      id: `telemetry-${row.id}`,
      kind: "telemetry",
      type: critical ? "ERROR" : "INFO",
      title: critical ? "Qualité de l'air critique" : "Qualité de l'air dégradée",
      message: `Air brut ${airRaw} (${level})`,
      details,
      received_at: row.received_at,
      device_id: row.device_id,
      reference: `telemetry #${row.id}`,
      alert: critical,
    };
  }

  return null;
};

const buildMovementEvent = (row) => {
  if (!number(row.motion)) return null;

  return {
    id: `movement-${row.id}`,
    kind: "movement",
    type: "INFO",
    title: "Mouvement détecté",
    message: "Présence détectée par le capteur PIR",
    details:
      `Mouvement détecté à ` +
      `${new Date(number(row.timestamp) * 1000).toLocaleString("fr-FR")} ` +
      `(timestamp Unix ${row.timestamp})`,
    received_at: row.received_at,
    device_id: row.device_id,
    reference: `mouvement #${row.id}`,
    alert: true,
  };
};

const buildFingerprintEvent = (row) => {
  const intrus = number(row.intrus) === 1;
  const fingerprintId =
    row.fingerprint_id === null || row.fingerprint_id === undefined
      ? null
      : number(row.fingerprint_id);

  return {
    id: `fingerprint-${row.id}`,
    kind: "fingerprint",
    type: intrus ? "ERROR" : "SUCCES",
    title: intrus ? "Empreinte non reconnue" : "Accès autorisé",
    message: intrus
      ? fingerprintId === null
        ? "Aucune empreinte reconnue — intrusion"
        : `Empreinte #${fingerprintId} inconnue du registre — intrusion`
      : `Empreinte #${fingerprintId} enregistrée`,
    details: intrus
      ? `Lecture refusée (${fingerprintId === null ? "aucune empreinte" : `empreinte #${fingerprintId}`}), ` +
        `identifiée comme intruse par la base.`
      : `Lecture acceptée : l'empreinte #${fingerprintId} fait partie du registre.`,
    received_at: row.received_at,
    device_id: row.device_id,
    reference: `empreinte #${row.id}`,
    alert: intrus,
  };
};

export const buildJournal = ({ telemetry = [], movements = [], fingerprints = [] }) =>
  [
    ...telemetry.map(buildTelemetryEvent).filter(Boolean),
    ...movements.map(buildMovementEvent).filter(Boolean),
    ...fingerprints.map(buildFingerprintEvent),
  ]
    .sort((a, b) => new Date(b.received_at) - new Date(a.received_at))
    .map((event) => ({
      ...event,
      time: frTime(event.received_at),
      date: frDateTime(event.received_at),
      source: API_SOURCES[event.kind].label,
      endpoint: API_SOURCES[event.kind].endpoint,
    }));

export const buildStats = ({
  telemetry = [],
  movements = [],
  fingerprints = [],
}) => {
  const allowed = fingerprints.filter((row) => number(row.intrus) !== 1).length;
  const intruders = fingerprints.length - allowed;
  const motions = movements.filter((row) => number(row.motion) === 1).length;
  const air = telemetry.filter(
    (row) => String(row.air_level).toLowerCase() !== "normal"
  ).length;

  const items = [
    { name: "Mouvements détectés", count: motions, color: "#ffc107" },
    { name: "Intrus détectés", count: intruders, color: "#ff3b4b" },
    { name: "Accès autorisés", count: allowed, color: "#22c55e" },
    { name: "Qualité de l'air", count: air, color: "#8b4de8" },
  ];

  const total = items.reduce((sum, item) => sum + item.count, 0);

  return {
    total,
    items: items.map((item) => ({
      ...item,
      percentage: total ? Number(((item.count / total) * 100).toFixed(1)) : 0,
    })),
  };
};

export const buildSerie = (telemetry = []) =>
  [...telemetry]
    .sort((a, b) => new Date(a.received_at) - new Date(b.received_at))
    .map((row) => ({
      key: row.id,
      label: frTime(row.received_at),
      fullLabel: frDateTime(row.received_at),
      temperature: number(row.temperature),
      humidity: number(row.humidity),
      air: number(row.air_raw),
    }));
