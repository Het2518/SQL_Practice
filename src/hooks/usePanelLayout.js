import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook to manage all resizable panel logic in the Practice View.
 * Handles both the horizontal resizing (sidebars) and vertical resizing (editor/results).
 */
export function usePanelLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [showOverflow, setShowOverflow] = useState(false);

  // Column widths (px) — draggable
  const [questionW, setQuestionW] = useState(360);
  const [schemaW, setSchemaW] = useState(280);
  const [isDraggingLeft, setIsDraggingLeft] = useState(false);
  const [isDraggingRight, setIsDraggingRight] = useState(false);
  const layoutRef = useRef(null);

  // Horizontal column resize
  useEffect(() => {
    let animationFrameId;
    const onMove = (e) => {
      if (!layoutRef.current) return;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(() => {
        const rect = layoutRef.current.getBoundingClientRect();
        if (isDraggingLeft) setQuestionW(Math.max(220, Math.min(600, e.clientX - rect.left)));
        if (isDraggingRight) setSchemaW(Math.max(180, Math.min(500, rect.right - e.clientX)));
      });
    };
    const onUp = () => { setIsDraggingLeft(false); setIsDraggingRight(false); };
    
    if (isDraggingLeft || isDraggingRight) {
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'col-resize';
    } else {
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    }
    return () => { 
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      document.removeEventListener('mousemove', onMove); 
      document.removeEventListener('mouseup', onUp); 
    };
  }, [isDraggingLeft, isDraggingRight]);

  // Vertical editor/results resize
  const workspaceRef = useRef(null);
  const [editorHeightPct, setEditorHeightPct] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    let animationFrameId;
    const handleMouseMove = (e) => {
      if (!isDragging || !workspaceRef.current) return;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(() => {
        const rect = workspaceRef.current.getBoundingClientRect();
        let newPct = ((e.clientY - rect.top) / rect.height) * 100;
        if (newPct < 15) newPct = 15;
        if (newPct > 85) newPct = 85;
        setEditorHeightPct(newPct);
      });
    };

    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'row-resize';
    } else {
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const toggleSidebar = useCallback(() => setSidebarOpen(prev => !prev), []);
  const toggleRightPanel = useCallback(() => setRightPanelOpen(prev => !prev), []);

  return {
    sidebarOpen,
    toggleSidebar,
    rightPanelOpen,
    toggleRightPanel,
    showOverflow,
    setShowOverflow,
    questionW,
    schemaW,
    setIsDraggingLeft,
    setIsDraggingRight,
    layoutRef,
    editorHeightPct,
    isDragging,
    setIsDragging,
    workspaceRef
  };
}
