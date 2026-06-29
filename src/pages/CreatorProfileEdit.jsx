import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import LevelBadge from "@/components/creator/LevelBadge";
import { calcTotalReach, calcLevel } from "@/lib/creatorUtils";
import { Loader2, Upload, Save, Plus, Trash2 } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const niches = ["Food & Dining", "Travel", "Fashion & Style", "Beauty & Skincare", "Fitness & Health", "Tech & Gaming", "Lifestyle", "Finance", "Education", "Entertainment", "Music", "Art & Design", "Parenting", "Business", "Sustainability", "Other"];
const platforms = ["Instagram", "TikTok", "YouTube", "Blog", "Podcast", "Twitter/X", "Newsletter", "Event", "Other"];

export default function CreatorProfileEdit() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profileId, setProfileId] = useState(null);
  const [form, setForm] = useState({
    display_name: "", bio: "", niche: [], avatar_url: "", location: "",
    instagram_handle: "", instagram_followers: "",
    tiktok_handle: "", tiktok_followers: "",
    youtube_handle: "", youtube_subscribers: "",
    twitter_handle: "", twitter_followers: "",
    base_rate: "", accepts_cash_offers: true, accepts_barter: true, website: "",
  });

  const [portfolio, setPortfolio] = useState([]);
  const [newItem, setNewItem] = useState({ brand_name: "", title: "", description: "", platform: "", content_url: "", thumbnail_url: "", collab_type: "Barter", month_year: "" });
  const [addingItem, setAddingItem] = useState(false);
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const me = await base44.auth.me();
      const [profiles, port] = await Promise.all([
        base44.entities.CreatorProfile.filter({ created_by_id: me.id }),
        base44.entities.CollabPortfolio.filter({ creator_profile_id: "" }).catch(() => []),
      ]);
      if (profiles.length > 0) {
        const p = profiles[0];
        setProfileId(p.id);
        setForm({
          display_name: p.display_name || "",
          bio: p.bio || "",
          niche: p.niche || [],
          avatar_url: p.avatar_url || "",
          location: p.location || "",
          instagram_handle: p.instagram_handle || "",
          instagram_followers: p.instagram_followers || "",
          tiktok_handle: p.tiktok_handle || "",
          tiktok_followers: p.tiktok_followers || "",
          youtube_handle: p.youtube_handle || "",
          youtube_subscribers: p.youtube_subscribers || "",
          twitter_handle: p.twitter_handle || "",
          twitter_followers: p.twitter_followers || "",
          base_rate: p.base_rate || "",
          accepts_cash_offers: p.accepts_cash_offers !== false,
          accepts_barter: p.accepts_barter !== false,
          website: p.website || "",
        });
        const myPort = await base44.entities.CollabPortfolio.filter({ creator_profile_id: p.id });
        setPortfolio(myPort);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const toggleNiche = (n) => {
    setForm((prev) => ({
      ...prev,
      niche: prev.niche.includes(n) ? prev.niche.filter((x) => x !== n) : [...prev.niche, n],
    }));
  };

  const handleAvatar = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setForm((prev) => ({ ...prev, avatar_url: file_url }));
    } catch { toast({ title: "Upload failed", variant: "destructive" }); }
    finally { setUploading(false); }
  };

  const handleThumb = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setUploadingThumb(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setNewItem((prev) => ({ ...prev, thumbnail_url: file_url }));
    } catch { toast({ title: "Upload failed", variant: "destructive" }); }
    finally { setUploadingThumb(false); }
  };

  const computedLevel = () => {
    const reach = calcTotalReach({
      instagram_followers: Number(form.instagram_followers) || 0,
      tiktok_followers: Number(form.tiktok_followers) || 0,
      youtube_subscribers: Number(form.youtube_subscribers) || 0,
      twitter_followers: Number(form.twitter_followers) || 0,
    });
    return calcLevel(reach);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.display_name) { toast({ title: "Display name is required", variant: "destructive" }); return; }
    setSaving(true);
    try {
      const totalReach = calcTotalReach({
        instagram_followers: Number(form.instagram_followers) || 0,
        tiktok_followers: Number(form.tiktok_followers) || 0,
        youtube_subscribers: Number(form.youtube_subscribers) || 0,
        twitter_followers: Number(form.twitter_followers) || 0,
      });
      const level = calcLevel(totalReach);
      const payload = {
        ...form,
        instagram_followers: Number(form.instagram_followers) || 0,
        tiktok_followers: Number(form.tiktok_followers) || 0,
        youtube_subscribers: Number(form.youtube_subscribers) || 0,
        twitter_followers: Number(form.twitter_followers) || 0,
        base_rate: Number(form.base_rate) || 0,
        total_reach: totalReach,
        creator_level: level,
      };
      if (profileId) {
        await base44.entities.CreatorProfile.update(profileId, payload);
      } else {
        const created = await base44.entities.CreatorProfile.create(payload);
        setProfileId(created.id);
        navigate(`/creator/${created.id}`);
      }
      toast({ title: "Profile saved!" });
    } catch { toast({ title: "Error saving profile", variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const addPortfolioItem = async () => {
    if (!newItem.brand_name || !newItem.title || !newItem.platform || !profileId) return;
    setAddingItem(true);
    try {
      const created = await base44.entities.CollabPortfolio.create({ ...newItem, creator_profile_id: profileId });
      setPortfolio((prev) => [created, ...prev]);
      setNewItem({ brand_name: "", title: "", description: "", platform: "", content_url: "", thumbnail_url: "", collab_type: "Barter", month_year: "" });
      toast({ title: "Portfolio item added!" });
    } catch { toast({ title: "Error adding item", variant: "destructive" }); }
    finally { setAddingItem(false); }
  };

  const deletePortfolioItem = async (id) => {
    await base44.entities.CollabPortfolio.delete(id);
    setPortfolio((prev) => prev.filter((p) => p.id !== id));
    toast({ title: "Item removed" });
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    try {
      if (profileId) await base44.entities.CreatorProfile.delete(profileId);
      await base44.auth.logout("/");
    } catch {
      toast({ title: "Error deleting account", variant: "destructive" });
      setDeletingAccount(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  const previewLevel = computedLevel();

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="font-display font-bold text-2xl sm:text-3xl mb-2">Creator Profile</h1>
      <p className="text-muted-foreground mb-8">Showcase your reach, niche, and past collaborations to attract brands.</p>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Identity */}
        <div className="bg-card rounded-2xl border p-6 space-y-5">
          <h2 className="font-display font-semibold text-lg">Identity</h2>
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 to-primary/20 flex-shrink-0 flex items-center justify-center font-display font-bold text-2xl text-primary">
              {form.avatar_url ? <img src={form.avatar_url} alt="" className="w-full h-full object-cover" /> : (form.display_name?.charAt(0) || "?")}
            </div>
            <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed hover:border-primary/50 cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {uploading ? "Uploading…" : "Upload photo"}
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
            </label>
          </div>
          <div className="space-y-2">
            <Label>Display Name *</Label>
            <Input value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} placeholder="Your creator name" />
          </div>
          <div className="space-y-2">
            <Label>Bio</Label>
            <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Tell brands about yourself…" rows={3} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Website</Label>
              <Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://…" />
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="City, Country" />
            </div>
          </div>
        </div>

        {/* Niche */}
        <div className="bg-card rounded-2xl border p-6 space-y-4">
          <h2 className="font-display font-semibold text-lg">Your Niche</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {niches.map((n) => (
              <label key={n} className="flex items-center gap-2 p-2.5 rounded-xl border hover:bg-muted/50 cursor-pointer transition-colors">
                <Checkbox checked={form.niche.includes(n)} onCheckedChange={() => toggleNiche(n)} />
                <span className="text-sm">{n}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Social */}
        <div className="bg-card rounded-2xl border p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-semibold text-lg">Social Media</h2>
            <LevelBadge level={previewLevel} size="md" />
          </div>
          <p className="text-xs text-muted-foreground -mt-3">Your level is calculated from your total follower count across all platforms.</p>

          {[
            { label: "Instagram", handleKey: "instagram_handle", followerKey: "instagram_followers", verifiedKey: "instagram_verified", placeholder: "@handle" },
            { label: "TikTok", handleKey: "tiktok_handle", followerKey: "tiktok_followers", verifiedKey: "tiktok_verified", placeholder: "@handle" },
            { label: "YouTube", handleKey: "youtube_handle", followerKey: "youtube_subscribers", verifiedKey: "youtube_verified", placeholder: "@channel", followerLabel: "Subscribers" },
            { label: "Twitter / X", handleKey: "twitter_handle", followerKey: "twitter_followers", verifiedKey: "twitter_verified", placeholder: "@handle" },
          ].map((s) => (
            <div key={s.label} className="space-y-2 pb-3 border-b last:border-0">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">{s.label}</Label>
                {form[s.verifiedKey]
                  ? <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">✓ Verified</span>
                  : <button
                      type="button"
                      onClick={() => alert("Social API verification coming soon. Connect your account to get a verified badge.")}
                      className="text-xs text-primary font-medium hover:underline"
                    >
                      Connect to verify →
                    </button>
                }
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input value={form[s.handleKey]} onChange={(e) => setForm({ ...form, [s.handleKey]: e.target.value })} placeholder={s.placeholder} />
                <div className="relative">
                  <Input type="number" value={form[s.followerKey]} onChange={(e) => setForm({ ...form, [s.followerKey]: e.target.value })} placeholder="0" className={!form[s.verifiedKey] && form[s.followerKey] ? "border-amber-300 focus-visible:ring-amber-400" : ""} />
                  {!form[s.verifiedKey] && form[s.followerKey] > 0 && (
                    <span className="absolute -bottom-4 left-0 text-xs text-amber-600">Unverified</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Rates */}
        <div className="bg-card rounded-2xl border p-6 space-y-5">
          <h2 className="font-display font-semibold text-lg">Rates & Preferences</h2>
          <div className="space-y-2">
            <Label>Base Rate (USD per collab)</Label>
            <Input type="number" value={form.base_rate} onChange={(e) => setForm({ ...form, base_rate: e.target.value })} placeholder="e.g. 500" />
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Accept Cash Offers</p>
                <p className="text-xs text-muted-foreground">Brands can send you paid collaboration offers</p>
              </div>
              <Switch checked={form.accepts_cash_offers} onCheckedChange={(v) => setForm({ ...form, accepts_cash_offers: v })} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Accept Barter</p>
                <p className="text-xs text-muted-foreground">Exchange content for products or services</p>
              </div>
              <Switch checked={form.accepts_barter} onCheckedChange={(v) => setForm({ ...form, accepts_barter: v })} />
            </div>
          </div>
        </div>

        <Button type="submit" className="w-full h-12 text-base rounded-xl" disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          Save Profile
        </Button>
      </form>

      {/* Account Deletion */}
      <div className="mt-4 pt-6 border-t">
        <h3 className="font-display font-semibold text-base mb-1 text-destructive">Danger Zone</h3>
        <p className="text-sm text-muted-foreground mb-4">Permanently delete your creator account and all associated data.</p>
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
                This will permanently delete your creator profile and cannot be undone.
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

      {/* Portfolio */}
      {profileId && (
        <div className="mt-8 space-y-6">
          <h2 className="font-display font-bold text-xl">Collaboration Portfolio</h2>

          {/* Existing items */}
          <div className="space-y-3">
            {portfolio.map((item) => (
              <div key={item.id} className="bg-card rounded-2xl border p-4 flex items-center gap-4">
                <div className="w-16 h-12 rounded-xl bg-muted overflow-hidden flex-shrink-0">
                  {item.thumbnail_url
                    ? <img src={item.thumbnail_url} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-xl opacity-30">🎬</div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.brand_name} · {item.platform}</p>
                </div>
                <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => deletePortfolioItem(item.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Add new item */}
          <div className="bg-card rounded-2xl border p-6 space-y-4">
            <h3 className="font-display font-semibold">Add Portfolio Item</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Brand Name *</Label>
                <Input value={newItem.brand_name} onChange={(e) => setNewItem({ ...newItem, brand_name: e.target.value })} placeholder="Brand name" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Title *</Label>
                <Input value={newItem.title} onChange={(e) => setNewItem({ ...newItem, title: e.target.value })} placeholder="e.g. Summer Campaign Reel" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Platform *</Label>
                <Select value={newItem.platform} onValueChange={(v) => setNewItem({ ...newItem, platform: v })}>
                  <SelectTrigger><SelectValue placeholder="Platform" /></SelectTrigger>
                  <SelectContent>{platforms.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Collab Type</Label>
                <Select value={newItem.collab_type} onValueChange={(v) => setNewItem({ ...newItem, collab_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Barter">Barter</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Gifted">Gifted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Month & Year</Label>
                <Input value={newItem.month_year} onChange={(e) => setNewItem({ ...newItem, month_year: e.target.value })} placeholder="e.g. March 2024" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Content URL</Label>
                <Input value={newItem.content_url} onChange={(e) => setNewItem({ ...newItem, content_url: e.target.value })} placeholder="https://…" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Description</Label>
              <Textarea value={newItem.description} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} placeholder="Brief description of the collaboration…" rows={2} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Thumbnail</Label>
              <div className="flex items-center gap-4">
                {newItem.thumbnail_url && <img src={newItem.thumbnail_url} alt="" className="w-16 h-12 rounded-lg object-cover" />}
                <label className="flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed hover:border-primary/50 cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {uploadingThumb ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {uploadingThumb ? "Uploading…" : "Upload thumbnail"}
                  <input type="file" accept="image/*" className="hidden" onChange={handleThumb} />
                </label>
              </div>
            </div>
            <Button onClick={addPortfolioItem} disabled={addingItem || !newItem.brand_name || !newItem.title || !newItem.platform} className="rounded-xl">
              {addingItem ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              Add Item
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}