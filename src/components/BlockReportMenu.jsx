import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Ban, Flag, MoreVertical, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

const REASONS = [
  "Spam",
  "Harassment",
  "Inappropriate Content",
  "Scam or Fraud",
  "Impersonation",
  "Other",
];

export default function BlockReportMenu({ targetUserId, targetName, currentUserId, variant = "icon" }) {
  const { toast } = useToast();
  const [meId, setMeId] = useState(currentUserId || null);
  const [blockId, setBlockId] = useState(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [reason, setReason] = useState("Spam");
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let uid = currentUserId;
      if (!uid) {
        const me = await base44.auth.me().catch(() => null);
        uid = me?.id;
      }
      if (cancelled || !uid || !targetUserId) return;
      setMeId(uid);
      try {
        const existing = await base44.entities.UserBlock.filter({ blocker_id: uid, blocked_id: targetUserId });
        if (!cancelled && existing.length > 0) setBlockId(existing[0].id);
      } catch { /* ignore */ }
    })();
    return () => { cancelled = true; };
  }, [targetUserId, currentUserId]);

  const handleBlock = async () => {
    if (!meId || !targetUserId) return;
    setBusy(true);
    try {
      if (blockId) {
        await base44.entities.UserBlock.delete(blockId);
        setBlockId(null);
        toast({ title: `Unblocked ${targetName || "user"}` });
      } else {
        const rec = await base44.entities.UserBlock.create({ blocker_id: meId, blocked_id: targetUserId });
        setBlockId(rec.id);
        toast({ title: `Blocked ${targetName || "user"}` });
      }
    } catch {
      toast({ title: "Something went wrong", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const handleReport = async () => {
    if (!meId || !targetUserId) return;
    setBusy(true);
    try {
      await base44.entities.UserReport.create({
        reporter_id: meId,
        reported_id: targetUserId,
        reason,
        details: details.trim() || undefined,
      });
      toast({ title: "Report submitted. Our team will review it." });
      setReportOpen(false);
      setDetails("");
      setReason("Spam");
    } catch {
      toast({ title: "Something went wrong", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  if (!targetUserId) return null;

  const trigger =
    variant === "full" ? (
      <Button variant="ghost" className="w-full rounded-xl h-11 text-muted-foreground" disabled={busy}>
        <MoreVertical className="w-4 h-4 mr-2" /> More
      </Button>
    ) : (
      <button
        className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
        disabled={busy}
        aria-label="More options"
      >
        <MoreVertical className="w-4 h-4" />
      </button>
    );

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleBlock} disabled={busy} className="cursor-pointer">
            <Ban className="w-4 h-4 mr-2" />
            {blockId ? "Unblock" : "Block"} {targetName || "user"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setReportOpen(true)} disabled={busy} className="cursor-pointer text-destructive">
            <Flag className="w-4 h-4 mr-2" />
            Report {targetName || "user"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report {targetName || "user"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Reason</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {REASONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Details (optional)</label>
              <Textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={3}
                placeholder="Add any details about the issue…"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReportOpen(false)} disabled={busy}>Cancel</Button>
            <Button onClick={handleReport} disabled={busy}>
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}