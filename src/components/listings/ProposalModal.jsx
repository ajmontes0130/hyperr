import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Send, ChevronDown, FileText } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const platforms = ["Instagram", "TikTok", "YouTube", "Blog", "Podcast", "Twitter/X", "Newsletter", "Event", "Other"];

export default function ProposalModal({ listing, open, onClose, user }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [form, setForm] = useState({
    message: "",
    proposed_promotion: "",
    audience_size: "",
    platform: "",
  });

  useEffect(() => {
    if (open && user) {
      base44.entities.ProposalTemplate.filter({ created_by_id: user.id }, "-created_date")
        .then(setTemplates)
        .catch(() => {});
    }
  }, [open, user]);

  const applyTemplate = (t) => {
    setForm({ platform: t.platform, proposed_promotion: t.proposed_promotion, audience_size: t.audience_size || "", message: t.message });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.platform || !form.proposed_promotion || !form.message) return;

    setLoading(true);
    try {
      const profiles = await base44.entities.BusinessProfile.filter({ created_by_id: user.id });
      const myProfile = profiles[0];

      await base44.entities.TradeProposal.create({
        listing_id: listing.id,
        listing_title: listing.title,
        listing_owner_id: listing.created_by_id,
        proposer_id: user.id,
        proposer_business_name: myProfile?.business_name || user.full_name || "Unknown",
        message: form.message,
        proposed_promotion: form.proposed_promotion,
        audience_size: form.audience_size,
        platform: form.platform,
        status: "pending",
      });

      // Email the listing owner
      try {
        const ownerUsers = await base44.entities.User.list();
        const owner = ownerUsers.find((u) => u.id === listing.created_by_id);
        if (owner?.email) {
          await base44.integrations.Core.SendEmail({
            from_name: "hyperr",
            to: owner.email,
            subject: `New trade proposal on "${listing.title}"`,
            body: `Hi there,\n\nYou have a new trade proposal on your listing "${listing.title}".\n\nFrom: ${myProfile?.business_name || user.full_name}\nPlatform: ${form.platform}\nAudience: ${form.audience_size || "Not specified"}\n\nProposed promotion:\n${form.proposed_promotion}\n\nTheir message:\n${form.message}\n\nReview and respond here:\nhttps://app.hyperr.com/my-trades\n\n— The hyperr team`,
          });
        }
      } catch (_) {}

      toast({ title: "Proposal sent!", description: "The listing owner will review your proposal." });
      onClose();
      setForm({ message: "", proposed_promotion: "", audience_size: "", platform: "" });
    } catch (err) {
      toast({ title: "Error", description: "Failed to send proposal. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Propose a Trade</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            For: <span className="font-medium text-foreground">{listing?.title}</span>
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          {templates.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="outline" className="w-full rounded-xl justify-between">
                  <span className="flex items-center gap-2"><FileText className="w-4 h-4" /> Load from template</span>
                  <ChevronDown className="w-4 h-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full min-w-[320px]">
                {templates.map((t) => (
                  <DropdownMenuItem key={t.id} onClick={() => applyTemplate(t)} className="flex flex-col items-start gap-0.5 py-2">
                    <span className="font-medium">{t.name}</span>
                    <span className="text-xs text-muted-foreground">{t.platform}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <div className="space-y-2">
            <Label>Platform</Label>
            <Select value={form.platform} onValueChange={(v) => setForm({ ...form, platform: v })}>
              <SelectTrigger><SelectValue placeholder="Select platform" /></SelectTrigger>
              <SelectContent>
                {platforms.map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>What promotion are you offering?</Label>
            <Textarea
              placeholder="e.g. A 60-second Instagram Reel showcasing your product with behind-the-scenes content"
              value={form.proposed_promotion}
              onChange={(e) => setForm({ ...form, proposed_promotion: e.target.value })}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>Audience Size (optional)</Label>
            <Input
              placeholder="e.g. 25K followers"
              value={form.audience_size}
              onChange={(e) => setForm({ ...form, audience_size: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Message to the business</Label>
            <Textarea
              placeholder="Introduce yourself and explain why this is a great fit…"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              rows={3}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading || !form.platform || !form.proposed_promotion || !form.message}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
            Send Proposal
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}