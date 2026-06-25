import React, { useState } from "react";
import { Info } from "lucide-react";
import { levelConfig } from "@/lib/creatorUtils";

const tiers = [
  { level: "Bronze",   reach: "0 – 9,999",       desc: "Just getting started. Ideal for micro-collabs and gifted partnerships." },
  { level: "Silver",   reach: "10K – 49,999",     desc: "Growing creator with a loyal niche audience." },
  { level: "Gold",     reach: "50K – 249,999",     desc: "Established creator with meaningful brand impact." },
  { level: "Platinum", reach: "250K – 999,999",    desc: "Top-tier influencer commanding premium rates." },
  { level: "Diamond",  reach: "1M+",               desc: "Elite creator. Celebrity-level reach and authority." },
];

export default function TierInfoTooltip() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen((o) => !o)}
        className="text-muted-foreground hover:text-foreground transition-colors"
        aria-label="How tiers work"
      >
        <Info className="w-3.5 h-3.5" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute z-50 left-1/2 -translate-x-1/2 mt-2 w-72 bg-white border rounded-2xl shadow-xl p-4">
            <h4 className="font-display font-semibold text-sm mb-1">How creator tiers work</h4>
            <p className="text-xs text-muted-foreground mb-3">
              Tiers are calculated from <strong>total verified reach</strong> across all connected social platforms.
              Self-entered numbers are shown as <span className="text-amber-600 font-medium">Unverified</span> until API-connected.
            </p>
            <div className="space-y-2">
              {tiers.map(({ level, reach, desc }) => {
                const cfg = levelConfig[level];
                return (
                  <div key={level} className={`rounded-xl p-2.5 ${cfg.bg} ${cfg.border} border`}>
                    <div className="flex items-center justify-between mb-0.5">
                      <span className={`font-semibold text-xs ${cfg.color}`}>{cfg.icon} {level}</span>
                      <span className="text-xs text-muted-foreground">{reach}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-3 border-t pt-2">
              Tiers update automatically when follower counts change. Completed collabs and reviews also contribute to profile credibility.
            </p>
          </div>
        </>
      )}
    </div>
  );
}