import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, Loader2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import HyperrLogo from "@/components/HyperrLogo";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { useSEO } from "@/hooks/useSEO";

export default function Contact() {
  useSEO({
    title: "Contact Us | hyperr",
    description: "Get in touch with the hyperr team for questions, partnerships, or support.",
  });
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await base44.integrations.Core.SendEmail({
        to: "support@hyperr.com",
        from_name: name,
        subject: subject || `Contact form: ${name}`,
        body: `Name: ${name}\nEmail: ${email}\n\n${message}`,
      });
      toast({ title: "Message sent", description: "We'll get back to you soon." });
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch {
      toast({ title: "Something went wrong", description: "Please try again or email us directly.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Link to="/landing" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <div className="bg-card rounded-2xl border p-8">
          <div className="flex items-center gap-3 mb-6">
            <HyperrLogo size="md" />
            <h1 className="font-display font-bold text-2xl">Contact Us</h1>
          </div>
          <p className="text-sm text-muted-foreground mb-6">Have a question, partnership idea, or need help? Send us a message and we'll get back to you.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-11" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} required rows={5} />
            </div>
            <Button type="submit" className="w-full h-11" disabled={loading || !name || !email || !message}>
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending...</> : <><MessageCircle className="w-4 h-4 mr-2" />Send Message</>}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="w-4 h-4" />
            Prefer email? Reach us at{" "}
            <a href="mailto:support@hyperr.com" className="text-primary font-medium hover:underline">support@hyperr.com</a>
          </div>
        </div>
      </div>
    </div>
  );
}