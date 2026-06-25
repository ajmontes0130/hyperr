import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { PlusCircle, Pencil, Trash2, Loader2, FileText } from "lucide-react";

const platforms = ["Instagram", "TikTok", "YouTube", "Blog", "Podcast", "Twitter/X", "Newsletter", "Event", "Other"];

const emptyForm = { name: "", platform: "", proposed_promotion: "", audience_size: "", message: "" };

export default function ProposalTemplates() {
  const { toast } = useToast();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadTemplates(); }, []);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const me = await base44.auth.me();
      const data = await base44.entities.ProposalTemplate.filter({ created_by_id: me.id }, "-created_date");
      setTemplates(data);
    } finally {
      setLoading(false);
    }
  };

  const openNew = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (t) => { setEditing(t); setForm({ name: t.name, platform: t.platform, proposed_promotion: t.proposed_promotion, audience_size: t.audience_size || "", message: t.message }); setDialogOpen(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.platform || !form.proposed_promotion || !form.message) return;
    setSaving(true);
    try {
      if (editing) {
        await base44.entities.ProposalTemplate.update(editing.id, form);
      } else {
        await base44.entities.ProposalTemplate.create(form);
      }
      toast({ title: editing ? "Template updated" : "Template saved" });
      setDialogOpen(false);
      loadTemplates();
    } catch {
      toast({ title: "Error", description: "Could not save template.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    await base44.entities.ProposalTemplate.delete(id);
    toast({ title: "Template deleted" });
    loadTemplates();
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl">Proposal Templates</h1>
          <p className="text-muted-foreground mt-1">Save and reuse common trade proposal drafts</p>
        </div>
        <Button className="rounded-xl" onClick={openNew}>
          <PlusCircle className="w-4 h-4 mr-2" /> New Template
        </Button>
      </div>

      {templates.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-2xl border">
          <FileText className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="font-display font-semibold text-lg mb-1">No templates yet</h3>
          <p className="text-muted-foreground text-sm mb-6">Create your first template to speed up proposals.</p>
          <Button className="rounded-xl" onClick={openNew}><PlusCircle className="w-4 h-4 mr-2" /> Create Template</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {templates.map((t) => (
            <div key={t.id} className="bg-card rounded-2xl border p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-display font-semibold">{t.name}</span>
                  <Badge variant="secondary" className="text-xs">{t.platform}</Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{t.proposed_promotion}</p>
                {t.audience_size && <p className="text-xs text-muted-foreground mt-1">Audience: {t.audience_size}</p>}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button variant="outline" size="sm" className="rounded-lg" onClick={() => openEdit(t)}>
                  <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
                </Button>
                <Button variant="outline" size="sm" className="rounded-lg text-destructive hover:bg-destructive/10" onClick={() => handleDelete(t.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">{editing ? "Edit Template" : "New Template"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Template Name</Label>
              <Input placeholder="e.g. Food Brand Instagram Reel" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Platform</Label>
              <Select value={form.platform} onValueChange={(v) => setForm({ ...form, platform: v })}>
                <SelectTrigger><SelectValue placeholder="Select platform" /></SelectTrigger>
                <SelectContent>{platforms.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Promotion Offered</Label>
              <Textarea placeholder="Describe what promotion you're offering…" value={form.proposed_promotion} onChange={(e) => setForm({ ...form, proposed_promotion: e.target.value })} rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Audience Size (optional)</Label>
              <Input placeholder="e.g. 25K followers" value={form.audience_size} onChange={(e) => setForm({ ...form, audience_size: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea placeholder="Your default intro message…" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={3} />
            </div>
            <Button type="submit" className="w-full" disabled={saving || !form.name || !form.platform || !form.proposed_promotion || !form.message}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {editing ? "Save Changes" : "Save Template"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}