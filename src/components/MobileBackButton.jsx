import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export default function MobileBackButton() {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const canGoBack = window.history.length > 1;

  if (!isMobile || !canGoBack) return null;

  return (
    <button
      onClick={() => navigate(-1)}
      className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-4 -ml-1 select-none"
    >
      <ChevronLeft className="w-4 h-4 select-none" />
      Back
    </button>
  );
}