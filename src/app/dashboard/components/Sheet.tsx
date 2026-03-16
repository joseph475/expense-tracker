"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

export default function Sheet({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <div
        className={`fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />
      <div className={`fixed inset-0 z-60 bg-white dark:bg-gray-900 transform transition-transform duration-300 ease-in-out ${
        open ? "translate-x-0" : "translate-x-full pointer-events-none"
      }`}>
        <div className="h-full flex flex-col">
          <div
            className="flex items-center justify-between px-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shrink-0"
            style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))", paddingBottom: "0.75rem" }}
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-950">
            {children}
          </div>
          {footer && (
            <div className="shrink-0 px-4 py-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
              {footer}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
