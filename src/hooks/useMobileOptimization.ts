import { useState, useEffect, useRef } from 'react';

export interface TouchGesture {
  type: 'tap' | 'long-press' | 'swipe' | 'pinch' | 'drag';
  startPos: { x: number; y: number };
  currentPos: { x: number; y: number };
  duration: number;
  distance: number;
}

interface MobileOptimizationConfig {
  enableHapticFeedback: boolean;
  longPressThreshold: number;
  dragThreshold: number;
  swipeThreshold: number;
  tapDelay: number;
}

const DEFAULT_CONFIG: MobileOptimizationConfig = {
  enableHapticFeedback: true,
  longPressThreshold: 500,
  dragThreshold: 10,
  swipeThreshold: 50,
  tapDelay: 300,
};

export const useMobileOptimization = (config: Partial<MobileOptimizationConfig> = {}) => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [screenSize, setScreenSize] = useState({ width: 0, height: 0 });
  const [safeArea, setSafeArea] = useState({ top: 0, bottom: 0, left: 0, right: 0 });

  // Touch handling state
  const [touchState, setTouchState] = useState<{
    startTime: number;
    startPos: { x: number; y: number } | null;
    currentPos: { x: number; y: number } | null;
    isPressed: boolean;
  }>({
    startTime: 0,
    startPos: null,
    currentPos: null,
    isPressed: false,
  });

  const longPressTimer = useRef<NodeJS.Timeout>();
  const tapTimer = useRef<NodeJS.Timeout>();

  // Device detection
  useEffect(() => {
    const checkDevice = () => {
      const userAgent = navigator.userAgent;
      const width = window.innerWidth;
      const height = window.innerHeight;

      // Mobile detection
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      const isMobileDevice = mobileRegex.test(userAgent) || width <= 768;

      // Tablet detection
      const isTabletDevice = (
        (userAgent.includes('iPad')) ||
        (userAgent.includes('Android') && !userAgent.includes('Mobile')) ||
        (width > 768 && width <= 1024)
      );

      setIsMobile(isMobileDevice && !isTabletDevice);
      setIsTablet(isTabletDevice);

      // Screen size and orientation
      setScreenSize({ width, height });
      setOrientation(width > height ? 'landscape' : 'portrait');

      // Safe area detection (iOS)
      const getComputedSafeArea = () => {
        const style = getComputedStyle(document.documentElement);
        return {
          top: parseInt(style.getPropertyValue('--sat')) || 0,
          bottom: parseInt(style.getPropertyValue('--sab')) || 0,
          left: parseInt(style.getPropertyValue('--sal')) || 0,
          right: parseInt(style.getPropertyValue('--sar')) || 0,
        };
      };

      setSafeArea(getComputedSafeArea());
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    window.addEventListener('orientationchange', checkDevice);

    return () => {
      window.removeEventListener('resize', checkDevice);
      window.removeEventListener('orientationchange', checkDevice);
    };
  }, []);

  // Haptic feedback utility
  const triggerHapticFeedback = (type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (!finalConfig.enableHapticFeedback) return;

    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [50],
        heavy: [100],
      };
      navigator.vibrate(patterns[type]);
    }
  };

  // Touch gesture handlers
  const createTouchHandlers = (callbacks: {
    onTap?: (pos: { x: number; y: number }) => void;
    onLongPress?: (pos: { x: number; y: number }) => void;
    onDragStart?: (pos: { x: number; y: number }) => void;
    onDragMove?: (current: { x: number; y: number }, start: { x: number; y: number }) => void;
    onDragEnd?: (current: { x: number; y: number }, start: { x: number; y: number }) => void;
    onSwipe?: (direction: 'up' | 'down' | 'left' | 'right', distance: number) => void;
  }) => {
    const handleTouchStart = (e: React.TouchEvent) => {
      const touch = e.touches[0];
      const pos = { x: touch.clientX, y: touch.clientY };

      setTouchState({
        startTime: Date.now(),
        startPos: pos,
        currentPos: pos,
        isPressed: true,
      });

      // Long press timer
      longPressTimer.current = setTimeout(() => {
        if (touchState.isPressed && callbacks.onLongPress) {
          triggerHapticFeedback('medium');
          callbacks.onLongPress(pos);
        }
      }, finalConfig.longPressThreshold);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
      if (!touchState.startPos || !touchState.isPressed) return;

      const touch = e.touches[0];
      const currentPos = { x: touch.clientX, y: touch.clientY };

      setTouchState(prev => ({ ...prev, currentPos }));

      const distance = Math.sqrt(
        Math.pow(currentPos.x - touchState.startPos!.x, 2) +
        Math.pow(currentPos.y - touchState.startPos!.y, 2)
      );

      // Start drag if threshold exceeded
      if (distance > finalConfig.dragThreshold) {
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
        }

        if (callbacks.onDragStart && distance === finalConfig.dragThreshold) {
          callbacks.onDragStart(touchState.startPos);
        }

        if (callbacks.onDragMove) {
          callbacks.onDragMove(currentPos, touchState.startPos);
        }
      }
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
      const touch = e.changedTouches[0];
      const endPos = { x: touch.clientX, y: touch.clientY };
      const duration = Date.now() - touchState.startTime;

      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }

      if (touchState.startPos) {
        const deltaX = endPos.x - touchState.startPos.x;
        const deltaY = endPos.y - touchState.startPos.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        if (distance <= finalConfig.dragThreshold && duration < finalConfig.longPressThreshold) {
          // This was a tap
          if (callbacks.onTap) {
            // Add tap delay to prevent accidental double taps
            if (tapTimer.current) {
              clearTimeout(tapTimer.current);
            }

            tapTimer.current = setTimeout(() => {
              callbacks.onTap!(endPos);
            }, finalConfig.tapDelay);
          }
        } else if (distance > finalConfig.swipeThreshold && callbacks.onSwipe) {
          // This was a swipe
          const direction = Math.abs(deltaX) > Math.abs(deltaY)
            ? (deltaX > 0 ? 'right' : 'left')
            : (deltaY > 0 ? 'down' : 'up');

          callbacks.onSwipe(direction, distance);
        } else if (distance > finalConfig.dragThreshold && callbacks.onDragEnd) {
          // This was a drag
          callbacks.onDragEnd(endPos, touchState.startPos);
        }
      }

      setTouchState({
        startTime: 0,
        startPos: null,
        currentPos: null,
        isPressed: false,
      });
    };

    return {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    };
  };

  // Utility functions
  const getOptimizedButtonSize = (size: 'small' | 'medium' | 'large' = 'medium') => {
    if (!isMobile) return undefined;

    const sizes = {
      small: { minHeight: '44px', minWidth: '44px' },
      medium: { minHeight: '48px', minWidth: '48px' },
      large: { minHeight: '56px', minWidth: '56px' },
    };

    return sizes[size];
  };

  const getOptimizedSpacing = (spacing: 'tight' | 'normal' | 'loose' = 'normal') => {
    if (!isMobile) return undefined;

    const spacings = {
      tight: '8px',
      normal: '16px',
      loose: '24px',
    };

    return spacings[spacing];
  };

  const getMobileClasses = () => {
    const classes = [];

    if (isMobile) {
      classes.push('mobile-optimized');
    }

    if (isTablet) {
      classes.push('tablet-optimized');
    }

    classes.push(`orientation-${orientation}`);

    return classes.join(' ');
  };

  // CSS custom properties for responsive design
  const getCSSVariables = () => ({
    '--screen-width': `${screenSize.width}px`,
    '--screen-height': `${screenSize.height}px`,
    '--safe-area-inset-top': `${safeArea.top}px`,
    '--safe-area-inset-bottom': `${safeArea.bottom}px`,
    '--safe-area-inset-left': `${safeArea.left}px`,
    '--safe-area-inset-right': `${safeArea.right}px`,
    '--mobile-spacing': getOptimizedSpacing(),
  });

  return {
    // Device information
    isMobile,
    isTablet,
    isDesktop: !isMobile && !isTablet,
    orientation,
    screenSize,
    safeArea,

    // Touch handling
    createTouchHandlers,
    touchState,

    // Utilities
    triggerHapticFeedback,
    getOptimizedButtonSize,
    getOptimizedSpacing,
    getMobileClasses,
    getCSSVariables,

    // Configuration
    config: finalConfig,
  };
};

export default useMobileOptimization;