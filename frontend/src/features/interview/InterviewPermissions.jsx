import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Camera, Monitor, ArrowRight, ShieldAlert, VideoOff, Mic, CheckCircle, X } from 'lucide-react';
import { useProctorStore } from './useProctorStore';

function PermCard({ icon: Icon, title, subtitle, granted, onGrant, label }) {
  return (
    <div
      className={`flex flex-col items-center text-center p-6 rounded-2xl border-2 transition-all duration-300 ${
        granted
          ? 'border-success/50 bg-success/5 shadow-[0_0_24px_rgba(34,197,94,0.08)]'
          : 'border-border bg-surface hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 cursor-pointer'
      }`}
    >
      <div
        className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 ${
          granted ? 'bg-success text-white shadow-lg shadow-success/30' : 'bg-surface-2 text-text-secondary'
        }`}
      >
        {granted ? <CheckCircle size={26} /> : <Icon size={26} />}
      </div>
      <h3 className="font-bold text-base mb-1 text-text">{title}</h3>
      <p className="text-xs text-text-secondary mb-5 leading-relaxed">{subtitle}</p>
      <button
        onClick={!granted ? onGrant : undefined}
        disabled={granted}
        className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
          granted
            ? 'bg-success/10 text-success cursor-default border border-success/20'
            : 'bg-primary text-white hover:bg-primary/90 active:scale-95 shadow-md shadow-primary/20'
        }`}
      >
        {granted ? '✓ Granted' : label}
      </button>
    </div>
  );
}

export function InterviewPermissions() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [cameraGranted, setCameraGranted] = useState(false);
  const [screenGranted, setScreenGranted]   = useState(false);
  const [micGranted, setMicGranted]         = useState(false);
  const [error, setError]                   = useState(null);

  const { setCameraStream, setScreenStream, setMicStream } = useProctorStore();

  const requestCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      setCameraStream(stream);
      setCameraGranted(true);
      setError(null);
    } catch {
      setError('Camera access denied. You must grant camera access to proceed.');
    }
  };

  const requestMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      setMicStream(stream);
      setMicGranted(true);
      setError(null);
    } catch {
      setError('Microphone access denied. You must grant microphone access to proceed.');
    }
  };

  const requestScreen = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: { displaySurface: 'monitor' }, audio: false });
      setScreenStream(stream);
      setScreenGranted(true);
      setError(null);
    } catch {
      setError('Screen share denied. You must share your full screen to proceed.');
    }
  };

  const allGranted = cameraGranted && screenGranted && micGranted;

  const handleNext = () => {
    if (allGranted) navigate(`/interview/preflight?${searchParams.toString()}`);
  };

  return (
    <div className="h-screen w-full bg-bg text-text flex flex-col overflow-hidden relative">

      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[400px] bg-primary/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-error/8 rounded-full blur-[100px]" />
      </div>

      {/* ── MAIN CARD ─────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 z-10">
        <div className="w-full max-w-[900px] bg-surface/80 backdrop-blur-2xl border border-border/60 rounded-3xl shadow-2xl overflow-hidden flex flex-col">

          {/* Header */}
          <div className="px-8 py-7 border-b border-border/50 text-center relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-error/60 to-transparent" />
            <div className="mx-auto w-14 h-14 bg-gradient-to-br from-error/20 to-error/5 border border-error/20 text-error rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-error/10">
              <ShieldAlert size={28} />
            </div>
            <h1 className="text-2xl font-black mb-2 tracking-tight">High-Security Proctoring Setup</h1>
            <p className="text-text-secondary text-sm max-w-xl mx-auto leading-relaxed">
              This enterprise interview requires continuous camera, microphone, and screen monitoring.
              All three must be granted to begin.
            </p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="mx-6 mt-5 bg-error/10 border border-error/20 text-error px-5 py-3.5 rounded-xl text-sm font-semibold flex items-center justify-between gap-3 animate-fade-in">
              <div className="flex items-center gap-2">
                <VideoOff size={16} /> {error}
              </div>
              <button onClick={() => setError(null)} className="opacity-60 hover:opacity-100 shrink-0">
                <X size={16} />
              </button>
            </div>
          )}

          {/* Permission cards */}
          <div className="p-6 grid grid-cols-3 gap-4">
            <PermCard
              icon={Camera}
              title="Webcam"
              subtitle="Required for visual identity verification throughout the interview."
              granted={cameraGranted}
              onGrant={requestCamera}
              label="Grant Camera"
            />
            <PermCard
              icon={Mic}
              title="Microphone"
              subtitle="Required for audio monitoring to ensure exam integrity."
              granted={micGranted}
              onGrant={requestMic}
              label="Grant Microphone"
            />
            <PermCard
              icon={Monitor}
              title="Screen Share"
              subtitle="Required to monitor your full desktop and prevent tab switching."
              granted={screenGranted}
              onGrant={requestScreen}
              label="Grant Screen"
            />
          </div>

          {/* Progress indicator */}
          <div className="px-6 pb-3">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-surface-3 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-success rounded-full transition-all duration-500"
                  style={{ width: `${([cameraGranted, micGranted, screenGranted].filter(Boolean).length / 3) * 100}%` }}
                />
              </div>
              <span className="text-xs font-bold text-text-secondary">
                {[cameraGranted, micGranted, screenGranted].filter(Boolean).length}/3
              </span>
            </div>
          </div>

          {/* Footer actions */}
          <div className="px-6 py-5 border-t border-border/50 bg-bg/30 flex items-center justify-between">
            <button
              onClick={() => navigate('/interview')}
              className="text-sm font-semibold text-text-secondary hover:text-text transition-colors px-4 py-2 rounded-lg hover:bg-surface-2"
            >
              ← Cancel
            </button>
            <button
              disabled={!allGranted}
              onClick={handleNext}
              className={`flex items-center gap-2 px-7 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
                allGranted
                  ? 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/30 hover:shadow-primary/40 hover:scale-[1.02]'
                  : 'bg-surface-2 text-text-secondary border border-border cursor-not-allowed'
              }`}
            >
              Continue to Pre-Flight
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom security notice */}
      <div className="relative z-10 py-3 text-center">
        <p className="text-[11px] text-text-secondary/50 font-medium">
          🔒 All streams are processed locally. No audio/video data is transmitted to our servers.
        </p>
      </div>
    </div>
  );
}
