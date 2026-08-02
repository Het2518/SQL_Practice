import { create } from 'zustand';

export const useProctorStore = create((set, get) => ({
  cameraStream: null,
  screenStream: null,
  micStream: null,
  
  // Strict Proctoring tracking
  violations: [], // { type, timestamp, message }
  isTerminated: false,
  
  // Session Recovery
  sessionState: null,
  
  setCameraStream: (stream) => set({ cameraStream: stream }),
  setScreenStream: (stream) => set({ screenStream: stream }),
  setMicStream: (stream) => set({ micStream: stream }),
  
  addViolation: (type, message) => {
    set((state) => ({
      violations: [...state.violations, { type, message, timestamp: Date.now() }],
      isTerminated: true // Zero tolerance
    }));
  },
  
  resetProctoring: () => set({ violations: [], isTerminated: false }),
  
  saveSessionState: (state) => {
    set({ sessionState: state });
    try {
      localStorage.setItem('interview_session', JSON.stringify(state));
    } catch(e) {}
  },
  
  restoreSessionState: () => {
    try {
      const saved = localStorage.getItem('interview_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        set({ sessionState: parsed });
        return parsed;
      }
    } catch(e) {}
    return null;
  },
  
  clearSessionState: () => {
    set({ sessionState: null });
    try {
      localStorage.removeItem('interview_session');
    } catch(e) {}
  },

  stopAllStreams: () => {
    const { cameraStream, screenStream, micStream } = get();
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
    }
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
    }
    if (micStream) {
      micStream.getTracks().forEach(track => track.stop());
    }
    set({ cameraStream: null, screenStream: null, micStream: null });
  }
}));
