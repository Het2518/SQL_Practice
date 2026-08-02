import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Camera, Monitor, ArrowRight, ShieldAlert, VideoOff } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { useProctorStore } from './useProctorStore';

export function InterviewPermissions() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [cameraGranted, setCameraGranted] = useState(false);
  const [screenGranted, setScreenGranted] = useState(false);
  const [error, setError] = useState(null);

  const { setCameraStream, setScreenStream } = useProctorStore();

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

  const requestScreen = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      setScreenStream(stream);
      setScreenGranted(true);
      setError(null);
    } catch (err) {
      setError('Screen share access denied. You must grant screen share access to proceed.');
    }
  };

  const allGranted = cameraGranted && screenGranted;

  const handleNext = () => {
    if (allGranted) {
      navigate(`/interview/preflight?${searchParams.toString()}`);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-text flex items-center justify-center p-6 page-enter">
      <div className="max-w-[700px] w-full bg-surface border border-border rounded-2xl shadow-xl overflow-hidden flex flex-col">
        
        <div className="bg-surface-2 px-8 py-6 border-b border-border text-center">
          <div className="mx-auto w-16 h-16 bg-error/10 text-error rounded-full flex items-center justify-center mb-4">
            <ShieldAlert size={32} />
          </div>
          <h1 className="text-2xl font-black mb-2">High-Security Proctoring</h1>
          <p className="text-text-secondary text-sm">
            This interview strictly requires continuous camera and screen monitoring. 
            You must grant these permissions to continue.
          </p>
        </div>

        <div className="p-8 flex flex-col gap-6">
          
          {error && (
            <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-lg text-sm font-semibold flex items-center gap-2">
              <VideoOff size={18} /> {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Camera */}
            <div className={`p-6 rounded-xl border-2 transition-all ${cameraGranted ? 'border-success bg-success/5' : 'border-border bg-surface'}`}>
              <div className="flex flex-col items-center text-center gap-3">
                <Camera size={32} className={cameraGranted ? 'text-success' : 'text-text-secondary'} />
                <h3 className="font-bold text-lg">Webcam Access</h3>
                <p className="text-sm text-text-secondary mb-2">Required for visual proctoring during the test.</p>
                <Button 
                  variant={cameraGranted ? 'ghost' : 'primary'} 
                  onClick={requestCamera}
                  disabled={cameraGranted}
                  className={cameraGranted ? 'text-success' : ''}
                >
                  {cameraGranted ? 'Granted' : 'Grant Camera Access'}
                </Button>
              </div>
            </div>

            {/* Screen */}
            <div className={`p-6 rounded-xl border-2 transition-all ${screenGranted ? 'border-success bg-success/5' : 'border-border bg-surface'}`}>
              <div className="flex flex-col items-center text-center gap-3">
                <Monitor size={32} className={screenGranted ? 'text-success' : 'text-text-secondary'} />
                <h3 className="font-bold text-lg">Screen Share Access</h3>
                <p className="text-sm text-text-secondary mb-2">Required to monitor your full screen activity.</p>
                <Button 
                  variant={screenGranted ? 'ghost' : 'primary'} 
                  onClick={requestScreen}
                  disabled={screenGranted}
                  className={screenGranted ? 'text-success' : ''}
                >
                  {screenGranted ? 'Granted' : 'Grant Screen Access'}
                </Button>
              </div>
            </div>

          </div>

        </div>

        <div className="p-6 border-t border-border bg-surface-2 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/interview')} className="text-text-secondary">
            Cancel
          </Button>
          <Button 
            className="hero-btn-primary h-12 px-8 text-base shadow-[0_0_20px_rgba(var(--primary),0.3)]"
            disabled={!allGranted}
            onClick={handleNext}
          >
            Continue to Pre-Flight <ArrowRight size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
}
