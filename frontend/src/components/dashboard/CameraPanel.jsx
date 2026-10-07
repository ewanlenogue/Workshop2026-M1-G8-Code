import { CAMERA_STREAM_URL } from "../../services/api";

function CameraPanel({ active, setActive }) {
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
        {CAMERA_STREAM_URL ? (
          <video
            className="security-video"
            src={CAMERA_STREAM_URL}
            autoPlay
            muted
            loop
            playsInline
          />
        ) : (
          <div className="video-placeholder">
            <span>🎥</span>
            <p>Flux caméra non configuré</p>
            <code>VITE_CAMERA_URL</code>
          </div>
        )}
      </div>
    </div>
  );
}

export default CameraPanel;
