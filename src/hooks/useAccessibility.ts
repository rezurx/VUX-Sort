import { useState, useEffect, useRef, useCallback } from 'react';

interface AccessibilityOptions {
  enableKeyboardNavigation: boolean;
  enableScreenReaderAnnouncements: boolean;
  enableHighContrast: boolean;
  enableReducedMotion: boolean;
  enableFocusTrapping: boolean;
  announceRegion?: string;
}

interface FocusableElement {
  element: HTMLElement;
  id: string;
  role: string;
  tabIndex: number;
}

interface KeyboardShortcuts {
  [key: string]: {
    description: string;
    handler: () => void;
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
  };
}

const DEFAULT_OPTIONS: AccessibilityOptions = {
  enableKeyboardNavigation: true,
  enableScreenReaderAnnouncements: true,
  enableHighContrast: false,
  enableReducedMotion: false,
  enableFocusTrapping: false,
  announceRegion: 'polite',
};

export const useAccessibility = (options: Partial<AccessibilityOptions> = {}) => {
  const finalOptions = { ...DEFAULT_OPTIONS, ...options };

  // State
  const [currentFocusIndex, setCurrentFocusIndex] = useState(0);
  const [focusableElements, setFocusableElements] = useState<FocusableElement[]>([]);
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [keyboardShortcuts, setKeyboardShortcuts] = useState<KeyboardShortcuts>({});

  // Refs
  const announcementRegionRef = useRef<HTMLDivElement | null>(null);
  const focusTrapRef = useRef<HTMLElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Screen reader announcements
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!finalOptions.enableScreenReaderAnnouncements || !announcementRegionRef.current) return;

    announcementRegionRef.current.textContent = message;
    announcementRegionRef.current.setAttribute('aria-live', priority);

    // Clear after announcement to allow re-announcements
    setTimeout(() => {
      if (announcementRegionRef.current) {
        announcementRegionRef.current.textContent = '';
      }
    }, 1000);
  }, [finalOptions.enableScreenReaderAnnouncements]);

  // Find focusable elements
  const updateFocusableElements = useCallback((container?: HTMLElement) => {
    const targetContainer = container || document;
    const focusableSelectors = [
      'button:not([disabled]):not([tabindex="-1"])',
      'input:not([disabled]):not([tabindex="-1"])',
      'select:not([disabled]):not([tabindex="-1"])',
      'textarea:not([disabled]):not([tabindex="-1"])',
      'a[href]:not([tabindex="-1"])',
      '[tabindex]:not([tabindex="-1"])',
      '[role="button"]:not([disabled]):not([tabindex="-1"])',
      '[role="checkbox"]:not([disabled]):not([tabindex="-1"])',
      '[role="radio"]:not([disabled]):not([tabindex="-1"])',
      '[contenteditable="true"]:not([tabindex="-1"])',
    ];

    const elements = Array.from(
      targetContainer.querySelectorAll(focusableSelectors.join(', '))
    ) as HTMLElement[];

    const focusableElementsData: FocusableElement[] = elements.map((element, index) => ({
      element,
      id: element.id || `focusable-${index}`,
      role: element.getAttribute('role') || element.tagName.toLowerCase(),
      tabIndex: parseInt(element.getAttribute('tabindex') || '0'),
    }));

    setFocusableElements(focusableElementsData);
    return focusableElementsData;
  }, []);

  // Keyboard navigation
  const handleKeyboardNavigation = useCallback((event: KeyboardEvent) => {
    if (!finalOptions.enableKeyboardNavigation) return;

    const { key, ctrlKey, shiftKey, altKey } = event;

    // Handle custom keyboard shortcuts
    const shortcutKey = `${ctrlKey ? 'ctrl+' : ''}${shiftKey ? 'shift+' : ''}${altKey ? 'alt+' : ''}${key.toLowerCase()}`;
    const shortcut = keyboardShortcuts[shortcutKey];

    if (shortcut) {
      event.preventDefault();
      shortcut.handler();
      announce(`Executed shortcut: ${shortcut.description}`);
      return;
    }

    // Standard navigation keys
    switch (key) {
      case 'Tab':
        // Custom tab handling if needed
        if (focusableElements.length === 0) updateFocusableElements();
        break;

      case 'Escape':
        // Close modals, exit focus traps, etc.
        if (focusTrapRef.current && previousFocusRef.current) {
          previousFocusRef.current.focus();
          announce('Returned to previous focus');
        }
        break;

      case 'F1':
        event.preventDefault();
        announce('Help: Press Tab to navigate, Space or Enter to activate, Escape to close');
        break;

      case 'ArrowDown':
      case 'ArrowUp':
        // Handle custom arrow navigation in lists
        if (focusableElements.length > 0) {
          event.preventDefault();
          const direction = key === 'ArrowDown' ? 1 : -1;
          const newIndex = Math.max(0, Math.min(focusableElements.length - 1, currentFocusIndex + direction));
          setCurrentFocusIndex(newIndex);
          focusableElements[newIndex]?.element.focus();
          announce(`Focused ${focusableElements[newIndex]?.role} ${newIndex + 1} of ${focusableElements.length}`);
        }
        break;

      case ' ':
      case 'Enter':
        // Handle activation of focused elements
        const activeElement = document.activeElement as HTMLElement;
        if (activeElement && (activeElement.getAttribute('role') === 'button' || activeElement.tagName === 'DIV')) {
          activeElement.click();
          announce(`Activated ${activeElement.textContent || activeElement.getAttribute('aria-label') || 'element'}`);
        }
        break;
    }
  }, [finalOptions.enableKeyboardNavigation, keyboardShortcuts, focusableElements, currentFocusIndex, announce, updateFocusableElements]);

  // Focus trapping
  const trapFocus = useCallback((container: HTMLElement) => {
    if (!finalOptions.enableFocusTrapping) return;

    previousFocusRef.current = document.activeElement as HTMLElement;
    focusTrapRef.current = container;

    const focusableInContainer = updateFocusableElements(container);

    if (focusableInContainer.length > 0) {
      focusableInContainer[0].element.focus();
      setCurrentFocusIndex(0);
    }

    announce('Focus trapped in dialog');
  }, [finalOptions.enableFocusTrapping, updateFocusableElements, announce]);

  const releaseFocus = useCallback(() => {
    if (previousFocusRef.current) {
      previousFocusRef.current.focus();
      announce('Focus released from dialog');
    }
    focusTrapRef.current = null;
    previousFocusRef.current = null;
  }, [announce]);

  // High contrast mode
  const toggleHighContrast = useCallback(() => {
    const newValue = !isHighContrast;
    setIsHighContrast(newValue);
    document.documentElement.classList.toggle('high-contrast', newValue);
    announce(`High contrast mode ${newValue ? 'enabled' : 'disabled'}`);
  }, [isHighContrast, announce]);

  // Reduced motion
  const toggleReducedMotion = useCallback(() => {
    const newValue = !reduceMotion;
    setReduceMotion(newValue);
    document.documentElement.classList.toggle('reduce-motion', newValue);
    announce(`Reduced motion ${newValue ? 'enabled' : 'disabled'}`);
  }, [reduceMotion, announce]);

  // Keyboard shortcuts management
  const addKeyboardShortcut = useCallback((key: string, description: string, handler: () => void, modifiers?: { ctrl?: boolean; shift?: boolean; alt?: boolean }) => {
    const shortcutKey = `${modifiers?.ctrl ? 'ctrl+' : ''}${modifiers?.shift ? 'shift+' : ''}${modifiers?.alt ? 'alt+' : ''}${key.toLowerCase()}`;

    setKeyboardShortcuts(prev => ({
      ...prev,
      [shortcutKey]: { description, handler, ...modifiers }
    }));
  }, []);

  const removeKeyboardShortcut = useCallback((key: string, modifiers?: { ctrl?: boolean; shift?: boolean; alt?: boolean }) => {
    const shortcutKey = `${modifiers?.ctrl ? 'ctrl+' : ''}${modifiers?.shift ? 'shift+' : ''}${modifiers?.alt ? 'alt+' : ''}${key.toLowerCase()}`;

    setKeyboardShortcuts(prev => {
      const newShortcuts = { ...prev };
      delete newShortcuts[shortcutKey];
      return newShortcuts;
    });
  }, []);

  // ARIA utilities
  const createAriaProps = useCallback((options: {
    label?: string;
    describedBy?: string;
    expanded?: boolean;
    selected?: boolean;
    checked?: boolean;
    disabled?: boolean;
    role?: string;
    live?: 'off' | 'polite' | 'assertive';
  }) => {
    const props: Record<string, any> = {};

    if (options.label) props['aria-label'] = options.label;
    if (options.describedBy) props['aria-describedby'] = options.describedBy;
    if (options.expanded !== undefined) props['aria-expanded'] = options.expanded;
    if (options.selected !== undefined) props['aria-selected'] = options.selected;
    if (options.checked !== undefined) props['aria-checked'] = options.checked;
    if (options.disabled !== undefined) props['aria-disabled'] = options.disabled;
    if (options.role) props['role'] = options.role;
    if (options.live) props['aria-live'] = options.live;

    return props;
  }, []);

  // Color contrast checking
  const checkColorContrast = useCallback((foreground: string, background: string): { ratio: number; wcagAA: boolean; wcagAAA: boolean } => {
    // Simple contrast ratio calculation (simplified version)
    const getLuminance = (color: string): number => {
      // This is a simplified implementation - in production, use a proper color library
      const hex = color.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16) / 255;
      const g = parseInt(hex.substr(2, 2), 16) / 255;
      const b = parseInt(hex.substr(4, 2), 16) / 255;

      const sRGB = [r, g, b].map(c => {
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });

      return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
    };

    const l1 = getLuminance(foreground);
    const l2 = getLuminance(background);
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

    return {
      ratio,
      wcagAA: ratio >= 4.5,
      wcagAAA: ratio >= 7
    };
  }, []);

  // Initialize accessibility features
  useEffect(() => {
    if (finalOptions.enableKeyboardNavigation) {
      document.addEventListener('keydown', handleKeyboardNavigation);
    }

    // Check for user preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)');

    if (prefersReducedMotion.matches) {
      setReduceMotion(true);
      document.documentElement.classList.add('reduce-motion');
    }

    if (prefersHighContrast.matches) {
      setIsHighContrast(true);
      document.documentElement.classList.add('high-contrast');
    }

    // Listen for preference changes
    const handleReducedMotionChange = (e: MediaQueryListEvent) => {
      setReduceMotion(e.matches);
      document.documentElement.classList.toggle('reduce-motion', e.matches);
    };

    const handleHighContrastChange = (e: MediaQueryListEvent) => {
      setIsHighContrast(e.matches);
      document.documentElement.classList.toggle('high-contrast', e.matches);
    };

    prefersReducedMotion.addEventListener('change', handleReducedMotionChange);
    prefersHighContrast.addEventListener('change', handleHighContrastChange);

    return () => {
      document.removeEventListener('keydown', handleKeyboardNavigation);
      prefersReducedMotion.removeEventListener('change', handleReducedMotionChange);
      prefersHighContrast.removeEventListener('change', handleHighContrastChange);
    };
  }, [finalOptions.enableKeyboardNavigation, handleKeyboardNavigation]);

  // Create announcement region on mount
  useEffect(() => {
    if (!finalOptions.enableScreenReaderAnnouncements) return;

    const region = document.createElement('div');
    region.id = 'accessibility-announcements';
    region.setAttribute('aria-live', finalOptions.announceRegion || 'polite');
    region.setAttribute('aria-atomic', 'true');
    region.style.position = 'absolute';
    region.style.left = '-10000px';
    region.style.width = '1px';
    region.style.height = '1px';
    region.style.overflow = 'hidden';

    document.body.appendChild(region);
    announcementRegionRef.current = region;

    return () => {
      if (announcementRegionRef.current) {
        document.body.removeChild(announcementRegionRef.current);
      }
    };
  }, [finalOptions.enableScreenReaderAnnouncements, finalOptions.announceRegion]);

  return {
    // State
    isHighContrast,
    reduceMotion,
    focusableElements,
    currentFocusIndex,

    // Methods
    announce,
    trapFocus,
    releaseFocus,
    toggleHighContrast,
    toggleReducedMotion,
    updateFocusableElements,
    addKeyboardShortcut,
    removeKeyboardShortcut,
    createAriaProps,
    checkColorContrast,

    // Refs for integration
    announcementRegionRef,
    focusTrapRef,

    // Configuration
    options: finalOptions,
    keyboardShortcuts,
  };
};

export default useAccessibility;