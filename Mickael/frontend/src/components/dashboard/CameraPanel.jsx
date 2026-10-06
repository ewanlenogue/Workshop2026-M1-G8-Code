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
        <video className="security-video" autoPlay muted loop playsInline>
          {/* <source src="/assetssecurity.mp4" type="video/mp4" /> */}
        </video>
      </div>
    </div>
  );
}

export default CameraPanel;
