import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import ReviewModal from "@/components/creator/ReviewModal";
import { Loader2, Handshake, CheckCircle, XCircle, Clock, ArrowRight, Star, MessageCircle } from "lucide-react";

const statusConfig = {
  pending: { label: "Pending", color: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock },
  accepted: { label: "Accepted", color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle },
  declined: { label: "Declined", color: "bg-red-50 text-red-700 border-red-200", icon: XCircle },
  completed: { label: "Completed", color: "bg-blue-50 text-blue-700 border-blue-200", icon: CheckCircle },
};

export default function MyTrades() {
  const [received, setReceived] = useState([]);
  const [sent, setSent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [reviewTarget, setReviewTarget] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

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

  const updateProposal = async (id, status, proposal) => {
    await base44.entities.TradeProposal.update(id, { status });
    toast({ title: `Proposal ${status}` });

    // Email the proposer when a business responds
    if (status === "accepted" || status === "declined") {
      try {
        const allUsers = await base44.entities.User.list();
        const proposer = allUsers.find((u) => u.id === proposal?.proposer_id);
        if (proposer?.email) {
          const action = status === "accepted" ? "accepted" : "declined";
          await base44.integrations.Core.SendEmail({
            to: proposer.email,
            subject: `Your trade proposal was ${action}`,
            body: `Hi there,\n\nYour trade proposal for "${proposal?.listing_title}" has been ${action}.\n\n${status === "accepted" ? "🎉 Great news! Reach out to discuss next steps." : "Don't worry — there are plenty more opportunities on Hyperr."}\n\nLog in to view your trades:\nhttps://app.hyperr.com/my-trades`,
          });
        }
      } catch (_) {}
    }

    loadData();
  };

  const ProposalCard = ({ proposal, type }) => {
    const config = statusConfig[proposal.status] || statusConfig.pending;
    const StatusIcon = config.icon;

    return (
      <div className="bg-white rounded-2xl border p-5 space-y-4">
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

        <div className="text-sm">
          <span className="text-muted-foreground text-xs uppercase tracking-wider">Message</span>
          <p className="mt-0.5 text-muted-foreground">{proposal.message}</p>
        </div>

        {type === "received" && proposal.status === "pending" && (
          <div className="flex gap-2 pt-2">
            <Button size="sm" className="rounded-lg" onClick={() => updateProposal(proposal.id, "accepted", proposal)}>
              <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Accept
            </Button>
            <Button size="sm" variant="outline" className="rounded-lg" onClick={() => updateProposal(proposal.id, "declined", proposal)}>
              <XCircle className="w-3.5 h-3.5 mr-1.5" /> Decline
            </Button>
          </div>
        )}

        {proposal.status === "accepted" && (
          <div className="flex gap-2 pt-2 flex-wrap">
            <Button size="sm" variant="outline" className="rounded-lg" onClick={() => updateProposal(proposal.id, "completed", proposal)}>
              <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Mark Completed
            </Button>
            <Button size="sm" variant="ghost" className="rounded-lg text-muted-foreground gap-1.5" asChild>
              <Link to={`/messages?with=${type === "received" ? proposal.proposer_id : proposal.listing_owner_id}&name=${encodeURIComponent(type === "received" ? (proposal.proposer_business_name || "Proposer") : "Listing Owner")}&trade=${encodeURIComponent(proposal.listing_title || "")}`}>
                <MessageCircle className="w-3.5 h-3.5" /> Message
              </Link>
            </Button>
          </div>
        )}
        {proposal.status === "completed" && type === "received" && (
          <Button size="sm" variant="ghost" className="rounded-lg text-muted-foreground" onClick={() => setReviewTarget({ revieweeId: proposal.proposer_id, title: proposal.listing_title })}>
            <Star className="w-3.5 h-3.5 mr-1.5" /> Leave a Review
          </Button>
        )}
      </div>
    );
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div>
      <h1 className="font-display font-bold text-2xl sm:text-3xl mb-2">My Trades</h1>
      <p className="text-muted-foreground mb-8">Manage incoming proposals and track your deals.</p>

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
            <div className="text-center py-16 bg-white rounded-2xl border">
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
            <div className="text-center py-16 bg-white rounded-2xl border">
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

      {reviewTarget && user && (
        <ReviewModal
          open={!!reviewTarget}
          onClose={() => { setReviewTarget(null); loadData(); }}
          proposal={null}
          user={user}
          reviewerType="business"
          revieweeId={reviewTarget.revieweeId}
          revieweeType="creator"
          collabTitle={reviewTarget.title}
        />
      )}
    </div>
  );
}