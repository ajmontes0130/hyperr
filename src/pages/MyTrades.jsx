import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import ReviewModal from "@/components/creator/ReviewModal";
import { Loader2, Handshake, CheckCircle, XCircle, Clock, ArrowRight, Star, MessageCircle, Truck, AlertTriangle, PackageCheck, Plus } from "lucide-react";
import PullToRefresh from "@/components/PullToRefresh";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const statusConfig = {
  pending:     { label: "Pending",     color: "bg-amber-950/50 text-amber-400 border-amber-800",   icon: Clock },
  accepted:    { label: "Accepted",    color: "bg-emerald-950/50 text-emerald-400 border-emerald-800", icon: CheckCircle },
  in_progress: { label: "In Progress", color: "bg-blue-950/50 text-blue-400 border-blue-800",      icon: Truck },
  delivered:   { label: "Delivered",   color: "bg-purple-950/50 text-purple-400 border-purple-800", icon: PackageCheck },
  completed:   { label: "Completed",   color: "bg-green-950/50 text-green-400 border-green-800",   icon: CheckCircle },
  declined:    { label: "Declined",    color: "bg-red-950/50 text-red-400 border-red-800",         icon: XCircle },
  disputed:    { label: "Disputed",    color: "bg-orange-950/50 text-orange-400 border-orange-800", icon: AlertTriangle },
};

const FLOW = ["pending", "accepted", "in_progress", "delivered", "completed"];

export default function MyTrades() {
  const [received, setReceived] = useState([]);
  const [sent, setSent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [reviewTarget, setReviewTarget] = useState(null);
  const [disputeTarget, setDisputeTarget] = useState(null);
  const [disputeReason, setDisputeReason] = useState("");
  const [deliveryTarget, setDeliveryTarget] = useState(null);
  const [deliveryNote, setDeliveryNote] = useState("");
  const [deliveryUrl, setDeliveryUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const me = await base44.auth.me();
      setUser(me);
      const [recv, snt] = await Promise.all([
        base44.entities.TradeProposal.filter({ listing_owner_id: me.id }, "-created_date"),
        base44.entities.TradeProposal.filter({ proposer_id: me.id }, "-created_date"),
      ]);
      setReceived(recv);
      setSent(snt);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const sendStatusEmail = async (proposal, status) => {
    try {
      const allUsers = await base44.entities.User.list();
      // accepted/declined/in_progress → notify the proposer (creator)
      // delivered/completed → notify the listing owner (business)
      const recipientId = ["accepted", "declined", "in_progress"].includes(status)
        ? proposal.proposer_id
        : proposal.listing_owner_id;
      const recipient = allUsers.find((u) => u.id === recipientId);
      if (!recipient?.email) return;

      const messages = {
        accepted: {
          subject: `Your trade proposal was accepted 🎉`,
          body: `Great news!\n\nYour trade proposal for "${proposal.listing_title}" has been accepted.\n\nHead to your Trades dashboard to mark it as In Progress and kick things off:\nhttps://app.hyperr.com/my-trades\n\n— The hyperr team`,
        },
        declined: {
          subject: `Update on your trade proposal`,
          body: `Hi there,\n\nYour trade proposal for "${proposal.listing_title}" wasn't the right fit this time.\n\nDon't be discouraged — there are plenty of other opportunities waiting on the marketplace:\nhttps://app.hyperr.com\n\n— The hyperr team`,
        },
        in_progress: {
          subject: `Trade is now in progress`,
          body: `The trade for "${proposal.listing_title}" has been marked as In Progress.\n\nYou can track its progress and message the other party here:\nhttps://app.hyperr.com/my-trades\n\n— The hyperr team`,
        },
        delivered: {
          subject: `Content delivered — please confirm receipt`,
          body: `The creator has marked their content as delivered for "${proposal.listing_title}".\n\nPlease review the delivery and confirm receipt in your Trades dashboard to complete the trade:\nhttps://app.hyperr.com/my-trades\n\n— The hyperr team`,
        },
        completed: {
          subject: `Trade completed ✅`,
          body: `The trade for "${proposal.listing_title}" is now complete — great work!\n\nTake a moment to leave a review for the other party. It helps build trust on hyperr:\nhttps://app.hyperr.com/my-trades\n\n— The hyperr team`,
        },
      };
      const msg = messages[status];
      if (msg) await base44.integrations.Core.SendEmail({ from_name: "hyperr", to: recipient.email, ...msg });
    } catch (_) {}
  };

  const updateStatus = async (id, status, proposal) => {
    // Optimistic update
    const applyOptimistic = (list) => list.map((p) => p.id === id ? { ...p, status } : p);
    setReceived((prev) => applyOptimistic(prev));
    setSent((prev) => applyOptimistic(prev));
    try {
      await base44.entities.TradeProposal.update(id, { status });
      toast({ title: `Trade ${statusConfig[status]?.label || status}` });
      await sendStatusEmail(proposal, status);
    } catch {
      toast({ title: "Update failed", variant: "destructive" });
      loadData(); // revert on error
    }
  };

  const handleMarkInProgress = async (proposal) => {
    await updateStatus(proposal.id, "in_progress", proposal);
    // sendStatusEmail is already called inside updateStatus — no duplicate needed
  };

  const handleMarkDelivered = async () => {
    setSubmitting(true);
    try {
      await base44.entities.TradeProposal.update(deliveryTarget.id, {
        status: "delivered",
        creator_delivered: true,
        delivery_note: deliveryNote,
        delivery_url: deliveryUrl,
      });
      await sendStatusEmail(deliveryTarget, "delivered");
      toast({ title: "Marked as delivered! The business will confirm receipt." });
      setDeliveryTarget(null);
      setDeliveryNote("");
      setDeliveryUrl("");
      loadData();
    } catch {
      toast({ title: "Error", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmReceipt = async (proposal) => {
    await base44.entities.TradeProposal.update(proposal.id, {
      status: "completed",
      business_confirmed: true,
    });
    await sendStatusEmail(proposal, "completed");
    toast({ title: "Trade completed! You can now leave a review." });
    loadData();
  };

  const handleDispute = async () => {
    if (!disputeReason.trim()) return;
    setSubmitting(true);
    try {
      await base44.entities.TradeProposal.update(disputeTarget.id, {
        status: "disputed",
        disputed: true,
        dispute_reason: disputeReason,
      });
      toast({ title: "Issue reported. Our team will review within 48 hours." });
      setDisputeTarget(null);
      setDisputeReason("");
      loadData();
    } catch {
      toast({ title: "Error", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const ProposalCard = ({ proposal, type }) => {
    const config = statusConfig[proposal.status] || statusConfig.pending;
    const StatusIcon = config.icon;
    const isActive = ["accepted", "in_progress", "delivered"].includes(proposal.status);

    // Who is the creator (proposer) vs business (listing owner)
    const isCreator = type === "sent"; // creator sent the proposal
    const isBusiness = type === "received"; // business received it

    return (
      <div className="bg-card rounded-2xl border p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <Link to={`/listing/${proposal.listing_id}`} className="font-display font-semibold hover:text-primary transition-colors flex items-center gap-1.5">
              {proposal.listing_title || "Untitled Listing"} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            {type === "received" && (
              <p className="text-sm text-muted-foreground mt-0.5">
                From: <span className="font-medium text-foreground">{proposal.proposer_business_name}</span>
              </p>
            )}
          </div>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.color}`}>
            <StatusIcon className="w-3 h-3" /> {config.label}
          </span>
        </div>

        {/* Progress bar */}
        {FLOW.includes(proposal.status) && (
          <div className="flex items-center gap-1">
            {FLOW.map((s, i) => {
              const idx = FLOW.indexOf(proposal.status);
              return (
                <React.Fragment key={s}>
                  <div className={`h-1.5 flex-1 rounded-full ${i <= idx ? "bg-primary" : "bg-muted"}`} />
                </React.Fragment>
              );
            })}
          </div>
        )}

        {/* Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-muted-foreground text-xs uppercase tracking-wider">Platform</span>
            <p className="font-medium mt-0.5">{proposal.platform}</p>
          </div>
          {proposal.audience_size && (
            <div>
              <span className="text-muted-foreground text-xs uppercase tracking-wider">Audience</span>
              <p className="font-medium mt-0.5">{proposal.audience_size}</p>
            </div>
          )}
        </div>

        <div className="text-sm">
          <span className="text-muted-foreground text-xs uppercase tracking-wider">Proposed Promotion</span>
          <p className="mt-0.5">{proposal.proposed_promotion}</p>
        </div>

        {proposal.message && (
          <div className="text-sm">
            <span className="text-muted-foreground text-xs uppercase tracking-wider">Message</span>
            <p className="mt-0.5 text-muted-foreground">{proposal.message}</p>
          </div>
        )}

        {/* Delivery info (when delivered) */}
        {proposal.status === "delivered" && (proposal.delivery_note || proposal.delivery_url) && (
          <div className="bg-[#1a1230] border border-purple-900/40 rounded-xl p-3 text-sm space-y-1">
            <p className="font-medium text-purple-400 text-xs uppercase tracking-wider">Delivery Details</p>
            {proposal.delivery_note && <p className="text-muted-foreground">{proposal.delivery_note}</p>}
            {proposal.delivery_url && (
              <a href={proposal.delivery_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">{proposal.delivery_url}</a>
            )}
          </div>
        )}

        {/* Dispute reason */}
        {proposal.status === "disputed" && proposal.dispute_reason && (
          <div className="bg-[#1f1208] border border-orange-900/40 rounded-xl p-3 text-sm">
            <p className="font-medium text-orange-400 text-xs uppercase tracking-wider mb-1">Reported Issue</p>
            <p className="text-muted-foreground">{proposal.dispute_reason}</p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2 pt-1">

          {/* Business: accept/decline pending */}
          {isBusiness && proposal.status === "pending" && (
            <>
              <Button size="sm" className="rounded-lg" onClick={() => updateStatus(proposal.id, "accepted", proposal)}>
                <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Accept
              </Button>
              <Button size="sm" variant="outline" className="rounded-lg" onClick={() => updateStatus(proposal.id, "declined", proposal)}>
                <XCircle className="w-3.5 h-3.5 mr-1.5" /> Decline
              </Button>
            </>
          )}

          {/* Either side: move accepted → in progress */}
          {proposal.status === "accepted" && (
            <Button size="sm" variant="outline" className="rounded-lg" onClick={() => handleMarkInProgress(proposal)}>
              <Truck className="w-3.5 h-3.5 mr-1.5" /> Start Work
            </Button>
          )}

          {/* Creator: mark delivered */}
          {isCreator && proposal.status === "in_progress" && (
            <Button size="sm" className="rounded-lg" onClick={() => setDeliveryTarget(proposal)}>
              <PackageCheck className="w-3.5 h-3.5 mr-1.5" /> Mark as Delivered
            </Button>
          )}

          {/* Business: confirm receipt */}
          {isBusiness && proposal.status === "delivered" && (
            <Button size="sm" className="rounded-lg bg-emerald-600 hover:bg-emerald-700" onClick={() => handleConfirmReceipt(proposal)}>
              <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Confirm Receipt
            </Button>
          )}

          {/* Review — ONLY when completed */}
          {proposal.status === "completed" && (
            <Button
              size="sm"
              variant="ghost"
              className="rounded-lg text-muted-foreground"
              onClick={() => setReviewTarget({
                revieweeId: isBusiness ? proposal.proposer_id : proposal.listing_owner_id,
                title: proposal.listing_title,
                reviewerType: isBusiness ? "business" : "creator",
                revieweeType: isBusiness ? "creator" : "business",
              })}
            >
              <Star className="w-3.5 h-3.5 mr-1.5" /> Leave a Review
            </Button>
          )}

          {/* Message */}
          {isActive && (
            <Button size="sm" variant="ghost" className="rounded-lg text-muted-foreground gap-1.5" asChild>
              <Link to={`/messages?with=${type === "received" ? proposal.proposer_id : proposal.listing_owner_id}&name=${encodeURIComponent(type === "received" ? (proposal.proposer_business_name || "Proposer") : "Listing Owner")}&trade=${encodeURIComponent(proposal.listing_title || "")}`}>
                <MessageCircle className="w-3.5 h-3.5" /> Message
              </Link>
            </Button>
          )}

          {/* Dispute */}
          {isActive && proposal.status !== "disputed" && (
            <Button size="sm" variant="ghost" className="rounded-lg text-destructive/70 hover:text-destructive hover:bg-destructive/10 gap-1.5" onClick={() => setDisputeTarget(proposal)}>
              <AlertTriangle className="w-3.5 h-3.5" /> Report Issue
            </Button>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <PullToRefresh onRefresh={loadData}>
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-display font-bold text-2xl sm:text-3xl">My Trades</h1>
        <Button asChild size="sm" className="rounded-xl gap-1.5">
          <Link to="/marketplace"><Plus className="w-4 h-4" /> New Trade</Link>
        </Button>
      </div>
      <p className="text-muted-foreground mb-8">Manage incoming proposals and track your deals through to completion.</p>

      <Tabs defaultValue="received">
        <TabsList className="mb-6">
          <TabsTrigger value="received">
            Received {received.length > 0 && <span className="ml-1.5 bg-primary/10 text-primary text-xs px-1.5 py-0.5 rounded-full">{received.length}</span>}
          </TabsTrigger>
          <TabsTrigger value="sent">
            Sent {sent.length > 0 && <span className="ml-1.5 bg-muted text-muted-foreground text-xs px-1.5 py-0.5 rounded-full">{sent.length}</span>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="received">
          {received.length === 0 ? (
            <div className="text-center py-16 bg-card rounded-2xl border">
              <Handshake className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
              <h3 className="font-display font-semibold text-lg mb-1">No proposals received</h3>
              <p className="text-muted-foreground text-sm">When someone proposes a trade on your listing, it will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {received.map((p) => <ProposalCard key={p.id} proposal={p} type="received" />)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sent">
          {sent.length === 0 ? (
            <div className="text-center py-16 bg-card rounded-2xl border">
              <Handshake className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
              <h3 className="font-display font-semibold text-lg mb-1">No proposals sent</h3>
              <p className="text-muted-foreground text-sm">Browse the marketplace and propose a trade to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sent.map((p) => <ProposalCard key={p.id} proposal={p} type="sent" />)}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Delivery modal */}
      <Dialog open={!!deliveryTarget} onOpenChange={() => setDeliveryTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark as Delivered</DialogTitle>
            <DialogDescription>Share details of what you've delivered so the business can confirm receipt.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Delivery Note</Label>
              <Textarea
                placeholder="Describe what you posted / delivered…"
                value={deliveryNote}
                onChange={(e) => setDeliveryNote(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Link to Content (optional)</Label>
              <Input
                placeholder="https://instagram.com/p/..."
                value={deliveryUrl}
                onChange={(e) => setDeliveryUrl(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeliveryTarget(null)}>Cancel</Button>
            <Button onClick={handleMarkDelivered} disabled={submitting}>
              {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Submit Delivery
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dispute modal */}
      <Dialog open={!!disputeTarget} onOpenChange={() => setDisputeTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report an Issue</DialogTitle>
            <DialogDescription>Describe the problem. Our team will review within 48 hours and follow up by email.</DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Textarea
              placeholder="Explain what went wrong, e.g. content was not delivered, product never arrived, terms not met…"
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDisputeTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDispute} disabled={submitting || !disputeReason.trim()}>
              {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Submit Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review modal — only fires when status === completed */}
      {reviewTarget && user && (
        <ReviewModal
          open={!!reviewTarget}
          onClose={() => { setReviewTarget(null); loadData(); }}
          proposal={null}
          user={user}
          reviewerType={reviewTarget.reviewerType}
          revieweeId={reviewTarget.revieweeId}
          revieweeType={reviewTarget.revieweeType}
          collabTitle={reviewTarget.title}
        />
      )}
    </div>
    </PullToRefresh>
  );
}