import React, { useRef, useEffect, useState } from "react";
import * as faceLandmarksDetection from "@tensorflow-models/face-landmarks-detection";
import * as tf from "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-webgl";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import glassesImg from "./glasses.png";
import glass3d from "./glasses.glb?url";

const NAVBAR_HEIGHT = 80;
const VIDEO_W = 640;
const VIDEO_H = 480;

// ── Key MediaPipe FaceMesh landmark indices ──────────────────────────────────
// All available with refineLandmarks: false
const LM = {
  LEFT_EYE_OUTER:  33,   // leftmost point of left eye
  RIGHT_EYE_OUTER: 263,  // rightmost point of right eye
  NOSE_BRIDGE:     168,  // top of nose bridge — where nose pads sit
  LEFT_EAR:        234,  // left temple / ear attachment point
  RIGHT_EAR:       454,  // right temple / ear attachment point
};

function GlassesTryOn() {
  // ── Refs ─────────────────────────────────────────────────────────────────────
  const videoRef       = useRef(null);
  const canvasRef      = useRef(null);
  const canvas3DRef    = useRef(null);
  const bgVideoRef     = useRef(null);
  const offscreenRef   = useRef(document.createElement("canvas"));
  const animFrameRef   = useRef(null);
  const animFrame3DRef = useRef(null);
  const modelRef       = useRef(null);  // face detector
  const imgRef         = useRef(null);  // 2D glasses PNG
  const imgLoaded      = useRef(false);
  const isRunning2D    = useRef(false);
  const isRunning3D    = useRef(false);
  const sceneRef       = useRef(null);
  const cameraRef      = useRef(null);
  const rendererRef    = useRef(null);
  const glassesRef     = useRef(null);  // Three.js glasses group

  // Smoothed 2D face data
  const faceDataRef = useRef({ cx: 0, cy: 0, gW: 0, gH: 0, angle: 0, found: false });

  // ── State ────────────────────────────────────────────────────────────────────
  const [mode,             setMode]             = useState("2d");
  const [status,           setStatus]           = useState("Initializing…");
  const [ready,            setReady]            = useState(false);
  const [debugInfo,        setDebugInfo]        = useState("");
  // 2D tuning
  const [scaleMultiplier,  setScaleMultiplier]  = useState(1.0);   // multiplier on temple-to-temple distance
  const [verticalOffset,   setVerticalOffset]   = useState(0);     // px offset from nose bridge
  const [horizontalOffset, setHorizontalOffset] = useState(0);
  const [smoothing,        setSmoothing]        = useState(0.82);
  // 3D tuning
  const [nativeWidth,      setNativeWidth]      = useState(1.0);   // auto-detected from bounding box
  const [loading3D,        setLoading3D]        = useState(false);
  const [error3D,          setError3D]          = useState("");

  // ── Load PNG ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload  = () => { imgLoaded.current = true; imgRef.current = img; };
    img.onerror = () => console.error("❌ glasses.png failed to load");
    img.src = glassesImg;
  }, []);

  // ── Camera + detector ────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      try {
        await tf.setBackend("webgl");
        await tf.ready();

        setStatus("Requesting camera…");
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: VIDEO_W }, height: { ideal: VIDEO_H } },
        });
        if (cancelled) return;

        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await new Promise((res, rej) => {
          video.oncanplay = res;
          video.onerror   = rej;
          setTimeout(() => rej(new Error("Video timeout")), 6000);
        });
        if (cancelled) return;

        setStatus("Loading face model…");
        const detector = await faceLandmarksDetection.createDetector(
          faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
          { runtime: "tfjs", refineLandmarks: false, maxFaces: 1 }
        );
        if (cancelled) return;

        modelRef.current = detector;
        canvasRef.current.width        = VIDEO_W;
        canvasRef.current.height       = VIDEO_H;
        offscreenRef.current.width     = VIDEO_W;
        offscreenRef.current.height    = VIDEO_H;

        setStatus("Ready!");
        setReady(true);
      } catch (err) {
        if (!cancelled)
          setStatus(err.name === "NotAllowedError"
            ? "❌ Camera denied — allow access & refresh"
            : `❌ ${err.message}`);
      }
    };
    init();
    return () => {
      cancelled = true;
      isRunning2D.current = false;
      isRunning3D.current = false;
      cancelAnimationFrame(animFrameRef.current);
      cancelAnimationFrame(animFrame3DRef.current);
      videoRef.current?.srcObject?.getTracks().forEach(t => t.stop());
    };
  }, []);

  // ── 3D init ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (mode !== "3d" || !ready) { isRunning3D.current = false; return; }

    if (rendererRef.current) { rendererRef.current.dispose(); rendererRef.current = null; }
    glassesRef.current = null;
    setLoading3D(true);
    setError3D("");

    const init3D = async () => {
      try {
        const canvas = canvas3DRef.current;
        if (!canvas) throw new Error("3D canvas not mounted");

        const W = canvas.clientWidth  || VIDEO_W;
        const H = canvas.clientHeight || VIDEO_H;
        const FOV = 50;

        const scene = new THREE.Scene();
        scene.background = null;

        const camera = new THREE.PerspectiveCamera(FOV, W / H, 0.001, 100);
        camera.position.z = 1;

        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
        renderer.setSize(W, H);
        renderer.setClearColor(0x000000, 0);
        renderer.setPixelRatio(window.devicePixelRatio);

        // Lighting: front key + fill + ambient for realistic glass/metal sheen
        const key = new THREE.DirectionalLight(0xffffff, 1.2);
        key.position.set(0, 0.5, 2);
        scene.add(key);
        const fill = new THREE.DirectionalLight(0xffffff, 0.4);
        fill.position.set(-1, 0.5, 1);
        scene.add(fill);
        scene.add(new THREE.AmbientLight(0xffffff, 0.7));

        sceneRef.current   = scene;
        cameraRef.current  = camera;
        rendererRef.current = renderer;

        // Load GLB
        const loader = new GLTFLoader();
        const gltf = await new Promise((res, rej) =>
          loader.load(glass3d, res, undefined, err =>
            rej(new Error(`GLB load failed: ${err.message || err}`))
          )
        );

        const glasses = gltf.scene;
        glasses.visible = true;
        scene.add(glasses);
        glassesRef.current = glasses;

        // Auto-detect bounding box width so scale is correct without manual tweaking
        const box = new THREE.Box3().setFromObject(glasses);
        const detectedW = box.max.x - box.min.x;
        const autoNativeW = detectedW > 0 ? parseFloat(detectedW.toFixed(4)) : 1.0;
        setNativeWidth(autoNativeW);

        isRunning3D.current = true;
        start3DLoop(FOV, autoNativeW);
        setLoading3D(false);
      } catch (err) {
        console.error("3D init error:", err);
        setError3D(err.message);
        setLoading3D(false);
        isRunning3D.current = false;
        setMode("2d");
      }
    };

    init3D();

    const onResize = () => {
      const canvas = canvas3DRef.current;
      if (!canvas || !cameraRef.current || !rendererRef.current) return;
      const W = canvas.clientWidth, H = canvas.clientHeight;
      cameraRef.current.aspect = W / H;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(W, H);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      isRunning3D.current = false;
      cancelAnimationFrame(animFrame3DRef.current);
    };
  }, [mode, ready]);

  // ── 3D detection loop ────────────────────────────────────────────────────────
  // nativeWidth passed as arg so the closure always has the auto-detected value
  const start3DLoop = (FOV, autoNativeW) => {
    const video     = videoRef.current;
    const offscreen = offscreenRef.current;
    const offCtx    = offscreen.getContext("2d");

    // World-space half extents at z=0 (camera sits at z=1)
    const halfH = Math.tan((FOV / 2) * Math.PI / 180);
    const halfW = halfH * (cameraRef.current.aspect);

    // Smoothing state
    let sX = 0, sY = 0, sAngle = 0, sScale = 0, first = true;
    const SM = 0.82;
    let frameCount = 0;

    const loop = async () => {
      if (!isRunning3D.current) return;

      if (video && video.readyState >= 2 && modelRef.current) {
        try {
          offCtx.drawImage(video, 0, 0, VIDEO_W, VIDEO_H);
          const preds = await modelRef.current.estimateFaces(offscreen);
          frameCount++;

          if (preds.length > 0 && glassesRef.current) {
            const kp = preds[0].keypoints
              ? preds[0].keypoints.map(k => [k.x, k.y, k.z ?? 0])
              : preds[0].scaledMesh;

            const Lo = kp[LM.LEFT_EYE_OUTER];
            const Ro = kp[LM.RIGHT_EYE_OUTER];
            const NB = kp[LM.NOSE_BRIDGE];
            const LE = kp[LM.LEFT_EAR]  || Lo;
            const RE = kp[LM.RIGHT_EAR] || Ro;

            if (Lo && Ro && NB) {
              // ── X/Y in world space ─────────────────────────────────────────
              // Midpoint of eye outer corners for X, nose bridge for Y
              // Mirror X because the display video is flipped
              const pixelX = (Lo[0] + Ro[0]) / 2;
              const pixelY = NB[1];
              const ndcX   =  (pixelX / VIDEO_W) * 2 - 1;
              const ndcY   = -((pixelY / VIDEO_H) * 2 - 1);
              const worldX = -ndcX * halfW;   // negate = mirror
              const worldY =  ndcY * halfH;

              // ── Scale: temple-to-temple → world units ──────────────────────
              const templePx   = Math.hypot(RE[0] - LE[0], RE[1] - LE[1]);
              const templeWorld = (templePx / VIDEO_W) * (halfW * 2);
              // Use auto-detected native width; user can override via slider
              const nW = nativeWidth > 0 ? nativeWidth : autoNativeW;
              const targetScale = templeWorld / nW;

              // ── Rotation ───────────────────────────────────────────────────
              const dx = Ro[0] - Lo[0];
              const dy = Ro[1] - Lo[1];
              const rawAngle = Math.atan2(dy, dx);

              // ── Smooth ─────────────────────────────────────────────────────
              if (first) {
                sX = worldX; sY = worldY; sAngle = rawAngle; sScale = targetScale;
                first = false;
              } else {
                sX     = sX     * SM + worldX      * (1 - SM);
                sY     = sY     * SM + worldY      * (1 - SM);
                sAngle = sAngle * SM + rawAngle    * (1 - SM);
                sScale = sScale * SM + targetScale * (1 - SM);
              }

              const g = glassesRef.current;
              g.position.set(sX, sY, 0);
              g.rotation.z = sAngle;
              g.scale.setScalar(Math.max(sScale, 0.0001));

              if (frameCount % 30 === 0) {
                setDebugInfo(
                  `✅ 3D | faces: ${preds.length}\n` +
                  `Temple: ${Math.round(templePx)}px → ${templeWorld.toFixed(3)} world\n` +
                  `nativeW: ${nW.toFixed(4)} | scale: ${sScale.toFixed(4)}\n` +
                  `pos: (${sX.toFixed(3)}, ${sY.toFixed(3)}) | rot: ${(sAngle*180/Math.PI).toFixed(1)}°`
                );
              }
            }
          } else if (frameCount % 90 === 0) {
            setDebugInfo("⚠️  No face — move closer");
          }
        } catch (e) { console.warn("3D loop err:", e.message); }
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current)
        rendererRef.current.render(sceneRef.current, cameraRef.current);

      animFrame3DRef.current = requestAnimationFrame(loop);
    };
    animFrame3DRef.current = requestAnimationFrame(loop);
  };

  // ── 2D draw loop ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!ready || mode !== "2d") { isRunning2D.current = false; return; }

    isRunning2D.current = true;
    const video     = videoRef.current;
    const canvas    = canvasRef.current;
    const offscreen = offscreenRef.current;
    const ctx       = canvas.getContext("2d", { alpha: false });
    const offCtx    = offscreen.getContext("2d");
    const sm        = (cur, prev) => prev * smoothing + cur * (1 - smoothing);

    let frameCount = 0, lastDebug = 0;

    const drawLoop = async () => {
      if (!isRunning2D.current || mode !== "2d") return;

      if (video.readyState >= 2) {
        try {
          offCtx.drawImage(video, 0, 0, VIDEO_W, VIDEO_H);
          const preds = await modelRef.current.estimateFaces(offscreen);
          frameCount++;

          if (preds.length > 0) {
            const kp = preds[0].keypoints
              ? preds[0].keypoints.map(k => [k.x, k.y])
              : preds[0].scaledMesh;

            const Lo = kp[LM.LEFT_EYE_OUTER];
            const Ro = kp[LM.RIGHT_EYE_OUTER];
            const NB = kp[LM.NOSE_BRIDGE];
            const LE = kp[LM.LEFT_EAR]  || Lo;
            const RE = kp[LM.RIGHT_EAR] || Ro;

            if (Lo && Ro && NB) {
              // Angle from outer eye corners
              const dx = Ro[0] - Lo[0];
              const dy = Ro[1] - Lo[1];
              const rawAngle = Math.atan2(dy, dx);

              // Width = temple-to-temple × scale slider
              const rawGW = Math.hypot(RE[0] - LE[0], RE[1] - LE[1]) * scaleMultiplier;
              // Aspect ratio ~2.8:1 is typical for glasses frames
              const rawGH = rawGW / 2.8;

              // Position: midpoint of eyes horizontally, nose bridge vertically
              const rawCx = (Lo[0] + Ro[0]) / 2 + horizontalOffset;
              const rawCy = NB[1] + verticalOffset;

              const fd = faceDataRef.current;
              faceDataRef.current = fd.found
                ? { cx: sm(rawCx, fd.cx), cy: sm(rawCy, fd.cy), gW: sm(rawGW, fd.gW), gH: sm(rawGH, fd.gH), angle: sm(rawAngle, fd.angle), found: true }
                : { cx: rawCx, cy: rawCy, gW: rawGW, gH: rawGH, angle: rawAngle, found: true };

              if (frameCount - lastDebug >= 30) {
                lastDebug = frameCount;
                const f = faceDataRef.current;
                setDebugInfo(
                  `✅ 2D | glasses: ${Math.round(f.gW)}×${Math.round(f.gH)}px\n` +
                  `center: (${Math.round(f.cx)}, ${Math.round(f.cy)}) | angle: ${(f.angle*180/Math.PI).toFixed(1)}°`
                );
              }
            }
          } else {
            faceDataRef.current.found = false;
            if (frameCount - lastDebug >= 120) { lastDebug = frameCount; setDebugInfo("⚠️  No face — move closer"); }
          }
        } catch (e) { console.warn("2D loop err:", e.message); }
      }

      // Draw mirrored video
      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(video, -VIDEO_W, 0, VIDEO_W, VIDEO_H);
      ctx.restore();

      // Draw glasses PNG
      const fd = faceDataRef.current;
      if (fd.found && imgLoaded.current && imgRef.current) {
        // Mirror X to match flipped canvas
        const mirCx = VIDEO_W - fd.cx;
        ctx.save();
        ctx.translate(mirCx, fd.cy);
        ctx.rotate(-fd.angle);  // negate because canvas is horizontally mirrored
        ctx.drawImage(imgRef.current, -fd.gW / 2, -fd.gH / 2, fd.gW, fd.gH);
        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(drawLoop);
    };

    setTimeout(() => { animFrameRef.current = requestAnimationFrame(drawLoop); }, 100);
    return () => { isRunning2D.current = false; cancelAnimationFrame(animFrameRef.current); };
  }, [ready, mode, scaleMultiplier, verticalOffset, horizontalOffset, smoothing]);

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const btnStyle = active => ({
    padding: "10px 20px",
    backgroundColor: active ? "#667eea" : "#e0e0e0",
    color: active ? "#fff" : "#333",
    border: `2px solid ${active ? "#667eea" : "#ccc"}`,
    borderRadius: "6px", cursor: "pointer", fontWeight: "bold",
    transition: "all 0.2s", fontSize: "0.95rem",
  });

  const SliderRow = ({ label, min, max, step, value, onChange, display }) => (
    <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
      <label style={{ fontSize: "0.88rem", fontWeight: "bold", minWidth: "130px" }}>{label}:</label>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{ width: "130px", cursor: "pointer" }} />
      <span style={{ fontSize: "0.88rem", fontWeight: "bold", minWidth: "52px" }}>{display}</span>
    </div>
  );

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div style={{
      marginTop: NAVBAR_HEIGHT,
      minHeight: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: "24px 16px",
      boxSizing: "border-box", backgroundColor: "#f5f5f5",
    }}>
      <h1 style={{ marginBottom: "12px", fontSize: "1.6rem" }}>🕶️ Glasses Try-On</h1>

      {!ready && (
        <p style={{
          marginBottom: "12px", padding: "6px 16px", borderRadius: "20px",
          backgroundColor: status.startsWith("❌") ? "#ffe0e0" : "#e8f0fe",
          color: status.startsWith("❌") ? "#c00" : "#1a56db",
          fontSize: "0.88rem", fontWeight: 500,
        }}>{status}</p>
      )}

      {/* Mode selector */}
      {ready && (
        <div style={{
          marginBottom: "16px", display: "flex", gap: "12px",
          backgroundColor: "#fff", padding: "12px", borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}>
          <button style={btnStyle(mode === "2d")} onClick={() => {
            isRunning3D.current = false;
            cancelAnimationFrame(animFrame3DRef.current);
            setMode("2d");
          }}>📷 2D Mode</button>
          <button style={btnStyle(mode === "3d")} onClick={() => {
            isRunning2D.current = false;
            cancelAnimationFrame(animFrameRef.current);
            setMode("3d");
          }}>🎮 3D Mode</button>
        </div>
      )}

      {/* 2D controls */}
      {ready && mode === "2d" && (
        <div style={{
          marginBottom: "12px", padding: "12px 16px", backgroundColor: "#fff",
          border: "2px solid #333", borderRadius: "8px",
          display: "flex", flexDirection: "column", gap: "10px",
          maxWidth: "640px", width: "100%",
        }}>
          <SliderRow label="Width scale"    min={0.5}  max={2}    step={0.05} value={scaleMultiplier}
            onChange={setScaleMultiplier}
            display={`${scaleMultiplier.toFixed(2)}×`} />
          <SliderRow label="Vertical (px)"  min={-50}  max={50}   step={1}    value={verticalOffset}
            onChange={v => setVerticalOffset(Math.round(v))}
            display={`${verticalOffset >= 0 ? "+" : ""}${verticalOffset}`} />
          <SliderRow label="Horizontal (px)"min={-50}  max={50}   step={1}    value={horizontalOffset}
            onChange={v => setHorizontalOffset(Math.round(v))}
            display={`${horizontalOffset >= 0 ? "+" : ""}${horizontalOffset}`} />
          <SliderRow label="Smoothing"      min={0}    max={0.95} step={0.05} value={smoothing}
            onChange={setSmoothing}
            display={`${(smoothing * 100).toFixed(0)}%`} />
          <p style={{ margin: 0, fontSize: "0.78rem", color: "#888" }}>
            Width scales from temple-to-temple landmark distance (realistic ear-to-ear fit).
            Vertical offset moves glasses up/down from nose bridge.
          </p>
        </div>
      )}

      {/* 3D controls */}
      {ready && mode === "3d" && !loading3D && !error3D && (
        <div style={{
          marginBottom: "12px", padding: "12px 16px", backgroundColor: "#fff",
          border: "2px solid #667eea", borderRadius: "8px",
          display: "flex", flexDirection: "column", gap: "10px",
          maxWidth: "640px", width: "100%",
        }}>
          <p style={{ margin: 0, fontSize: "0.80rem", color: "#555" }}>
            Model width auto-detected as <strong>{nativeWidth}</strong> (bounding box X).
            Adjust if glasses appear too large or too small.
          </p>
          <SliderRow label="Model width"  min={0.05} max={10} step={0.05} value={nativeWidth}
            onChange={setNativeWidth} display={nativeWidth.toFixed(2)} />
        </div>
      )}

      {loading3D && <p style={{ marginBottom: "12px", color: "#555", fontWeight: "bold" }}>⏳ Loading 3D model…</p>}

      {error3D && (
        <div style={{
          marginBottom: "12px", padding: "12px", backgroundColor: "#ffe0e0",
          border: "2px solid #f00", borderRadius: "8px", color: "#c00", maxWidth: "640px",
        }}>
          <strong>❌ Error:</strong> {error3D}<br />
          <small>Make sure glasses.glb is in the right place and vite.config has <code>assetsInclude: ["**/*.glb"]</code></small>
        </div>
      )}

      {/* 2D canvas */}
      {mode === "2d" && (
        <div style={{ overflowX: "auto", maxWidth: "100%", marginBottom: "16px" }}>
          <canvas ref={canvasRef} width={VIDEO_W} height={VIDEO_H}
            style={{
              border: "2px solid #333", borderRadius: "12px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
              display: "block", backgroundColor: "#000",
            }} />
        </div>
      )}

      {/* 3D view: mirrored video behind + transparent Three.js canvas on top */}
      {mode === "3d" && (
        <div style={{
          position: "relative",
          width: `${VIDEO_W}px`, height: `${VIDEO_H}px`,
          marginBottom: "16px", maxWidth: "100%",
          border: "2px solid #667eea", borderRadius: "12px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          overflow: "hidden", backgroundColor: "#000",
        }}>
          <video
            ref={el => {
              bgVideoRef.current = el;
              if (el && videoRef.current?.srcObject) {
                el.srcObject = videoRef.current.srcObject;
                el.play().catch(() => {});
              }
            }}
            autoPlay playsInline muted
            style={{
              position: "absolute", inset: 0,
              width: "100%", height: "100%",
              objectFit: "cover",
              transform: "scaleX(-1)",  // mirror = selfie view
            }}
          />
          <canvas ref={canvas3DRef}
            style={{
              position: "absolute", inset: 0,
              width: "100%", height: "100%",
              display: "block",
            }}
          />
        </div>
      )}

      {/* Debug overlay */}
      {ready && debugInfo && (
        <div style={{
          padding: "8px 12px", borderRadius: "8px", backgroundColor: "#fff",
          border: "1px solid #ddd", fontSize: "0.72rem", fontFamily: "monospace",
          color: "#444", maxWidth: "640px", whiteSpace: "pre-wrap",
          wordBreak: "break-all", marginBottom: "12px",
        }}>{debugInfo}</div>
      )}

      {ready && mode === "2d" && (
        <p style={{ color: "#555", fontSize: "0.85rem", textAlign: "center" }}>
          📷 Glasses span your temples — adjust <em>Width scale</em> and <em>Vertical</em> to fine-tune
        </p>
      )}
      {ready && mode === "3d" && !loading3D && !error3D && (
        <p style={{ color: "#555", fontSize: "0.85rem", textAlign: "center" }}>
          🎮 Scale is set automatically from your temple width
        </p>
      )}

      {/* Primary hidden video used for face detection */}
      <video ref={videoRef} autoPlay playsInline muted
        style={{ position: "fixed", bottom: 0, right: 0, width: 1, height: 1, opacity: 0.01, pointerEvents: "none" }}
      />
    </div>
  );
}

export default GlassesTryOn;