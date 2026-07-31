import { useEffect, useRef } from 'react';

/**
 * Traps focus within a specified element for accessibility in modals.
 * @param {boolean} isActive - Whether the trap should be active
 * @returns {React.RefObject} Ref to attach to the modal container
 */
export function useFocusTrap(isActive = true) {
  const ref = useRef(null);

  useEffect(() => {
    if (!isActive) return;

    const currentRef = ref.current;
    if (!currentRef) return;

    const focusableElementsString =
      'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]';
    
    let focusableElements = Array.from(currentRef.querySelectorAll(focusableElementsString));
    
    // Filter out hidden elements
    focusableElements = focusableElements.filter((el) => {
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden' && el.offsetWidth > 0 && el.offsetHeight > 0;
    });

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) { // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else { // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    currentRef.addEventListener('keydown', handleTabKey);

    // Initial focus
    if (!currentRef.contains(document.activeElement)) {
      // Small timeout ensures the modal is fully mounted/rendered before focusing
      setTimeout(() => firstElement.focus(), 10);
    }

    return () => {
      currentRef.removeEventListener('keydown', handleTabKey);
    };
  }, [isActive]);

  return ref;
}
