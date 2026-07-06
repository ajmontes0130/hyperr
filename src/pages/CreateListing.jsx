import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import MobileSelect from "@/components/MobileSelect";
import LocationInput from "@/components/LocationInput";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Upload, X, Plus, ArrowLeft, Eye, TrendingUp, ImageOff } from "lucide-react";
import { getPromoLabel, formatPromoQuantity } from "@/lib/promoUtils";

const categories = ["Restaurant & Food","Retail & Fashion","Health & Beauty","Tech & Software","Travel & Hospitality","Fitness & Wellness","Entertainment","Professional Services","Education","Other"];
const promoTypes = ["Instagram Post","Instagram Reel","TikTok Video","YouTube Video","Blog Post","Podcast Mention","Twitter/X Post","Newsletter Feature","Event Appearance","Other"];
const tierOptions = ["Any","Silver","Gold","Platinum","Diamond"];

const EMPTY_FORM = {
  title: "",
  description: "",
  offering_type: "",
  offering_details: "",
  estimated_value: "",
  category: "",
  location: "",
  usage_rights: "",
  min_creator_tier: "Any",
  image_urls: [],
  promotion_requirements: [], // [{type, quantity, note}]
};

export default function CreateListing() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState("form"); // "form" | "preview"
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  // Derived: which types are selected
  const selectedTypes = form.promotion_requirements.map((r) => r.type);

  const togglePromo = (type) => {
    setForm((prev) => {
      const already = prev.promotion_requirements.find((r) => r.type === type);
      if (already) {
        return { ...prev, promotion_requirements: prev.promotion_requirements.filter((r) => r.type !== type) };
      }
      return { ...prev, promotion_requirements: [...prev.promotion_requirements, { type, quantity: 1, note: "", custom_label: "" }] };
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
    if (form.image_urls.length + files.length > 5) {
      toast({ title: "Maximum 5 images allowed", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const uploads = await Promise.all(files.map((file) => base44.integrations.Core.UploadFile({ file })));
      setForm((prev) => ({ ...prev, image_urls: [...prev.image_urls, ...uploads.map((u) => u.file_url)] }));
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (idx) => {
    setForm((prev) => ({ ...prev, image_urls: prev.image_urls.filter((_, i) => i !== idx) }));
  };

  const validateForm = () => {
    if (!form.title.trim() || !form.offering_type || !form.offering_details.trim() || !form.category || form.promotion_requirements.length === 0) {
      toast({ title: "Please fill in all required fields and select at least one promotion type", variant: "destructive" });
      return false;
    }
    if (form.estimated_value !== "" && (Number(form.estimated_value) < 0 || isNaN(Number(form.estimated_value)))) {
      toast({ title: "Offering value must be a positive number", variant: "destructive" });
      return false;
    }
    const missingLabels = form.promotion_requirements.filter((r) => r.type === "Other" && !r.custom_label?.trim());
    if (missingLabels.length > 0) {
      toast({ title: "Please enter a custom label for each 'Other' promotion type", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handlePreview = (e) => {
    e.preventDefault();
    if (validateForm()) setStep("preview");
  };

  const handlePublish = async () => {
    setLoading(true);
    try {
      const user = await base44.auth.me();
      const profiles = await base44.entities.BusinessProfile.filter({ created_by_id: user.id });
      const profile = profiles[0];

      await base44.entities.Listing.create({
        title: form.title,
        description: form.description,
        offering_type: form.offering_type,
        offering_details: form.offering_details,
        estimated_value: form.estimated_value ? Number(form.estimated_value) : 0,
        wanted_promotion_type: selectedTypes,
        promotion_requirements: form.promotion_requirements,
        usage_rights: form.usage_rights,
        min_creator_tier: form.min_creator_tier,
        category: form.category,
        location: form.location,
        image_url: form.image_urls[0] || "",
        image_urls: form.image_urls,
        status: "active",
        business_profile_id: profile?.id || "",
      });

      toast({ title: "Listing published!" });
      navigate("/my-listings");
    } catch {
      toast({ title: "Error creating listing", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // ── Preview step ──────────────────────────────────────────────────────────
  if (step === "preview") {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="sm" onClick={() => setStep("form")}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Edit
          </Button>
          <div>
            <h1 className="font-display font-bold text-xl">Preview Your Listing</h1>
            <p className="text-sm text-muted-foreground">This is how creators will see your listing.</p>
          </div>
        </div>

        <div className="bg-card rounded-2xl border overflow-hidden mb-4">
          {form.image_urls.length > 0 ? (
            <div className="flex gap-2 p-2 overflow-x-auto">
              {form.image_urls.map((url, i) => (
                <img key={i} src={url} alt="" className={`object-cover rounded-xl flex-shrink-0 ${i === 0 ? "w-full aspect-video" : "w-32 h-24"}`} />
              ))}
            </div>
          ) : (
            <div className="px-5 py-4 flex items-center gap-2 text-sm text-muted-foreground">
              <ImageOff className="w-4 h-4 text-muted-foreground/40" />
              No photos added yet
            </div>
          )}
        </div>

        <div className="bg-card rounded-2xl border p-6 space-y-4 mb-4">
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-primary/10 text-primary border-primary/20">{form.offering_type}</Badge>
            <Badge variant="outline">{form.category}</Badge>
            {form.min_creator_tier && form.min_creator_tier !== "Any" && (
              <Badge variant="secondary">Min. {form.min_creator_tier} tier</Badge>
            )}
          </div>
          <h2 className="font-display font-bold text-2xl">{form.title}</h2>
          {form.location && <p className="text-sm text-muted-foreground">📍 {form.location}</p>}
          {form.estimated_value && (
            <p className="text-sm text-muted-foreground">💰 Business valuation: ~${Number(form.estimated_value).toLocaleString()} <span className="text-xs">(informational only)</span></p>
          )}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">What's Offered</p>
            <p className="text-foreground leading-relaxed">{form.offering_details}</p>
          </div>
          {form.description && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Additional Details</p>
              <p className="text-foreground leading-relaxed">{form.description}</p>
            </div>
          )}
        </div>

        <div className="bg-card rounded-2xl border p-6 space-y-3 mb-6">
          <h3 className="font-display font-semibold">Looking For</h3>
          {form.promotion_requirements.map((r) => (
            <div key={r.type} className="flex items-start gap-3 p-3 rounded-xl bg-accent/50">
              <Badge className="bg-accent text-accent-foreground border-0 mt-0.5 flex-shrink-0">{getPromoLabel(r)}</Badge>
              <div className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{formatPromoQuantity(r)}</span>
                {r.note && <span> — {r.note}</span>}
              </div>
            </div>
          ))}
          {form.usage_rights && (
            <div className="pt-2 border-t">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Usage Rights & Requirements</p>
              <p className="text-sm text-foreground">{form.usage_rights}</p>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => setStep("form")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Go Back & Edit
          </Button>
          <Button className="flex-1 h-12 text-base rounded-xl" onClick={handlePublish} disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Publish Listing
          </Button>
        </div>
      </div>
    );
  }

  // ── Form step ─────────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="font-display font-bold text-2xl sm:text-3xl mb-2">Create a Listing</h1>
      <p className="text-muted-foreground mb-8">Describe what you're offering and what kind of promotion you're looking for.</p>

      <form onSubmit={handlePreview} className="space-y-6">
        {/* What you're offering */}
        <div className="bg-card rounded-2xl border p-6 space-y-5">
          <h2 className="font-display font-semibold text-lg">What You're Offering</h2>

          <div className="space-y-2">
            <Label>Title *</Label>
            <Input placeholder="e.g. Free dinner for 2 at our downtown restaurant" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
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
            <Textarea placeholder="Describe exactly what you're offering…" value={form.offering_details} onChange={(e) => setForm({ ...form, offering_details: e.target.value })} rows={3} />
          </div>

          <div className="space-y-2">
            <Label>Additional Description</Label>
            <Textarea placeholder="Any extra details, conditions, or fine print…" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Your Offering's Value ($)</Label>
              <Input type="number" placeholder="0" value={form.estimated_value} onChange={(e) => setForm({ ...form, estimated_value: e.target.value })} />
              <p className="text-xs text-muted-foreground">Your own estimate of what you're offering — creators can see this. This is informational, not contractual.</p>
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <LocationInput value={form.location} onChange={(v) => setForm({ ...form, location: v })} placeholder="City, State" />
            </div>
          </div>

        </div>

        {/* Photos — highlighted step */}
        <div className="bg-card rounded-2xl border-2 border-primary/30 p-6 space-y-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">1</span>
            <h2 className="font-display font-semibold text-lg">Add Photos</h2>
            <Badge className="bg-primary/10 text-primary border-primary/20 ml-auto text-xs">Recommended</Badge>
          </div>
          <p className="text-sm text-primary flex items-center gap-1.5 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            Listings with photos get more proposals
          </p>
          <div className="flex flex-wrap gap-3">
            {form.image_urls.map((url, i) => (
              <div key={i} className="relative">
                <img src={url} alt="" className="w-20 h-20 rounded-xl object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-destructive text-white rounded-full flex items-center justify-center"
                >
                  <X className="w-3 h-3" />
                </button>
                {i === 0 && <span className="absolute bottom-1 left-1 text-xs bg-black/60 text-white px-1 rounded">Main</span>}
              </div>
            ))}
            {form.image_urls.length < 5 && (
              <label className="w-20 h-20 rounded-xl border-2 border-dashed border-border hover:border-primary/50 cursor-pointer transition-colors flex flex-col items-center justify-center text-muted-foreground hover:text-foreground">
                {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                <span className="text-xs mt-1">Add</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleImages} />
              </label>
            )}
          </div>
          <p className="text-xs text-muted-foreground">Upload up to 5 images. The first image becomes the main photo shown on your listing card.</p>
        </div>

        {/* Promotion selection with qty/notes */}
        <div className="bg-card rounded-2xl border p-6 space-y-5">
          <div>
            <h2 className="font-display font-semibold text-lg">What You're Looking For *</h2>
            <p className="text-sm text-muted-foreground mt-1">Select the types of promotion you'd accept in exchange. Add quantity and requirements for each.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {promoTypes.map((type) => {
              const selected = selectedTypes.includes(type);
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => togglePromo(type)}
                  className={`px-3 py-2 rounded-xl border text-sm font-medium transition-all text-left ${
                    selected
                      ? "bg-primary text-white border-primary"
                      : "bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                  }`}
                >
                  {type}
                </button>
              );
            })}
          </div>

          {/* Requirements per selected type */}
          {form.promotion_requirements.length > 0 && (
            <div className="space-y-3 pt-2 border-t">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Specify requirements for each selected type</p>
              {form.promotion_requirements.map((req) => (
                <div key={req.type} className="bg-muted/40 rounded-xl p-4 space-y-3">
                  <p className="font-medium text-sm">{req.type}</p>
                  {req.type === "Other" && (
                    <div className="space-y-1">
                      <Label className="text-xs">Custom label *</Label>
                      <Input
                        placeholder="e.g. LinkedIn carousel, Pinterest pin…"
                        value={req.custom_label || ""}
                        onChange={(e) => updateRequirement(req.type, "custom_label", e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Quantity</Label>
                      <Input
                        type="number"
                        min="1"
                        value={req.quantity}
                        onChange={(e) => updateRequirement(req.type, "quantity", Number(e.target.value))}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Requirements <span className="font-normal text-muted-foreground">(optional)</span></Label>
                      <Input
                        placeholder="e.g. must stay up 30 days"
                        value={req.note}
                        onChange={(e) => updateRequirement(req.type, "note", e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Usage rights */}
          <div className="space-y-2 pt-2 border-t">
            <Label>Specific Requirements / Usage Rights <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Textarea
              placeholder="e.g. Must tag @ourbrand and use #OurHashtag. We may repurpose content for 6 months across our own channels. Content must be brand-safe with no competitors visible."
              value={form.usage_rights}
              onChange={(e) => setForm({ ...form, usage_rights: e.target.value })}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">This is shown to all creators before they propose. Clear terms = fewer disputes.</p>
          </div>
        </div>

        {/* Targeting */}
        <div className="bg-card rounded-2xl border p-6 space-y-4">
          <div>
            <h2 className="font-display font-semibold text-lg">Targeting</h2>
            <p className="text-sm text-muted-foreground mt-1">Optionally restrict who can apply based on creator tier.</p>
          </div>
          <div className="space-y-2">
            <Label>Minimum Creator Tier</Label>
            <MobileSelect
              value={form.min_creator_tier}
              onValueChange={(v) => setForm({ ...form, min_creator_tier: v })}
              placeholder="Minimum tier"
              options={tierOptions.map((t) => ({ value: t, label: t === "Any" ? "Any tier (open to all)" : `${t} and above` }))}
              triggerClassName="max-w-xs"
            />
            <p className="text-xs text-muted-foreground">
              Tiers by reach: Bronze &lt;10K · Silver 10K–50K · Gold 50K–250K · Platinum 250K–1M · Diamond 1M+
            </p>
          </div>
        </div>

        <Button type="submit" className="w-full h-12 text-base rounded-xl">
          <Eye className="w-4 h-4 mr-2" /> Preview Listing
        </Button>
      </form>
    </div>
  );
}