import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShieldAlert, CheckCircle, Monitor, Wifi, Key, ArrowRight, ArrowLeft, Camera, Mic, FileText, Check } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { useToast } from '@/shared/ui/ToastSystem';
import { useProctorStore } from './useProctorStore';

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);

const CheckItem = ({ icon, label, status }) => (
  <div className="flex items-center justify-between p-3 rounded-lg bg-surface border border-border">
    <div className="flex items-center gap-3">
      <div className={`text-${status === 'pass' ? 'success' : status === 'fail' ? 'error' : 'text-secondary'}`}>
        {icon}
      </div>
      <span className="text-sm font-semibold">{label}</span>
    </div>
    <div>
      {status === 'loading' && <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />}
      {status === 'pass' && <CheckCircle size={16} className="text-success" />}
      {status === 'fail' && <XIcon className="text-error" />}
    </div>
  </div>
);

const VideoPreview = ({ stream, muted = true }) => {
  const videoRef = useRef(null);
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);
  return <video ref={videoRef} autoPlay playsInline muted={muted} className="w-full h-full object-cover" />;
};

const AudioPreview = ({ stream }) => {
  const [vol, setVol] = useState(0);
  
  useEffect(() => {
    if (!stream) return;
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const microphone = audioContext.createMediaStreamSource(stream);
    microphone.connect(analyser);
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    let reqId;
    const checkVol = () => {
      analyser.getByteFrequencyData(dataArray);
      const sum = dataArray.reduce((a, b) => a + b, 0);
      setVol(Math.min(100, (sum / bufferLength) * 2));
      reqId = requestAnimationFrame(checkVol);
    };
    checkVol();
    return () => {
      cancelAnimationFrame(reqId);
      audioContext.close();
    };
  }, [stream]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
      <Mic size={24} className="text-primary mb-2" />
      <div className="w-full h-2 bg-surface-3 rounded-full overflow-hidden">
        <div className="h-full bg-primary transition-all duration-75" style={{ width: `${vol}%` }} />
      </div>
    </div>
  );
};

export function InterviewPreFlight() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { cameraStream, screenStream, micStream } = useProctorStore();

  const [checks, setChecks] = useState({
    network: false,
    browser: false,
    media: false,
  });
  const [checking, setChecking] = useState(true);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    const runChecks = async () => {
      await new Promise(r => setTimeout(r, 600));
      setChecks(prev => ({ ...prev, network: true }));

      await new Promise(r => setTimeout(r, 500));
      const canFullscreen = !!document.documentElement.requestFullscreen;
      setChecks(prev => ({ ...prev, browser: canFullscreen }));

      setChecks(prev => ({ ...prev, media: !!cameraStream && !!screenStream && !!micStream }));

      setChecking(false);
    };
    runChecks();
  }, [cameraStream, screenStream, micStream]);

  const allClear = checks.network && checks.browser && checks.media;

  const handleStart = async () => {
    if (!allClear) {
      toast({ title: 'System Checks Failed', message: 'Please resolve the red items before entering.', type: 'error' });
      return;
    }
    if (!agreed) {
      toast({ title: 'Agreement Required', message: 'You must agree to the integrity policy.', type: 'warning' });
      return;
    }
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
        if (navigator.keyboard && navigator.keyboard.lock) {
          await navigator.keyboard.lock(['Escape']).catch(() => {});
        }
      }
    } catch (err) {
      console.warn('Fullscreen/KeyboardLock failed:', err);
    }
    navigate(`/interview/arena?${searchParams.toString()}`);
  };

  return (
    <div className="h-screen bg-bg text-text flex items-center justify-center p-6 page-enter overflow-hidden">
      <div className="max-w-[900px] w-full max-h-full bg-surface border border-border rounded-2xl shadow-xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-surface-2 px-8 py-6 border-b border-border text-center shrink-0">
          <div className="mx-auto w-16 h-16 bg-error/10 text-error rounded-full flex items-center justify-center mb-4">
            <ShieldAlert size={32} />
          </div>
          <h1 className="text-2xl font-black mb-2">Final System Pre-Flight</h1>
          <p className="text-text-secondary text-sm">
            Verify your environment and agree to the integrity policy.
          </p>
        </div>

        <div className="p-8 flex flex-col gap-8 overflow-y-auto flex-1">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* System Checks */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary mb-4">Diagnostics</h3>
              <div className="flex flex-col gap-3">
                <CheckItem 
                  icon={<Wifi size={16} />} 
                  label="Network Stability (Latency < 100ms)" 
                  status={checking && !checks.network ? 'loading' : checks.network ? 'pass' : 'fail'} 
                />
                <CheckItem 
                  icon={<Monitor size={16} />} 
                  label="Browser Fullscreen Capability" 
                  status={checking && !checks.browser ? 'loading' : checks.browser ? 'pass' : 'fail'} 
                />
                <CheckItem 
                  icon={<Camera size={16} />} 
                  label="AV Streams & Screen Share" 
                  status={checking && !checks.media ? 'loading' : checks.media ? 'pass' : 'fail'} 
                />
              </div>
            </div>

            {/* Candidate Agreement */}
            <div className="flex flex-col">
              <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary mb-4">Integrity Policy</h3>
              <div className="bg-surface-2 border border-border p-4 rounded-xl text-sm leading-relaxed mb-4 flex-1">
                <p className="mb-3 font-semibold text-text">By proceeding, you agree that:</p>
                <ul className="flex flex-col gap-2 text-error font-medium">
                  <li>• You will remain in fullscreen mode.</li>
                  <li>• You will not use external IDEs or tools.</li>
                  <li>• You will not copy, cut, or paste code.</li>
                  <li>• You will not switch tabs or monitors.</li>
                  <li>• A single violation will instantly terminate the session (Score: 0).</li>
                </ul>
              </div>
              <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all select-none ${agreed ? 'border-primary bg-primary/5' : 'border-border bg-surface'}`}>
                <div className={`w-6 h-6 rounded-md border flex items-center justify-center shrink-0 ${agreed ? 'bg-primary border-primary text-primary-foreground' : 'bg-surface-2 border-border text-transparent'}`}>
                  <Check size={14} strokeWidth={3} />
                </div>
                <span className={`text-sm font-semibold ${agreed ? 'text-primary' : 'text-text-secondary'}`}>
                  I accept the strict proctoring rules.
                </span>
                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="hidden" />
              </label>
            </div>
          </div>

          {/* Media Previews */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary mb-4">Stream Previews</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-black rounded-lg overflow-hidden border border-border aspect-video relative">
                <span className="absolute top-2 left-2 text-[10px] uppercase font-bold text-white bg-black/50 px-2 py-1 rounded z-10">Camera</span>
                {cameraStream ? <VideoPreview stream={cameraStream} /> : <div className="w-full h-full flex items-center justify-center text-error text-xs font-semibold">Missing</div>}
              </div>
              <div className="bg-black rounded-lg overflow-hidden border border-border aspect-video relative">
                <span className="absolute top-2 left-2 text-[10px] uppercase font-bold text-white bg-black/50 px-2 py-1 rounded z-10">Screen</span>
                {screenStream ? <VideoPreview stream={screenStream} /> : <div className="w-full h-full flex items-center justify-center text-error text-xs font-semibold">Missing</div>}
              </div>
              <div className="bg-black rounded-lg overflow-hidden border border-border aspect-video relative">
                <span className="absolute top-2 left-2 text-[10px] uppercase font-bold text-white bg-black/50 px-2 py-1 rounded z-10">Microphone</span>
                {micStream ? <AudioPreview stream={micStream} /> : <div className="w-full h-full flex items-center justify-center text-error text-xs font-semibold">Missing</div>}
              </div>
            </div>
          </div>

        </div>

        <div className="p-6 border-t border-border bg-surface-2 flex items-center justify-between shrink-0">
          <Button variant="ghost" onClick={() => navigate('/interview')} className="text-text-secondary">
            Cancel
          </Button>
          <Button 
            className="hero-btn-primary h-12 px-8 text-base shadow-[0_0_20px_rgba(var(--primary),0.3)]"
            disabled={!allClear || !agreed}
            onClick={handleStart}
          >
            Start Interview <ArrowRight size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
}
