import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import MobileSelect from "@/components/MobileSelect";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Sparkles, Building2, ArrowRight, Upload } from "lucide-react";

const businessCategories = ["Restaurant & Food", "Retail & Fashion", "Health & Beauty", "Tech & Software", "Travel & Hospitality", "Fitness & Wellness", "Entertainment", "Professional Services", "Education", "Other"];
const creatorNiches = ["Food & Dining", "Travel", "Fashion & Style", "Beauty & Skincare", "Fitness & Health", "Tech & Gaming", "Lifestyle", "Finance", "Education", "Entertainment", "Music", "Art & Design", "Parenting", "Business", "Sustainability", "Other"];

export default function Onboarding() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = pick type, 2 = fill profile
  const [accountType, setAccountType] = useState(null); // "creator" | "business"
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [creatorForm, setCreatorForm] = useState({
    display_name: "",
    bio: "",
    niche: [],
    location: "",
    instagram_handle: "",
    instagram_followers: "",
    tiktok_handle: "",
    tiktok_followers: "",
    youtube_handle: "",
    youtube_subscribers: "",
    avatar_url: "",
  });

  const [businessForm, setBusinessForm] = useState({
    business_name: "",
    description: "",
    category: "",
    location: "",
    website: "",
    instagram_handle: "",
    logo_url: "",
  });

  const handlePickType = (type) => {
    setAccountType(type);
    setStep(2);
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      if (accountType === "creator") setCreatorForm((p) => ({ ...p, avatar_url: file_url }));
      else setBusinessForm((p) => ({ ...p, logo_url: file_url }));
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const toggleNiche = (niche) => {
    setCreatorForm((p) => ({
      ...p,
      niche: p.niche.includes(niche) ? p.niche.filter((n) => n !== niche) : [...p.niche, niche],
    }));
  };

  const computeLevel = (total) => {
    if (total >= 1000000) return "Diamond";
    if (total >= 250000) return "Platinum";
    if (total >= 50000) return "Gold";
    if (total >= 10000) return "Silver";
    return "Bronze";
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      // Save account type to user profile for role-based nav
      await base44.auth.updateMe({ account_type: accountType });

      if (accountType === "creator") {
        if (!creatorForm.display_name) {
          toast({ title: "Display name is required", variant: "destructive" });
          setSaving(false);
          return;
        }
        const ig = parseInt(creatorForm.instagram_followers) || 0;
        const tt = parseInt(creatorForm.tiktok_followers) || 0;
        const yt = parseInt(creatorForm.youtube_subscribers) || 0;
        const total = ig + tt + yt;
        await base44.entities.CreatorProfile.create({
          display_name: creatorForm.display_name,
          bio: creatorForm.bio,
          niche: creatorForm.niche,
          location: creatorForm.location,
          instagram_handle: creatorForm.instagram_handle,
          instagram_followers: ig || undefined,
          tiktok_handle: creatorForm.tiktok_handle,
          tiktok_followers: tt || undefined,
          youtube_handle: creatorForm.youtube_handle,
          youtube_subscribers: yt || undefined,
          total_reach: total,
          creator_level: computeLevel(total),
          avatar_url: creatorForm.avatar_url,
          accepts_barter: true,
          accepts_cash_offers: true,
        });
      } else {
        if (!businessForm.business_name || !businessForm.category) {
          toast({ title: "Business name and category are required", variant: "destructive" });
          setSaving(false);
          return;
        }
        await base44.entities.BusinessProfile.create({
          business_name: businessForm.business_name,
          description: businessForm.description,
          category: businessForm.category,
          location: businessForm.location,
          website: businessForm.website,
          instagram_handle: businessForm.instagram_handle,
          logo_url: businessForm.logo_url,
        });
      }
      window.location.href = "/";
    } catch (err) {
      toast({ title: "Error saving profile", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (step === 1) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-lg">
          <div className="text-center mb-10">
            <img src="https://media.base44.com/images/public/6a3c51b5316c274a51ac7590/3c7980363_image.png" alt="Hyper" className="h-14 w-auto mx-auto" />
            <h1 className="font-display font-bold text-2xl mt-4 mb-2">Welcome! What describes you best?</h1>
            <p className="text-muted-foreground">We'll set up the right profile for you.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => handlePickType("creator")}
              className="group bg-card border-2 border-border hover:border-primary rounded-2xl p-8 text-left transition-all hover:shadow-lg hover:shadow-black/30 focus:outline-none"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Sparkles className="w-7 h-7 text-primary" />
              </div>
              <h2 className="font-display font-bold text-xl mb-1">I'm a Creator</h2>
              <p className="text-sm text-muted-foreground">Influencer, content creator, or creative professional looking for brand collaborations.</p>
              <div className="mt-4 flex items-center text-primary text-sm font-medium">
                Get started <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            <button
              onClick={() => handlePickType("business")}
              className="group bg-card border-2 border-border hover:border-primary rounded-2xl p-8 text-left transition-all hover:shadow-lg hover:shadow-black/30 focus:outline-none"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Building2 className="w-7 h-7 text-primary" />
              </div>
              <h2 className="font-display font-bold text-xl mb-1">I'm a Business</h2>
              <p className="text-sm text-muted-foreground">Brand, restaurant, retailer, or service provider looking to partner with creators.</p>
              <div className="mt-4 flex items-center text-primary text-sm font-medium">
                Get started <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-6">You can always update your profile later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8">
          <img src="https://media.base44.com/images/public/6a3c51b5316c274a51ac7590/3c7980363_image.png" alt="Hyper" className="h-12 w-auto mx-auto" />
          <h1 className="font-display font-bold text-2xl mt-3 mb-1">
            {accountType === "creator" ? "Set up your creator profile" : "Set up your business profile"}
          </h1>
          <p className="text-muted-foreground text-sm">Fill in as much as you like — you can always edit this later.</p>
        </div>

        <div className="bg-card border rounded-2xl p-6 space-y-5">
          {/* Avatar / Logo upload */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
              {(accountType === "creator" ? creatorForm.avatar_url : businessForm.logo_url) ? (
                <img src={accountType === "creator" ? creatorForm.avatar_url : businessForm.logo_url} className="w-full h-full object-cover" alt="" />
              ) : (
                accountType === "creator" ? <Sparkles className="w-6 h-6 text-primary/40" /> : <Building2 className="w-6 h-6 text-primary/40" />
              )}
            </div>
            <label className="flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed hover:border-primary/50 cursor-pointer transition-colors text-sm text-muted-foreground hover:text-foreground">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {uploading ? "Uploading…" : accountType === "creator" ? "Upload photo" : "Upload logo"}
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </label>
          </div>

          {accountType === "creator" ? (
            <>
              <div className="space-y-2">
                <Label>Display Name *</Label>
                <Input value={creatorForm.display_name} onChange={(e) => setCreatorForm({ ...creatorForm, display_name: e.target.value })} placeholder="How you'll appear on Hyper" />
              </div>
              <div className="space-y-2">
                <Label>Bio</Label>
                <Textarea value={creatorForm.bio} onChange={(e) => setCreatorForm({ ...creatorForm, bio: e.target.value })} placeholder="Tell brands about yourself…" rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input value={creatorForm.location} onChange={(e) => setCreatorForm({ ...creatorForm, location: e.target.value })} placeholder="City, Country" />
              </div>
              <div className="space-y-2">
                <Label>Your Niches</Label>
                <div className="flex flex-wrap gap-2">
                  {creatorNiches.map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => toggleNiche(n)}
                      className={`px-3 py-1 rounded-full text-sm border transition-colors ${creatorForm.niche.includes(n) ? "bg-primary text-primary-foreground border-primary" : "bg-secondary text-muted-foreground border-border hover:border-primary/50"}`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <Label>Social Accounts & Followers</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Input value={creatorForm.instagram_handle} onChange={(e) => setCreatorForm({ ...creatorForm, instagram_handle: e.target.value })} placeholder="Instagram @handle" />
                  <Input type="number" value={creatorForm.instagram_followers} onChange={(e) => setCreatorForm({ ...creatorForm, instagram_followers: e.target.value })} placeholder="Followers" />
                  <Input value={creatorForm.tiktok_handle} onChange={(e) => setCreatorForm({ ...creatorForm, tiktok_handle: e.target.value })} placeholder="TikTok @handle" />
                  <Input type="number" value={creatorForm.tiktok_followers} onChange={(e) => setCreatorForm({ ...creatorForm, tiktok_followers: e.target.value })} placeholder="Followers" />
                  <Input value={creatorForm.youtube_handle} onChange={(e) => setCreatorForm({ ...creatorForm, youtube_handle: e.target.value })} placeholder="YouTube @channel" />
                  <Input type="number" value={creatorForm.youtube_subscribers} onChange={(e) => setCreatorForm({ ...creatorForm, youtube_subscribers: e.target.value })} placeholder="Subscribers" />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label>Business Name *</Label>
                <Input value={businessForm.business_name} onChange={(e) => setBusinessForm({ ...businessForm, business_name: e.target.value })} placeholder="Your business name" />
              </div>
              <div className="space-y-2">
                <Label>Category *</Label>
                <MobileSelect
                  value={businessForm.category}
                  onValueChange={(v) => setBusinessForm({ ...businessForm, category: v })}
                  placeholder="Select category"
                  options={businessCategories.map((c) => ({ value: c, label: c }))}
                />
              </div>
              <div className="space-y-2">
                <Label>About Your Business</Label>
                <Textarea value={businessForm.description} onChange={(e) => setBusinessForm({ ...businessForm, description: e.target.value })} placeholder="Tell creators about your brand…" rows={3} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input value={businessForm.location} onChange={(e) => setBusinessForm({ ...businessForm, location: e.target.value })} placeholder="City, State" />
                </div>
                <div className="space-y-2">
                  <Label>Website</Label>
                  <Input value={businessForm.website} onChange={(e) => setBusinessForm({ ...businessForm, website: e.target.value })} placeholder="https://…" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Instagram Handle</Label>
                <Input value={businessForm.instagram_handle} onChange={(e) => setBusinessForm({ ...businessForm, instagram_handle: e.target.value })} placeholder="@yourbusiness" />
              </div>
            </>
          )}
        </div>

        <div className="flex gap-3 mt-5">
          <Button variant="outline" className="flex-1" onClick={() => setStep(1)} disabled={saving}>
            Back
          </Button>
          <Button className="flex-1 h-11" onClick={handleSubmit} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {saving ? "Saving…" : "Finish & Enter Hyper"}
          </Button>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-3">You can skip and update your profile anytime</p>
      </div>
    </div>
  );
}