import { useEffect, useState } from "react";
import { CAMERA_STREAM_URL, getCameraStatus } from "../../services/api";

/*
  Seuls les fichiers/manifestes vidéo ont besoin de <video>.
  Le flux du module IA est du MJPEG : il est lu avec <img>.
*/
const FICHIER_MEDIA = /\.(mp4|webm|mov|m3u8|mpd)(\?.*)?$/i;

function CameraPanel({ active, setActive }) {
  const estFichier = FICHIER_MEDIA.test(CAMERA_STREAM_URL || "");

  const [statut, setStatut] = useState(null); // état renvoyé par le module IA
  const [injoignable, setInjoignable] = useState(false);
  const [imgKo, setImgKo] = useState(false);
  const [tentative, setTentative] = useState(0);

  /* Compteur + état du flux, relevés toutes les 5 s. */
  useEffect(() => {
    if (!CAMERA_STREAM_URL || estFichier) return undefined;

    let vivant = true;

    const verifier = async () => {
      try {
        const etat = await getCameraStatus();
        if (!vivant) return;
        setStatut(etat);
        setInjoignable(false);
      } catch {
        if (!vivant) return;
        setStatut(null);
        setInjoignable(true);
      }
    };

    verifier();
    const minuteur = setInterval(verifier, 5000);

    return () => {
      vivant = false;
      clearInterval(minuteur);
    };
  }, [estFichier]);

  /* Relance le <img> toutes les 10 s tant que le flux ne répond pas. */
  useEffect(() => {
    if (!injoignable && !imgKo) return undefined;

    const minuteur = setTimeout(() => {
      setImgKo(false);
      setTentative((n) => n + 1);
    }, 10000);

    return () => clearTimeout(minuteur);
  }, [injoignable, imgKo]);

  /* État affiché par le panneau */
  const etat = !CAMERA_STREAM_URL
    ? "absent"
    : estFichier
      ? "video"
      : injoignable || imgKo
        ? "hors-ligne"
        : !statut
          ? "connexion"
          : !statut.actif
            ? "veille"
            : !statut.flux
              ? "ouverture"
              : "direct";

  return (
    <div
      className={`panel dashboard-vision ${active === "right" ? "expanded" : ""} ${
        active === "left" ? "collapsed" : ""
      }`}
      onClick={() => setActive(active === "right" ? null : "right")}
    >
      <div className="camera">
        <h3>CAMÉRA (VISION IA)</h3>
      </div>

      <div className="video">
        {etat === "absent" ? (
          <div className="video-placeholder">
            <span>🎥</span>
            <p>Flux caméra non configuré</p>
            <code>VITE_CAMERA_URL</code>
          </div>
        ) : etat === "video" ? (
          <video
            className="security-video"
            src={CAMERA_STREAM_URL}
            autoPlay
            muted
            loop
            playsInline
            onError={() => setImgKo(true)}
          />
        ) : (
          <>
            <img
              key={`flux-${tentative}`}
              className="security-video"
              src={CAMERA_STREAM_URL}
              alt="Flux caméra Sentinel-X"
              onLoad={() => setImgKo(false)}
              onError={() => setImgKo(true)}
            />

            {etat === "connexion" && (
              <div className="camera-state">
                <span>📷</span>
                <p>Connexion au module IA…</p>
                <code>{CAMERA_STREAM_URL}</code>
              </div>
            )}

            {etat === "hors-ligne" && (
              <div className="camera-state error">
                <span>🚫</span>
                <p>Module IA injoignable</p>
                <code>ia/venv/bin/python ia/script_ia.py</code>
              </div>
            )}

            {etat === "veille" && (
              <div className="camera-state">
                <span>⏸</span>
                <p>Caméra en veille</p>
                <code>arret.json = 1 pour démarrer</code>
              </div>
            )}

            {etat === "ouverture" && (
              <div className={`camera-state ${statut?.erreur ? "error" : ""}`}>
                <span>{statut?.erreur ? "⚠" : "📷"}</span>
                <p>{statut?.erreur || "Ouverture de la caméra…"}</p>
              </div>
            )}

            {etat === "direct" && (
              <div className="camera-badge">
                <span className="camera-dot" />
                <span>{statut.nombre_personne} personne(s) détectée(s)</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default CameraPanel;
