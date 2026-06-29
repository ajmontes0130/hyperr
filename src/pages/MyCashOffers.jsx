import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import ReviewModal from "@/components/creator/ReviewModal";
import { Loader2, DollarSign, CheckCircle, XCircle, Clock, Users, LayoutGrid } from "lucide-react";
import { Link } from "react-router-dom";
import moment from "moment";

const statusConfig = {
  pending:   { label: "Pending",   color: "bg-amber-950/50 text-amber-400 border-amber-800",   icon: Clock },
  accepted:  { label: "Accepted",  color: "bg-emerald-950/50 text-emerald-400 border-emerald-800", icon: CheckCircle },
  declined:  { label: "Declined",  color: "bg-red-950/50 text-red-400 border-red-800",         icon: XCircle },
  completed: { label: "Completed", color: "bg-blue-950/50 text-blue-400 border-blue-800",       icon: CheckCircle },
};

export default function MyCashOffers() {
  const [received, setReceived] = useState([]);
  const [sent, setSent] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewTarget, setReviewTarget] = useState(null);
  const { toast } = useToast();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const me = await base44.auth.me();
      setUser(me);
      const [recv, snt] = await Promise.all([
        base44.entities.CashOffer.filter({ creator_user_id: me.id }, "-created_date"),
        base44.entities.CashOffer.filter({ business_user_id: me.id }, "-created_date"),
      ]);
      setReceived(recv);
      setSent(snt);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const update = async (id, status) => {
    await base44.entities.CashOffer.update(id, { status });
    toast({ title: `Offer ${status}` });
    loadData();
  };

  const OfferCard = ({ offer, type }) => {
    const config = statusConfig[offer.status] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <div className="bg-card rounded-2xl border p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-primary" />
              <span className="font-display font-bold text-xl text-primary">${(offer.amount || 0).toLocaleString()}</span>
              <span className="text-sm text-muted-foreground">USD</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {type === "received" ? <>From: <span className="font-medium text-foreground">{offer.business_name}</span></> : <>To: <span className="font-medium text-foreground">{offer.creator_name}</span></>}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{moment(offer.created_date).fromNow()}</p>
          </div>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.color}`}>
            <Icon className="w-3 h-3" /> {config.label}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-muted-foreground text-xs uppercase tracking-wider">Platform</span>
            <p className="font-medium mt-0.5">{offer.platform}</p>
          </div>
        </div>

        <div>
          <span className="text-muted-foreground text-xs uppercase tracking-wider">Deliverables</span>
          <p className="text-sm mt-0.5">{offer.deliverables}</p>
        </div>

        {offer.message && (
          <div>
            <span className="text-muted-foreground text-xs uppercase tracking-wider">Message</span>
            <p className="text-sm mt-0.5 text-muted-foreground">{offer.message}</p>
          </div>
        )}

        {type === "received" && offer.status === "pending" && (
          <div className="flex gap-2 pt-2">
            <Button size="sm" className="rounded-lg" onClick={() => update(offer.id, "accepted")}>
              <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Accept
            </Button>
            <Button size="sm" variant="outline" className="rounded-lg" onClick={() => update(offer.id, "declined")}>
              <XCircle className="w-3.5 h-3.5 mr-1.5" /> Decline
            </Button>
          </div>
        )}
        {offer.status === "accepted" && (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="rounded-lg" onClick={() => update(offer.id, "completed")}>
              <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Mark Completed
            </Button>
          </div>
        )}
        {offer.status === "completed" && type === "sent" && (
          <Button size="sm" variant="ghost" className="rounded-lg text-muted-foreground" onClick={() => setReviewTarget({ revieweeId: offer.creator_user_id, title: `Cash Collab · ${offer.creator_name}` })}>
            Leave a Review
          </Button>
        )}
      </div>
    );
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div>
      <h1 className="font-display font-bold text-2xl sm:text-3xl mb-2">Cash Offers</h1>
      <p className="text-muted-foreground mb-8">Manage your paid collaboration offers.</p>

      <Tabs defaultValue="received">
        <TabsList className="mb-6">
          <TabsTrigger value="received">Received {received.length > 0 && <span className="ml-1.5 bg-primary/10 text-primary text-xs px-1.5 py-0.5 rounded-full">{received.length}</span>}</TabsTrigger>
          <TabsTrigger value="sent">Sent {sent.length > 0 && <span className="ml-1.5 bg-muted text-muted-foreground text-xs px-1.5 py-0.5 rounded-full">{sent.length}</span>}</TabsTrigger>
        </TabsList>
        <TabsContent value="received">
          {received.length === 0
            ? (
              <div className="text-center py-16 bg-card rounded-2xl border">
                <DollarSign className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
                <h3 className="font-display font-semibold text-lg mb-1">No cash offers received</h3>
                <p className="text-sm text-muted-foreground mb-5">Brands send cash offers here when they want to work with you.</p>
                <Link to="/creator-profile">
                  <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 transition-colors">
                    Complete Your Creator Profile
                  </button>
                </Link>
              </div>
            )
            : <div className="space-y-4">{received.map((o) => <OfferCard key={o.id} offer={o} type="received" />)}</div>
          }
        </TabsContent>
        <TabsContent value="sent">
          {sent.length === 0
            ? (
              <div className="text-center py-16 bg-card rounded-2xl border">
                <DollarSign className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
                <h3 className="font-display font-semibold text-lg mb-1">No cash offers sent</h3>
                <p className="text-sm text-muted-foreground mb-5">Find a creator you love and send them a paid collab offer.</p>
                <Link to="/creators">
                  <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 transition-colors">
                    <Users className="w-4 h-4" /> Browse Creators
                  </button>
                </Link>
              </div>
            )
            : <div className="space-y-4">{sent.map((o) => <OfferCard key={o.id} offer={o} type="sent" />)}</div>
          }
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