import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

export function CodeBlock({ code, language = 'sql', className = '' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  return (
    <div className={`relative group my-4 rounded-xl overflow-hidden bg-[#0d1117] border border-[#30363d] shadow-sm ${className}`}>
      <div className="flex items-center justify-between px-3 py-2 bg-[#161b22] text-[#8b949e] text-[11px] font-mono border-b border-[#30363d] uppercase tracking-wider font-semibold">
        <span>{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer bg-transparent border-none p-0 focus:outline-none"
        >
          {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
          <span className={copied ? "text-emerald-400" : ""}>{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>
      <div className="p-3.5 overflow-x-auto text-[13px] text-[#c9d1d9] font-mono leading-relaxed">
        <code className="whitespace-pre-wrap break-words">{code}</code>
      </div>
    </div>
  );
}
