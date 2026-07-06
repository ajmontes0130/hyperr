import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
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
import { Loader2, Upload, Save, Building2, Trash2, Plus, X } from "lucide-react";
import ImageCropModal from "@/components/ImageCropModal";
import LocationInput from "@/components/LocationInput";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const categories = ["Restaurant & Food", "Retail & Fashion", "Health & Beauty", "Tech & Software", "Travel & Hospitality", "Fitness & Wellness", "Entertainment", "Professional Services", "Education", "Other"];

export default function Profile() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [cropSrc, setCropSrc] = useState(null);
  const [profileId, setProfileId] = useState(null);
  const [form, setForm] = useState({
    business_name: "",
    description: "",
    category: "",
    logo_url: "",
    photo_urls: [],
    website: "",
    location: "",
    instagram_handle: "",
    tiktok_handle: "",
    youtube_handle: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const me = await base44.auth.me();
      const profiles = await base44.entities.BusinessProfile.filter({ created_by_id: me.id });
      if (profiles.length > 0) {
        const p = profiles[0];
        setProfileId(p.id);
        setForm({
          business_name: p.business_name || "",
          description: p.description || "",
          category: p.category || "",
          logo_url: p.logo_url || "",
          photo_urls: p.photo_urls || [],
          website: p.website || "",
          location: p.location || "",
          instagram_handle: p.instagram_handle || "",
          tiktok_handle: p.tiktok_handle || "",
          youtube_handle: p.youtube_handle || "",
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const remaining = 5 - form.photo_urls.length;
    if (remaining <= 0) return;
    const toUpload = files.slice(0, remaining);
    setUploadingPhotos(true);
    try {
      const uploads = await Promise.all(toUpload.map((file) => base44.integrations.Core.UploadFile({ file })));
      setForm((prev) => ({ ...prev, photo_urls: [...prev.photo_urls, ...uploads.map((u) => u.file_url)] }));
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setUploadingPhotos(false);
    }
  };

  const removePhoto = (idx) => {
    setForm((prev) => ({ ...prev, photo_urls: prev.photo_urls.filter((_, i) => i !== idx) }));
  };

  const handleLogoSelect = (e) => {
    const file = e.target.files[0]; if (!file) return;
    e.target.value = "";
    setCropSrc(URL.createObjectURL(file));
  };

  const handleCropDone = async (blob) => {
    setCropSrc(null);
    setUploading(true);
    try {
      const file = new File([blob], "logo.jpg", { type: "image/jpeg" });
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setForm((prev) => ({ ...prev, logo_url: file_url }));
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.business_name.trim() || !form.category) {
      toast({ title: "Business name and category are required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      if (profileId) {
        await base44.entities.BusinessProfile.update(profileId, form);
      } else {
        const created = await base44.entities.BusinessProfile.create(form);
        setProfileId(created.id);
      }
      toast({ title: "Profile saved!" });
    } catch (err) {
      toast({ title: "Error saving profile", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    try {
      if (profileId) await base44.entities.BusinessProfile.delete(profileId);
      await base44.auth.logout("/");
    } catch {
      toast({ title: "Error deleting account", variant: "destructive" });
      setDeletingAccount(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="font-display font-bold text-2xl sm:text-3xl mb-2">Business Profile</h1>
      <p className="text-muted-foreground mb-8">This is how other businesses will see you on hyperr.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-card rounded-2xl border p-6 space-y-5">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
              {form.logo_url ? (
                <img src={form.logo_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <Building2 className="w-8 h-8 text-primary/40" />
              )}
            </div>
            <div>
              <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed hover:border-primary/50 cursor-pointer transition-colors text-sm text-muted-foreground hover:text-foreground">
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {uploading ? "Uploading…" : "Upload logo"}
                <input type="file" accept="image/*" className="hidden" onChange={handleLogoSelect} />
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Business Name *</Label>
            <Input value={form.business_name} onChange={(e) => setForm({ ...form, business_name: e.target.value })} placeholder="Your business name" />
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

          <div className="space-y-2">
            <Label>About Your Business</Label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Tell others about your business…" rows={3} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Website</Label>
              <Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://…" />
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <LocationInput value={form.location} onChange={(v) => setForm({ ...form, location: v })} placeholder="City, State" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-2xl border p-6 space-y-4">
          <div>
            <h2 className="font-display font-semibold text-lg">Business Photos</h2>
            <p className="text-sm text-muted-foreground mt-1">Add up to 5 photos showcasing your business — products, space, menu, etc.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {form.photo_urls.map((url, i) => (
              <div key={i} className="relative group">
                <img src={url} alt="" className="w-24 h-24 rounded-xl object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-destructive text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {form.photo_urls.length < 5 && (
              <label className="w-24 h-24 rounded-xl border-2 border-dashed border-border hover:border-primary/50 cursor-pointer transition-colors flex flex-col items-center justify-center text-muted-foreground hover:text-foreground">
                {uploadingPhotos ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                <span className="text-xs mt-1">{uploadingPhotos ? "Uploading" : "Add photo"}</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} disabled={uploadingPhotos} />
              </label>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{form.photo_urls.length}/5 photos added</p>
        </div>

        <div className="bg-card rounded-2xl border p-6 space-y-5">
          <h2 className="font-display font-semibold text-lg">Social Accounts</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Instagram</Label>
              <Input value={form.instagram_handle} onChange={(e) => setForm({ ...form, instagram_handle: e.target.value })} placeholder="@yourbusiness" />
            </div>
            <div className="space-y-2">
              <Label>TikTok</Label>
              <Input value={form.tiktok_handle} onChange={(e) => setForm({ ...form, tiktok_handle: e.target.value })} placeholder="@yourbusiness" />
            </div>
            <div className="space-y-2">
              <Label>YouTube</Label>
              <Input value={form.youtube_handle} onChange={(e) => setForm({ ...form, youtube_handle: e.target.value })} placeholder="@yourchannel" />
            </div>
          </div>
        </div>

        <Button type="submit" className="w-full h-12 text-base rounded-xl" disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          Save Profile
        </Button>
      </form>

      {/* Account Deletion */}
      <div className="mt-10 pt-6 border-t">
        <h3 className="font-display font-semibold text-base mb-1 text-destructive">Danger Zone</h3>
        <p className="text-sm text-muted-foreground mb-4">Permanently delete your account and all associated data.</p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive hover:text-white select-none">
              <Trash2 className="w-4 h-4 mr-2 select-none" /> Delete Account
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete your business profile and cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="select-none">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteAccount}
                disabled={deletingAccount}
                className="bg-destructive hover:bg-destructive/90 select-none"
              >
                {deletingAccount && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Yes, delete my account
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <ImageCropModal
        open={!!cropSrc}
        imageSrc={cropSrc}
        shape="square"
        onClose={() => setCropSrc(null)}
        onCrop={handleCropDone}
      />
    </div>
  );
}