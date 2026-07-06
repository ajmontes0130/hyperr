import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Cookie, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "hyperr_consent";

export default function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  const handleChoice = (choice) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ choice, date: new Date().toISOString() }));
    } catch {}
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-[60] px-4 pb-4 pointer-events-none">
      <div className="max-w-3xl mx-auto pointer-events-auto bg-popover border border-border rounded-xl shadow-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-lg bg-secondary flex-shrink-0">
            <Cookie className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-foreground leading-relaxed">
              We use cookies for authentication and analytics, and may record sessions to improve the platform. See our{" "}
              <Link to="/privacy" className="text-primary underline-offset-2 hover:underline font-medium">Privacy Policy</Link>.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none" onClick={() => handleChoice("declined")}>
            Decline
          </Button>
          <Button size="sm" className="flex-1 sm:flex-none" onClick={() => handleChoice("accepted")}>
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}