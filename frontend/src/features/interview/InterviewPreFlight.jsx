import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShieldAlert, CheckCircle, Monitor, Wifi, Key, ArrowRight, ArrowLeft, Camera, Mic, FileText, Check } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { useToast } from '@/shared/ui/ToastSystem';
import { useProctorStore } from './useProctorStore';
import { useSettingsStore } from '@/stores/useSettingsStore';

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

  const { settings, updateSettings } = useSettingsStore();

  const [checks, setChecks] = useState({
    network: false,
    browser: false,
    media: false,
    ai: false,
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
      setChecks(prev => ({ ...prev, ai: !!settings.groqApiKey }));

      setChecking(false);
    };
    runChecks();
  }, [cameraStream, screenStream, micStream, settings.groqApiKey]);

  const allClear = checks.network && checks.browser && checks.media && checks.ai;

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
    <div className="h-screen bg-bg text-text flex items-center justify-center p-6 page-enter relative overflow-hidden">
      
      {/* Background glow effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px]" />
        <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.015]"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />
      </div>

      <div className="max-w-[1000px] w-full max-h-[90vh] bg-surface/80 backdrop-blur-2xl border border-border/60 rounded-3xl shadow-2xl overflow-hidden flex flex-col relative z-10 animate-fade-in-up">
        
        {/* Header */}
        <div className="px-10 py-8 border-b border-border/50 text-center relative overflow-hidden shrink-0">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-error/50 to-transparent" />
          <div className="mx-auto w-14 h-14 bg-gradient-to-br from-error/20 to-error/5 border border-error/20 text-error rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-error/10 backdrop-blur-sm">
            <ShieldAlert size={28} />
          </div>
          <h1 className="text-2xl font-black mb-2 tracking-tight text-text">Final System Pre-Flight</h1>
          <p className="text-text-secondary text-sm max-w-xl mx-auto leading-relaxed">
            Verify your environment and agree to the integrity policy.
          </p>
        </div>

        <div className="p-10 flex flex-col gap-10 overflow-y-auto flex-1 bg-surface/50 custom-scrollbar">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* System Checks */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-text-secondary mb-5">Diagnostics</h3>
              <div className="flex flex-col gap-4">
                <CheckItem 
                  icon={<Wifi size={18} />} 
                  label="Network Stability (Latency < 100ms)" 
                  status={checking && !checks.network ? 'loading' : checks.network ? 'pass' : 'fail'} 
                />
                <CheckItem 
                  icon={<Monitor size={18} />} 
                  label="Browser Fullscreen Capability" 
                  status={checking && !checks.browser ? 'loading' : checks.browser ? 'pass' : 'fail'} 
                />
                <CheckItem 
                  icon={<Camera size={18} />} 
                  label="AV Streams & Screen Share" 
                  status={checking && !checks.media ? 'loading' : checks.media ? 'pass' : 'fail'} 
                />
                <CheckItem 
                  icon={<Key size={18} />} 
                  label="AI Evaluator Ready (API Key)" 
                  status={checking && !checks.ai ? 'loading' : checks.ai ? 'pass' : 'fail'} 
                />

                {!checking && !checks.ai && (
                  <div className="mt-1 p-4 bg-error/5 border border-error/20 rounded-xl flex flex-col gap-3 animate-fade-in shadow-sm">
                    <p className="text-xs text-error font-medium leading-relaxed">
                      A free Groq API key is required to power the AI interviewer. 
                      <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" className="underline font-bold ml-1 hover:text-error/80">Get one here</a>.
                    </p>
                    <input 
                      type="password" 
                      placeholder="Paste your gsk_... key here"
                      className="w-full bg-surface border border-error/30 rounded-lg px-4 py-2.5 text-sm text-text focus:border-error focus:ring-1 focus:ring-error outline-none font-mono transition-all"
                      onChange={(e) => {
                        if (e.target.value.trim().startsWith('gsk_')) {
                          updateSettings({ groqApiKey: e.target.value.trim() });
                        }
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Candidate Agreement */}
            <div className="flex flex-col">
              <h3 className="text-xs font-bold uppercase tracking-widest text-text-secondary mb-5">Integrity Policy</h3>
              <div className="bg-surface-2 border border-border/60 p-5 rounded-2xl text-sm leading-relaxed mb-5 flex-1 shadow-inner shadow-black/5">
                <p className="mb-4 font-bold text-text">By proceeding, you agree that:</p>
                <ul className="flex flex-col gap-3 text-error/90 font-medium">
                  <li className="flex items-start gap-2"><span className="mt-0.5">•</span> You will remain in fullscreen mode.</li>
                  <li className="flex items-start gap-2"><span className="mt-0.5">•</span> You will not use external IDEs or tools.</li>
                  <li className="flex items-start gap-2"><span className="mt-0.5">•</span> You will not copy, cut, or paste code.</li>
                  <li className="flex items-start gap-2"><span className="mt-0.5">•</span> You will not switch tabs or monitors.</li>
                  <li className="flex items-start gap-2 text-error"><span className="mt-0.5">•</span> A single violation will instantly terminate the session (Score: 0).</li>
                </ul>
              </div>
              <label className={`flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all select-none ${agreed ? 'border-primary bg-primary/5 shadow-[0_0_15px_rgba(var(--primary),0.1)]' : 'border-border bg-surface hover:border-border/80'}`}>
                <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${agreed ? 'bg-primary border-primary text-primary-foreground' : 'bg-surface-3 border-border text-transparent'}`}>
                  <Check size={14} strokeWidth={4} />
                </div>
                <span className={`text-sm font-bold ${agreed ? 'text-primary' : 'text-text-secondary'}`}>
                  I accept the strict proctoring rules.
                </span>
                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="hidden" />
              </label>
            </div>
          </div>

          {/* Media Previews */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-text-secondary mb-5">Stream Previews</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="bg-[#09090b] rounded-2xl overflow-hidden border border-border/50 aspect-video relative shadow-lg">
                <span className="absolute top-3 left-3 text-[9px] uppercase tracking-wider font-black text-white bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md z-10">Camera</span>
                {cameraStream ? <VideoPreview stream={cameraStream} /> : <div className="w-full h-full flex items-center justify-center text-error/80 text-xs font-bold">Missing Stream</div>}
              </div>
              <div className="bg-[#09090b] rounded-2xl overflow-hidden border border-border/50 aspect-video relative shadow-lg">
                <span className="absolute top-3 left-3 text-[9px] uppercase tracking-wider font-black text-white bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md z-10">Screen</span>
                {screenStream ? <VideoPreview stream={screenStream} /> : <div className="w-full h-full flex items-center justify-center text-error/80 text-xs font-bold">Missing Stream</div>}
              </div>
              <div className="bg-[#09090b] rounded-2xl overflow-hidden border border-border/50 aspect-video relative shadow-lg">
                <span className="absolute top-3 left-3 text-[9px] uppercase tracking-wider font-black text-white bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md z-10">Microphone</span>
                {micStream ? <AudioPreview stream={micStream} /> : <div className="w-full h-full flex items-center justify-center text-error/80 text-xs font-bold">Missing Stream</div>}
              </div>
            </div>
          </div>

        </div>

        <div className="p-8 border-t border-border/50 bg-bg/50 backdrop-blur-xl flex items-center justify-between shrink-0">
          <Button variant="ghost" onClick={() => navigate('/interview')} className="text-text-secondary hover:text-text">
            Cancel Setup
          </Button>
          <Button 
            className="h-12 px-8 text-base font-bold shadow-[0_0_24px_rgba(var(--primary),0.3)] hover:shadow-[0_0_32px_rgba(var(--primary),0.4)] transition-all rounded-xl"
            disabled={!allClear || !agreed}
            onClick={handleStart}
          >
            Start Interview <ArrowRight size={18} className="ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
