import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, FileText, Check, X, DollarSign, Calendar } from "lucide-react";

const typeStyles = {
  Cash: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  Barter: "bg-primary/10 text-primary border-primary/30",
  Experience: "bg-accent/10 text-accent border-accent/30",
};

const statusStyles = {
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  accepted: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  declined: "bg-red-500/10 text-red-400 border-red-500/30",
};

export default function OfferBubble({ offer, isMine, onUpdate }) {
  const { toast } = useToast();
  const [acting, setActing] = useState(false);

  const handleRespond = async (newStatus) => {
    setActing(true);
    try {
      const updated = await base44.entities.ConversationOffer.update(offer.id, { status: newStatus });
      toast({
        title: newStatus === "accepted" ? "Offer accepted" : "Offer declined",
        description: newStatus === "accepted" ? "The contract is now agreed." : "You declined this offer.",
      });
      if (onUpdate) onUpdate(updated);
    } catch (err) {
      toast({ title: "Something went wrong", variant: "destructive" });
    } finally {
      setActing(false);
    }
  };

  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"} my-2`}>
      <div className={`max-w-[88%] sm:max-w-[70%] rounded-2xl border border-border bg-card overflow-hidden ${isMine ? "rounded-br-sm" : "rounded-bl-sm"}`}>
        {/* Header bar */}
        <div className="px-4 py-2.5 border-b border-border flex items-center justify-between gap-2 bg-muted/30">
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="text-sm font-semibold truncate">{offer.title}</span>
          </div>
          <Badge variant="outline" className={`text-xs ${statusStyles[offer.status] || ""}`}>
            {offer.status}
          </Badge>
        </div>

        {/* Body */}
        <div className="px-4 py-3 space-y-2.5 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={`text-xs ${typeStyles[offer.offer_type] || ""}`}>{offer.offer_type}</Badge>
            <Badge variant="outline" className="text-xs">{offer.platform}</Badge>
            {offer.offer_type === "Cash" && offer.amount > 0 && (
              <span className="flex items-center gap-1 text-emerald-400 font-semibold text-xs">
                <DollarSign className="w-3.5 h-3.5" />{offer.amount.toLocaleString()}
              </span>
            )}
            {offer.deadline && (
              <span className="flex items-center gap-1 text-muted-foreground text-xs">
                <Calendar className="w-3 h-3" />{new Date(offer.deadline).toLocaleDateString()}
              </span>
            )}
          </div>

          {offer.offer_type !== "Cash" && offer.compensation_details && (
            <p className="text-xs"><span className="text-muted-foreground">Offering:</span> {offer.compensation_details}</p>
          )}

          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Deliverables</p>
            <p className="text-sm">{offer.deliverables}</p>
          </div>

          {offer.contract_terms && (
            <details className="group">
              <summary className="cursor-pointer text-xs text-primary flex items-center gap-1 select-none">
                <FileText className="w-3 h-3" /> Contract terms
              </summary>
              <div className="mt-2 p-3 rounded-lg bg-muted/50 border border-border text-xs whitespace-pre-wrap font-mono leading-relaxed">
                {offer.contract_terms}
              </div>
            </details>
          )}

          <p className="text-xs text-muted-foreground pt-1">
            {new Date(offer.created_date).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>

        {/* Actions — only recipient sees accept/decline while pending */}
        {!isMine && offer.status === "pending" && (
          <div className="px-4 py-3 border-t border-border flex gap-2 bg-muted/20">
            <Button
              size="sm"
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={acting}
              onClick={() => handleRespond("accepted")}
            >
              {acting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Check className="w-4 h-4 mr-1" />}
              Accept
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 border-red-500/40 text-red-400 hover:bg-red-500/10"
              disabled={acting}
              onClick={() => handleRespond("declined")}
            >
              {acting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <X className="w-4 h-4 mr-1" />}
              Decline
            </Button>
          </div>
        )}

        {isMine && offer.status === "pending" && (
          <div className="px-4 py-2 border-t border-border bg-muted/20">
            <p className="text-xs text-muted-foreground text-center">Waiting for response…</p>
          </div>
        )}
      </div>
    </div>
  );
}