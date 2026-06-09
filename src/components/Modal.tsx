import { useEffect, type ReactNode } from 'react';
import { motion, AnimatePresence, type PanInfo } from 'motion/react';
import {
  overlayTransition,
  springSheet,
  springCenter,
  springPanel,
  shouldDismissSheet,
} from '../lib/motionPresets';

export function useModalLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [active]);
}

type OverlayProps = {
  onClose: () => void;
  className?: string;
  zIndex?: string;
};

export function ModalOverlay({ onClose, className = '', zIndex = 'z-[100]' }: OverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={overlayTransition}
      onClick={onClose}
      className={`fixed inset-0 ${zIndex} bg-on-surface/45 backdrop-blur-md modal-layer ${className}`}
    />
  );
}

type BottomSheetProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  zIndex?: string;
  showHandle?: boolean;
};

export function ModalBottomSheet({
  open,
  onClose,
  children,
  className = '',
  zIndex = 'z-[100]',
  showHandle = true,
}: BottomSheetProps) {
  useModalLock(open);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (shouldDismissSheet(info.offset.y, info.velocity.y)) onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <div className={`fixed inset-0 ${zIndex} flex items-end justify-center pointer-events-none`}>
          <ModalOverlay onClose={onClose} className="pointer-events-auto" />
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={springSheet}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={{ top: 0.08, bottom: 0.45 }}
            onDragEnd={onDragEnd}
            onClick={(e) => e.stopPropagation()}
            className={`relative z-10 pointer-events-auto w-full max-w-md bg-surface rounded-t-[2rem] shadow-2xl max-h-[88vh] overflow-y-auto no-scrollbar modal-layer ${className}`}
          >
            {showHandle && (
              <div className="sticky top-0 z-10 flex justify-center pt-3 pb-2 bg-gradient-to-b from-surface via-surface/95 to-transparent">
                <div className="w-10 h-1 rounded-full bg-outline-variant/35" />
              </div>
            )}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

type CenterDialogProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  zIndex?: string;
  overlayClassName?: string;
};

export function ModalCenterDialog({
  open,
  onClose,
  children,
  className = '',
  zIndex = 'z-[300]',
  overlayClassName = 'bg-on-surface/55 backdrop-blur-lg',
}: CenterDialogProps) {
  useModalLock(open);

  return (
    <AnimatePresence>
      {open && (
        <div className={`fixed inset-0 ${zIndex} flex items-center justify-center p-4 pointer-events-none`}>
          <ModalOverlay onClose={onClose} className={`pointer-events-auto ${overlayClassName}`} />
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={springCenter}
            onClick={(e) => e.stopPropagation()}
            className={`relative z-10 pointer-events-auto w-full max-w-sm bg-surface rounded-[2.5rem] shadow-2xl modal-layer ${className}`}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

type FullScreenProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  zIndex?: string;
  from?: 'right' | 'bottom';
};

export function ModalFullScreen({
  open,
  onClose,
  children,
  className = '',
  zIndex = 'z-[70]',
  from = 'right',
}: FullScreenProps) {
  useModalLock(open);

  const initial = from === 'right' ? { x: '100%', opacity: 0.6 } : { y: '100%', opacity: 0.6 };
  const animate = from === 'right' ? { x: 0, opacity: 1 } : { y: 0, opacity: 1 };
  const exit = from === 'right' ? { x: '100%', opacity: 0.4 } : { y: '100%', opacity: 0.4 };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          initial={initial}
          animate={animate}
          exit={exit}
          transition={springPanel}
          className={`fixed inset-0 ${zIndex} bg-surface overflow-y-auto no-scrollbar modal-layer ${className}`}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
