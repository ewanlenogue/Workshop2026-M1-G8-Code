/*
  Accès à l'API Sentinel-X.

  Toutes les valeurs affichées par le dashboard proviennent d'ici :
  aucune donnée n'est écrite en dur dans les composants.

  Configuration (fichier frontend/.env) :
    VITE_API_URL            base de l'API backend      (défaut http://localhost:3000/api)
    VITE_CAMERA_URL         URL du flux vidéo MJPEG/HLS de la caméra (vide = pas de flux)
    VITE_COMMANDS_API_URL   API matérielle qui reçoit les ordres (buzzer, porte)
*/

const API_BASE = (
  import.meta.env.VITE_API_URL || "http://localhost:3000/api"
).replace(/\/$/, "");

const CAMERA_STREAM_URL = import.meta.env.VITE_CAMERA_URL || "";

const COMMANDS_API_URL =
  import.meta.env.VITE_COMMANDS_API_URL || `${API_BASE}/v1/commandes`;

async function request(path, options = {}) {
  let response;

  try {
    response = await fetch(`${API_BASE}${path}`, {
      headers: { Accept: "application/json", ...options.headers },
      ...options,
    });
  } catch {
    throw new Error(`API injoignable (${API_BASE})`);
  }

  if (!response.ok) {
    throw new Error(`Erreur ${response.status} sur ${path}`);
  }

  return response.json();
}

/* ------------------------------ Lectures ------------------------------ */

export const getTelemetry = (limit = 48) =>
  request(`/v1/telemetrie?limit=${limit}`);

export const getMovements = (limit = 200) =>
  request(`/v1/mouvement?limit=${limit}`);

export const getFingerprintEvents = (limit = 200) =>
  request(`/v1/empreinte?limit=${limit}`);

export const getDashboardData = async (limits = {}) => {
  const [telemetry, movements, fingerprints] = await Promise.all([
    getTelemetry(limits.telemetry),
    getMovements(limits.movements),
    getFingerprintEvents(limits.fingerprints),
  ]);

  return { telemetry, movements, fingerprints };
};

/* ------------------------------ Ordres ------------------------------- */

/*
  Envoie une action à l'API matérielle (buzzer / porte).
  Le backend Sentinel-X ne gère pas encore ces commandes :
  l'URL se règle avec VITE_COMMANDS_API_URL.
*/
export const sendCommand = async (action) => {
  let response;

  try {
    response = await fetch(COMMANDS_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        action_id: `${Date.now()}`,
        sent_at: new Date().toISOString(),
      }),
    });
  } catch {
    throw new Error(`API matérielle injoignable (${COMMANDS_API_URL})`);
  }

  if (!response.ok) {
    throw new Error(
      `Réponse ${response.status} — endpoint absent ou refusé (${COMMANDS_API_URL})`
    );
  }

  return response.json().catch(() => null);
};

export { API_BASE, CAMERA_STREAM_URL, COMMANDS_API_URL };
