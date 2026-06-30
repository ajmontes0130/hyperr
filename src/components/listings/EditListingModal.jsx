import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import MobileSelect from "@/components/MobileSelect";
import { Loader2, Upload, X, Plus } from "lucide-react";

const categories = ["Restaurant & Food","Retail & Fashion","Health & Beauty","Tech & Software","Travel & Hospitality","Fitness & Wellness","Entertainment","Professional Services","Education","Other"];
const promoTypes = ["Instagram Post","Instagram Reel","TikTok Video","YouTube Video","Blog Post","Podcast Mention","Twitter/X Post","Newsletter Feature","Event Appearance","Other"];
const tierOptions = ["Any","Silver","Gold","Platinum","Diamond"];

export default function EditListingModal({ listing, open, onClose, onSaved }) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    if (listing) {
      setForm({
        title: listing.title || "",
        description: listing.description || "",
        offering_type: listing.offering_type || "",
        offering_details: listing.offering_details || "",
        estimated_value: listing.estimated_value || "",
        category: listing.category || "",
        location: listing.location || "",
        usage_rights: listing.usage_rights || "",
        min_creator_tier: listing.min_creator_tier || "Any",
        image_urls: listing.image_urls || (listing.image_url ? [listing.image_url] : []),
        promotion_requirements: listing.promotion_requirements || [],
      });
    }
  }, [listing]);

  const selectedTypes = form.promotion_requirements?.map((r) => r.type) || [];

  const togglePromo = (type) => {
    setForm((prev) => {
      const already = prev.promotion_requirements.find((r) => r.type === type);
      if (already) return { ...prev, promotion_requirements: prev.promotion_requirements.filter((r) => r.type !== type) };
      return { ...prev, promotion_requirements: [...prev.promotion_requirements, { type, quantity: 1, note: "" }] };
    });
  };

  const updateRequirement = (type, field, value) => {
    setForm((prev) => ({
      ...prev,
      promotion_requirements: prev.promotion_requirements.map((r) =>
        r.type === type ? { ...r, [field]: value } : r
      ),
    }));
  };

  const handleImages = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    if ((form.image_urls?.length || 0) + files.length > 5) {
      toast({ title: "Maximum 5 images allowed", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const uploads = await Promise.all(files.map((file) => base44.integrations.Core.UploadFile({ file })));
      setForm((prev) => ({ ...prev, image_urls: [...(prev.image_urls || []), ...uploads.map((u) => u.file_url)] }));
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (idx) => {
    setForm((prev) => ({ ...prev, image_urls: prev.image_urls.filter((_, i) => i !== idx) }));
  };

  const handleSave = async () => {
    if (!form.title?.trim() || !form.offering_type || !form.offering_details?.trim() || !form.category) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await base44.entities.Listing.update(listing.id, {
        ...form,
        estimated_value: form.estimated_value ? Number(form.estimated_value) : 0,
        wanted_promotion_type: selectedTypes,
        image_url: form.image_urls?.[0] || "",
      });
      toast({ title: "Listing updated!" });
      onSaved();
      onClose();
    } catch {
      toast({ title: "Error saving listing", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Edit Listing</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Basic info */}
          <div className="space-y-2">
            <Label>Title *</Label>
            <Input value={form.title || ""} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Free dinner for 2" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type *</Label>
              <MobileSelect
                value={form.offering_type}
                onValueChange={(v) => setForm({ ...form, offering_type: v })}
                placeholder="Select type"
                options={[{ value: "Product", label: "Product" }, { value: "Service", label: "Service" }, { value: "Experience", label: "Experience" }]}
              />
            </div>
            <div className="space-y-2">
              <Label>Category *</Label>
              <MobileSelect
                value={form.category}
                onValueChange={(v) => setForm({ ...form, category: v })}
                placeholder="Select category"
                options={categories.map((c) => ({ value: c, label: c }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Details *</Label>
            <Textarea value={form.offering_details || ""} onChange={(e) => setForm({ ...form, offering_details: e.target.value })} rows={3} />
          </div>

          <div className="space-y-2">
            <Label>Additional Description</Label>
            <Textarea value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Offering Value ($)</Label>
              <Input type="number" value={form.estimated_value || ""} onChange={(e) => setForm({ ...form, estimated_value: e.target.value })} placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input value={form.location || ""} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="City, State" />
            </div>
          </div>

          {/* Images */}
          <div className="space-y-2">
            <Label>Images <span className="text-muted-foreground font-normal">(up to 5)</span></Label>
            <div className="flex flex-wrap gap-3">
              {(form.image_urls || []).map((url, i) => (
                <div key={i} className="relative">
                  <img src={url} alt="" className="w-20 h-20 rounded-xl object-cover" />
                  <button type="button" onClick={() => removeImage(i)} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-destructive text-white rounded-full flex items-center justify-center">
                    <X className="w-3 h-3" />
                  </button>
                  {i === 0 && <span className="absolute bottom-1 left-1 text-xs bg-black/60 text-white px-1 rounded">Main</span>}
                </div>
              ))}
              {(form.image_urls?.length || 0) < 5 && (
                <label className="w-20 h-20 rounded-xl border-2 border-dashed border-border hover:border-primary/50 cursor-pointer transition-colors flex flex-col items-center justify-center text-muted-foreground">
                  {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                  <span className="text-xs mt-1">Add</span>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleImages} />
                </label>
              )}
            </div>
          </div>

          {/* Promotion types */}
          <div className="space-y-3">
            <Label>Promotion Types *</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {promoTypes.map((type) => {
                const selected = selectedTypes.includes(type);
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => togglePromo(type)}
                    className={`px-3 py-2 rounded-xl border text-sm font-medium transition-all text-left ${
                      selected ? "bg-primary text-white border-primary" : "bg-card text-muted-foreground border-border hover:border-primary/50"
                    }`}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
            {(form.promotion_requirements || []).length > 0 && (
              <div className="space-y-3 pt-2 border-t">
                {form.promotion_requirements.map((req) => (
                  <div key={req.type} className="bg-muted/40 rounded-xl p-3 space-y-2">
                    <p className="font-medium text-sm">{req.type}</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Quantity</Label>
                        <Input type="number" min="1" value={req.quantity} onChange={(e) => updateRequirement(req.type, "quantity", Number(e.target.value))} className="h-8 text-sm" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Note</Label>
                        <Input value={req.note} onChange={(e) => updateRequirement(req.type, "note", e.target.value)} className="h-8 text-sm" placeholder="optional" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Usage rights */}
          <div className="space-y-2">
            <Label>Requirements / Usage Rights</Label>
            <Textarea value={form.usage_rights || ""} onChange={(e) => setForm({ ...form, usage_rights: e.target.value })} rows={2} placeholder="Hashtags, tagging requirements, content restrictions…" />
          </div>

          {/* Min tier */}
          <div className="space-y-2">
            <Label>Minimum Creator Tier</Label>
            <MobileSelect
              value={form.min_creator_tier}
              onValueChange={(v) => setForm({ ...form, min_creator_tier: v })}
              placeholder="Minimum tier"
              options={tierOptions.map((t) => ({ value: t, label: t === "Any" ? "Any tier (open to all)" : `${t} and above` }))}
              triggerClassName="max-w-xs"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving} className="rounded-xl">
            {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}