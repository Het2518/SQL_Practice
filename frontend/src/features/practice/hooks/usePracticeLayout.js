import { useState, useCallback, useEffect, useRef } from 'react';

export function usePracticeLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('schema-sidebar-open');
    return saved !== null ? saved === 'true' : true;
  });

  const toggleSidebar = useCallback((val) => {
    setSidebarOpen((prev) => {
      const next = typeof val === 'boolean' ? val : !prev;
      localStorage.setItem('schema-sidebar-open', String(next));
      return next;
    });
  }, []);

  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [activeLeftPane, setActiveLeftPane] = useState('problem'); // 'problem' or 'discussions'
  const [showOverflow, setShowOverflow] = useState(false);

  // Column widths (px) — draggable
  const [questionW, setQuestionW] = useState(360);
  const [schemaW, setSchemaW] = useState(300);
  const [isDraggingLeft, setIsDraggingLeft] = useState(false);
  const [isDraggingRight, setIsDraggingRight] = useState(false);
  const layoutRef = useRef(null);

  const [editorHeightPct, setEditorHeightPct] = useState(50);
  const [isDraggingVertical, setIsDraggingVertical] = useState(false);
  const workspaceRef = useRef(null);

  const handleMouseDown = useCallback((e, direction) => {
    e.preventDefault();
    if (direction === 'left') setIsDraggingLeft(true);
    else if (direction === 'right') setIsDraggingRight(true);
    else if (direction === 'vertical') setIsDraggingVertical(true);
  }, []);

  // Horizontal column resize
  useEffect(() => {
    const onMove = (e) => {
      if (!layoutRef.current) return;
      const rect = layoutRef.current.getBoundingClientRect();
      if (isDraggingLeft) setQuestionW(Math.max(220, Math.min(600, e.clientX - rect.left)));
      if (isDraggingRight) setSchemaW(Math.max(180, Math.min(500, rect.right - e.clientX)));
    };
    const onUp = () => {
      setIsDraggingLeft(false);
      setIsDraggingRight(false);
    };
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
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  }, [isDraggingLeft, isDraggingRight]);

  // Vertical column resize
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDraggingVertical || !workspaceRef.current) return;
      const rect = workspaceRef.current.getBoundingClientRect();
      const relativeY = e.clientY - rect.top;
      const percentage = (relativeY / rect.height) * 100;
      setEditorHeightPct(Math.max(20, Math.min(80, percentage)));
    };
    const handleMouseUp = () => setIsDraggingVertical(false);

    if (isDraggingVertical) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
    } else {
      if (!isDraggingLeft && !isDraggingRight) document.body.style.userSelect = '';
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingVertical, isDraggingLeft, isDraggingRight]);

  return {
    sidebarOpen,
    toggleSidebar,
    rightPanelOpen,
    setRightPanelOpen,
    activeLeftPane,
    setActiveLeftPane,
    showOverflow,
    setShowOverflow,
    questionW,
    schemaW,
    editorHeightPct,
    layoutRef,
    workspaceRef,
    handleMouseDown,
  };
}
