"use client";
import React from "react";
import { AlertTriangle, X } from "lucide-react";

type Props = {
  visible: boolean;
  message: string;
  onClose?: () => void;
};

export default function ValidationPopup({
  visible,
  message,
  onClose,
}: Props) {
  if (!visible) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed left-1/2 top-4 -translate-x-1/2 md:left-auto md:translate-x-0 md:top-auto md:bottom-4 md:right-4 z-9999 w-[90%] max-w-sm md:w-auto"
    >
      <div className="flex items-start gap-3 bg-red-700 text-white rounded-xl px-4 py-3 shadow-lg font-sans">
        <div className="shrink-0 mt-0.5">
          <AlertTriangle className="w-6 h-6 text-white" />
        </div>

        <div className="text-sm leading-snug">
          <div className="font-semibold">Erro:</div>
          <div className="mt-1 whitespace-pre-wrap">{message}</div>
        </div>

        <button
          onClick={onClose}
          aria-label="Fechar aviso"
          className="ml-auto -mr-2 mt-0.5 cursor-pointer"
        >
          <X className="text-white" />
        </button>
      </div>
    </div>
  );
}
