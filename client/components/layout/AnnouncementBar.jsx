"use client";
import { useState } from "react";
import { X, Tag } from "lucide-react";

export default function AnnouncementBar({ coupon }) {
  const [dismissed, setDismissed] = useState(false);

  if (!coupon || dismissed) return null;

  const message = coupon.bannerTitle || `Use code ${coupon.code} for a discount!`;

  return (
    <div className="relative flex items-center justify-center bg-black text-white text-sm px-10 py-2.5">
      <Tag size={14} className="mr-2 shrink-0 opacity-80" />
      <span>
        {message}{" "}
        <code className="ml-1 rounded border border-white/30 bg-white/10 px-1.5 py-0.5 text-xs font-mono font-semibold tracking-wide">
          {coupon.code}
        </code>
      </span>
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 opacity-60 hover:opacity-100 transition-opacity"
      >
        <X size={14} />
      </button>
    </div>
  );
}
