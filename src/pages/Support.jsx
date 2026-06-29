import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Send, MessageSquare, CheckCircle } from "lucide-react";

const types = ["Question", "Complaint", "Suggestion", "Other"];

export default function Support() {
  const { toast } = useToast();
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    type: "",
    message: "",
  });

  useEffect(() => {
    base44.auth.me().then((me) => {
      setForm((prev) => ({
        ...prev,
        name: me.full_name || "",
        email: me.email || "",
      }));
    }).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.message || !form.type) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    setSending(true);
    try {
      await base44.integrations.Core.SendEmail({
        from_name: "hyperr Support",
        to: "support@hyperr.com",
        subject: `[${form.type}] from ${form.name || form.email}`,
        body: `Name: ${form.name || "N/A"}\nUsername: ${form.username || "N/A"}\nEmail: ${form.email}\nType: ${form.type}\n\n${form.message}`,
      });
      setSubmitted(true);
    } catch {
      toast({ title: "Failed to send. Please try again.", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <CheckCircle className="w-14 h-14 text-primary mx-auto mb-4" />
        <h2 className="font-display font-bold text-2xl mb-2">Message Sent!</h2>
        <p className="text-muted-foreground mb-6">Thanks for reaching out. Our team will get back to you at <span className="text-foreground font-medium">{form.email}</span> within 24–48 hours.</p>
        <Button onClick={() => { setSubmitted(false); setForm((f) => ({ ...f, type: "", message: "", username: "" })); }}>
          Send Another
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <MessageSquare className="w-6 h-6 text-primary" />
          <h1 className="font-display font-bold text-2xl sm:text-3xl">Customer Support</h1>
        </div>
        <p className="text-muted-foreground">Have a question, complaint, or suggestion? We'd love to hear from you.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-card rounded-2xl border p-6 space-y-4">
          <h2 className="font-display font-semibold text-base">Your Info</h2>

          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your full name" />
          </div>

          <div className="space-y-2">
            <Label>Username</Label>
            <Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="Your username or handle" />
          </div>

          <div className="space-y-2">
            <Label>Email *</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="your@email.com" required />
          </div>
        </div>

        <div className="bg-card rounded-2xl border p-6 space-y-4">
          <h2 className="font-display font-semibold text-base">Your Message</h2>

          <div className="space-y-2">
            <Label>Type *</Label>
            <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
              <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
              <SelectContent>
                {types.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Message *</Label>
            <Textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Describe your question, complaint, or suggestion in detail…"
              rows={5}
              required
            />
          </div>
        </div>

        <Button type="submit" className="w-full h-12 text-base rounded-xl" disabled={sending}>
          {sending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
          Send Message
        </Button>
      </form>
    </div>
  );
}