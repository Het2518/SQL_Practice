import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ShieldAlert, CheckCircle, Monitor, Wifi, Key, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { hasGroqKey } from '@/lib/groq';
import { useToast } from '@/shared/ui/ToastSystem';

export function InterviewPreFlight() {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [checks, setChecks] = useState({
    network: false,
    apiKey: false,
    browser: false,
  });
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const runChecks = async () => {
      // Simulate network check
      await new Promise(r => setTimeout(r, 600));
      setChecks(prev => ({ ...prev, network: true }));

      // Check API Key
      await new Promise(r => setTimeout(r, 400));
      setChecks(prev => ({ ...prev, apiKey: hasGroqKey() }));

      // Simulate Browser check (fullscreen capability)
      await new Promise(r => setTimeout(r, 500));
      const canFullscreen = !!document.documentElement.requestFullscreen;
      setChecks(prev => ({ ...prev, browser: canFullscreen }));

      setChecking(false);
    };
    runChecks();
  }, []);

  const allClear = checks.network && checks.apiKey && checks.browser;

  const handleStart = async () => {
    if (!allClear) {
      toast({ title: 'System Checks Failed', message: 'Please resolve the red items before entering.', type: 'error' });
      return;
    }
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch (err) {
      console.warn('Fullscreen failed:', err);
    }
    navigate(`/interview/arena/${companyId}`);
  };

  return (
    <div className="min-h-screen bg-bg text-text flex items-center justify-center p-6 page-enter">
      <div className="max-w-[700px] w-full bg-surface border border-border rounded-2xl shadow-xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-surface-2 px-8 py-6 border-b border-border text-center">
          <div className="mx-auto w-16 h-16 bg-error/10 text-error rounded-full flex items-center justify-center mb-4">
            <ShieldAlert size={32} />
          </div>
          <h1 className="text-2xl font-black mb-2">Proctored Interview Arena</h1>
          <p className="text-text-secondary text-sm">
            You are about to begin a strictly proctored mock interview for {companyId?.toUpperCase() || 'FAANG'}.
          </p>
        </div>

        {/* Content */}
        <div className="p-8 flex flex-col gap-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Rules */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary mb-4">Strict Proctoring Rules</h3>
              <ul className="flex flex-col gap-3 text-[14px]">
                <li className="flex gap-2 text-error"><XIcon /> No switching tabs or minimizing</li>
                <li className="flex gap-2 text-error"><XIcon /> No secondary monitors</li>
                <li className="flex gap-2 text-error"><XIcon /> No Copy, Cut, or Paste</li>
                <li className="flex gap-2 text-error"><XIcon /> No Screenshots or Printing</li>
                <li className="flex gap-2 text-error"><XIcon /> Fullscreen mode enforced</li>
              </ul>
            </div>

            {/* System Checks */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary mb-4">System Pre-Flight</h3>
              <div className="flex flex-col gap-4">
                <CheckItem 
                  icon={<Wifi size={16} />} 
                  label="Network Stability" 
                  status={checking && !checks.network ? 'loading' : checks.network ? 'pass' : 'fail'} 
                />
                <CheckItem 
                  icon={<Monitor size={16} />} 
                  label="Browser Compatibility" 
                  status={checking && !checks.browser ? 'loading' : checks.browser ? 'pass' : 'fail'} 
                />
                <CheckItem 
                  icon={<Key size={16} />} 
                  label="Groq API Key" 
                  status={checking && !checks.apiKey ? 'loading' : checks.apiKey ? 'pass' : 'fail'} 
                />
              </div>
            </div>
          </div>

          {!checks.apiKey && !checking && (
            <div className="bg-error/10 border border-error/20 rounded-xl p-4 text-sm text-error font-medium">
              You must add your Groq API Key in the Settings menu before starting the interview!
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border bg-surface-2 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/interview')} className="text-text-secondary">
            <ArrowLeft size={16} /> Back to Dashboard
          </Button>
          <Button 
            className="hero-btn-primary h-12 px-8 text-base shadow-[0_0_20px_rgba(var(--primary),0.3)]"
            disabled={!allClear || checking}
            onClick={handleStart}
          >
            Enter Arena <ArrowRight size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
}

function CheckItem({ icon, label, status }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-surface border border-border">
      <div className="flex items-center gap-3 text-sm font-medium">
        <div className="text-text-secondary">{icon}</div>
        {label}
      </div>
      <div>
        {status === 'loading' && <div className="w-4 h-4 border-2 border-border border-t-primary rounded-full animate-spin" />}
        {status === 'pass' && <CheckCircle size={18} className="text-success" />}
        {status === 'fail' && <ShieldAlert size={18} className="text-error" />}
      </div>
    </div>
  );
}

function XIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );
}
