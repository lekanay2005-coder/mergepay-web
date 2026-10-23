"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

let dialogCount = 0;

export function Dialog({
  open,
  onClose,
  title,
  children,
  className,
  description,
  dismissible = true,
  triggerRef,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
  description?: string;
  dismissible?: boolean;
  triggerRef?: React.RefObject<HTMLElement | null>;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();

  const getFocusableElements = useCallback(() => {
    if (!contentRef.current) return [];
    return Array.from(
      contentRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((element) => !element.hasAttribute("disabled") && !element.getAttribute("aria-hidden"));
  }, []);

  const trapFocus = useCallback(
    (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const focusable = getFocusableElements();
      if (focusable.length === 0) {
        event.preventDefault();
        contentRef.current?.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (!contentRef.current?.contains(document.activeElement)) {
        event.preventDefault();
        if (event.shiftKey) {
          last.focus();
        } else {
          first.focus();
        }
        return;
      }

      if (event.shiftKey) {
        if (document.activeElement === first) {
          event.preventDefault();
          last.focus();
        }
      } else if (document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [getFocusableElements]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape" && dismissible) {
        event.preventDefault();
        onClose();
        requestAnimationFrame(() => previousFocusRef.current?.focus());
        return;
      }
      trapFocus(event);
    },
    [dismissible, onClose, trapFocus]
  );

  useEffect(() => {
    if (!open) return;

    previousFocusRef.current = (triggerRef?.current ?? (document.activeElement as HTMLElement | null)) ?? null;
    dialogCount += 1;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    requestAnimationFrame(() => {
      const focusable = getFocusableElements();
      const target = focusable[0] ?? contentRef.current;
      target?.focus();
    });

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      dialogCount = Math.max(0, dialogCount - 1);
      if (dialogCount <= 0) document.body.style.overflow = "";
      requestAnimationFrame(() => previousFocusRef.current?.focus());
    };
  }, [open, handleKeyDown, getFocusableElements, triggerRef]);

  if (typeof document === "undefined") return null;

  const describedById = description ? descriptionId : undefined;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60"
          onClick={dismissible ? onClose : undefined}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={describedById}
        >
          <motion.div
            ref={contentRef}
            tabIndex={-1}
            initial={{ scale: 0.92, y: 16, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className={cn(
              "w-full max-w-lg max-h-[90vh] overflow-y-auto bg-cream border-3 border-ink rounded-2xl shadow-brutal-xl",
              className
            )}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b-3 border-ink bg-butter px-5 py-3 rounded-t-[13px] sticky top-0 z-10">
              <h2 id={titleId} className="font-display text-base uppercase tracking-tight">
                {title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                disabled={!dismissible}
                aria-label="Close dialog"
                className="border-2 border-ink rounded-lg bg-cream p-1 shadow-brutal-sm hover:bg-flamingo transition-colors disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-cream"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {description && <div id={descriptionId} className="sr-only">{description}</div>}
            <div className="p-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
