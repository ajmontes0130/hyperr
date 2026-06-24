import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Upload } from "lucide-react";

const categories = ["Restaurant & Food", "Retail & Fashion", "Health & Beauty", "Tech & Software", "Travel & Hospitality", "Fitness & Wellness", "Entertainment", "Professional Services", "Education", "Other"];
const promoTypes = ["Instagram Post", "Instagram Reel", "TikTok Video", "YouTube Video", "Blog Post", "Podcast Mention", "Twitter/X Post", "Newsletter Feature", "Event Appearance", "Other"];

export default function CreateListing() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    offering_type: "",
    offering_details: "",
    estimated_value: "",
    wanted_promotion_type: [],
    category: "",
    location: "",
    image_url: "",
  });

  const togglePromo = (type) => {
    setForm((prev) => ({
      ...prev,
      wanted_promotion_type: prev.wanted_promotion_type.includes(type)
        ? prev.wanted_promotion_type.filter((t) => t !== type)
        : [...prev.wanted_promotion_type, type],
    }));
  };

  const handleImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setForm((prev) => ({ ...prev, image_url: file_url }));
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.offering_type || !form.offering_details || !form.category || form.wanted_promotion_type.length === 0) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const user = await base44.auth.me();
      const profiles = await base44.entities.BusinessProfile.filter({ created_by_id: user.id });
      const profile = profiles[0];

      await base44.entities.Listing.create({
        ...form,
        estimated_value: form.estimated_value ? Number(form.estimated_value) : 0,
        status: "active",
        business_profile_id: profile?.id || "",
      });

      toast({ title: "Listing created!" });
      navigate("/my-listings");
    } catch (err) {
      toast({ title: "Error creating listing", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="font-display font-bold text-2xl sm:text-3xl mb-2">Create a Listing</h1>
      <p className="text-muted-foreground mb-8">Describe what you're offering and what kind of promotion you're looking for.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border p-6 space-y-5">
          <h2 className="font-display font-semibold text-lg">What You're Offering</h2>

          <div className="space-y-2">
            <Label>Title *</Label>
            <Input placeholder="e.g. Free dinner for 2 at our downtown restaurant" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type *</Label>
              <Select value={form.offering_type} onValueChange={(v) => setForm({ ...form, offering_type: v })}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Product">Product</SelectItem>
                  <SelectItem value="Service">Service</SelectItem>
                  <SelectItem value="Experience">Experience</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
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
              <Label>Estimated Value ($)</Label>
              <Input type="number" placeholder="0" value={form.estimated_value} onChange={(e) => setForm({ ...form, estimated_value: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input placeholder="e.g. New York, NY" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Image</Label>
            <div className="flex items-center gap-4">
              {form.image_url && (
                <img src={form.image_url} alt="" className="w-20 h-20 rounded-xl object-cover" />
              )}
              <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-border hover:border-primary/50 cursor-pointer transition-colors text-sm text-muted-foreground hover:text-foreground">
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {uploading ? "Uploading…" : "Upload image"}
                <input type="file" accept="image/*" className="hidden" onChange={handleImage} />
              </label>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border p-6 space-y-5">
          <h2 className="font-display font-semibold text-lg">What You're Looking For *</h2>
          <p className="text-sm text-muted-foreground -mt-3">Select the types of promotion you'd accept in exchange.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {promoTypes.map((type) => (
              <label key={type} className="flex items-center gap-3 p-3 rounded-xl border hover:bg-muted/50 cursor-pointer transition-colors">
                <Checkbox
                  checked={form.wanted_promotion_type.includes(type)}
                  onCheckedChange={() => togglePromo(type)}
                />
                <span className="text-sm">{type}</span>
              </label>
            ))}
          </div>
        </div>

        <Button type="submit" className="w-full h-12 text-base rounded-xl" disabled={loading}>
          {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
          Publish Listing
        </Button>
      </form>
    </div>
  );
}