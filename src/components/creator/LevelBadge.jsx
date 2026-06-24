import React from "react";
import { levelConfig } from "@/lib/creatorUtils";

export default function LevelBadge({ level, size = "md" }) {
  const cfg = levelConfig[level] || levelConfig.Bronze;
  const sizes = {
    sm: "text-xs px-2 py-0.5 gap-1",
    md: "text-sm px-3 py-1 gap-1.5",
    lg: "text-base px-4 py-1.5 gap-2 font-semibold",
  };
  return (
    <span className={`inline-flex items-center rounded-full border font-medium ${cfg.bg} ${cfg.color} ${cfg.border} ${sizes[size]}`}>
      <span>{cfg.icon}</span>
      <span>{level}</span>
    </span>
  );
}