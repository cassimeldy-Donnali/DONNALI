import { useEffect, useRef, useState, useCallback } from 'react';
import { Plane, Leaf } from 'lucide-react';

interface PageTransitionProps {
  targetPage: string;
  onSwap: (page: string) => void;
  children: React.ReactNode;
}

export function PageTransition({ targetPage, onSwap, children }: PageTransitionProps) {
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [overlayOpaque, setOverlayOpaque] = useState(false);
  const initialized = useRef(false);
  const running = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const runTransition = useCallback((page: string) => {
    if (running.current) return;
    running.current = true;

    clearTimers();

    setOverlayVisible(true);
    setOverlayOpaque(false);

    const t1 = setTimeout(() => {
      setOverlayOpaque(true);
    }, 20);

    const t2 = setTimeout(() => {
      onSwap(page);
      window.scrollTo({ top: 0, behavior: 'instant' });
    }, 420);

    const t3 = setTimeout(() => {
      setOverlayOpaque(false);
    }, 480);

    const t4 = setTimeout(() => {
      setOverlayVisible(false);
      running.current = false;
    }, 860);

    timers.current = [t1, t2, t3, t4];
  }, [onSwap]);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      onSwap(targetPage);
      return;
    }
    runTransition(targetPage);

    return clearTimers;
  }, [targetPage]);

  return (
    <>
      {children}

      {overlayVisible && (
        <div
          aria-hidden="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            pointerEvents: 'all',
            opacity: overlayOpaque ? 1 : 0,
            transition: 'opacity 0.36s cubic-bezier(0.4, 0, 0.2, 1)',
            background: 'linear-gradient(135deg, #0077B6 0%, #005a8f 45%, #0a7a5c 80%, #52B788 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
              opacity: overlayOpaque ? 1 : 0,
              transform: overlayOpaque ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.96)',
              transition: 'opacity 0.22s cubic-bezier(0.4, 0, 0.2, 1) 0.1s, transform 0.22s cubic-bezier(0.4, 0, 0.2, 1) 0.1s',
            }}
          >
            <div style={{ position: 'relative', width: 100, height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(255,255,255,0.18)',
                borderRadius: 28,
                backdropFilter: 'blur(4px)',
                border: '1px solid rgba(255,255,255,0.28)',
              }} />
              <Plane style={{ position: 'relative', width: 46, height: 46, color: 'white', transform: 'rotate(-45deg)' }} />
              <Leaf style={{ position: 'absolute', bottom: 10, right: 10, width: 24, height: 24, color: '#a7f3c8', fill: '#a7f3c8' }} />
            </div>

            <span style={{
              fontFamily: "'Poppins', 'Inter', sans-serif",
              fontWeight: 700,
              fontSize: 34,
              letterSpacing: '-0.02em',
              color: 'white',
              lineHeight: 1,
            }}>
              DONNALI
            </span>

            <div style={{
              width: 56,
              height: 3,
              borderRadius: 3,
              background: 'rgba(255,255,255,0.35)',
              overflow: 'hidden',
              marginTop: 6,
            }}>
              <div style={{
                height: '100%',
                background: 'white',
                borderRadius: 3,
                width: overlayOpaque ? '100%' : '0%',
                transition: 'width 0.36s cubic-bezier(0.4, 0, 0.2, 1)',
              }} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
