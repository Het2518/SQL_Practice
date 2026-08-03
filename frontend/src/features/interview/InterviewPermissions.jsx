import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Camera, Monitor, ArrowRight, ShieldAlert, VideoOff, Mic } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { useProctorStore } from './useProctorStore';

export function InterviewPermissions() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [cameraGranted, setCameraGranted] = useState(false);
  const [screenGranted, setScreenGranted] = useState(false);
  const [micGranted, setMicGranted] = useState(false);
  const [error, setError] = useState(null);

  const { setCameraStream, setScreenStream, setMicStream } = useProctorStore();

  const requestCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      setCameraStream(stream);
      setCameraGranted(true);
      setError(null);
    } catch (err) {
      setError('Camera access denied. You must grant camera access to proceed.');
    }
  };

  const requestMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      setMicStream(stream);
      setMicGranted(true);
      setError(null);
    } catch (err) {
      setError('Microphone access denied. You must grant microphone access to proceed.');
    }
  };

  const requestScreen = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: { displaySurface: 'monitor' }, audio: false });
      setScreenStream(stream);
      setScreenGranted(true);
      setError(null);
    } catch (err) {
      setError('Screen share access denied. You must grant screen share access to proceed.');
    }
  };

  const allGranted = cameraGranted && screenGranted && micGranted;

  const handleNext = () => {
    if (allGranted) {
      navigate(`/interview/preflight?${searchParams.toString()}`);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-text flex items-center justify-center p-6 page-enter relative overflow-hidden">
      
      {/* Background glow effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px]" />
        <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.015]"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />
      </div>

      <div className="max-w-[950px] w-full bg-surface/80 backdrop-blur-2xl border border-border/60 rounded-3xl shadow-2xl overflow-hidden flex flex-col relative z-10 animate-fade-in-up">
        
        <div className="px-10 py-10 border-b border-border/50 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-error/50 to-transparent" />
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-error/20 to-error/5 border border-error/20 text-error rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-error/10 backdrop-blur-sm">
            <ShieldAlert size={32} />
          </div>
          <h1 className="text-3xl font-black mb-3 tracking-tight text-text">High-Security Proctoring</h1>
          <p className="text-text-secondary text-base max-w-2xl mx-auto leading-relaxed">
            This enterprise interview strictly requires continuous camera, microphone, and screen monitoring. 
            You must grant these permissions to continue.
          </p>
        </div>

        <div className="p-10 flex flex-col gap-8 bg-surface/50">
          
          {error && (
            <div className="bg-error/10 border border-error/20 text-error px-5 py-4 rounded-xl text-sm font-semibold flex items-center gap-3 animate-fade-in">
              <VideoOff size={20} /> {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Camera */}
            <div className={`p-8 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center text-center gap-4 ${cameraGranted ? 'border-success bg-success/5 shadow-[0_0_20px_rgba(34,197,94,0.1)]' : 'border-border bg-surface hover:border-border/80 hover:shadow-lg'}`}>
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-2 transition-colors ${cameraGranted ? 'bg-success text-bg' : 'bg-surface-2 text-text-secondary'}`}>
                <Camera size={28} />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Webcam Access</h3>
                <p className="text-sm text-text-secondary">Required for visual proctoring.</p>
              </div>
              <Button 
                variant={cameraGranted ? 'ghost' : 'primary'} 
                onClick={requestCamera}
                disabled={cameraGranted}
                className={`mt-auto w-full ${cameraGranted ? 'text-success hover:bg-transparent cursor-default' : 'shadow-md shadow-primary/20'}`}
              >
                {cameraGranted ? 'Granted' : 'Grant Camera'}
              </Button>
            </div>

            {/* Mic */}
            <div className={`p-8 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center text-center gap-4 ${micGranted ? 'border-success bg-success/5 shadow-[0_0_20px_rgba(34,197,94,0.1)]' : 'border-border bg-surface hover:border-border/80 hover:shadow-lg'}`}>
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-2 transition-colors ${micGranted ? 'bg-success text-bg' : 'bg-surface-2 text-text-secondary'}`}>
                <Mic size={28} />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Microphone</h3>
                <p className="text-sm text-text-secondary">Required for audio proctoring.</p>
              </div>
              <Button 
                variant={micGranted ? 'ghost' : 'primary'} 
                onClick={requestMic}
                disabled={micGranted}
                className={`mt-auto w-full ${micGranted ? 'text-success hover:bg-transparent cursor-default' : 'shadow-md shadow-primary/20'}`}
              >
                {micGranted ? 'Granted' : 'Grant Microphone'}
              </Button>
            </div>

            {/* Screen */}
            <div className={`p-8 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center text-center gap-4 ${screenGranted ? 'border-success bg-success/5 shadow-[0_0_20px_rgba(34,197,94,0.1)]' : 'border-border bg-surface hover:border-border/80 hover:shadow-lg'}`}>
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-2 transition-colors ${screenGranted ? 'bg-success text-bg' : 'bg-surface-2 text-text-secondary'}`}>
                <Monitor size={28} />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Screen Share</h3>
                <p className="text-sm text-text-secondary">Required to monitor full screen.</p>
              </div>
              <Button 
                variant={screenGranted ? 'ghost' : 'primary'} 
                onClick={requestScreen}
                disabled={screenGranted}
                className={`mt-auto w-full ${screenGranted ? 'text-success hover:bg-transparent cursor-default' : 'shadow-md shadow-primary/20'}`}
              >
                {screenGranted ? 'Granted' : 'Grant Screen'}
              </Button>
            </div>

          </div>

        </div>

        <div className="p-8 border-t border-border/50 bg-bg/50 backdrop-blur-xl flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/interview')} className="text-text-secondary hover:text-text">
            Cancel Setup
          </Button>
          <Button 
            className="h-12 px-8 text-base font-bold shadow-[0_0_24px_rgba(var(--primary),0.3)] hover:shadow-[0_0_32px_rgba(var(--primary),0.4)] transition-all rounded-xl"
            disabled={!allGranted}
            onClick={handleNext}
          >
            Continue to Pre-Flight <ArrowRight size={18} className="ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
