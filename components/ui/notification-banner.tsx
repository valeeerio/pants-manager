"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { CheckCircle, AlertCircle, AlertTriangle } from "lucide-react";

type NotificationType = "success" | "error" | "warning";

interface NotificationBannerProps {
  type: NotificationType;
  message: string;
  onDismiss: () => void;
}

const CONFIG = {
  success: {
    wrapper: "border-emerald-200/60 bg-gradient-to-r from-emerald-50 to-green-50/40",
    badge: "bg-emerald-100 text-emerald-700",
    text: "text-emerald-800",
    Icon: CheckCircle,
  },
  error: {
    wrapper: "border-red-200/60 bg-gradient-to-r from-red-50 to-rose-50/40",
    badge: "bg-red-100 text-red-700",
    text: "text-red-800",
    Icon: AlertCircle,
  },
  warning: {
    wrapper: "border-amber-200/60 bg-gradient-to-r from-amber-50 to-yellow-50/40",
    badge: "bg-amber-100 text-amber-700",
    text: "text-amber-800",
    Icon: AlertTriangle,
  },
};

export function NotificationBanner({ type, message, onDismiss }: NotificationBannerProps) {
  const { wrapper, badge, text, Icon } = CONFIG[type];

  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return createPortal(
    <div className={`fixed right-4 top-4 z-[500] flex items-center gap-3 rounded-xl border ${wrapper} px-4 py-3 shadow-md animate-fade-in`}>
      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${badge}`}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <p className={`text-[13px] font-medium ${text}`}>{message}</p>
    </div>,
    document.body
  );
}
