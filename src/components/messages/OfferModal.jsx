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
import { Loader2, FileText, DollarSign } from "lucide-react";

const platforms = ["Instagram", "TikTok", "YouTube", "Blog", "Podcast", "Twitter/X", "Newsletter", "Event", "Other"];
const offerTypes = ["Cash", "Barter", "Experience", "Other"];

export default function OfferModal({ open, onClose, thread, user }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    offer_type: "Cash",
    amount: "",
    compensation_details: "",
    platform: "",
    deliverables: "",
    deadline: "",
    contract_terms: "",
  });

  const otherName = thread?.otherName || "the recipient";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.deliverables.trim() || !form.platform) return;
    setLoading(true);
    try {
      const offer = await base44.entities.ConversationOffer.create({
        thread_id: thread.threadId,
        sender_id: user.id,
        sender_name: user.full_name || user.email,
        sender_avatar: "",
        recipient_id: thread.otherId,
        recipient_name: thread.otherName,
        title: form.title.trim(),
        offer_type: form.offer_type,
        amount: form.offer_type === "Cash" ? Number(form.amount) || 0 : 0,
        compensation_details: form.compensation_details.trim(),
        platform: form.platform,
        deliverables: form.deliverables.trim(),
        deadline: form.deadline || "",
        contract_terms: form.contract_terms.trim(),
        status: "pending",
      });
      toast({ title: "Offer sent", description: `${thread.otherName} can now review and accept it.` });
      onClose();
      setForm({ title: "", offer_type: "Cash", amount: "", compensation_details: "", platform: "", deliverables: "", deadline: "", contract_terms: "" });
      if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("offer-sent", { detail: offer }));
    } catch (err) {
      toast({ title: "Error sending offer", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = form.title.trim() && form.deliverables.trim() && form.platform && (!form.offer_type === "Cash" || form.amount);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" /> Send an Offer
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            To: <span className="font-medium text-foreground">{otherName}</span> — they'll be able to accept or decline.
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label>Offer Title *</Label>
            <Input placeholder="e.g. Sponsored TikTok for product launch" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Offer Type *</Label>
              <Select value={form.offer_type} onValueChange={(v) => setForm({ ...form, offer_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {offerTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
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

          {form.offer_type === "Cash" ? (
            <div className="space-y-2">
              <Label>Cash Amount (USD) *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input type="number" placeholder="500" className="pl-9" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label>{form.offer_type === "Other" ? "Describe the offer *" : "What are you offering? *"}</Label>
              <Input
                placeholder={form.offer_type === "Other" ? "e.g. Revenue share, affiliate code, cross-promo…" : form.offer_type === "Barter" ? "e.g. 3 months of free product" : "e.g. VIP event access for 2"}
                value={form.compensation_details}
                onChange={(e) => setForm({ ...form, compensation_details: e.target.value })}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Deliverables *</Label>
            <Textarea placeholder="e.g. 1x 60s TikTok video, 2x story mentions, 6-month usage rights" value={form.deliverables} onChange={(e) => setForm({ ...form, deliverables: e.target.value })} rows={2} />
          </div>

          <div className="space-y-2">
            <Label>Deadline (optional)</Label>
            <Input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-primary" /> Contract Terms (optional)</Label>
            <Textarea
              placeholder="Spell out the full agreement — payment schedule, revision rounds, exclusivity, content approval, ownership, cancellation policy…"
              value={form.contract_terms}
              onChange={(e) => setForm({ ...form, contract_terms: e.target.value })}
              rows={4}
              className="font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground">These terms form the contract the recipient agrees to when they accept.</p>
          </div>

          <Button type="submit" className="w-full" disabled={loading || !form.title.trim() || !form.deliverables.trim() || !form.platform}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <FileText className="w-4 h-4 mr-2" />}
            Send Offer
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}