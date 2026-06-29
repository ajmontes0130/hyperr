import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, DollarSign } from "lucide-react";
import { levelConfig } from "@/lib/creatorUtils";

const platforms = ["Instagram", "TikTok", "YouTube", "Blog", "Podcast", "Twitter/X", "Newsletter", "Event", "Other"];

export default function CashOfferModal({ open, onClose, creator, user }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ amount: "", platform: "", deliverables: "", message: "" });

  const suggestedRange = levelConfig[creator?.creator_level || "Bronze"]?.range;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amt = Number(form.amount);
    if (!form.amount || isNaN(amt) || amt <= 0 || !form.platform || !form.deliverables.trim()) return;
    setLoading(true);
    try {
      const profiles = await base44.entities.BusinessProfile.filter({ created_by_id: user.id });
      const biz = profiles[0];
      await base44.entities.CashOffer.create({
        creator_profile_id: creator.id,
        creator_user_id: creator.created_by_id,
        business_profile_id: biz?.id || "",
        business_user_id: user.id,
        business_name: biz?.business_name || user.full_name || "Unknown",
        creator_name: creator.display_name,
        amount: Number(form.amount),
        currency: "USD",
        platform: form.platform,
        deliverables: form.deliverables,
        message: form.message,
        status: "pending",
      });
      toast({ title: "Cash offer sent!", description: `${creator.display_name} will review your offer.` });
      onClose();
      setForm({ amount: "", platform: "", deliverables: "", message: "" });
    } catch (err) {
      toast({ title: "Error sending offer", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Send a Cash Offer</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            To: <span className="font-medium text-foreground">{creator?.display_name}</span>
            {suggestedRange && <span className="ml-2 text-xs text-muted-foreground">· Suggested rate: {suggestedRange}</span>}
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Offer Amount (USD) *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input type="number" placeholder="500" className="pl-9" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Platform *</Label>
              <Select value={form.platform} onValueChange={(v) => setForm({ ...form, platform: v })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {platforms.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Deliverables *</Label>
            <Textarea placeholder="e.g. 1x TikTok video (60s), 2x story mentions, usage rights for 6 months" value={form.deliverables} onChange={(e) => setForm({ ...form, deliverables: e.target.value })} rows={3} />
          </div>
          <div className="space-y-2">
            <Label>Message (optional)</Label>
            <Textarea placeholder="Tell them about your brand and what you're looking for…" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={2} />
          </div>
          <Button type="submit" className="w-full" disabled={loading || !form.amount || Number(form.amount) <= 0 || !form.platform || !form.deliverables.trim()}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <DollarSign className="w-4 h-4 mr-2" />}
            Send Offer
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}