"use client";

import { useEffect, useRef, useState } from "react";
import type { IScannerControls } from "@zxing/browser";

function cameraError(error: unknown) {
  const name = error instanceof Error ? error.name : "";
  if (name === "NotAllowedError" || name === "SecurityError") return "Camera permission was denied. Allow camera access in your browser settings and try again, or enter a barcode below.";
  if (name === "NotFoundError" || name === "OverconstrainedError") return "No suitable camera was found. Connect a camera or use manual entry below.";
  if (name === "NotReadableError") return "The camera could not start. Close other apps using it and try again, or use manual entry.";
  return "Camera access is unavailable. Try again or use the barcode or product name fields below.";
}

export default function BarcodeScanner({ onDetected }: { onDetected: (barcode: string) => void }) {
  const video = useRef<HTMLVideoElement>(null);
  const controls = useRef<IScannerControls | null>(null);
  const generation = useRef(0);
  const [state, setState] = useState<"idle" | "starting" | "scanning">("idle");
  const [error, setError] = useState("");

  function stop() {
    generation.current += 1;
    controls.current?.stop();
    controls.current = null;
    setState("idle");
  }

  useEffect(() => {
    const stopOnHidden = () => { if (document.hidden) stop(); };
    document.addEventListener("visibilitychange", stopOnHidden);
    return () => { document.removeEventListener("visibilitychange", stopOnHidden); generation.current += 1; controls.current?.stop(); };
  }, []);

  async function start() {
    stop();
    setError("");
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      setError("Camera access requires HTTPS (or localhost) and a supported browser. Use manual entry below on this device.");
      return;
    }
    const attempt = generation.current;
    setState("starting");
    try {
      const { BrowserMultiFormatOneDReader } = await import("@zxing/browser");
      if (attempt !== generation.current || !video.current) return;
      const reader = new BrowserMultiFormatOneDReader();
      const scanner = await reader.decodeFromConstraints({ audio: false, video: { facingMode: { ideal: "environment" } } }, video.current, (result, _error, scannerControls) => {
        if (attempt !== generation.current) { scannerControls.stop(); return; }
        if (result) {
          scannerControls.stop();
          stop();
          onDetected(result.getText());
        }
      });
      if (attempt !== generation.current) { scanner.stop(); return; }
      controls.current = scanner;
      setState("scanning");
    } catch (cause) {
      if (attempt !== generation.current) return;
      stop();
      setError(cameraError(cause));
    }
  }

  return <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7" aria-labelledby="camera-title">
    <h2 id="camera-title" className="text-xl font-semibold">Scan a barcode</h2>
    <p className="mt-2 text-sm leading-6 text-slate-600">Use the rear camera. Hold a packaged product’s barcode steady in good light. Camera access starts only when you choose Start camera.</p>
    <div className="relative mt-5 overflow-hidden rounded-xl bg-slate-900"><video ref={video} muted playsInline autoPlay className="aspect-video w-full object-cover" aria-label="Live barcode camera preview" />{state === "idle" && <p className="absolute inset-0 flex items-center justify-center text-slate-200">Camera is off</p>}</div>
    <p role="status" className="mt-3 text-sm text-slate-600">{state === "starting" ? "Waiting for camera permission…" : state === "scanning" ? "Scanning… Point the camera at a barcode, or stop and use manual entry." : "Ready to scan."}</p>
    {error && <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
    <div className="mt-4 flex flex-wrap gap-3"><button type="button" onClick={start} disabled={state !== "idle"} className="rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white disabled:opacity-50">Start camera</button><button type="button" onClick={stop} disabled={state === "idle"} className="rounded-xl border border-slate-300 px-5 py-3 font-semibold disabled:opacity-50">Stop camera</button></div>
  </section>;
}
