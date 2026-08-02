import { create } from 'zustand';

export const useProctorStore = create((set, get) => ({
  cameraStream: null,
  screenStream: null,
  
  setCameraStream: (stream) => set({ cameraStream: stream }),
  setScreenStream: (stream) => set({ screenStream: stream }),
  
  stopAllStreams: () => {
    const { cameraStream, screenStream } = get();
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
    }
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
    }
    set({ cameraStream: null, screenStream: null });
  }
}));
