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
// These landmarks give us precise eye, temple, and nose positions
const LM = {
  // Eye corners (outer and inner)
  LEFT_EYE_OUTER:   33,   // leftmost point of left eye
  LEFT_EYE_INNER:  133,   // rightmost point of left eye (inner corner)
  RIGHT_EYE_INNER: 362,   // leftmost point of right eye (inner corner)
  RIGHT_EYE_OUTER: 263,   // rightmost point of right eye

  // Eye center landmarks (upper/lower lid midpoints)
  LEFT_EYE_TOP:     159,  // top of left eye
  LEFT_EYE_BOTTOM:  145,  // bottom of left eye
  RIGHT_EYE_TOP:    386,  // top of right eye
  RIGHT_EYE_BOTTOM: 374,  // bottom of right eye

  // Nose bridge - where glasses rest
  NOSE_BRIDGE_TOP:   6,   // top of nose bridge between eyes
  NOSE_BRIDGE:     168,   // mid nose bridge

  // Temple / side of head (ear area)
  LEFT_TEMPLE:     234,   // left side of face ~ ear
  RIGHT_TEMPLE:    454,   // right side of face ~ ear

  // Forehead & chin for head tilt estimation
  FOREHEAD:         10,   // top of forehead center
  CHIN:            152,   // bottom of chin center

  // Cheekbone for depth estimation
  LEFT_CHEEK:      234,
  RIGHT_CHEEK:     454,
};

// Exponential smoothing helper
function lerp(current, target, factor) {
  return current * factor + target * (1 - factor);
}

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
  const faceDataRef = useRef({
    cx: 0, cy: 0, gW: 0, gH: 0, angle: 0, found: false
  });

  // Smoothed 3D face data
  const face3DRef = useRef({
    x: 0, y: 0, z: 0,
    rotX: 0, rotY: 0, rotZ: 0,
    scale: 1,
    found: false
  });

  // ── State ────────────────────────────────────────────────────────────────────
  const [mode,             setMode]             = useState("2d");
  const [status,           setStatus]           = useState("Initializing…");
  const [ready,            setReady]            = useState(false);
  const [debugInfo,        setDebugInfo]        = useState("");
  // 2D tuning
  const [scaleMultiplier,  setScaleMultiplier]  = useState(1.15);  // slightly wider for realistic fit
  const [verticalOffset,   setVerticalOffset]   = useState(0);
  const [horizontalOffset, setHorizontalOffset] = useState(0);
  const [smoothing,        setSmoothing]        = useState(0.7);
  // 3D tuning
  const [nativeWidth,      setNativeWidth]      = useState(1.0);
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

  // ── Helper: extract face geometry from landmarks ───────────────────────────
  function extractFaceGeometry(kp) {
    const Lo = kp[LM.LEFT_EYE_OUTER];
    const Li = kp[LM.LEFT_EYE_INNER];
    const Ri = kp[LM.RIGHT_EYE_INNER];
    const Ro = kp[LM.RIGHT_EYE_OUTER];
    const LT = kp[LM.LEFT_EYE_TOP];
    const LB = kp[LM.LEFT_EYE_BOTTOM];
    const RT = kp[LM.RIGHT_EYE_TOP];
    const RB = kp[LM.RIGHT_EYE_BOTTOM];
    const NB = kp[LM.NOSE_BRIDGE_TOP];
    const LE = kp[LM.LEFT_TEMPLE];
    const RE = kp[LM.RIGHT_TEMPLE];
    const FH = kp[LM.FOREHEAD];
    const CH = kp[LM.CHIN];

    if (!Lo || !Ro || !NB) return null;

    // Center of left eye and right eye
    const leftEyeCenter  = [(Lo[0] + (Li || Lo)[0]) / 2, ((LT || Lo)[1] + (LB || Lo)[1]) / 2];
    const rightEyeCenter = [(Ro[0] + (Ri || Ro)[0]) / 2, ((RT || Ro)[1] + (RB || Ro)[1]) / 2];

    // Eye midpoint — this is where the glasses bridge sits
    const eyeMidX = (leftEyeCenter[0] + rightEyeCenter[0]) / 2;
    const eyeMidY = (leftEyeCenter[1] + rightEyeCenter[1]) / 2;

    // Use nose bridge Y but blend with eye midpoint for better vertical positioning
    // Glasses sit slightly above the eye center, at the nose bridge level
    const bridgeY = NB[1] * 0.4 + eyeMidY * 0.6;

    // Temple-to-temple distance for width
    const templeWidth = Math.hypot(
      (RE || Ro)[0] - (LE || Lo)[0],
      (RE || Ro)[1] - (LE || Lo)[1]
    );

    // Eye-to-eye distance for more stable width reference
    const eyeWidth = Math.hypot(Lo[0] - Ro[0], Lo[1] - Ro[1]);

    // Roll angle from eye line
    const dx = Ro[0] - Lo[0];
    const dy = Ro[1] - Lo[1];
    const rollAngle = Math.atan2(dy, dx);

    // Head tilt (pitch) from forehead-chin if available
    let pitchAngle = 0;
    if (FH && CH) {
      const faceHeight = Math.hypot(FH[0] - CH[0], FH[1] - CH[1]);
      // Ratio of nose bridge position relative to face height indicates pitch
      const noseRatio = (NB[1] - FH[1]) / (CH[1] - FH[1]);
      // When looking down, nose ratio > 0.3; looking up, < 0.3
      pitchAngle = (noseRatio - 0.35) * 1.2; // approximate radians
    }

    // Head yaw from asymmetry of temple distances
    let yawAngle = 0;
    if (LE && RE && Lo && Ro) {
      const leftDist  = Math.abs(Lo[0] - LE[0]);
      const rightDist = Math.abs(Ro[0] - RE[0]);
      const totalDist = leftDist + rightDist;
      if (totalDist > 0) {
        yawAngle = ((rightDist - leftDist) / totalDist) * 1.5; // radians estimate
      }
    }

    // Z depth from eye keypoints (if available)
    const hasZ = Lo.length > 2 && Lo[2] !== undefined && Lo[2] !== 0;
    const avgZ = hasZ ? (Lo[2] + Ro[2]) / 2 : 0;

    return {
      centerX: eyeMidX,
      centerY: bridgeY,
      templeWidth,
      eyeWidth,
      rollAngle,
      pitchAngle,
      yawAngle,
      depth: avgZ,
    };
  }

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

        // Center the model at its own origin
        const box = new THREE.Box3().setFromObject(glasses);
        const center = box.getCenter(new THREE.Vector3());
        glasses.position.sub(center); // center the geometry

        // Wrap in a group so transforms apply cleanly
        const glassesGroup = new THREE.Group();
        glassesGroup.add(glasses);
        scene.add(glassesGroup);
        glassesRef.current = glassesGroup;

        // Auto-detect bounding box width
        const detectedW = box.max.x - box.min.x;
        const autoNativeW = detectedW > 0 ? parseFloat(detectedW.toFixed(4)) : 1.0;
        setNativeWidth(autoNativeW);

        isRunning3D.current = true;
        face3DRef.current = { x: 0, y: 0, z: 0, rotX: 0, rotY: 0, rotZ: 0, scale: 1, found: false };
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
  const start3DLoop = (FOV, autoNativeW) => {
    const video     = videoRef.current;
    const offscreen = offscreenRef.current;
    const offCtx    = offscreen.getContext("2d");

    // World-space half extents at z=0 (camera sits at z=1)
    const halfH = Math.tan((FOV / 2) * Math.PI / 180);
    const halfW = halfH * (cameraRef.current.aspect);

    const SM = 0.65; // smoothing factor (lower = more responsive)
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

            const geo = extractFaceGeometry(kp);
            if (geo) {
              // ── X/Y in world space ─────────────────────────────────────────
              // Mirror X because the display video is flipped
              const ndcX =  (geo.centerX / VIDEO_W) * 2 - 1;
              const ndcY = -((geo.centerY / VIDEO_H) * 2 - 1);
              const worldX = -ndcX * halfW;   // negate = mirror
              const worldY =  ndcY * halfH;

              // ── Scale: temple-to-temple → world units ──────────────────────
              const templeWorld = (geo.templeWidth / VIDEO_W) * (halfW * 2);
              const nW = nativeWidth > 0 ? nativeWidth : autoNativeW;
              const targetScale = (templeWorld / nW) * 1.05; // slightly larger for ear coverage

              // ── Rotation ───────────────────────────────────────────────────
              const rollZ  = -geo.rollAngle; // negate for mirrored view
              const pitchX = -geo.pitchAngle * 0.6; // dampen pitch
              const yawY   = geo.yawAngle * 0.5;    // dampen yaw

              // ── Smooth ─────────────────────────────────────────────────────
              const fd = face3DRef.current;
              if (!fd.found) {
                face3DRef.current = {
                  x: worldX, y: worldY, z: 0,
                  rotX: pitchX, rotY: yawY, rotZ: rollZ,
                  scale: targetScale, found: true
                };
              } else {
                face3DRef.current = {
                  x:     lerp(fd.x, worldX, SM),
                  y:     lerp(fd.y, worldY, SM),
                  z:     0,
                  rotX:  lerp(fd.rotX, pitchX, SM),
                  rotY:  lerp(fd.rotY, yawY, SM),
                  rotZ:  lerp(fd.rotZ, rollZ, SM),
                  scale: lerp(fd.scale, targetScale, SM),
                  found: true,
                };
              }

              const s = face3DRef.current;
              const g = glassesRef.current;

              // Apply transforms in correct order: position, then rotation (ZYX)
              g.position.set(s.x, s.y, s.z);
              g.rotation.set(0, 0, 0); // reset
              g.rotateZ(s.rotZ);
              g.rotateY(s.rotY);
              g.rotateX(s.rotX);
              g.scale.setScalar(Math.max(s.scale, 0.0001));

              if (frameCount % 30 === 0) {
                setDebugInfo(
                  `✅ 3D | faces: ${preds.length}\n` +
                  `Temple: ${Math.round(geo.templeWidth)}px → ${templeWorld.toFixed(3)} world\n` +
                  `nativeW: ${nW.toFixed(4)} | scale: ${s.scale.toFixed(4)}\n` +
                  `pos: (${s.x.toFixed(3)}, ${s.y.toFixed(3)}) | roll: ${(s.rotZ*180/Math.PI).toFixed(1)}°\n` +
                  `pitch: ${(s.rotX*180/Math.PI).toFixed(1)}° | yaw: ${(s.rotY*180/Math.PI).toFixed(1)}°`
                );
              }
            }
          } else if (frameCount % 90 === 0) {
            face3DRef.current.found = false;
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

            const geo = extractFaceGeometry(kp);

            if (geo) {
              // Width = temple-to-temple × scale slider
              // The temple width gives us the full glasses frame width including arms
              const rawGW = geo.templeWidth * scaleMultiplier;

              // Use the actual glasses image aspect ratio for accurate height
              const glassesAspect = imgRef.current
                ? imgRef.current.naturalWidth / imgRef.current.naturalHeight
                : 2.5;
              const rawGH = rawGW / glassesAspect;

              // Position: center of eyes horizontally, nose bridge level vertically
              const rawCx = geo.centerX + horizontalOffset;
              const rawCy = geo.centerY + verticalOffset;

              const rawAngle = geo.rollAngle;

              const fd = faceDataRef.current;
              faceDataRef.current = fd.found
                ? {
                    cx: sm(rawCx, fd.cx),
                    cy: sm(rawCy, fd.cy),
                    gW: sm(rawGW, fd.gW),
                    gH: sm(rawGH, fd.gH),
                    angle: sm(rawAngle, fd.angle),
                    found: true,
                  }
                : { cx: rawCx, cy: rawCy, gW: rawGW, gH: rawGH, angle: rawAngle, found: true };

              if (frameCount - lastDebug >= 30) {
                lastDebug = frameCount;
                const f = faceDataRef.current;
                setDebugInfo(
                  `✅ 2D | glasses: ${Math.round(f.gW)}×${Math.round(f.gH)}px\n` +
                  `center: (${Math.round(f.cx)}, ${Math.round(f.cy)}) | angle: ${(f.angle*180/Math.PI).toFixed(1)}°\n` +
                  `temple: ${Math.round(geo.templeWidth)}px | eye: ${Math.round(geo.eyeWidth)}px`
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
            Glasses are sized to match your temple-to-temple width and positioned at eye level.
            Use sliders for fine-tuning.
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
          📷 Glasses snap to your eyes & temples — adjust <em>Width scale</em> and <em>Vertical</em> to fine-tune
        </p>
      )}
      {ready && mode === "3d" && !loading3D && !error3D && (
        <p style={{ color: "#555", fontSize: "0.85rem", textAlign: "center" }}>
          🎮 3D glasses follow your head rotation like Snapchat filters
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