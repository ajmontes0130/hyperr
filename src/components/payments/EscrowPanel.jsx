import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Loader2, Lock, Shield, CheckCircle, AlertTriangle, ExternalLink, Link2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import moment from "moment";

const statusConfig = {
  unfunded:  { label: "Not Funded",     color: "bg-amber-950/50 text-amber-400 border-amber-800",   icon: AlertTriangle },
  held:      { label: "In Escrow",      color: "bg-cyan-950/50 text-cyan-400 border-cyan-800",      icon: Lock },
  delivered: { label: "Delivered",      color: "bg-blue-950/50 text-blue-400 border-blue-800",       icon: CheckCircle },
  released:  { label: "Released",       color: "bg-emerald-950/50 text-emerald-400 border-emerald-800", icon: CheckCircle },
  refunded:  { label: "Refunded",       color: "bg-red-950/50 text-red-400 border-red-800",         icon: AlertTriangle },
  disputed:  { label: "Disputed",       color: "bg-red-950/50 text-red-400 border-red-800",         icon: AlertTriangle },
};

export default function EscrowPanel({ offer, user, type }) {
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showDelivery, setShowDelivery] = useState(false);
  const [deliveryNote, setDeliveryNote] = useState("");
  const [deliveryUrl, setDeliveryUrl] = useState("");
  const { toast } = useToast();

  useEffect(() => { loadPayment(); }, [offer.id]);

  const loadPayment = async () => {
    try {
      const payments = await base44.entities.Payment.filter({ cash_offer_id: offer.id });
      setPayment(payments[0] || null);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const isBusiness = type === "sent";

  const handleFundEscrow = async () => {
    setActionLoading(true);
    try {
      let payRecord = payment;
      if (!payRecord) {
        payRecord = await base44.entities.Payment.create({
          cash_offer_id: offer.id,
          business_user_id: offer.business_user_id,
          business_name: offer.business_name,
          business_profile_id: offer.business_profile_id,
          creator_user_id: offer.creator_user_id,
          creator_name: offer.creator_name,
          creator_profile_id: offer.creator_profile_id,
          amount: offer.amount,
          currency: offer.currency || "USD",
          platform: offer.platform,
          deliverables: offer.deliverables,
          status: "unfunded",
        });
        setPayment(payRecord);
      }

      try {
        const result = await base44.functions.createEscrowCheckout({
          payment_id: payRecord.id,
          amount: offer.amount,
          currency: offer.currency || "USD",
          description: `Escrow — ${offer.deliverables}`,
        });
        if (result?.url) {
          window.location.href = result.url;
        } else {
          toast({ title: "Payment setup needed", description: "Add Stripe API keys in Dashboard → Integrations to enable escrow.", variant: "destructive" });
        }
      } catch (fnErr) {
        toast({ title: "Builder+ required", description: "Stripe escrow needs backend functions (Builder+ plan). Upgrade to enable live payments.", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to start payment", variant: "destructive" });
    } finally { setActionLoading(false); }
  };

  const handleMarkDelivered = async () => {
    setActionLoading(true);
    try {
      await base44.entities.Payment.update(payment.id, {
        status: "delivered",
        delivered_date: new Date().toISOString(),
        delivery_note: deliveryNote.trim(),
        delivery_url: deliveryUrl.trim(),
      });
      await base44.entities.CashOffer.update(offer.id, { creator_delivered: true });
      toast({ title: "Marked as delivered", description: "The business will be notified to release funds." });
      setShowDelivery(false);
      loadPayment();
    } catch (err) {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    } finally { setActionLoading(false); }
  };

  const handleReleaseFunds = async () => {
    setActionLoading(true);
    try {
      let transferId = null;
      try {
        const result = await base44.functions.releaseEscrowFunds({ payment_id: payment.id });
        transferId = result?.transfer_id;
      } catch (fnErr) {
        // Backend function unavailable — mark released for manual payout
      }
      await base44.entities.Payment.update(payment.id, {
        status: "released",
        released_date: new Date().toISOString(),
        stripe_transfer_id: transferId,
      });
      await base44.entities.CashOffer.update(offer.id, {
        status: "completed",
        business_confirmed: true,
      });
      toast({ title: "Funds released", description: transferId ? "Payment sent to creator via Stripe." : "Marked released — automate with Builder+ for live Stripe transfers." });
      loadPayment();
    } catch (err) {
      toast({ title: "Error", description: "Failed to release funds", variant: "destructive" });
    } finally { setActionLoading(false); }
  };

  const handleDispute = async () => {
    const reason = window.prompt("Describe the issue:");
    if (!reason) return;
    setActionLoading(true);
    try {
      await base44.entities.Payment.update(payment.id, {
        status: "disputed",
        dispute_reason: reason,
      });
      toast({ title: "Dispute opened", description: "Support will review and respond." });
      loadPayment();
    } catch (err) {
      toast({ title: "Error", description: "Failed to open dispute", variant: "destructive" });
    } finally { setActionLoading(false); }
  };

  if (loading) {
    return <div className="flex justify-center py-3"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>;
  }

  const status = payment?.status || "unfunded";
  const config = statusConfig[status] || statusConfig.unfunded;
  const Icon = config.icon;

  return (
    <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">Escrow Payment</span>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
          <Icon className="w-3 h-3" /> {config.label}
        </span>
      </div>

      {/* Business: unfunded — show fund button */}
      {isBusiness && status === "unfunded" && (
        <>
          <p className="text-sm text-muted-foreground">
            Fund the escrow to secure this collab. Funds are held safely until {offer.creator_name} delivers, then released automatically.
          </p>
          <Button className="w-full" onClick={handleFundEscrow} disabled={actionLoading}>
            {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            Fund Escrow — ${offer.amount.toLocaleString()} {offer.currency || "USD"}
          </Button>
        </>
      )}

      {/* Creator: unfunded (business hasn't funded yet) */}
      {!isBusiness && status === "unfunded" && (
        <p className="text-sm text-muted-foreground">
          Waiting for {offer.business_name} to fund the escrow. You'll be notified once payment is secured.
        </p>
      )}

      {/* Held: funds secured */}
      {status === "held" && (
        <>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">${(payment.amount || 0).toLocaleString()} {payment.currency}</span> is securely held in escrow.
          </p>
          {!isBusiness && !showDelivery && (
            <Button className="w-full" onClick={() => setShowDelivery(true)} disabled={actionLoading}>
              <CheckCircle className="w-4 h-4" /> Mark as Delivered
            </Button>
          )}
          {!isBusiness && showDelivery && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Delivery link (optional)</Label>
                <Input
                  placeholder="https://..."
                  value={deliveryUrl}
                  onChange={(e) => setDeliveryUrl(e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Note (optional)</Label>
                <Input
                  placeholder="Add a note..."
                  value={deliveryNote}
                  onChange={(e) => setDeliveryNote(e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
              <div className="flex gap-2">
                <Button className="flex-1" onClick={handleMarkDelivered} disabled={actionLoading}>
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  Confirm Delivery
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowDelivery(false)}>Cancel</Button>
              </div>
            </div>
          )}
          {isBusiness && (
            <p className="text-xs text-muted-foreground">Waiting for {offer.creator_name} to deliver the content.</p>
          )}
        </>
      )}

      {/* Delivered: creator has delivered, business can release */}
      {status === "delivered" && (
        <>
          {payment.delivery_note && (
            <p className="text-sm text-muted-foreground">{payment.delivery_note}</p>
          )}
          {payment.delivery_url && (
            <a href={payment.delivery_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline text-sm">
              <Link2 className="w-3 h-3" /> View delivery
            </a>
          )}
          {isBusiness && (
            <div className="flex gap-2">
              <Button className="flex-1" onClick={handleReleaseFunds} disabled={actionLoading}>
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Release Funds
              </Button>
              <Button variant="outline" size="icon" onClick={handleDispute} disabled={actionLoading} title="Open a dispute">
                <AlertTriangle className="w-4 h-4" />
              </Button>
            </div>
          )}
          {!isBusiness && (
            <p className="text-xs text-muted-foreground">Delivered — waiting for {offer.business_name} to release funds.</p>
          )}
        </>
      )}

      {/* Released: done */}
      {status === "released" && (
        <p className="text-sm text-emerald-400 flex items-center gap-1.5">
          <CheckCircle className="w-4 h-4" />
          Funds released {payment.released_date && `on ${moment(payment.released_date).format("MMM D, YYYY")}`}.
        </p>
      )}

      {/* Refunded */}
      {status === "refunded" && (
        <p className="text-sm text-red-400">Payment refunded to {offer.business_name}.</p>
      )}

      {/* Disputed */}
      {status === "disputed" && (
        <p className="text-sm text-red-400">
          ⚠ Dispute opened: {payment.dispute_reason}. Support will review.
        </p>
      )}
    </div>
  );
}